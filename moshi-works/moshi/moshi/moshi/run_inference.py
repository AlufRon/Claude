# Copyright (c) Kyutai, all rights reserved.
# This source code is licensed under the license found in the
# LICENSE file in the root directory of this source tree.

import argparse
from collections import deque
from dataclasses import dataclass
from pathlib import Path
import random
import sys
import time
import typing as tp # Added import for tp

import numpy as np
import sentencepiece
import torch
import sphn


from .client_utils import log, AnyPrinter, Printer, RawPrinter
from .conditioners import ConditionAttributes, ConditionTensors
from .models import loaders, MimiModel, LMModel, LMGen


def seed_all(seed):
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)  # for multi-GPU setups
    random.seed(seed)
    np.random.seed(seed)
    torch.backends.cudnn.deterministic = False
    torch.backends.cudnn.benchmark = False


def get_condition_tensors(model_type: str, lm: LMModel, batch_size: int, cfg_coef: float) -> ConditionTensors:
    condition_tensors = {}
    if lm.condition_provider is not None:
        conditions: list[ConditionAttributes] | None = None
        if model_type == 'hibiki':
            conditions = [ConditionAttributes(text={"description": "very_good"}, wav={})] * batch_size
            if cfg_coef != 1.:
                # Extending the conditions with the negatives for the CFG.
                conditions += [ConditionAttributes(text={"description": "very_bad"}, wav={})] * batch_size
        else:
            raise RuntimeError(f"Model expects conditioning but model type {model_type} is not supported.")
        assert conditions is not None
        prepared = lm.condition_provider.prepare(conditions)
        condition_tensors = lm.condition_provider(prepared)
    return condition_tensors


@dataclass
class InferenceState:
    mimi: MimiModel
    text_tokenizer: sentencepiece.SentencePieceProcessor
    lm_gen: LMGen

    def __init__(self, model_type: str, mimi: MimiModel, text_tokenizer: sentencepiece.SentencePieceProcessor,
                 lm: LMModel, batch_size: int, cfg_coef: float, device: str | torch.device, **kwargs):
        self.model_type = model_type
        self.mimi = mimi
        self.text_tokenizer = text_tokenizer
        condition_tensors = get_condition_tensors(model_type, lm, batch_size, cfg_coef)
        # Pass lm_gen_config kwargs correctly
        lm_gen_config = kwargs.pop('lm_gen_config', {})
        self.lm_gen = LMGen(lm, cfg_coef=cfg_coef, condition_tensors=condition_tensors, **lm_gen_config)
        self.device = device
        self.frame_size = int(self.mimi.sample_rate / self.mimi.frame_rate)
        self.batch_size = batch_size
        self.mimi.streaming_forever(batch_size)
        # self.lm_gen.streaming_forever(batch_size) # <<< MODIFICATION: Removed this line to fix AssertionError
        self.printer: AnyPrinter
        if sys.stdout.isatty():
            self.printer = Printer()
        else:
            self.printer = RawPrinter()

    def run(self, in_pcms: torch.Tensor) -> list[tuple[torch.Tensor, torch.Tensor]]:
        """Returns a list of tupel `(text_tokens, audio_tokens)`"""
        out_pcms_per_item: list[list[torch.Tensor]] = [[] for _ in range(self.batch_size)]
        out_text_tokens_per_item: list[list[torch.Tensor]] = [[] for _ in range(self.batch_size)]
        # For the Hibiki translation model, we feed a special token for the end of the input stream,
        # which corresponds to `2048` on all the codebooks of the audio stream, and wait
        # for the EOS on the output text stream to be emitted, as indication that the model is done.
        eos_reached: list[bool] = [False] * self.batch_size
        need_eos_input: bool = True
        self.printer.log("info", "starting the inference loop")
        device = self.lm_gen.lm_model.device
        start_time = time.time()
        ntokens = 0
        first_frame = True
        # We keep only fully frames.
        chunks = deque([
            chunk for chunk in in_pcms.split(self.frame_size, dim=2)
            if chunk.shape[-1] == self.frame_size])
        self.printer.print_header()
        # Use LMGen in streaming context
        # <<< MODIFICATION: Added self.batch_size to fix TypeError >>>
        with self.lm_gen.streaming(self.batch_size):
            while not all(eos_reached):
                if chunks:
                    chunk = chunks.popleft()
                    codes = self.mimi.encode(chunk)
                else:
                    if self.model_type == 'hibiki':
                        if need_eos_input:
                            # First frame after the end of the file, we feed a code full of 2048
                            # to indicate the end of stream.
                            need_eos_input = False
                            eos_value = self.mimi.cardinality
                            codes = torch.full(
                                (self.batch_size, self.mimi.num_codebooks, 1),
                                eos_value, device=device, dtype=torch.long)
                        else:
                            silence = torch.zeros((self.batch_size, self.mimi.channels, self.frame_size), device=device)
                            codes = self.mimi.encode(silence)
                    else:
                        # For other models, we stop as soon as we are reaching the end of the audio.
                        break

                # Pass only the required number of codebooks for the user stream
                needed_user_tokens = self.lm_gen.lm_model.num_codebooks - self.lm_gen.lm_model.dep_q - 1
                step_input_codes = codes[:, :needed_user_tokens, :]

                if first_frame:
                    # Ensure that the first slice of codes is properly seen by the transformer
                    # as otherwise the first slice is replaced by the initial tokens.
                    tokens = self.lm_gen.step(step_input_codes)
                    # The very first step might return None if offset <= max_delay
                    if tokens is not None:
                         first_frame = False
                    else:
                         # Need to manually advance offset if first step was None
                         # This part might need refinement depending on LMGen internal state handling
                         # For simplicity, we assume the first step will eventually yield tokens
                         pass

                else:
                    tokens = self.lm_gen.step(step_input_codes)

                if tokens is None:
                    # This happens if offset <= max_delay
                    continue

                assert tokens.shape[1] == self.lm_gen.lm_model.dep_q + 1
                out_pcm = self.mimi.decode(tokens[:, 1:]).cpu()
                for b, (one_text, one_pcm) in enumerate(zip(tokens[:, 0].cpu(), out_pcm)):
                    if eos_reached[b]:
                        continue
                    # Check for EOS token (assuming text_tokenizer has eos_id method)
                    if hasattr(self.text_tokenizer, 'eos_id') and one_text.item() == self.text_tokenizer.eos_id():
                        if self.model_type == 'hibiki' and need_eos_input:
                            # We sampled the EOS before the end of the file! Not possible for Hibiki.
                             self.printer.log("warning", "EOS sampled too early.")
                        elif self.model_type == 'hibiki':
                             eos_reached[b] = True
                        # For non-Hibiki, EOS might be valid anytime
                        # eos_reached[b] = True # Uncomment if EOS should stop generation for non-Hibiki too

                    out_text_tokens_per_item[b].append(one_text)
                    out_pcms_per_item[b].append(one_pcm)
                    if b == 0:
                        # Check text token is valid before decoding
                        # Assuming padding/special tokens are <= 3 based on server code
                        if one_text.item() > 3:
                           try:
                               text = self.text_tokenizer.id_to_piece(one_text.item())  # pyright: ignore
                               text = text.replace(" ", " ")
                               self.printer.print_token(text)
                           except IndexError:
                               self.printer.log("warning", f"Invalid text token ID: {one_text.item()}")

                ntokens += 1
        # End of streaming context
        dt = time.time() - start_time
        self.printer.log("info", f"processed {ntokens} steps in {dt:.0f}s, {1000 * dt / ntokens:.2f}ms/step")
        out = [
            (torch.cat(one_texts, dim=0) if one_texts else torch.empty(0, dtype=torch.long),
             torch.cat(one_pcms, dim=1) if one_pcms else torch.empty((1,0), dtype=torch.float32))
            for one_texts, one_pcms in zip(out_text_tokens_per_item, out_pcms_per_item)
        ]
        return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tokenizer", type=str, help="Path to a local tokenizer file.")
    parser.add_argument("--moshi-weight", type=str, help="Path to a local checkpoint file for Moshi.")
    parser.add_argument("--mimi-weight", type=str, help="Path to a local checkpoint file for Mimi.")
    parser.add_argument("--hf-repo", type=str, default=loaders.DEFAULT_REPO,
                        help="HF repo to look into, defaults Moshiko. "
                             "Use this to select a different pre-trained model.")
    parser.add_argument("--batch-size", type=int, default=1, help="Batch size to be used for inference.") # Default changed to 1 for single file
    parser.add_argument("--device", type=str, default="cuda", help="Device on which to run, defaults to 'cuda'.")
    parser.add_argument("--half", action="store_const", const=torch.float16, default=torch.bfloat16,
                        dest="dtype", help="Run inference with float16, not bfloat16, better for old GPUs.")
    parser.add_argument("--config", "--lm-config", dest="config_path", type=str, help="Path to a local config file.", default=None) # Renamed arg
    parser.add_argument("--cfg-coef", type=float, default=1., help="CFG coefficient.")

    # --- START: Added TTT Arguments ---
    parser.add_argument("--ttt-model-path", type=str, default=None, help="Path to TTT model for memory enhancement")
    parser.add_argument("--use-ttt-context", action="store_true", help="Use TTT model as memory enhancement")
    parser.add_argument("--ttt-context-blend", type=float, default=0.3, help="Blend ratio for TTT context (0-1)")
    # --- END: Added TTT Arguments ---

    parser.add_argument("infile", type=str, help="Input audio file.")
    parser.add_argument("outfile", type=str, help="Output audio file in wav format.", nargs="?", default="")

    args = parser.parse_args()
    seed_all(4242)

    log("info", "retrieving checkpoint")
    # Pass config_path correctly
    checkpoint_info = loaders.CheckpointInfo.from_hf_repo(
        args.hf_repo, args.moshi_weight, args.mimi_weight, args.tokenizer, config_path=args.config_path)
    log("info", "loading mimi")
    mimi = checkpoint_info.get_mimi(device=args.device)
    log("info", "mimi loaded")
    text_tokenizer = checkpoint_info.get_text_tokenizer()
    log("info", "loading moshi")
    # --- START: Pass TTT Overrides ---
    # <<< MODIFICATION: Added lm_kwargs_overrides >>>
    lm = checkpoint_info.get_moshi(
        device=args.device,
        dtype=args.dtype,
        lm_kwargs_overrides={
            "use_ttt_context": args.use_ttt_context,
            "ttt_model_path": args.ttt_model_path,
            "ttt_context_blend": args.ttt_context_blend
        }
    )
    # --- END: Pass TTT Overrides ---
    log("info", "moshi loaded")

    log("info", f"loading input file {args.infile}")
    try:
        in_pcms, sr = sphn.read(args.infile, sample_rate=mimi.sample_rate)
        if sr != mimi.sample_rate:
             log("warning", f"Input sample rate {sr}Hz does not match model rate {mimi.sample_rate}Hz. sphn attempted resampling.")
        if in_pcms.ndim == 1: # Ensure minimum 1 channel C, T format
             in_pcms = in_pcms[None, :]
        # Ensure shape is [1, T] or [C, T], take first channel if multi-channel > 1
        if in_pcms.shape[0] > 1:
            log("warning", f"Input audio has {in_pcms.shape[0]} channels, using only the first.")
            in_pcms = in_pcms[0:1, :]
    except Exception as e:
        log("error", f"Failed to read input file {args.infile}: {e}")
        sys.exit(1)

    in_pcms = torch.from_numpy(in_pcms.astype(np.float32)).to(device=args.device)
    # Expand to batch size (should be 1 for single file processing)
    in_pcms = in_pcms.expand(args.batch_size, -1, -1)


    # Pass lm_gen_config correctly
    state = InferenceState(
        checkpoint_info.model_type, mimi, text_tokenizer, lm,
        args.batch_size, args.cfg_coef, args.device,
        lm_gen_config=checkpoint_info.lm_gen_config # Pass lm_gen_config here
        )
    out_items = state.run(in_pcms)

    if args.outfile:
        outfile = Path(args.outfile)
        # Use only the first item from the batch output since batch size is 1
        if out_items:
            one_text_tokens, out_pcm = out_items[0] # Also capture text tokens
            if out_pcm.numel() > 0: # Check if output PCM is not empty
                 duration = out_pcm.shape[1] / mimi.sample_rate
                 log("info", f"writing {outfile} with duration {duration:.1f} sec.")
                 try:
                      # Ensure shape is [C, T] for sphn
                      if out_pcm.ndim == 3: # If [B, C, T]
                           out_pcm_to_write = out_pcm[0] # Take first batch item
                      elif out_pcm.ndim == 2: # If [C, T]
                           out_pcm_to_write = out_pcm
                      else:
                           log("error", f"Unexpected output PCM shape: {out_pcm.shape}")
                           return # Exit if shape is wrong

                      sphn.write_wav(str(outfile), out_pcm_to_write.cpu().numpy(), sample_rate=mimi.sample_rate)

                      # Optionally write text output too
                      text_outfile = outfile.with_suffix('.txt')
                      log("info", f"writing text output to {text_outfile}")
                      with open(text_outfile, 'w', encoding='utf-8') as f:
                           full_text = "".join([text_tokenizer.id_to_piece(t.item()) for t in one_text_tokens if t.item() > 3])
                           f.write(full_text.replace(' ', ' ').strip())

                 except Exception as e:
                      log("error", f"Failed to write output file {outfile}: {e}")
            else:
                 log("warning", "Generated audio was empty, not writing output file.")
        else:
             log("warning", "Inference returned no items, not writing output file.")


if __name__ == "__main__":
    with torch.no_grad():
        main()