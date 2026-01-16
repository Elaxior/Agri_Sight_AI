/**
 * MissionReportButton Component
 * Triggers PDF report generation
 */

import React, { useState } from 'react';
import { generateMissionReport } from '../utils/reportGenerator';
import './MissionReportButton.css';

export default function MissionReportButton({
  detections,
  gridStats,
  economicImpact,
  alerts,
  sessionId
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const filename = await generateMissionReport({
        detections,
        gridStats,
        economicImpact,
        alerts,
        sessionId
      });

      console.log(`✅ Report downloaded: ${filename}`);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setGenerating(false);
      }, 3000);
    } catch (err) {
      console.error('Report generation failed:', err);
      setError(err.message);
      setGenerating(false);
    }
  };

  const isDisabled = !detections || detections.length === 0 || generating;

  return (
    <div className="mission-report-button-container">
      <button
        className={`mission-report-button ${generating ? 'generating' : ''} ${success ? 'success' : ''}`}
        onClick={handleGenerateReport}
        disabled={isDisabled}
        title={isDisabled ? 'Waiting for detection data...' : 'Generate comprehensive PDF report'}
      >
        {generating ? (
          <>
            <span className="spinner-small"></span>
            Generating Report...
          </>
        ) : success ? (
          <>
            <span className="button-icon">✅</span>
            Report Downloaded!
          </>
        ) : (
          <>
            <span className="button-icon">📥</span>
            Generate Mission Report
          </>
        )}
      </button>

      {error && (
        <div className="report-error">
          ❌ {error}
        </div>
      )}

      {detections && detections.length > 0 && !generating && !error && !success && (
        <div className="report-hint">
          Ready to export {detections.length} detections with full analytics
        </div>
      )}
    </div>
  );
}
