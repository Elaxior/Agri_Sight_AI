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
  
  // ✅ NEW: State for sensor data and alerts
  const [sensorData, setSensorData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [fusionResults, setFusionResults] = useState([]);

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

  // ✅ NEW: Handle sensor data updates
  const handleSensorDataUpdate = (data) => {
    setSensorData(data);
  };

  // ✅ NEW: Handle alerts updates
  const handleAlertsUpdate = (alertsData) => {
    setAlerts(alertsData);
  };

  // ✅ NEW: Handle fusion results updates
  const handleFusionResults = (results) => {
    setFusionResults(results);
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
      <header className="dashboard-header">
        <h1>🌾 Precision Agriculture Analytics</h1>
        <p className="subtitle">Real-time crop disease detection using drone imagery</p>
      </header>

      <div className="dashboard-content">
        <LiveStatus connected={connected} detections={detectionsWithGPS} />

        <div className="dashboard-grid-layout">
          <div className="map-section">
            <MapView 
              detections={detectionsWithGPS}
              sprayPath={sprayPath}
            />
          </div>

          <div className="panels-section">
            <PathPlanningPanel
              detections={detectionsWithGPS}
              onPathGenerated={handlePathGenerated}
              onGridStatsCalculated={handleGridStatsCalculated}
            />
            
            <EconomicImpactPanel gridStats={gridStats} />
            
            <FusionInsightPanel 
              detections={detectionsWithGPS}
              onSensorDataUpdate={handleSensorDataUpdate}
              onFusionResults={handleFusionResults}
            />
            
            <AlertsDecisionPanel
              detections={detectionsWithGPS}
              gridStats={gridStats}
              economicImpact={economicImpact}
              onAlertsUpdate={handleAlertsUpdate}
            />
            
            {/* ✅ UPDATED: Pass all data to report panel */}
            <MissionReportPanel
              missionMetadata={missionMetadata}
              detections={detectionsWithGPS}
              gridStats={gridStats}
              sprayRecommendation={sprayPath}
              economicData={economicImpact}
              sensorData={sensorData}
              fusionResults={fusionResults}
              alerts={alerts}
              mapState={{ sprayPath: sprayPath?.waypoints || [] }}
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
