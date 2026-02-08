"use client"

import React, { useState, useEffect, useMemo } from "react"
import { getSensorData } from "@/lib/sensorSimulator"
import { performFusion } from "@/lib/fusionEngine"
import { Thermometer, Droplets, Wind, Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FusionInsightPanel({ detections, onSensorDataUpdate, onFusionResults }) {
  const [sensorData, setSensorData] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Poll sensor data
  useEffect(() => {
    const fetchSensor = () => {
      try {
        const data = getSensorData()
        setSensorData(data)
        if (onSensorDataUpdate) onSensorDataUpdate(data)
      } catch (error) {
        console.error("Sensor data error:", error)
      }
    }

    fetchSensor()
    const interval = setInterval(fetchSensor, 5000)
    return () => clearInterval(interval)
  }, [onSensorDataUpdate])

  // Perform fusion analysis
  const fusionResults = useMemo(() => {
    if (!detections || detections.length === 0 || !sensorData) return []
    try {
      const results = detections.slice(0, 10).map((det) => performFusion(det, sensorData))
      return results
    } catch (error) {
      console.error("Fusion error:", error)
      return []
    }
  }, [detections, sensorData])

  // Notify parent of fusion results
  useEffect(() => {
    if (fusionResults.length > 0 && onFusionResults) {
      onFusionResults(fusionResults)
    }
  }, [fusionResults, onFusionResults])

  const handleRefresh = () => {
    setIsRefreshing(true)
    const data = getSensorData()
    setSensorData(data)
    if (onSensorDataUpdate) onSensorDataUpdate(data)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const topDiagnosis = fusionResults[0]?.diagnosis

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold tracking-wide text-sm uppercase">
          <Zap size={16} />
          Multimodal Fusion Insight
        </div>
        <button
          onClick={handleRefresh}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
        >
          <Loader2 size={12} className={cn(isRefreshing && "animate-spin")} />
          Refresh Sensors
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Sensor Data Grid */}
        {sensorData ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <SensorCard
              icon={<Thermometer size={14} />}
              label="Air Temp"
              value={`${(sensorData.air_temperature || 0).toFixed(1)}°C`}
              color="text-red-400"
              bgColor="bg-red-500/5 border-red-500/20"
            />
            <SensorCard
              icon={<Droplets size={14} />}
              label="Humidity"
              value={`${(sensorData.air_humidity || 0).toFixed(1)}%`}
              color="text-blue-400"
              bgColor="bg-blue-500/5 border-blue-500/20"
            />
            <SensorCard
              icon={<Thermometer size={14} />}
              label="Soil Temp"
              value={`${(sensorData.soil_temperature || 0).toFixed(1)}°C`}
              color="text-amber-400"
              bgColor="bg-amber-500/5 border-amber-500/20"
            />
            <SensorCard
              icon={<Droplets size={14} />}
              label="Soil Moisture"
              value={`${(sensorData.soil_moisture || 0).toFixed(1)}%`}
              color="text-cyan-400"
              bgColor="bg-cyan-500/5 border-cyan-500/20"
            />
            <SensorCard
              icon={<Wind size={14} />}
              label="Soil pH"
              value={(sensorData.soil_ph || 0).toFixed(2)}
              color="text-emerald-400"
              bgColor="bg-emerald-500/5 border-emerald-500/20"
            />
            <SensorCard
              icon={<Wind size={14} />}
              label="Wind Speed"
              value={`${(sensorData.wind_speed || 0).toFixed(1)} km/h`}
              color="text-slate-300"
              bgColor="bg-slate-800/50 border-slate-700/30"
            />
          </div>
        ) : (
          <div className="text-center py-4">
            <Loader2 className="mx-auto h-6 w-6 text-slate-600 animate-spin mb-2" />
            <p className="text-xs text-slate-500">Initializing sensors...</p>
          </div>
        )}

        {/* Fusion Diagnosis */}
        {topDiagnosis && (
          <div className="bg-gradient-to-r from-cyan-900/20 to-slate-900 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">
              Primary Fusion Diagnosis
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{topDiagnosis.refined_diagnosis || "Analyzing..."}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  topDiagnosis.severity === "high" && "bg-red-500/20 text-red-400 border border-red-500/30",
                  topDiagnosis.severity === "medium" && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                  topDiagnosis.severity === "low" && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                  !topDiagnosis.severity && "bg-slate-700/50 text-slate-400"
                )}>
                  {topDiagnosis.severity || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Confidence: <strong className="text-cyan-400">{((topDiagnosis.confidence || 0) * 100).toFixed(1)}%</strong></span>
                <span>Analyses: <strong className="text-cyan-400">{fusionResults.length}</strong></span>
              </div>
              {topDiagnosis.action && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{topDiagnosis.action}</p>
              )}
            </div>
          </div>
        )}

        {!topDiagnosis && detections && detections.length > 0 && sensorData && (
          <div className="text-center py-2">
            <p className="text-xs text-slate-500">Processing fusion analysis...</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SensorCard({ icon, label, value, color, bgColor }) {
  return (
    <div className={cn("rounded-lg p-3 border", bgColor)}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[10px] text-slate-500 uppercase">{label}</span>
      </div>
      <div className={cn("text-sm font-bold font-mono", color)}>{value}</div>
    </div>
  )
}
