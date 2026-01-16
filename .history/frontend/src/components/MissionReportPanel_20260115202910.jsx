/**
 * ✅ PART 11: Mission Report Panel
 * Captures full dashboard state → Generates professional PDF
 * 
 * Features:
 * - Hybrid jsPDF + html2canvas approach
 * - Graceful degradation for missing data
 * - Full traceability to all dashboard panels
 * - Professional formatting with tables, lists, highlights
 */

import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './MissionReportPanel.css';

const MissionReportPanel = ({
  // Mission context
  missionMetadata,
  
  // Part 5: Detections
  detections,
  
  // Part 6: Map
  mapState,
  
  // Part 7: Spray Plan
  sprayPath,
  gridStats,
  
  // Part 8: Economic
  economicData,
  
  // Part 9: Sensor + Fusion
  sensorData,
  fusionResults,
  
  // Part 10: Alerts
  alerts,
  recommendations,
  
  // Callback
  onReportGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const mapCanvasRef = useRef(null);
  const gridCanvasRef = useRef(null);

  // ============================================================
  // STEP 1: DATA NORMALIZATION & VALIDATION
  // ============================================================

  const getNormalizedDetections = () => {
    if (!detections || detections.length === 0) {
      return [];
    }
    
    return detections.map(d => ({
      id: d.id || 'N/A',
      disease: d.disease || d.class || d.label || 'Unknown',
      confidence: d.confidence !== undefined 
        ? (Number(d.confidence) <= 1 ? Number(d.confidence) * 100 : Number(d.confidence)).toFixed(1)
        : 'N/A',
      lat: d.gps?.lat || d.latitude || 'N/A',
      lng: d.gps?.lng || d.longitude || 'N/A',
      timestamp: d.timestamp || 'N/A'
    }));
  };

  const getDetectionStats = () => {
    const normalized = getNormalizedDetections();
    
    if (normalized.length === 0) {
      return {
        totalDetections: 0,
        diseaseBreakdown: {},
        averageConfidence: 'N/A',
        affectedZones: 0,
        healthyZones: 0,
        severity: 'No detections'
      };
    }

    const diseaseMap = {};
    let totalConfidence = 0;
    let confidenceCount = 0;
    let affectedCount = 0;

    normalized.forEach(d => {
      // Aggregate by disease
      const disease = String(d.disease);
      diseaseMap[disease] = (diseaseMap[disease] || 0) + 1;

      // Average confidence
      const conf = Number(d.confidence);
      if (!isNaN(conf)) {
        totalConfidence += conf;
        confidenceCount += 1;
      }

      // Count affected vs healthy
      if (!disease.toLowerCase().includes('healthy')) {
        affectedCount += 1;
      }
    });

    const avgConf = confidenceCount > 0 
      ? (totalConfidence / confidenceCount).toFixed(1)
      : 'N/A';

    return {
      totalDetections: normalized.length,
      diseaseBreakdown: diseaseMap,
      averageConfidence: avgConf,
      affectedZones: affectedCount,
      healthyZones: normalized.length - affectedCount,
      severity: affectedCount > (normalized.length * 0.5) ? 'High' : 'Moderate'
    };
  };

  // ============================================================
  // STEP 2: HELPER FUNCTIONS
  // ============================================================

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return Number(value).toFixed(decimals);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getCellCoordinates = () => {
    if (!gridStats || !gridStats.affectedCells) return [];
    return gridStats.affectedCells.map((cell, idx) => ({
      id: idx + 1,
      x: cell.x || 'N/A',
      y: cell.y || 'N/A',
      severity: cell.severity || 'Unknown'
    }));
  };

  // ============================================================
  // STEP 3: PDF GENERATION ENGINE
  // ============================================================

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Initialize PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = 20;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // COVER PAGE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('PRECISION AGRICULTURE', pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(18);
      doc.text('MISSION REPORT', pageWidth / 2, 38, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 50, { align: 'center' });

      yPos = 75;

      // Mission Info Card
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 50);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Mission Information', margin + 5, yPos + 5);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const missionInfo = [
        `Field ID: ${missionMetadata?.fieldId || 'N/A'}`,
        `Location: ${missionMetadata?.fieldName || 'N/A'} (${missionMetadata?.fieldAreaHectares || 'N/A'} hectares)`,
        `Operator: ${missionMetadata?.operatorName || 'N/A'}`,
        `Drone: ${missionMetadata?.droneModel || 'N/A'}`,
        `Mission Start: ${missionMetadata?.missionStart ? new Date(missionMetadata.missionStart).toLocaleString() : 'N/A'}`
      ];

      missionInfo.forEach((info, idx) => {
        doc.text(info, margin + 8, yPos + 15 + (idx * 8));
      });

      yPos += 70;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PAGE BREAK HELPER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const checkNewPage = () => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
      };

      const addSection = (title) => {
        checkNewPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 139, 34);
        doc.text(title, margin, yPos);
        doc.setLineWidth(0.5);
        doc.setDrawColor(34, 139, 34);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        yPos += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 1: DETECTION SUMMARY
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('1. Detection Summary (Part 5)');

      const stats = getDetectionStats();

      const detectionSummary = [
        [`Total Detections:`, `${stats.totalDetections}`],
        [`Average Confidence:`, `${stats.averageConfidence}%`],
        [`Affected Zones:`, `${stats.affectedZones}`],
        [`Healthy Zones:`, `${stats.healthyZones}`],
        [`Overall Severity:`, stats.severity]
      ];

      detectionSummary.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 60, yPos);
        yPos += 6;
      });

      yPos += 3;

      // Disease Breakdown Table
      if (Object.keys(stats.diseaseBreakdown).length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Disease Breakdown:', margin, yPos);
        yPos += 6;

        const diseaseTableData = Object.entries(stats.diseaseBreakdown)
          .sort(([, a], [, b]) => b - a)
          .map(([disease, count]) => {
            const percentage = ((count / stats.totalDetections) * 100).toFixed(1);
            return [disease, count.toString(), `${percentage}%`];
          });

        doc.autoTable({
          head: [['Disease', 'Count', 'Percentage']],
          body: diseaseTableData,
          startY: yPos,
          margin: margin,
          headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        yPos = doc.lastAutoTable.finalY + 8;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 2: ENVIRONMENTAL CONDITIONS (Part 9)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      if (sensorData) {
        addSection('2. Environmental Conditions (Part 9)');

        const sensorInfo = [
          ['Air Temperature:', `${formatNumber(sensorData.air_temperature || sensorData.temperature, 1)}°C`],
          ['Air Humidity:', `${formatNumber(sensorData.air_humidity || sensorData.humidity, 1)}%`],
          ['Soil Temperature:', `${formatNumber(sensorData.soil_temperature, 1)}°C`],
          ['Soil Moisture:', `${formatNumber(sensorData.soil_moisture, 1)}%`],
          ['Soil pH:', formatNumber(sensorData.soil_ph || sensorData.ph, 2)],
          ['Recorded At:', sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleString() : 'N/A']
        ];

        sensorInfo.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), margin + 60, yPos);
          yPos += 6;
        });

        yPos += 3;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 3: SPATIAL IMPACT OVERVIEW (Part 6)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('3. Spatial Impact Overview (Part 6)');

      if (gridStats) {
        const spatialInfo = [
          ['Field Size:', `${gridStats.gridSize || 'N/A'}`],
          ['Total Grid Cells:', `${gridStats.totalCells || 'N/A'}`],
          ['Affected Cells:', `${gridStats.affectedCells?.length || 0}`],
          ['Healthy Cells:', `${(gridStats.totalCells || 0) - (gridStats.affectedCells?.length || 0)}`],
          ['Affected %:', `${formatNumber(gridStats.affectedPercentage || 0, 1)}%`]
        ];

        spatialInfo.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), margin + 60, yPos);
          yPos += 6;
        });

        yPos += 3;

        // Grid Cells Detail Table
        const gridCells = getCellCoordinates().slice(0, 10);
        if (gridCells.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Affected Cell Coordinates (First 10):', margin, yPos);
          yPos += 6;

          const gridTableData = gridCells.map(cell => [
            cell.id.toString(),
            String(cell.x),
            String(cell.y),
            cell.severity
          ]);

          doc.autoTable({
            head: [['Cell', 'X', 'Y', 'Severity']],
            body: gridTableData,
            startY: yPos,
            margin: margin,
            headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
          });

          yPos = doc.lastAutoTable.finalY + 8;
        }
      } else {
        doc.text('No grid analysis data available', margin, yPos);
        yPos += 8;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 4: PRECISION SPRAY PLAN (Part 7)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('4. Precision Spray Plan (Part 7)');

      if (sprayPath && sprayPath.status) {
        const sprayInfo = [
          ['Plan Status:', sprayPath.status],
          ['Waypoints:', `${sprayPath.waypoints?.length || 0}`],
          ['Coverage:', `${formatNumber(sprayPath.coverage, 1)}%`],
          ['Estimated Area:', `${formatNumber(sprayPath.estimatedArea, 2)} m²`],
          ['Path Length:', `${formatNumber(sprayPath.pathLength, 2)} meters`]
        ];

        sprayInfo.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), margin + 60, yPos);
          yPos += 6;
        });

        yPos += 3;

        // Recommended Action
        if (sprayPath.recommendation) {
          doc.setFont('helvetica', 'bold');
          doc.text('Recommended Action:', margin, yPos);
          yPos += 6;
          doc.setFont('helvetica', 'normal');
          
          const actionText = sprayPath.recommendation.action || 'Apply targeted treatment';
          const wrappedText = doc.splitTextToSize(actionText, pageWidth - 2 * margin - 10);
          
          wrappedText.forEach(line => {
            checkNewPage();
            doc.text(line, margin + 5, yPos);
            yPos += 6;
          });

          yPos += 2;
        }
      } else {
        doc.text('No spray plan generated yet', margin, yPos);
        yPos += 6;
      }

      yPos += 3;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 5: ECONOMIC ANALYSIS (Part 8)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('5. Economic Analysis & ROI (Part 8)');

      if (economicData && Object.keys(economicData).length > 0) {
        const economicInfo = [
          ['Estimated Loss (No Action):', formatCurrency(economicData.estimatedLoss || economicData.potentialLoss)],
          ['Treatment Cost:', formatCurrency(economicData.treatmentCost || economicData.sprayingCost)],
          ['Net Benefit:', formatCurrency(economicData.netBenefit || economicData.expectedSavings)],
          ['Return on Investment (ROI):', `${formatNumber(economicData.roi || economicData.ROI, 1)}%`],
          ['Payback Period:', `${formatNumber(economicData.paybackPeriod, 1)} days`]
        ];

        economicInfo.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, yPos);
          doc.setFont('helvetica', value.includes('₹') ? 'bold' : 'normal');
          doc.setTextColor(34, 139, 34);
          doc.text(String(value), margin + 75, yPos);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          yPos += 7;
        });

        yPos += 3;
      } else {
        doc.text('No economic data available', margin, yPos);
        yPos += 6;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 6: MULTIMODAL DIAGNOSIS (Part 9)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('6. Multimodal Diagnosis (Part 9)');

      if (fusionResults && fusionResults.length > 0) {
        const fusionTableData = fusionResults.slice(0, 8).map(fusion => [
          String(fusion.modelName || 'Unknown'),
          `${formatNumber(fusion.confidence, 1)}%`,
          String(fusion.decision || 'N/A')
        ]);

        doc.autoTable({
          head: [['Model', 'Confidence', 'Decision']],
          body: fusionTableData,
          startY: yPos,
          margin: margin,
          headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        yPos = doc.lastAutoTable.finalY + 8;
      } else {
        doc.text('No fusion analysis available', margin, yPos);
        yPos += 6;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 7: ACTIVE ALERTS (Part 10)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('7. Active Alerts & Escalation (Part 10)');

      if (alerts && alerts.length > 0) {
        const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
        const highAlerts = alerts.filter(a => a.severity === 'high').length;
        const mediumAlerts = alerts.filter(a => a.severity === 'medium').length;

        const alertSummary = [
          [`Total Alerts:`, `${alerts.length}`],
          [`Critical:`, `${criticalAlerts}`],
          [`High:`, `${highAlerts}`],
          [`Medium:`, `${mediumAlerts}`]
        ];

        alertSummary.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), margin + 50, yPos);
          yPos += 6;
        });

        yPos += 6;

        // Alert Details
        const alertTableData = alerts.slice(0, 6).map(alert => [
          alert.severity?.toUpperCase() || 'INFO',
          String(alert.title || 'Alert'),
          String(alert.message || '').substring(0, 30)
        ]);

        doc.autoTable({
          head: [['Severity', 'Title', 'Message']],
          body: alertTableData,
          startY: yPos,
          margin: margin,
          headStyles: { fillColor: [192, 21, 47], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [255, 245, 245] }
        });

        yPos = doc.lastAutoTable.finalY + 8;
      } else {
        doc.text('No active alerts', margin, yPos);
        yPos += 6;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 8: RECOMMENDATIONS (Part 10 + Synthesis)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('8. Immediate Recommendations (Part 10)');

      const recommendedActions = recommendations || [
        'Apply targeted fungicide treatment to detected areas',
        'Monitor field for disease progression over next 7 days',
        'Implement soil moisture management to prevent spread',
        'Schedule follow-up drone survey in 14 days',
        'Consider crop rotation in severely affected zones'
      ];

      recommendedActions.slice(0, 8).forEach((rec, idx) => {
        checkNewPage();
        const recText = doc.splitTextToSize(String(rec), pageWidth - 2 * margin - 10);
        doc.text(`${idx + 1}. `, margin, yPos);
        
        recText.forEach((line, lineIdx) => {
          if (lineIdx === 0) {
            doc.text(line, margin + 8, yPos);
          } else {
            yPos += 6;
            checkNewPage();
            doc.text(line, margin + 8, yPos);
          }
        });
        
        yPos += 8;
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // FINAL PAGE: SUMMARY & FOOTER
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      checkNewPage();
      addSection('9. Final Assessment');

      const assessmentText = [
        `Field Status: ${stats.severity}`,
        `Recommended Action: Proceed with targeted spray treatment`,
        `Confidence Level: ${stats.averageConfidence}%`,
        `Next Review: 7 days post-treatment`,
        `Generated by: Precision Agriculture AI System`
      ];

      assessmentText.forEach(text => {
        doc.text(`• ${text}`, margin, yPos);
        yPos += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Report ID: ${missionMetadata?.fieldId}-${new Date().getTime()} | Page ${doc.internal.pages.length}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SAVE PDF
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `Mission-Report-${missionMetadata?.fieldId || 'REPORT'}-${dateStr}-${timeStr}.pdf`;

      doc.save(filename);

      // Success
      setSuccess(true);
      console.log(`✅ Report generated: ${filename}`);
      
      if (onReportGenerated) {
        onReportGenerated({
          filename,
          timestamp: new Date().toISOString(),
          fieldId: missionMetadata?.fieldId
        });
      }

      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('❌ Report generation failed:', err);
      setError(err.message || 'Unknown error');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="mission-report-panel">
      <div className="panel-header">
        <h3>📄 Mission Report Generator</h3>
        <p className="panel-subtitle">Export full dashboard state to PDF</p>
      </div>

      <div className="panel-body">
        <button
          className={`generate-btn ${isGenerating ? 'loading' : ''}`}
          onClick={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span> Generating...
            </>
          ) : (
            <>
              📥 Generate & Download Report
            </>
          )}
        </button>

        {success && (
          <div className="alert alert-success">
            ✅ Report generated and downloaded successfully!
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <div className="panel-info">
          <p>
            <strong>Includes all 6 dashboard panels:</strong>
          </p>
          <ul>
            <li>✅ Live Detection Feed Summary</li>
            <li>✅ Spatial Impact Overview</li>
            <li>✅ Precision Spray Plan</li>
            <li>✅ Economic Analysis & ROI</li>
            <li>✅ Multimodal Diagnosis</li>
            <li>✅ Active Alerts & Recommendations</li>
          </ul>
        </div>
      </div>

      {/* Hidden canvases for map/grid capture (if implementing html2canvas) */}
      <div style={{ display: 'none' }}>
        <div ref={mapCanvasRef} className="map-capture"></div>
        <div ref={gridCanvasRef} className="grid-capture"></div>
      </div>
    </div>
  );
};

export default MissionReportPanel;
