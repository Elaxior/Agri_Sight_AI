"use client"

import React, { useState, useEffect, useMemo } from "react"
import { extractSignals, evaluateAlerts, resolveConflicts, alertDebouncer } from "@/lib/alertRuleEngine"
import { getSensorData } from "@/lib/sensorSimulator"
import { performFusion } from "@/lib/fusionEngine"
import { AlertTriangle, Bell, CheckCircle2, ChevronDown, ChevronUp, Calendar, Loader2, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AlertsDecisionPanel({ detections, gridStats, economicImpact, onAlertsUpdate }) {
  const [alerts, setAlerts] = useState([])
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set())
  const [scheduledActions, setScheduledActions] = useState(new Map())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fusionResults = useMemo(() => {
    if (!detections || detections.length === 0) return []
    const sensorData = getSensorData()
    return detections.slice(0, 10).map((detection) => performFusion(detection, sensorData))
  }, [detections])

  useEffect(() => {
    if (!gridStats) return
    const sensorData = getSensorData()
    const signals = extractSignals(detections, gridStats, economicImpact, fusionResults, sensorData)
    let newAlerts = evaluateAlerts(signals)
    newAlerts = resolveConflicts(newAlerts)
    newAlerts = newAlerts.filter((alert) => alertDebouncer.shouldShowAlert(alert))
    setAlerts(newAlerts)
  }, [detections, gridStats, economicImpact, fusionResults])

  useEffect(() => {
    if (alerts.length > 0 && onAlertsUpdate) onAlertsUpdate(alerts)
  }, [alerts, onAlertsUpdate])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => setAlerts((prev) => [...prev]), 10000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleAcknowledge = (alertId) => {
    setAcknowledgedAlerts((prev) => new Set([...prev, alertId]))
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() } : alert
      )
    )
  }

  const handleScheduleAction = (alertId, scheduledTime) => {
    setScheduledActions((prev) => new Map(prev).set(alertId, scheduledTime))
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, actionScheduled: true, scheduledFor: scheduledTime } : alert
      )
    )
  }

  const alertCounts = useMemo(() => ({
    critical: alerts.filter((a) => a.type === "CRITICAL").length,
    warning: alerts.filter((a) => a.type === "WARNING").length,
    info: alerts.filter((a) => a.type === "INFO").length,
    total: alerts.length,
  }), [alerts])

  if (!gridStats || !detections || detections.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400 font-semibold tracking-wide text-sm uppercase">
            <Bell size={16} />
            Intelligent Alerts & Decisions
          </div>
          <span className={cn("text-xs font-mono", autoRefresh ? "text-emerald-400" : "text-slate-500")}>
            {autoRefresh ? "LIVE" : "PAUSED"}
          </span>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-slate-600 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Waiting for field analysis...</p>
          <p className="text-slate-600 text-xs mt-1">Alerts will appear when conditions require attention</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold tracking-wide text-sm uppercase">
            <Bell size={16} />
            Alerts & Decisions
          </div>
          <div className="flex gap-1">
            {alertCounts.critical > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
                {alertCounts.critical} Critical
              </span>
            )}
            {alertCounts.warning > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                {alertCounts.warning} Warning
              </span>
            )}
            {alertCounts.info > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                {alertCounts.info} Info
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={cn(
            "flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors",
            autoRefresh
              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
              : "text-slate-500 border-slate-700 bg-slate-800"
          )}
        >
          {autoRefresh ? <Play size={10} /> : <Pause size={10} />}
          {autoRefresh ? "Live" : "Paused"}
        </button>
      </div>

      <div className="p-5 flex flex-col gap-3 max-h-[500px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
            <h4 className="text-white font-semibold text-sm">All Systems Normal</h4>
            <p className="text-slate-500 text-xs">No critical or warning conditions detected</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              acknowledged={acknowledgedAlerts.has(alert.id)}
              scheduled={scheduledActions.has(alert.id)}
              onAcknowledge={handleAcknowledge}
              onSchedule={handleScheduleAction}
            />
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-700/50 flex gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Critical: 0-24h</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Warning: 24-48h</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Info: Monitor</span>
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert, acknowledged, scheduled, onAcknowledge, onSchedule }) {
  const [showDetails, setShowDetails] = useState(false)
  const [scheduleTime, setScheduleTime] = useState("")

  const typeColors = {
    CRITICAL: { border: "border-l-red-500", bg: "bg-red-500/5", badge: "bg-red-500/20 text-red-400 border-red-500/30", icon: "text-red-400" },
    WARNING: { border: "border-l-amber-500", bg: "bg-amber-500/5", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: "text-amber-400" },
    INFO: { border: "border-l-blue-500", bg: "bg-blue-500/5", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: "text-blue-400" },
  }

  const colors = typeColors[alert.type] || typeColors.INFO

  return (
    <div className={cn("rounded-lg border border-slate-700/50 border-l-4 overflow-hidden transition-all", colors.border, colors.bg, acknowledged && "opacity-60")}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className={cn("mt-0.5 shrink-0", colors.icon)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-mono", colors.badge)}>{alert.type}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>

            <div className="bg-slate-800/50 rounded px-3 py-2 mt-2 border border-slate-700/30">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Recommended Action</span>
              <p className="text-xs text-slate-300 mt-0.5">{alert.action}</p>
            </div>

            {/* Metadata */}
            {(alert.metadata?.estimatedLoss || alert.metadata?.savingsPotential || alert.metadata?.benefit) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {alert.metadata.estimatedLoss && (
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                    Est. Loss: {"\u20B9"}{(alert.metadata.estimatedLoss / 1000).toFixed(0)}k
                  </span>
                )}
                {alert.metadata.savingsPotential && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    Savings: {alert.metadata.savingsPotential}
                  </span>
                )}
                {alert.metadata.benefit && (
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                    {alert.metadata.benefit}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {!acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  Acknowledge
                </button>
              )}

              {acknowledged && !scheduled && alert.type !== "INFO" && (
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => scheduleTime && onSchedule(alert.id, scheduleTime)}
                    disabled={!scheduleTime}
                    className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <Calendar size={10} /> Schedule
                  </button>
                </div>
              )}

              {scheduled && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Scheduled: {new Date(alert.scheduledFor).toLocaleString()}
                </span>
              )}

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto flex items-center gap-1"
              >
                {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showDetails ? "Hide" : "Details"}
              </button>
            </div>

            {/* Details */}
            {showDetails && (
              <div className="mt-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700/30 grid grid-cols-2 lg:grid-cols-3 gap-2 animate-fade-in">
                <DetailItem label="Infection" value={`${alert.signals.infectionPercentage.toFixed(1)}%`} />
                <DetailItem label="ROI" value={`${alert.signals.roiRatio.toFixed(1)}x`} />
                <DetailItem label="Soil Moisture" value={`${alert.signals.soilMoisture.toFixed(0)}%`} />
                <DetailItem label="Temperature" value={`${alert.signals.soilTemperature.toFixed(1)}°C`} />
                <DetailItem label="Humidity" value={`${alert.signals.airHumidity.toFixed(0)}%`} />
                <DetailItem label="Diagnosis" value={alert.signals.fusionDiagnosis} />
                <div className="col-span-full text-[10px] text-slate-600 font-mono">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-xs text-white font-mono">{value}</div>
    </div>
  )
}
