"""
firebase_uploader.py
====================
High-level interface for uploading detection events to Firebase
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from firebase_client import FirebaseClient
import time


class FirebaseUploader:
    """
    Handles uploading detection events and session metadata to Firebase.
    """
    
    def __init__(self, session_id: Optional[str] = None):
        """
        Initialize uploader.
        
        Args:
            session_id: Unique session identifier (defaults to timestamp)
        """
        self.client = FirebaseClient()
        self.session_id = session_id or f"session_{int(time.time())}"
        self.frame_count = 0
        self.total_detections = 0
        self.session_start = datetime.now().isoformat()
        
        # Initialize session in Firebase
        self._init_session()
    
    def _init_session(self) -> None:
        """Create session metadata in Firebase."""
        session_data = {
            'session_id': self.session_id,
            'start_time': self.session_start,
            'status': 'active',
            'frame_count': 0,
            'total_detections': 0
        }
        
        self.client.set_data(f'/sessions/{self.session_id}', session_data)
        print(f"\n📊 Session initialized: {self.session_id}")
    
    def upload_detection_event(self, event: Dict[str, Any]) -> str:
        """
        Upload a single detection event.
        
        Args:
            event: Detection event dictionary (from detection_formatter)
        
        Returns:
            Firebase-generated key
        """
        # Add session context
        event_with_session = {
            **event,
            'session_id': self.session_id
        }
        
        # Push to Firebase
        try:
            key = self.client.push_data('/detections', event_with_session)
            self.total_detections += event.get('detection_count', 0)
            return key
        except Exception as e:
            print(f"⚠️ Firebase upload failed: {e}")
            # Don't crash inference - log and continue
            return None
    
    def upload_frame_summary(self, frame_data: Dict[str, Any]) -> str:
        """
        Upload frame-level summary.
        
        Args:
            frame_data: Frame metadata (frame_id, timestamp, detection_count, etc.)
        
        Returns:
            Firebase-generated key
        """
        frame_with_session = {
            **frame_data,
            'session_id': self.session_id
        }
        
        try:
            key = self.client.push_data('/frames', frame_with_session)
            self.frame_count += 1
            
            # Update session stats
            self._update_session_stats()
            
            return key
        except Exception as e:
            print(f"⚠️ Frame upload failed: {e}")
            return None
    
    def _update_session_stats(self) -> None:
        """Update session statistics in Firebase."""
        updates = {
            'frame_count': self.frame_count,
            'total_detections': self.total_detections,
            'last_update': datetime.now().isoformat()
        }
        
        try:
            self.client.update_data(f'/sessions/{self.session_id}', updates)
        except Exception as e:
            print(f"⚠️ Session update failed: {e}")
    
    def end_session(self) -> None:
        """Mark session as complete."""
        end_data = {
            'status': 'completed',
            'end_time': datetime.now().isoformat(),
            'frame_count': self.frame_count,
            'total_detections': self.total_detections
        }
        
        try:
            self.client.update_data(f'/sessions/{self.session_id}', end_data)
            print(f"\n📊 Session ended: {self.session_id}")
            print(f"   Frames: {self.frame_count}")
            print(f"   Detections: {self.total_detections}")
        except Exception as e:
            print(f"⚠️ Session end failed: {e}")


# Example usage
if __name__ == "__main__":
    try:
        # Initialize uploader
        uploader = FirebaseUploader(session_id="test_session")
        
        # Simulate detection event
        test_event = {
            'frame_id': 1,
            'timestamp': datetime.now().isoformat(),
            'image_size': {'width': 1280, 'height': 720},
            'detection_count': 2,
            'detections': [
                {
                    'class_id': 7,
                    'class_name': 'Corn leaf blight',
                    'confidence': 0.87,
                    'bbox': {'x1': 234, 'y1': 456, 'x2': 789, 'y2': 901}
                },
                {
                    'class_id': 14,
                    'class_name': 'Tomato Early blight',
                    'confidence': 0.73,
                    'bbox': {'x1': 123, 'y1': 234, 'x2': 567, 'y2': 678}
                }
            ]
        }
        
        # Upload event
        key = uploader.upload_detection_event(test_event)
        print(f"\n✅ Test event uploaded!")
        print(f"   Key: {key}")
        
        # End session
        uploader.end_session()
        
        print("\n✅ Firebase uploader test successful!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
