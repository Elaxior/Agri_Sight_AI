/**
 * useDetections Hook
 * Listens to Firebase real-time detection events
 */

import { useState, useEffect } from 'react';
import { database, ref, onChildAdded, onValue } from '../firebase/config';

export function useDetections() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('🔥 Connecting to Firebase...');

    // Monitor connection status
    const connectedRef = ref(database, '.info/connected');
    const connectionUnsubscribe = onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val() === true;
      setConnected(isConnected);
      
      if (isConnected) {
        console.log('✅ Firebase connected');
      }
    });

    // ✅ NEW: Set a timeout to stop loading even if no data arrives
    const loadingTimeout = setTimeout(() => {
      console.log('⏱️ Loading timeout - assuming no detections exist');
      setLoading(false);
    }, 3000); // Wait 3 seconds max

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

      // Add to beginning (newest first)
      setDetections(prev => [detection, ...prev]);
      
      // ✅ Clear timeout and set loading false when first detection arrives
      clearTimeout(loadingTimeout);
      setLoading(false);
    }, (error) => {
      console.error('❌ Firebase error:', error);
      setError(error.message);
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      console.log('🔥 Disconnecting Firebase listeners...');
      clearTimeout(loadingTimeout);
      connectionUnsubscribe();
      detectionsUnsubscribe();
    };
  }, []);

  return { detections, loading, error, connected };
}

export function useLatestSession() {
  const [latestSessionId, setLatestSessionId] = useState(null);

  useEffect(() => {
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
  }, []);

  return { latestSessionId };
}
