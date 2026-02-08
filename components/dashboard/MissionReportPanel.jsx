"use client"

import React, { useState } from "react"
import { FileText, Download, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const MissionReportPanel = ({
  missionMetadata,
  detections,
  gridStats,
  economicData,
  sensorData,
  fusionResults,
  alerts,
  recommendations,
  onReportGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const generatePDF = async () => {
    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      // Dynamic import of jsPDF to avoid SSR issues
      const { jsPDF } = await import("jspdf")
      await import("jspdf-autotable")

      const doc = new jsPDF()
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let y = 20

      const checkPage = (requiredSpace = 20) => {
        if (y > pageHeight - requiredSpace) {
          doc.addPage()
          y = 20
          return true
        }
        return false
      }

      const addSeparator = () => {
        checkPage()
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        doc.line(margin, y, pageWidth - margin, y)
        y += 10
      }

      const addSectionTitle = (title) => {
        checkPage(30)
        doc.setFillColor(34, 139, 34)
        doc.rect(margin - 2, y - 5, contentWidth + 4, 10, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text(title, margin, y)
        y += 10
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
      }

      const addLabelValue = (label, value) => {
        checkPage()
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text(label, margin + 2, y)
        doc.setFont("helvetica", "normal")
        doc.text(String(value), margin + 70, y)
        y += 6
      }

      // Cover page
      doc.setFillColor(34, 139, 34)
      doc.rect(0, 0, pageWidth, 55, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(26)
      doc.setFont("helvetica", "bold")
      doc.text("PRECISION AGRICULTURE", pageWidth / 2, 25, { align: "center" })
      doc.setFontSize(16)
      doc.text("MISSION REPORT", pageWidth / 2, 37, { align: "center" })
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageWidth / 2, 47, { align: "center" })

      y = 70
      doc.setTextColor(0, 0, 0)
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.5)
      doc.rect(margin, y - 5, contentWidth, 45)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Mission Information", margin + 3, y)
      y += 8
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      addLabelValue("Field ID:", missionMetadata?.fieldId || "N/A")
      addLabelValue("Location:", missionMetadata?.fieldName || "N/A")
      addLabelValue("Field Area:", `${missionMetadata?.fieldAreaHectares || "N/A"} hectares`)
      addLabelValue("Operator:", missionMetadata?.operatorName || "N/A")
      addLabelValue("Drone Model:", missionMetadata?.droneModel || "N/A")
      y += 8
      addSeparator()

      // Detection Summary
      addSectionTitle("1. DETECTION SUMMARY")
      const totalDetections = detections?.length || 0
      addLabelValue("Total Detections:", totalDetections)
      if (totalDetections > 0) {
        const diseaseCount = {}
        let totalConf = 0
        let confCount = 0
        detections.forEach((d) => {
          let disease = "Unknown"
          if (d.detections && d.detections[0]) {
            disease = d.detections[0].class || "Unknown"
            const conf = d.detections[0].confidence || 0
            totalConf += conf <= 1 ? conf * 100 : conf
            confCount++
          }
          diseaseCount[disease] = (diseaseCount[disease] || 0) + 1
        })
        addLabelValue("Average Confidence:", `${confCount > 0 ? (totalConf / confCount).toFixed(1) : "N/A"}%`)
      }
      y += 5
      addSeparator()

      // Sensor data
      if (sensorData) {
        addSectionTitle("2. ENVIRONMENTAL CONDITIONS")
        addLabelValue("Air Temperature:", `${(sensorData.air_temperature || 0).toFixed(1)}°C`)
        addLabelValue("Air Humidity:", `${(sensorData.air_humidity || 0).toFixed(1)}%`)
        addLabelValue("Soil Temperature:", `${(sensorData.soil_temperature || 0).toFixed(1)}°C`)
        addLabelValue("Soil Moisture:", `${(sensorData.soil_moisture || 0).toFixed(1)}%`)
        addLabelValue("Soil pH:", (sensorData.soil_ph || 0).toFixed(2))
        y += 5
        addSeparator()
      }

      // Grid analysis
      if (gridStats) {
        addSectionTitle("3. FIELD GRID ANALYSIS")
        addLabelValue("Total Grid Cells:", gridStats.totalCells || 0)
        addLabelValue("Infected Cells:", gridStats.infectedCount || 0)
        addLabelValue("Infection Rate:", `${(gridStats.infectedPercentage || 0).toFixed(1)}%`)
        y += 5
        addSeparator()
      }

      // Economic
      addSectionTitle("4. ECONOMIC ANALYSIS & ROI")
      if (economicData) {
        const financial = economicData.financialData || economicData
        if (financial && (financial.potentialLoss || financial.treatmentCost)) {
          const loss = financial.potentialLoss || financial.estimatedLoss || 0
          const cost = financial.treatmentCost || financial.sprayingCost || 0
          const benefit = financial.netBenefit || loss - cost || 0
          const roi = financial.roi || financial.ROI || 0
          addLabelValue("Est. Loss (No Treatment):", `INR ${Math.round(loss).toLocaleString("en-IN")}`)
          addLabelValue("Treatment Cost:", `INR ${Math.round(cost).toLocaleString("en-IN")}`)
          addLabelValue("Net Benefit:", `INR ${Math.round(benefit).toLocaleString("en-IN")}`)
          addLabelValue("ROI:", `${roi.toFixed(1)}%`)
        }
      }
      y += 5
      addSeparator()

      // Alerts
      addSectionTitle("5. ACTIVE ALERTS")
      if (alerts && alerts.length > 0) {
        addLabelValue("Total Alerts:", alerts.length)
        alerts.slice(0, 5).forEach((alert, i) => {
          checkPage(15)
          doc.setFont("helvetica", "bold")
          doc.text(`${i + 1}. [${(alert.type || "INFO").toUpperCase()}]`, margin + 5, y)
          doc.setFont("helvetica", "normal")
          doc.text(alert.title || "Alert", margin + 30, y)
          y += 6
        })
      } else {
        doc.text("No critical alerts", margin + 2, y)
        y += 6
      }
      y += 5
      addSeparator()

      // Recommendations
      addSectionTitle("6. RECOMMENDATIONS")
      const recs =
        recommendations && recommendations.length > 0
          ? recommendations
          : [
              "Apply targeted treatment to detected disease zones",
              "Monitor field for disease progression over next 7 days",
              "Schedule follow-up drone survey in 14 days",
            ]
      recs.slice(0, 6).forEach((rec, i) => {
        checkPage(12)
        doc.text(`${i + 1}. ${rec}`, margin + 2, y)
        y += 6
      })

      // Footer
      const totalPages = doc.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        doc.text(`Report ID: ${missionMetadata?.fieldId}-${Date.now()}`, margin, pageHeight - 10)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" })
      }

      const filename = `Mission-Report-${missionMetadata?.fieldId || "REPORT"}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.pdf`
      doc.save(filename)

      setSuccess(true)
      if (onReportGenerated) onReportGenerated({ filename })
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      console.error("PDF Error:", err)
      setError(`Generation failed: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center gap-2 text-purple-400 font-semibold tracking-wide text-sm uppercase">
          <FileText size={16} />
          Mission Report Generator
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">Professional PDF report with complete analytics</p>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all",
            isGenerating
              ? "bg-purple-900/20 text-purple-600 cursor-not-allowed border border-purple-800"
              : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20"
          )}
        >
          {isGenerating ? (
            <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
          ) : (
            <><Download size={16} /> Generate PDF Report</>
          )}
        </button>

        {success && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} /> Report generated successfully!
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={14} /> {error}
          </div>
        )}

        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Data Preview</p>
          <div className="flex flex-col gap-0.5 text-xs text-slate-400 font-mono">
            <span>Detections: <strong className="text-white">{detections?.length || 0}</strong></span>
            <span>Infection Rate: <strong className="text-white">{gridStats?.infectedPercentage?.toFixed(1) || "0"}%</strong></span>
            <span>
              Net Benefit:{" "}
              <strong className="text-emerald-400">
                {economicData?.financialData?.netBenefit
                  ? `INR ${Math.round(economicData.financialData.netBenefit).toLocaleString("en-IN")}`
                  : "Calculating..."}
              </strong>
            </span>
            <span>Sensor: <strong className={sensorData ? "text-emerald-400" : "text-amber-400"}>{sensorData ? "Live" : "Initializing"}</strong></span>
            <span>Alerts: <strong className={alerts?.length > 0 ? "text-red-400" : "text-emerald-400"}>{alerts?.length || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MissionReportPanel
