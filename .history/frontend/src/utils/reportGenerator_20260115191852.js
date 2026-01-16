/**
 * Report Generator Utility (FIXED)
 * Creates professional PDF reports using jsPDF
 * Properly handles actual data structure from Dashboard
 */

import jsPDF from 'jspdf';

export const generateMissionReport = (missionData) => {
  const {
    missionMetadata = {},
    detections = [],
    sprayRecommendation = null,
    economicData = {},
    mapState = {}
  } = missionData;

  console.log('📄 Generating report with data:', {
    detectionsCount: detections.length,
    economicData,
    sprayRecommendation,
    missionMetadata
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

  // ========== HELPER FUNCTIONS ==========
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
      if (index > 0) {
        checkNewPage();
      }
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

  // ========== HEADER (GREEN BANNER) ==========
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
  doc.text(`Generated: ${new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 30, { align: 'center' });

  yPos = 45;

  // ========== MISSION INFORMATION ==========
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Mission Information', margin, yPos);
  yPos += 8;

  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
  yPos += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const missionInfo = [
    ['Field ID:', missionMetadata.fieldId || 'FIELD-001'],
    ['Field Name:', missionMetadata.fieldName || 'North Agricultural Plot'],
    ['Field Area:', `${missionMetadata.fieldAreaHectares || 12.5} hectares`],
    ['Drone Model:', missionMetadata.droneModel || 'DJI Mavic 3 Enterprise'],
    ['Operator:', missionMetadata.operatorName || 'Field Operator'],
    ['Mission Start:', missionMetadata.missionStart ? 
      new Date(missionMetadata.missionStart).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A'],
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
  checkNewPage();

  // ========== DETECTION SUMMARY ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detection Summary', margin, yPos);
  yPos += 8;

  doc.setDrawColor(34, 139, 34);
  doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
  yPos += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const totalDetections = detections.length;
  
  // Process detections - handle both 'disease' and 'class' properties
  const diseaseMap = {};
  const confidences = [];

  detections.forEach(det => {
    // Get disease name (could be 'disease' or 'class' property)
    const diseaseName = det.disease || det.class || det.label || 'Unknown';
    diseaseMap[diseaseName] = (diseaseMap[diseaseName] || 0) + 1;
    
    // Get confidence (could be decimal 0-1 or percentage 0-100)
    if (det.confidence !== undefined && det.confidence !== null) {
      const conf = Number(det.confidence);
      // If confidence is between 0-1, convert to percentage
      confidences.push(conf <= 1 ? conf * 100 : conf);
    }
  });

  const avgConfidence = confidences.length > 0
    ? (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(1)
    : 'N/A';

  doc.text(`Total Detections: ${totalDetections}`, margin, yPos);
  yPos += 6;
  doc.text(`Average Confidence: ${avgConfidence}%`, margin, yPos);
  yPos += 6;
  
  // Count affected vs healthy
  const affectedDetections = Object.entries(diseaseMap)
    .filter(([disease]) => !disease.toLowerCase().includes('healthy'))
    .reduce((sum, [, count]) => sum + count, 0);
  
  doc.text(`Affected Detections: ${affectedDetections}`, margin, yPos);
  yPos += 6;
  doc.text(`Healthy Detections: ${totalDetections - affectedDetections}`, margin, yPos);
  yPos += 10;

  checkNewPage();

  // Disease Breakdown
  doc.setFont('helvetica', 'bold');
  doc.text('Disease Breakdown:', margin, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  
  if (Object.keys(diseaseMap).length > 0) {
    // Sort by count (descending)
    const sortedDiseases = Object.entries(diseaseMap)
      .sort(([, a], [, b]) => b - a);

    sortedDiseases.forEach(([disease, count]) => {
      checkNewPage();
      const percentage = ((count / totalDetections) * 100).toFixed(1);
      doc.text(`• ${disease}: ${count} detections (${percentage}%)`, margin + 5, yPos);
      yPos += 6;
    });
  } else {
    doc.text('• No disease data available', margin + 5, yPos);
    yPos += 6;
  }

  yPos += 8;
  checkNewPage();

  // ========== SPRAY RECOMMENDATION ==========
  if (sprayRecommendation && Object.keys(sprayRecommendation).length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Spray Recommendation', margin, yPos);
    yPos += 8;

    doc.setDrawColor(34, 139, 34);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (sprayRecommendation.status) {
      doc.text(`Status: ${sprayRecommendation.status}`, margin, yPos);
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

    if (sprayRecommendation.action) {
      yPos += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Recommended Action:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      yPos += addText(sprayRecommendation.action, margin + 5, yPos, { maxWidth: pageWidth - margin * 2 - 5 });
    }

    yPos += 8;
    checkNewPage();
  }

  // ========== ECONOMIC IMPACT ANALYSIS ==========
  if (economicData && Object.keys(economicData).length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Economic Impact Analysis', margin, yPos);
    yPos += 8;

    doc.setDrawColor(34, 139, 34);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Check for various property names your economic data might have
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
    checkNewPage();
  }

  // ========== RECOMMENDATIONS ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations', margin, yPos);
  yPos += 8;

  doc.setDrawColor(34, 139, 34);
  doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
  yPos += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

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
