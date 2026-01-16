/**
 * Report Template
 * Multi-page report layout with all sections
 * Renders both on-screen and in PDF
 */

import React from 'react';
import './MissionReportTemplate.css';

const MissionReportTemplate = ({ data, forPDF = false }) => {
  if (!data) {
    return <div>No data available for report</div>;
  }

  const {
    missionMetadata,
    missionDuration,
    detections,
    environmental,
    spray,
    economic,
    alerts,
    detailsTable
  } = data;

  // Formatting utilities
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const hasDetections = detections.total > 0;
  const reportStatus = hasDetections ? 'ACTION REQUIRED' : 'HEALTHY';
  const reportStatusIcon = hasDetections ? '⚠️' : '✅';

  const generateReportId = () => {
    const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
    const fieldNum = missionMetadata?.fieldId?.replace(/\D/g, '') || '001';
    return `RPT-${fieldNum}-${timestamp}`;
  };

  return (
    <div className={`mission-report-template ${forPDF ? 'pdf-mode' : 'preview-mode'}`}>
      
      {/* ========== PAGE 1: EXECUTIVE SUMMARY ========== */}
      <div className="report-page page-1">
        
        {/* Header */}
        <header className="report-header">
          <div className="header-branding">
            <h1 className="report-title">🌾 PRECISION AGRICULTURE</h1>
            <h2 className="report-subtitle">Mission Analysis Report</h2>
          </div>
          
          <div className="header-metadata">
            <div className="metadata-row">
              <span className="label">Report ID:</span>
              <span className="value">{generateReportId()}</span>
            </div>
            <div className="metadata-row">
              <span className="label">Generated:</span>
              <span className="value">{formatDate(new Date().toISOString())}</span>
            </div>
            <div className="metadata-row">
              <span className="label">System:</span>
              <span className="value">VoteAble AI v1.0</span>
            </div>
          </div>
        </header>

        {/* Mission Overview Card */}
        <section className="section overview-card">
          <div className="card-grid">
            <div className="info-item">
              <strong>Field ID</strong>
              <p>{missionMetadata?.fieldId || 'N/A'}</p>
            </div>
            <div className="info-item">
              <strong>Field Name</strong>
              <p>{missionMetadata?.fieldName || 'N/A'}</p>
            </div>
            <div className="info-item">
              <strong>Mission Date</strong>
              <p>{formatDate(missionMetadata?.missionStart)}</p>
            </div>
            <div className="info-item">
              <strong>Duration</strong>
              <p>{missionDuration} min</p>
            </div>
            <div className="info-item">
              <strong>Operator</strong>
              <p>{missionMetadata?.operatorName || 'N/A'}</p>
            </div>
            <div className="info-item">
              <strong>Drone</strong>
              <p>{missionMetadata?.droneId || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="section executive-summary">
          <h3 className="section-title">📋 Executive Summary</h3>
          
          {!hasDetections ? (
            /* Healthy Field Summary */
            <div className="summary-box summary-healthy">
              <div className="status-badge status-healthy">
                <span className="icon">✅</span>
                <span className="text">FIELD STATUS: HEALTHY</span>
              </div>
              <p className="summary-text">
                No crop stress or disease detected during this mission. Field conditions are optimal.
              </p>
              <div className="action-box action-continue">
                <strong>Recommended Action:</strong>
                <p>Continue current management practices. Schedule routine monitoring in 7-10 days.</p>
              </div>
            </div>
          ) : (
            /* Issue Detected Summary */
            <div className="summary-box summary-alert">
              <div className="status-badge status-alert">
                <span className="icon">⚠️</span>
                <span className="text">FIELD STATUS: ACTION REQUIRED</span>
              </div>

              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-box">
                  <div className="metric-value">{detections.total}</div>
                  <div className="metric-label">Detections</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value">{detections.affectedPercentage}%</div>
                  <div className="metric-label">Affected Area</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value">{detections.averageConfidence}%</div>
                  <div className="metric-label">Avg. Confidence</div>
                </div>
                <div className="metric-box highlight">
                  <div className="metric-value roi">{economic.roi}%</div>
                  <div className="metric-label">Expected ROI</div>
                </div>
              </div>

              {/* Primary Issue */}
              <div className="primary-diagnosis">
                <strong>Primary Issue:</strong>
                <p className="diagnosis-text">{detections.topDiagnosis}</p>
              </div>

              {/* Action Box */}
              <div className="action-box action-urgent">
                <strong>Recommended Action:</strong>
                <p>
                  {spray.recommendation?.action || 
                   'Review detailed findings below for specific treatment plan.'}
                </p>
              </div>

              {/* Economic Highlight */}
              <div className="economic-highlight">
                <strong>Economic Impact:</strong>
                <p>
                  Implement recommended treatment to save{' '}
                  <span className="highlight-value">
                    {formatCurrency(economic.expectedSavings)}
                  </span>
                  {' '}({economic.roi}% ROI)
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ========== PAGE 2: DETAILED ANALYSIS ========== */}
      <div className="report-page page-2">
        
        {/* Environmental Context */}
        <section className="section">
          <h3 className="section-title">🌡️ Environmental Context</h3>
          <div className="env-grid">
            <div className="env-item">
              <strong>Air Temperature</strong>
              <p className="env-value">{environmental.temperature}°C</p>
            </div>
            <div className="env-item">
              <strong>Humidity</strong>
              <p className="env-value">{environmental.humidity}%</p>
            </div>
            <div className="env-item">
              <strong>Soil Moisture</strong>
              <p className="env-value">{environmental.soilMoisture}%</p>
            </div>
            <div className="env-item">
              <strong>Soil Temp.</strong>
              <p className="env-value">{environmental.soilTemperature}°C</p>
            </div>
            <div className="env-item">
              <strong>Soil pH</strong>
              <p className="env-value">{environmental.ph}</p>
            </div>
            <div className="env-item">
              <strong>Recorded At</strong>
              <p className="env-value small">{formatDate(environmental.timestamp)}</p>
            </div>
          </div>
          <p className="section-note">
            These environmental factors significantly influence crop stress and disease risk.
          </p>
        </section>

        {/* Detection Summary */}
        <section className="section">
          <h3 className="section-title">🔍 Detection Summary</h3>
          
          {!hasDetections ? (
            <p className="center-text">✅ No issues detected. Field in excellent condition.</p>
          ) : (
            <>
              {/* Severity Breakdown */}
              <div className="severity-grid">
                <div className={`severity-item critical ${detections.severityBreakdown.critical > 0 ? 'active' : ''}`}>
                  <div className="severity-count">{detections.severityBreakdown.critical}</div>
                  <div className="severity-label">Critical</div>
                </div>
                <div className={`severity-item high ${detections.severityBreakdown.high > 0 ? 'active' : ''}`}>
                  <div className="severity-count">{detections.severityBreakdown.high}</div>
                  <div className="severity-label">High</div>
                </div>
                <div className={`severity-item medium ${detections.severityBreakdown.medium > 0 ? 'active' : ''}`}>
                  <div className="severity-count">{detections.severityBreakdown.medium}</div>
                  <div className="severity-label">Medium</div>
                </div>
                <div className={`severity-item low ${detections.severityBreakdown.low > 0 ? 'active' : ''}`}>
                  <div className="severity-count">{detections.severityBreakdown.low}</div>
                  <div className="severity-label">Low</div>
                </div>
              </div>

              {/* Diagnosis Breakdown */}
              <div className="diagnosis-breakdown">
                <strong>Diagnosis Distribution:</strong>
                <div className="diagnosis-list">
                  {Object.entries(detections.diagnosisCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([diagnosis, count]) => (
                      <div key={diagnosis} className="diagnosis-item">
                        <span className="diagnosis-name">{diagnosis}</span>
                        <span className="diagnosis-count">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="detection-stats">
                <div className="stat">
                  <strong>Total Detections:</strong> {detections.total}
                </div>
                <div className="stat">
                  <strong>Affected Area:</strong> {detections.affected} ha ({detections.affectedPercentage}%)
                </div>
                <div className="stat">
                  <strong>Average Confidence:</strong> {detections.averageConfidence}%
                </div>
              </div>
            </>
          )}
        </section>

        {/* Precision Spray Plan */}
        {hasDetections && spray.recommendation && (
          <section className="section">
            <h3 className="section-title">🎯 Precision Spray Plan</h3>
            <div className="spray-details-grid">
              <div className="spray-detail">
                <strong>Recommended Chemical</strong>
                <p>{spray.recommendation.chemical || 'TBD'}</p>
              </div>
              <div className="spray-detail">
                <strong>Coverage Area</strong>
                <p>{spray.coverageArea} hectares</p>
              </div>
              <div className="spray-detail">
                <strong>Application Volume</strong>
                <p>{spray.recommendation.volume || 'TBD'} liters</p>
              </div>
              <div className="spray-detail">
                <strong>Dosage Rate</strong>
                <p>{spray.recommendation.dosage || 'TBD'}</p>
              </div>
              <div className="spray-detail">
                <strong>Efficiency</strong>
                <p>{spray.recommendation.efficiency || 'Optimized'}</p>
              </div>
              <div className="spray-detail">
                <strong>Est. Time</strong>
                <p>{spray.estimatedTime}</p>
              </div>
            </div>
            <div className="spray-action">
              <strong>Application Instructions:</strong>
              <p>{spray.recommendation.action}</p>
            </div>
          </section>
        )}
      </div>

      {/* ========== PAGE 3: ECONOMIC & ALERTS ========== */}
      <div className="report-page page-3">
        
        {/* Economic Analysis */}
        <section className="section">
          <h3 className="section-title">💰 Economic Analysis</h3>
          <div className="economic-breakdown">
            <div className="econ-item">
              <strong>Crop Loss (Untreated)</strong>
              <p className="econ-value loss">
                {formatCurrency(economic.cropLossUntreated)}
              </p>
            </div>
            <div className="econ-item">
              <strong>Treatment Cost</strong>
              <p className="econ-value cost">
                {formatCurrency(economic.treatmentCost)}
              </p>
            </div>
            <div className="econ-item highlight">
              <strong>Expected Savings</strong>
              <p className="econ-value savings">
                {formatCurrency(economic.expectedSavings)}
              </p>
            </div>
            <div className="econ-item highlight">
              <strong>Return on Investment</strong>
              <p className="econ-value roi">
                {economic.roi}%
              </p>
            </div>
          </div>
          <p className="section-note">
            ROI calculation assumes successful treatment implementation and proper monitoring.
          </p>
        </section>

        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <section className="section">
            <h3 className="section-title">🚨 Critical Alerts & Actions</h3>
            <div className="alerts-container">
              {alerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={alert.id || idx}
                  className={`alert-card alert-${alert.severity || 'medium'}`}
                >
                  <div className="alert-header">
                    <span className="alert-title">{alert.title || `Alert ${idx + 1}`}</span>
                    <span className={`severity-badge severity-${alert.severity || 'medium'}`}>
                      {alert.severity?.toUpperCase()}
                    </span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  {alert.recommendation && (
                    <p className="alert-action">
                      <strong>Action:</strong> {alert.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Follow-Up Recommendations */}
        <section className="section">
          <h3 className="section-title">📅 Follow-Up Recommendations</h3>
          <div className="followup-timeline">
            <div className="timeline-item immediate">
              <strong>🔴 Immediate (Next 24 Hours)</strong>
              <p>Review spray recommendations. Procure materials if necessary.</p>
            </div>
            <div className="timeline-item shortterm">
              <strong>🟠 Short-term (1-3 Days)</strong>
              <p>Execute precision spray plan. Monitor weather for optimal conditions.</p>
            </div>
            <div className="timeline-item mediumterm">
              <strong>🟡 Medium-term (1-2 Weeks)</strong>
              <p>Re-assess field with follow-up drone mission. Verify treatment effectiveness.</p>
            </div>
            <div className="timeline-item longterm">
              <strong>🟢 Long-term (Monthly)</strong>
              <p>Schedule regular monitoring flights. Track field health trends.</p>
            </div>
          </div>
        </section>
      </div>

      {/* ========== PAGE 4: DETAILS & FOOTER ========== */}
      <div className="report-page page-4">
        
        {/* Detection Details Table */}
        {detailsTable.length > 0 && (
          <section className="section">
            <h3 className="section-title">📊 Detection Details</h3>
            <p className="section-note">
              Showing {Math.min(detailsTable.length, 50)} of {detailsTable.length} detections
            </p>
            <table className="details-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Diagnosis</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Vision</th>
                </tr>
              </thead>
              <tbody>
                {detailsTable.map((row) => (
                  <tr key={row.index}>
                    <td className="center">{row.index}</td>
                    <td>{row.diagnosis}</td>
                    <td>
                      <span className={`badge severity-${row.severity?.toLowerCase()}`}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="center">{row.confidence}%</td>
                    <td className="center">{row.visionConfidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Assumptions & Limitations */}
        <section className="section assumptions">
          <h3 className="section-title">⚖️ Assumptions & Limitations</h3>
          <ul className="assumptions-list">
            <li>Report represents field state at mission timestamp: {formatDate(missionMetadata?.missionStart)}</li>
            <li>Environmental data sourced from drone sensors at {formatDate(environmental.timestamp)}</li>
            <li>Economic projections assume treatment successful and field properly monitored</li>
            <li>Confidence scores based on multimodal fusion of vision + sensor data</li>
            <li>Geographic coordinates accurate to ±{missionMetadata?.resolutionMm || 2.74}mm ground resolution</li>
            <li>Field conditions may change between report generation and treatment application</li>
            <li>Report should be verified by qualified agronomist before critical decisions</li>
          </ul>
        </section>

        {/* Footer */}
        <footer className="report-footer">
          <div className="footer-content">
            <p>
              <strong>Report ID:</strong> {generateReportId()} <strong>|</strong>{' '}
              <strong>Generated:</strong> {formatDate(new Date().toISOString())}
            </p>
            <p>
              <strong>System:</strong> VoteAble Precision Agriculture AI v1.0 <strong>|</strong>{' '}
              <strong>Data Source:</strong> Firebase Realtime Database + Edge AI Vision
            </p>
            <div className="disclaimer">
              <p className="disclaimer-text">
                <strong>Disclaimer:</strong> This report is generated by AI systems and should be
                verified by qualified agronomists before critical decisions. Environmental conditions
                and crop varieties may affect treatment effectiveness and recommendations. The system
                provider assumes no liability for agricultural outcomes.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MissionReportTemplate;
