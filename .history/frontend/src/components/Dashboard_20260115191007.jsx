/**
 * Dashboard Component
 * Main application dashboard with live detection feed, map, and path planning
 * 
 * Parts included:
 * - Part 5: Live detections
 * - Part 6: Dynamic map
 * - Part 7: Precision spray path
 * - Part 8: Economic impact
 * - Part 9: Multimodal fusion
 * - Part 10: Alerts & decisions
 * - Part 11: Mission report generator
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useDetections, useLatestSession } from '../hooks/useDetections';
import { generateFieldGPS } from '../utils/gpsSimulator';
import { calculateEconomicImpact } from '../utils/economicCalculator';
import LiveStatus from './LiveStatus';
import DetectionFeed from './DetectionFeed';
import StatsPanel from './StatsPanel';
import MapView from './MapView';
import PathPlanningPanel from './PathPlanningPanel';
import EconomicImpactPanel from './EconomicImpactPanel';
import FusionInsightPanel from './FusionInsightPanel';
import AlertsDecisionPanel from './AlertsDecisionPanel';
import MissionReportPanel from './MissionReportPanel';
import './Dashboard.css';

const Dashboard = () => {
  const { detections, loading, error, connected } = useDetections();
  const { latestSessionId } = useLatestSession();
  const [sprayPath, setSprayPath] = useState(null);
  const [gridStats, setGridStats] = useState(null);
  const [economicImpact, setEconomicImpact] = useState(null);

  // Mission metadata state
  const [missionMetadata] = useState({
    fieldId: latestSessionId || 'FIELD-001',
    fieldName: 'North Agricultural Plot',
    fieldAreaHectares: 12.5,
    missionStart: new Date().toISOString(),
    operatorName: 'Field Operator',
    droneModel: 'DJI Mavic 3 Enterprise'
  });

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

  // Handle grid stats for economic analysis
  const handleGridStatsCalculated = (stats) => {
    setGridStats(stats);
  };

  // Calculate economic impact when grid stats change
  useEffect(() => {
    if (gridStats) {
      const impact = calculateEconomicImpact(gridStats);
      setEconomicImpact(impact);
    }
  }, [gridStats]);

  // Handle report generation success
  const handleReportGenerated = (reportInfo) => {
    console.log('✅ Report generated:', reportInfo);
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
            {/* Path Planning */}
            <PathPlanningPanel
              detections={detectionsWithGPS}
              onPathGenerated={handlePathGenerated}
              onGridStatsCalculated={handleGridStatsCalculated}
            />
            
            {/* Economic Impact */}
            <EconomicImpactPanel gridStats={gridStats} />
            
            {/* Multimodal Fusion Insights */}
            <FusionInsightPanel detections={detectionsWithGPS} />
            
            {/* Intelligent Alerts & Decisions */}
            <AlertsDecisionPanel
              detections={detectionsWithGPS}
              gridStats={gridStats}
              economicImpact={economicImpact}
            />
            
            {/* Mission Report Generator */}
            <MissionReportPanel
              missionMetadata={missionMetadata}
              detections={detectionsWithGPS}
              sprayRecommendation={sprayPath?.recommendation || null}
              economicData={economicImpact || {}}
              mapState={{ sprayPath: sprayPath?.waypoints || [] }}
              onReportGenerated={handleReportGenerated}
            />
            
            {/* Statistics */}
            <StatsPanel detections={detectionsWithGPS} />
            
            {/* Detection Feed */}
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
