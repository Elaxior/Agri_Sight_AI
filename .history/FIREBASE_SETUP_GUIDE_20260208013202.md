# 🔥 Firebase Setup Guide

Complete guide to configure Firebase for real-time detection streaming.

---

## 📋 Prerequisites

- Active Firebase account
- Firebase project created
- Node.js and Python installed

---

## 🎯 Part 1: Firebase Console Setup

### Step 1: Create/Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select existing project
3. Name: `agri-drone-analytics` (or your choice)
4. Follow setup wizard

### Step 2: Enable Realtime Database

1. In Firebase Console, click "Realtime Database" in left sidebar
2. Click "Create Database"
3. Choose location: 
   - **US**: `us-central1`
   - **Europe**: `europe-west1`
   - **Asia**: `asia-southeast1` (Singapore)
4. Start in **Test Mode** (we'll secure it later)
5. Click "Enable"

### Step 3: Note Your Database URL

After creation, you'll see your database URL:
```
https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com
```
**Copy this URL** - you'll need it!

---

## 🔧 Part 2: Backend Configuration (Python)

### Step 1: Get Service Account Key

1. In Firebase Console → Settings ⚙️ → Project settings
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Rename it to `serviceAccountKey.json`
6. Move it to: `drone_edge/credentials/serviceAccountKey.json`

### Step 2: Create .env File

Create `drone_edge/.env` file:

```bash
cd drone_edge
```

Create file named `.env` with this content:

```env
# Backend Firebase Configuration
FIREBASE_CREDENTIALS_PATH=credentials/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com
```

**Replace `YOUR-PROJECT-ID`** with your actual project ID!

### Step 3: Verify File Structure

```
drone_edge/
├── .env                                    ← Create this
├── credentials/
│   └── serviceAccountKey.json             ← Place credentials here
├── src/
│   ├── api_server.py
│   ├── run_inference_firebase.py
│   └── ...
└── config.yaml
```

---

## 🌐 Part 3: Frontend Configuration (React)

### Step 1: Get Web App Configuration

1. In Firebase Console → Settings ⚙️ → Project settings
2. Scroll down to "Your apps"
3. Click "Web" icon `</>`
4. Register app: Name it "Dashboard" or "Frontend"
5. **Copy the config object** that appears

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefg123456"
};
```

### Step 2: Update Frontend Config

Edit `frontend/src/firebase/config.js`:

Replace the entire `firebaseConfig` object with YOUR values from Step 1.

---

## 🚀 Part 4: Update Code to Use Firebase

I'll now update the code to automatically detect and use Firebase if configured!

---

## ✅ Testing Your Setup

### Test 1: Check Backend Firebase Connection

```bash
cd drone_edge/src
python -c "from firebase_client import FirebaseClient; client = FirebaseClient(); print('✅ Connected!')"
```

Should output: `✅ Firebase connected successfully`

### Test 2: Run Full System

**Terminal 1 - API Server (will use Firebase if configured):**
```bash
cd drone_edge/src
python api_server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Upload a video and watch real-time detections stream! 🎉

---

## 🔐 Security Rules (Production)

After testing, secure your database:

1. In Firebase Console → Realtime Database → Rules
2. Replace with:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

Then implement Firebase Authentication in your app.

---

## 🆘 Troubleshooting

### "Missing Firebase configuration"
- Check `.env` file exists in `drone_edge/`
- Verify paths are correct
- Ensure `serviceAccountKey.json` exists

### "Permission denied"
- Check database rules allow read/write
- Use Test Mode for initial setup

### "Module not found: firebase_admin"
```bash
pip install firebase-admin
```

### Frontend not connecting
- Verify `firebaseConfig` in `frontend/src/firebase/config.js`
- Check `databaseURL` matches your database
- Inspect browser console for errors

---

## 📊 What You Get with Firebase

✅ **Real-time streaming** - Sub-500ms latency  
✅ **Automatic synchronization** - All clients update instantly  
✅ **Offline support** - Data syncs when reconnected  
✅ **Scalability** - Handles thousands of concurrent users  
✅ **No polling** - Push-based updates, more efficient  

---

## 🎯 Next Steps

Once Firebase is configured:

1. Test video upload and analysis
2. Watch detections stream in real-time
3. All dashboard panels update instantly
4. Multiple devices can view simultaneously

---

**Ready to start?** Follow the steps above and let me know if you need help with any configuration values! 🚀
