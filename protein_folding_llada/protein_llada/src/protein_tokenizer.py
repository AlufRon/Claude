"""
Protein-specific tokenizer for amino acid sequences.
Converts between amino acid sequences and token IDs for LLaDA.
"""

import torch
from typing import List, Union


class ProteinTokenizer:
    """Tokenizer for protein sequences with 20 standard amino acids + special tokens."""

    # 20 standard amino acids
    AMINO_ACIDS = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
                   'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y']

    # Special tokens
    SPECIAL_TOKENS = {
        '[PAD]': 20,
        '[MASK]': 21,
        '[BOS]': 22,  # Begin of sequence
        '[EOS]': 23,  # End of sequence
        '[UNK]': 24,  # Unknown amino acid
    }

    def __init__(self):
        # Create vocabulary mapping
        self.vocab = {aa: idx for idx, aa in enumerate(self.AMINO_ACIDS)}
        self.vocab.update(self.SPECIAL_TOKENS)

        # Reverse mapping
        self.id_to_token = {idx: token for token, idx in self.vocab.items()}

        # Vocabulary size
        self.vocab_size = len(self.vocab)

        # Special token IDs
        self.pad_token_id = self.vocab['[PAD]']
        self.mask_token_id = self.vocab['[MASK]']
        self.bos_token_id = self.vocab['[BOS]']
        self.eos_token_id = self.vocab['[EOS]']
        self.unk_token_id = self.vocab['[UNK]']

    def encode(self, sequence: str, add_special_tokens: bool = True) -> torch.Tensor:
        """
        Convert amino acid sequence to token IDs.

        Args:
            sequence: Amino acid sequence string (e.g., "ACDEFG")
            add_special_tokens: Whether to add BOS/EOS tokens

        Returns:
            Tensor of token IDs
        """
        # Convert sequence to uppercase and strip whitespace
        sequence = sequence.upper().strip()

        # Encode each amino acid
        token_ids = []

        if add_special_tokens:
            token_ids.append(self.bos_token_id)

        for aa in sequence:
            if aa in self.vocab:
                token_ids.append(self.vocab[aa])
            elif aa == '[' or aa == ']':
                # Handle special tokens in sequence (e.g., "[MASK]")
                continue
            else:
                # Unknown amino acid
                token_ids.append(self.unk_token_id)

        if add_special_tokens:
            token_ids.append(self.eos_token_id)

        return torch.tensor(token_ids, dtype=torch.long)

    def encode_with_masks(self, sequence: str, mask_ratio: float = 0.5,
                          fixed_positions: List[int] = None) -> torch.Tensor:
        """
        Encode sequence with random masking for training/inference.

        Args:
            sequence: Amino acid sequence
            mask_ratio: Fraction of tokens to mask (0-1)
            fixed_positions: List of positions that should NOT be masked

        Returns:
            Tensor with some tokens replaced by [MASK]
        """
        tokens = self.encode(sequence, add_special_tokens=True)

        # Don't mask special tokens at start/end
        maskable_start = 1  # Skip BOS
        maskable_end = len(tokens) - 1  # Skip EOS

        # Determine which positions to mask
        maskable_positions = list(range(maskable_start, maskable_end))

        # Remove fixed positions
        if fixed_positions is not None:
            # Adjust for BOS token offset
            fixed_positions = [pos + 1 for pos in fixed_positions]
            maskable_positions = [pos for pos in maskable_positions
                                 if pos not in fixed_positions]

        # Randomly select positions to mask
        num_to_mask = int(len(maskable_positions) * mask_ratio)
        if num_to_mask > 0:
            mask_indices = torch.randperm(len(maskable_positions))[:num_to_mask]
            positions_to_mask = [maskable_positions[idx] for idx in mask_indices]

            # Apply masks
            for pos in positions_to_mask:
                tokens[pos] = self.mask_token_id

        return tokens

    def decode(self, tokens: Union[torch.Tensor, List[int]],
               skip_special_tokens: bool = True) -> str:
        """
        Convert token IDs back to amino acid sequence.

        Args:
            tokens: Tensor or list of token IDs
            skip_special_tokens: Whether to skip special tokens in output

        Returns:
            Amino acid sequence string
        """
        if isinstance(tokens, torch.Tensor):
            tokens = tokens.tolist()

        sequence = []
        for token_id in tokens:
            token = self.id_to_token.get(token_id, '[UNK]')

            if skip_special_tokens and token.startswith('['):
                continue

            sequence.append(token)

        return ''.join(sequence)

    def batch_encode(self, sequences: List[str],
                     add_special_tokens: bool = True,
                     padding: bool = True,
                     max_length: int = None) -> torch.Tensor:
        """
        Encode multiple sequences with padding.

        Args:
            sequences: List of amino acid sequences
            add_special_tokens: Whether to add BOS/EOS
            padding: Whether to pad to same length
            max_length: Maximum sequence length (truncate if longer)

        Returns:
            Tensor of shape (batch_size, max_seq_len)
        """
        encoded = [self.encode(seq, add_special_tokens) for seq in sequences]

        if max_length is not None:
            encoded = [tokens[:max_length] for tokens in encoded]

        if not padding:
            return encoded

        # Pad to maximum length in batch
        max_len = max(len(tokens) for tokens in encoded)

        padded = torch.full((len(sequences), max_len),
                           self.pad_token_id,
                           dtype=torch.long)

        for i, tokens in enumerate(encoded):
            padded[i, :len(tokens)] = tokens

        return padded

    def batch_decode(self, batch_tokens: torch.Tensor,
                     skip_special_tokens: bool = True) -> List[str]:
        """
        Decode multiple sequences.

        Args:
            batch_tokens: Tensor of shape (batch_size, seq_len)
            skip_special_tokens: Whether to skip special tokens

        Returns:
            List of amino acid sequences
        """
        return [self.decode(tokens, skip_special_tokens)
                for tokens in batch_tokens]

    def get_mask_positions(self, tokens: torch.Tensor) -> torch.Tensor:
        """
        Get positions of [MASK] tokens.

        Args:
            tokens: Tensor of token IDs

        Returns:
            Boolean tensor indicating mask positions
        """
        return tokens == self.mask_token_id

    def __len__(self):
        """Return vocabulary size."""
        return self.vocab_size


# Example usage and tests
if __name__ == "__main__":
    tokenizer = ProteinTokenizer()

    # Test basic encoding/decoding
    sequence = "ACDEFGHIKLMNPQRSTVWY"
    print(f"Original sequence: {sequence}")

    tokens = tokenizer.encode(sequence)
    print(f"Encoded tokens: {tokens}")

    decoded = tokenizer.decode(tokens)
    print(f"Decoded sequence: {decoded}")

    # Test with masking
    masked_tokens = tokenizer.encode_with_masks(sequence, mask_ratio=0.3)
    print(f"\nMasked tokens: {masked_tokens}")
    print(f"Masked sequence: {tokenizer.decode(masked_tokens, skip_special_tokens=False)}")

    # Test batch encoding
    sequences = ["ACDEFG", "IKLMN", "PQRSTVWY"]
    batch = tokenizer.batch_encode(sequences)
    print(f"\nBatch encoded shape: {batch.shape}")
    print(f"Batch encoded:\n{batch}")

    decoded_batch = tokenizer.batch_decode(batch)
    print(f"Decoded batch: {decoded_batch}")

    print(f"\nVocabulary size: {len(tokenizer)}")
