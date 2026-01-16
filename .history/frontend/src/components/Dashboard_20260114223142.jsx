/**
 * Dashboard Component
 * Main application dashboard with live detection feed, map, and path planning
 */

import React, { useState } from 'react';
import { useDetections, useLatestSession } from '../hooks/useDetections';
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
        <LiveStatus connected={connected} detections={detections} />

        {/* Main Grid - Updated Layout */}
        <div className="dashboard-grid-map-layout">
          {/* Left Column - Map (60% width) */}
          <div className="map-column">
            <MapView 
              detections={detections} 
              sprayPath={sprayPath}
            />
          </div>

          {/* Right Column - Path Planning + Stats + Feed (40% width) */}
          <div className="sidebar-column">
            <PathPlanningPanel
              detections={detections}
              onPathGenerated={setSprayPath}
            />
            <StatsPanel detections={detections} />
            <DetectionFeed detections={detections} />
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
