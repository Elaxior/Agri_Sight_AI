/**
 * API Client
 * Communicates with Netlify Functions backend
 */

/**
 * Upload video file to backend
 */
export async function uploadVideo(file) {
  try {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch("/.netlify/functions/uploadVideo", {
      method: "POST",
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
    const response = await fetch("/.netlify/functions/startAnalysis", {
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
    const response = await fetch("/.netlify/functions/getStatus");
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
    const response = await fetch("/.netlify/functions/stopAnalysis", {
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
 * Clear all detection data
 */
export async function clearData() {
  try {
    const response = await fetch("/.netlify/functions/clearData", {
      method: 'POST',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Clear data error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get detections from local storage
 */
export async function getDetections() {
  try {
    const response = await fetch("/.netlify/functions/getDetections");
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
    const response = await fetch("/.netlify/functions/getSession");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get session error:', error);
    return { session_id: null, status: 'error' };
  }
}

/**
 * Get current operation mode
 */
export async function getMode() {
  try {
    const response = await fetch("/.netlify/functions/getMode");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get mode error:', error);
    return { mode: 'local', firebase_enabled: false };
  }
}

/**
 * Health check
 */
export async function checkHealth() {
  try {
    const response = await fetch("/.netlify/functions/checkHealth");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check error:', error);
    return { status: 'error', message: error.message };
  }
}
