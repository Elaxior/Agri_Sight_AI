/**
 * FusionInsightPanel Component
 * Displays multimodal fusion results combining vision + sensor data
 * Part 11: Added callbacks to export sensor data and fusion results
 */

import React, { useState, useEffect, useMemo } from 'react';
import { generateSensorSnapshot, startSensorStream, categorizeSensorData } from '../utils/sensorSimulator';
import { performBatchFusion, getFusionStats } from '../utils/fusionEngine';
import './FusionInsightPanel.css';

export default function FusionInsightPanel({ 
  detections,
  onSensorDataUpdate,  // ✅ Part 11: NEW PROP - Callback for sensor data
  onFusionResults      // ✅ Part 11: NEW PROP - Callback for fusion results
}) {
  const [sensorData, setSensorData] = useState(null);
  const [sensorEnabled, setSensorEnabled] = useState(true);

  // Start sensor stream on mount
  useEffect(() => {
    if (!sensorEnabled) return;
    
    console.log('🌐 Starting sensor stream...');
    const cleanup = startSensorStream((data) => {
      console.log('📡 Sensor update:', data);
      setSensorData(data);
    }, 30000); // Update every 30 seconds
    
    return cleanup;
  }, [sensorEnabled]);

  // ✅ Part 11: NEW - Send sensor data to Dashboard when it updates
  useEffect(() => {
    if (sensorData && onSensorDataUpdate) {
      console.log('📡 Sending sensor data to Dashboard');
      onSensorDataUpdate(sensorData);
    }
  }, [sensorData, onSensorDataUpdate]);

  // Perform fusion when detections or sensor data changes
  const fusionResults = useMemo(() => {
    if (!detections || detections.length === 0) return [];
    if (!sensorData) return [];
    
    console.log('🔄 Performing multimodal fusion...');
    const results = performBatchFusion(detections, sensorData);
    console.log('✅ Fusion results:', results);
    
    return results;
  }, [detections, sensorData]);

  // ✅ Part 11: NEW - Send fusion results to Dashboard when they update
  useEffect(() => {
    if (fusionResults.length > 0 && onFusionResults) {
      console.log('🔄 Sending fusion results to Dashboard');
      onFusionResults(fusionResults);
    }
  }, [fusionResults, onFusionResults]);

  // Calculate statistics
  const fusionStats = useMemo(() => {
    if (fusionResults.length === 0) return null;
    return getFusionStats(fusionResults);
  }, [fusionResults]);

  // Get latest diagnosis
  const latestDiagnosis = fusionResults.length > 0 
    ? fusionResults[0].diagnosis 
    : null;

  // Categorized sensor data for display
  const categorizedSensors = sensorData 
    ? categorizeSensorData(sensorData) 
    : null;

  // Empty state
  if (!detections || detections.length === 0) {
    return (
      <div className="fusion-insight-panel">
        <h3>🌐 Multimodal Intelligence</h3>
        <div className="empty-state">
          <p>⏳ Waiting for detection data...</p>
          <p className="hint">Fusion analysis will combine vision + sensor data</p>
        </div>
      </div>
    );
  }

  // No sensor data yet
  if (!sensorData) {
    return (
      <div className="fusion-insight-panel">
        <h3>🌐 Multimodal Intelligence</h3>
        <div className="loading-sensors">
          <div className="sensor-spinner"></div>
          <p>📡 Initializing sensor stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fusion-insight-panel">
      <div className="panel-header">
        <h3>🌐 Multimodal Intelligence</h3>
        <button 
          className={`sensor-toggle ${sensorEnabled ? 'active' : ''}`}
          onClick={() => setSensorEnabled(!sensorEnabled)}
          title={sensorEnabled ? 'Sensor fusion enabled' : 'Sensor fusion disabled'}
        >
          {sensorEnabled ? '📡 Live' : '📡 Off'}
        </button>
      </div>

      {/* Latest Fused Diagnosis */}
      {latestDiagnosis && (
        <div className="fused-diagnosis-card">
          <div className="diagnosis-header">
            <span className="diagnosis-icon">{latestDiagnosis.icon}</span>
            <div className="diagnosis-title">
              <h4>{latestDiagnosis.refined_diagnosis}</h4>
              <div className="diagnosis-meta">
                <span className="confidence-badge">
                  {(latestDiagnosis.confidence * 100).toFixed(0)}% confidence
                </span>
                <span className={`severity-badge severity-${latestDiagnosis.severity}`}>
                  {latestDiagnosis.severity}
                </span>
              </div>
            </div>
          </div>

          <div className="diagnosis-action">
            <strong>📋 Recommended Action:</strong>
            <p>{latestDiagnosis.action}</p>
          </div>

          {latestDiagnosis.false_positive_prevention && (
            <div className="fusion-benefit">
              <span className="benefit-icon">✨</span>
              <span className="benefit-text">{latestDiagnosis.false_positive_prevention}</span>
            </div>
          )}
        </div>
      )}

      {/* Data Sources Grid */}
      <div className="data-sources-grid">
        {/* Vision Input */}
        <div className="source-card vision-source">
          <div className="source-header">
            <span className="source-icon">👁️</span>
            <h5>Vision Detection</h5>
          </div>
          <div className="source-content">
            <div className="source-value">
              {latestDiagnosis?.vision_input?.class || 'N/A'}
            </div>
            <div className="source-detail">
              Confidence: {latestDiagnosis?.vision_input?.confidence 
                ? (latestDiagnosis.vision_input.confidence * 100).toFixed(1) + '%'
                : 'N/A'}
            </div>
          </div>
        </div>

        {/* Sensor Inputs */}
        <div className="source-card sensor-source">
          <div className="source-header">
            <span className="source-icon">📡</span>
            <h5>Sensor Data</h5>
          </div>
          <div className="sensor-readings">
            <div className={`sensor-reading ${categorizedSensors?.moisture.status}`}>
              <span className="reading-label">💧 Moisture</span>
              <span className="reading-value">{sensorData.soil_moisture}%</span>
              <span className="reading-category">{categorizedSensors?.moisture.category}</span>
            </div>
            <div className={`sensor-reading ${categorizedSensors?.temperature.status}`}>
              <span className="reading-label">🌡️ Temp</span>
              <span className="reading-value">{sensorData.soil_temperature}°C</span>
              <span className="reading-category">{categorizedSensors?.temperature.category}</span>
            </div>
            <div className={`sensor-reading ${categorizedSensors?.humidity.status}`}>
              <span className="reading-label">💨 Humidity</span>
              <span className="reading-value">{sensorData.air_humidity}%</span>
              <span className="reading-category">{categorizedSensors?.humidity.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fusion Statistics */}
      {fusionStats && (
        <div className="fusion-stats">
          <h5>📊 Fusion Performance</h5>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Fusion Rate</span>
              <span className="stat-value">{fusionStats.fusionRate}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Analyzed</span>
              <span className="stat-value">{fusionStats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Most Common</span>
              <span className="stat-value-text">{fusionStats.mostCommon}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Timestamp */}
      <div className="sensor-timestamp">
        <span>📡 Last sensor update: {new Date(sensorData.timestamp).toLocaleTimeString()}</span>
        <span className={`sensor-status ${sensorData.status}`}>● {sensorData.status}</span>
      </div>
    </div>
  );
}
