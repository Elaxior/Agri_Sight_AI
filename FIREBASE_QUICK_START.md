# 🎯 Quick Firebase Setup Checklist

Follow these steps to enable Firebase real-time mode:

---

## Step 1: Get Firebase Credentials (5 minutes)

### Backend (Python) - Service Account Key

1. **Go to Firebase Console:** https://console.firebase.google.com
2. **Select/Create your project**
3. **Click Settings ⚙️** → Project settings
4. **Go to "Service accounts" tab**
5. **Click "Generate new private key"**
6. **Download JSON file**
7. **Rename to:** `serviceAccountKey.json`
8. **Save to:** `drone_edge/credentials/serviceAccountKey.json`

### Frontend (React) - Web App Config

1. **In Firebase Console** → Settings ⚙️ → Project settings
2. **Scroll to "Your apps"**
3. **Click Web icon `</>`**
4. **Register app** (name: "Dashboard")
5. **Copy the firebaseConfig object**

---

## Step 2: Enable Realtime Database

1. **In Firebase Console** → Realtime Database (left sidebar)
2. **Click "Create Database"**
3. **Choose location** (e.g., asia-southeast1)
4. **Start in Test Mode** (for now)
5. **Click Enable**
6. **Copy your database URL** (looks like: `https://your-project-default-rtdb.firebaseio.com`)

---

## Step 3: Configure Backend

**Create file:** `drone_edge/.env`

```env
FIREBASE_CREDENTIALS_PATH=credentials/serviceAccountKey.json
FIREBASE_DATABASE_URL=https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com
```

**Replace `YOUR-PROJECT-ID`** with your actual Firebase project ID!

---

## Step 4: Configure Frontend

**Edit file:** `frontend/src/firebase/config.js`

Replace this section:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Replace with your actual key
  authDomain: "agri-drone-analytics.firebaseapp.com",
  databaseURL: "https://agri-drone-analytics-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agri-drone-analytics",
  storageBucket: "agri-drone-analytics.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

With YOUR values from Step 1!

---

## Step 5: Test Configuration

### Test Backend:
```bash
cd drone_edge/src
python -c "from firebase_client import FirebaseClient; FirebaseClient()"
```

Should show: `✅ Firebase connected successfully`

### Test Frontend:
Open browser console (F12) and look for: `🔥 Using Firebase real-time mode`

---

## Step 6: Restart Servers

### Stop current servers (Ctrl+C)

### Restart API Server:
```powershell
cd drone_edge\src
python api_server.py
```

Look for: `🔥 Firebase mode: ENABLED ✅`

### Restart Frontend:
```powershell
cd frontend
npm start
```

---

## ✅ Verification

Once configured correctly, you should see:

**API Server output:**
```
🔥 Firebase mode: ENABLED ✅
🌐 Server: http://localhost:5000
```

**Browser console:**
```
🔥 Using Firebase real-time mode
✅ Firebase connected
```

**Dashboard footer:**
```
🔥 Firebase Real-time • Powered by YOLOv8...
```

---

## 🎉 That's It!

Upload a video and watch detections stream in real-time!

**Difference from local mode:**
- ⚡ Instant updates (no 2-second delay)
- 🚀 Sub-500ms latency
- 📊 Multiple devices can view simultaneously
- 🔄 Automatic synchronization

---

## Need Help?

**Common Issues:**

1. **"Missing Firebase configuration"**
   - Check `.env` file exists in `drone_edge/`
   - Verify paths are correct

2. **"Permission denied"**
   - Use Test Mode rules in Firebase Console

3. **Frontend not updating**
   - Check `firebaseConfig` values
   - Verify `databaseURL` is correct
   - Check browser console for errors

---

**Full guide:** See `FIREBASE_SETUP_GUIDE.md` for detailed instructions!
