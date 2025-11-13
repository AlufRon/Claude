"""
Protein LLaDA Model: Masked diffusion model for protein inverse folding.
Adapted from LLaDA architecture for protein-specific tasks.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple, Dict
import math


class ProteinLLaDAConfig:
    """Configuration class for Protein LLaDA model."""

    def __init__(
        self,
        vocab_size: int = 25,
        hidden_size: int = 768,
        num_hidden_layers: int = 12,
        num_attention_heads: int = 12,
        intermediate_size: int = 3072,
        hidden_dropout_prob: float = 0.1,
        attention_probs_dropout_prob: float = 0.1,
        max_position_embeddings: int = 1024,
        layer_norm_eps: float = 1e-12,
        hidden_act: str = "gelu",
        initializer_range: float = 0.02,
        **kwargs
    ):
        self.vocab_size = vocab_size
        self.hidden_size = hidden_size
        self.num_hidden_layers = num_hidden_layers
        self.num_attention_heads = num_attention_heads
        self.intermediate_size = intermediate_size
        self.hidden_dropout_prob = hidden_dropout_prob
        self.attention_probs_dropout_prob = attention_probs_dropout_prob
        self.max_position_embeddings = max_position_embeddings
        self.layer_norm_eps = layer_norm_eps
        self.hidden_act = hidden_act
        self.initializer_range = initializer_range


class MultiHeadSelfAttention(nn.Module):
    """Multi-head self-attention mechanism."""

    def __init__(self, config: ProteinLLaDAConfig):
        super().__init__()
        self.num_attention_heads = config.num_attention_heads
        self.attention_head_size = config.hidden_size // config.num_attention_heads
        self.all_head_size = self.num_attention_heads * self.attention_head_size

        self.query = nn.Linear(config.hidden_size, self.all_head_size)
        self.key = nn.Linear(config.hidden_size, self.all_head_size)
        self.value = nn.Linear(config.hidden_size, self.all_head_size)

        self.dropout = nn.Dropout(config.attention_probs_dropout_prob)
        self.output = nn.Linear(config.hidden_size, config.hidden_size)

    def transpose_for_scores(self, x: torch.Tensor) -> torch.Tensor:
        new_shape = x.size()[:-1] + (self.num_attention_heads, self.attention_head_size)
        x = x.view(new_shape)
        return x.permute(0, 2, 1, 3)

    def forward(
        self,
        hidden_states: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        # Project to Q, K, V
        query_layer = self.transpose_for_scores(self.query(hidden_states))
        key_layer = self.transpose_for_scores(self.key(hidden_states))
        value_layer = self.transpose_for_scores(self.value(hidden_states))

        # Compute attention scores
        attention_scores = torch.matmul(query_layer, key_layer.transpose(-1, -2))
        attention_scores = attention_scores / math.sqrt(self.attention_head_size)

        # Apply attention mask (for padding)
        if attention_mask is not None:
            attention_scores = attention_scores + attention_mask

        # Softmax and dropout
        attention_probs = F.softmax(attention_scores, dim=-1)
        attention_probs = self.dropout(attention_probs)

        # Apply attention to values
        context_layer = torch.matmul(attention_probs, value_layer)
        context_layer = context_layer.permute(0, 2, 1, 3).contiguous()

        new_shape = context_layer.size()[:-2] + (self.all_head_size,)
        context_layer = context_layer.view(new_shape)

        # Output projection
        output = self.output(context_layer)
        return output


class FeedForward(nn.Module):
    """Position-wise feed-forward network."""

    def __init__(self, config: ProteinLLaDAConfig):
        super().__init__()
        self.dense1 = nn.Linear(config.hidden_size, config.intermediate_size)
        self.dense2 = nn.Linear(config.intermediate_size, config.hidden_size)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)

        if config.hidden_act == "gelu":
            self.activation = F.gelu
        elif config.hidden_act == "relu":
            self.activation = F.relu
        else:
            raise ValueError(f"Unsupported activation: {config.hidden_act}")

    def forward(self, hidden_states: torch.Tensor) -> torch.Tensor:
        hidden_states = self.dense1(hidden_states)
        hidden_states = self.activation(hidden_states)
        hidden_states = self.dropout(hidden_states)
        hidden_states = self.dense2(hidden_states)
        return hidden_states


class TransformerLayer(nn.Module):
    """Single transformer layer with attention and feed-forward."""

    def __init__(self, config: ProteinLLaDAConfig):
        super().__init__()
        self.attention = MultiHeadSelfAttention(config)
        self.feed_forward = FeedForward(config)
        self.layer_norm1 = nn.LayerNorm(config.hidden_size, eps=config.layer_norm_eps)
        self.layer_norm2 = nn.LayerNorm(config.hidden_size, eps=config.layer_norm_eps)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)

    def forward(
        self,
        hidden_states: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        # Self-attention with residual connection
        attention_output = self.attention(hidden_states, attention_mask)
        attention_output = self.dropout(attention_output)
        hidden_states = self.layer_norm1(hidden_states + attention_output)

        # Feed-forward with residual connection
        ff_output = self.feed_forward(hidden_states)
        ff_output = self.dropout(ff_output)
        hidden_states = self.layer_norm2(hidden_states + ff_output)

        return hidden_states


class ProteinLLaDA(nn.Module):
    """
    Protein LLaDA: Masked diffusion model for protein inverse folding.

    This model uses bidirectional attention to predict masked amino acids
    given a partial protein sequence and optional structure features.
    """

    def __init__(self, config: ProteinLLaDAConfig):
        super().__init__()
        self.config = config

        # Embeddings
        self.token_embeddings = nn.Embedding(config.vocab_size, config.hidden_size)
        self.position_embeddings = nn.Embedding(config.max_position_embeddings, config.hidden_size)
        self.layer_norm = nn.LayerNorm(config.hidden_size, eps=config.layer_norm_eps)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)

        # Transformer layers
        self.layers = nn.ModuleList([
            TransformerLayer(config) for _ in range(config.num_hidden_layers)
        ])

        # Output head for token prediction
        self.output_head = nn.Linear(config.hidden_size, config.vocab_size)

        # Confidence head (for determining which tokens to keep/remask)
        self.confidence_head = nn.Linear(config.hidden_size, 1)

        # Initialize weights
        self.apply(self._init_weights)

    def _init_weights(self, module):
        """Initialize weights."""
        if isinstance(module, (nn.Linear, nn.Embedding)):
            module.weight.data.normal_(mean=0.0, std=self.config.initializer_range)
            if isinstance(module, nn.Linear) and module.bias is not None:
                module.bias.data.zero_()
        elif isinstance(module, nn.LayerNorm):
            module.bias.data.zero_()
            module.weight.data.fill_(1.0)

    def get_attention_mask(self, input_ids: torch.Tensor, pad_token_id: int) -> torch.Tensor:
        """
        Create attention mask for padding tokens.

        Args:
            input_ids: Input token IDs (batch_size, seq_len)
            pad_token_id: ID of padding token

        Returns:
            Attention mask (batch_size, 1, 1, seq_len)
        """
        # Create mask (1 for real tokens, 0 for padding)
        attention_mask = (input_ids != pad_token_id).float()

        # Expand dimensions for broadcasting
        attention_mask = attention_mask.unsqueeze(1).unsqueeze(2)

        # Convert to attention scores (0 for real, -inf for padding)
        attention_mask = (1.0 - attention_mask) * -10000.0

        return attention_mask

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        structure_features: Optional[torch.Tensor] = None,
        return_confidence: bool = False,
    ) -> Dict[str, torch.Tensor]:
        """
        Forward pass for masked token prediction.

        Args:
            input_ids: Token IDs (batch_size, seq_len)
            attention_mask: Attention mask (optional)
            structure_features: Optional structure embeddings (batch_size, seq_len, feature_dim)
            return_confidence: Whether to return confidence scores

        Returns:
            Dictionary with 'logits' and optionally 'confidence'
        """
        batch_size, seq_len = input_ids.size()

        # Token embeddings
        token_embeds = self.token_embeddings(input_ids)

        # Position embeddings
        position_ids = torch.arange(seq_len, dtype=torch.long, device=input_ids.device)
        position_ids = position_ids.unsqueeze(0).expand(batch_size, -1)
        position_embeds = self.position_embeddings(position_ids)

        # Combine embeddings
        hidden_states = token_embeds + position_embeds

        # Add structure features if provided
        if structure_features is not None:
            hidden_states = hidden_states + structure_features

        # Layer norm and dropout
        hidden_states = self.layer_norm(hidden_states)
        hidden_states = self.dropout(hidden_states)

        # Apply transformer layers
        for layer in self.layers:
            hidden_states = layer(hidden_states, attention_mask)

        # Output predictions
        logits = self.output_head(hidden_states)

        output = {"logits": logits}

        # Compute confidence scores if requested
        if return_confidence:
            confidence = torch.sigmoid(self.confidence_head(hidden_states))
            output["confidence"] = confidence.squeeze(-1)

        return output

    def predict_masked_tokens(
        self,
        input_ids: torch.Tensor,
        mask_token_id: int,
        temperature: float = 1.0,
        top_k: Optional[int] = None,
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Predict tokens at masked positions.

        Args:
            input_ids: Token IDs with some [MASK] tokens
            mask_token_id: ID of [MASK] token
            temperature: Sampling temperature
            top_k: If set, only sample from top-k tokens

        Returns:
            - Predicted token IDs
            - Prediction confidence scores
        """
        # Forward pass
        output = self.forward(input_ids, return_confidence=True)
        logits = output["logits"]
        confidence = output["confidence"]

        # Apply temperature
        if temperature != 1.0:
            logits = logits / temperature

        # Get predictions at masked positions
        mask_positions = (input_ids == mask_token_id)

        # Sample or take argmax
        if top_k is not None:
            # Top-k sampling
            top_logits, top_indices = torch.topk(logits, top_k, dim=-1)
            probs = F.softmax(top_logits, dim=-1)
            sampled = torch.multinomial(probs.view(-1, top_k), 1).view(logits.size(0), logits.size(1))
            predictions = torch.gather(top_indices, -1, sampled.unsqueeze(-1)).squeeze(-1)
        else:
            # Greedy decoding
            predictions = torch.argmax(logits, dim=-1)

        # Keep original tokens at non-masked positions
        output_ids = input_ids.clone()
        output_ids[mask_positions] = predictions[mask_positions]

        return output_ids, confidence


# Example usage
if __name__ == "__main__":
    # Create config and model
    config = ProteinLLaDAConfig(
        vocab_size=25,
        hidden_size=768,
        num_hidden_layers=12,
        num_attention_heads=12,
    )

    model = ProteinLLaDA(config)
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()) / 1e6:.2f}M")

    # Test forward pass
    batch_size = 2
    seq_len = 50
    input_ids = torch.randint(0, 25, (batch_size, seq_len))

    output = model(input_ids, return_confidence=True)
    print(f"Logits shape: {output['logits'].shape}")
    print(f"Confidence shape: {output['confidence'].shape}")

    # Test masked prediction
    input_ids[0, 10:20] = 21  # Mask some positions
    predictions, confidence = model.predict_masked_tokens(input_ids, mask_token_id=21)
    print(f"Predictions shape: {predictions.shape}")
