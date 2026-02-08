"use client"

import React from "react"
import { formatDistanceToNow } from "date-fns"
import { Activity, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DetectionFeed({ detections }) {
  const recentDetections = detections ? detections.slice(0, 50) : []

  if (recentDetections.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
            <Activity size={16} />
            Detection Feed
          </div>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-slate-600 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Waiting for detections...</p>
          <p className="text-slate-600 text-xs mt-1">Run inference to see live updates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
          <Activity size={16} />
          Detection Feed
        </div>
        <span className="text-xs text-slate-500 font-mono">{recentDetections.length} entries</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-4 flex flex-col gap-2">
        {recentDetections.map((detection) => (
          <DetectionCard key={detection.id} detection={detection} />
        ))}
      </div>
    </div>
  )
}

function DetectionCard({ detection }) {
  const { frame_id, timestamp, detection_count, detections: diseaseList = [] } = detection

  let timeAgo = ""
  try {
    timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  } catch {
    timeAgo = "recently"
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 hover:border-emerald-500/20 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded">
          Frame {frame_id}
        </span>
        <span className="text-[10px] text-slate-500">{timeAgo}</span>
      </div>

      <div className="text-xs text-slate-300 mb-2">
        <strong className="text-white">{detection_count}</strong> disease{detection_count !== 1 ? "s" : ""} detected
      </div>

      {diseaseList.length > 0 && (
        <div className="flex flex-col gap-1">
          {diseaseList.map((disease, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-xs text-slate-400 truncate">{disease.class_name}</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded",
                  disease.confidence > 0.7
                    ? "bg-emerald-500/10 text-emerald-400"
                    : disease.confidence > 0.4
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-red-500/10 text-red-400"
                )}
              >
                {(disease.confidence * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
