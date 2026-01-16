/**
 * ✅ PRODUCTION-READY Mission Report Panel
 * - Professional layout with section separators
 * - Proper economic data extraction
 * - Clean alignment and spacing
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
      console.log('📄 REPORT GENERATION');
      console.log('═══════════════════════════════════');
      console.log('Detections:', detections?.length || 0);
      console.log('GridStats:', gridStats);
      console.log('EconomicData:', economicData);
      console.log('EconomicData.financialData:', economicData?.financialData);
      console.log('SensorData:', sensorData);
      console.log('═══════════════════════════════════');

      const doc = new jsPDF();
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let y = 20;

      // Helper: Check if new page needed
      const checkPage = (requiredSpace = 20) => {
        if (y > pageHeight - requiredSpace) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      // Helper: Add section separator
      const addSeparator = () => {
        checkPage();
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      };

      // Helper: Add section title
      const addSectionTitle = (title) => {
        checkPage(30);
        doc.setFillColor(34, 139, 34);
        doc.rect(margin - 2, y - 5, contentWidth + 4, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      // Helper: Add label-value pair
      const addLabelValue = (label, value, bold = false) => {
        checkPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(label, margin + 2, y);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(String(value), margin + 70, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
      };

      // ═══════════════════════════════════════════
      // COVER PAGE
      // ═══════════════════════════════════════════
      
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 55, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('PRECISION AGRICULTURE', pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('MISSION REPORT', pageWidth / 2, 37, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 47, { align: 'center' });

      y = 70;

      // ═══════════════════════════════════════════
      // MISSION INFORMATION
      // ═══════════════════════════════════════════

      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.rect(margin, y - 5, contentWidth, 45);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Mission Information', margin + 3, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      addLabelValue('Field ID:', missionMetadata?.fieldId || 'N/A');
      addLabelValue('Location:', missionMetadata?.fieldName || 'N/A');
      addLabelValue('Field Area:', `${missionMetadata?.fieldAreaHectares || 'N/A'} hectares`);
      addLabelValue('Operator:', missionMetadata?.operatorName || 'N/A');
      addLabelValue('Drone Model:', missionMetadata?.droneModel || 'N/A');

      y += 8;
      addSeparator();

      // ═══════════════════════════════════════════
      // SECTION 1: DETECTION SUMMARY
      // ═══════════════════════════════════════════

      addSectionTitle('1. DETECTION SUMMARY');

      const totalDetections = detections?.length || 0;
      addLabelValue('Total Detections:', totalDetections);

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
        addLabelValue('Average Confidence:', `${avgConf}%`);

        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.text('Disease Breakdown:', margin + 2, y);
        y += 6;

        const sortedDiseases = Object.entries(diseaseCount).sort(([,a], [,b]) => b - a);
        sortedDiseases.forEach(([disease, count]) => {
          checkPage();
          const pct = ((count / totalDetections) * 100).toFixed(1);
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${disease}:`, margin + 5, y);
          doc.setFont('helvetica', 'bold');
          doc.text(`${count} (${pct}%)`, margin + 80, y);
          doc.setFont('helvetica', 'normal');
          y += 5;
        });
      }

      y += 5;
      addSeparator();

      // ═══════════════════════════════════════════
      // SECTION 2: ENVIRONMENTAL CONDITIONS
      // ═══════════════════════════════════════════

      if (sensorData) {
        addSectionTitle('2. ENVIRONMENTAL CONDITIONS');

        addLabelValue('Air Temperature:', `${(sensorData.air_temperature || 0).toFixed(1)}°C`);
        addLabelValue('Air Humidity:', `${(sensorData.air_humidity || 0).toFixed(1)}%`);
        addLabelValue('Soil Temperature:', `${(sensorData.soil_temperature || 0).toFixed(1)}°C`);
        addLabelValue('Soil Moisture:', `${(sensorData.soil_moisture || 0).toFixed(1)}%`);
        addLabelValue('Soil pH:', (sensorData.soil_ph || 0).toFixed(2));
        
        y += 2;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Recorded: ${new Date(sensorData.timestamp).toLocaleString('en-IN')}`, margin + 2, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        y += 5;
        addSeparator();
      }

      // ═══════════════════════════════════════════
      // SECTION 3: FIELD GRID ANALYSIS
      // ═══════════════════════════════════════════

      if (gridStats) {
        addSectionTitle('3. FIELD GRID ANALYSIS');

        addLabelValue('Grid Configuration:', gridStats.gridSize || '10x10');
        addLabelValue('Total Grid Cells:', gridStats.totalCells || 0);
        addLabelValue('Infected Cells:', gridStats.infectedCount || 0);
        addLabelValue('Healthy Cells:', gridStats.healthyCount || 0);
        
        y += 2;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(gridStats.infectedPercentage > 50 ? 200 : 34, 
                        gridStats.infectedPercentage > 50 ? 40 : 139, 
                        gridStats.infectedPercentage > 50 ? 40 : 34);
        doc.text('Infection Rate:', margin + 2, y);
        doc.setFontSize(12);
        doc.text(`${(gridStats.infectedPercentage || 0).toFixed(1)}%`, margin + 70, y);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        y += 8;
        addSeparator();
      }

      // ═══════════════════════════════════════════
      // SECTION 4: ECONOMIC ANALYSIS & ROI
      // ═══════════════════════════════════════════

      addSectionTitle('4. ECONOMIC ANALYSIS & ROI');

      if (economicData) {
        console.log('📊 Processing economic data...');
        
        // Extract financial data from nested structure
        const financial = economicData.financialData || economicData;
        const areas = economicData.areas;
        
        console.log('Financial object:', financial);
        console.log('Areas object:', areas);

        if (financial && (financial.potentialLoss || financial.treatmentCost)) {
          const loss = financial.potentialLoss || financial.estimatedLoss || 0;
          const cost = financial.treatmentCost || financial.sprayingCost || 0;
          const benefit = financial.netBenefit || (loss - cost) || 0;
          const roi = financial.roi || financial.ROI || 0;

          addLabelValue('Est. Loss (No Treatment):', `₹${Math.round(loss).toLocaleString('en-IN')}`);
          addLabelValue('Treatment Cost:', `₹${Math.round(cost).toLocaleString('en-IN')}`);
          
          y += 2;
          doc.setFillColor(240, 255, 240);
          doc.rect(margin, y - 4, contentWidth, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 139, 34);
          doc.setFontSize(11);
          doc.text('Net Benefit:', margin + 2, y);
          doc.setFontSize(12);
          doc.text(`₹${Math.round(benefit).toLocaleString('en-IN')}`, margin + 70, y);
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          y += 8;

          doc.setFont('helvetica', 'bold');
          doc.text('Return on Investment (ROI):', margin + 2, y);
          doc.setFontSize(11);
          doc.text(`${roi.toFixed(1)}%`, margin + 70, y);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          y += 8;

          if (financial.paybackPeriod) {
            addLabelValue('Payback Period:', `${financial.paybackPeriod.toFixed(1)} days`);
          }

          // Area breakdown
          if (areas) {
            y += 3;
            doc.setFont('helvetica', 'bold');
            doc.text('Area Breakdown:', margin + 2, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            
            addLabelValue('Total Field:', `${areas.totalArea.toFixed(2)} hectares`);
            addLabelValue('Infected Area:', `${areas.infectedArea.toFixed(2)} hectares`);
            addLabelValue('Healthy Area:', `${areas.healthyArea.toFixed(2)} hectares`);
          }
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('Economic analysis pending - insufficient data', margin + 2, y);
          doc.setTextColor(0, 0, 0);
          y += 6;
        }
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text('Economic data not available', margin + 2, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
      }

      y += 5;
      addSeparator();

      // ═══════════════════════════════════════════
      // SECTION 5: MULTIMODAL DIAGNOSIS
      // ═══════════════════════════════════════════

      if (fusionResults && fusionResults.length > 0) {
        addSectionTitle('5. MULTIMODAL DIAGNOSIS');

        const topDiagnosis = fusionResults[0].diagnosis;
        if (topDiagnosis) {
          addLabelValue('Primary Diagnosis:', topDiagnosis.refined_diagnosis || 'N/A');
          addLabelValue('Confidence Level:', `${((topDiagnosis.confidence || 0) * 100).toFixed(1)}%`);
          addLabelValue('Severity:', topDiagnosis.severity || 'N/A');

          if (topDiagnosis.action) {
            y += 3;
            doc.setFont('helvetica', 'bold');
            doc.text('Recommended Action:', margin + 2, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const lines = doc.splitTextToSize(topDiagnosis.action, contentWidth - 5);
            lines.forEach(line => {
              checkPage();
              doc.text(line, margin + 5, y);
              y += 5;
            });
            doc.setFontSize(10);
          }

          y += 3;
          const fusionCount = fusionResults.length;
          const avgConf = fusionResults.reduce((sum, r) => 
            sum + ((r.diagnosis?.confidence || 0) * 100), 0) / fusionCount;

          addLabelValue('Total Analyses:', fusionCount);
          addLabelValue('Avg. Fusion Confidence:', `${avgConf.toFixed(1)}%`);
        }

        y += 5;
        addSeparator();
      }

      // ═══════════════════════════════════════════
      // SECTION 6: ACTIVE ALERTS
      // ═══════════════════════════════════════════

      addSectionTitle('6. ACTIVE ALERTS & WARNINGS');

      if (alerts && alerts.length > 0) {
        addLabelValue('Total Alerts:', alerts.length);

        const criticalCount = alerts.filter(a => a.type === 'CRITICAL').length;
        const highCount = alerts.filter(a => a.type === 'WARNING' || a.severity === 'high').length;

        if (criticalCount > 0 || highCount > 0) {
          y += 2;
          doc.setFont('helvetica', 'bold');
          doc.text(`Critical: ${criticalCount} | High: ${highCount}`, margin + 2, y);
          doc.setFont('helvetica', 'normal');
          y += 6;
        }

        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.text('Alert Details:', margin + 2, y);
        y += 6;

        alerts.slice(0, 5).forEach((alert, i) => {
          checkPage(15);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(`${i + 1}. [${(alert.type || 'INFO').toUpperCase()}]`, margin + 5, y);
          doc.setFont('helvetica', 'normal');
          doc.text(alert.title || 'Alert', margin + 30, y);
          y += 5;
          
          if (alert.message) {
            doc.setFontSize(9);
            const msg = String(alert.message).substring(0, 85);
            const msgLines = doc.splitTextToSize(`${msg}${msg.length > 84 ? '...' : ''}`, contentWidth - 15);
            msgLines.forEach(line => {
              doc.text(line, margin + 8, y);
              y += 4;
            });
            doc.setFontSize(10);
          }
          y += 2;
        });

        if (alerts.length > 5) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`... and ${alerts.length - 5} more alerts`, margin + 5, y);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          y += 5;
        }
      } else {
        doc.setFillColor(240, 255, 240);
        doc.rect(margin, y - 3, contentWidth, 8, 'F');
        doc.setTextColor(34, 139, 34);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ No critical alerts - Field conditions acceptable', margin + 2, y);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        y += 8;
      }

      y += 5;
      addSeparator();

      // ═══════════════════════════════════════════
      // SECTION 7: RECOMMENDATIONS
      // ═══════════════════════════════════════════

      addSectionTitle('7. IMMEDIATE RECOMMENDATIONS');

      const recs = (recommendations && recommendations.length > 0) 
        ? recommendations 
        : [
            'Apply targeted fungicide treatment to detected disease zones',
            'Monitor field for disease progression over next 7 days',
            'Implement soil moisture management to prevent further spread',
            'Schedule follow-up drone survey in 14 days',
            'Consider crop rotation in severely affected zones'
          ];

      recs.slice(0, 6).forEach((rec, i) => {
        checkPage(12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, contentWidth - 5);
        lines.forEach(line => {
          doc.text(line, margin + 2, y);
          y += 5;
        });
        y += 1;
      });

      y += 5;
      addSeparator();

      // ═══════════════════════════════════════════
      // SECTION 8: FINAL ASSESSMENT
      // ═══════════════════════════════════════════

      addSectionTitle('8. FINAL ASSESSMENT');

      const infectionRate = gridStats?.infectedPercentage || 0;
      const statusText = infectionRate > 50 ? 'CRITICAL - Immediate intervention required' :
                        infectionRate > 30 ? 'MODERATE - Treatment needed' :
                        infectionRate > 10 ? 'MINOR - Targeted treatment' :
                        'HEALTHY - Field condition acceptable';

      const statusColor = infectionRate > 50 ? [200, 40, 40] :
                         infectionRate > 30 ? [200, 120, 40] :
                         infectionRate > 10 ? [200, 160, 40] :
                         [34, 139, 34];

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...statusColor);
      doc.text('Field Health Status:', margin + 2, y);
      doc.text(statusText, margin + 70, y);
      doc.setTextColor(0, 0, 0);
      y += 8;

      doc.setFont('helvetica', 'normal');
      addLabelValue('Infection Coverage:', `${infectionRate.toFixed(1)}% of field`);
      addLabelValue('Total Detections:', totalDetections);
      addLabelValue('Report Generated:', new Date().toLocaleString('en-IN'));
      addLabelValue('Next Review:', new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('en-IN'));

      // ═══════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════

      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Report ID: ${missionMetadata?.fieldId}-${Date.now()}`,
          margin,
          pageHeight - 10
        );
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
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
        <p className="panel-subtitle">Professional PDF report with complete analytics</p>
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
          <p><strong>📊 Data Preview:</strong></p>
          <div style={{ fontSize: '11px', marginTop: '8px', lineHeight: '1.8' }}>
            <div>✅ Detections: <strong>{detections?.length || 0}</strong></div>
            <div>✅ Infection Rate: <strong>{gridStats?.infectedPercentage?.toFixed(1) || '0'}%</strong></div>
            <div>✅ Net Benefit: <strong>{economicData?.financialData?.netBenefit ? 
              `₹${Math.round(economicData.financialData.netBenefit).toLocaleString('en-IN')}` : 'Calculating...'}</strong></div>
            <div>✅ ROI: <strong>{economicData?.financialData?.roi ? 
              `${economicData.financialData.roi.toFixed(1)}%` : 'N/A'}</strong></div>
            <div>✅ Sensor: <strong>{sensorData ? 'Live' : 'Initializing'}</strong></div>
            <div>{alerts?.length > 0 ? '🚨' : '✅'} Alerts: <strong>{alerts?.length || 0}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionReportPanel;
