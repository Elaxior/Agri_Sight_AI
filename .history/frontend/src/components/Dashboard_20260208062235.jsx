/**
 * Dashboard Component - Modern Theme Integration
 * Enhanced with AgriVision Pro styling
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import VideoInputPanel from './VideoInputPanel';
import './Dashboard.css';

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
  
  // Video upload state
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Report generation ref
  const reportRef = useRef(null);

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
    setIsProcessing(true);
    
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
    setIsProcessing(false);
  };

  const handleDownloadReport = () => {
    console.log('📄 Generating report...');
    if (reportRef.current && reportRef.current.generateReport) {
      reportRef.current.generateReport();
    }
  };

  // Calculate metrics from detections
  const metrics = useMemo(() => {
    if (detectionsWithGPS.length === 0) {
      return {
        totalDetections: 0,
        avgConfidence: 0,
        uniqueClasses: 0,
        pestsDetected: 0
      };
    }

    const total = detectionsWithGPS.length;
    const avgConf = detectionsWithGPS.reduce((sum, d) => {
      const detAvg = d.detections && d.detections.length > 0
        ? d.detections.reduce((s, det) => s + det.confidence, 0) / d.detections.length
        : 0;
      return sum + detAvg;
    }, 0) / total;

    const allClasses = new Set();
    let pests = 0;
    detectionsWithGPS.forEach(d => {
      if (d.detections) {
        d.detections.forEach(det => {
          allClasses.add(det.class_name);
          if (det.class_name.toLowerCase().includes('pest') || 
              det.class_name.toLowerCase().includes('blight') ||
              det.class_name.toLowerCase().includes('rust')) {
            pests++;
          }
        });
      }
    });

    return {
      totalDetections: total,
      avgConfidence: avgConf,
      uniqueClasses: allClasses.size,
      pestsDetected: pests
    };
  }, [detectionsWithGPS]);

  // Debug: Log state changes (remove auto-scroll)
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-slate-400">Connecting to system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-rose-400 mb-4">❌ Connection Error</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/10 shadow-lg shadow-emerald-500/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <span className="text-white text-2xl">🌾</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">AgriVision</span>
                <span className="text-emerald-400 ml-1">Pro</span>
              </h1>
              <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">
                Precision Agriculture Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <VideoInputPanel 
              compact={true}
              onAnalysisStarted={handleAnalysisStarted}
              onAnalysisComplete={handleAnalysisComplete}
            />
            
            <button 
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 font-medium text-sm flex items-center gap-2 border border-blue-400/20"
              title="Download Report"
            >
              <span>📥</span>
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Detections */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-emerald-500/20 backdrop-blur-xl rounded-2xl p-5 shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/40 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Detections</span>
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <span className="text-emerald-400 text-lg">📊</span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-white to-emerald-300 bg-clip-text text-transparent font-mono mb-2">{metrics.totalDetections}</div>
              <div className="text-xs text-emerald-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-slate-500'}`}></span>
                <span className="font-medium">{connected ? 'Live Monitoring' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          {/* Average Confidence */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-blue-500/20 backdrop-blur-xl rounded-2xl p-5 shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Avg Confidence</span>
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <span className="text-blue-400 text-lg">🎯</span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-white to-blue-300 bg-clip-text text-transparent font-mono mb-2">
                {(metrics.avgConfidence * 100).toFixed(1)}<span className="text-2xl">%</span>
              </div>
              <div className="text-xs text-blue-400 font-medium">Model Accuracy</div>
            </div>
          </div>

          {/* Pest Risk */}
          <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 border backdrop-blur-xl rounded-2xl p-5 shadow-xl hover:shadow-rose-500/10 transition-all relative overflow-hidden ${metrics.pestsDetected > 10 ? 'border-rose-500/20 hover:border-rose-500/40' : 'border-amber-500/20 hover:border-amber-500/40'}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${metrics.pestsDetected > 10 ? 'bg-rose-500/5' : 'bg-amber-500/5'}`}></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Pest Detections</span>
                <div className={`p-2 rounded-lg ${metrics.pestsDetected > 10 ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
                  <span className={metrics.pestsDetected > 10 ? 'text-rose-400 text-lg' : 'text-amber-400 text-lg'}>
                    ⚠️
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <div className={`text-4xl font-bold font-mono ${metrics.pestsDetected > 10 ? 'bg-gradient-to-br from-rose-300 to-rose-500 bg-clip-text text-transparent' : 'bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent'}`}>{metrics.pestsDetected}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${metrics.pestsDetected > 10 ? 'bg-rose-500/20 text-rose-300' : metrics.pestsDetected > 5 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {metrics.pestsDetected > 10 ? 'HIGH' : metrics.pestsDetected > 5 ? 'MED' : 'LOW'}
                </span>
              </div>
              <div className={`text-xs font-medium ${metrics.pestsDetected > 10 ? 'text-rose-400' : 'text-amber-400'}`}>
                {metrics.pestsDetected > 10 ? '🚨 Action Required' : '👁️ Monitoring Active'}
              </div>
            </div>
          </div>

          {/* Unique Classes */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-purple-500/20 backdrop-blur-xl rounded-2xl p-5 shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/40 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Species Detected</span>
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <span className="text-purple-400 text-lg">🔬</span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-br from-white to-purple-300 bg-clip-text text-transparent font-mono mb-2">{metrics.uniqueClasses}</div>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className={mode === 'firebase' ? 'text-orange-400' : 'text-slate-400'}>
                  {mode === 'firebase' ? '🔥' : '📁'}
                </span>
                <span className={mode === 'firebase' ? 'text-orange-400' : 'text-slate-400'}>
                  {mode === 'firebase' ? 'Firebase Real-time' : 'Local Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: MAP (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all h-[400px]">
              <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/40 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">🗺️</span>
                    <span className="text-sm font-bold text-slate-200">Field Map</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    {detectionsWithGPS.length}
                  </span>
                </div>
              </div>
              <div className="relative h-[calc(100%-52px)]">
              <MapView 
                detections={detectionsWithGPS}
                sprayPath={sprayPath}
              />
              
                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute top-4 right-4 bg-slate-900/95 border border-emerald-500/30 p-3 rounded-xl backdrop-blur-xl shadow-2xl shadow-emerald-500/20 z-10">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span>PROCESSING</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      YOLOv8 Active
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: PANELS (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* LIVE STATUS */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all">
              <LiveStatus connected={connected} detections={detectionsWithGPS} />
            </div>

            {/* STATS PANEL */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all">
              <StatsPanel detections={detectionsWithGPS} />
            </div>

            {/* PATH PLANNING PANEL */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all">
              <PathPlanningPanel
                detections={detectionsWithGPS}
                onPathGenerated={handlePathGenerated}
                onGridStatsCalculated={handleGridStatsCalculated}
              />
            </div>

            {/* ECONOMIC IMPACT PANEL */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all">
              <EconomicImpactPanel gridStats={gridStats} />
            </div>

            {/* DETECTION FEED */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all">
              <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">📄</span>
                  <span className="text-sm font-bold text-slate-200">Live Detection Feed</span>
                </div>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto">
                <DetectionFeed detections={detectionsWithGPS} />
              </div>
            </div>

            {/* ALERTS & DECISION PANEL */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/90 border border-emerald-500/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/10 transition-all">
              <AlertsDecisionPanel
                detections={detectionsWithGPS}
                gridStats={gridStats}
                economicImpact={economicImpact}
                onAlertsUpdate={handleAlertsUpdate}
              />
            </div>
          </div>
        </div>

        {/* FUSION INSIGHT PANEL */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all">
          <FusionInsightPanel 
            detections={detectionsWithGPS}
            onSensorDataUpdate={handleSensorDataUpdate}
            onFusionResults={handleFusionResults}
          />
        </div>

        {/* MISSION REPORT PANEL (Hidden - only for report generation) */}
        <div className="hidden">
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
      <footer className="mt-12 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 text-center text-xs text-slate-500 font-mono">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {latestSessionId && <span className="text-emerald-500">🔑 Session: {latestSessionId}</span>}
            {mode === 'firebase' && <span>🔥 Firebase Real-time</span>}
            {mode === 'local' && <span>📁 Local Mode</span>}
            <span>•</span>
            <span>Powered by YOLOv8 + React + Leaflet</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
