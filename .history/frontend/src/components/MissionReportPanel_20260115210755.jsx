/**
 * ✅ PART 11: Mission Report Panel - CORRECTED VERSION
 * Comprehensive PDF report generator capturing full dashboard state
 * 
 * FIXES:
 * - Proper data handling and validation
 * - Better layout alignment
 * - Actual detection count and data display
 * - Economic data properly formatted
 * - Table formatting improved
 */

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './MissionReportPanel.css';

const MissionReportPanel = ({
  missionMetadata,
  detections,
  mapState,
  sprayPath,
  gridStats,
  economicData,
  sensorData,
  fusionResults,
  alerts,
  recommendations,
  onReportGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return Number(value).toFixed(decimals);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `₹${Math.round(Number(value)).toLocaleString('en-IN')}`;
  };

  const getDetectionStats = () => {
    if (!detections || detections.length === 0) {
      return {
        totalDetections: 0,
        diseaseBreakdown: {},
        averageConfidence: 'N/A',
        affectedZones: 0,
        healthyZones: 0
      };
    }

    const diseaseMap = {};
    let totalConfidence = 0;
    let confidenceCount = 0;
    let affectedCount = 0;

    detections.forEach(d => {
      // Extract disease name from nested structure
      let disease = 'Unknown';
      
      if (d.detections && Array.isArray(d.detections) && d.detections.length > 0) {
        disease = d.detections[0].class || d.detections[0].disease || 'Unknown';
      } else if (d.disease) {
        disease = d.disease;
      } else if (d.class) {
        disease = d.class;
      }

      diseaseMap[disease] = (diseaseMap[disease] || 0) + 1;

      // Get confidence
      let conf = 0;
      if (d.detections && Array.isArray(d.detections) && d.detections.length > 0) {
        conf = d.detections[0].confidence || 0;
      } else if (d.confidence) {
        conf = d.confidence;
      }

      conf = Number(conf);
      if (conf <= 1) conf = conf * 100;

      if (!isNaN(conf) && conf > 0) {
        totalConfidence += conf;
        confidenceCount += 1;
      }

      if (!disease.toLowerCase().includes('healthy')) {
        affectedCount += 1;
      }
    });

    const avgConf = confidenceCount > 0 
      ? (totalConfidence / confidenceCount).toFixed(1)
      : 'N/A';

    return {
      totalDetections: detections.length,
      diseaseBreakdown: diseaseMap,
      averageConfidence: avgConf,
      affectedZones: affectedCount,
      healthyZones: detections.length - affectedCount
    };
  };

  // ============================================================
  // PDF GENERATION ENGINE
  // ============================================================

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('📄 Starting PDF generation...');
      console.log('Detections:', detections?.length || 0);
      console.log('GridStats:', gridStats);
      console.log('EconomicData:', economicData);
      console.log('SensorData:', sensorData);
      console.log('Alerts:', alerts?.length || 0);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      let yPos = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Helper functions
      const checkNewPage = () => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 15;
          return true;
        }
        return false;
      };

      const addSection = (title) => {
        checkNewPage();
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 139, 34);
        doc.text(title, margin, yPos);
        doc.setLineWidth(0.4);
        doc.setDrawColor(34, 139, 34);
        doc.line(margin, yPos + 1.5, pageWidth - margin, yPos + 1.5);
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      const addKeyValue = (label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 50, yPos);
        yPos += 5;
      };

      const addWrappedText = (text, x = margin) => {
        const lines = doc.splitTextToSize(String(text), contentWidth - 5);
        lines.forEach(line => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 15;
          }
          doc.text(line, x, yPos);
          yPos += 4;
        });
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // COVER PAGE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 55, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('PRECISION AGRICULTURE', pageWidth / 2, 22, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('MISSION REPORT', pageWidth / 2, 33, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${new Date().toLocaleString()}`, pageWidth / 2, 42, { align: 'center' });

      yPos = 65;

      // Mission Info Box
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(margin, yPos - 4, contentWidth, 48);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Mission Information', margin + 3, yPos + 2);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      yPos += 10;

      const missionInfo = [
        [`Field ID:`, `${missionMetadata?.fieldId || 'N/A'}`],
        [`Location:`, `${missionMetadata?.fieldName || 'N/A'}`],
        [`Area:`, `${missionMetadata?.fieldAreaHectares || 'N/A'} hectares`],
        [`Operator:`, `${missionMetadata?.operatorName || 'N/A'}`],
        [`Drone:`, `${missionMetadata?.droneModel || 'N/A'}`]
      ];

      missionInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin + 2, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 30, yPos);
        yPos += 5;
      });

      yPos += 12;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 1: DETECTION SUMMARY
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('1. Detection Summary');

      const stats = getDetectionStats();
      console.log('Detection stats:', stats);

      addKeyValue('Total Detections:', stats.totalDetections);
      addKeyValue('Average Confidence:', `${stats.averageConfidence}%`);
      addKeyValue('Affected Zones:', stats.affectedZones);
      addKeyValue('Healthy Zones:', stats.healthyZones);

      yPos += 3;

      // Disease Breakdown Table
      if (Object.keys(stats.diseaseBreakdown).length > 0 && stats.totalDetections > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Disease Breakdown:', margin, yPos);
        yPos += 5;

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
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255], fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 } }
        });

        yPos = doc.lastAutoTable.finalY + 6;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 2: ENVIRONMENTAL CONDITIONS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      if (sensorData) {
        addSection('2. Environmental Conditions');

        addKeyValue('Air Temperature:', `${formatNumber(sensorData.air_temperature || sensorData.temperature, 1)}°C`);
        addKeyValue('Air Humidity:', `${formatNumber(sensorData.air_humidity || sensorData.humidity, 1)}%`);
        addKeyValue('Soil Temperature:', `${formatNumber(sensorData.soil_temperature, 1)}°C`);
        addKeyValue('Soil Moisture:', `${formatNumber(sensorData.soil_moisture, 1)}%`);
        addKeyValue('Soil pH:', formatNumber(sensorData.soil_ph || sensorData.ph, 2));

        yPos += 3;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 3: SPATIAL IMPACT
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('3. Spatial Impact Overview');

      if (gridStats) {
        addKeyValue('Grid Size:', `${gridStats.gridSize || 'N/A'}`);
        addKeyValue('Total Cells:', gridStats.totalCells || 'N/A');
        addKeyValue('Affected Cells:', gridStats.affectedCells?.length || 0);
        addKeyValue('Affected Percentage:', `${formatNumber(gridStats.affectedPercentage || 0, 1)}%`);
        yPos += 3;
      } else {
        addWrappedText('No grid analysis data available');
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 4: SPRAY PLAN
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('4. Precision Spray Plan');

      if (sprayPath && sprayPath.status) {
        addKeyValue('Plan Status:', sprayPath.status);
        addKeyValue('Waypoints:', sprayPath.waypoints?.length || 0);
        addKeyValue('Coverage:', `${formatNumber(sprayPath.coverage, 1)}%`);
        addKeyValue('Estimated Area:', `${formatNumber(sprayPath.estimatedArea, 2)} m²`);
        addKeyValue('Path Length:', `${formatNumber(sprayPath.pathLength, 2)} m`);

        if (sprayPath.recommendation?.action) {
          yPos += 2;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('Recommended Action:', margin, yPos);
          yPos += 4;
          addWrappedText(sprayPath.recommendation.action);
        }
      } else {
        addWrappedText('No spray plan generated yet');
      }

      yPos += 2;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 5: ECONOMIC ANALYSIS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('5. Economic Analysis & ROI');

      if (economicData && Object.keys(economicData).length > 0) {
        console.log('Economic data available:', economicData);

        // Extract field names flexibly
        const estimatedLoss = economicData.estimatedLoss || economicData.potentialLoss || economicData.cropLossUntreated || 0;
        const treatmentCost = economicData.treatmentCost || economicData.sprayingCost || 0;
        const netBenefit = economicData.netBenefit || economicData.expectedSavings || (Number(estimatedLoss) - Number(treatmentCost));
        const roi = economicData.roi || economicData.ROI || (treatmentCost > 0 ? ((netBenefit / treatmentCost) * 100).toFixed(1) : 0);

        addKeyValue('Estimated Loss (No Action):', formatCurrency(estimatedLoss));
        addKeyValue('Treatment Cost:', formatCurrency(treatmentCost));
        
        // Highlight net benefit
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(34, 139, 34);
        doc.text('Net Benefit:', margin, yPos);
        doc.text(formatCurrency(netBenefit), margin + 50, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;

        addKeyValue('Return on Investment (ROI):', `${formatNumber(roi, 1)}%`);

        if (economicData.paybackPeriod) {
          addKeyValue('Payback Period:', `${formatNumber(economicData.paybackPeriod, 1)} days`);
        }

        yPos += 3;
      } else {
        addWrappedText('No economic data available');
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 6: MULTIMODAL DIAGNOSIS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('6. Multimodal Diagnosis');

      if (fusionResults && fusionResults.length > 0) {
        const fusionTableData = fusionResults.slice(0, 8).map(fusion => {
          const diagnosis = fusion.diagnosis || fusion;
          const conf = (diagnosis.confidence || 0) * 100;
          return [
            String(diagnosis.refined_diagnosis || diagnosis.diagnosis || 'Unknown').substring(0, 25),
            `${formatNumber(conf, 1)}%`,
            String(diagnosis.severity || 'N/A')
          ];
        });

        doc.autoTable({
          head: [['Diagnosis', 'Confidence', 'Severity']],
          body: fusionTableData,
          startY: yPos,
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255], fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        yPos = doc.lastAutoTable.finalY + 6;
      } else {
        addWrappedText('No fusion analysis available');
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 7: ACTIVE ALERTS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('7. Active Alerts');

      if (alerts && alerts.length > 0) {
        const criticalCount = alerts.filter(a => a.type === 'CRITICAL').length;
        const highCount = alerts.filter(a => a.severity === 'high' || a.type === 'WARNING').length;

        addKeyValue('Total Alerts:', alerts.length);
        addKeyValue('Critical:', criticalCount);
        addKeyValue('High/Warning:', highCount);

        yPos += 3;

        const alertTableData = alerts.slice(0, 5).map(alert => [
          String(alert.type || alert.severity || 'INFO').substring(0, 10).toUpperCase(),
          String(alert.title || 'Alert').substring(0, 25),
          String(alert.message || '').substring(0, 25) + (String(alert.message || '').length > 25 ? '...' : '')
        ]);

        doc.autoTable({
          head: [['Type', 'Title', 'Message']],
          body: alertTableData,
          startY: yPos,
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [192, 21, 47], textColor: [255, 255, 255], fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [255, 245, 245] }
        });

        yPos = doc.lastAutoTable.finalY + 6;
      } else {
        addWrappedText('No active alerts');
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SECTION 8: RECOMMENDATIONS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      addSection('8. Recommendations');

      const recs = (recommendations && recommendations.length > 0) 
        ? recommendations 
        : [
            'Apply targeted fungicide treatment to detected areas',
            'Monitor field for disease progression over next 7 days',
            'Implement soil moisture management to prevent spread',
            'Schedule follow-up drone survey in 14 days'
          ];

      recs.slice(0, 6).forEach((rec, idx) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 15;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        addWrappedText(`${idx + 1}. ${rec}`);
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // FOOTER & METADATA
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Report ID: ${missionMetadata?.fieldId || 'REPORT'}-${new Date().getTime()} | Page ${i}/${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SAVE PDF
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `Mission-Report-${missionMetadata?.fieldId || 'REPORT'}-${dateStr}-${timeStr}.pdf`;

      doc.save(filename);

      setSuccess(true);
      console.log(`✅ Report generated: ${filename}`);
      
      if (onReportGenerated) {
        onReportGenerated({
          filename,
          timestamp: new Date().toISOString(),
          fieldId: missionMetadata?.fieldId,
          detections: stats.totalDetections,
          sections: 8
        });
      }

      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('❌ Report generation failed:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
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
        <p className="panel-subtitle">Export complete dashboard state to PDF</p>
      </div>

      <div className="panel-body">
        <button
          className={`generate-btn ${isGenerating ? 'loading' : ''}`}
          onClick={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner-small"></span> Generating PDF...
            </>
          ) : (
            <>
              📥 Generate & Download Report
            </>
          )}
        </button>

        {success && (
          <div className="alert alert-success">
            ✅ Report generated successfully!
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <div className="panel-info">
          <p><strong>📋 Report Includes:</strong></p>
          <ul>
            <li>✅ Mission Information</li>
            <li>✅ Detection Summary</li>
            <li>✅ Environmental Conditions</li>
            <li>✅ Spatial Impact Overview</li>
            <li>✅ Precision Spray Plan</li>
            <li>✅ Economic Analysis & ROI</li>
            <li>✅ Multimodal Diagnosis</li>
            <li>✅ Active Alerts & Recommendations</li>
          </ul>
        </div>

        <div className="panel-debug">
          <p><small>📊 Data Status:</small></p>
          <small>
            Detections: {detections?.length || 0} | 
            GridStats: {gridStats ? '✓' : '✗'} | 
            Economic: {economicData && Object.keys(economicData).length > 0 ? '✓' : '✗'} | 
            Sensor: {sensorData ? '✓' : '✗'} | 
            Alerts: {alerts?.length || 0}
          </small>
        </div>
      </div>
    </div>
  );
};

export default MissionReportPanel;
