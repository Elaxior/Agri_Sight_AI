"""
run_inference.py
================
Main script for running edge inference on drone video
"""

import cv2
import time
from datetime import datetime
from pathlib import Path
import sys

from inference_engine import InferenceEngine
from video_processor import VideoProcessor
from detection_formatter import DetectionFormatter
from config import load_config


def draw_detections(frame, detections, config):
    """
    Draw bounding boxes and labels on frame.
    
    Args:
        frame: Input frame (modified in-place)
        detections: List of detection dictionaries
        config: Visualization config
    
    Returns:
        Annotated frame
    """
    viz_config = config['visualization']
    
    for det in detections:
        bbox = det['bbox']
        class_name = det['class_name']
        confidence = det['confidence']
        
        # Extract coordinates
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
    """Main inference loop."""
    print("\n" + "="*60)
    print("🚁 AGRICULTURE DRONE - EDGE INFERENCE ENGINE")
    print("="*60)
    
    try:
        # Load configuration
        config = load_config()
        
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
        
        # Storage for detection events
        all_events = []
        
        # Performance tracking
        frame_count = 0
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
            
            all_events.append(event)
            
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
                
                # Display frame
                cv2.imshow("Drone Edge Inference", annotated_frame)
                
                # Check for quit key
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("\n⚠️ User interrupted")
                    break
            
            # Log performance
            if config['performance']['log_fps'] and frame_count % log_interval == 0:
                elapsed = time.time() - start_time
                fps = frame_count / elapsed
                progress = video.get_progress()
                print(f"\n📊 Progress: {progress:.1f}% | FPS: {fps:.1f} | Avg inference: {engine.get_avg_inference_time():.1f}ms")
        
        # Cleanup
        video.release()
        cv2.destroyAllWindows()
        
        # Save detection events
        if config['output']['save_detections'] and all_events:
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = output_dir / f"detections_{timestamp_str}.json"
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
