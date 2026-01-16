

from ultralytics import YOLO
import cv2
from pathlib import Path

def test_model_on_images():
    print('\n' + '='*60)
    print('🧪 TESTING MODEL ON SAMPLE IMAGES')
    print('='*60)
    
    # Load model
    print('\n📦 Loading model...')
    model = YOLO('../models/best.pt')
    print('✅ Model loaded successfully\n')
    
    # Test images
    test_images = [
        '../video/corn.jpg',
        '../video/tomato.jpg',
        '../video/apple.jpg'
    ]
    
    total_detections = 0
    
    # Process each image
    for img_path in test_images:
        img_name = Path(img_path).name
        print(f'📸 Processing: {img_name}')
        print('-' * 40)
        
        # Load image
        img = cv2.imread(img_path)
        
        if img is None:
            print(f'❌ Failed to load {img_name}\n')
            continue
        
        print(f'   Image size: {img.shape[1]}x{img.shape[0]}')
        
        # Run inference
        results = model.predict(img, conf=0.25, verbose=False)
        
        # Parse detections
        detections = results[0].boxes
        num_detections = len(detections)
        total_detections += num_detections
        
        print(f'   Detections: {num_detections}')
        
        if num_detections > 0:
            print()
            for i, box in enumerate(detections, 1):
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                cls_name = model.names[cls_id]
                
                # Get bounding box
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                print(f'   {i}. {cls_name}')
                print(f'      Confidence: {conf:.1%}')
                print(f'      BBox: ({int(x1)}, {int(y1)}) to ({int(x2)}, {int(y2)})')
            
            # Save annotated image
            output_path = f'../output/{img_name}'
            results[0].save(filename=output_path)
            print(f'\n   💾 Saved annotated image: {output_path}')
        else:
            print('   ⚠️ No detections found (try lower confidence threshold)')
        
        print()
    
    # Summary
    print('=' * 60)
    print('✅ TEST COMPLETE')
    print('=' * 60)
    print(f'Images processed: {len(test_images)}')
    print(f'Total detections: {total_detections}')
    print(f'Avg detections per image: {total_detections/len(test_images):.1f}')
    print('\n📁 Check the output/ folder for annotated images\n')

if __name__ == '__main__':
    try:
        test_model_on_images()
    except FileNotFoundError as e:
        print(f'\n❌ Error: {e}')
        print('Make sure model file exists at: models/best.pt')
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()

