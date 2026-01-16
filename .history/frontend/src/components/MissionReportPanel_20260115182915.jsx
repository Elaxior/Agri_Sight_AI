/**
 * PART 11: Mission Report Generator
 * 
 * Converts dashboard state to downloadable PDF report.
 * Supports all edge cases: no detections, partial data, large datasets.
 * 
 * Usage:
 * <MissionReportPanel
 *   dashboardData={{
 *     missionMetadata,
 *     detections,
 *     sensorData,
 *     sprayRecommendation,
 *     economicData,
 *     fusionResults,
 *     alerts,
 *     mapState
 *   }}
 *   onReportGenerated={handleSuccess}
 * />
 */

import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { aggregateReportData } from '../utils/reportDataAggregator';
import { PDF_CONFIG } from '../config/pdfConfig';
import MissionReportTemplate from './MissionReportTemplate';
import './MissionReportPanel.css';

export const MissionReportPanel = ({
  missionMetadata,
  detections,
  sensorData,
  sprayRecommendation,
  economicData,
  fusionResults,
  alerts,
  mapState,
  onReportGenerated
}) => {
  const reportRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * STEP 1: Prepare report data from dashboard state
   */
  const prepareReportData = () => {
    try {
      const reportData = aggregateReportData({
        missionMetadata,
        detections,
        sensorData,
        sprayRecommendation,
        economicData,
        fusionResults,
        alerts,
        mapState
      });
      return reportData;
    } catch (err) {
      console.error('Data preparation error:', err);
      throw new Error('Failed to prepare report data: ' + err.message);
    }
  };

  /**
   * STEP 2: Generate and download PDF
   */
  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Prepare data
      const reportData = prepareReportData();

      // 2. Get HTML element
      const element = reportRef.current;
      if (!element) {
        throw new Error('Report container not found in DOM');
      }

      // 3. Generate filename
      const date = new Date().toISOString().split('T')[0];
      const fieldId = missionMetadata?.fieldId || 'Unknown';
      const filename = `Mission-Report-${fieldId}-${date}.pdf`;

      // 4. PDF options
      const opt = {
        margin: PDF_CONFIG.margin,
        filename: filename,
        image: { 
          type: PDF_CONFIG.imageType, 
          quality: PDF_CONFIG.imageQuality 
        },
        html2canvas: { 
          scale: PDF_CONFIG.scale,
          useCORS: PDF_CONFIG.useCORS,
          allowTaint: PDF_CONFIG.allowTaint,
          backgroundColor: PDF_CONFIG.backgroundColor
        },
        jsPDF: { 
          orientation: PDF_CONFIG.pageOrientation, 
          unit: 'mm', 
          format: PDF_CONFIG.pageFormat 
        }
      };

      // 5. Generate PDF (returns promise)
      await html2pdf().set(opt).from(element).save();

      // 6. Success feedback
      setSuccess(true);
      setSuccessMessage(
        `Report "${filename}" generated and downloaded successfully!`
      );

      // 7. Callback for parent component
      if (onReportGenerated) {
        onReportGenerated({
          filename,
          timestamp: new Date().toISOString(),
          data: reportData
        });
      }

      // 8. Auto-dismiss success after 4 seconds
      setTimeout(() => setSuccess(false), 4000);

    } catch (err) {
      console.error('PDF Generation Error:', err);
      
      // User-friendly error message
      let userMessage = 'Failed to generate PDF';
      if (err.message.includes('timeout')) {
        userMessage = 'Report generation timed out. Try closing other applications.';
      } else if (err.message.includes('memory')) {
        userMessage = 'Out of memory. Close other applications and try again.';
      } else if (err.message.includes('not found')) {
        userMessage = 'Report container error. Try refreshing the page.';
      } else {
        userMessage = err.message || userMessage;
      }
      
      setError(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * STEP 3: Prepare data for rendering
   */
  let reportData = null;
  try {
    reportData = prepareReportData();
  } catch (err) {
    console.warn('Error preparing report data:', err);
  }

  return (
    <div className="mission-report-panel">
      {/* ========== CONTROLS ========== */}
      <div className="report-controls">
        <button
          className="btn btn-primary btn-generate"
          onClick={generatePDF}
          disabled={isGenerating || !reportData}
          title={!reportData ? 'Waiting for mission data...' : 'Generate and download PDF report'}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span>
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <span className="icon">📄</span>
              <span>Generate Mission Report</span>
            </>
          )}
        </button>

        {success && (
          <div className="alert alert-success">
            <span className="icon">✅</span>
            <span>{successMessage}</span>
            <button
              className="close-btn"
              onClick={() => setSuccess(false)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span className="icon">❌</span>
            <span>{error}</span>
            <button
              className="close-btn"
              onClick={() => setError(null)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ========== HIDDEN REPORT (for PDF generation) ========== */}
      <div ref={reportRef} className="report-container-pdf">
        {reportData && <MissionReportTemplate data={reportData} forPDF={true} />}
      </div>

      {/* ========== VISIBLE PREVIEW ========== */}
      <div className="report-preview-container">
        {reportData ? (
          <MissionReportTemplate data={reportData} forPDF={false} />
        ) : (
          <div className="loading-placeholder">
            <p>📊 Report will appear here once mission data is available...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionReportPanel;
