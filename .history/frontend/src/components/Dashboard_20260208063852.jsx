/**
 * Dashboard Component - Professional AgriVision Pro Theme
 * Refactored with sample.jsx styling while preserving all functionality
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDetections, useLatestSession } from '../hooks/useDetections';
import { generateFieldGPS } from '../utils/gpsSimulator';
import { calculateEconomicImpact } from '../utils/economicCalculator';
import { 
  Activity, 
  Sprout, 
  AlertTriangle, 
  Download, 
  Upload, 
  MapIcon, 
  Layers,
  FileText,
  CheckCircle2,
  Bug,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import LiveStatus from './LiveStatus';
import DetectionFeed from './DetectionFeed';
import StatsPanel from './StatsPanel';
import MapView from './MapView';
import PathPlanningPanel from './PathPlanningPanel';
import EconomicImpactPanel from './EconomicImpactPanel';
import FusionInsightPanel from './FusionInsightPanel';
import AlertsDecisionPanel from './AlertsDecisionPanel';
import MissionReportPanel from './MissionReportPanel';
import { uploadVideo, startAnalysis, getStatus } from '../utils/apiClient';

// --- Utility for Tailwind ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Reusable Card Component ---
const Card = ({ children, className, title, icon: Icon, action }) => (
  <div className={cn("bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden flex flex-col shadow-lg transition-all hover:border-emerald-500/30", className)}>
    {(title || Icon) && (
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
          {Icon && <Icon size={16} />}
          {title}
        </div>
        {action}
      </div>
    )}
    <div className="p-4 flex-1 relative">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-600",
    success: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
    warning: "bg-amber-900/30 text-amber-400 border-amber-700/50",
    danger: "bg-rose-900/30 text-rose-400 border-rose-700/50",
    info: "bg-blue-900/30 text-blue-400 border-blue-700/50",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-mono border", variants[variant])}>
      {children}
    </span>
  );
};

const Dashboard = () => {
  const { detections, loading, error, connected, clearDetections, mode } = useDetections();
  const { latestSessionId } = useLatestSession();
  const [sprayPath, setSprayPath] = useState(null);
  const [gridStats, setGridStats] = useState(null);
  const [economicImpact, setEconomicImpact] = useState(null);
  
  // Part 11: State for report data
  const [sensorData, setSensorData] = useState(null);
  const [fusionResults, setFusionResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // GPS cache to maintain stable coordinates per detection frame_id
  const [gpsCache, setGpsCache] = useState({});

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
      // If detection already has GPS, use it
      if (detection.gps) return detection;
      
      // Check cache first
      const cacheKey = `${detection.session_id}_${detection.frame_id}`;
      if (gpsCache[cacheKey]) {
        return { ...detection, gps: gpsCache[cacheKey] };
      }
      
      // Generate new GPS and cache it
      const newGps = generateFieldGPS();
      setGpsCache(prev => ({ ...prev, [cacheKey]: newGps }));
      return { ...detection, gps: newGps };
    });
    return enriched;
  }, [detections, gpsCache]);

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
    console.log('📊 Dashboard: Grid stats received:', stats);
    setGridStats(stats);
  };

  useEffect(() => {
    if (gridStats) {
      const impact = calculateEconomicImpact(gridStats);
      console.log('💰 Dashboard: Economic impact calculated:', impact);
      setEconomicImpact(impact);
    }
  }, [gridStats]);

  const handleSensorDataUpdate = (data) => {
    console.log('📡 Dashboard: Sensor data received:', data);
    setSensorData(data);
  };

  const handleFusionResults = (results) => {
    console.log('🔄 Dashboard: Fusion results received:', results.length);
    setFusionResults(results);
  };

  const handleAlertsUpdate = (alertsData) => {
    console.log('🚨 Dashboard: Alerts received:', alertsData.length);
    setAlerts(alertsData);
    
    const recs = alertsData.map(alert => alert.action).filter(Boolean);
    setRecommendations(recs);
  };

  const handleReportGenerated = (reportInfo) => {
    console.log('✅ Dashboard: Report generated:', reportInfo);
  };

  const handleAnalysisStarted = (sessionId) => {
    console.log('🚀 Dashboard: New analysis started:', sessionId);
    
    // Clear all state for new analysis
    if (clearDetections) {
      clearDetections();
    }
    setSprayPath(null);
    setGridStats(null);
    setEconomicImpact(null);
    setSensorData(null);
    setFusionResults([]);
    setAlerts([]);
    setRecommendations([]);
    setGpsCache({}); // Clear GPS cache for new analysis
  };

  const handleAnalysisComplete = () => {
    console.log('✅ Dashboard: Analysis complete');
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔍 Dashboard State Update:', {
      detections: detectionsWithGPS.length,
      gridStats: !!gridStats,
      economicImpact: !!economicImpact,
      sensorData: !!sensorData,
      fusionResults: fusionResults.length,
      alerts: alerts.length
    });
  }, [detectionsWithGPS, gridStats, economicImpact, sensorData, fusionResults, alerts]);

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
            <VideoInputPanel 
              onAnalysisStarted={handleAnalysisStarted}
              onAnalysisComplete={handleAnalysisComplete}
            />
            
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
        {mode === 'firebase' && '🔥 Firebase Real-time • '}
        {mode === 'local' && '📁 Local Mode • '}
        Powered by YOLOv8 + Firebase + React + Leaflet
      </footer>
    </div>
  );
};

export default Dashboard;
