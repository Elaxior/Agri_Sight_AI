/**
 * Comprehensive Report Generator
 * Includes all dashboard panel data
 */

import jsPDF from 'jspdf';

export const generateMissionReport = (missionData) => {
  const {
    missionMetadata = {},
    detections = [],
    gridStats = null,
    sprayRecommendation = null,
    economicData = {},
    sensorData = null,
    fusionResults = [],
    alerts = [],
    mapState = {}
  } = missionData;

  console.log('📄 Complete report data:', {
    detectionsCount: detections.length,
    hasGridStats: !!gridStats,
    hasSprayRec: !!sprayRecommendation,
    hasEconomic: !!economicData && Object.keys(economicData).length > 0,
    hasSensor: !!sensorData,
    fusionCount: fusionResults.length,
    alertsCount: alerts.length
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 20;

  // Helper functions
  const checkNewPage = () => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  const addText = (text, x, y, options = {}) => {
    const maxWidth = options.maxWidth || (pageWidth - margin * 2);
    const lines = doc.splitTextToSize(String(text), maxWidth);
    
    lines.forEach((line, index) => {
      if (index > 0) checkNewPage();
      doc.text(line, x, y + (index * 6));
    });
    
    return lines.length * 6;
  };

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return Number(value).toFixed(decimals);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const addSectionHeader = (title) => {
    checkNewPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 8;
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  };

  // ========== HEADER ==========
  doc.setFillColor(34, 139, 34);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PRECISION AGRICULTURE', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('MISSION REPORT', pageWidth / 2, 24, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

  yPos = 45;

  // ========== MISSION INFORMATION ==========
  doc.setTextColor(0, 0, 0);
  addSectionHeader('Mission Information');

  const missionInfo = [
    ['Field ID:', missionMetadata.fieldId || 'FIELD-001'],
    ['Field Name:', missionMetadata.fieldName || 'North Agricultural Plot'],
    ['Field Area:', `${missionMetadata.fieldAreaHectares || 12.5} hectares`],
    ['Drone Model:', missionMetadata.droneModel || 'DJI Mavic 3 Enterprise'],
    ['Operator:', missionMetadata.operatorName || 'Field Operator'],
    ['Mission Start:', missionMetadata.missionStart ? 
      new Date(missionMetadata.missionStart).toLocaleString() : 'N/A'],
    ['Status:', missionMetadata.missionEnd ? 'Completed' : 'In Progress']
  ];

  missionInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), margin + 40, yPos);
    yPos += 6;
  });

  yPos += 8;

  // ========== DETECTION SUMMARY ==========
  addSectionHeader('Detection Summary');

  const totalDetections = detections.length;
  const diseaseMap = {};
  const confidences = [];

  detections.forEach(det => {
    const diseaseName = det.disease || det.class || det.label || 'Unknown';
    diseaseMap[diseaseName] = (diseaseMap[diseaseName] || 0) + 1;
    
    if (det.confidence !== undefined && det.confidence !== null) {
      const conf = Number(det.confidence);
      confidences.push(conf <= 1 ? conf * 100 : conf);
    }
  });

  const avgConfidence = confidences.length > 0
    ? (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(1)
    : 'N/A';

  const affectedDetections = Object.entries(diseaseMap)
    .filter(([disease]) => !disease.toLowerCase().includes('healthy'))
    .reduce((sum, [, count]) => sum + count, 0);

  doc.text(`Total Detections: ${totalDetections}`, margin, yPos);
  yPos += 6;
  doc.text(`Average Confidence: ${avgConfidence}%`, margin, yPos);
  yPos += 6;
  doc.text(`Affected Detections: ${affectedDetections}`, margin, yPos);
  yPos += 6;
  doc.text(`Healthy Detections: ${totalDetections - affectedDetections}`, margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Disease Breakdown:', margin, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');

  if (Object.keys(diseaseMap).length > 0) {
    const sortedDiseases = Object.entries(diseaseMap).sort(([, a], [, b]) => b - a);
    sortedDiseases.forEach(([disease, count]) => {
      checkNewPage();
      const percentage = ((count / totalDetections) * 100).toFixed(1);
      doc.text(`• ${disease}: ${count} detections (${percentage}%)`, margin + 5, yPos);
      yPos += 6;
    });
  }

  yPos += 8;

  // ========== ENVIRONMENTAL CONDITIONS ==========
  if (sensorData) {
    addSectionHeader('Environmental Conditions');

    const sensorInfo = [
      ['Air Temperature:', `${formatNumber(sensorData.air_temperature || sensorData.temperature, 1)}°C`],
      ['Air Humidity:', `${formatNumber(sensorData.air_humidity || sensorData.humidity, 1)}%`],
      ['Soil Temperature:', `${formatNumber(sensorData.soil_temperature, 1)}°C`],
      ['Soil Moisture:', `${formatNumber(sensorData.soil_moisture, 1)}%`],
      ['Soil pH:', formatNumber(sensorData.soil_ph || sensorData.ph, 2)],
      ['Recorded At:', sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleString() : 'N/A']
    ];

    sensorInfo.forEach(([label, value]) => {
      checkNewPage();
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), margin + 45, yPos);
      yPos += 6;
    });

    yPos += 8;
  }

  // ========== GRID ANALYSIS ==========
  if (gridStats) {
    addSectionHeader('Field Grid Analysis');

    doc.text(`Grid Size: ${gridStats.gridSize || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Total Cells: ${gridStats.totalCells || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Affected Cells: ${gridStats.affectedCells || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Healthy Cells: ${gridStats.healthyCells || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Coverage: ${formatNumber(gridStats.affectedPercentage, 1)}%`, margin, yPos);
    yPos += 10;

    if (gridStats.severityDistribution) {
      doc.setFont('helvetica', 'bold');
      doc.text('Severity Distribution:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');

      Object.entries(gridStats.severityDistribution).forEach(([severity, count]) => {
        checkNewPage();
        doc.text(`• ${severity}: ${count} cells`, margin + 5, yPos);
        yPos += 6;
      });
    }

    yPos += 8;
  }

  // ========== SPRAY RECOMMENDATION ==========
  if (sprayRecommendation) {
    addSectionHeader('Spray Planning & Recommendations');

    if (sprayRecommendation.pathExists !== false) {
      doc.text(`Path Status: ${sprayRecommendation.status || 'Generated'}`, margin, yPos);
      yPos += 6;

      if (sprayRecommendation.waypoints && sprayRecommendation.waypoints.length > 0) {
        doc.text(`Waypoints: ${sprayRecommendation.waypoints.length}`, margin, yPos);
        yPos += 6;
      }

      if (sprayRecommendation.coverage !== undefined) {
        doc.text(`Coverage: ${formatNumber(sprayRecommendation.coverage, 1)}%`, margin, yPos);
        yPos += 6;
      }

      if (sprayRecommendation.estimatedArea !== undefined) {
        doc.text(`Estimated Area: ${formatNumber(sprayRecommendation.estimatedArea, 2)} sq.m`, margin, yPos);
        yPos += 6;
      }

      if (sprayRecommendation.pathLength !== undefined) {
        doc.text(`Path Length: ${formatNumber(sprayRecommendation.pathLength, 2)} meters`, margin, yPos);
        yPos += 6;
      }

      if (sprayRecommendation.recommendation) {
        yPos += 3;
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Action:', margin, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        yPos += addText(sprayRecommendation.recommendation.action || 'Apply targeted treatment', 
                       margin + 5, yPos, { maxWidth: pageWidth - margin * 2 - 5 });
      }
    } else {
      doc.text('No spray path generated yet', margin, yPos);
      yPos += 6;
    }

    yPos += 8;
  }

  // ========== ECONOMIC IMPACT ==========
  if (economicData && Object.keys(economicData).length > 0) {
    addSectionHeader('Economic Impact Analysis');

    const estimatedLoss = economicData.estimatedLoss || economicData.potentialLoss || economicData.cropLossUntreated;
    const treatmentCost = economicData.treatmentCost || economicData.sprayingCost;
    const netBenefit = economicData.netBenefit || economicData.expectedSavings;
    const roi = economicData.roi || economicData.ROI;

    if (estimatedLoss !== undefined && estimatedLoss !== null) {
      doc.text(`Estimated Loss (No Action): ${formatCurrency(estimatedLoss)}`, margin, yPos);
      yPos += 6;
    }

    if (treatmentCost !== undefined && treatmentCost !== null) {
      doc.text(`Treatment Cost: ${formatCurrency(treatmentCost)}`, margin, yPos);
      yPos += 6;
    }

    if (netBenefit !== undefined && netBenefit !== null) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34);
      doc.text(`Net Benefit: ${formatCurrency(netBenefit)}`, margin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
    }

    if (roi !== undefined && roi !== null) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Return on Investment (ROI): ${formatNumber(roi, 1)}%`, margin, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
    }

    yPos += 8;
  }

  // ========== ACTIVE ALERTS ==========
  if (alerts && alerts.length > 0) {
    addSectionHeader('Active Alerts & Warnings');

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    const mediumAlerts = alerts.filter(a => a.severity === 'medium').length;

    doc.text(`Total Alerts: ${alerts.length}`, margin, yPos);
    yPos += 6;
    doc.text(`Critical: ${criticalAlerts} | High: ${highAlerts} | Medium: ${mediumAlerts}`, margin, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Alert Details:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');

    alerts.slice(0, 10).forEach((alert, index) => {
      checkNewPage();
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. [${alert.severity?.toUpperCase()}] ${alert.title || 'Alert'}`, margin + 5, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      yPos += addText(alert.message || 'No description', margin + 8, yPos, { maxWidth: pageWidth - margin * 2 - 8 });
      yPos += 4;
    });

    if (alerts.length > 10) {
      doc.setFontSize(9);
      doc.text(`... and ${alerts.length - 10} more alerts`, margin + 5, yPos);
      doc.setFontSize(10);
      yPos += 6;
    }

    yPos += 8;
  }

  // ========== RECOMMENDATIONS ==========
  addSectionHeader('Recommendations');

  const recommendations = [
    'Apply targeted fungicide treatment to detected areas',
    'Monitor field for disease progression over next 7 days',
    'Implement soil moisture management to prevent spread',
    'Schedule follow-up drone survey in 14 days',
    'Consider crop rotation in severely affected zones'
  ];

  recommendations.forEach((rec, index) => {
    checkNewPage();
    yPos += addText(`${index + 1}. ${rec}`, margin, yPos, { maxWidth: pageWidth - margin * 2 });
    yPos += 2;
  });

  // ========== FOOTER ON ALL PAGES ==========
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages} | Report generated by Agri-Drone Analytics | Session: ${missionMetadata.fieldId || 'N/A'}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
};
