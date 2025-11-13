"""
Hybrid Generator: Combines LLaDA masked diffusion with model-based constraints.

This module implements the hybrid approach described in the plan:
- Use LLaDA for creative sequence exploration with bidirectional context
- Use PiFold (or similar folding predictor) for structure consistency checks
- Iteratively unmask and refine predictions based on both confidence and structure validation
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Dict, List, Tuple
import numpy as np
from dataclasses import dataclass

from protein_tokenizer import ProteinTokenizer
from protein_llada_model import ProteinLLaDA


@dataclass
class HybridGenerationConfig:
    """Configuration for hybrid generation."""

    # Iterative unmasking
    num_iterations: int = 10
    initial_mask_ratio: float = 0.8

    # Confidence thresholds
    confidence_threshold: float = 0.9
    min_confidence_unmask: float = 0.7

    # Remasking strategy
    remask_strategy: str = "hybrid"  # "confidence", "random", "hybrid", "structure"
    remask_ratio: float = 0.3

    # Structure constraints
    use_structure_check: bool = True
    rmsd_threshold: float = 2.0  # Angstroms
    structure_weight: float = 0.3

    # Sampling
    temperature: float = 1.0
    top_k: Optional[int] = None

    # Beam search (optional)
    use_beam_search: bool = False
    beam_size: int = 5


class StructureChecker:
    """
    Mock structure checker for validation.
    In practice, this would use PiFold or AlphaFold for structure prediction.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        # In real implementation, load PiFold model here
        self.model = None

    def predict_structure(self, sequence: str) -> Dict[str, any]:
        """
        Predict 3D structure from sequence.

        Args:
            sequence: Amino acid sequence

        Returns:
            Dictionary with structure coordinates and features
        """
        # Mock implementation
        # In practice: Use PiFold to predict structure
        return {
            "coordinates": np.random.randn(len(sequence), 3),
            "confidence": np.random.rand(len(sequence)),
        }

    def compute_rmsd(self, coords1: np.ndarray, coords2: np.ndarray) -> float:
        """
        Compute RMSD between two structures.

        Args:
            coords1: First structure coordinates (N, 3)
            coords2: Second structure coordinates (N, 3)

        Returns:
            RMSD value in Angstroms
        """
        # Align structures (simplified - should use Kabsch algorithm)
        diff = coords1 - coords2
        rmsd = np.sqrt(np.mean(np.sum(diff ** 2, axis=1)))
        return rmsd

    def check_consistency(
        self,
        sequence: str,
        target_structure: Dict[str, any],
        threshold: float = 2.0
    ) -> Tuple[bool, float, np.ndarray]:
        """
        Check if sequence folds to target structure.

        Args:
            sequence: Candidate sequence
            target_structure: Target structure dictionary
            threshold: RMSD threshold for acceptance

        Returns:
            - Whether sequence passes check
            - RMSD value
            - Per-residue consistency scores
        """
        predicted = self.predict_structure(sequence)
        rmsd = self.compute_rmsd(predicted["coordinates"], target_structure["coordinates"])

        # Per-residue consistency (simplified)
        per_residue_dist = np.linalg.norm(
            predicted["coordinates"] - target_structure["coordinates"],
            axis=1
        )
        consistency_scores = 1.0 / (1.0 + per_residue_dist)

        passes = rmsd < threshold
        return passes, rmsd, consistency_scores


class HybridGenerator:
    """
    Hybrid generator combining LLaDA with structure-based constraints.
    """

    def __init__(
        self,
        model: ProteinLLaDA,
        tokenizer: ProteinTokenizer,
        config: HybridGenerationConfig,
        structure_checker: Optional[StructureChecker] = None,
        device: str = "cuda" if torch.cuda.is_available() else "cpu",
    ):
        self.model = model.to(device)
        self.tokenizer = tokenizer
        self.config = config
        self.structure_checker = structure_checker or StructureChecker()
        self.device = device

        self.model.eval()

    @torch.no_grad()
    def generate(
        self,
        target_structure: Optional[Dict[str, any]] = None,
        partial_sequence: Optional[str] = None,
        fixed_positions: Optional[List[int]] = None,
        length: Optional[int] = None,
    ) -> Dict[str, any]:
        """
        Generate protein sequence using hybrid approach.

        Args:
            target_structure: Target 3D structure (optional)
            partial_sequence: Partial sequence with known positions (optional)
            fixed_positions: List of positions that should not be modified
            length: Desired sequence length

        Returns:
            Dictionary with generated sequence and metadata
        """
        # Initialize sequence
        if partial_sequence is not None:
            # Start with partial sequence
            seq_length = len(partial_sequence)
            input_ids = self.tokenizer.encode_with_masks(
                partial_sequence,
                mask_ratio=self.config.initial_mask_ratio,
                fixed_positions=fixed_positions,
            )
        else:
            # Start with fully masked sequence
            seq_length = length or 100
            input_ids = torch.full(
                (seq_length + 2,),  # +2 for BOS/EOS
                self.tokenizer.mask_token_id,
                dtype=torch.long,
            )
            input_ids[0] = self.tokenizer.bos_token_id
            input_ids[-1] = self.tokenizer.eos_token_id

        input_ids = input_ids.unsqueeze(0).to(self.device)  # Add batch dimension

        # Track generation history
        history = {
            "iterations": [],
            "rmsd_scores": [],
            "confidence_scores": [],
        }

        # Iterative unmasking
        for iteration in range(self.config.num_iterations):
            # Predict masked tokens
            output = self.model(input_ids, return_confidence=True)
            logits = output["logits"]
            confidence = output["confidence"]

            # Sample predictions
            if self.config.temperature != 1.0:
                logits = logits / self.config.temperature

            if self.config.top_k is not None:
                # Top-k sampling
                top_logits, top_indices = torch.topk(logits, self.config.top_k, dim=-1)
                probs = F.softmax(top_logits, dim=-1)
                sampled = torch.multinomial(
                    probs.view(-1, self.config.top_k), 1
                ).view(logits.size(0), logits.size(1))
                predictions = torch.gather(top_indices, -1, sampled.unsqueeze(-1)).squeeze(-1)
            else:
                # Greedy decoding
                predictions = torch.argmax(logits, dim=-1)

            # Update masked positions
            mask_positions = (input_ids[0] == self.tokenizer.mask_token_id)
            input_ids[0, mask_positions] = predictions[0, mask_positions]

            # Decode current sequence
            current_sequence = self.tokenizer.decode(input_ids[0], skip_special_tokens=True)

            # Structure consistency check
            if self.config.use_structure_check and target_structure is not None:
                passes, rmsd, per_residue_consistency = self.structure_checker.check_consistency(
                    current_sequence,
                    target_structure,
                    self.config.rmsd_threshold,
                )

                history["rmsd_scores"].append(rmsd)

                # Combine confidence with structure consistency
                per_residue_consistency_tensor = torch.tensor(
                    per_residue_consistency[1:-1],  # Skip BOS/EOS
                    device=self.device,
                ).unsqueeze(0)

                # Weighted combination
                combined_confidence = (
                    confidence[:, 1:-1] * (1 - self.config.structure_weight) +
                    per_residue_consistency_tensor * self.config.structure_weight
                )
            else:
                combined_confidence = confidence[:, 1:-1]
                rmsd = None

            # Record iteration
            avg_confidence = combined_confidence.mean().item()
            history["confidence_scores"].append(avg_confidence)
            history["iterations"].append({
                "iteration": iteration,
                "sequence": current_sequence,
                "confidence": avg_confidence,
                "rmsd": rmsd,
            })

            # Check convergence
            if avg_confidence > self.config.confidence_threshold:
                break

            # Remask low-confidence positions
            if iteration < self.config.num_iterations - 1:
                input_ids = self._remask(
                    input_ids,
                    combined_confidence,
                    fixed_positions,
                )

        # Final sequence
        final_sequence = self.tokenizer.decode(input_ids[0], skip_special_tokens=True)

        return {
            "sequence": final_sequence,
            "confidence": history["confidence_scores"][-1],
            "rmsd": history["rmsd_scores"][-1] if history["rmsd_scores"] else None,
            "iterations": len(history["iterations"]),
            "history": history,
        }

    def _remask(
        self,
        input_ids: torch.Tensor,
        confidence: torch.Tensor,
        fixed_positions: Optional[List[int]] = None,
    ) -> torch.Tensor:
        """
        Remask low-confidence positions for next iteration.

        Args:
            input_ids: Current token IDs
            confidence: Confidence scores for each position
            fixed_positions: Positions that should not be masked

        Returns:
            Input IDs with some positions remasked
        """
        batch_size = input_ids.size(0)

        if self.config.remask_strategy == "confidence":
            # Remask positions with lowest confidence
            num_to_remask = int(confidence.size(1) * self.config.remask_ratio)

            if num_to_remask > 0:
                _, low_conf_indices = torch.topk(
                    confidence, num_to_remask, dim=1, largest=False
                )

                # Apply remasking (offset by 1 for BOS token)
                for b in range(batch_size):
                    for idx in low_conf_indices[b]:
                        pos = idx.item() + 1  # Offset for BOS
                        if fixed_positions is None or pos not in fixed_positions:
                            input_ids[b, pos] = self.tokenizer.mask_token_id

        elif self.config.remask_strategy == "random":
            # Random remasking
            seq_len = confidence.size(1)
            num_to_remask = int(seq_len * self.config.remask_ratio)

            maskable_positions = list(range(1, seq_len + 1))  # Skip BOS
            if fixed_positions is not None:
                maskable_positions = [p for p in maskable_positions if p not in fixed_positions]

            if num_to_remask > 0 and len(maskable_positions) > 0:
                positions_to_remask = np.random.choice(
                    maskable_positions,
                    size=min(num_to_remask, len(maskable_positions)),
                    replace=False,
                )
                input_ids[0, positions_to_remask] = self.tokenizer.mask_token_id

        elif self.config.remask_strategy == "hybrid":
            # Combine confidence and random
            seq_len = confidence.size(1)
            num_to_remask = int(seq_len * self.config.remask_ratio)

            # Half based on confidence, half random
            num_conf = num_to_remask // 2
            num_rand = num_to_remask - num_conf

            if num_conf > 0:
                _, low_conf_indices = torch.topk(
                    confidence, num_conf, dim=1, largest=False
                )
                for b in range(batch_size):
                    for idx in low_conf_indices[b]:
                        pos = idx.item() + 1
                        if fixed_positions is None or pos not in fixed_positions:
                            input_ids[b, pos] = self.tokenizer.mask_token_id

            if num_rand > 0:
                maskable_positions = list(range(1, seq_len + 1))
                if fixed_positions is not None:
                    maskable_positions = [p for p in maskable_positions if p not in fixed_positions]

                positions_to_remask = np.random.choice(
                    maskable_positions,
                    size=min(num_rand, len(maskable_positions)),
                    replace=False,
                )
                input_ids[0, positions_to_remask] = self.tokenizer.mask_token_id

        return input_ids


# Example usage
if __name__ == "__main__":
    from protein_llada_model import ProteinLLaDAConfig

    # Setup
    tokenizer = ProteinTokenizer()
    config = ProteinLLaDAConfig(vocab_size=len(tokenizer))
    model = ProteinLLaDA(config)

    gen_config = HybridGenerationConfig(
        num_iterations=5,
        confidence_threshold=0.85,
        use_structure_check=False,  # Disable for testing
    )

    generator = HybridGenerator(model, tokenizer, gen_config, device="cpu")

    # Generate sequence
    result = generator.generate(
        partial_sequence="AC[MASK][MASK][MASK]FG",
        length=10,
    )

    print(f"Generated sequence: {result['sequence']}")
    print(f"Final confidence: {result['confidence']:.3f}")
    print(f"Iterations: {result['iterations']}")
