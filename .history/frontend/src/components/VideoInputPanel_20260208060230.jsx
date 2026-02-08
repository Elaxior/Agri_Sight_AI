/**
 * VideoInputPanel Component
 * Handles video upload and triggers new analysis
 * Supports compact mode for header integration
 */

import React, { useState, useRef } from 'react';
import { uploadVideo, startAnalysis, getStatus } from '../utils/apiClient';
import './VideoInputPanel.css';

const VideoInputPanel = ({ onAnalysisStarted, onAnalysisComplete, compact = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [currentVideo, setCurrentVideo] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv)$/i)) {
        setMessage('❌ Invalid file type. Please select MP4, AVI, MOV, or MKV');
        return;
      }
      
      setSelectedFile(file);
      setMessage(`📹 Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setMessage('❌ Please select a video file first');
      return;
    }

    try {
      // Step 1: Upload video
      setUploading(true);
      setMessage('📤 Uploading video...');
      setUploadProgress(30);

      const uploadResult = await uploadVideo(selectedFile);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadProgress(60);
      setMessage(`✅ Uploaded: ${uploadResult.filename}`);
      setCurrentVideo(uploadResult.filename);

      // Step 2: Start analysis
      setUploading(false);
      setAnalyzing(true);
      setMessage('🔄 Starting AI analysis...');
      setUploadProgress(80);

      const analysisResult = await startAnalysis(uploadResult.filepath);
      
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed to start');
      }

      setUploadProgress(100);
      setMessage(`✅ Analysis started! Session: ${analysisResult.session_id}`);

      // Notify parent component
      if (onAnalysisStarted) {
        onAnalysisStarted(analysisResult.session_id);
      }

      // Poll for analysis status
      pollAnalysisStatus();

    } catch (error) {
      console.error('Error:', error);
      setMessage(`❌ Error: ${error.message}`);
      setUploading(false);
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const pollAnalysisStatus = async () => {
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 60; // 3 minutes max (60 * 3s)
    let pollIntervalId = null;

    const checkStatus = async () => {
      try {
        pollAttempts++;
        const status = await getStatus();
        
        // Check if completed explicitly
        if (status.completed || (!status.running && pollAttempts > 5)) {
          // Analysis completed
          setAnalyzing(false);
          setMessage('✅ Analysis complete! View results below');
          setUploadProgress(0);
          setSelectedFile(null);
          
          if (pollIntervalId) {
            clearInterval(pollIntervalId);
          }
          
          if (onAnalysisComplete) {
            onAnalysisComplete();
          }
          return;
        }
        
        // Check for timeout
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          setAnalyzing(false);
          setMessage('⚠️ Analysis timeout. Please check backend logs.');
          setUploadProgress(0);
          
          if (pollIntervalId) {
            clearInterval(pollIntervalId);
          }
          return;
        }
      } catch (error) {
        console.error('Status check error:', error);
        pollAttempts++;
        
        // Stop after too many errors
        if (pollAttempts >= 10) {
          setAnalyzing(false);
          setMessage('❌ Error checking status. Please refresh.');
          setUploadProgress(0);
          
          if (pollIntervalId) {
            clearInterval(pollIntervalId);
          }
        }
      }
    };

    // Initial check after 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    await checkStatus();
    
    // Then poll every 3 seconds
    pollIntervalId = setInterval(checkStatus, 3000);
    
    // Cleanup on component unmount
    return () => {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  };

  return (
    <div className="video-input-panel panel-card">
      <div className="panel-header">
        <h3>📹 Input Drone Video</h3>
        <span className="panel-badge">Upload & Analyze</span>
      </div>

      <div className="panel-content">
        <div className="upload-section">
          <label className="file-input-label">
            <input
              type="file"
              accept="video/mp4,video/avi,video/quicktime,video/x-matroska,.mp4,.avi,.mov,.mkv"
              onChange={handleFileSelect}
              disabled={uploading || analyzing}
              className="file-input"
            />
            <span className="file-input-button">
              {selectedFile ? '📁 Change Video' : '📁 Select Video File'}
            </span>
          </label>

          {selectedFile && (
            <div className="file-info">
              <p><strong>File:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          )}

          <button
            className="analyze-button"
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || uploading || analyzing}
          >
            {uploading ? '📤 Uploading...' : analyzing ? '🔄 Analyzing...' : '🚀 Upload & Analyze'}
          </button>

          {(uploading || analyzing) && uploadProgress > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {message && (
            <div className={`status-message ${message.includes('❌') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {currentVideo && !analyzing && (
            <div className="current-video-info">
              <p><strong>Current Video:</strong> {currentVideo}</p>
            </div>
          )}
        </div>

        <div className="info-section">
          <h4>ℹ️ Instructions</h4>
          <ul>
            <li>Select a drone video file (MP4, AVI, MOV, MKV)</li>
            <li>Click "Upload & Analyze" to start processing</li>
            <li>YOLOv8 will analyze the video in real-time</li>
            <li>All panels will refresh with new detections</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoInputPanel;
