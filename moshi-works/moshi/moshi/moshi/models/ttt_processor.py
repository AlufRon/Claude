# Create a completely new approach that bypasses meta devices entirely
# Copyright (c) Kyutai, all rights reserved.
# ttt_processor.py - DUAL MODEL IMPLEMENTATION
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
    Processes audio tokens with two TTT models to provide enhanced context.
    One model processes user tokens, the other processes Moshi-generated tokens.
    
    Note: This dual model approach uses approximately 2x the memory and computation
    time compared to the single model approach.
    """
    def __init__(self, ttt_model_path: str, hidden_size: int, device: str = "cuda:0", 
                 train_dtype: str = "bfloat16", verbose: bool = True, 
                 keep_model_loaded: bool = True, expected_codebooks: int = 8):
        self.verbose = verbose
        self.keep_model_loaded = keep_model_loaded
        
        if self.verbose:
            print("!!! USING DUAL MODEL IMPLEMENTATION !!!")
            print(f"{VDEBUG} ========= TTTContextProcessor.__init__ START =========")
            print(f"{VDEBUG} Input ttt_model_path: {ttt_model_path}")
            print(f"{VDEBUG} Input hidden_size: {hidden_size}")
            print(f"{VDEBUG} Input device string: {device}")
            print(f"{VDEBUG} Input train_dtype string: {train_dtype}")
            print(f"{VDEBUG} Keep model loaded: {keep_model_loaded}")
            print(f"{VDEBUG} WARNING: Dual model approach uses approximately 2x the memory and computation time")

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
        
        # Create placeholders for TWO separate models
        self.ttt_model_user = None   # Model for user audio tokens
        self.ttt_model_moshi = None  # Model for Moshi-generated tokens
        self.state_dict_path = os.path.join(ttt_model_path, "model.safetensors")
        if self.verbose:
            print(f"{VDEBUG} Will load weights from: {self.state_dict_path}")
            print(f"{VDEBUG} Model loading deferred until first use")

        # Initialize Projection Layer placeholders - handle odd dimensions
        self.projection_user = None
        self.projection_moshi = None
        self.projection_input_dim = self.config.hidden_size
        self.projection_output_dim = hidden_size
        half_dim = self.projection_output_dim // 2
        extra_dim = self.projection_output_dim % 2  # Handle odd dimensions
        self.user_output_dim = half_dim
        self.moshi_output_dim = half_dim + extra_dim
        if self.verbose:
            print(f"{VDEBUG} Will create projections from {self.projection_input_dim} to {self.user_output_dim} (user) and {self.moshi_output_dim} (moshi)")

        # Calculate codebook size
        self.num_codebooks = expected_codebooks
        if self.verbose:
            print(f"{VDEBUG} Using num_codebooks = {self.num_codebooks}")
        if self.config.vocab_size % self.num_codebooks != 0:
            logger.warning(f"TTT vocab size {self.config.vocab_size} not divisible by num_codebooks {self.num_codebooks}.")
        self.actual_codebook_size = self.config.vocab_size // self.num_codebooks

        # Initialize gate projection layer
        self.gate_proj = None
        
        if self.verbose:
            print(f"{VDEBUG} Calculated actual_codebook_size = {self.actual_codebook_size}")

        logger.info(f"TTT context processor initialized with hidden size {hidden_size}")
        if self.verbose:
            print(f"{VDEBUG} ========= TTTContextProcessor.__init__ END ==========")

    @property
    def device(self):
        """Returns the device where the TTT models are running"""
        return self.cuda_device

    def _ensure_models_created(self):
        """Ensure both models are created and on CUDA"""
        if self.ttt_model_user is not None and self.ttt_model_moshi is not None:
            # Both models already created
            return
            
        if self.verbose:
            print(f"{VDEBUG} ========= CREATING DUAL TTT MODELS ON {self.cuda_device} =========")
        try:
            # Create both models on CPU first
            self.ttt_model_user = TTTForCausalLM(self.config).to(dtype=self.target_dtype)
            self.ttt_model_moshi = TTTForCausalLM(self.config).to(dtype=self.target_dtype)
            
            # Load state dict to CPU first to avoid device issues
            if self.verbose:
                print(f"{VDEBUG} Loading shared state dict from {self.state_dict_path}")
            if os.path.exists(self.state_dict_path):
                # Load to CPU first
                state_dict = safetensors.torch.load_file(
                    self.state_dict_path,
                    device="cpu"  # Use CPU for initial loading
                )
                
                # Check for missing lm_head.weight and add if needed
                if "lm_head.weight" not in state_dict and hasattr(self.ttt_model_user, "lm_head"):
                    if self.verbose:
                        print(f"{VDEBUG} Adding missing lm_head.weight")
                    vocab_size = self.ttt_model_user.config.vocab_size
                    hidden_size = self.ttt_model_user.config.hidden_size
                    state_dict["lm_head.weight"] = torch.zeros(
                        (vocab_size, hidden_size), 
                        dtype=self.target_dtype
                    )
                
                # Convert to target dtype
                for key in state_dict:
                    if state_dict[key].is_floating_point():
                        state_dict[key] = state_dict[key].to(self.target_dtype)
                
                # Load identical weights into both models with strict=False
                self.ttt_model_user.load_state_dict(state_dict, strict=False)
                self.ttt_model_moshi.load_state_dict(state_dict, strict=False)
                
                # Now move models to CUDA
                self.ttt_model_user = self.ttt_model_user.to(self.cuda_device)
                self.ttt_model_moshi = self.ttt_model_moshi.to(self.cuda_device)
                self.ttt_model_user.eval()
                self.ttt_model_moshi.eval()
                
                if self.verbose:
                    print(f"{VDEBUG} Both models loaded successfully and moved to {self.cuda_device}")
                
                # Create projection layers - with correct dimensions
                self.projection_user = nn.Linear(
                    self.projection_input_dim, 
                    self.user_output_dim
                ).to(device=self.cuda_device, dtype=self.target_dtype)
                
                self.projection_moshi = nn.Linear(
                    self.projection_input_dim, 
                    self.moshi_output_dim
                ).to(device=self.cuda_device, dtype=self.target_dtype)
                
                # Create gate projection layer for dynamic gating
                self.gate_proj = nn.Linear(
                    self.projection_output_dim + self.projection_output_dim,  # Combined dimension (TTT context + transformer output)
                    self.projection_output_dim  # Output dimension matches transformer output
                ).to(device=self.cuda_device, dtype=self.target_dtype)
                
                if self.verbose:
                    print(f"{VDEBUG} Created gating projection: {self.projection_output_dim + self.projection_output_dim} -> {self.projection_output_dim}")
                
                # Clear CUDA cache to avoid OOM
                torch.cuda.empty_cache()
            else:
                raise FileNotFoundError(f"State dict not found at {self.state_dict_path}")
                
        except Exception as e:
            if self.verbose:
                print(f"{VDEBUG} Error creating TTT models: {e}")
                traceback.print_exc()
            raise RuntimeError(f"Failed to create TTT models on CUDA: {e}")

    def apply_gating(self, transformer_out, ttt_context):
        """Apply dynamic gating between transformer output and TTT context."""
        if self.verbose:
            print(f"{VDEBUG} Applying dynamic gating")
            
        # Concatenate along feature dimension
        combined = torch.cat([transformer_out, ttt_context], dim=-1)
        
        # Compute gate values (sigmoid to get values between 0 and 1)
        gate = torch.sigmoid(self.gate_proj(combined))
        
        # Apply gate - element-wise multiplication
        gated_output = gate * transformer_out + (1 - gate) * ttt_context
        
        if self.verbose:
            print(f"{VDEBUG} Gate values min: {gate.min().item():.3f}, max: {gate.max().item():.3f}, mean: {gate.mean().item():.3f}")
            
        return gated_output

    def unload_models(self):
        """Explicitly unload the models to free memory"""
        if self.ttt_model_user is not None or self.ttt_model_moshi is not None:
            if self.verbose:
                print(f"{VDEBUG} Explicitly unloading TTT models and projections")
            
            if self.ttt_model_user is not None:
                del self.ttt_model_user
                self.ttt_model_user = None
                
            if self.ttt_model_moshi is not None:
                del self.ttt_model_moshi
                self.ttt_model_moshi = None
            
            if self.projection_user is not None:
                del self.projection_user
                self.projection_user = None
                
            if self.projection_moshi is not None:
                del self.projection_moshi
                self.projection_moshi = None
                
            if self.gate_proj is not None:
                del self.gate_proj
                self.gate_proj = None
            
            torch.cuda.empty_cache()
            if self.verbose:
                print(f"{VDEBUG} Models unloaded, memory freed")

    def get_context_embedding(self, audio_tokens: torch.Tensor) -> torch.Tensor:
        if self.verbose:
            print(f"{VDEBUG} ========= get_context_embedding START =========")
        
        try:
            # Ensure models are created
            self._ensure_models_created()
                
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

            batch_size, num_input_codebooks, seq_len = audio_tokens.shape
            
            # Extract Moshi and User streams following the original logic
            if num_input_codebooks >= self.num_codebooks * 2:
                # This is likely Moshi+User combined stream - extract both using original detection logic
                moshi_tokens = audio_tokens[:, :self.num_codebooks, :]
                user_tokens = audio_tokens[:, self.num_codebooks:self.num_codebooks*2, :]
                if self.verbose:
                    print(f"{VDEBUG} Found combined streams. Using first {self.num_codebooks} codebooks for Moshi and next {self.num_codebooks} for User")
            else:
                # Not enough codebooks for both streams - use what we have
                if self.verbose:
                    print(f"{VDEBUG} Not enough codebooks for separate streams, adapting...")
                # If we have at least the expected number, use them as Moshi tokens and duplicate for User
                if num_input_codebooks >= self.num_codebooks:
                    moshi_tokens = audio_tokens[:, :self.num_codebooks, :]
                    # Duplicate for user stream if actual user tokens not available
                    user_tokens = moshi_tokens.clone()
                    if self.verbose:
                        print(f"{VDEBUG} Using first {self.num_codebooks} codebooks for both models")
                else:
                    # Not enough codebooks - pad to expected size
                    padding = torch.zeros(
                        batch_size, self.num_codebooks - num_input_codebooks, seq_len,
                        dtype=audio_tokens.dtype, device=audio_tokens.device
                    )
                    padded_tokens = torch.cat([audio_tokens, padding], dim=1)
                    moshi_tokens = padded_tokens
                    user_tokens = padded_tokens
                    if self.verbose:
                        print(f"{VDEBUG} Padded tokens to expected size: {padded_tokens.shape}")

            # Process tokens with respective models
            with torch.no_grad():
                # Process Moshi tokens
                if self.verbose:
                    print(f"{VDEBUG} Interleaving Moshi tokens...")
                moshi_interleaved = self._to_interleaved_format(moshi_tokens)
                
                if self.verbose:
                    print(f"{VDEBUG} Running Moshi model inference...")
                moshi_outputs = self.ttt_model_moshi(input_ids=moshi_interleaved, output_hidden_states=True)
                moshi_hidden_states = moshi_outputs.hidden_states[-1]
                
                # Process User tokens
                if self.verbose:
                    print(f"{VDEBUG} Interleaving User tokens...")
                user_interleaved = self._to_interleaved_format(user_tokens)
                
                if self.verbose:
                    print(f"{VDEBUG} Running User model inference...")
                user_outputs = self.ttt_model_user(input_ids=user_interleaved, output_hidden_states=True)
                user_hidden_states = user_outputs.hidden_states[-1]
                
                # Reshape and average hidden states
                hidden_dim = moshi_hidden_states.shape[-1]
                
                # Process Moshi hidden states
                if self.verbose:
                    print(f"{VDEBUG} Reshaping Moshi hidden states...")
                try:
                    moshi_reshaped = moshi_hidden_states.view(batch_size, seq_len, self.num_codebooks, hidden_dim)
                    moshi_context = moshi_reshaped.mean(dim=2)
                except RuntimeError as e:
                    if self.verbose:
                        print(f"{VDEBUG} Error during Moshi reshape: {e}")
                    # Better fallback approach
                    total_steps = moshi_hidden_states.shape[1] // self.num_codebooks
                    moshi_reshaped = moshi_hidden_states[:, :total_steps * self.num_codebooks].view(
                        batch_size, total_steps, self.num_codebooks, hidden_dim)
                    moshi_context = moshi_reshaped.mean(dim=2)
                
                # Process User hidden states
                if self.verbose:
                    print(f"{VDEBUG} Reshaping User hidden states...")
                try:
                    user_reshaped = user_hidden_states.view(batch_size, seq_len, self.num_codebooks, hidden_dim)
                    user_context = user_reshaped.mean(dim=2)
                except RuntimeError as e:
                    if self.verbose:
                        print(f"{VDEBUG} Error during User reshape: {e}")
                    total_steps = user_hidden_states.shape[1] // self.num_codebooks
                    user_reshaped = user_hidden_states[:, :total_steps * self.num_codebooks].view(
                        batch_size, total_steps, self.num_codebooks, hidden_dim)
                    user_context = user_reshaped.mean(dim=2)
                
                # Apply projections
                if self.verbose:
                    print(f"{VDEBUG} Applying projections to both context tensors...")
                moshi_projected = self.projection_moshi(moshi_context)
                user_projected = self.projection_user(user_context)
                
                # Check shapes before concatenation
                if moshi_projected.shape[:-1] != user_projected.shape[:-1]:
                    if self.verbose:
                        print(f"{VDEBUG} WARNING: Projection shapes don't match: {moshi_projected.shape} vs {user_projected.shape}")
                    # Make time dimensions match by truncating the longer one
                    min_time_dim = min(moshi_projected.shape[1], user_projected.shape[1])
                    moshi_projected = moshi_projected[:, :min_time_dim, :]
                    user_projected = user_projected[:, :min_time_dim, :]
                
                # Concatenate the projections along the feature dimension
                combined_context = torch.cat([moshi_projected, user_projected], dim=-1)
                if self.verbose:
                    print(f"{VDEBUG} Combined context shape: {combined_context.shape}")
                
            # Unload model if not keeping it loaded
            if not self.keep_model_loaded:
                if self.verbose:
                    print(f"{VDEBUG} Not keeping models loaded - unloading")
                self.unload_models()
            
            if self.verbose:
                print(f"{VDEBUG} ========= get_context_embedding END ==========")
            return combined_context

        except Exception as e:
            if self.verbose:
                print(f"{VDEBUG} Error in get_context_embedding: {e}")
                traceback.print_exc()
            
            # Clean up in error case
            self.unload_models()
            
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

        # Handle codebook count mismatch
        if num_input_codebooks != self.num_codebooks:
            if self.verbose:
                print(f"{VDEBUG} Adjusting codebook count from {num_input_codebooks} to {self.num_codebooks}")
            
            if num_input_codebooks > self.num_codebooks:
                # Take only the first num_codebooks
                audio_tokens = audio_tokens[:, :self.num_codebooks, :]
                if self.verbose:
                    print(f"{VDEBUG} Truncated to first {self.num_codebooks} codebooks")
            else:
                # Too few codebooks, need to pad
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

        # Interleaving with vectorized operations where possible
        for t in range(seq_len):
            for c in range(self.num_codebooks):
                idx = t * self.num_codebooks + c
                offset = c * self.actual_codebook_size
                token_val = audio_tokens_clamped[:, c, t] + offset
                interleaved[:, idx] = token_val

        return interleaved