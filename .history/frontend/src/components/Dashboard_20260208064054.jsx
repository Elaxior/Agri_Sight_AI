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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin text-emerald-500 mx-auto mb-4" size={48} />
          <p className="text-slate-300">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-rose-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl text-white mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
            <Sprout className="text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              AgriVision <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">
              AI PRECISION ANALYTICS SYSTEM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/avi,video/quicktime,video/x-matroska,.mp4,.avi,.mov,.mkv"
            onChange={handleFileSelect}
            disabled={uploading || analyzing}
            className="hidden"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || analyzing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
              (uploading || analyzing)
                ? "bg-emerald-900/20 border-emerald-800 text-emerald-600" 
                : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            )}
          >
            {uploading ? (
              <>
                <Activity className="animate-spin" size={16} />
                Uploading...
              </>
            ) : analyzing ? (
              <>
                <Activity className="animate-spin" size={16} />
                Processing Stream...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Drone Data
              </>
            )}
          </button>
          
          <button 
            onClick={handleDownloadReport}
            className="p-2 text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
            title="Download Report"
          >
            <Download size={20} />
          </button>

          {/* Connection Status */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono",
            connected 
              ? "bg-emerald-900/20 border-emerald-700 text-emerald-400" 
              : "bg-slate-800 border-slate-700 text-slate-400"
          )}>
            <span className={cn(
              "inline-block w-2 h-2 rounded-full",
              connected ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
            )}></span>
            {connected ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>
      </header>

      {/* Upload Message */}
      {uploadMessage && (
        <div className="px-6 py-2 bg-slate-900/50 border-b border-slate-800">
          <p className="text-xs text-slate-300 font-mono">{uploadMessage}</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1920px] mx-auto">
        
        {/* TOP METRICS ROW */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Detections */}
          <Card className="border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Total Detections</span>
              <Bug size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-white font-mono">{metrics.totalDetections}</div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {metrics.framesProcessed} Frames
            </div>
          </Card>

          {/* Avg Confidence */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Avg Confidence</span>
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {metrics.avgConfidence}<span className="text-base text-slate-500">%</span>
            </div>
            <div className="text-xs text-blue-400 mt-1">AI Detection Accuracy</div>
          </Card>

          {/* Pest Risk */}
          <Card className={cn(
            "border-l-4 transition-colors duration-500", 
            metrics.pestRisk === 'High' ? 'border-l-rose-500' : 
            metrics.pestRisk === 'Med' ? 'border-l-amber-500' : 'border-l-green-500'
          )}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Pest Risk Index</span>
              <AlertTriangle size={16} className={
                metrics.pestRisk === 'High' ? 'text-rose-500' : 
                metrics.pestRisk === 'Med' ? 'text-amber-500' : 'text-green-500'
              } />
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-white font-mono">{metrics.pestRisk}</div>
              <div className="text-sm font-mono text-slate-400">Count: {metrics.pestDetections}</div>
            </div>
            <div className={cn(
              "text-xs mt-1",
              metrics.pestRisk === 'High' ? 'text-rose-400' : 
              metrics.pestRisk === 'Med' ? 'text-amber-400' : 'text-green-400'
            )}>
              {metrics.pestRisk === 'High' ? 'Immediate Action Required' : 
               metrics.pestRisk === 'Med' ? 'Monitoring Active' : 'Field Healthy'}
            </div>
          </Card>

          {/* Species Detected */}
          <Card className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Species Detected</span>
              <Layers size={16} className="text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-white font-mono">{metrics.uniqueSpecies}</div>
            <div className="text-xs text-purple-400 mt-1">
              {mode === 'firebase' ? '🔥 Firebase Mode' : '📁 Local Mode'}
            </div>
          </Card>
        </div>

        {/* LEFT COLUMN: MAP & CHARTS */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* MAP PLACEHOLDER */}
          <Card title="Field Detection Map" icon={MapIcon} className="h-[500px] p-0 overflow-hidden relative">
            <div className="absolute inset-0">
              <MapView 
                detections={detectionsWithGPS}
                sprayPath={sprayPath}
              />
            </div>

            {/* Processing Overlay */}
            {analyzing && (
              <div className="absolute top-4 right-4 bg-slate-900/90 border border-emerald-500/50 p-3 rounded-lg backdrop-blur-md shadow-lg flex flex-col gap-2 w-48 z-[1000]">
                <div className="flex justify-between items-center text-xs text-emerald-400 font-mono">
                  <span>PROCESSING</span>
                  <Activity className="animate-spin" size={14} />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  YOLOv8 Detection Active
                </div>
              </div>
            )}
          </Card>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detection Trend */}
            <Card title="Detection Trend" icon={Activity} className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="detections" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorDetections)" 
                      isAnimationActive={false} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Waiting for detection data...
                </div>
              )}
            </Card>

            {/* Stats Panel (wrapped) */}
            <Card title="Disease Analytics" icon={Activity} className="h-64">
              <div className="overflow-y-auto h-full">
                <StatsPanel detections={detectionsWithGPS} />
              </div>
            </Card>
          </div>

          {/* PATH PLANNING PANEL */}
          <Card title="Precision Path Planning" icon={MapIcon}>
            <PathPlanningPanel
              detections={detectionsWithGPS}
              onPathGenerated={handlePathGenerated}
              onGridStatsCalculated={handleGridStatsCalculated}
            />
          </Card>

          {/* ECONOMIC IMPACT PANEL */}
          <Card title="Economic Impact Analysis" icon={DollarSign}>
            <EconomicImpactPanel gridStats={gridStats} />
          </Card>
        </div>

        {/* RIGHT COLUMN: INSIGHTS & PANELS */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* LIVE STATUS */}
          <Card title="System Status" icon={Activity}>
            <LiveStatus connected={connected} detections={detectionsWithGPS} />
          </Card>

          {/* DETECTION FEED (Styled as Live Insights) */}
          <Card title="Live Detection Feed" icon={FileText} className="min-h-[300px]">
            <div className="overflow-y-auto max-h-[400px] space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <DetectionFeed detections={detectionsWithGPS} />
            </div>
          </Card>

          {/* FUSION INSIGHT PANEL */}
          <Card title="Sensor Fusion Insights" icon={Layers}>
            <FusionInsightPanel 
              detections={detectionsWithGPS}
              onSensorDataUpdate={handleSensorDataUpdate}
              onFusionResults={handleFusionResults}
            />
          </Card>

          {/* ALERTS & DECISIONS */}
          <Card title="Alerts & Recommendations" icon={AlertTriangle}>
            <AlertsDecisionPanel
              detections={detectionsWithGPS}
              gridStats={gridStats}
              economicImpact={economicImpact}
              onAlertsUpdate={handleAlertsUpdate}
            />
          </Card>
        </div>

        {/* FULL WIDTH: MISSION REPORT (Hidden by default) */}
        <div className="col-span-12" style={{ display: 'none' }}>
          <MissionReportPanel
            ref={reportRef}
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
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        {latestSessionId && `Active Session: ${latestSessionId} • `}
        {mode === 'firebase' && '🔥 Firebase Real-time • '}
        {mode === 'local' && '📁 Local Mode • '}
        Powered by YOLOv8 + Firebase + React
      </footer>

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
        
        /* Smooth animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
