"""
config.py — Configuration for the RetinaCare AI ML Inference Service.
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = os.getenv(
    "MODEL_PATH",
    str(BASE_DIR / "models" / "balanced_efficientnet_b4_dr.pth")
)

# Service Config
HOST = os.getenv("ML_HOST", "127.0.0.1")
PORT = int(os.getenv("ML_PORT", "5002"))

# Preprocessing Constants (matching training pipeline)
IMAGE_SIZE = (380, 380)
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD = [0.229, 0.224, 0.225]

# Class Mappings
CLASS_LABELS = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR",
}

# Referable DR Definition (Classes 2, 3, 4 require ophthalmologist referral)
REFERABLE_CLASSES = {2, 3, 4}

# Allowed image MIME types
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
