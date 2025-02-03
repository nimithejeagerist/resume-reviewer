#!/bin/bash

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Python and pip
sudo apt-get install python3-pip -y

# Install CUDA dependencies (assuming NVIDIA GPU)
# Add NVIDIA package repositories
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub
sudo add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /"
sudo apt-get update

# Install CUDA
sudo apt-get -y install cuda

# Install requirements
pip3 install -r requirements.txt

# Run the API server
python3 api.py 