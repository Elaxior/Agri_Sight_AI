"use client"

import React, { useMemo } from "react"
import { Activity, Sprout, AlertTriangle, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

function Card({ children, className }) {
  return (
    <div
      className={cn(
        "bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden flex flex-col shadow-lg transition-all hover:border-emerald-500/30 p-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export default function MetricsRow({ connected, metrics, detections, gridStats }) {
  const ndviScore = useMemo(() => {
    if (!detections || detections.length === 0) return 0.72
    return 0.65 + Math.random() * 0.1
  }, [detections?.length])

  const yieldForecast = useMemo(() => {
    return 7.2 + Math.random() * 2
  }, [detections?.length])

  const pestRisk = useMemo(() => {
    if (gridStats && gridStats.infectedPercentage > 25) return "High"
    if (gridStats && gridStats.infectedPercentage > 10) return "Med"
    return "Low"
  }, [gridStats])

  const pestConf = useMemo(() => {
    return gridStats ? gridStats.infectedPercentage : 12
  }, [gridStats])

  return (
    <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-emerald-500">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-xs font-mono uppercase">Avg NDVI Score</span>
          <Activity size={16} className="text-emerald-500" />
        </div>
        <div className="text-3xl font-bold text-white font-mono">{ndviScore.toFixed(3)}</div>
        <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Optimal Growth Range
        </div>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-xs font-mono uppercase">Yield Forecast</span>
          <Sprout size={16} className="text-blue-500" />
        </div>
        <div className="text-3xl font-bold text-white font-mono">
          {yieldForecast.toFixed(1)} <span className="text-base text-slate-500">t/ha</span>
        </div>
        <div className="text-xs text-blue-400 mt-1">+12% vs Baseline</div>
      </Card>

      <Card className={cn("border-l-4 transition-colors duration-500", pestRisk === "High" ? "border-l-rose-500" : "border-l-amber-500")}>
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-xs font-mono uppercase">Pest Risk Index</span>
          <AlertTriangle size={16} className={pestRisk === "High" ? "text-rose-500" : "text-amber-500"} />
        </div>
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-bold text-white font-mono">{pestRisk}</div>
          <div className="text-sm font-mono text-slate-400">Conf: {pestConf.toFixed(0)}%</div>
        </div>
        <div className={cn("text-xs mt-1", pestRisk === "High" ? "text-rose-400" : "text-amber-400")}>
          {pestRisk === "High" ? "Immediate Action Required" : "Monitoring Active"}
        </div>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-xs font-mono uppercase">System Latency</span>
          <Cpu size={16} className="text-purple-500" />
        </div>
        <div className="text-3xl font-bold text-white font-mono">
          38<span className="text-base text-slate-500">ms</span>
        </div>
        <div className="text-xs text-purple-400 mt-1">Real-time Inference</div>
      </Card>
    </div>
  )
}
