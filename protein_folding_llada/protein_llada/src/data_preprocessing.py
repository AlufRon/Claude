"""
Data preprocessing pipeline for protein datasets (CATH, TS50, TS500, UniProt).
Handles PDB file parsing, sequence extraction, and dataset preparation.
"""

import os
import json
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import warnings

# Suppress BioPython warnings
warnings.filterwarnings('ignore')

try:
    from Bio.PDB import PDBParser, PDBIO, Select
    from Bio.PDB.Polypeptide import three_to_one
    BIOPYTHON_AVAILABLE = True
except ImportError:
    BIOPYTHON_AVAILABLE = False
    print("Warning: BioPython not available. Install with: pip install biopython")


@dataclass
class ProteinStructure:
    """Container for protein structure information."""
    pdb_id: str
    chain_id: str
    sequence: str
    coordinates: np.ndarray  # (L, 3) CA coordinates
    full_coords: Optional[Dict[str, np.ndarray]] = None  # All atom types
    resolution: Optional[float] = None
    metadata: Optional[Dict] = None


class PDBProcessor:
    """Process PDB files to extract sequences and structures."""

    def __init__(self):
        if BIOPYTHON_AVAILABLE:
            self.parser = PDBParser(QUIET=True)
        else:
            self.parser = None

    def parse_pdb_file(
        self,
        pdb_file: str,
        chain_id: Optional[str] = None,
    ) -> List[ProteinStructure]:
        """
        Parse PDB file and extract protein information.

        Args:
            pdb_file: Path to PDB file
            chain_id: Specific chain to extract (if None, extract all)

        Returns:
            List of ProteinStructure objects
        """
        if not BIOPYTHON_AVAILABLE:
            raise RuntimeError("BioPython is required for PDB parsing")

        structure = self.parser.get_structure("protein", pdb_file)
        pdb_id = os.path.basename(pdb_file).replace(".pdb", "")

        proteins = []

        for model in structure:
            for chain in model:
                if chain_id is not None and chain.id != chain_id:
                    continue

                # Extract sequence and coordinates
                sequence = []
                ca_coords = []

                for residue in chain:
                    if residue.id[0] != ' ':  # Skip hetero residues
                        continue

                    try:
                        # Get amino acid one-letter code
                        aa = three_to_one(residue.resname)
                        sequence.append(aa)

                        # Get CA atom coordinates
                        if 'CA' in residue:
                            ca_coords.append(residue['CA'].coord)
                        else:
                            # If no CA, skip this residue
                            sequence.pop()
                            continue

                    except KeyError:
                        # Unknown residue, skip
                        continue

                if len(sequence) > 0:
                    proteins.append(ProteinStructure(
                        pdb_id=pdb_id,
                        chain_id=chain.id,
                        sequence=''.join(sequence),
                        coordinates=np.array(ca_coords),
                    ))

        return proteins

    def compute_distance_matrix(self, coords: np.ndarray) -> np.ndarray:
        """
        Compute pairwise distance matrix from coordinates.

        Args:
            coords: Coordinate array (L, 3)

        Returns:
            Distance matrix (L, L)
        """
        diff = coords[:, None, :] - coords[None, :, :]
        distances = np.sqrt(np.sum(diff ** 2, axis=-1))
        return distances

    def compute_contact_map(
        self,
        coords: np.ndarray,
        threshold: float = 8.0
    ) -> np.ndarray:
        """
        Compute contact map from coordinates.

        Args:
            coords: Coordinate array (L, 3)
            threshold: Distance threshold for contact (Angstroms)

        Returns:
            Binary contact map (L, L)
        """
        distances = self.compute_distance_matrix(coords)
        contacts = (distances < threshold).astype(np.float32)
        return contacts


class ProteinDataset(Dataset):
    """PyTorch dataset for protein sequences and structures."""

    def __init__(
        self,
        data_dir: str,
        split: str = "train",
        max_length: int = 512,
        min_length: int = 30,
        cache_dir: Optional[str] = None,
    ):
        """
        Initialize protein dataset.

        Args:
            data_dir: Directory containing PDB files or processed data
            split: Dataset split ("train", "val", "test")
            max_length: Maximum sequence length
            min_length: Minimum sequence length
            cache_dir: Directory to cache processed data
        """
        self.data_dir = data_dir
        self.split = split
        self.max_length = max_length
        self.min_length = min_length
        self.cache_dir = cache_dir

        self.processor = PDBProcessor()
        self.proteins = []

        # Load or process data
        self._load_data()

    def _load_data(self):
        """Load and preprocess protein data."""
        cache_file = None
        if self.cache_dir is not None:
            os.makedirs(self.cache_dir, exist_ok=True)
            cache_file = os.path.join(
                self.cache_dir,
                f"{self.split}_proteins.json"
            )

            # Try to load from cache
            if os.path.exists(cache_file):
                print(f"Loading cached data from {cache_file}")
                with open(cache_file, 'r') as f:
                    cached_data = json.load(f)
                    self.proteins = [
                        ProteinStructure(
                            pdb_id=p["pdb_id"],
                            chain_id=p["chain_id"],
                            sequence=p["sequence"],
                            coordinates=np.array(p["coordinates"]),
                        )
                        for p in cached_data
                    ]
                return

        # Process PDB files
        split_dir = os.path.join(self.data_dir, self.split)
        if not os.path.exists(split_dir):
            print(f"Warning: {split_dir} not found. Dataset will be empty.")
            return

        pdb_files = [
            os.path.join(split_dir, f)
            for f in os.listdir(split_dir)
            if f.endswith('.pdb')
        ]

        print(f"Processing {len(pdb_files)} PDB files...")

        for pdb_file in pdb_files:
            try:
                proteins = self.processor.parse_pdb_file(pdb_file)

                for protein in proteins:
                    seq_len = len(protein.sequence)

                    # Filter by length
                    if seq_len < self.min_length or seq_len > self.max_length:
                        continue

                    self.proteins.append(protein)

            except Exception as e:
                print(f"Error processing {pdb_file}: {e}")
                continue

        print(f"Loaded {len(self.proteins)} protein chains")

        # Cache processed data
        if cache_file is not None:
            print(f"Caching data to {cache_file}")
            with open(cache_file, 'w') as f:
                cached_data = [
                    {
                        "pdb_id": p.pdb_id,
                        "chain_id": p.chain_id,
                        "sequence": p.sequence,
                        "coordinates": p.coordinates.tolist(),
                    }
                    for p in self.proteins
                ]
                json.dump(cached_data, f)

    def __len__(self) -> int:
        return len(self.proteins)

    def __getitem__(self, idx: int) -> Dict[str, any]:
        """
        Get a single protein sample.

        Returns:
            Dictionary with:
                - sequence: Amino acid sequence
                - coordinates: CA coordinates
                - length: Sequence length
                - pdb_id: PDB identifier
        """
        protein = self.proteins[idx]

        return {
            "sequence": protein.sequence,
            "coordinates": torch.tensor(protein.coordinates, dtype=torch.float32),
            "length": len(protein.sequence),
            "pdb_id": protein.pdb_id,
            "chain_id": protein.chain_id,
        }


def collate_protein_batch(batch: List[Dict]) -> Dict[str, any]:
    """
    Collate function for batching protein data with padding.

    Args:
        batch: List of samples from ProteinDataset

    Returns:
        Batched dictionary with padded sequences and coordinates
    """
    # Find max length in batch
    max_len = max(sample["length"] for sample in batch)

    sequences = []
    coordinates_list = []
    lengths = []
    pdb_ids = []
    chain_ids = []

    for sample in batch:
        sequences.append(sample["sequence"])
        lengths.append(sample["length"])
        pdb_ids.append(sample["pdb_id"])
        chain_ids.append(sample["chain_id"])

        # Pad coordinates
        coords = sample["coordinates"]
        seq_len = sample["length"]

        if seq_len < max_len:
            # Pad with zeros
            padding = torch.zeros(max_len - seq_len, 3)
            coords = torch.cat([coords, padding], dim=0)

        coordinates_list.append(coords)

    # Stack coordinates
    coordinates = torch.stack(coordinates_list, dim=0)

    return {
        "sequences": sequences,
        "coordinates": coordinates,
        "lengths": torch.tensor(lengths, dtype=torch.long),
        "pdb_ids": pdb_ids,
        "chain_ids": chain_ids,
    }


class CATHDataModule:
    """Data module for CATH 4.2 dataset."""

    def __init__(
        self,
        data_dir: str,
        batch_size: int = 16,
        num_workers: int = 4,
        max_length: int = 512,
        cache_dir: Optional[str] = None,
    ):
        self.data_dir = data_dir
        self.batch_size = batch_size
        self.num_workers = num_workers
        self.max_length = max_length
        self.cache_dir = cache_dir

        # Create datasets
        self.train_dataset = None
        self.val_dataset = None
        self.test_dataset = None

    def setup(self):
        """Setup train/val/test datasets."""
        self.train_dataset = ProteinDataset(
            self.data_dir,
            split="train",
            max_length=self.max_length,
            cache_dir=self.cache_dir,
        )

        self.val_dataset = ProteinDataset(
            self.data_dir,
            split="validation",
            max_length=self.max_length,
            cache_dir=self.cache_dir,
        )

        self.test_dataset = ProteinDataset(
            self.data_dir,
            split="test",
            max_length=self.max_length,
            cache_dir=self.cache_dir,
        )

    def train_dataloader(self) -> DataLoader:
        """Get training dataloader."""
        return DataLoader(
            self.train_dataset,
            batch_size=self.batch_size,
            shuffle=True,
            num_workers=self.num_workers,
            collate_fn=collate_protein_batch,
            pin_memory=True,
        )

    def val_dataloader(self) -> DataLoader:
        """Get validation dataloader."""
        return DataLoader(
            self.val_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=self.num_workers,
            collate_fn=collate_protein_batch,
            pin_memory=True,
        )

    def test_dataloader(self) -> DataLoader:
        """Get test dataloader."""
        return DataLoader(
            self.test_dataset,
            batch_size=self.batch_size,
            shuffle=False,
            num_workers=self.num_workers,
            collate_fn=collate_protein_batch,
            pin_memory=True,
        )


# Example usage
if __name__ == "__main__":
    # Test with mock data
    print("Data preprocessing module loaded successfully!")

    # Example: Create a small test dataset
    # dataset = ProteinDataset("data/cath42", split="train")
    # print(f"Dataset size: {len(dataset)}")

    # if len(dataset) > 0:
    #     sample = dataset[0]
    #     print(f"Sample sequence: {sample['sequence'][:50]}...")
    #     print(f"Sequence length: {sample['length']}")
    #     print(f"Coordinates shape: {sample['coordinates'].shape}")
