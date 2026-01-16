import React, { useState, useEffect, useMemo } from 'react';
import { useDetections, useLatestSession } from '../hooks/useDetections';
import { generateFieldGPS } from '../utils/gpsSimulator';
import { calculateEconomicImpact } from '../utils/economicCalculator';

// Components
import LiveStatus from './LiveStatus';
import DetectionFeed from './DetectionFeed';
import StatsPanel from './StatsPanel';
import MapView from './MapView';
import PathPlanningPanel from './PathPlanningPanel';
import EconomicImpactPanel from './EconomicImpactPanel';
import FusionInsightPanel from './FusionInsightPanel';
import AlertsDecisionPanel from './AlertsDecisionPanel';
import MissionReportPanel from './MissionReportPanel';

// Styles
import './Dashboard.css';

const Dashboard = () => {
  const { detections, loading, error, connected } = useDetections();
  const { latestSessionId } = useLatestSession();
  
  // State Management
  const [sprayPath, setSprayPath] = useState(null);
  const [gridStats, setGridStats] = useState(null);
  const [economicImpact, setEconomicImpact] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [fusionResults, setFusionResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Mission Metadata
  const [missionMetadata] = useState({
    fieldId: latestSessionId || 'FIELD-001',
    fieldName: 'North Agricultural Plot',
    fieldAreaHectares: 12.5,
    missionStart: new Date().toISOString(),
    operatorName: 'Field Operator',
    droneModel: 'DJI Mavic 3 Enterprise'
  });

  // Memoized Data Processing
  const detectionsWithGPS = useMemo(() => {
    return detections.map(detection => {
      if (detection.gps) return detection;
      return { ...detection, gps: generateFieldGPS() };
    });
  }, [detections]);

  // Handlers
  const handlePathGenerated = (path) => {
    setSprayPath(path && path.pathExists ? path : null);
  };

  const handleGridStatsCalculated = (stats) => {
    setGridStats(stats);
  };

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
    console.log('Report generated:', reportInfo);
  };

  // Effects
  useEffect(() => {
    if (gridStats) {
      const impact = calculateEconomicImpact(gridStats);
      setEconomicImpact(impact);
    }
  }, [gridStats]);

  // Loading State
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Initializing System...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-card">
          <h2>System Offline</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reconnect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-mark">PA</div>
          <div>
            <h1>Precision Agriculture Analytics</h1>
            <span className="subtitle">Drone Surveillance System • {missionMetadata.droneModel}</span>
          </div>
        </div>
        
        <div className="header-right">
          <LiveStatus connected={connected} detections={detectionsWithGPS} />
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="dashboard-content">
        
        {/* Left Column: Interactive Map (Stays Fixed) */}
        <div className="map-container">
          <div className="panel-header-overlay">
            <h3>Live Field Map</h3>
            <span className="badge">
               Active
            </span>
          </div>
          <MapView 
            detections={detectionsWithGPS}
            sprayPath={sprayPath}
          />
        </div>

        {/* Right Column: Scrollable Control Deck */}
        <div className="control-deck-scroll">
          <div className="control-deck-content">
            
            {/* Critical Operations Group */}
            <section className="deck-section">
              <div className="section-label">Operations</div>
              <PathPlanningPanel
                detections={detectionsWithGPS}
                onPathGenerated={handlePathGenerated}
                onGridStatsCalculated={handleGridStatsCalculated}
              />
              <AlertsDecisionPanel
                detections={detectionsWithGPS}
                gridStats={gridStats}
                economicImpact={economicImpact}
                onAlertsUpdate={handleAlertsUpdate}
              />
            </section>

            {/* Analytics Group */}
            <section className="deck-section">
              <div className="section-label">Analytics & Insights</div>
              <div className="analytics-grid">
                <StatsPanel detections={detectionsWithGPS} />
                <EconomicImpactPanel gridStats={gridStats} />
              </div>
              <FusionInsightPanel 
                detections={detectionsWithGPS}
                onSensorDataUpdate={handleSensorDataUpdate}
                onFusionResults={handleFusionResults}
              />
            </section>

            {/* Reporting Group */}
            <section className="deck-section">
              <div className="section-label">Reporting</div>
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
            </section>

            {/* Live Feed Group */}
            <section className="deck-section">
              <div className="section-label">Detection Log</div>
              <DetectionFeed detections={detectionsWithGPS} />
            </section>

            <footer className="deck-footer">
               Session: {latestSessionId || 'N/A'} • Powered by YOLOv8
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;