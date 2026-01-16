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
      setConnected(snapshot.val() === true);
    });

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
      setLoading(false);
    }, (error) => {
      console.error('❌ Firebase error:', error);
      setError(error.message);
      setLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      console.log('🔥 Disconnecting Firebase listeners...');
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
