"""
inference.py — PyTorch EfficientNet-B4 Model Loader and Predictor.

Recreates the exact model architecture from the training notebook:
- torchvision.models.efficientnet_b4
- Classifier replaced with:
    nn.Sequential(
        nn.Dropout(p=0.4, inplace=True),
        nn.Linear(num_features, 5)
    )
- Input resized to (380, 380), normalized with ImageNet statistics
- Singleton model kept in memory across requests
"""

import os
import io
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import efficientnet_b4
from PIL import Image
from typing import Dict, Any, Tuple

from config import (
    MODEL_PATH,
    IMAGE_SIZE,
    NORMALIZE_MEAN,
    NORMALIZE_STD,
    CLASS_LABELS,
    REFERABLE_CLASSES,
)


class DRInferenceEngine:
    """Singleton Inference Engine for Diabetic Retinopathy Classification."""

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.device = self._select_device()
        self.transform = self._build_transforms()
        self.model = None
        self._load_model()

    def _select_device(self) -> torch.device:
        """Select CUDA if available, MPS for Apple Silicon (if supported), else CPU."""
        if torch.cuda.is_available():
            device = torch.device("cuda")
        elif torch.backends.mps.is_available():
            device = torch.device("mps")
        else:
            device = torch.device("cpu")
        return device

    def _build_transforms(self) -> transforms.Compose:
        """Preprocessing pipeline matching the training pipeline exactly."""
        return transforms.Compose([
            transforms.Resize(IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
        ])

    def _load_model(self) -> None:
        """Construct the EfficientNet-B4 architecture and load state_dict."""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model checkpoint not found at: {self.model_path}. "
                f"Please ensure balanced_efficientnet_b4_dr.pth is in the models/ directory."
            )

        print(f"Loading EfficientNet-B4 architecture on {self.device}...")
        # Instantiate base EfficientNet-B4
        model = efficientnet_b4(weights=None)

        # Replace classifier head with exact 5-class dropout + linear architecture
        num_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.4, inplace=True),
            nn.Linear(num_features, 5)
        )

        # Load weights
        print(f"Loading state_dict from: {self.model_path}...")
        state_dict = torch.load(self.model_path, map_location=self.device)
        missing_keys, unexpected_keys = model.load_state_dict(state_dict)

        if missing_keys or unexpected_keys:
            print(f"Warning - missing keys: {missing_keys}, unexpected keys: {unexpected_keys}")

        model = model.to(self.device)
        model.eval()
        self.model = model

        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("  RetinaCare AI — EfficientNet-B4 Loaded Successfully")
        print(f"  Classes    : 5 (0: No DR, 1: Mild, 2: Moderate, 3: Severe, 4: Proliferative)")
        print(f"  Input size : {IMAGE_SIZE[0]}x{IMAGE_SIZE[1]}")
        print(f"  Device     : {self.device}")
        print(f"  Model Path : {self.model_path}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Run inference on raw image bytes.
        
        Returns:
            Dict containing predicted class, label, confidence, all class probabilities,
            referable status, and referable probability.
        """
        if self.model is None:
            raise RuntimeError("Model is not initialized.")

        # 1. Load image and convert to RGB
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Failed to decode image file: {str(e)}")

        # 2. Apply preprocessing transform
        tensor_image = self.transform(pil_image)  # Shape: (3, 380, 380)
        tensor_batch = tensor_image.unsqueeze(0).to(self.device)  # Shape: (1, 3, 380, 380)

        # 3. Model inference with torch.no_grad()
        with torch.no_grad():
            logits = self.model(tensor_batch)
            probabilities = torch.softmax(logits, dim=1).squeeze(0)

        # 4. Extract metrics
        probs_list = probabilities.cpu().tolist()
        predicted_class_idx = int(torch.argmax(probabilities).item())
        confidence = float(probs_list[predicted_class_idx])

        # Class probabilities mapping
        class_probabilities = {
            str(idx): round(float(prob), 4)
            for idx, prob in enumerate(probs_list)
        }

        # Referable calculation (Classes 2, 3, 4)
        is_referable = predicted_class_idx in REFERABLE_CLASSES
        referable_prob = sum(probs_list[cls_idx] for cls_idx in REFERABLE_CLASSES)

        return {
            "predictedClass": predicted_class_idx,
            "predictedLabel": CLASS_LABELS.get(predicted_class_idx, "Unknown"),
            "confidence": round(confidence, 4),
            "classProbabilities": class_probabilities,
            "referable": is_referable,
            "referableProbability": round(referable_prob, 4),
            "imageMetadata": {
                "originalFormat": pil_image.format if hasattr(pil_image, "format") else "RGB",
                "originalWidth": pil_image.width,
                "originalHeight": pil_image.height,
            },
            "disclaimer": "AI prediction is a screening aid and requires doctor review.",
        }


# Singleton engine instance
engine: DRInferenceEngine = None


def get_inference_engine() -> DRInferenceEngine:
    global engine
    if engine is None:
        engine = DRInferenceEngine()
    return engine
