"""
detection_formatter.py
======================
Structures detection events for logging and Firebase transmission
"""

from datetime import datetime
from typing import List, Dict, Any
import json


class DetectionFormatter:
    """
    Formats detection results into structured events.
    """
    
    @staticmethod
    def format_detection_event(
        frame_number: int,
        timestamp: str,
        detections: List[Dict[str, Any]],
        frame_shape: tuple
    ) -> Dict[str, Any]:
        """
        Create structured detection event.
        
        Args:
            frame_number: Current frame index
            timestamp: ISO format timestamp
            detections: List of detection dictionaries
            frame_shape: (height, width, channels)
        
        Returns:
            Structured event dictionary
        """
        event = {
            'frame_id': frame_number,
            'timestamp': timestamp,
            'image_size': {
                'width': frame_shape[1],
                'height': frame_shape[0]
            },
            'detection_count': len(detections),
            'detections': detections
        }
        
        return event
    
    @staticmethod
    def print_detection_summary(event: Dict[str, Any]) -> None:
        """
        Print formatted detection summary to console.
        
        Args:
            event: Detection event dictionary
        """
        print(f"\n[Frame {event['frame_id']}] {event['timestamp']}")
        print(f"  Detections: {event['detection_count']}")
        
        if event['detection_count'] > 0:
            for i, det in enumerate(event['detections'], 1):
                print(f"    {i}. {det['class_name']}: {det['confidence']:.1%}")
    
    @staticmethod
    def save_to_json(events: List[Dict[str, Any]], output_path: str) -> None:
        """
        Save detection events to JSON file.
        
        Args:
            events: List of detection events
            output_path: Output JSON file path
        """
        with open(output_path, 'w') as f:
            json.dump(events, f, indent=2)
        
        print(f"\n💾 Saved {len(events)} events to: {output_path}")
