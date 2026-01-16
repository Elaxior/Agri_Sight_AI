
Agriculture YOLOv8 Model
========================

Model: YOLOv8s
Performance: 58% mAP@0.5
Classes: 30 plant diseases
Size: 22.5 MB

Files:
------
- agriculture_yolov8.pt (trained model)
- data.yaml (class names)

Usage:
------
from ultralytics import YOLO
model = YOLO('agriculture_yolov8.pt')
results = model.predict('image.jpg')

Deployment:
-----------
Move to: agri-drone-analytics/drone_edge/models/
