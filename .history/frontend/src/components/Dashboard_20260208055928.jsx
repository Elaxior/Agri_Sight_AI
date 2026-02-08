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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
            <span className="text-emerald-400 text-2xl">🌾</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              AgriVision <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">
              PRECISION AGRICULTURE ANALYTICS SYSTEM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <VideoInputPanel 
            onAnalysisStarted={handleAnalysisStarted}
            onAnalysisComplete={handleAnalysisComplete}
          />
          
          <button 
            onClick={handleDownloadReport}
            className="p-2 text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
            title="Download Report"
          >
            <span className="text-xl">⬇️</span>
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1920px] mx-auto">
        
        {/* TOP METRICS ROW */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Detections */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:border-emerald-500/30 transition-all border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Total Detections</span>
              <span className="text-emerald-500 text-lg">📊</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">{metrics.totalDetections}</div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
              {connected ? 'Live Monitoring' : 'Disconnected'}
            </div>
          </div>

          {/* Average Confidence */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:border-emerald-500/30 transition-all border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Avg Confidence</span>
              <span className="text-blue-500 text-lg">🎯</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {(metrics.avgConfidence * 100).toFixed(1)}<span className="text-base text-slate-500">%</span>
            </div>
            <div className="text-xs text-blue-400 mt-1">Model Accuracy</div>
          </div>

          {/* Pest Risk */}
          <div className={`bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:border-emerald-500/30 transition-all border-l-4 ${metrics.pestsDetected > 10 ? 'border-l-rose-500' : 'border-l-amber-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Pest Detections</span>
              <span className={metrics.pestsDetected > 10 ? 'text-rose-500 text-lg' : 'text-amber-500 text-lg'}>
                ⚠️
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-white font-mono">{metrics.pestsDetected}</div>
              <div className="text-sm font-mono text-slate-400">
                {metrics.pestsDetected > 10 ? 'High' : metrics.pestsDetected > 5 ? 'Medium' : 'Low'}
              </div>
            </div>
            <div className={`text-xs mt-1 ${metrics.pestsDetected > 10 ? 'text-rose-400' : 'text-amber-400'}`}>
              {metrics.pestsDetected > 10 ? 'Action Required' : 'Monitoring Active'}
            </div>
          </div>

          {/* Unique Classes */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:border-emerald-500/30 transition-all border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-400 text-xs font-mono uppercase">Species Detected</span>
              <span className="text-purple-500 text-lg">🔬</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono">{metrics.uniqueClasses}</div>
            <div className="text-xs text-purple-400 mt-1">
              {mode === 'firebase' ? '🔥 Firebase Real-time' : '📁 Local Mode'}
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: MAP & ANALYTICS */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* MAP CONTAINER - PLACEHOLDER */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all h-[500px]">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
                <span>🗺️</span>
                Field Map View
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {detectionsWithGPS.length} Detection Points
              </div>
            </div>
            <div className="relative h-[calc(100%-52px)]">
              <MapView 
                detections={detectionsWithGPS}
                sprayPath={sprayPath}
              />
              
              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute top-4 right-4 bg-slate-900/90 border border-emerald-500/50 p-3 rounded-lg backdrop-blur-md shadow-lg flex flex-col gap-2 w-48 z-10">
                  <div className="flex justify-between items-center text-xs text-emerald-400 font-mono">
                    <span>PROCESSING</span>
                    <span className="animate-pulse">●</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    YOLOv8 Detection Active
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PATH PLANNING PANEL */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all">
            <PathPlanningPanel
              detections={detectionsWithGPS}
              onPathGenerated={handlePathGenerated}
              onGridStatsCalculated={handleGridStatsCalculated}
            />
          </div>

          {/* ECONOMIC IMPACT PANEL */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all">
            <EconomicImpactPanel gridStats={gridStats} />
          </div>
        </div>

        {/* RIGHT COLUMN: STATUS & INSIGHTS */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* LIVE STATUS */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all">
            <LiveStatus connected={connected} detections={detectionsWithGPS} />
          </div>

          {/* STATS PANEL */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all">
            <StatsPanel detections={detectionsWithGPS} />
          </div>

          {/* DETECTION FEED - Styled as Live Insights */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all flex-1 min-h-[300px]">
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/20">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
                <span>📄</span>
                Live Detection Feed
              </div>
            </div>
            <div className="p-4 h-[calc(100%-52px)] overflow-y-auto">
              <DetectionFeed detections={detectionsWithGPS} />
            </div>
          </div>

          {/* ALERTS & DECISION PANEL - Styled as Action Card */}
          <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-emerald-800/50 rounded-xl p-5 shadow-lg">
            <AlertsDecisionPanel
              detections={detectionsWithGPS}
              gridStats={gridStats}
              economicImpact={economicImpact}
              onAlertsUpdate={handleAlertsUpdate}
            />
          </div>
        </div>

        {/* BOTTOM ROW: ADDITIONAL PANELS */}
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FUSION INSIGHT PANEL */}
          <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:border-emerald-500/30 transition-all">
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
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-900/50 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        {latestSessionId && `Active Session: ${latestSessionId} • `}
        {mode === 'firebase' && '🔥 Firebase Real-time • '}
        {mode === 'local' && '📁 Local Mode • '}
        Powered by YOLOv8 + React + Leaflet
      </footer>
    </div>
  );
};

export default Dashboard;
