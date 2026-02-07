/**
 * useDetections Hook
 * Auto-detects mode: Firebase real-time or REST API polling
 */

import { useState, useEffect } from 'react';
import { getDetections, getMode } from '../utils/apiClient';

// Try to import Firebase (will fail gracefully if not configured)
let database, ref, onChildAdded, onValue;
try {
  const firebaseConfig = require('../firebase/config');
  database = firebaseConfig.database;
  ref = firebaseConfig.ref;
  onChildAdded = firebaseConfig.onChildAdded;
  onValue = firebaseConfig.onValue;
} catch (e) {
  console.log('Firebase not configured, will use REST API mode');
}

export function useDetections() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState('local'); // 'firebase' or 'local'

  const clearDetections = () => {
    console.log('🧹 Clearing detections for new analysis');
    setDetections([]);
  };

  useEffect(() => {
    let cleanup;

    const initializeConnection = async () => {
      // Check server mode
      const modeInfo = await getMode();
      setMode(modeInfo.mode);

      if (modeInfo.mode === 'firebase' && database) {
        console.log('🔥 Using Firebase real-time mode');
        cleanup = initializeFirebaseMode();
      } else {
        console.log('🔄 Using REST API polling mode');
        cleanup = initializePollingMode();
      }
    };

    const initializeFirebaseMode = () => {
      // Monitor connection status
      const connectedRef = ref(database, '.info/connected');
      const connectionUnsubscribe = onValue(connectedRef, (snapshot) => {
        const isConnected = snapshot.val() === true;
        setConnected(isConnected);
        if (isConnected) {
          console.log('✅ Firebase connected');
        }
      });

      const loadingTimeout = setTimeout(() => {
        console.log('⏱️ Loading timeout');
        setLoading(false);
      }, 3000);

      // Listen for new detections
      const detectionsRef = ref(database, '/detections');
      const detectionsUnsubscribe = onChildAdded(detectionsRef, (snapshot) => {
        const data = snapshot.val();
        const key = snapshot.key;

        const detection = {
          id: key,
          ...data,
          timestamp: data.timestamp || new Date().toISOString()
        };

        console.log('📊 New detection:', detection.frame_id);
        setDetections(prev => [detection, ...prev]);
        clearTimeout(loadingTimeout);
        setLoading(false);
      }, (error) => {
        console.error('❌ Firebase error:', error);
        setError(error.message);
        clearTimeout(loadingTimeout);
        setLoading(false);
      });

      return () => {
        console.log('🔥 Disconnecting Firebase listeners...');
        clearTimeout(loadingTimeout);
        connectionUnsubscribe();
        detectionsUnsubscribe();
      };
    };

    const initializePollingMode = () => {
      let pollInterval;
      let loadingTimeout;

      const pollDetections = async () => {
        try {
          const data = await getDetections();
          
          if (data.detections && data.detections.length > 0) {
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

      pollDetections();

      loadingTimeout = setTimeout(() => {
        console.log('⏱️ Loading timeout');
        setLoading(false);
        setConnected(true);
      }, 3000);

      pollInterval = setInterval(pollDetections, 2000);

      return () => {
        clearTimeout(loadingTimeout);
        clearInterval(pollInterval);
        console.log('🔄 Stopped polling API');
      };
    };

    initializeConnection();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return { detections, loading, error, connected, clearDetections, mode };
}

export function useLatestSession() {
  const [latestSessionId, setLatestSessionId] = useState(null);
  const [mode, setMode] = useState('local');

  useEffect(() => {
    const initialize = async () => {
      const modeInfo = await getMode();
      setMode(modeInfo.mode);

      if (modeInfo.mode === 'firebase' && database) {
        // Firebase mode
        const sessionsRef = ref(database, '/sessions');
        const unsubscribe = onValue(sessionsRef, (snapshot) => {
          const sessions = snapshot.val();
          if (sessions) {
            const sessionIds = Object.keys(sessions);
            const latest = sessionIds.sort((a, b) => {
              const timeA = sessions[a].start_time;
              const timeB = sessions[b].start_time;
              return timeB.localeCompare(timeA);
            })[0];
            setLatestSessionId(latest);
          }
        });
        return () => unsubscribe();
      } else {
        // Polling mode
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
      }
    };

    initialize();
  }, []);

  return { latestSessionId };
}
