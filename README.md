# **🌾 AI-Powered Precision Agriculture Analytics Using Drone Imagery**

**A complete real-time crop disease detection and decision support system built with YOLOv8, Firebase, and React.**

***

## **📋 Table of Contents**

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup (Edge AI)](#2-backend-setup-edge-ai)
  - [3. Firebase Setup](#3-firebase-setup)
  - [4. Frontend Setup (Dashboard)](#4-frontend-setup-dashboard)
  - [5. Running the System](#5-running-the-system)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

***

## **🎯 Overview**

This system revolutionizes precision agriculture by combining:
- **Real-time AI detection** of crop diseases using drone imagery
- **Spatial intelligence** for precision spray path planning
- **Economic impact analysis** with ROI calculation
- **Multimodal fusion** of vision + sensor data
- **Intelligent alerts** and decision recommendations
- **Mission reporting** with complete audit trail

**Problem Solved:** Farmers lose 30-40% of crops to disease and waste 78% of chemicals by spraying entire fields. Our solution detects diseased zones in real-time and generates precision treatment paths, saving money and reducing environmental impact.

***

## **🏗️ System Architecture**

```
┌─────────────────┐
│  Drone Camera   │
│  (Image Feed)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Edge AI (YOLOv8)           │
│  - Real-time detection      │
│  - Runs on drone/ground PC  │
│  - No cloud dependency      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Firebase Realtime DB       │
│  - Event streaming          │
│  - Sub-500ms latency        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  React Dashboard            │
│  - Live map visualization   │
│  - Path planning            │
│  - Economic analysis        │
│  - Decision support         │
│  - PDF report generation    │
└─────────────────────────────┘
```

***

## **✨ Features**

### **Core Capabilities**
- ✅ Real-time crop disease detection using YOLOv8
- ✅ Live GPS-mapped visualization with Leaflet
- ✅ Automated precision spray path generation
- ✅ Economic impact & ROI calculation
- ✅ Multimodal fusion (vision + soil sensors)
- ✅ Intelligent alert system with prioritization
- ✅ Mission report generation (PDF export)
- ✅ Sub-500ms detection-to-dashboard latency

### **Dashboard Panels**
1. **Map View** - Interactive field map with drone position, detection pins, spray path overlay
2. **Spray Path Generator** - Automated path planning for infected zones
3. **Economic/ROI Panel** - Cost comparison, savings calculation, net benefit
4. **Multimodal Intelligence** - Fused diagnosis from vision + sensor data
5. **Analytics** - Detection statistics and disease distribution
6. **Detection Feed** - Live stream of all detections with confidence scores
7. **Alerts & Decisions** - Prioritized alerts with recommended actions

***

## **🛠️ Tech Stack**

### **Backend (Edge AI)**
- Python 3.8+
- YOLOv8 (Ultralytics)
- OpenCV
- Firebase Admin SDK
- NumPy

### **Frontend (Dashboard)**
- React 18
- React Leaflet (Maps)
- Firebase SDK
- jsPDF (Report generation)
- date-fns
- CSS3 Grid Layout

### **Infrastructure**
- Firebase Realtime Database
- Firebase Authentication (optional)
- Node.js 16+

***

## **📦 Prerequisites**

Before installation, ensure you have:

- **Python 3.8 or higher** ([Download](https://www.python.org/downloads/))
- **Node.js 16 or higher** ([Download](https://nodejs.org/))
- **npm or yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Firebase account** ([Sign up free](https://firebase.google.com/))
- **Webcam or video file** (for testing)
- **4GB+ RAM** (for YOLOv8 inference)

### **Check Installations**

```bash
python --version    # Should show 3.8+
node --version      # Should show 16+
npm --version       # Should show 8+
git --version       # Any recent version
```

***

## **📥 Installation Guide**

### **1. Clone Repository**

```bash
# Clone the project
git clone https://github.com/yourusername/precision-agriculture-analytics.git
cd precision-agriculture-analytics

# Project structure
# precision-agriculture-analytics/
# ├── backend/          # Edge AI inference
# ├── dashboard/        # React frontend
# ├── models/           # YOLOv8 weights
# └── README.md
```

***

### **2. Backend Setup (Edge AI)**

#### **Step 2.1: Create Python Virtual Environment**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Your prompt should now show (venv)
```

#### **Step 2.2: Install Python Dependencies**

```bash
# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install ultralytics opencv-python firebase-admin python-dotenv numpy pillow

# Verify installations
pip list
```

**Expected packages:**
```
ultralytics       8.0.0+
opencv-python     4.8.0+
firebase-admin    6.2.0+
python-dotenv     1.0.0+
numpy             1.24.0+
pillow            10.0.0+
```

#### **Step 2.3: Download YOLOv8 Model**

```bash
# Create models directory
mkdir -p ../models
cd ../models

# Option A: Use pre-trained YOLOv8 (for testing)
# The model will auto-download on first run

# Option B: Use custom-trained model (recommended for production)
# Place your trained weights here:
# models/crop_disease_yolov8.pt
```

#### **Step 2.4: Backend Configuration**

```bash
cd ../backend

# Create .env file
touch .env

# Edit .env with your settings
nano .env  # or use any text editor
```

**backend/.env content:**
```env
# Firebase Configuration
FIREBASE_CREDS_PATH=./firebase-credentials.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Video Source
VIDEO_SOURCE=0  # 0 for webcam, or path to video file
# VIDEO_SOURCE=test_videos/field_video.mp4

# Model Configuration
MODEL_PATH=../models/crop_disease_yolov8.pt
CONFIDENCE_THRESHOLD=0.5

# Session Configuration
SESSION_ID=FIELD-001
FIELD_CENTER_LAT=28.6139
FIELD_CENTER_LNG=77.2090
```

***

### **3. Firebase Setup**

#### **Step 3.1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `precision-agriculture`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

#### **Step 3.2: Enable Realtime Database**

1. In Firebase Console, go to **"Build" → "Realtime Database"**
2. Click **"Create Database"**
3. Select location: **United States** or closest to you
4. Start in **"Test mode"** (for development)
5. Click **"Enable"**

**Set up security rules:**
```json
{
  "rules": {
    ".read": "auth != null || true",
    ".write": "auth != null || true"
  }
}
```
⚠️ **Note:** For production, restrict access with proper authentication.

#### **Step 3.3: Generate Service Account Key**

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** (downloads JSON file)
5. Rename file to `firebase-credentials.json`
6. Move to `backend/` directory

```bash
# Move downloaded key to backend folder
mv ~/Downloads/your-project-firebase-adminsdk-xxxxx.json backend/firebase-credentials.json

# Verify file exists
ls backend/firebase-credentials.json
```

#### **Step 3.4: Get Database URL**

1. In Realtime Database page, copy the database URL
2. It looks like: `https://your-project-default-rtdb.firebaseio.com/`
3. Update `FIREBASE_DATABASE_URL` in `backend/.env`

***

### **4. Frontend Setup (Dashboard)**

#### **Step 4.1: Install Node Dependencies**

```bash
cd dashboard

# Install all npm packages
npm install

# This installs:
# - react
# - react-leaflet
# - leaflet
# - firebase
# - jspdf
# - date-fns
# - and all other dependencies
```

**If you get errors, try:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Step 4.2: Configure Firebase in Frontend**

```bash
# Get Firebase config from Firebase Console
# Project Settings → General → Your apps → Web app

# Create .env file
touch .env.local

# Edit .env.local
nano .env.local
```

**dashboard/.env.local content:**
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

**To get Firebase config:**
1. Firebase Console → Project Settings
2. Scroll to **"Your apps"** section
3. Click **"Web app"** icon (</>)
4. Copy the config values

#### **Step 4.3: Update Firebase Config File**

Edit `dashboard/src/firebase/config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
```

***

### **5. Running the System**

#### **Step 5.1: Start Backend (Edge AI)**

```bash
cd backend

# Activate virtual environment if not already active
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Run inference
python inference.py

# Expected output:
# ✅ Firebase initialized
# ✅ YOLOv8 model loaded
# 🎥 Video source opened
# 📡 Streaming detections to Firebase...
```

#### **Step 5.2: Start Frontend (Dashboard)**

**Open a NEW terminal window:**

```bash
cd dashboard

# Start React development server
npm start

# Dashboard will open automatically at:
# http://localhost:3000

# Expected output:
# Compiled successfully!
# webpack compiled with 0 warnings
# Dashboard running on http://localhost:3000
```

#### **Step 5.3: Verify System is Working**

1. **Backend Terminal:** Should show detections being processed
   ```
   Frame 45 | Detections: 3 | Uploaded to Firebase ✅
   Frame 46 | Detections: 2 | Uploaded to Firebase ✅
   ```

2. **Dashboard:** Should show:
   - ✅ **LIVE** connection badge (green)
   - ✅ Detection markers appearing on map
   - ✅ Detection feed updating in real-time
   - ✅ Live metrics incrementing

***

## **📁 Project Structure**

```
precision-agriculture-analytics/
│
├── backend/                      # Edge AI inference
│   ├── inference.py              # Main detection script
│   ├── firebase_handler.py       # Firebase upload logic
│   ├── gps_simulator.py          # GPS coordinate generation
│   ├── firebase-credentials.json # Service account key (private)
│   ├── .env                      # Environment variables
│   ├── requirements.txt          # Python dependencies
│   └── venv/                     # Virtual environment
│
├── dashboard/                    # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Main dashboard component
│   │   │   ├── MapView.jsx       # Interactive map
│   │   │   ├── PathPlanningPanel.jsx
│   │   │   ├── EconomicImpactPanel.jsx
│   │   │   ├── FusionInsightPanel.jsx
│   │   │   ├── AlertsDecisionPanel.jsx
│   │   │   ├── DetectionFeed.jsx
│   │   │   ├── StatsPanel.jsx
│   │   │   ├── LiveStatus.jsx
│   │   │   └── MissionReportPanel.jsx
│   │   ├── hooks/
│   │   │   └── useDetections.js  # Firebase data subscription
│   │   ├── utils/
│   │   │   ├── pathPlanner.js    # Spray path algorithm
│   │   │   ├── economicCalculator.js
│   │   │   ├── fusionEngine.js
│   │   │   ├── alertRuleEngine.js
│   │   │   └── reportGenerator.js
│   │   ├── firebase/
│   │   │   └── config.js         # Firebase client config
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.local                # Firebase config (private)
│   ├── package.json
│   └── package-lock.json
│
├── models/                       # YOLOv8 model weights
│   └── crop_disease_yolov8.pt
│
├── test_videos/                  # Sample videos for testing
│   └── field_video.mp4
│
└── README.md                     # This file
```

***

## **⚙️ Configuration**

### **Backend Configuration (backend/.env)**

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_CREDS_PATH` | Path to service account JSON | `./firebase-credentials.json` |
| `FIREBASE_DATABASE_URL` | Firebase Realtime DB URL | `https://project.firebaseio.com` |
| `VIDEO_SOURCE` | Video input (0=webcam, path=file) | `0` or `test_videos/field.mp4` |
| `MODEL_PATH` | YOLOv8 model weights path | `../models/crop_disease_yolov8.pt` |
| `CONFIDENCE_THRESHOLD` | Detection confidence filter | `0.5` (0.0 to 1.0) |
| `SESSION_ID` | Mission/field identifier | `FIELD-001` |
| `FIELD_CENTER_LAT` | Field center latitude | `28.6139` |
| `FIELD_CENTER_LNG` | Field center longitude | `77.2090` |

### **Frontend Configuration (dashboard/.env.local)**

All variables must start with `REACT_APP_`:

| Variable | Description |
|----------|-------------|
| `REACT_APP_FIREBASE_API_KEY` | Firebase Web API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REACT_APP_FIREBASE_DATABASE_URL` | Realtime Database URL |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Storage bucket URL |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |

***

## **📖 Usage Guide**

### **Basic Workflow**

1. **Start Backend** - Begin inference on drone/ground station
2. **Open Dashboard** - Monitor detections in real-time
3. **Analyze Field** - Watch detection markers populate map
4. **Generate Path** - Click "Generate Precision Path" button
5. **Review Economics** - Check ROI and cost savings
6. **Check Alerts** - Review prioritized recommendations
7. **Generate Report** - Click "Generate Mission Report" for PDF

### **Using with Real Drone**

```python
# In backend/inference.py, modify video source:

# Option 1: RTSP stream from drone
VIDEO_SOURCE = "rtsp://drone_ip:8554/stream"

# Option 2: USB camera
VIDEO_SOURCE = 0

# Option 3: IP camera
VIDEO_SOURCE = "http://camera_ip:8080/video"
```

### **Testing with Sample Data**

```bash
# Place test video in test_videos/
cp /path/to/your/video.mp4 test_videos/field_video.mp4

# Update backend/.env
VIDEO_SOURCE=test_videos/field_video.mp4

# Run backend
python inference.py
```

***

## **🔧 Troubleshooting**

### **Common Issues**

#### **1. "Firebase initialization failed"**

**Symptom:** Backend crashes with authentication error

**Solution:**
```bash
# Verify credentials file exists
ls backend/firebase-credentials.json

# Check .env has correct path
cat backend/.env | grep FIREBASE_CREDS_PATH

# Ensure Firebase Admin SDK is installed
pip show firebase-admin
```

***

#### **2. "Dashboard shows OFFLINE"**

**Symptom:** Connection badge is red, no data flowing

**Solution:**
```bash
# Check backend is running
# Backend terminal should show "Streaming detections..."

# Verify Firebase Database URL matches in both:
# - backend/.env
# - dashboard/.env.local

# Check Firebase Realtime Database rules allow read/write

# Test Firebase connection in browser console:
# Open dashboard → F12 → Console → Check for errors
```

***

#### **3. "YOLOv8 model not found"**

**Symptom:** `FileNotFoundError: model path not found`

**Solution:**
```bash
# Option A: Let YOLOv8 auto-download
# In inference.py, use:
model = YOLO('yolov8n.pt')  # Auto-downloads

# Option B: Download manually
cd models
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt

# Update MODEL_PATH in .env
MODEL_PATH=../models/yolov8n.pt
```

***

#### **4. "Camera not opening"**

**Symptom:** `Error: Cannot open video source`

**Solution:**
```bash
# Test camera access
python -c "import cv2; print(cv2.VideoCapture(0).read())"

# Try different camera indices
VIDEO_SOURCE=1  # or 2, 3, etc.

# On Linux, check permissions
sudo usermod -a -G video $USER
# Logout and login again

# On macOS, grant terminal camera access
# System Preferences → Security & Privacy → Camera
```

***

#### **5. "npm install fails"**

**Symptom:** Dependency installation errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Update npm
npm install -g npm@latest

# Reinstall
npm install

# If still failing, use yarn
npm install -g yarn
yarn install
```

***

#### **6. "Port 3000 already in use"**

**Symptom:** `Something is already running on port 3000`

**Solution:**
```bash
# Option A: Kill process on port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option B: Use different port
PORT=3001 npm start
```

***

#### **7. "Map not loading"**

**Symptom:** Blank white panel where map should be

**Solution:**
```bash
# Check Leaflet CSS is imported
# In dashboard/src/index.js or App.js:
import 'leaflet/dist/leaflet.css';

# Verify internet connection (map tiles load from OpenStreetMap)

# Check browser console for errors
# F12 → Console → Look for 404 errors

# Try clearing browser cache
# Ctrl+Shift+R (hard refresh)
```

***

#### **8. "GPS coordinates all the same"**

**Symptom:** All detection markers at same location

**Solution:**
```bash
# This is normal if using simulated GPS
# GPS simulator adds random offsets to FIELD_CENTER

# To use real GPS:
# 1. Ensure drone sends GPS in detection payload
# 2. Modify backend/inference.py to include actual GPS
# 3. Remove GPS enrichment from Dashboard.jsx
```

***

### **Performance Optimization**

#### **Slow Inference Speed**

```bash
# Use smaller YOLOv8 model
model = YOLO('yolov8n.pt')  # Nano (fastest)
# vs
model = YOLO('yolov8x.pt')  # Extra large (slowest)

# Reduce frame processing
# In inference.py, skip frames:
if frame_count % 3 == 0:  # Process every 3rd frame
    results = model(frame)
```

#### **High Memory Usage**

```python
# In inference.py, add:
import gc
gc.collect()  # Periodically free memory

# Reduce detection history retention
# In Dashboard.jsx:
const recentDetections = detections.slice(0, 20)  # Keep only 20
```

***

## **🌐 API Reference**

### **Firebase Data Structure**

```json
{
  "detections": {
    "SESSION-ID": {
      "detection-uuid-1": {
        "frame_id": 123,
        "timestamp": "2026-01-17T01:50:00.000Z",
        "detection_count": 2,
        "detections": [
          {
            "class_name": "Early Blight",
            "confidence": 0.87,
            "bbox": [100, 150, 200, 250]
          }
        ],
        "gps": {
          "lat": 28.6145,
          "lng": 77.2095
        }
      }
    }
  }
}
```

### **Detection Object Schema**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique detection ID (UUID) |
| `frame_id` | integer | Video frame number |
| `timestamp` | ISO 8601 | Detection timestamp |
| `detection_count` | integer | Number of diseases in frame |
| `detections` | array | List of detected diseases |
| `gps` | object | GPS coordinates {lat, lng} |

### **Disease Detection Schema**

| Field | Type | Description |
|-------|------|-------------|
| `class_name` | string | Disease name |
| `confidence` | float | Confidence score (0.0-1.0) |
| `bbox` | array | Bounding box [x1, y1, x2, y2] |

***

## **🤝 Contributing**

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/your-feature`
3. **Commit changes:** `git commit -m 'Add your feature'`
4. **Push to branch:** `git push origin feature/your-feature`
5. **Submit Pull Request**

### **Development Setup**

```bash
# Install development dependencies
pip install black flake8 pytest  # Python
npm install --save-dev eslint prettier  # JavaScript

# Run linters
black backend/  # Format Python code
npm run lint  # Format JavaScript
```

***

## **📄 License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

***

## **🙏 Acknowledgments**

- **Ultralytics** - YOLOv8 framework
- **Firebase** - Real-time database
- **React Leaflet** - Interactive maps
- **OpenStreetMap** - Map tile provider

***

## **📞 Support**

- **Issues:** [GitHub Issues](https://github.com/yourusername/precision-agriculture-analytics/issues)
- **Email:** support@yourproject.com
- **Documentation:** [Wiki](https://github.com/yourusername/precision-agriculture-analytics/wiki)

***

## **🚀 Roadmap**

- [ ] Multi-drone support
- [ ] Offline mode with local database
- [ ] Mobile app (React Native)
- [ ] Weather API integration
- [ ] Historical data analytics
- [ ] Automated drone control API
- [ ] Multi-language support

***

**Built with ❤️ for sustainable agriculture**