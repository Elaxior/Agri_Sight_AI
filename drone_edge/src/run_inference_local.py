"""
run_inference_local.py
======================
YOLOv8 inference WITHOUT Firebase - stores detections locally
API server serves them to frontend via REST
"""

import cv2
import time
import json
from datetime import datetime
from pathlib import Path
import sys

from inference_engine import InferenceEngine
from video_processor import VideoProcessor
from detection_formatter import DetectionFormatter
from config import load_config


def draw_detections(frame, detections, config):
    """Draw bounding boxes and labels on frame."""
    viz_config = config['visualization']
    
    for det in detections:
        bbox = det['bbox']
        class_name = det['class_name']
        confidence = det['confidence']
        
        x1, y1 = bbox['x1'], bbox['y1']
        x2, y2 = bbox['x2'], bbox['y2']
        
        # Draw bounding box
        color = tuple(viz_config['bbox_color'])
        thickness = viz_config['bbox_thickness']
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
        
        # Create label
        if viz_config['show_confidence']:
            label = f"{class_name}: {confidence:.0%}"
        else:
            label = class_name
        
        # Draw label background
        text_scale = viz_config['text_scale']
        text_thickness = viz_config['text_thickness']
        (text_w, text_h), _ = cv2.getTextSize(
            label, cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_thickness
        )
        
        cv2.rectangle(frame, (x1, y1 - text_h - 10), (x1 + text_w, y1), color, -1)
        
        # Draw label text
        text_color = tuple(viz_config['text_color'])
        cv2.putText(
            frame, label, (x1, y1 - 5),
            cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_color, text_thickness
        )
    
    return frame


def main():
    """Main inference loop - local storage mode."""
    print("\n" + "="*60)
    print("🚁 AGRICULTURE DRONE - EDGE INFERENCE (LOCAL MODE)")
    print("="*60)
    
    try:
        # Load configuration
        config = load_config()
        
        # Create session ID
        session_id = f"local_{int(time.time())}"
        print(f"📊 Session ID: {session_id}")
        
        # Initialize inference engine
        engine = InferenceEngine(
            model_path=config['model']['path'],
            conf_threshold=config['model']['confidence_threshold']
        )
        
        # Initialize video processor
        video = VideoProcessor(config['video']['input_path'])
        
        # Create output directory
        output_dir = Path(__file__).resolve().parent.parent / "output"
        output_dir.mkdir(exist_ok=True)
        
        # Create detections file for API to serve
        detections_file = output_dir / "current_detections.json"
        session_file = output_dir / "current_session.json"
        
        # Initialize session metadata
        session_data = {
            "session_id": session_id,
            "start_time": datetime.now().isoformat(),
            "status": "active",
            "video_path": str(config['video']['input_path']),
            "frame_count": 0,
            "total_detections": 0
        }
        
        # Save initial session
        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)
        
        # Storage for all detections
        all_detections = []
        
        # Performance tracking
        frame_count = 0
        total_detections = 0
        start_time = time.time()
        log_interval = config['performance']['log_interval']
        
        print("\n▶️  Starting Inference")
        print("=" * 60)
        print("Press 'q' to quit\n")
        
        # Main inference loop
        while True:
            # Read frame
            success, frame = video.read_frame()
            
            if not success:
                print("\n📹 End of video reached")
                break
            
            frame_count += 1
            
            # Run inference
            detections = engine.predict(frame)
            
            # Create detection event
            timestamp = datetime.now().isoformat()
            event = DetectionFormatter.format_detection_event(
                frame_number=frame_count,
                timestamp=timestamp,
                detections=detections,
                frame_shape=frame.shape
            )
            
            # Add session context
            event['session_id'] = session_id
            
            # Store detection
            all_detections.append(event)
            total_detections += len(detections)
            
            # Save to file (overwrite each time so API always has latest)
            with open(detections_file, 'w') as f:
                json.dump({
                    "session_id": session_id,
                    "detections": all_detections
                }, f)
            
            # Print detection summary
            if detections:
                DetectionFormatter.print_detection_summary(event)
            
            # Draw visualizations
            if config['video']['display_window']:
                annotated_frame = draw_detections(frame.copy(), detections, config)
                
                # Add FPS overlay
                elapsed = time.time() - start_time
                fps = frame_count / elapsed if elapsed > 0 else 0
                
                cv2.putText(
                    annotated_frame, f"FPS: {fps:.1f}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
                )
                
                cv2.putText(
                    annotated_frame, "LOCAL MODE", (10, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2
                )
                
                # Display frame
                cv2.imshow("Drone Edge Inference (Local)", annotated_frame)
                
                # Check for quit key
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("\n⚠️ User interrupted")
                    break
            
            # Log performance periodically
            if config['performance']['log_fps'] and frame_count % log_interval == 0:
                elapsed = time.time() - start_time
                fps = frame_count / elapsed
                progress = video.get_progress()
                print(f"\n📊 Progress: {progress:.1f}% | FPS: {fps:.1f} | Avg inference: {engine.get_avg_inference_time():.1f}ms")
                print(f"   Detections: {total_detections} | Frame: {frame_count}")
        
        # Cleanup
        video.release()
        cv2.destroyAllWindows()
        
        # Update session status
        session_data["status"] = "completed"
        session_data["frame_count"] = frame_count
        session_data["total_detections"] = total_detections
        session_data["end_time"] = datetime.now().isoformat()
        
        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)
        
        # Save final detections
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_file = output_dir / f"detections_local_{timestamp_str}.json"
        with open(final_file, 'w') as f:
            json.dump({
                "session": session_data,
                "detections": all_detections
            }, f, indent=2)
        
        # Final statistics
        elapsed = time.time() - start_time
        avg_fps = frame_count / elapsed if elapsed > 0 else 0
        
        print("\n" + "="*60)
        print("✅ INFERENCE COMPLETE")
        print("="*60)
        print(f"📊 Statistics:")
        print(f"   Session ID: {session_id}")
        print(f"   Frames processed: {frame_count}")
        print(f"   Total detections: {total_detections}")
        print(f"   Elapsed time: {elapsed:.1f}s")
        print(f"   Average FPS: {avg_fps:.1f}")
        print(f"   Avg inference time: {engine.get_avg_inference_time():.1f}ms")
        print(f"\n💾 Saved to: {final_file.name}")
        print("="*60 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupted by user")
        cv2.destroyAllWindows()
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
