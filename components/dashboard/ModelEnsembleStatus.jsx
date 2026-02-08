"use client"

import React from "react"
import { Cpu, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const models = [
  { name: "YOLOv8-Agri", type: "Object Detection", accuracy: "94.2%", color: "text-emerald-400", bgColor: "bg-emerald-500" },
  { name: "ResNet-50 Classifier", type: "Disease Classification", accuracy: "91.8%", color: "text-blue-400", bgColor: "bg-blue-500" },
  { name: "NDVI Analyzer", type: "Spectral Analysis", accuracy: "97.1%", color: "text-amber-400", bgColor: "bg-amber-500" },
  { name: "Fusion Engine v2", type: "Multi-Modal Fusion", accuracy: "89.5%", color: "text-cyan-400", bgColor: "bg-cyan-500" },
]

export default function ModelEnsembleStatus({ isProcessing }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-400 font-semibold tracking-wide text-xs uppercase">
          <Cpu size={14} />
          Model Ensemble
        </div>
        <span className={cn(
          "text-[10px] font-mono px-1.5 py-0.5 rounded",
          isProcessing
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse"
            : "bg-slate-700/50 text-slate-400"
        )}>
          {isProcessing ? "ACTIVE" : "STANDBY"}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {models.map((model) => (
          <div key={model.name} className="flex items-center gap-3 bg-slate-800/30 rounded-lg px-3 py-2 border border-slate-700/20">
            <CheckCircle2 size={12} className={cn(model.color, isProcessing && "animate-pulse")} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{model.name}</div>
              <div className="text-[10px] text-slate-500">{model.type}</div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className={cn("text-[10px] font-mono font-bold", model.color)}>{model.accuracy}</span>
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", model.bgColor)}
                  style={{ width: model.accuracy }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
