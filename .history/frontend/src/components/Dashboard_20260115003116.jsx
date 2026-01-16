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
import EconomicImpactPanel from './EconomicImpactPanel';  // ← Part 8
import './Dashboard.css';

const Dashboard = () => {
  const { detections, loading, error, connected } = useDetections();
  const { latestSessionId } = useLatestSession();
  const [sprayPath, setSprayPath] = useState(null);
  const [gridStats, setGridStats] = useState(null);  // ← Part 8

  // Enrich detections with GPS once (shared by all components)
  const detectionsWithGPS = useMemo(() => {
    const enriched = detections.map(detection => {
      if (detection.gps) return detection;
      return { ...detection, gps: generateFieldGPS() };
    });
    return enriched;
  }, [detections]);

  // Handle path generation/clearing
  const handlePathGenerated = (path) => {
    if (path === null) {
      setSprayPath(null);
      return;
    }
    if (path && path.pathExists) {
      setSprayPath(path);
    }
  };

  // Part 8: Handle grid stats for economic analysis
  const handleGridStatsCalculated = (stats) => {
    setGridStats(stats);
  };

  if (loading) {
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🌾 Precision Agriculture Analytics</h1>
        <p className="subtitle">Real-time crop disease detection using drone imagery</p>
      </header>

      <div className="dashboard-content">
        {/* Live Status */}
        <LiveStatus connected={connected} detections={detectionsWithGPS} />

        {/* Layout: Map on left, panels stacked on right */}
        <div className="dashboard-grid-layout">
          {/* Left side - Map (sticky, full height) */}
          <div className="map-section">
            <MapView 
              detections={detectionsWithGPS}
              sprayPath={sprayPath}
            />
          </div>

          {/* Right side - All panels stacked */}
          <div className="panels-section">
            <PathPlanningPanel
              detections={detectionsWithGPS}
              onPathGenerated={handlePathGenerated}
              onGridStatsCalculated={handleGridStatsCalculated}
            />
            
            <EconomicImpactPanel gridStats={gridStats} />
            
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
