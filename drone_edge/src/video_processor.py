"""
video_processor.py
==================
Video Input Pipeline for Drone Footage Processing
Supports:
- Video files (e.g. video/test.mp4)
- Webcam (source=0)
"""

import cv2
from pathlib import Path
from typing import Optional, Tuple, Union
import numpy as np


class VideoProcessor:
    """
    Handles video or webcam input and frame extraction.
    """

    def __init__(self, source: Union[str, int]):
        """
        Initialize video processor.

        Args:
            source:
                - str  -> path to video file (e.g. "video/test.mp4")
                - int  -> webcam index (e.g. 0)
        """

        # 🔑 FIX 1: Resolve project root (drone_edge/)
        self.base_dir = Path(__file__).resolve().parent.parent

        # 🔑 FIX 2: Resolve video path relative to project root
        if isinstance(source, str):
            self.source = (self.base_dir / source).resolve()
        else:
            self.source = source  # webcam index

        self.cap = None
        self.fps = 0
        self.total_frames = 0
        self.current_frame = 0
        self.frame_width = 0
        self.frame_height = 0

        self._open_source()

    def _open_source(self) -> None:
        """Open video file or webcam and extract metadata."""
        print(f"\n📹 Initializing Video Source")
        print("=" * 60)

        # Case 1: Webcam
        if isinstance(self.source, int):
            print(f"🎥 Using webcam (index={self.source})")
            self.cap = cv2.VideoCapture(self.source)

            if not self.cap.isOpened():
                raise RuntimeError("Failed to open webcam")

            self.fps = int(self.cap.get(cv2.CAP_PROP_FPS)) or 30
            self.total_frames = -1
            self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            print(f"📐 Resolution: {self.frame_width}x{self.frame_height}")
            print(f"🎬 FPS (approx): {self.fps}")
            print("✅ Webcam opened successfully")
            print("=" * 60)
            return

        # Case 2: Video file
        video_path = self.source

        if not video_path.exists():
            raise FileNotFoundError(
                f"Video file not found: {video_path}\n"
                f"Expected location: {video_path}"
            )

        self.cap = cv2.VideoCapture(str(video_path))

        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open video: {video_path}")

        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        duration_sec = self.total_frames / self.fps if self.fps > 0 else 0
        file_size_mb = video_path.stat().st_size / (1024 * 1024)

        print(f"📁 File: {video_path.name}")
        print(f"💾 Size: {file_size_mb:.2f} MB")
        print(f"📐 Resolution: {self.frame_width}x{self.frame_height}")
        print(f"🎬 FPS: {self.fps}")
        print(f"📊 Total frames: {self.total_frames}")
        print(f"⏱️  Duration: {duration_sec:.1f}s")
        print("✅ Video opened successfully")
        print("=" * 60)

    def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        if self.cap is None:
            return False, None

        ret, frame = self.cap.read()

        if ret:
            self.current_frame += 1

        return ret, frame

    def get_progress(self) -> float:
        if self.total_frames <= 0:
            return -1.0
        return (self.current_frame / self.total_frames) * 100

    def release(self) -> None:
        if self.cap is not None:
            self.cap.release()
            print(f"\n📹 Video source released (frames processed: {self.current_frame})")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()


# -------------------------
# Standalone test
# -------------------------
if __name__ == "__main__":
    print("🧪 Testing VideoProcessor\n")

    # OPTION 1: test generated video
    source = "video/test.mp4"

    # OPTION 2: test webcam
    # source = 0

    try:
        with VideoProcessor(source) as vp:
            for i in range(10):
                success, frame = vp.read_frame()
                if not success:
                    print("⚠️ No more frames or failed read")
                    break
                print(f"✅ Frame {i+1}: {frame.shape}")

            progress = vp.get_progress()
            if progress >= 0:
                print(f"\n📊 Progress: {progress:.2f}%")
            else:
                print("\n📊 Progress: Live stream (webcam)")

            print("\n✅ VideoProcessor working correctly!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
