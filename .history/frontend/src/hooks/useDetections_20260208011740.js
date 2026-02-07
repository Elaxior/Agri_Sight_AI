/**
 * useDetections Hook
 * Polls REST API for detection events (local mode - no Firebase required)
 */

import { useState, useEffect } from 'react';
import { getDetections } from '../utils/apiClient';

export function useDetections() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const clearDetections = () => {
    console.log('🧹 Clearing detections for new analysis');
    setDetections([]);
  };

  useEffect(() => {
    console.log('🔄 Connecting to API server...');
    
    let pollInterval;
    let loadingTimeout;

    const pollDetections = async () => {
      try {
        const data = await getDetections();
        
        if (data.detections && data.detections.length > 0) {
          // Sort by frame number (newest first)
          const sorted = [...data.detections].sort((a, b) => b.frame_id - a.frame_id);
          setDetections(sorted);
          setConnected(true);
          setLoading(false);
        } else if (!connected) {
          setConnected(true);
        }
      } catch (err) {
        console.error('❌ API polling error:', err);
        setError(err.message);
        setConnected(false);
      }
    };

    // Initial load
    pollDetections();

    // Set loading timeout
    loadingTimeout = setTimeout(() => {
      console.log('⏱️ Loading timeout - assuming no detections exist');
      setLoading(false);
      setConnected(true);
    }, 3000);

    // Poll every 2 seconds
    pollInterval = setInterval(pollDetections, 2000);

    // Cleanup
    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(pollInterval);
      console.log('🔄 Stopped polling API');
    };
  }, []);

  return { detections, loading, error, connected, clearDetections };
}

export function useLatestSession() {
  const [latestSessionId, setLatestSessionId] = useState(null);

  useEffect(() => {
    // For local mode, we can get session from the detections endpoint
    const fetchSession = async () => {
      try {
        const data = await getDetections();
        if (data.session_id) {
          setLatestSessionId(data.session_id);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      }
    };

    fetchSession();
    const interval = setInterval(fetchSession, 5000);

    return () => clearInterval(interval);
  }, []);

  return { latestSessionId };
}
