"""
inference_engine.py
===================
YOLOv8 Model Loading and Inference Engine for Edge Deployment
"""

import time
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from ultralytics import YOLO
import torch


class InferenceEngine:
    """
    Handles YOLOv8 model loading and inference on edge devices.
    
    Attributes:
        model: Loaded YOLOv8 model
        class_names: List of detection class names
        device: Compute device ('cuda' or 'cpu')
    """
    
    def __init__(self, model_path: str, conf_threshold: float = 0.25):
        """
        Initialize inference engine.
        
        Args:
            model_path: Path to YOLOv8 .pt weights file
            conf_threshold: Confidence threshold for detections (0.0-1.0)
        """
        self.model_path = Path(model_path)
        self.conf_threshold = conf_threshold
        self.model = None
        self.class_names = []
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        # Performance tracking
        self.inference_times = []
        
        # Load model
        self._load_model()
    
    def _load_model(self) -> None:
        """Load YOLOv8 model from .pt file."""
        print(f"\n🔧 Loading Model")
        print("=" * 60)
        
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file not found: {self.model_path}\n"
                f"Place your trained model at: {self.model_path.absolute()}"
            )
        
        print(f"📁 Model: {self.model_path.name}")
        print(f"💾 Size: {self.model_path.stat().st_size / (1024*1024):.2f} MB")
        print(f"🖥️  Device: {self.device.upper()}")
        
        try:
            # Load model
            self.model = YOLO(str(self.model_path))
            
            # Extract class names
            self.class_names = self.model.names
            
            # Warmup inference (first run is always slower)
            print(f"⏳ Warming up model...")
            dummy_input = np.zeros((640, 640, 3), dtype=np.uint8)
            _ = self.model.predict(dummy_input, verbose=False)
            
            print(f"✅ Model loaded successfully")
            print(f"📊 Classes: {len(self.class_names)}")
            print(f"🎯 Confidence threshold: {self.conf_threshold:.0%}")
            print("=" * 60)
            
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")
    
    def predict(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Run inference on a single frame.
        
        Args:
            frame: Input image as numpy array (BGR format from OpenCV)
        
        Returns:
            List of detection dictionaries with structure:
            {
                'class_id': int,
                'class_name': str,
                'confidence': float,
                'bbox': {'x1': float, 'y1': float, 'x2': float, 'y2': float}
            }
        """
        start_time = time.time()
        
        # Run YOLOv8 inference
        results = self.model.predict(
            frame,
            conf=self.conf_threshold,
            verbose=False,
            device=self.device
        )
        
        # Track inference time
        inference_time = (time.time() - start_time) * 1000  # Convert to ms
        self.inference_times.append(inference_time)
        
        # Parse results
        detections = self._parse_results(results[0])
        
        return detections
    
    def _parse_results(self, result) -> List[Dict[str, Any]]:
        """
        Parse YOLO results into structured dictionaries.
        
        Args:
            result: YOLO result object
        
        Returns:
            List of detection dictionaries
        """
        detections = []
        
        boxes = result.boxes
        
        for box in boxes:
            # Extract box data
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            detection = {
                'class_id': class_id,
                'class_name': self.class_names[class_id],
                'confidence': confidence,
                'bbox': {
                    'x1': int(x1),
                    'y1': int(y1),
                    'x2': int(x2),
                    'y2': int(y2)
                }
            }
            
            detections.append(detection)
        
        return detections
    
    def get_avg_inference_time(self) -> float:
        """
        Get average inference time in milliseconds.
        
        Returns:
            Average inference time (ms)
        """
        if not self.inference_times:
            return 0.0
        return sum(self.inference_times) / len(self.inference_times)
    
    def get_fps(self) -> float:
        """
        Calculate frames per second based on average inference time.
        
        Returns:
            Estimated FPS
        """
        avg_time = self.get_avg_inference_time()
        if avg_time == 0:
            return 0.0
        return 1000.0 / avg_time


# Example usage and testing
if __name__ == "__main__":
    # Test model loading
    model_path = "../models/best.pt"
    
    print("🧪 Testing Inference Engine\n")
    
    try:
        engine = InferenceEngine(model_path, conf_threshold=0.25)
        
        # Test inference on dummy image
        test_frame = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
        detections = engine.predict(test_frame)
        
        print(f"\n📊 Test Results:")
        print(f"   Detections: {len(detections)}")
        print(f"   Avg time: {engine.get_avg_inference_time():.2f}ms")
        print(f"   Est. FPS: {engine.get_fps():.1f}")
        
        print("\n✅ Inference Engine working correctly!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
