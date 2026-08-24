import os
import torch
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader
import torch.nn as nn
import torch.optim as optim

from fastai.vision.all import *
from google.colab import files

from google.colab import drive
drive.mount('/content/drive')

data_path = '/content/drive/My Drive/f&v dataset'

from fastai.vision.all import *

# Load the model
model_path = '/content/drive/My Drive/new_model3'
learn = load_learner(model_path)

# Loading and preparing the image for prediction
img_path = '/content/drive/My Drive/small-round-green-vegetable.jpg'
img = PILImage.create(img_path)

# Perform predictions
label, _, probs = learn.predict(img)

print(f"This is a {label}.")
print(f"{label} probability: {probs[1].item():.6f}")
print(f"Other probability: {label} {probs[0].item():.6f}")
