/**
 * Dashboard Component
 * Main application dashboard with live detection feed, map, and path planning
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useDetections, useLatestSession } from '../hooks/useDetections';
import { generateFieldGPS } from '../utils/gpsSimulator';  // ← ADD THIS
import LiveStatus from './LiveStatus';
import DetectionFeed from './DetectionFeed';
import StatsPanel from './StatsPanel';
import MapView from './MapView';
import PathPlanningPanel from './PathPlanningPanel';
import './Dashboard.css';

const Dashboard = () => {
  const { detections, loading, error, connected } = useDetections();
  const { latestSessionId } = useLatestSession();
  const [sprayPath, setSprayPath] = useState(null);

  console.log('🔧 ===== DASHBOARD RENDERED =====');
  console.log('🔧 Loading:', loading);
  console.log('🔧 Error:', error);
  console.log('🔧 Connected:', connected);
  console.log('🔧 Detections count:', detections.length);
  console.log('🔧 Current sprayPath state:', sprayPath);
  console.log('🔧 Sample detection:', detections[0]);

  // ✅ ENRICH DETECTIONS WITH GPS ONCE (shared by all components)
  const detectionsWithGPS = useMemo(() => {
    console.log('🔧 [Dashboard useMemo] Enriching detections with GPS...');
    
    const enriched = detections.map(detection => {
      // If detection already has GPS (from backend), use it
      if (detection.gps) {
        return detection;
      }
      
      // Otherwise, generate simulated GPS (ONCE per detection)
      return {
        ...detection,
        gps: generateFieldGPS()
      };
    });
    
    console.log('✅ Dashboard enriched detections:', enriched.length);
    
    return enriched;
  }, [detections]);

  useEffect(() => {
    console.log('🔧 [useEffect] sprayPath changed to:', sprayPath);
  }, [sprayPath]);

  useEffect(() => {
    console.log('🔧 [useEffect] detections changed, count:', detections.length);
  }, [detections]);

  // ✅ FIXED: Accept null to clear path
  const handlePathGenerated = (path) => {
    console.log('🔧 ===== handlePathGenerated CALLED =====');
    console.log('🔧 Received path:', path);
    
    if (path === null) {
      console.log('✅ Clearing path');
      setSprayPath(null);
      return;
    }
    
    console.log('🔧 Path exists:', path?.pathExists);
    console.log('🔧 Waypoints count:', path?.waypoints?.length);
    
    if (path && path.pathExists) {
      console.log('✅ Valid path received, updating state');
      setSprayPath(path);
      console.log('✅ setSprayPath called successfully');
    } else {
      console.warn('⚠️ Invalid path received:', path);
    }
  };

  if (loading) {
    console.log('🔧 Rendering loading screen');
    return (
      <div className="dashboard">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('🔧 Rendering error screen:', error);
    return (
      <div className="dashboard">
        <div className="error-screen">
          <h2>❌ Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  console.log('🔧 Rendering main dashboard');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🌾 Precision Agriculture Analytics</h1>
        <p className="subtitle">Real-time crop disease detection using drone imagery</p>
      </header>

      <div className="dashboard-content">
        {/* Live Status */}
        <LiveStatus connected={connected} detections={detectionsWithGPS} />

        {/* Main Grid - Updated Layout */}
        <div className="dashboard-grid-map-layout">
          {/* Left Column - Map (60% width) */}
          <div className="map-column">
            <MapView 
              detections={detectionsWithGPS}
              sprayPath={sprayPath}
            />
          </div>

          {/* Right Column - Path Planning + Stats + Feed (40% width) */}
          <div className="sidebar-column">
            <PathPlanningPanel
              detections={detectionsWithGPS}
              onPathGenerated={handlePathGenerated}
            />
            <StatsPanel detections={detectionsWithGPS} />
            <DetectionFeed detections={detectionsWithGPS} />
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        {latestSessionId && `Active Session: ${latestSessionId} • `}
        Powered by YOLOv8 + Firebase + React + Leaflet
      </footer>
    </div>
  );
};

export default Dashboard;
