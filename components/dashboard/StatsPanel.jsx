"use client"

import React, { useMemo } from "react"
import { BarChart3, Target, Layers, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StatsPanel({ detections }) {
  const stats = useMemo(() => {
    if (!detections || detections.length === 0) {
      return { totalDiseases: 0, uniqueDiseases: 0, highConfidence: 0, diseaseTypes: {} }
    }

    const diseaseTypes = {}
    let totalDiseases = 0
    let highConfidence = 0

    detections.forEach((detection) => {
      const diseaseList = detection.detections || []
      diseaseList.forEach((disease) => {
        totalDiseases++
        const name = disease.class_name
        diseaseTypes[name] = (diseaseTypes[name] || 0) + 1
        if (disease.confidence > 0.7) highConfidence++
      })
    })

    return { totalDiseases, uniqueDiseases: Object.keys(diseaseTypes).length, highConfidence, diseaseTypes }
  }, [detections])

  const topDiseases = useMemo(() => {
    return Object.entries(stats.diseaseTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [stats.diseaseTypes])

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center gap-2 text-blue-400 font-semibold tracking-wide text-sm uppercase">
          <BarChart3 size={16} />
          Analytics
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox icon={<Target size={14} />} value={stats.totalDiseases} label="Total Diseases" color="text-red-400" />
          <StatBox icon={<Layers size={14} />} value={stats.uniqueDiseases} label="Unique Types" color="text-blue-400" />
          <StatBox icon={<CheckCircle2 size={14} />} value={stats.highConfidence} label="High Confidence" color="text-emerald-400" />
          <StatBox
            icon={<BarChart3 size={14} />}
            value={`${stats.totalDiseases > 0 ? ((stats.highConfidence / stats.totalDiseases) * 100).toFixed(0) : 0}%`}
            label="Accuracy"
            color="text-amber-400"
          />
        </div>

        {/* Top Diseases */}
        {topDiseases.length > 0 && (
          <div>
            <h4 className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wide">Top Diseases Detected</h4>
            <div className="flex flex-col gap-2">
              {topDiseases.map((disease) => (
                <div key={disease.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-300 w-32 truncate font-mono">{disease.name}</span>
                  <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600/60 to-blue-400/60 rounded transition-all duration-700 flex items-center px-2"
                      style={{ width: `${(disease.count / topDiseases[0].count) * 100}%` }}
                    >
                      <span className="text-[10px] text-blue-200 font-mono">{disease.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ icon, value, label, color }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 text-center">
      <div className={cn("flex items-center justify-center gap-1 mb-1", color)}>
        {icon}
      </div>
      <div className={cn("text-xl font-bold font-mono", color)}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
