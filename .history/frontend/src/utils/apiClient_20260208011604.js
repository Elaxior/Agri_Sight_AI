/**
 * API Client
 * Communicates with Python backend API server
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Upload video file to backend
 */
export async function uploadVideo(file) {
  try {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_BASE_URL}/upload-video`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Start analysis on uploaded video
 */
export async function startAnalysis(videoPath) {
  try {
    const response = await fetch(`${API_BASE_URL}/start-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_path: videoPath }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Analysis error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current analysis status
 */
export async function getStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Status check error:', error);
    return { running: false, session_id: null };
  }
}

/**
 * Stop current analysis
 */
export async function stopAnalysis() {
  try {
    const response = await fetch(`${API_BASE_URL}/stop-analysis`, {
      method: 'POST',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Stop error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get detections from local storage
 */
export async function getDetections() {
  try {
    const response = await fetch(`${API_BASE_URL}/detections`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get detections error:', error);
    return { session_id: null, detections: [] };
  }
}

/**
 * Get session info
 */
export async function getSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/session`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get session error:', error);
    return { session_id: null, status: 'error' };
  }
}

/**
 * Health check
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check error:', error);
    return { status: 'error', message: error.message };
  }
}
