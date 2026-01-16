/**
 * AlertsDecisionPanel Component
 * Real-time intelligent alerts and decision recommendations
 * Part 11: Added callback to export alerts for report generation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { extractSignals, evaluateAlerts, resolveConflicts, alertDebouncer } from '../utils/alertRuleEngine';
import { getSensorData } from '../utils/sensorSimulator';
import { performFusion } from '../utils/fusionEngine';
import './AlertsDecisionPanel.css';

export default function AlertsDecisionPanel({ 
  detections, 
  gridStats, 
  economicImpact,
  onAlertsUpdate  // ✅ Part 11: NEW PROP - Callback for alerts export
}) {
  const [alerts, setAlerts] = useState([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());
  const [scheduledActions, setScheduledActions] = useState(new Map());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate fusion results from detections
  const fusionResults = useMemo(() => {
    if (!detections || detections.length === 0) return [];
    
    const sensorData = getSensorData();
    return detections.slice(0, 10).map(detection => 
      performFusion(detection, sensorData)
    );
  }, [detections]);

  // Evaluate alerts whenever data changes
  useEffect(() => {
    if (!gridStats) return;

    const sensorData = getSensorData();
    
    // Extract signals from all data sources
    const signals = extractSignals(
      detections,
      gridStats,
      economicImpact,
      fusionResults,
      sensorData
    );

    // Evaluate rules
    let newAlerts = evaluateAlerts(signals);

    // Resolve conflicts
    newAlerts = resolveConflicts(newAlerts);

    // Apply debouncing
    newAlerts = newAlerts.filter(alert => alertDebouncer.shouldShowAlert(alert));

    setAlerts(newAlerts);
  }, [detections, gridStats, economicImpact, fusionResults]);

  // ✅ Part 11: NEW - Send alerts to Dashboard when they update
  useEffect(() => {
    if (alerts.length > 0 && onAlertsUpdate) {
      console.log('🚨 Sending alerts to Dashboard');
      onAlertsUpdate(alerts);
    }
  }, [alerts, onAlertsUpdate]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Trigger re-evaluation by updating a timestamp
      setAlerts(prev => [...prev]);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle alert acknowledgment
  const handleAcknowledge = (alertId) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    
    // Update alert object
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : alert
    ));
  };

  // Handle action scheduling
  const handleScheduleAction = (alertId, scheduledTime) => {
    setScheduledActions(prev => new Map(prev).set(alertId, scheduledTime));
    
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, actionScheduled: true, scheduledFor: scheduledTime }
        : alert
    ));
  };

  // Get alert counts by type
  const alertCounts = useMemo(() => {
    return {
      critical: alerts.filter(a => a.type === 'CRITICAL').length,
      warning: alerts.filter(a => a.type === 'WARNING').length,
      info: alerts.filter(a => a.type === 'INFO').length,
      total: alerts.length
    };
  }, [alerts]);

  // Render empty state
  if (!gridStats || !detections || detections.length === 0) {
    return (
      <div className="alerts-decision-panel">
        <div className="panel-header">
          <h3>🚨 Intelligent Alerts & Decisions</h3>
          <span className="auto-refresh-indicator">
            {autoRefresh ? '🔄 Live' : '⏸️ Paused'}
          </span>
        </div>
        <div className="empty-state">
          <p>⏳ Waiting for field analysis...</p>
          <p className="hint">Alerts will appear when conditions require attention</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-decision-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-title">
          <h3>🚨 Intelligent Alerts & Decisions</h3>
          <span className="alert-summary">
            {alertCounts.critical > 0 && (
              <span className="count-badge critical">{alertCounts.critical} Critical</span>
            )}
            {alertCounts.warning > 0 && (
              <span className="count-badge warning">{alertCounts.warning} Warning</span>
            )}
            {alertCounts.info > 0 && (
              <span className="count-badge info">{alertCounts.info} Info</span>
            )}
          </span>
        </div>
        <button 
          className={`auto-refresh-toggle ${autoRefresh ? 'active' : ''}`}
          onClick={() => setAutoRefresh(!autoRefresh)}
          title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
        >
          {autoRefresh ? '🔄 Live' : '⏸️ Paused'}
        </button>
      </div>

      {/* Alert List */}
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <div className="success-icon">✅</div>
            <h4>All Systems Normal</h4>
            <p>No critical or warning conditions detected</p>
          </div>
        ) : (
          alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              acknowledged={acknowledgedAlerts.has(alert.id)}
              scheduled={scheduledActions.has(alert.id)}
              onAcknowledge={handleAcknowledge}
              onSchedule={handleScheduleAction}
            />
          ))
        )}
      </div>

      {/* Legend */}
      {alerts.length > 0 && (
        <div className="alerts-legend">
          <div className="legend-item">
            <span className="legend-dot critical"></span>
            <span>Critical: Act within 0-24 hours</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot warning"></span>
            <span>Warning: Prepare action within 24-48 hours</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot info"></span>
            <span>Info: Monitor or preventive action</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Alert Card Component
 */
function AlertCard({ alert, acknowledged, scheduled, onAcknowledge, onSchedule }) {
  const [showDetails, setShowDetails] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const typeClass = alert.type.toLowerCase();

  return (
    <div className={`alert-card ${typeClass} ${acknowledged ? 'acknowledged' : ''}`}>
      {/* Alert Header */}
      <div className="alert-header">
        <div className="alert-icon">{alert.icon}</div>
        <div className="alert-title-section">
          <h4 className="alert-title">{alert.title}</h4>
          <div className="alert-meta">
            <span className={`alert-type-badge ${typeClass}`}>
              {alert.type}
            </span>
            <span className="alert-timeline">⏱️ {alert.timeline}</span>
            <span className="alert-priority">Priority: {alert.priority}</span>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      <div className="alert-message">
        {alert.message}
      </div>

      {/* Recommended Action */}
      <div className="alert-action-box">
        <strong>📋 Recommended Action:</strong>
        <p>{alert.action}</p>
      </div>

      {/* Metadata (if available) */}
      {(alert.metadata.estimatedLoss || alert.metadata.preventMistake || 
        alert.metadata.savingsPotential || alert.metadata.benefit) && (
        <div className="alert-metadata">
          {alert.metadata.estimatedLoss && (
            <div className="metadata-item loss">
              <span className="metadata-label">💸 Est. Loss if ignored:</span>
              <span className="metadata-value">₹{(alert.metadata.estimatedLoss / 1000).toFixed(0)}k</span>
            </div>
          )}
          {alert.metadata.preventMistake && (
            <div className="metadata-item benefit">
              <span className="metadata-label">✨ Value:</span>
              <span className="metadata-value">{alert.metadata.preventMistake}</span>
            </div>
          )}
          {alert.metadata.savingsPotential && (
            <div className="metadata-item savings">
              <span className="metadata-label">💰 Savings:</span>
              <span className="metadata-value">{alert.metadata.savingsPotential}</span>
            </div>
          )}
          {alert.metadata.benefit && (
            <div className="metadata-item benefit">
              <span className="metadata-label">🎯 Benefit:</span>
              <span className="metadata-value">{alert.metadata.benefit}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="alert-actions">
        {!acknowledged && (
          <button
            className="alert-button acknowledge"
            onClick={() => onAcknowledge(alert.id)}
          >
            ✓ Acknowledge
          </button>
        )}
        
        {acknowledged && !scheduled && alert.type !== 'INFO' && (
          <div className="schedule-action">
            <input
              type="datetime-local"
              className="schedule-input"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <button
              className="alert-button schedule"
              onClick={() => {
                if (scheduleTime) {
                  onSchedule(alert.id, scheduleTime);
                }
              }}
              disabled={!scheduleTime}
            >
              📅 Schedule Action
            </button>
          </div>
        )}

        {scheduled && (
          <div className="scheduled-indicator">
            ✅ Action scheduled for {new Date(alert.scheduledFor).toLocaleString()}
          </div>
        )}

        <button
          className="alert-button details"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▲ Hide Details' : '▼ Show Details'}
        </button>
      </div>

      {/* Detailed Context (collapsible) */}
      {showDetails && (
        <div className="alert-details">
          <h5>📊 System Context</h5>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Infection:</span>
              <span className="detail-value">{alert.signals.infectionPercentage.toFixed(1)}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ROI:</span>
              <span className="detail-value">{alert.signals.roiRatio.toFixed(1)}×</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Soil Moisture:</span>
              <span className="detail-value">{alert.signals.soilMoisture.toFixed(0)}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Temperature:</span>
              <span className="detail-value">{alert.signals.soilTemperature.toFixed(1)}°C</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Humidity:</span>
              <span className="detail-value">{alert.signals.airHumidity.toFixed(0)}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Diagnosis:</span>
              <span className="detail-value">{alert.signals.fusionDiagnosis}</span>
            </div>
          </div>
          <div className="alert-timestamp">
            Alert generated: {new Date(alert.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
