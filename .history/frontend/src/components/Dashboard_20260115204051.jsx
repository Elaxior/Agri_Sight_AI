/**
 * Dashboard Component
 * Main application dashboard with live detection feed, map, and path planning
 * Part 11: Added Mission Report Generator with full panel state capture
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
import MissionReportPanel from './MissionReportPanel';  // ← Part 11: NEW IMPORT
import './Dashboard.css';

const Dashboard = () => {
  const { detections, loading, error, connected } = useDetections();
  const { latestSessionId } = useLatestSession();
  const [sprayPath, setSprayPath] = useState(null);
  const [gridStats, setGridStats] = useState(null);
  const [economicImpact, setEconomicImpact] = useState(null);
  
  // ✅ Part 11: NEW STATE - Capture data from all panels
  const [sensorData, setSensorData] = useState(null);
  const [fusionResults, setFusionResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // ✅ Part 11: Mission metadata for report
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

  // Part 8: Handle grid stats for economic analysis
  const handleGridStatsCalculated = (stats) => {
    setGridStats(stats);
  };

  // Part 10: Calculate economic impact when grid stats change
  useEffect(() => {
    if (gridStats) {
      const impact = calculateEconomicImpact(gridStats);
      setEconomicImpact(impact);
    }
  }, [gridStats]);

  // ✅ Part 11: NEW CALLBACK - Capture sensor data from FusionInsightPanel
  const handleSensorDataUpdate = (data) => {
    console.log('📡 Dashboard received sensor data:', data);
    setSensorData(data);
  };

  // ✅ Part 11: NEW CALLBACK - Capture fusion results from FusionInsightPanel
  const handleFusionResults = (results) => {
    console.log('🔄 Dashboard received fusion results:', results);
    setFusionResults(results);
  };

  // ✅ Part 11: NEW CALLBACK - Capture alerts from AlertsDecisionPanel
  const handleAlertsUpdate = (alertsData) => {
    console.log('🚨 Dashboard received alerts:', alertsData);
    setAlerts(alertsData);
    
    // Extract recommendations from alerts
    const recs = alertsData.map(alert => alert.action).filter(Boolean);
    setRecommendations(recs);
  };

  // ✅ Part 11: NEW CALLBACK - Handle report generation completion
  const handleReportGenerated = (reportInfo) => {
    console.log('✅ Report generated:', reportInfo);
    // Could add notification here
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
            
            {/* ✅ Part 11: UPDATED - Added callbacks for data capture */}
            <FusionInsightPanel 
              detections={detectionsWithGPS}
              onSensorDataUpdate={handleSensorDataUpdate}
              onFusionResults={handleFusionResults}
            />
            
            {/* ✅ Part 11: UPDATED - Added callback for alerts capture */}
            <AlertsDecisionPanel
              detections={detectionsWithGPS}
              gridStats={gridStats}
              economicImpact={economicImpact}
              onAlertsUpdate={handleAlertsUpdate}
            />
            
            {/* ✅ Part 11: NEW COMPONENT - Mission Report Generator */}
            <MissionReportPanel
              missionMetadata={missionMetadata}
              detections={detectionsWithGPS}
              mapState={{ sprayPath: sprayPath?.waypoints || [] }}
              sprayPath={sprayPath}
              gridStats={gridStats}
              economicData={economicImpact}
              sensorData={sensorData}
              fusionResults={fusionResults}
              alerts={alerts}
              recommendations={recommendations}
              onReportGenerated={handleReportGenerated}
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
