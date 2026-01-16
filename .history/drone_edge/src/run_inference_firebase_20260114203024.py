"""
run_inference_firebase.py
=========================
Main inference script with Firebase real-time streaming
"""

import cv2
import time
from datetime import datetime
from pathlib import Path
import sys

from inference_engine import InferenceEngine
from video_processor import VideoProcessor
from detection_formatter import DetectionFormatter
from firebase_uploader import FirebaseUploader
from config import load_config


def draw_detections(frame, detections, config):
    """
    Draw bounding boxes and labels on frame.
    (Same as Part 3 - no changes)
    """
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
    """Main inference loop with Firebase streaming."""
    print("\n" + "="*60)
    print("🚁 AGRICULTURE DRONE - EDGE INFERENCE WITH FIREBASE")
    print("="*60)
    
    try:
        # Load configuration
        config = load_config()
        
        # Initialize Firebase uploader (also initializes connection)
        uploader = FirebaseUploader(session_id=f"inference_{int(time.time())}")
        
        # Initialize inference engine
        engine = InferenceEngine(
            model_path=config['model']['path'],
            conf_threshold=config['model']['confidence_threshold']
        )
        
        # Initialize video processor
        video = VideoProcessor(config['video']['input_path'])
        
        # Create output directory
        output_dir = Path(config['output']['output_dir'])
        output_dir.mkdir(exist_ok=True)
        
        # Storage for local backup
        all_events = []
        
        # Performance tracking
        frame_count = 0
        start_time = time.time()
        log_interval = config['performance']['log_interval']
        
        print("\n▶️  Starting Inference with Firebase Streaming")
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
            
            # 🔥 UPLOAD TO FIREBASE
            firebase_key = uploader.upload_detection_event(event)
            
            # Store locally as backup
            all_events.append(event)
            
            # Print detection summary (if detections found)
            if detections:
                DetectionFormatter.print_detection_summary(event)
                if firebase_key:
                    print(f"  🔥 Firebase key: {firebase_key}")
            
            # Draw visualizations
            if config['video']['display_window']:
                annotated_frame = draw_detections(frame.copy(), detections, config)
                
                # Add FPS and Firebase status overlay
                elapsed = time.time() - start_time
                fps = frame_count / elapsed if elapsed > 0 else 0
                
                cv2.putText(
                    annotated_frame, f"FPS: {fps:.1f}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
                )
                
                firebase_status = "🔥 LIVE" if firebase_key else "⚠️ OFFLINE"
                cv2.putText(
                    annotated_frame, firebase_status, (10, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2
                )
                
                # Display frame
                cv2.imshow("Drone Edge Inference + Firebase", annotated_frame)
                
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
                print(f"   Firebase uploads: {uploader.frame_count} frames, {uploader.total_detections} detections")
        
        # Cleanup
        video.release()
        cv2.destroyAllWindows()
        
        # End Firebase session
        uploader.end_session()
        
        # Save local backup
        if config['output']['save_detections'] and all_events:
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = output_dir / f"detections_firebase_{timestamp_str}.json"
            DetectionFormatter.save_to_json(all_events, str(output_file))
        
        # Final statistics
        elapsed = time.time() - start_time
        avg_fps = frame_count / elapsed if elapsed > 0 else 0
        
        print("\n" + "="*60)
        print("✅ INFERENCE COMPLETE")
        print("="*60)
        print(f"📊 Statistics:")
        print(f"   Frames processed: {frame_count}")
        print(f"   Total detections: {sum(len(e['detections']) for e in all_events)}")
        print(f"   Elapsed time: {elapsed:.1f}s")
        print(f"   Average FPS: {avg_fps:.1f}")
        print(f"   Avg inference time: {engine.get_avg_inference_time():.1f}ms")
        print(f"\n🔥 Firebase:")
        print(f"   Session ID: {uploader.session_id}")
        print(f"   Events uploaded: {uploader.frame_count}")
        print(f"   Total detections: {uploader.total_detections}")
        print("="*60 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupted by user")
        if 'uploader' in locals():
            uploader.end_session()
        cv2.destroyAllWindows()
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        if 'uploader' in locals():
            uploader.end_session()
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
