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
  
  // Mission Report state
  const [sensorData, setSensorData] = useState(null);
  const [fusionResults, setFusionResults] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const reportRef = useRef(null);
  
  // GPS cache to maintain stable coordinates per detection frame_id
  const [gpsCache, setGpsCache] = useState({});

  // Video upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  // Chart data state
  const [chartData, setChartData] = useState([]);

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
      
      const cacheKey = `${detection.session_id}_${detection.frame_id}`;
      if (gpsCache[cacheKey]) {
        return { ...detection, gps: gpsCache[cacheKey] };
      }
      
      const newGps = generateFieldGPS();
      setGpsCache(prev => ({ ...prev, [cacheKey]: newGps }));
      return { ...detection, gps: newGps };
    });
    return enriched;
  }, [detections, gpsCache]);

  // Calculate metrics for top cards
  const metrics = useMemo(() => {
    const totalDetections = detectionsWithGPS.reduce((sum, det) => 
      sum + (det.detection_count || 0), 0
    );
    
    const avgConfidence = detectionsWithGPS.length > 0
      ? detectionsWithGPS.reduce((sum, det) => {
          const detList = det.detections || [];
          const avgConf = detList.length > 0
            ? detList.reduce((s, d) => s + d.confidence, 0) / detList.length
            : 0;
          return sum + avgConf;
        }, 0) / detectionsWithGPS.length
      : 0;
    
    const pestDetections = detectionsWithGPS.reduce((sum, det) => {
      const detList = det.detections || [];
      return sum + detList.filter(d => d.confidence > 0.7).length;
    }, 0);
    
    const uniqueSpecies = new Set(
      detectionsWithGPS.flatMap(det => 
        (det.detections || []).map(d => d.class_name)
      )
    ).size;
    
    const pestRisk = pestDetections === 0 ? 'Low' : pestDetections < 10 ? 'Med' : 'High';
    
    return {
      totalDetections,
      avgConfidence: (avgConfidence * 100).toFixed(1),
      pestDetections,
      pestRisk,
      uniqueSpecies,
      framesProcessed: detectionsWithGPS.length
    };
  }, [detectionsWithGPS]);

  // Update chart data for detection trends
  useEffect(() => {
    if (detectionsWithGPS.length > 0) {
      const last20 = detectionsWithGPS.slice(-20).map((det, idx) => ({
        time: idx,
        detections: det.detection_count || 0,
        confidence: det.detections?.[0]?.confidence || 0
      }));
      setChartData(last20);
    }
  }, [detectionsWithGPS]);

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

  // Video upload handlers
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv)$/i)) {
        setUploadMessage('❌ Invalid file type');
        return;
      }
      setSelectedFile(file);
      handleUploadAndAnalyze(file);
    }
  };

  const handleUploadAndAnalyze = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadMessage('📤 Uploading...');

      const uploadResult = await uploadVideo(file);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadMessage('✅ Uploaded');
      setUploading(false);
      setAnalyzing(true);
      setUploadMessage('🔄 Analyzing...');

      const analysisResult = await startAnalysis(uploadResult.filepath);
      
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      setUploadMessage(`✅ Started: ${analysisResult.session_id}`);

      // Clear previous data
      if (clearDetections) clearDetections();
      setSprayPath(null);
      setGridStats(null);
      setEconomicImpact(null);
      setSensorData(null);
      setFusionResults(null);
      setAlerts([]);
      setRecommendations([]);
      setGpsCache({});

      pollAnalysisStatus();

    } catch (error) {
      console.error('Error:', error);
      setUploadMessage(`❌ ${error.message}`);
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const pollAnalysisStatus = async () => {
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 60;

    const checkStatus = async () => {
      try {
        pollAttempts++;
        const status = await getStatus();
        
        if (status.completed || (!status.running && pollAttempts > 5)) {
          setAnalyzing(false);
          setUploadMessage('✅ Analysis complete');
          return true;
        }
        
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          setAnalyzing(false);
          setUploadMessage('⏱️ Analysis timeout');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Status check error:', error);
        return false;
      }
    };

    const pollInterval = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(pollInterval);
      }
    }, 3000);
  };

  const handleDownloadReport = () => {
    if (reportRef.current && reportRef.current.handleGenerateReport) {
      reportRef.current.handleGenerateReport();
    } else {
      alert('Report generation feature will be available after analysis completes');
    }
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
