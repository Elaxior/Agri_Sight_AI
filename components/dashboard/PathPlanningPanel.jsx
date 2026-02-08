"use client"

import React, { useState, useMemo, useEffect } from "react"
import { mapDetectionsToGrid } from "@/lib/zoneDetection"
import { generateSprayPath } from "@/lib/pathPlanner"
import { calculateGridStats } from "@/lib/fieldGrid"
import { Navigation, MapPin, Ruler, Clock, Trash2, Target, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PathPlanningPanel({ detections, onPathGenerated, onGridStatsCalculated }) {
  const [pathData, setPathData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const gridData = useMemo(() => {
    if (!detections || detections.length === 0) return null
    const detectionsWithValidGPS = detections.filter((d) => d.gps)
    if (detectionsWithValidGPS.length === 0) return null
    try {
      const grid = mapDetectionsToGrid(detections)
      const stats = calculateGridStats(grid)
      return { grid, stats }
    } catch (error) {
      console.error("Error creating grid:", error)
      return null
    }
  }, [detections])

  useEffect(() => {
    if (gridData && onGridStatsCalculated) {
      onGridStatsCalculated(gridData.stats)
    } else if (!gridData && onGridStatsCalculated) {
      onGridStatsCalculated(null)
    }
  }, [gridData, onGridStatsCalculated])

  const handleGeneratePath = () => {
    if (!gridData) return
    setIsGenerating(true)
    setTimeout(() => {
      try {
        const path = generateSprayPath(gridData.grid)
        setPathData(path)
        if (onPathGenerated) onPathGenerated(path)
      } catch (error) {
        console.error("Error generating path:", error)
      }
      setIsGenerating(false)
    }, 500)
  }

  const handleClearPath = () => {
    setPathData(null)
    if (onPathGenerated) onPathGenerated(null)
  }

  if (!detections || detections.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
          <div className="flex items-center gap-2 text-amber-400 font-semibold tracking-wide text-sm uppercase">
            <Navigation size={16} />
            Spray Path Planning
          </div>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-slate-600 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Waiting for detection data...</p>
          <p className="text-slate-600 text-xs mt-1">Path planning will be available after detections are received</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center gap-2 text-amber-400 font-semibold tracking-wide text-sm uppercase">
          <Navigation size={16} />
          Precision Spray Path
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Field Statistics */}
        {gridData && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Infected Zones</div>
              <div className="text-lg font-bold text-red-400 font-mono">
                {gridData.stats.infectedCount}
                <span className="text-xs text-slate-500 font-normal"> / {gridData.stats.totalCells}</span>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Coverage</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{gridData.stats.infectedPercentage}%</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Chemical Savings</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{gridData.stats.chemicalSavings}%</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div>
          {!pathData ? (
            <button
              onClick={handleGeneratePath}
              disabled={isGenerating || !gridData}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all",
                isGenerating || !gridData
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-900/20"
              )}
            >
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> Calculating...</>
              ) : (
                <><Target size={16} /> Generate Spray Path</>
              )}
            </button>
          ) : (
            <button
              onClick={handleClearPath}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Trash2 size={16} /> Clear Path
            </button>
          )}
        </div>

        {/* Path Metrics */}
        {pathData && pathData.pathExists && (
          <div className="bg-slate-800/30 border border-amber-500/20 rounded-lg p-4 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Path Details</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-amber-400" />
                <div>
                  <div className="text-xs text-slate-500">Waypoints</div>
                  <div className="text-sm font-bold text-white font-mono">{pathData.waypoints.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler size={14} className="text-amber-400" />
                <div>
                  <div className="text-xs text-slate-500">Distance</div>
                  <div className="text-sm font-bold text-white font-mono">{pathData.totalDistance}m</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-amber-400" />
                <div>
                  <div className="text-xs text-slate-500">Est. Time</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {Math.floor(pathData.estimatedTime / 60)}m {pathData.estimatedTime % 60}s
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-md text-xs font-medium border border-emerald-500/20">
              <CheckCircle size={14} />
              Optimized for precision spraying
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckCircle({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
