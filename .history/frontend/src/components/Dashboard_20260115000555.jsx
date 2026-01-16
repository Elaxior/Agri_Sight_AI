/**
 * Dashboard Component
 * Main application dashboard with live detection feed, map, and path planning
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useDetections, useLatestSession } from '../hooks/useDetections';
import { generateFieldGPS } from '../utils/gpsSimulator';
import LiveStatus from './LiveStatus';
import DetectionFeed from './DetectionFeed';
import StatsPanel from './StatsPanel';
import MapView from './MapView';
import PathPlanningPanel from './PathPlanningPanel';
import EconomicImpactPanel from './EconomicImpactPanel';  // ← Part 8: NEW
import './Dashboard.css';

const Dashboard = () => {
  const { detections, loading, error, connected } = useDetections();
  const { latestSessionId } = useLatestSession();
  const [sprayPath, setSprayPath] = useState(null);
  const [gridStats, setGridStats] = useState(null);  // ← Part 8: NEW

  console.log('🔧 ===== DASHBOARD RENDERED =====');
  console.log('🔧 Loading:', loading);
  console.log('🔧 Error:', error);
  console.log('🔧 Connected:', connected);
  console.log('🔧 Detections count:', detections.length);
  console.log('🔧 Current sprayPath state:', sprayPath);
  console.log('🔧 Current gridStats state:', gridStats);
  console.log('🔧 Sample detection:', detections[0]);

  // Enrich detections with GPS once (shared by all components)
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

  useEffect(() => {
    console.log('💰 [useEffect] gridStats changed to:', gridStats);
  }, [gridStats]);

  // Handle path generation/clearing
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

  // ✅ Part 8: Handle grid stats updates for economic analysis
  const handleGridStatsCalculated = (stats) => {
    console.log('💰 ===== handleGridStatsCalculated CALLED =====');
    console.log('💰 Received stats:', stats);
    setGridStats(stats);
  };

  if (loading) {
    console.log('🔧 Rendering loading screen');
    return (
      <div className="dashboard">
        <div className="loading-screen">
          <div className="spinner"></div>
          <div className="loading-content">
            <h2>🌾 Connecting to Firebase</h2>
            <p>Initializing real-time detection stream...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('🔧 Rendering error screen:', error);
    return (
      <div className="dashboard">
        <div className="error-screen">
          <div className="error-icon">❌</div>
          <h2>Connection Error</h2>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  console.log('🔧 Rendering main dashboard');

  return (
    <div className="dashboard">
      {/* Enhanced Header with Gradient */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🌾 Precision Agriculture Analytics</h1>
            <p className="subtitle">AI-powered crop disease detection & precision spray path planning</p>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="stat-value">{detectionsWithGPS.length}</span>
              <span className="stat-label">Frames</span>
            </div>
            <div className="header-stat">
              <span className="stat-value">
                {detectionsWithGPS.reduce((sum, d) => sum + (d.detection_count || 0), 0)}
              </span>
              <span className="stat-label">Detections</span>
            </div>
            <div className={`header-stat ${connected ? 'connected' : 'disconnected'}`}>
              <span className="stat-indicator">●</span>
              <span className="stat-label">{connected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Live Status Banner */}
        <LiveStatus connected={connected} detections={detectionsWithGPS} />

        {/* Main Grid Layout */}
        <div className="dashboard-grid-map-layout">
          {/* Left Column - Map (60% width) */}
          <div className="map-column">
            <MapView 
              detections={detectionsWithGPS}
              sprayPath={sprayPath}
            />
          </div>

          {/* Right Column - Panels (40% width) */}
          <div className="sidebar-column">
            {/* Path Planning Panel */}
            <PathPlanningPanel
              detections={detectionsWithGPS}
              onPathGenerated={handlePathGenerated}
              onGridStatsCalculated={handleGridStatsCalculated}  // ← Part 8: NEW
            />
            
            {/* ✅ Part 8: Economic Impact Panel */}
            <EconomicImpactPanel gridStats={gridStats} />
            
            {/* Stats Panel */}
            <StatsPanel detections={detectionsWithGPS} />
            
            {/* Detection Feed */}
            <DetectionFeed detections={detectionsWithGPS} />
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            {latestSessionId && (
              <span className="session-id">
                <span className="session-label">Active Session:</span>
                <span className="session-value">{latestSessionId}</span>
              </span>
            )}
          </div>
          <div className="footer-center">
            <span className="tech-stack">
              Powered by <strong>YOLOv8</strong> • <strong>Firebase</strong> • <strong>React</strong> • <strong>Leaflet</strong>
            </span>
          </div>
          <div className="footer-right">
            <span className="copyright">© 2026 AgriTech Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
