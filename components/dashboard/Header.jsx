"use client"

import React from "react"
import { Sprout, Upload, Activity, Download } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Header({ activeTab, setActiveTab, isProcessing, onUpload, connected, mode, latestSessionId }) {
  const handleUpload = () => {
    if (onUpload) onUpload(null)
  }

  const handleDownloadReport = () => {
    alert("Preparing Report for Print/PDF Export...")
    setTimeout(() => {
      window.print()
    }, 500)
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
          <Sprout className="text-emerald-400" size={24} />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white">
            AgriVision <span className="text-emerald-400">Pro</span>
          </h1>
          <p className="text-[10px] lg:text-xs text-slate-400 font-mono tracking-wider">AI PRECISION ANALYTICS SYSTEM</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
        {["Dashboard", "Spectral", "Soil", "Settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === tab.toLowerCase()
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 lg:gap-3">
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          <span className={cn("inline-block w-2 h-2 rounded-full", connected ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
          <span className="text-xs text-slate-400 font-mono">{connected ? "LIVE" : "OFFLINE"}</span>
        </div>
        <button
          onClick={handleUpload}
          disabled={isProcessing}
          className={cn(
            "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all border",
            isProcessing
              ? "bg-emerald-900/20 border-emerald-800 text-emerald-600"
              : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          )}
        >
          {isProcessing ? <Activity className="animate-spin" size={16} /> : <Upload size={16} />}
          <span className="hidden sm:inline">{isProcessing ? "Processing Stream..." : "Upload Drone Data"}</span>
        </button>
        <button
          onClick={handleDownloadReport}
          className="p-2 text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          title="Generate PDF Report"
        >
          <Download size={18} />
        </button>
      </div>
    </header>
  )
}
