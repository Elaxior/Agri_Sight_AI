"use client"

import React from "react"
import { Radio, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LiveInsightsFeed({ logs }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-xs uppercase">
          <Radio size={14} />
          Live Insights
        </div>
        <span className="text-[10px] text-emerald-400 font-mono animate-pulse">LIVE</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto p-3 flex flex-col gap-1.5">
        {(!logs || logs.length === 0) ? (
          <div className="text-center py-4">
            <p className="text-xs text-slate-500">No active insights. Start an analysis to see live updates.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-2 px-3 py-2 rounded-lg text-xs animate-fade-in",
                log.type === "alert" && "bg-red-500/5 border border-red-500/10",
                log.type === "success" && "bg-emerald-500/5 border border-emerald-500/10",
                log.type === "info" && "bg-slate-800/50 border border-slate-700/30"
              )}
            >
              <span className="mt-0.5 shrink-0">
                {log.type === "alert" && <AlertTriangle size={12} className="text-red-400" />}
                {log.type === "success" && <CheckCircle2 size={12} className="text-emerald-400" />}
                {log.type === "info" && <Info size={12} className="text-blue-400" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "leading-relaxed",
                  log.type === "alert" && "text-red-300",
                  log.type === "success" && "text-emerald-300",
                  log.type === "info" && "text-slate-300"
                )}>
                  {log.text}
                </p>
                <span className="text-[10px] text-slate-600 font-mono">{log.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
