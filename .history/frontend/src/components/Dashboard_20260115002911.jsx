/**
 * Dashboard Component
 * Main application dashboard with tabbed control system
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useDetections, useLatestSession } from '../hooks/useDetections';
import { generateFieldGPS } from '../utils/gpsSimulator';
import LiveStatus from './LiveStatus';
import DetectionFeed from './DetectionFeed';
import StatsPanel from './StatsPanel';
import MapView from './MapView';
import PathPlanningPanel from './PathPlanningPanel';
import EconomicImpactPanel from './EconomicImpactPanel';
import './Dashboard.css';

const Dashboard = () => {
  const { detections, loading, error, connected } = useDetections();
  const { latestSessionId } = useLatestSession();
  const [sprayPath, setSprayPath] = useState(null);
  const [gridStats, setGridStats] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');  // ← NEW: Tab state

  console.log('🔧 ===== DASHBOARD RENDERED =====');
  console.log('🔧 Active Tab:', activeTab);

  // Enrich detections with GPS
  const detectionsWithGPS = useMemo(() => {
    const enriched = detections.map(detection => {
      if (detection.gps) return detection;
      return { ...detection, gps: generateFieldGPS() };
    });
    return enriched;
  }, [detections]);

  useEffect(() => {
    console.log('🔧 [useEffect] sprayPath changed to:', sprayPath);
  }, [sprayPath]);

  useEffect(() => {
    console.log('💰 [useEffect] gridStats changed to:', gridStats);
  }, [gridStats]);

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

  // Handle grid stats for economic analysis
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
        <p className="subtitle">Real-time crop disease detection & control system</p>
      </header>

      <div className="dashboard-content">
        {/* Live Status */}
        <LiveStatus connected={connected} detections={detectionsWithGPS} />

        {/* Control System Layout */}
        <div className="control-system-layout">
          {/* Left side - Map with tabs below */}
          <div className="map-control-section">
            {/* Map */}
            <div className="map-container-wrapper">
              <MapView 
                detections={detectionsWithGPS}
                sprayPath={sprayPath}
              />
            </div>

            {/* ✨ NEW: Tabbed Control Panel Below Map */}
            <div className="control-tabs-container">
              {/* Tab Navigation */}
              <div className="tabs-navigation">
                <button 
                  className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  <span className="tab-icon">📊</span>
                  <span className="tab-label">Economic Analysis</span>
                  {gridStats && (
                    <span className="tab-badge">{gridStats.infectedCount}</span>
                  )}
                </button>

                <button 
                  className={`tab-button ${activeTab === 'planning' ? 'active' : ''}`}
                  onClick={() => setActiveTab('planning')}
                >
                  <span className="tab-icon">🛫</span>
                  <span className="tab-label">Path Planning</span>
                  {sprayPath && (
                    <span className="tab-badge success">{sprayPath.waypoints.length}</span>
                  )}
                </button>

                <button 
                  className={`tab-button ${activeTab === 'detections' ? 'active' : ''}`}
                  onClick={() => setActiveTab('detections')}
                >
                  <span className="tab-icon">🔍</span>
                  <span className="tab-label">Detection Feed</span>
                  <span className="tab-badge">{detectionsWithGPS.length}</span>
                </button>

                <button 
                  className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  <span className="tab-icon">📈</span>
                  <span className="tab-label">Statistics</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="tabs-content">
                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div className="tab-panel fade-in">
                    <EconomicImpactPanel gridStats={gridStats} />
                  </div>
                )}

                {/* Path Planning Tab */}
                {activeTab === 'planning' && (
                  <div className="tab-panel fade-in">
                    <PathPlanningPanel
                      detections={detectionsWithGPS}
                      onPathGenerated={handlePathGenerated}
                      onGridStatsCalculated={handleGridStatsCalculated}
                    />
                  </div>
                )}

                {/* Detections Tab */}
                {activeTab === 'detections' && (
                  <div className="tab-panel fade-in">
                    <DetectionFeed detections={detectionsWithGPS} />
                  </div>
                )}

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                  <div className="tab-panel fade-in">
                    <StatsPanel detections={detectionsWithGPS} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Quick Summary Panel */}
          <div className="quick-summary-section">
            <div className="summary-panel">
              <h3>⚡ Quick Summary</h3>
              
              {/* Connection Status */}
              <div className="summary-card">
                <div className="summary-icon">{connected ? '🟢' : '🔴'}</div>
                <div className="summary-content">
                  <div className="summary-label">System Status</div>
                  <div className="summary-value">{connected ? 'LIVE' : 'OFFLINE'}</div>
                </div>
              </div>

              {/* Detection Count */}
              <div className="summary-card">
                <div className="summary-icon">🔍</div>
                <div className="summary-content">
                  <div className="summary-label">Total Detections</div>
                  <div className="summary-value">
                    {detectionsWithGPS.reduce((sum, d) => sum + (d.detection_count || 0), 0)}
                  </div>
                  <div className="summary-subtitle">{detectionsWithGPS.length} frames</div>
                </div>
              </div>

              {/* Infected Zones */}
              {gridStats && (
                <div className="summary-card highlight">
                  <div className="summary-icon">⚠️</div>
                  <div className="summary-content">
                    <div className="summary-label">Infected Zones</div>
                    <div className="summary-value">{gridStats.infectedCount}</div>
                    <div className="summary-subtitle">
                      {gridStats.infectedPercentage.toFixed(1)}% of field
                    </div>
                  </div>
                </div>
              )}

              {/* Spray Path Status */}
              {sprayPath && sprayPath.pathExists && (
                <div className="summary-card success">
                  <div className="summary-icon">✅</div>
                  <div className="summary-content">
                    <div className="summary-label">Path Generated</div>
                    <div className="summary-value">{sprayPath.waypoints.length}</div>
                    <div className="summary-subtitle">waypoints ready</div>
                  </div>
                </div>
              )}

              {/* Chemical Savings */}
              {gridStats && (
                <div className="summary-card success">
                  <div className="summary-icon">💰</div>
                  <div className="summary-content">
                    <div className="summary-label">Chemical Savings</div>
                    <div className="summary-value">{gridStats.chemicalSavings}%</div>
                    <div className="summary-subtitle">vs traditional spraying</div>
                  </div>
                </div>
              )}

              {/* Session Info */}
              {latestSessionId && (
                <div className="summary-card">
                  <div className="summary-icon">📋</div>
                  <div className="summary-content">
                    <div className="summary-label">Session ID</div>
                    <div className="summary-value session-id">{latestSessionId.slice(-8)}</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="quick-actions">
                <h4>Quick Actions</h4>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('planning')}
                  disabled={!gridStats}
                >
                  🛫 Generate Path
                </button>
                <button 
                  className="action-btn"
                  onClick={() => setActiveTab('analysis')}
                  disabled={!gridStats}
                >
                  📊 View ROI
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => window.location.reload()}
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
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
