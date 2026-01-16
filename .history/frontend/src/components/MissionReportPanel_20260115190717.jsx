/**
 * Mission Report Panel (Part 11)
 * Generates and downloads mission reports as PDF
 * 
 * Clean UI with only a button - report content goes directly to PDF
 */

import React, { useState } from 'react';
import { generateMissionReport } from '../utils/reportGenerator';
import './MissionReportPanel.css';

const MissionReportPanel = ({
  missionMetadata,
  detections,
  sprayRecommendation,
  economicData,
  mapState,
  onReportGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare report data
      const reportData = {
        missionMetadata,
        detections: detections || [],
        sprayRecommendation: sprayRecommendation || {},
        economicData: economicData || {},
        mapState: mapState || {}
      };

      // Generate PDF document
      const doc = generateMissionReport(reportData);

      // Create filename
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const fieldId = missionMetadata?.fieldId || 'Unknown';
      const filename = `Mission-Report-${fieldId}-${date}-${time}.pdf`;

      // Download PDF
      doc.save(filename);

      // Success feedback
      setSuccess(true);
      setSuccessMessage(`✓ Report "${filename}" downloaded successfully!`);

      // Callback
      if (onReportGenerated) {
        onReportGenerated({
          filename,
          timestamp: new Date().toISOString(),
          missionId: fieldId
        });
      }

      // Clear success message after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Report Generation Error:', err);
      setError(`Failed to generate report: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mission-report-panel">
      <div className="report-panel-header">
        <h3>📄 Mission Report</h3>
        <p className="report-panel-subtitle">Generate PDF for download</p>
      </div>

      <div className="report-panel-content">
        <button
          className="generate-report-btn"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner-small"></span>
              Generating...
            </>
          ) : (
            <>
              📥 Generate & Download Report
            </>
          )}
        </button>

        {success && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <div className="report-info">
          <p>
            <strong>Includes:</strong> Mission metadata, detection summary, spray recommendations, economic analysis, and field recommendations
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionReportPanel;
