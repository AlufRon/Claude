# Protein Folding Inverse Design with LLaDA

A hybrid model-based system for protein inverse folding that combines LLaDA's masked diffusion with classical structure prediction for generating amino acid sequences that fold into desired 3D structures.

## Overview

This project implements the protein folding inverse design approach described in the plan, leveraging:

- **LLaDA**: Masked diffusion model for bidirectional parallel token prediction
- **PiFold**: GNN-based structure prediction for consistency validation
- **Hybrid Framework**: Combines data-driven exploration with physics-based constraints

## Architecture

### Model Components

1. **ProteinTokenizer** (`src/protein_tokenizer.py`)
   - Custom tokenizer for 20 standard amino acids + special tokens
   - Supports masking strategies for training and inference
   - Batch encoding/decoding with padding

2. **ProteinLLaDA** (`src/protein_llada_model.py`)
   - ~500M parameter model (scaled from LLaDA-8B)
   - 12 transformer layers, 768 hidden size, 12 attention heads
   - Bidirectional self-attention (no causal masking)
   - Confidence prediction head for remasking decisions

3. **HybridGenerator** (`src/hybrid_generator.py`)
   - Iterative unmasking with structure validation
   - Multiple remasking strategies: confidence, random, hybrid
   - Integrates with PiFold for RMSD-based consistency checks
   - Tracks generation history and convergence

4. **Data Pipeline** (`src/data_preprocessing.py`)
   - CATH 4.2 dataset processing
   - PDB file parsing with BioPython
   - Sequence and structure extraction
   - Contact map and distance matrix computation

## Project Structure

```
protein_folding_llada/
├── README.md                          # This file
├── .gitignore                         # Excludes cloned repos and outputs
├── LLaDA/                             # Cloned from ML-GSAI/LLaDA (not tracked)
├── PiFold/                            # Cloned from A4Bio/PiFold (not tracked)
├── protein_llada/
│   ├── configs/
│   │   └── protein_llada_500m.yaml   # Model and training config
│   ├── src/
│   │   ├── protein_tokenizer.py      # Amino acid tokenization
│   │   ├── protein_llada_model.py    # Masked diffusion model
│   │   ├── hybrid_generator.py       # Inference with constraints
│   │   └── data_preprocessing.py     # Dataset loading
│   ├── scripts/                       # Training/inference scripts (TODO)
│   ├── data/                          # CATH/TS50/TS500 datasets (download)
│   └── notebooks/                     # Jupyter notebooks for analysis
├── outputs/                           # Generated sequences and results
├── checkpoints/                       # Model checkpoints
└── logs/                              # Training logs

```

## Setup

### Prerequisites

```bash
# Python 3.8+
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Core dependencies
pip install numpy scipy biopython transformers pyyaml

# Optional (for visualization)
pip install matplotlib seaborn jupyterlab
```

### Repository Setup

```bash
# Clone this repository
git clone <repo-url>
cd protein_folding_llada

# Clone LLaDA and PiFold
git clone https://github.com/ML-GSAI/LLaDA.git
git clone https://github.com/A4Bio/PiFold.git

# Install their dependencies
cd LLaDA && pip install -r requirements.txt && cd ..
cd PiFold && pip install -r requirements.txt && cd ..
```

### Data Download

Download CATH 4.2 dataset:
```bash
# CATH 4.2 (training/validation/test splits)
mkdir -p protein_llada/data/cath42
cd protein_llada/data/cath42
# Download from http://www.cathdb.info/download
# Extract PDB files into train/, validation/, test/ subdirectories
```

Download benchmark datasets:
```bash
# TS50 and TS500
# Available from https://github.com/jasonkyuyim/ProDesign or PiFold repo
```

## Usage

### Training (TODO - Script to be implemented)

```bash
# Train small model on CATH 4.2
python protein_llada/scripts/train.py \
    --config protein_llada/configs/protein_llada_500m.yaml \
    --data_dir protein_llada/data/cath42 \
    --output_dir outputs/protein_llada_500m \
    --num_gpus 1

# Training will:
# 1. Load CATH dataset and preprocess
# 2. Train with hybrid loss (masking + structure consistency)
# 3. Save checkpoints every 1000 steps
# 4. Evaluate on validation set every 500 steps
```

### Inference (TODO - Script to be implemented)

```bash
# Generate sequence for target structure
python protein_llada/scripts/inference.py \
    --checkpoint outputs/protein_llada_500m/best_model.pt \
    --structure target.pdb \
    --output generated_sequences.txt \
    --num_iterations 10

# Options:
# --partial_sequence: Start with partial known sequence
# --fixed_positions: Positions to keep fixed
# --temperature: Sampling temperature (default: 1.0)
# --top_k: Top-k sampling (default: None, uses greedy)
```

### Evaluation (TODO - Script to be implemented)

```bash
# Evaluate on TS50/TS500 benchmarks
python protein_llada/scripts/evaluate.py \
    --checkpoint outputs/protein_llada_500m/best_model.pt \
    --dataset TS50 \
    --metrics recovery_rate rmsd tm_score

# Metrics:
# - recovery_rate: % of correctly predicted amino acids
# - rmsd: Structure similarity (Angstroms)
# - tm_score: Template modeling score
```

### Quick Test

```python
from protein_llada.src.protein_tokenizer import ProteinTokenizer
from protein_llada.src.protein_llada_model import ProteinLLaDA, ProteinLLaDAConfig

# Create tokenizer and model
tokenizer = ProteinTokenizer()
config = ProteinLLaDAConfig(vocab_size=len(tokenizer))
model = ProteinLLaDA(config)

print(f"Model parameters: {sum(p.numel() for p in model.parameters()) / 1e6:.2f}M")

# Test tokenization
sequence = "ACDEFGHIKLMNPQRSTVWY"
tokens = tokenizer.encode(sequence)
print(f"Tokens: {tokens}")

decoded = tokenizer.decode(tokens)
print(f"Decoded: {decoded}")
```

## Model Configuration

Key parameters in `configs/protein_llada_500m.yaml`:

```yaml
model:
  vocab_size: 25              # 20 amino acids + 5 special tokens
  hidden_size: 768            # Embedding dimension
  num_hidden_layers: 12       # Transformer layers
  num_attention_heads: 12     # Attention heads
  max_position_embeddings: 1024  # Max protein length

diffusion:
  num_inference_steps: 10     # Iterative unmasking steps
  confidence_threshold: 0.9   # Keep predictions above this
  remask_strategy: "hybrid"   # confidence/random/hybrid

training:
  learning_rate: 5e-5
  batch_size: 16
  alpha_masking: 0.7          # Weight for token prediction
  beta_folding: 0.3           # Weight for structure consistency
```

## Implementation Status

### ✅ Completed
- [x] Repository cloning and setup
- [x] Project structure
- [x] ProteinTokenizer with masking support
- [x] ProteinLLaDA model architecture (~500M params)
- [x] HybridGenerator with iterative unmasking
- [x] Data preprocessing pipeline for CATH
- [x] Model configuration files

### 🚧 In Progress / TODO
- [ ] Training script with hybrid loss function
- [ ] Inference pipeline with full PiFold integration
- [ ] Evaluation scripts for TS50/TS500
- [ ] PiFold structure checker integration (currently mock)
- [ ] Distillation script from LLaDA-8B
- [ ] Comprehensive testing and validation
- [ ] Performance optimization and profiling
- [ ] Documentation and tutorials

## Key Features

### Bidirectional Context
Unlike autoregressive models, LLaDA predicts all masked tokens in parallel using full bidirectional context, enabling:
- Global constraint satisfaction
- Faster inference per iteration
- Better handling of long-range dependencies

### Iterative Refinement
The hybrid generator iteratively:
1. Predicts masked amino acids
2. Validates structure consistency (RMSD check)
3. Remasks low-confidence or inconsistent positions
4. Repeats until convergence or max iterations

### Model-Based Constraints
Integration with PiFold ensures:
- Physical plausibility of generated sequences
- Structure-aware remasking decisions
- Interpretable failure modes

## Expected Performance

Based on the plan and SOTA baselines:

| Metric | Target | Baseline (PiFold) |
|--------|--------|-------------------|
| CATH 4.2 Recovery | >45% | 51.66% |
| TS50 Recovery | >55% | 58.72% |
| TS500 Recovery | >55% | 60.42% |
| Inference Speed | <1min | 70x faster than AR |

## References

### Papers
- **LLaDA**: Nie et al. "Large Language Diffusion Models" (2025) - [arXiv:2502.09992](https://arxiv.org/abs/2502.09992)
- **PiFold**: Gao et al. "Toward effective and efficient protein inverse folding" ICLR 2023
- **Hybrid Approach**: Shlezinger et al. "Model-Based Deep Learning"

### Repositories
- LLaDA: https://github.com/ML-GSAI/LLaDA
- PiFold: https://github.com/A4Bio/PiFold
- CATH Database: http://www.cathdb.info

## Citation

If you use this code, please cite:

```bibtex
@software{protein_llada_2025,
  title={Protein Folding Inverse Design with LLaDA},
  author={Your Name},
  year={2025},
  url={https://github.com/your-repo/protein-folding-llada}
}
```

## License

This project combines components from multiple sources:
- LLaDA: Check their repository for license
- PiFold: Check their repository for license
- Our code: MIT License (see LICENSE file)

## Contact

For questions or issues:
- Open an issue on GitHub
- Email: your.email@example.com

## Acknowledgments

- LLaDA team at ML-GSAI for the masked diffusion framework
- PiFold team at A4Bio for the inverse folding baseline
- CATH database maintainers for the protein structure dataset
