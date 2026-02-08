"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useDetections, useLatestSession } from "@/hooks/useDetections"
import { generateFieldGPS } from "@/lib/gpsSimulator"
import { calculateEconomicImpact } from "@/lib/economicCalculator"
import Header from "./Header"
import MetricsRow from "./MetricsRow"
import DigitalTwinMap from "./DigitalTwinMap"
import VideoInputPanel from "./VideoInputPanel"
import PathPlanningPanel from "./PathPlanningPanel"
import EconomicImpactPanel from "./EconomicImpactPanel"
import FusionInsightPanel from "./FusionInsightPanel"
import AlertsDecisionPanel from "./AlertsDecisionPanel"
import MissionReportPanel from "./MissionReportPanel"
import StatsPanel from "./StatsPanel"
import DetectionFeed from "./DetectionFeed"
import LiveInsightsFeed from "./LiveInsightsFeed"
import ModelEnsembleStatus from "./ModelEnsembleStatus"
import { Loader2 } from "lucide-react"

export default function Dashboard() {
  const { detections, loading, error, connected, clearDetections, mode } = useDetections()
  const { latestSessionId } = useLatestSession()
  const [sprayPath, setSprayPath] = useState(null)
  const [gridStats, setGridStats] = useState(null)
  const [economicImpact, setEconomicImpact] = useState(null)
  const [sensorData, setSensorData] = useState(null)
  const [fusionResults, setFusionResults] = useState([])
  const [alerts, setAlerts] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [gpsCache, setGpsCache] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [overlay, setOverlay] = useState("ndvi")
  const [logs, setLogs] = useState([])

  const [missionMetadata] = useState({
    fieldId: latestSessionId || "FIELD-001",
    fieldName: "North Agricultural Plot",
    fieldAreaHectares: 12.5,
    missionStart: new Date().toISOString(),
    operatorName: "Field Operator",
    droneModel: "DJI Mavic 3 Enterprise",
  })

  const detectionsWithGPS = useMemo(() => {
    return detections.map((detection) => {
      if (detection.gps) return detection
      const cacheKey = `${detection.session_id}_${detection.frame_id}`
      if (gpsCache[cacheKey]) {
        return { ...detection, gps: gpsCache[cacheKey] }
      }
      const newGps = generateFieldGPS()
      setGpsCache((prev) => ({ ...prev, [cacheKey]: newGps }))
      return { ...detection, gps: newGps }
    })
  }, [detections, gpsCache])

  // Derive metrics from detections
  const metrics = useMemo(() => {
    const totalDetections = detectionsWithGPS.reduce((sum, det) => sum + (det.detection_count || 0), 0)
    const framesProcessed = detectionsWithGPS.length
    const avgPerFrame = framesProcessed > 0 ? (totalDetections / framesProcessed).toFixed(1) : "0"
    return { totalDetections, framesProcessed, avgPerFrame }
  }, [detectionsWithGPS])

  const handlePathGenerated = (path) => {
    if (path === null) {
      setSprayPath(null)
      return
    }
    if (path && path.pathExists) {
      setSprayPath(path)
    }
  }

  const handleGridStatsCalculated = (stats) => {
    setGridStats(stats)
  }

  useEffect(() => {
    if (gridStats) {
      const impact = calculateEconomicImpact(gridStats)
      setEconomicImpact(impact)
    }
  }, [gridStats])

  const handleSensorDataUpdate = (data) => {
    setSensorData(data)
  }

  const handleFusionResults = (results) => {
    setFusionResults(results)
  }

  const handleAlertsUpdate = (alertsData) => {
    setAlerts(alertsData)
    const recs = alertsData.map((alert) => alert.action).filter(Boolean)
    setRecommendations(recs)
  }

  const handleReportGenerated = (reportInfo) => {
    console.log("Report generated:", reportInfo)
  }

  const handleAnalysisStarted = (sessionId) => {
    setIsProcessing(true)
    if (clearDetections) clearDetections()
    setSprayPath(null)
    setGridStats(null)
    setEconomicImpact(null)
    setSensorData(null)
    setFusionResults([])
    setAlerts([])
    setRecommendations([])
    setGpsCache({})
    setLogs([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: "Drone imagery upload complete. Initializing pipeline...",
        type: "info",
      },
    ])
  }

  const handleAnalysisComplete = () => {
    setIsProcessing(false)
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: "Pipeline Analysis Complete. Report Ready.",
        type: "success",
      },
    ])
  }

  // Simulate processing insights
  useEffect(() => {
    if (!isProcessing) return
    const interval = setInterval(() => {
      const insightsDb = [
        "Detected minor nitrogen deficiency in Zone B-4.",
        "Irrigation schedule optimization: +12% efficiency predicted.",
        "Pest hotspot identified: Aphid cluster in Sector 7.",
        "NDVI trending positive following recent rainfall.",
        "Drone telemetry signal strength: 98% (Stable).",
        "Soil moisture levels dropping in North Quadrant.",
        "Weed density increasing in buffer zones.",
        "Yield forecast updated based on latest spectral data.",
      ]
      if (Math.random() > 0.6) {
        const newLog = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          text: insightsDb[Math.floor(Math.random() * insightsDb.length)],
          type: Math.random() > 0.8 ? "alert" : "info",
        }
        setLogs((prev) => [...prev.slice(-15), newLog])
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [isProcessing])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
        <p className="text-muted-foreground font-mono text-sm">Connecting to Analytics Engine...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-xl font-bold text-red-400">Connection Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isProcessing={isProcessing}
        onUpload={handleAnalysisStarted}
        connected={connected}
        mode={mode}
        latestSessionId={latestSessionId}
      />

      <main className="p-4 lg:p-6 grid grid-cols-12 gap-4 lg:gap-6 max-w-[1920px] mx-auto">
        {/* Top Metrics Row */}
        <MetricsRow
          connected={connected}
          metrics={metrics}
          detections={detectionsWithGPS}
          gridStats={gridStats}
        />

        {/* Left Column: Visual Twin + Charts + Panels */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 lg:gap-6">
          {/* 3D Map */}
          <DigitalTwinMap
            isScanning={isProcessing}
            overlay={overlay}
            setOverlay={setOverlay}
            detections={detectionsWithGPS}
            sprayPath={sprayPath}
          />

          {/* Video Input */}
          <VideoInputPanel
            onAnalysisStarted={handleAnalysisStarted}
            onAnalysisComplete={handleAnalysisComplete}
          />

          {/* Spray Path Planning */}
          <PathPlanningPanel
            detections={detectionsWithGPS}
            onPathGenerated={handlePathGenerated}
            onGridStatsCalculated={handleGridStatsCalculated}
          />

          {/* Economic Impact */}
          <EconomicImpactPanel gridStats={gridStats} />

          {/* Fusion Insight */}
          <FusionInsightPanel
            detections={detectionsWithGPS}
            onSensorDataUpdate={handleSensorDataUpdate}
            onFusionResults={handleFusionResults}
          />

          {/* Alerts & Decision */}
          <AlertsDecisionPanel
            detections={detectionsWithGPS}
            gridStats={gridStats}
            economicImpact={economicImpact}
            onAlertsUpdate={handleAlertsUpdate}
          />

          {/* Mission Report */}
          <MissionReportPanel
            missionMetadata={missionMetadata}
            detections={detectionsWithGPS}
            gridStats={gridStats}
            economicData={economicImpact}
            sensorData={sensorData}
            fusionResults={fusionResults}
            alerts={alerts}
            recommendations={recommendations}
            onReportGenerated={handleReportGenerated}
          />

          {/* Stats */}
          <StatsPanel detections={detectionsWithGPS} />

          {/* Detection Feed */}
          <DetectionFeed detections={detectionsWithGPS} />
        </div>

        {/* Right Column: Insights & Logs */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 lg:gap-6">
          <ModelEnsembleStatus isProcessing={isProcessing} />
          <LiveInsightsFeed logs={logs} />

          {/* Intervention Card */}
          <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-emerald-800/50 rounded-xl p-5 shadow-lg no-print">
            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 text-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Intervention Recommended
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Based on current spectral analysis, variable rate nitrogen application is recommended for Zone B.
            </p>
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg transition-colors text-sm shadow-lg shadow-emerald-900/20">
              Generate Prescription Map
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
