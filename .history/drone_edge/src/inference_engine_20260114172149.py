"""
inference_engine.py
===================
YOLOv8 Model Loading and Inference Engine for Edge Deployment
"""

import time
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
from ultralytics import YOLO
import torch


class InferenceEngine:
    """
    Handles YOLOv8 model loading and inference on edge devices.
    """

    def __init__(self, model_path: str, conf_threshold: float = 0.25):
        """
        Initialize inference engine.
        """
        # 🔑 FIX: Resolve project root (drone_edge/)
        self.base_dir = Path(__file__).resolve().parent.parent

        # 🔑 FIX: Always resolve model path relative to project root
        self.model_path = (self.base_dir / model_path).resolve()

        self.conf_threshold = conf_threshold
        self.model = None
        self.class_names = []
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

        self.inference_times = []

        self._load_model()

    def _load_model(self) -> None:
        """Load YOLOv8 model from .pt file."""
        print(f"\n🔧 Loading Model")
        print("=" * 60)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file not found: {self.model_path}\n"
                f"Expected location: {self.model_path}"
            )

        print(f"📁 Model: {self.model_path.name}")
        print(f"💾 Size: {self.model_path.stat().st_size / (1024*1024):.2f} MB")
        print(f"🖥️  Device: {self.device.upper()}")

        try:
            self.model = YOLO(str(self.model_path))
            self.class_names = self.model.names

            print("⏳ Warming up model...")
            dummy_input = np.zeros((640, 640, 3), dtype=np.uint8)
            _ = self.model.predict(dummy_input, verbose=False)

            print("✅ Model loaded successfully")
            print(f"📊 Classes: {len(self.class_names)}")
            print(f"🎯 Confidence threshold: {self.conf_threshold:.0%}")
            print("=" * 60)

        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")

    def predict(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        start_time = time.time()

        results = self.model.predict(
            frame,
            conf=self.conf_threshold,
            verbose=False,
            device=self.device
        )

        self.inference_times.append((time.time() - start_time) * 1000)
        return self._parse_results(results[0])

    def _parse_results(self, result) -> List[Dict[str, Any]]:
        detections = []

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                'class_id': class_id,
                'class_name': self.class_names[class_id],
                'confidence': confidence,
                'bbox': {
                    'x1': int(x1),
                    'y1': int(y1),
                    'x2': int(x2),
                    'y2': int(y2)
                }
            })

        return detections

    def get_avg_inference_time(self) -> float:
        return sum(self.inference_times) / len(self.inference_times) if self.inference_times else 0.0

    def get_fps(self) -> float:
        avg = self.get_avg_inference_time()
        return 1000.0 / avg if avg > 0 else 0.0
