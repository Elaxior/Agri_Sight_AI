"""
api_server.py
=============
Flask API server for video upload and inference management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import os
import yaml
import subprocess
import threading
import time
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

# Check if Firebase is configured
FIREBASE_ENABLED = bool(
    os.getenv('FIREBASE_CREDENTIALS_PATH') and 
    os.getenv('FIREBASE_DATABASE_URL')
)

if FIREBASE_ENABLED:
    try:
        from firebase_client import FirebaseClient
        print("🔥 Firebase mode: ENABLED")
    except Exception as e:
        print(f"⚠️ Firebase import failed: {e}")
        FIREBASE_ENABLED = False
        print("📁 Firebase mode: DISABLED - Using local mode")
else:
    print("📁 Firebase mode: DISABLED - Using local mode")

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
BASE_DIR = Path(__file__).resolve().parent.parent
VIDEO_UPLOAD_DIR = BASE_DIR / "video" / "uploads"
CONFIG_PATH = BASE_DIR / "config.yaml"

# Ensure upload directory exists
VIDEO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Global state
current_analysis = {
    "running": False,
    "session_id": None,
    "video_name": None,
    "start_time": None,
    "process": None
}


def clear_data():
    """Clear old data before new analysis - Firebase or local."""
    if FIREBASE_ENABLED:
        try:
            client = FirebaseClient()
            client.set_data('/detections', None)
            client.set_data('/frames', None)
            print("🔥 Firebase data cleared")
        except Exception as e:
            print(f"⚠️ Firebase clear failed: {e}")
    else:
        try:
            output_dir = BASE_DIR / "output"
            detections_file = output_dir / "current_detections.json"
            session_file = output_dir / "current_session.json"
            
            if detections_file.exists():
                detections_file.unlink()
            if session_file.exists():
                session_file.unlink()
            
            print("📁 Local detection data cleared")
        except Exception as e:
            print(f"⚠️ Local clear failed: {e}")


def update_config_video_path(video_path):
    """Update config.yaml with new video path."""
    with open(CONFIG_PATH, 'r') as f:
        config = yaml.safe_load(f)
    
    # Update video path (relative to drone_edge/)
    relative_path = os.path.relpath(video_path, BASE_DIR)
    config['video']['input_path'] = relative_path.replace('\\', '/')
    
    with open(CONFIG_PATH, 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    print(f"✅ Config updated: {relative_path}")


def run_inference_background(video_path):
    """Run inference in background thread."""
    try:
        # Update config
        update_config_video_path(video_path)
        
        # Choose script based on Firebase availability
        if FIREBASE_ENABLED:
            script_name = "run_inference_firebase.py"
            print(f"🔥 Using Firebase mode")
        else:
            script_name = "run_inference_local.py"
            print(f"📁 Using local mode")
        
        script_path = BASE_DIR / "src" / script_name
        python_exec = "python"
        
        cmd = [python_exec, str(script_path)]
        
        print(f"🚀 Starting inference: {' '.join(cmd)}")
        
        # Run in subprocess with proper encoding
        process = subprocess.Popen(
            cmd,
            cwd=str(BASE_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        
        current_analysis["process"] = process
        
        # Wait for process to complete
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            print("✅ Inference completed successfully")
        else:
            print(f"❌ Inference failed with code {process.returncode}")
            print(f"Error: {stderr}")
        
        current_analysis["running"] = False
        
    except Exception as e:
        print(f"❌ Error running inference: {e}")
        current_analysis["running"] = False


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "API server is running"})


@app.route('/upload-video', methods=['POST'])
def upload_video():
    """Handle video file upload."""
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
        
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Validate file extension
        allowed_extensions = {'.mp4', '.avi', '.mov', '.mkv'}
        file_ext = Path(video_file.filename).suffix.lower()
        
        if file_ext not in allowed_extensions:
            return jsonify({"error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"}), 400
        
        # Save with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"upload_{timestamp}{file_ext}"
        filepath = VIDEO_UPLOAD_DIR / filename
        
        video_file.save(str(filepath))
        
        print(f"✅ Video uploaded: {filename}")
        
        return jsonify({
            "success": True,
            "filename": filename,
            "filepath": str(filepath),
            "size_mb": round(filepath.stat().st_size / (1024 * 1024), 2)
        })
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/start-analysis', methods=['POST'])
def start_analysis():
    """Start YOLOv8 inference on uploaded video."""
    try:
        if current_analysis["running"]:
            return jsonify({"error": "Analysis already in progress"}), 400
        
        data = request.json
        video_path = data.get('video_path')
        
        if not video_path:
            return jsonify({"error": "No video path provided"}), 400
        
        video_path = Path(video_path)
        
        if not video_path.exists():
            return jsonify({"error": "Video file not found"}), 404
        
        # Generate session ID
        session_id = f"session_{int(time.time())}"
        
        # Clear old data (Firebase or local)
        clear_data()
        
        # Update global state
        current_analysis["running"] = True
        current_analysis["session_id"] = session_id
        current_analysis["video_name"] = video_path.name
        current_analysis["start_time"] = datetime.now().isoformat()
        
        # Start inference in background thread
        thread = threading.Thread(
            target=run_inference_background,
            args=(video_path,),
            daemon=True
        )
        thread.start()
        
        print(f"🚀 Analysis started: {session_id}")
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "video_name": video_path.name,
            "message": "Analysis started"
        })
        
    except Exception as e:
        print(f"❌ Analysis start error: {e}")
        current_analysis["running"] = False
        return jsonify({"error": str(e)}), 500


@app.route('/status', methods=['GET'])
def get_status():
    """Get current analysis status."""
    return jsonify({
        "running": current_analysis["running"],
        "session_id": current_analysis["session_id"],
        "video_name": current_analysis["video_name"],
        "start_time": current_analysis["start_time"]
    })


@app.route('/stop-analysis', methods=['POST'])
def stop_analysis():
    """Stop current analysis."""
    try:
        if current_analysis["process"] and current_analysis["running"]:
            current_analysis["process"].terminate()
            current_analysis["running"] = False
            return jsonify({"success": True, "message": "Analysis stopped"})
        else:
            return jsonify({"success": False, "message": "No analysis running"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/detections', methods=['GET'])
def get_detections():
    """Get current detections from local storage."""
    try:
        output_dir = BASE_DIR / "output"
        detections_file = output_dir / "current_detections.json"
        
        if not detections_file.exists():
            return jsonify({
                "session_id": None,
                "detections": []
            })
        
        with open(detections_file, 'r') as f:
            data = json.load(f)
        
        return jsonify(data)
    except Exception as e:
        print(f"❌ Error reading detections: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/session', methods=['GET'])
def get_session():
    """Get current session info."""
    try:
        output_dir = BASE_DIR / "output"
        session_file = output_dir / "current_session.json"
        
        if not session_file.exists():
            return jsonify({
                "session_id": None,
                "status": "no_session"
            })
        
        with open(session_file, 'r') as f:
            data = json.load(f)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/mode', methods=['GET'])
def get_mode():
    """Get current operation mode (firebase or local)."""
    return jsonify({
        "mode": "firebase" if FIREBASE_ENABLED else "local",
        "firebase_enabled": FIREBASE_ENABLED
    })f"🔥 Firebase mode: {'ENABLED ✅' if FIREBASE_ENABLED else 'DISABLED (using local mode) 📁'}")
    print(


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Starting API Server")
    print("="*60)
    print(f"📁 Upload directory: {VIDEO_UPLOAD_DIR}")
    print(f"⚙️  Config path: {CONFIG_PATH}")
    print("🌐 Server: http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
