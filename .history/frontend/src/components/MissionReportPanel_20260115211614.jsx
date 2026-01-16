/**
 * FINAL WORKING Mission Report Panel
 * Correctly handles nested economicData structure
 */

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './MissionReportPanel.css';

const MissionReportPanel = ({
  missionMetadata,
  detections,
  gridStats,
  economicData,
  sensorData,
  fusionResults,
  alerts,
  recommendations
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const generatePDF = () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('═══════════════════════════════════');
      console.log('📄 REPORT GENERATION STARTED');
      console.log('═══════════════════════════════════');
      console.log('Detections:', detections?.length || 0);
      console.log('GridStats:', gridStats);
      console.log('EconomicData:', economicData);
      console.log('SensorData:', sensorData);
      console.log('FusionResults:', fusionResults?.length || 0);
      console.log('Alerts:', alerts?.length || 0);
      console.log('═══════════════════════════════════');

      const doc = new jsPDF();
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      let y = 20;

      const checkPage = () => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      };

      // ═══════════════════════════════════════════
      // COVER PAGE
      // ═══════════════════════════════════════════
      
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('PRECISION AGRICULTURE', pageWidth / 2, 25, { align: 'center' });
      doc.setFontSize(16);
      doc.text('MISSION REPORT', pageWidth / 2, 35, { align: 'center' });

      y = 60;

      // ═══════════════════════════════════════════
      // MISSION INFO
      // ═══════════════════════════════════════════

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Mission Information', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Field ID: ${missionMetadata?.fieldId || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Location: ${missionMetadata?.fieldName || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Area: ${missionMetadata?.fieldAreaHectares || 'N/A'} hectares`, margin, y);
      y += 7;
      doc.text(`Operator: ${missionMetadata?.operatorName || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Drone: ${missionMetadata?.droneModel || 'N/A'}`, margin, y);
      y += 7;
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
      y += 15;

      // ═══════════════════════════════════════════
      // DETECTION SUMMARY
      // ═══════════════════════════════════════════

      checkPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Detection Summary', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const totalDetections = detections?.length || 0;
      doc.text(`Total Detections: ${totalDetections}`, margin, y);
      y += 7;

      if (totalDetections > 0) {
        const diseaseCount = {};
        let totalConf = 0;
        let confCount = 0;

        detections.forEach(d => {
          let disease = 'Unknown';
          if (d.detections && d.detections[0]) {
            disease = d.detections[0].class || 'Unknown';
            const conf = d.detections[0].confidence || 0;
            totalConf += (conf <= 1 ? conf * 100 : conf);
            confCount++;
          }
          diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
        });

        const avgConf = confCount > 0 ? (totalConf / confCount).toFixed(1) : 'N/A';
        doc.text(`Average Confidence: ${avgConf}%`, margin, y);
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Disease Breakdown:', margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');

        const sortedDiseases = Object.entries(diseaseCount).sort(([,a], [,b]) => b - a);
        sortedDiseases.forEach(([disease, count]) => {
          checkPage();
          const pct = ((count / totalDetections) * 100).toFixed(1);
          doc.text(`  • ${disease}: ${count} detections (${pct}%)`, margin + 3, y);
          y += 6;
        });
      }

      y += 10;

      // ═══════════════════════════════════════════
      // ENVIRONMENTAL CONDITIONS
      // ═══════════════════════════════════════════

      if (sensorData) {
        checkPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Environmental Conditions', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        doc.text(`Air Temperature: ${(sensorData.air_temperature || 0).toFixed(1)}°C`, margin, y);
        y += 7;
        doc.text(`Air Humidity: ${(sensorData.air_humidity || 0).toFixed(1)}%`, margin, y);
        y += 7;
        doc.text(`Soil Temperature: ${(sensorData.soil_temperature || 0).toFixed(1)}°C`, margin, y);
        y += 7;
        doc.text(`Soil Moisture: ${(sensorData.soil_moisture || 0).toFixed(1)}%`, margin, y);
        y += 7;
        doc.text(`Soil pH: ${(sensorData.soil_ph || 0).toFixed(2)}`, margin, y);
        y += 7;
        doc.text(`Recorded: ${new Date(sensorData.timestamp).toLocaleString()}`, margin, y);
        y += 12;
      }

      // ═══════════════════════════════════════════
      // GRID ANALYSIS
      // ═══════════════════════════════════════════

      if (gridStats) {
        checkPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('3. Field Grid Analysis', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        doc.text(`Grid Size: ${gridStats.gridSize || '10x10'}`, margin, y);
        y += 7;
        doc.text(`Total Cells: ${gridStats.totalCells || 0}`, margin, y);
        y += 7;
        doc.text(`Infected Cells: ${gridStats.infectedCount || 0}`, margin, y);
        y += 7;
        doc.text(`Healthy Cells: ${gridStats.healthyCount || 0}`, margin, y);
        y += 7;
        doc.text(`Infection Rate: ${(gridStats.infectedPercentage || 0).toFixed(1)}%`, margin, y);
        y += 12;
      }

      // ═══════════════════════════════════════════
      // ECONOMIC ANALYSIS
      // ═══════════════════════════════════════════

      if (economicData) {
        checkPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('4. Economic Analysis & ROI', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        // Handle nested structure
        const financial = economicData.financialData || economicData;
        
        if (financial) {
          const loss = financial.potentialLoss || financial.estimatedLoss || 0;
          const cost = financial.treatmentCost || 0;
          const benefit = financial.netBenefit || 0;
          const roi = financial.roi || 0;

          doc.text(`Estimated Loss (No Treatment): ₹${Math.round(loss).toLocaleString('en-IN')}`, margin, y);
          y += 7;
          doc.text(`Treatment Cost: ₹${Math.round(cost).toLocaleString('en-IN')}`, margin, y);
          y += 7;
          
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 139, 34);
          doc.text(`Net Benefit: ₹${Math.round(benefit).toLocaleString('en-IN')}`, margin, y);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          y += 7;
          
          doc.text(`Return on Investment (ROI): ${roi.toFixed(1)}%`, margin, y);
          y += 7;

          if (financial.paybackPeriod) {
            doc.text(`Payback Period: ${financial.paybackPeriod.toFixed(1)} days`, margin, y);
            y += 7;
          }
        }

        // Show areas breakdown if available
        if (economicData.areas) {
          y += 3;
          doc.setFont('helvetica', 'bold');
          doc.text('Area Breakdown:', margin, y);
          y += 7;
          doc.setFont('helvetica', 'normal');
          
          doc.text(`Total Field: ${economicData.areas.totalArea.toFixed(2)} hectares`, margin + 3, y);
          y += 6;
          doc.text(`Infected Area: ${economicData.areas.infectedArea.toFixed(2)} hectares`, margin + 3, y);
          y += 6;
          doc.text(`Healthy Area: ${economicData.areas.healthyArea.toFixed(2)} hectares`, margin + 3, y);
          y += 6;
        }

        y += 10;
      }

      // ═══════════════════════════════════════════
      // FUSION RESULTS
      // ═══════════════════════════════════════════

      if (fusionResults && fusionResults.length > 0) {
        checkPage();
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('5. Multimodal Diagnosis', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const topDiagnosis = fusionResults[0].diagnosis;
        if (topDiagnosis) {
          doc.text(`Primary Diagnosis: ${topDiagnosis.refined_diagnosis || 'N/A'}`, margin, y);
          y += 7;
          doc.text(`Confidence: ${((topDiagnosis.confidence || 0) * 100).toFixed(1)}%`, margin, y);
          y += 7;
          doc.text(`Severity Level: ${topDiagnosis.severity || 'N/A'}`, margin, y);
          y += 10;

          if (topDiagnosis.action) {
            doc.setFont('helvetica', 'bold');
            doc.text('Recommended Action:', margin, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(topDiagnosis.action, pageWidth - margin * 2);
            lines.forEach(line => {
              checkPage();
              doc.text(line, margin + 3, y);
              y += 6;
            });
          }

          y += 5;
        }

        // Fusion statistics
        const fusionCount = fusionResults.length;
        const avgFusionConf = fusionResults.reduce((sum, r) => 
          sum + ((r.diagnosis?.confidence || 0) * 100), 0) / fusionCount;

        doc.text(`Total Analyses: ${fusionCount}`, margin, y);
        y += 6;
        doc.text(`Average Fusion Confidence: ${avgFusionConf.toFixed(1)}%`, margin, y);
        y += 12;
      }

      // ═══════════════════════════════════════════
      // ALERTS
      // ═══════════════════════════════════════════

      checkPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('6. Active Alerts & Warnings', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      if (alerts && alerts.length > 0) {
        doc.text(`Total Alerts: ${alerts.length}`, margin, y);
        y += 10;

        doc.setFont('helvetica', 'bold');
        doc.text('Alert Details:', margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');

        alerts.slice(0, 5).forEach((alert, i) => {
          checkPage();
          doc.text(`${i + 1}. [${(alert.type || 'INFO').toUpperCase()}] ${alert.title || 'Alert'}`, margin + 3, y);
          y += 6;
          if (alert.message) {
            const msg = String(alert.message).substring(0, 80);
            doc.setFontSize(10);
            doc.text(`   ${msg}${msg.length > 79 ? '...' : ''}`, margin + 5, y);
            doc.setFontSize(11);
            y += 6;
          }
          y += 2;
        });
      } else {
        doc.setTextColor(34, 139, 34);
        doc.text('✓ No critical alerts - Field conditions are acceptable', margin, y);
        doc.setTextColor(0, 0, 0);
        y += 7;
      }

      y += 10;

      // ═══════════════════════════════════════════
      // RECOMMENDATIONS
      // ═══════════════════════════════════════════

      checkPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('7. Immediate Recommendations', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const recs = (recommendations && recommendations.length > 0) 
        ? recommendations 
        : [
            'Apply targeted fungicide treatment to detected disease zones',
            'Monitor field for disease progression over next 7 days',
            'Implement soil moisture management to prevent further spread',
            'Schedule follow-up drone survey in 14 days to assess treatment effectiveness',
            'Consider crop rotation in severely affected zones for next season'
          ];

      recs.slice(0, 6).forEach((rec, i) => {
        checkPage();
        const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - margin * 2 - 5);
        lines.forEach(line => {
          doc.text(line, margin, y);
          y += 6;
        });
        y += 2;
      });

      y += 10;

      // ═══════════════════════════════════════════
      // FINAL ASSESSMENT
      // ═══════════════════════════════════════════

      checkPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('8. Final Assessment', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const infectionRate = gridStats?.infectedPercentage || 0;
      const statusText = infectionRate > 50 ? 'Significant intervention required' :
                        infectionRate > 30 ? 'Moderate treatment needed' :
                        infectionRate > 10 ? 'Targeted treatment recommended' :
                        'Field health acceptable';

      doc.text(`Field Health Status: ${statusText}`, margin, y);
      y += 7;
      doc.text(`Infection Coverage: ${infectionRate.toFixed(1)}% of field`, margin, y);
      y += 7;
      doc.text(`Total Detections Analyzed: ${totalDetections}`, margin, y);
      y += 7;
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin, y);
      y += 7;
      doc.text(`Next Review: ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}`, margin, y);

      // ═══════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════

      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Report ID: ${missionMetadata?.fieldId}-${Date.now()} | Page ${i}/${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // ═══════════════════════════════════════════
      // SAVE
      // ═══════════════════════════════════════════

      const filename = `Mission-Report-${missionMetadata?.fieldId || 'REPORT'}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
      doc.save(filename);

      console.log('✅ PDF saved:', filename);
      console.log('═══════════════════════════════════');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('❌ PDF Error:', err);
      setError(`Generation failed: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mission-report-panel">
      <div className="panel-header">
        <h3>📄 Mission Report Generator</h3>
        <p className="panel-subtitle">Export complete dashboard analysis to PDF</p>
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
            '📥 Generate & Download Report'
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
          <p><strong>📊 Live Data Status:</strong></p>
          <div style={{ fontSize: '11px', marginTop: '8px', lineHeight: '1.6' }}>
            <div>✅ Detections: <strong>{detections?.length || 0}</strong></div>
            <div>✅ Grid Analysis: <strong>{gridStats ? `${gridStats.infectedPercentage?.toFixed(0)}% infected` : 'Pending'}</strong></div>
            <div>✅ Economic Data: <strong>{economicData?.financialData ? `₹${Math.round(economicData.financialData.netBenefit || 0).toLocaleString()}` : 'Calculating'}</strong></div>
            <div>✅ Sensor Data: <strong>{sensorData ? 'Live' : 'Initializing'}</strong></div>
            <div>✅ Fusion Results: <strong>{fusionResults?.length || 0}</strong></div>
            <div>{alerts?.length > 0 ? '🚨' : '✅'} Alerts: <strong>{alerts?.length || 0}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionReportPanel;
