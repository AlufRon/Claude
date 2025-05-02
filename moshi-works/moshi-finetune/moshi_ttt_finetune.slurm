#!/bin/bash
#SBATCH --partition=rtx6000
#SBATCH --partition rtx6000
#SBATCH --job-name=moshi_7B_with_ttt  # Job name
#SBATCH --output=moshi_7B_with_ttt.log           # File to write stdout
#SBATCH --error=moshi_7B_with_ttt.log             # File to write stderr
#SBATCH --tasks=1                    # Number of tasks
#SBATCH --cpus-per-task=3             # Number of CPU cores per task
#SBATCH --gpus=rtx_6000:1                  # Number of GPUs
#SBATCH --mem=50G
#SBATCH --time=120:00:00               # Maximum execution time
# Load required modules
module load cuda/11.8

# Activate the virtual environment
module load anaconda
source activate my_env

torchrun --nproc-per-node=1 -m train --config example/moshi_7B_with_ttt.yaml 
