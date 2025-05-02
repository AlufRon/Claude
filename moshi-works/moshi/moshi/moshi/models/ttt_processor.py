# Create a completely new approach that bypasses meta devices entirely
# Copyright (c) Kyutai, all rights reserved.
# ttt_processor.py - CUDA DIRECT IMPLEMENTATION
import logging
import torch
import torch.nn as nn
from .tttm import TTTForCausalLM, TTTConfig
import traceback
import os
import safetensors.torch
from pathlib import Path
import json

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define a prefix for verbose prints
VDEBUG = "[TTT VERY_DEBUG]"

class TTTContextProcessor:
    """
    Processes audio tokens with TTT model to provide context enhancement.
    """
    def __init__(self, ttt_model_path: str, hidden_size: int, device: str = "cuda:0", 
                 train_dtype: str = "bfloat16", verbose: bool = True, 
                 keep_model_loaded: bool = True, expected_codebooks: int = 8):
        self.verbose = verbose
        self.keep_model_loaded = keep_model_loaded
        
        if self.verbose:
            print("!!! USING CUDA DIRECT IMPLEMENTATION !!!")
            print(f"{VDEBUG} ========= TTTContextProcessor.__init__ START =========")
            print(f"{VDEBUG} Input ttt_model_path: {ttt_model_path}")
            print(f"{VDEBUG} Input hidden_size: {hidden_size}")
            print(f"{VDEBUG} Input device string: {device}")
            print(f"{VDEBUG} Input train_dtype string: {train_dtype}")
            print(f"{VDEBUG} Keep model loaded: {keep_model_loaded}")

        # Determine the target dtype
        self.target_dtype = getattr(torch, train_dtype)
        if self.verbose:
            print(f"{VDEBUG} Target torch dtype: {self.target_dtype}")

        # Store original input device
        self.orig_device = device
        # Always use CUDA for TTT model
        self.cuda_device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        if self.verbose:
            print(f"{VDEBUG} Original device: {self.orig_device}")
            print(f"{VDEBUG} Will create inference model on: {self.cuda_device}")
        
        # Load the model config
        try:
            self.config = TTTConfig.from_pretrained(ttt_model_path)
            if self.verbose:
                print(f"{VDEBUG} Loaded TTT config")
        except Exception as e:
            if self.verbose:
                print(f"{VDEBUG} Error loading config: {e}")
            raise RuntimeError(f"Failed to load TTT model config: {e}")
        
        # Create a placeholder that will be filled on first use
        self.ttt_model = None
        self.state_dict_path = os.path.join(ttt_model_path, "model.safetensors")
        if self.verbose:
            print(f"{VDEBUG} Will load weights from: {self.state_dict_path}")
            print(f"{VDEBUG} Model loading deferred until first use")

        # Initialize Projection Layer placeholders
        self.projection = None
        self.projection_input_dim = self.config.hidden_size
        self.projection_output_dim = hidden_size
        if self.verbose:
            print(f"{VDEBUG} Will create projection from {self.projection_input_dim} to {self.projection_output_dim}")

        # Calculate codebook size
        self.num_codebooks = expected_codebooks
        if self.verbose:
            print(f"{VDEBUG} Using num_codebooks = {self.num_codebooks}")
        if self.config.vocab_size % self.num_codebooks != 0:
            logger.warning(f"TTT vocab size {self.config.vocab_size} not divisible by num_codebooks {self.num_codebooks}.")
        self.actual_codebook_size = self.config.vocab_size // self.num_codebooks
        if self.verbose:
            print(f"{VDEBUG} Calculated actual_codebook_size = {self.actual_codebook_size}")

        logger.info(f"TTT context processor initialized with hidden size {hidden_size}")
        if self.verbose:
            print(f"{VDEBUG} ========= TTTContextProcessor.__init__ END ==========")

    @property
    def device(self):
        """Returns the device where the TTT model is running"""
        return self.cuda_device

    def _ensure_model_created(self):
        """Ensure model is created and on CUDA"""
        if self.ttt_model is not None:
            # Model already created
            return
            
        if self.verbose:
            print(f"{VDEBUG} ========= CREATING TTT MODEL ON {self.cuda_device} =========")
        try:
            # Create model on CPU first
            self.ttt_model = TTTForCausalLM(self.config).to(dtype=self.target_dtype)
            
            # Load state dict to CPU first to avoid device issues
            if self.verbose:
                print(f"{VDEBUG} Loading state dict from {self.state_dict_path}")
            if os.path.exists(self.state_dict_path):
                # Load to CPU first
                state_dict = safetensors.torch.load_file(
                    self.state_dict_path,
                    device="cpu"  # Use CPU instead of cuda:0
                )
                
                # Check for missing lm_head.weight and add if needed
                if "lm_head.weight" not in state_dict and hasattr(self.ttt_model, "lm_head"):
                    if self.verbose:
                        print(f"{VDEBUG} Adding missing lm_head.weight")
                    vocab_size = self.ttt_model.config.vocab_size
                    hidden_size = self.ttt_model.config.hidden_size
                    state_dict["lm_head.weight"] = torch.zeros(
                        (vocab_size, hidden_size), 
                        dtype=self.target_dtype
                    )
                
                # Convert to target dtype
                for key in state_dict:
                    if state_dict[key].is_floating_point():
                        state_dict[key] = state_dict[key].to(self.target_dtype)
                
                # Load weights with strict=False to ignore missing keys
                self.ttt_model.load_state_dict(state_dict, strict=False)
                
                # Now move model to CUDA
                self.ttt_model = self.ttt_model.to(self.cuda_device)
                self.ttt_model.eval()
                if self.verbose:
                    print(f"{VDEBUG} Model loaded successfully and moved to {self.cuda_device}")
                
                # Create projection layer
                self.projection = nn.Linear(
                    self.projection_input_dim, 
                    self.projection_output_dim
                ).to(device=self.cuda_device, dtype=self.target_dtype)
                
                # Clear CUDA cache to avoid OOM
                torch.cuda.empty_cache()
            else:
                raise FileNotFoundError(f"State dict not found at {self.state_dict_path}")
                
        except Exception as e:
            if self.verbose:
                print(f"{VDEBUG} Error creating TTT model: {e}")
                traceback.print_exc()
            raise RuntimeError(f"Failed to create TTT model on CUDA: {e}")

    def unload_model(self):
        """Explicitly unload the model to free memory"""
        if self.ttt_model is not None:
            if self.verbose:
                print(f"{VDEBUG} Explicitly unloading TTT model and projection")
            del self.ttt_model
            self.ttt_model = None
            
        if self.projection is not None:
            del self.projection
            self.projection = None
            
        torch.cuda.empty_cache()
        if self.verbose:
            print(f"{VDEBUG} Model unloaded, memory freed")

    def get_context_embedding(self, audio_tokens: torch.Tensor) -> torch.Tensor:
        if self.verbose:
            print(f"{VDEBUG} ========= get_context_embedding START =========")
        
        try:
            # Ensure model is created
            self._ensure_model_created()
                
            # Get device for computation
            model_device = self.cuda_device
            if self.verbose:
                print(f"{VDEBUG} Computing on device: {model_device}")

            # Move input tokens to CUDA
            audio_tokens = audio_tokens.to(model_device)
            if self.verbose:
                print(f"{VDEBUG} Input audio_tokens moved to: {audio_tokens.device}")
                print(f"{VDEBUG} Input shape: B={audio_tokens.shape[0]}, K={audio_tokens.shape[1]}, T={audio_tokens.shape[2]}")

            # Handle empty input case
            if audio_tokens.numel() == 0:
                if self.verbose:
                    print(f"{VDEBUG} Input is empty, returning zeros.")
                return torch.zeros(audio_tokens.shape[0], audio_tokens.shape[2], self.projection_output_dim,
                                device=model_device, dtype=self.target_dtype)

            # Prepare tokens for TTT model
            if self.verbose:
                print(f"{VDEBUG} Interleaving tokens...")
            interleaved = self._to_interleaved_format(audio_tokens)
            if self.verbose:
                print(f"{VDEBUG} Interleaved tokens shape: {interleaved.shape}, Device: {interleaved.device}")

            # Run inference
            if self.verbose:
                print(f"{VDEBUG} Running TTT model inference...")
            with torch.no_grad():
                outputs = self.ttt_model(input_ids=interleaved, output_hidden_states=True)
                hidden_states = outputs.hidden_states[-1]
                if self.verbose:
                    print(f"{VDEBUG} TTT hidden_states shape: {hidden_states.shape}, dtype: {hidden_states.dtype}")

                # Reshape and average
                hidden_dim = hidden_states.shape[-1]
                batch_size = audio_tokens.shape[0]
                seq_len = audio_tokens.shape[2]
                
                if self.verbose:
                    print(f"{VDEBUG} Reshaping hidden states...")
                try:
                    reshaped = hidden_states.view(batch_size, seq_len, self.num_codebooks, hidden_dim)
                    context = reshaped.mean(dim=2)
                    if self.verbose:
                        print(f"{VDEBUG} Averaged context shape: {context.shape}")
                except RuntimeError as e:
                    if self.verbose:
                        print(f"{VDEBUG} ERROR during reshape: {e}")
                    # Better fallback - use a safer reshape approach
                    total_steps = hidden_states.shape[1] // self.num_codebooks
                    reshaped = hidden_states[:, :total_steps * self.num_codebooks].view(
                        batch_size, total_steps, self.num_codebooks, hidden_dim)
                    context = reshaped.mean(dim=2)
                    if self.verbose:
                        print(f"{VDEBUG} Fallback reshape succeeded: {context.shape}")
                    
                # Project to target dimension
                if self.verbose:
                    print(f"{VDEBUG} Applying projection...")
                context = self.projection(context)
                if self.verbose:
                    print(f"{VDEBUG} Final context shape: {context.shape}, dtype: {context.dtype}, device: {context.device}")
                
                # Clone to detach from computation graph
                result = context.clone().detach().to(device=self.cuda_device)

            # Unload model if not keeping it loaded
            if not self.keep_model_loaded:
                if self.verbose:
                    print(f"{VDEBUG} Not keeping model loaded - unloading")
                self.unload_model()
            
            if self.verbose:
                print(f"{VDEBUG} ========= get_context_embedding END ==========")
            return result

        except Exception as e:
            if self.verbose:
                print(f"{VDEBUG} Error in get_context_embedding: {e}")
                traceback.print_exc()
            
            # Clean up in error case
            self.unload_model()
            
            # Return zeros with appropriate shape
            batch_size_err = audio_tokens.shape[0] if 'audio_tokens' in locals() else 1
            seq_len_err = audio_tokens.shape[2] if 'audio_tokens' in locals() and audio_tokens.numel() > 0 else 0
            
            return torch.zeros(
                batch_size_err, seq_len_err, self.projection_output_dim,
                device=self.cuda_device, 
                dtype=self.target_dtype
            )

    def _to_interleaved_format(self, audio_tokens: torch.Tensor) -> torch.Tensor:
        """ Interleaves tokens from [B, K, T] to [B, T*K] for TTT model input. """
        target_device = audio_tokens.device
        if self.verbose:
            print(f"{VDEBUG} --- _to_interleaved_format --- Device: {target_device}")

        if audio_tokens.numel() == 0:
            if self.verbose:
                print(f"{VDEBUG} Input is empty, returning empty tensor.")
            return torch.empty(audio_tokens.shape[0], 0, dtype=torch.long, device=target_device)

        batch_size, num_input_codebooks, seq_len = audio_tokens.shape
        if self.verbose:
            print(f"{VDEBUG} Input shape: B={batch_size}, K={num_input_codebooks}, T={seq_len}")

        # Handle codebook count mismatch more intelligently
        if num_input_codebooks != self.num_codebooks:
            if self.verbose or True:  # Always log this warning
                logger.warning(f"Input codebooks {num_input_codebooks} != Expected {self.num_codebooks}. Adjusting.")
            
            # Handle various cases
            if num_input_codebooks > self.num_codebooks:
                if num_input_codebooks >= self.num_codebooks * 2:
                    # This is likely Moshi+User combined stream, select User stream (second half)
                    audio_tokens = audio_tokens[:, self.num_codebooks:self.num_codebooks*2, :]
                    if self.verbose:
                        print(f"{VDEBUG} Selected second set of {self.num_codebooks} codebooks (user stream)")
                else:
                    # Just take the first self.num_codebooks
                    audio_tokens = audio_tokens[:, :self.num_codebooks, :]
                    if self.verbose:
                        print(f"{VDEBUG} Truncated to first {self.num_codebooks} codebooks")
            else:
                # Too few codebooks, need to pad or error
                if self.verbose:
                    print(f"{VDEBUG} Too few codebooks in input, padding...")
                padding = torch.zeros(
                    batch_size, self.num_codebooks - num_input_codebooks, seq_len,
                    dtype=audio_tokens.dtype, device=audio_tokens.device
                )
                audio_tokens = torch.cat([audio_tokens, padding], dim=1)

        if self.verbose:
            print(f"{VDEBUG} Clamping tokens to [0, {self.actual_codebook_size - 1}]")
        audio_tokens_clamped = audio_tokens.clamp(0, self.actual_codebook_size - 1)

        # Create interleaved tensor more efficiently
        interleaved = torch.zeros(
            batch_size, seq_len * self.num_codebooks,
            dtype=torch.long, device=target_device
        )
        if self.verbose:
            print(f"{VDEBUG} Created interleaved tensor shape: {interleaved.shape}")

        # More efficient interleaving with vectorized operations where possible
        for t in range(seq_len):
            for c in range(self.num_codebooks):
                idx = t * self.num_codebooks + c
                offset = c * self.actual_codebook_size
                token_val = audio_tokens_clamped[:, c, t] + offset
                interleaved[:, idx] = token_val

        return interleaved