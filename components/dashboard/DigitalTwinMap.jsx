"use client"

import React, { useState, useEffect } from "react"
import { Map as MapIcon, Layers, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DigitalTwinMap({ isScanning, overlay, setOverlay, detections, sprayPath }) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    let interval
    if (isScanning) {
      interval = setInterval(() => {
        setRotation((r) => r + 0.5)
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isScanning])

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg transition-all hover:border-emerald-500/30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
          <MapIcon size={16} />
          3D Digital Farm Twin
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={() => setOverlay("ndvi")}
            className={cn(
              "px-2 py-1 text-xs rounded border transition-colors",
              overlay === "ndvi" ? "bg-emerald-900/50 border-emerald-500 text-emerald-400" : "border-slate-700 text-slate-400"
            )}
          >
            NDVI
          </button>
          <button
            onClick={() => setOverlay("pest")}
            className={cn(
              "px-2 py-1 text-xs rounded border transition-colors",
              overlay === "pest" ? "bg-rose-900/50 border-rose-500 text-rose-400" : "border-slate-700 text-slate-400"
            )}
          >
            PEST
          </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative h-[400px] lg:h-[500px] overflow-hidden bg-slate-950 group" style={{ perspective: "1000px" }}>
        {/* 3D Transform Container */}
        <div
          className="absolute inset-[-50%] w-[200%] h-[200%] transition-transform duration-700 ease-out"
          style={{
            transform: `rotateX(60deg) rotateZ(${rotation}deg) scale(1.5)`,
            backgroundImage:
              'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30" />

          {/* Heatmap Layers */}
          {overlay === "ndvi" && (
            <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-emerald-500/20 via-transparent to-yellow-500/20 mix-blend-overlay animate-pulse" />
          )}
          {overlay === "pest" && (
            <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-red-500/30 blur-[60px] rounded-full animate-pulse" />
          )}

          {/* Parcel Polygons */}
          <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
            <path d="M 800 600 L 1200 650 L 1150 900 L 750 850 Z" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="2" />
            <path d="M 1250 650 L 1600 700 L 1550 950 L 1200 900 Z" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth="2" />
          </svg>
        </div>

        {/* Scanning Laser */}
        {isScanning && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent h-[10%] w-full animate-scan pointer-events-none border-b border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
        )}

        {/* Detection Markers Overlay */}
        {detections && detections.length > 0 && (
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 p-2 rounded-lg backdrop-blur-sm z-10">
            <div className="text-[10px] text-emerald-400 font-mono">
              {detections.length} detections mapped
            </div>
            {sprayPath && sprayPath.pathExists && (
              <div className="text-[10px] text-blue-400 font-mono mt-1">
                Spray path: {sprayPath.waypoints.length} waypoints
              </div>
            )}
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 no-print">
          <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-slate-800 text-slate-300 transition-colors">
            <Layers size={18} />
          </button>
          <button className="p-2 bg-slate-900/80 border border-slate-700 rounded hover:bg-slate-800 text-slate-300 transition-colors">
            <Maximize2 size={18} />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 p-3 rounded-lg backdrop-blur-sm">
          <h4 className="text-xs text-slate-400 uppercase font-semibold mb-2">Spectral Index</h4>
          <div className="flex items-center gap-2">
            <div className="h-3 w-32 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" />
            <span className="text-xs font-mono text-emerald-400">0.92</span>
          </div>
        </div>

        {/* Processing Overlay */}
        {isScanning && (
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-emerald-500/50 p-3 rounded-lg backdrop-blur-md shadow-lg flex flex-col gap-2 w-48 z-10 no-print">
            <div className="flex justify-between items-center text-xs text-emerald-400 font-mono">
              <span>PROCESSING</span>
              <span className="animate-pulse">LIVE</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-pulse w-3/4 transition-all duration-300" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">Model: YOLOv8-Ag + ResNet50</div>
          </div>
        )}
      </div>
    </div>
  )
}
