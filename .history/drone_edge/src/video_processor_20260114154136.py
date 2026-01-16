"""
video_processor.py
==================
Video Input Pipeline for Drone Footage Processing
"""

import cv2
from pathlib import Path
from typing import Optional, Tuple
import numpy as np


class VideoProcessor:
    """
    Handles video file reading and frame extraction.
    
    Attributes:
        video_path: Path to input video file
        cap: OpenCV VideoCapture object
        fps: Video frame rate
        total_frames: Total number of frames in video
        current_frame: Current frame number
    """
    
    def __init__(self, video_path: str):
        """
        Initialize video processor.
        
        Args:
            video_path: Path to video file
        """
        self.video_path = Path(video_path)
        self.cap = None
        self.fps = 0
        self.total_frames = 0
        self.current_frame = 0
        self.frame_width = 0
        self.frame_height = 0
        
        self._open_video()
    
    def _open_video(self) -> None:
        """Open video file and extract metadata."""
        print(f"\n📹 Opening Video")
        print("=" * 60)
        
        if not self.video_path.exists():
            raise FileNotFoundError(
                f"Video file not found: {self.video_path}\n"
                f"Place video at: {self.video_path.absolute()}"
            )
        
        self.cap = cv2.VideoCapture(str(self.video_path))
        
        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open video: {self.video_path}")
        
        # Extract video properties
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.frame_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.frame_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        duration_sec = self.total_frames / self.fps if self.fps > 0 else 0
        file_size_mb = self.video_path.stat().st_size / (1024 * 1024)
        
        print(f"📁 File: {self.video_path.name}")
        print(f"💾 Size: {file_size_mb:.2f} MB")
        print(f"📐 Resolution: {self.frame_width}x{self.frame_height}")
        print(f"🎬 FPS: {self.fps}")
        print(f"📊 Total frames: {self.total_frames}")
        print(f"⏱️  Duration: {duration_sec:.1f}s")
        print("✅ Video opened successfully")
        print("=" * 60)
    
    def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Read next frame from video.
        
        Returns:
            Tuple of (success, frame):
                - success: True if frame was read successfully
                - frame: Frame as numpy array (BGR format) or None
        """
        if self.cap is None:
            return False, None
        
        ret, frame = self.cap.read()
        
        if ret:
            self.current_frame += 1
        
        return ret, frame
    
    def get_progress(self) -> float:
        """
        Get processing progress as percentage.
        
        Returns:
            Progress (0.0 to 100.0)
        """
        if self.total_frames == 0:
            return 0.0
        return (self.current_frame / self.total_frames) * 100
    
    def release(self) -> None:
        """Release video capture resources."""
        if self.cap is not None:
            self.cap.release()
            print(f"\n📹 Video released (processed {self.current_frame}/{self.total_frames} frames)")
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - ensures cleanup."""
        self.release()


# Example usage
if __name__ == "__main__":
    video_path = "../video/drone_footage.mp4"
    
    print("🧪 Testing Video Processor\n")
    
    try:
        with VideoProcessor(video_path) as vp:
            # Read first 10 frames
            for i in range(10):
                success, frame = vp.read_frame()
                if not success:
                    print(f"⚠️ Failed to read frame {i+1}")
                    break
                print(f"✅ Frame {i+1}: {frame.shape}")
            
            print(f"\n📊 Progress: {vp.get_progress():.2f}%")
            print("\n✅ Video Processor working correctly!")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
