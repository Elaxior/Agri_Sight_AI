/**
 * Mission Report Generator
 * Generates comprehensive PDF reports from dashboard state
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { formatCurrency, formatPercentage, formatWeight } from './economicConfig';

/**
 * Generate complete mission report
 */
export async function generateMissionReport({
  detections,
  gridStats,
  economicImpact,
  alerts,
  sessionId,
  mapElementId = 'map-container-for-capture'
}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  console.log('📄 Starting report generation...');

  // ============================================
  // COVER PAGE
  // ============================================
  doc.setFillColor(34, 139, 34);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('🌾 PRECISION AGRICULTURE', pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Mission Analysis Report', pageWidth / 2, 35, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition = 65;
  
  // Report metadata
  const reportDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
  
  doc.text(`Session ID: ${sessionId || 'N/A'}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Generated: ${reportDate}`, margin, yPosition);
  yPosition += 6;
  doc.text(`System: YOLOv8 + Firebase + React`, margin, yPosition);
  yPosition += 15;

  // ============================================
  // SECTION 1: EXECUTIVE SUMMARY
  // ============================================
  addSectionHeader(doc, 'EXECUTIVE SUMMARY', yPosition);
  yPosition += 10;

  const summary = generateExecutiveSummary(detections, gridStats, economicImpact, alerts);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(summary.text, pageWidth - 2 * margin);
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 5 + 10;

  // Key metrics box
  if (economicImpact && economicImpact.hasInfection) {
    yPosition = addKeyMetricsBox(doc, economicImpact, yPosition, margin, pageWidth);
  }

  // ============================================
  // SECTION 2: DETECTION ANALYTICS
  // ============================================
  doc.addPage();
  yPosition = margin;
  
  addSectionHeader(doc, 'DETECTION ANALYTICS', yPosition);
  yPosition += 10;

  doc.text(`Total Detections: ${detections.length}`, margin, yPosition);
  yPosition += 7;

  // Detection frequency table
  const detectionStats = calculateDetectionStats(detections);
  doc.autoTable({
    startY: yPosition,
    head: [['Detection Class', 'Count', 'Avg Confidence', 'First Detected', 'Last Detected']],
    body: detectionStats.map(stat => [
      stat.class,
      stat.count,
      `${(stat.avgConfidence * 100).toFixed(1)}%`,
      new Date(stat.firstSeen).toLocaleTimeString('en-IN'),
      new Date(stat.lastSeen).toLocaleTimeString('en-IN')
    ]),
    theme: 'striped',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: margin, right: margin }
  });
  
  yPosition = doc.lastAutoTable.finalY + 10;

  // Recent detections table
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recent Detections (Last 10)', margin, yPosition);
  yPosition += 7;

  doc.autoTable({
    startY: yPosition,
    head: [['Time', 'Class', 'Confidence', 'GPS Coordinates']],
    body: detections.slice(0, 10).map(d => [
      new Date(d.timestamp).toLocaleTimeString('en-IN'),
      d.class || 'Unknown',
      `${(d.confidence * 100).toFixed(1)}%`,
      d.gps ? `${d.gps.lat.toFixed(5)}, ${d.gps.lng.toFixed(5)}` : 'N/A'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 8 }
  });

  // ============================================
  // SECTION 3: SPATIAL ANALYSIS & MAP
  // ============================================
  doc.addPage();
  yPosition = margin;
  
  addSectionHeader(doc, 'SPATIAL ANALYSIS', yPosition);
  yPosition += 10;

  // Capture map as image
  try {
    doc.text('Field Map with Detection Zones:', margin, yPosition);
    yPosition += 7;

    const mapElement = document.querySelector('.map-container') ||
                      document.querySelector('.leaflet-container') ||
                      document.getElementById(mapElementId);
    
    if (mapElement) {
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f0f0f0',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Scale down if too tall
      const maxHeight = 120;
      const finalHeight = Math.min(imgHeight, maxHeight);
      const finalWidth = (canvas.width * finalHeight) / canvas.height;
      
      doc.addImage(imgData, 'PNG', margin, yPosition, finalWidth, finalHeight);
      yPosition += finalHeight + 10;
    } else {
      doc.text('[Map capture unavailable - map not found in DOM]', margin, yPosition);
      yPosition += 10;
    }
  } catch (error) {
    console.error('Map capture failed:', error);
    doc.text('[Map capture failed - see browser console]', margin, yPosition);
    yPosition += 10;
  }

  // Grid statistics
  if (gridStats) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Field Grid Analysis:', margin, yPosition);
    yPosition += 7;

    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: [
        ['Total Grid Cells', gridStats.totalCells],
        ['Infected Zones', gridStats.infectedCount],
        ['Healthy Zones', gridStats.totalCells - gridStats.infectedCount],
        ['Infection Coverage', `${gridStats.infectionPercentage?.toFixed(1)}%`]
      ],
      theme: 'plain',
      headStyles: { fillColor: [34, 139, 34] },
      margin: { left: margin, right: margin }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ============================================
  // SECTION 4: ECONOMIC IMPACT ANALYSIS
  // ============================================
  doc.addPage();
  yPosition = margin;
  
  addSectionHeader(doc, 'ECONOMIC IMPACT ANALYSIS', yPosition);
  yPosition += 10;

  if (economicImpact && economicImpact.hasInfection) {
    // ROI Summary
    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: [
        ['Potential Loss (No Treatment)', formatCurrency(economicImpact.financialData.financialLossUntreated)],
        ['Treatment Cost (Precision)', formatCurrency(economicImpact.interventionCosts.precision.totalCost)],
        ['Treatment Cost (Traditional)', formatCurrency(economicImpact.interventionCosts.blanket.totalCost)],
        ['Cost Savings', formatCurrency(economicImpact.interventionCosts.savings.costSavings)],
        ['Net Profit Per Application', formatCurrency(economicImpact.roi.perApplication.netProfit)],
        ['ROI Multiplier', `${economicImpact.roi.perApplication.roiMultiplier.toFixed(1)}×`],
        ['ROI Percentage', formatPercentage(economicImpact.roi.perApplication.roiPercentage, 0)]
      ],
      theme: 'striped',
      headStyles: { fillColor: [34, 139, 34] },
      margin: { left: margin, right: margin }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;

    // Chemical usage comparison
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Chemical Usage & Environmental Impact:', margin, yPosition);
    yPosition += 7;

    doc.autoTable({
      startY: yPosition,
      head: [['Approach', 'Chemical Used', 'Area Treated', 'Cost']],
      body: [
        [
          'Traditional (Blanket)',
          `${economicImpact.interventionCosts.blanket.chemicalUsage.toFixed(1)}L`,
          `${economicImpact.areas.totalArea.toFixed(2)} ha`,
          formatCurrency(economicImpact.interventionCosts.blanket.totalCost)
        ],
        [
          'Precision (AI-Guided)',
          `${economicImpact.interventionCosts.precision.chemicalUsage.toFixed(1)}L`,
          `${economicImpact.areas.infectedArea.toFixed(2)} ha`,
          formatCurrency(economicImpact.interventionCosts.precision.totalCost)
        ],
        [
          'Reduction',
          `${economicImpact.interventionCosts.savings.chemicalSaved.toFixed(1)}L (${formatPercentage(economicImpact.interventionCosts.savings.chemicalSavingsPercentage)})`,
          `${(economicImpact.areas.totalArea - economicImpact.areas.infectedArea).toFixed(2)} ha saved`,
          formatCurrency(economicImpact.interventionCosts.savings.costSavings)
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [34, 139, 34] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 }
    });
  } else {
    doc.text('✅ No infection detected - No treatment cost required!', margin, yPosition);
    yPosition += 10;
    doc.text('Field is healthy. Continue monitoring for early detection.', margin, yPosition);
  }

  // ============================================
  // SECTION 5: ALERTS & RECOMMENDATIONS
  // ============================================
  doc.addPage();
  yPosition = margin;
  
  addSectionHeader(doc, 'ALERTS & RECOMMENDED ACTIONS', yPosition);
  yPosition += 10;

  if (alerts && alerts.length > 0) {
    doc.text(`Total Alerts: ${alerts.length}`, margin, yPosition);
    yPosition += 7;

    const alertCounts = {
      critical: alerts.filter(a => a.type === 'CRITICAL').length,
      warning: alerts.filter(a => a.type === 'WARNING').length,
      info: alerts.filter(a => a.type === 'INFO').length
    };

    doc.text(`• Critical: ${alertCounts.critical} | Warning: ${alertCounts.warning} | Info: ${alertCounts.info}`, margin + 5, yPosition);
    yPosition += 10;

    // Alert details table
    doc.autoTable({
      startY: yPosition,
      head: [['Type', 'Title', 'Action Required', 'Timeline']],
      body: alerts.map(alert => [
        alert.type,
        alert.title,
        alert.action.substring(0, 50) + (alert.action.length > 50 ? '...' : ''),
        alert.timeline
      ]),
      theme: 'striped',
      headStyles: { fillColor: [34, 139, 34] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 80 },
        3: { cellWidth: 30 }
      }
    });
  } else {
    doc.text('✅ No active alerts - All systems normal', margin, yPosition);
  }

  // ============================================
  // SECTION 6: APPENDIX
  // ============================================
  doc.addPage();
  yPosition = margin;
  
  addSectionHeader(doc, 'APPENDIX: SYSTEM METADATA', yPosition);
  yPosition += 10;

  doc.autoTable({
    startY: yPosition,
    head: [['Parameter', 'Value']],
    body: [
      ['Report Generated', reportDate],
      ['Session ID', sessionId || 'N/A'],
      ['Detection Engine', 'YOLOv8 (Edge AI)'],
      ['Cloud Platform', 'Firebase Realtime Database'],
      ['Frontend Framework', 'React + Leaflet'],
      ['Total Detections Processed', detections.length],
      ['Analysis Duration', calculateSessionDuration(detections)],
      ['System Status', 'Operational ✓']
    ],
    theme: 'plain',
    headStyles: { fillColor: [34, 139, 34] },
    margin: { left: margin, right: margin }
  });

  // ============================================
  // FOOTER ON ALL PAGES
  // ============================================
  addFooters(doc);

  // ============================================
  // SAVE PDF
  // ============================================
  const filename = `mission_report_${sessionId || 'session'}_${Date.now()}.pdf`;
  doc.save(filename);
  
  console.log(`✅ Report generated: ${filename}`);
  return filename;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function addSectionHeader(doc, title, yPosition) {
  doc.setFillColor(34, 139, 34);
  doc.rect(15, yPosition - 5, doc.internal.pageSize.getWidth() - 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 17, yPosition);
  doc.setTextColor(0, 0, 0);
}

function addKeyMetricsBox(doc, economicImpact, yPosition, margin, pageWidth) {
  const boxHeight = 35;
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, boxHeight);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  yPosition += 7;
  
  const col1 = margin + 5;
  const col2 = margin + (pageWidth - 2 * margin) / 2;
  
  doc.text('💰 Net Profit:', col1, yPosition);
  doc.text(formatCurrency(economicImpact.roi.perApplication.netProfit), col1 + 30, yPosition);
  
  doc.text('📈 ROI:', col2, yPosition);
  doc.text(`${economicImpact.roi.perApplication.roiMultiplier.toFixed(1)}×`, col2 + 15, yPosition);
  
  yPosition += 7;
  doc.text('💧 Chemical Saved:', col1, yPosition);
  doc.text(formatPercentage(economicImpact.interventionCosts.savings.chemicalSavingsPercentage), col1 + 35, yPosition);
  
  doc.text('⚠️ Infection:', col2, yPosition);
  doc.text(formatPercentage(economicImpact.areas.infectionPercentage), col2 + 25, yPosition);
  
  yPosition += 7;
  doc.text('🎯 Recommendation:', col1, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('Apply precision treatment immediately', col1 + 40, yPosition);
  
  return yPosition + 15;
}

function generateExecutiveSummary(detections, gridStats, economicImpact, alerts) {
  const criticalAlerts = alerts?.filter(a => a.type === 'CRITICAL').length || 0;
  
  if (!economicImpact || !economicImpact.hasInfection) {
    return {
      text: `Field analysis complete with ${detections.length} detection events processed. No disease or stress conditions detected. The field appears healthy and no immediate intervention is required. Continue routine monitoring for early detection of potential issues.`
    };
  }
  
  const infection = economicImpact.areas.infectionPercentage.toFixed(1);
  const roi = economicImpact.roi.perApplication.roiMultiplier.toFixed(1);
  const savings = formatCurrency(economicImpact.roi.perApplication.netProfit);
  
  return {
    text: `Field analysis detected crop stress affecting ${infection}% of the surveyed area (${economicImpact.areas.infectedCells} zones). Without intervention, estimated yield loss could reach ${formatCurrency(economicImpact.financialData.financialLossUntreated)}. Precision treatment is recommended with an expected ROI of ${roi}× and net savings of ${savings} per application. ${criticalAlerts > 0 ? `${criticalAlerts} critical alert(s) require immediate attention.` : 'No critical alerts at this time.'} Chemical usage can be reduced by ${formatPercentage(economicImpact.interventionCosts.savings.chemicalSavingsPercentage)}, providing both economic and environmental benefits.`
  };
}

function calculateDetectionStats(detections) {
  const classMap = new Map();
  
  detections.forEach(d => {
    const className = d.class || 'Unknown';
    if (!classMap.has(className)) {
      classMap.set(className, {
        class: className,
        count: 0,
        totalConfidence: 0,
        firstSeen: d.timestamp,
        lastSeen: d.timestamp
      });
    }
    
    const stat = classMap.get(className);
    stat.count++;
    stat.totalConfidence += d.confidence || 0;
    stat.lastSeen = d.timestamp;
  });
  
  return Array.from(classMap.values()).map(stat => ({
    ...stat,
    avgConfidence: stat.totalConfidence / stat.count
  }));
}

function calculateSessionDuration(detections) {
  if (detections.length === 0) return 'N/A';
  
  const timestamps = detections.map(d => new Date(d.timestamp).getTime());
  const duration = Math.max(...timestamps) - Math.min(...timestamps);
  
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function addFooters(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by Precision Agriculture Analytics System`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
}
