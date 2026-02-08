"use client"

import React, { useMemo } from "react"
import { calculateEconomicImpact, generateSummaryMetrics } from "@/lib/economicCalculator"
import { formatCurrency, formatPercentage } from "@/lib/economicConfig"
import { DollarSign, TrendingUp, Leaf, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EconomicImpactPanel({ gridStats }) {
  const economicImpact = useMemo(() => {
    if (!gridStats) return null
    return calculateEconomicImpact(gridStats)
  }, [gridStats])

  const metrics = useMemo(() => {
    if (!economicImpact) return null
    return generateSummaryMetrics(economicImpact)
  }, [economicImpact])

  if (!gridStats) {
    return (
      <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
            <DollarSign size={16} />
            Economic Impact Analysis
          </div>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-slate-600 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Waiting for detection data...</p>
          <p className="text-slate-600 text-xs mt-1">Economic analysis will appear after detections are processed</p>
        </div>
      </div>
    )
  }

  if (!economicImpact.hasInfection) {
    return (
      <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
            <DollarSign size={16} />
            Economic Impact Analysis
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-3">
            <Leaf size={24} className="text-emerald-400" />
          </div>
          <h4 className="text-white font-semibold mb-1">Field is Healthy!</h4>
          <p className="text-slate-400 text-sm">No disease detected - no intervention needed.</p>
          <p className="text-emerald-400 text-xs mt-2">You are saving 100% on treatment costs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide text-sm uppercase">
          <DollarSign size={16} />
          Economic Impact Analysis
        </div>
        <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
          {economicImpact.message}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.primaryMetrics.map((metric, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg p-3 border flex flex-col gap-1",
                metric.color === "red" && "bg-red-500/5 border-red-500/20",
                metric.color === "green" && "bg-emerald-500/5 border-emerald-500/20",
                metric.color === "blue" && "bg-blue-500/5 border-blue-500/20",
                metric.color === "yellow" && "bg-amber-500/5 border-amber-500/20",
                !["red", "green", "blue", "yellow"].includes(metric.color) && "bg-slate-800/50 border-slate-700/30"
              )}
            >
              <div className="text-xs text-slate-400">{metric.label}</div>
              <div className={cn(
                "text-lg font-bold font-mono",
                metric.color === "red" && "text-red-400",
                metric.color === "green" && "text-emerald-400",
                metric.color === "blue" && "text-blue-400",
                metric.color === "yellow" && "text-amber-400",
                !["red", "green", "blue", "yellow"].includes(metric.color) && "text-white"
              )}>
                {metric.value}
              </div>
              {metric.subtitle && <div className="text-[10px] text-slate-500">{metric.subtitle}</div>}
            </div>
          ))}
        </div>

        {/* Comparison Bars */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-400" />
            Precision vs. Traditional Spraying
          </h4>

          {/* Cost */}
          <div className="mb-3">
            <div className="text-xs text-slate-500 mb-1">Treatment Cost</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-red-500/30 rounded" style={{ width: "100%" }}>
                  <div className="h-full bg-red-500/60 rounded flex items-center px-2">
                    <span className="text-[10px] text-red-200 font-mono whitespace-nowrap">Traditional: {formatCurrency(metrics.comparison.traditional.cost)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-5 bg-emerald-500/30 rounded"
                  style={{ width: `${(metrics.comparison.precision.cost / metrics.comparison.traditional.cost) * 100}%` }}
                >
                  <div className="h-full bg-emerald-500/60 rounded flex items-center px-2">
                    <span className="text-[10px] text-emerald-200 font-mono whitespace-nowrap">Precision: {formatCurrency(metrics.comparison.precision.cost)}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold whitespace-nowrap">Save {formatPercentage(metrics.comparison.savings.savingsPercentage)}</span>
              </div>
            </div>
          </div>

          {/* Chemical Usage */}
          <div>
            <div className="text-xs text-slate-500 mb-1">Chemical Usage</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-amber-500/30 rounded" style={{ width: "100%" }}>
                  <div className="h-full bg-amber-500/60 rounded flex items-center px-2">
                    <span className="text-[10px] text-amber-200 font-mono whitespace-nowrap">{metrics.comparison.traditional.chemical.toFixed(1)}L</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-5 bg-emerald-500/30 rounded"
                  style={{ width: `${(metrics.comparison.precision.chemical / metrics.comparison.traditional.chemical) * 100}%` }}
                >
                  <div className="h-full bg-emerald-500/60 rounded flex items-center px-2">
                    <span className="text-[10px] text-emerald-200 font-mono whitespace-nowrap">{metrics.comparison.precision.chemical.toFixed(1)}L</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold whitespace-nowrap">Reduce {formatPercentage(metrics.comparison.savings.chemicalSavingsPercentage)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {metrics.secondaryMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2">
              <div className="text-[10px] text-slate-500">{metric.label}</div>
              <div className="text-sm font-bold text-white font-mono">{metric.value}</div>
              <div className="text-[10px] text-slate-600">{metric.detail}</div>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-r from-emerald-900/20 to-slate-900 border border-emerald-500/20 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-emerald-400 mb-1">Recommended Action</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Apply precision treatment to {economicImpact.areas.infectedCells} infected zones immediately.
            Expected ROI: <strong className="text-emerald-400">{economicImpact.roi.perApplication.roiMultiplier.toFixed(1)}x</strong> with
            net savings of <strong className="text-emerald-400">{formatCurrency(economicImpact.roi.perApplication.netProfit)}</strong> per application.
          </p>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <Leaf size={10} className="text-emerald-500" />
            Environmental benefit: Reduce chemical usage by {formatPercentage(metrics.comparison.savings.chemicalSavingsPercentage)}, protecting soil health.
          </p>
        </div>
      </div>
    </div>
  )
}
