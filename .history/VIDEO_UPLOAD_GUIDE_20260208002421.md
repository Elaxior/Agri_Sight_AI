# Video Upload Feature - Setup & Usage Guide

## Overview
The video upload feature allows you to upload drone videos through the web interface and automatically trigger YOLOv8 analysis. All dashboard panels will refresh with new detection results.

---

## Setup Instructions

### 1. Install Backend Dependencies
```bash
cd drone_edge
pip install flask==3.0.0 flask-cors==4.0.0
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### 2. Start the Backend API Server
Open a new terminal and run:
```bash
cd drone_edge/src
python api_server.py
```

You should see:
```
🚀 Starting API Server
================================================
📁 Upload directory: C:\...\drone_edge\video\uploads
⚙️  Config path: C:\...\drone_edge\config.yaml
🌐 Server: http://localhost:5000
================================================
```

**Important:** Keep this terminal open - the API server must be running!

### 3. Start the Frontend
In another terminal:
```bash
cd frontend
npm start
```

The React app will open at `http://localhost:3000`

---

## How to Use

### Upload and Analyze Video

1. **Select Video File**
   - Click "📁 Select Video File" button in the "Input Drone Video" panel
   - Choose a video file (.mp4, .avi, .mov, .mkv)
   - File info will be displayed

2. **Upload & Analyze**
   - Click "🚀 Upload & Analyze" button
   - Progress bar will show upload/analysis status
   - Wait for "Analysis started!" message

3. **View Results**
   - Detections will stream in real-time to all dashboard panels
   - Map will show detection markers
   - Statistics will update automatically
   - Economic analysis will refresh
   - All panels will display data from the new video

### What Happens Behind the Scenes

1. Video is uploaded to `drone_edge/video/uploads/`
2. Backend clears old Firebase data
3. `config.yaml` is updated with new video path
4. YOLOv8 inference starts automatically
5. Detections stream to Firebase in real-time
6. Frontend receives detections and updates all panels

---

## Architecture

```
Frontend (React)
    ↓ Upload Video
Backend API Server (Flask)
    ↓ Save Video
    ↓ Update config.yaml
    ↓ Start Inference
YOLOv8 Engine
    ↓ Process Video
    ↓ Stream Detections
Firebase Realtime DB
    ↓ Push Updates
Frontend Dashboard
    ↓ All Panels Refresh
```

---

## Troubleshooting

### API Server Not Connecting
- Check if API server is running on port 5000
- Look for `🌐 Server: http://localhost:5000` message
- Try: `curl http://localhost:5000/health`

### Upload Fails
- Check file size (large videos take longer)
- Verify file format (.mp4, .avi, .mov, .mkv)
- Check API server terminal for error messages

### Analysis Doesn't Start
- Check if `run_inference_firebase.py` works standalone
- Verify Firebase credentials are configured
- Check Python environment has all dependencies

### Frontend Shows Old Data
- Wait 3-5 seconds for Firebase to clear
- Refresh browser if detections seem stuck
- Check browser console for errors (F12)

---

## Testing the Feature

### Quick Test:
1. Start API server: `python drone_edge/src/api_server.py`
2. Start frontend: `cd frontend && npm start`
3. Upload the default test video or any drone footage
4. Watch the dashboard panels populate with detections

---

## Files Created/Modified

### New Files:
- `drone_edge/src/api_server.py` - Flask API server
- `frontend/src/components/VideoInputPanel.jsx` - Upload UI
- `frontend/src/components/VideoInputPanel.css` - Styling
- `frontend/src/utils/apiClient.js` - API communication
- `drone_edge/video/uploads/` - Upload directory

### Modified Files:
- `frontend/src/components/Dashboard.jsx` - Added VideoInputPanel
- `frontend/src/hooks/useDetections.js` - Added clearDetections()
- `drone_edge/requirements.txt` - Added Flask dependencies

---

## Notes

- Each video analysis creates a new Firebase session
- Old data is automatically cleared before new analysis
- Videos are saved permanently in `uploads/` folder
- API server must run alongside React frontend
- All existing functionality remains unchanged

---

## Next Steps (Optional Enhancements)

- Add video preview before upload
- Show inference progress percentage
- Display analysis statistics in real-time
- Add video thumbnail generation
- Enable video history/library
- Add support for live webcam input

---

**Ready to test!** Start both servers and upload your first drone video! 🚀
