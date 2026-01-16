/**
 * Dashboard Component - GRID LAYOUT VERSION
 * Everything fits on one screen with CSS Grid
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
  const [sensorData, setSensorData] = useState(null);
  const [fusionResults, setFusionResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [missionMetadata] = useState({
    fieldId: latestSessionId || 'FIELD-001',
    fieldName: 'North Agricultural Plot',
    fieldAreaHectares: 12.5,
    missionStart: new Date().toISOString(),
    operatorName: 'Field Operator',
    droneModel: 'DJI Mavic 3 Enterprise'
  });

  const detectionsWithGPS = useMemo(() => {
    const enriched = detections.map(detection => {
      if (detection.gps) return detection;
      return { ...detection, gps: generateFieldGPS() };
    });
    return enriched;
  }, [detections]);

  const handlePathGenerated = (path) => {
    if (path === null) {
      setSprayPath(null);
      return;
    }
    if (path && path.pathExists) {
      setSprayPath(path);
    }
  };

  const handleGridStatsCalculated = (stats) => {
    setGridStats(stats);
  };

  useEffect(() => {
    if (gridStats) {
      const impact = calculateEconomicImpact(gridStats);
      setEconomicImpact(impact);
    }
  }, [gridStats]);

  const handleSensorDataUpdate = (data) => {
    setSensorData(data);
  };

  const handleFusionResults = (results) => {
    setFusionResults(results);
  };

  const handleAlertsUpdate = (alertsData) => {
    setAlerts(alertsData);
    const recs = alertsData.map(alert => alert.action).filter(Boolean);
    setRecommendations(recs);
  };

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
      {/* Header - Full Width */}
      <header className="dashboard-header">
        <h1>🌾 Precision Agriculture Analytics</h1>
      </header>

      {/* Status Bar - Full Width */}
      <div className="dashboard-status-bar">
        <LiveStatus connected={connected} detections={detectionsWithGPS} />
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
      </div>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="grid-area-map">
          <MapView 
            detections={detectionsWithGPS}
            sprayPath={sprayPath}
          />
        </div>

        <div className="grid-area-fusion">
          <FusionInsightPanel 
            detections={detectionsWithGPS}
            onSensorDataUpdate={handleSensorDataUpdate}
            onFusionResults={handleFusionResults}
          />
        </div>

        <div className="grid-area-stats">
          <StatsPanel detections={detectionsWithGPS} />
        </div>

        {/* Right Column */}
        <div className="grid-area-path">
          <PathPlanningPanel
            detections={detectionsWithGPS}
            onPathGenerated={handlePathGenerated}
            onGridStatsCalculated={handleGridStatsCalculated}
          />
        </div>

        <div className="grid-area-economic">
          <EconomicImpactPanel gridStats={gridStats} />
        </div>

        <div className="grid-area-detections">
          <DetectionFeed detections={detectionsWithGPS} />
        </div>

        {/* Full Width Bottom */}
        <div className="grid-area-alerts">
          <AlertsDecisionPanel
            detections={detectionsWithGPS}
            gridStats={gridStats}
            economicImpact={economicImpact}
            onAlertsUpdate={handleAlertsUpdate}
          />
        </div>
      </div>

      {/* Footer - Full Width */}
      <footer className="dashboard-footer">
        {latestSessionId && `Active Session: ${latestSessionId} • `}
        Powered by YOLOv8 + Firebase + React + Leaflet
      </footer>
    </div>
  );
};

export default Dashboard;
