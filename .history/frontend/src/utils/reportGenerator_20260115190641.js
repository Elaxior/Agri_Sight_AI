/**
 * Report Generator Utility
 * Creates professional PDF reports using jsPDF
 */

import jsPDF from 'jspdf';

export const generateMissionReport = (missionData) => {
  const {
    missionMetadata,
    detections,
    sprayRecommendation,
    economicData,
    mapState
  } = missionData;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // ========== HEADER ==========
  doc.setFillColor(34, 139, 34); // Dark green
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('🌾 PRECISION AGRICULTURE MISSION REPORT', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

  yPosition = 40;

  // ========== MISSION METADATA SECTION ==========
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Mission Information', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  const metadataInfo = [
    [`Field ID:`, missionMetadata.fieldId || 'N/A'],
    [`Field Name:`, missionMetadata.fieldName || 'N/A'],
    [`Field Area:`, `${missionMetadata.fieldAreaHectares || 0} hectares`],
    [`Drone Model:`, missionMetadata.droneModel || 'N/A'],
    [`Operator:`, missionMetadata.operatorName || 'N/A'],
    [`Mission Start:`, new Date(missionMetadata.missionStart).toLocaleString()],
    [`Status:`, missionMetadata.missionEnd ? 'Completed' : 'In Progress']
  ];

  metadataInfo.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 15, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(value, 50, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // ========== DETECTION SUMMARY ==========
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Detection Summary', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  const totalDetections = detections?.length || 0;
  const diseaseTypes = {};
  const confidenceScores = [];

  detections?.forEach(detection => {
    diseaseTypes[detection.disease] = (diseaseTypes[detection.disease] || 0) + 1;
    if (detection.confidence) confidenceScores.push(detection.confidence);
  });

  const avgConfidence =
    confidenceScores.length > 0
      ? (confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length * 100).toFixed(2)
      : 0;

  doc.text(`Total Detections: ${totalDetections}`, 15, yPosition);
  yPosition += 7;
  doc.text(`Average Confidence: ${avgConfidence}%`, 15, yPosition);
  yPosition += 7;

  doc.setFont(undefined, 'bold');
  doc.text('Disease Breakdown:', 15, yPosition);
  yPosition += 7;

  doc.setFont(undefined, 'normal');
  Object.entries(diseaseTypes).forEach(([disease, count]) => {
    doc.text(`• ${disease}: ${count} detections`, 20, yPosition);
    yPosition += 6;
  });

  yPosition += 5;

  // ========== CHECK IF NEW PAGE NEEDED ==========
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 15;
  }

  // ========== SPRAY RECOMMENDATION ==========
  if (sprayRecommendation) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Spray Recommendation', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    doc.text(`Status: ${sprayRecommendation.status || 'Pending'}`, 15, yPosition);
    yPosition += 7;

    if (sprayRecommendation.coverage) {
      doc.text(`Coverage: ${sprayRecommendation.coverage}%`, 15, yPosition);
      yPosition += 7;
    }

    if (sprayRecommendation.estimatedArea) {
      doc.text(`Estimated Area: ${sprayRecommendation.estimatedArea} sq.m`, 15, yPosition);
      yPosition += 7;
    }

    if (sprayRecommendation.pathLength) {
      doc.text(`Path Length: ${sprayRecommendation.pathLength} meters`, 15, yPosition);
      yPosition += 7;
    }

    yPosition += 5;
  }

  // ========== CHECK IF NEW PAGE NEEDED ==========
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 15;
  }

  // ========== ECONOMIC ANALYSIS ==========
  if (economicData && Object.keys(economicData).length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Economic Impact Analysis', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    if (economicData.estimatedLoss) {
      doc.text(
        `Estimated Loss (No Action): ₹${economicData.estimatedLoss.toLocaleString('en-IN')}`,
        15,
        yPosition
      );
      yPosition += 7;
    }

    if (economicData.treatmentCost) {
      doc.text(
        `Treatment Cost: ₹${economicData.treatmentCost.toLocaleString('en-IN')}`,
        15,
        yPosition
      );
      yPosition += 7;
    }

    if (economicData.netBenefit) {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(34, 139, 34);
      doc.text(
        `Net Benefit: ₹${economicData.netBenefit.toLocaleString('en-IN')}`,
        15,
        yPosition
      );
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      yPosition += 7;
    }

    if (economicData.roi) {
      doc.text(`ROI: ${economicData.roi.toFixed(2)}%`, 15, yPosition);
      yPosition += 7;
    }

    yPosition += 5;
  }

  // ========== CHECK IF NEW PAGE NEEDED ==========
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 15;
  }

  // ========== RECOMMENDATIONS ==========
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Recommendations', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  const recommendations = [
    '✓ Apply targeted fungicide treatment to detected areas',
    '✓ Monitor field for disease progression over next 7 days',
    '✓ Implement soil moisture management to prevent spread',
    '✓ Schedule follow-up drone survey in 14 days',
    '✓ Consider crop rotation in severely affected zones'
  ];

  recommendations.forEach(rec => {
    doc.text(rec, 15, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // ========== FOOTER ==========
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(128, 128, 128);

  doc.text(
    `Report generated by Agri-Drone Analytics | Session: ${missionMetadata.fieldId}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};
