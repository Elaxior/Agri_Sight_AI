/**
 * EconomicImpactPanel Component
 * Displays ROI, cost savings, and economic impact analysis
 */

import React, { useMemo } from 'react';
import { calculateEconomicImpact, generateSummaryMetrics } from '../utils/economicCalculator';
import { formatCurrency, formatPercentage } from '../utils/economicConfig';
import './EconomicImpactPanel.css';

export default function EconomicImpactPanel({ gridStats }) {
  // Calculate economic impact whenever grid changes
  const economicImpact = useMemo(() => {
    if (!gridStats) return null;
    
    console.log('💰 Calculating economic impact...', gridStats);
    const impact = calculateEconomicImpact(gridStats);
    console.log('💰 Economic impact calculated:', impact);
    
    return impact;
  }, [gridStats]);

  // Generate display metrics
  const metrics = useMemo(() => {
    if (!economicImpact) return null;
    return generateSummaryMetrics(economicImpact);
  }, [economicImpact]);

  // No grid data yet
  if (!gridStats) {
    return (
      <div className="economic-impact-panel">
        <h3>💰 Economic Impact Analysis</h3>
        <div className="empty-state">
          <p>⏳ Waiting for detection data...</p>
          <p className="hint">Economic analysis will appear after detections are processed</p>
        </div>
      </div>
    );
  }

  // Healthy field (no infection)
  if (!economicImpact.hasInfection) {
    return (
      <div className="economic-impact-panel">
        <h3>💰 Economic Impact Analysis</h3>
        <div className="healthy-status">
          <div className="status-icon">✅</div>
          <div className="status-message">
            <h4>Field is Healthy!</h4>
            <p>No disease detected - no intervention needed.</p>
            <p className="savings-note">You're saving 100% on treatment costs! 🎉</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="economic-impact-panel">
      <div className="panel-header">
        <h3>💰 Economic Impact Analysis</h3>
        <div className="infection-badge">
          <span className="badge-icon">⚠️</span>
          <span className="badge-text">{economicImpact.message}</span>
        </div>
      </div>

      {/* Primary Metrics - Large Cards */}
      <div className="primary-metrics">
        {metrics.primaryMetrics.map((metric, index) => (
          <div key={index} className={`metric-card metric-${metric.color}`}>
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
              {metric.subtitle && (
                <div className="metric-subtitle">{metric.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="comparison-section">
        <h4>💡 Precision vs. Traditional Spraying</h4>
        <div className="comparison-bars">
          {/* Cost Comparison */}
          <div className="comparison-row">
            <div className="comparison-label">Treatment Cost</div>
            <div className="comparison-viz">
              <div className="bar-container">
                <div 
                  className="bar bar-traditional"
                  style={{ 
                    width: '100%',
                    background: '#ef4444'
                  }}
                >
                  <span className="bar-label">
                    Traditional: {formatCurrency(metrics.comparison.traditional.cost)}
                  </span>
                </div>
              </div>
              <div className="bar-container">
                <div 
                  className="bar bar-precision"
                  style={{ 
                    width: `${(metrics.comparison.precision.cost / metrics.comparison.traditional.cost) * 100}%`,
                    background: '#10b981'
                  }}
                >
                  <span className="bar-label">
                    Precision: {formatCurrency(metrics.comparison.precision.cost)}
                  </span>
                </div>
              </div>
            </div>
            <div className="comparison-savings">
              <span className="savings-badge">
                Save {formatPercentage(metrics.comparison.savings.savingsPercentage)}
              </span>
            </div>
          </div>

          {/* Chemical Usage Comparison */}
          <div className="comparison-row">
            <div className="comparison-label">Chemical Usage</div>
            <div className="comparison-viz">
              <div className="bar-container">
                <div 
                  className="bar bar-traditional"
                  style={{ 
                    width: '100%',
                    background: '#f59e0b'
                  }}
                >
                  <span className="bar-label">
                    {metrics.comparison.traditional.chemical.toFixed(1)}L
                  </span>
                </div>
              </div>
              <div className="bar-container">
                <div 
                  className="bar bar-precision"
                  style={{ 
                    width: `${(metrics.comparison.precision.chemical / metrics.comparison.traditional.chemical) * 100}%`,
                    background: '#22c55e'
                  }}
                >
                  <span className="bar-label">
                    {metrics.comparison.precision.chemical.toFixed(1)}L
                  </span>
                </div>
              </div>
            </div>
            <div className="comparison-savings">
              <span className="savings-badge">
                Reduce {formatPercentage(metrics.comparison.savings.chemicalSavingsPercentage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics - Compact Grid */}
      <div className="secondary-metrics">
        {metrics.secondaryMetrics.map((metric, index) => (
          <div key={index} className="info-box">
            <div className="info-label">{metric.label}</div>
            <div className="info-value">{metric.value}</div>
            <div className="info-detail">{metric.detail}</div>
          </div>
        ))}
      </div>

      {/* Action Recommendation */}
      <div className="action-recommendation">
        <div className="recommendation-icon">💡</div>
        <div className="recommendation-content">
          <h4>Recommended Action</h4>
          <p>
            Apply precision treatment to {economicImpact.areas.infectedCells} infected zones immediately.
            Expected ROI: <strong>{economicImpact.roi.perApplication.roiMultiplier.toFixed(1)}×</strong> with 
            net savings of <strong>{formatCurrency(economicImpact.roi.perApplication.netProfit)}</strong> per application.
          </p>
          <p className="environmental-note">
            🌱 Environmental benefit: Reduce chemical usage by {formatPercentage(metrics.comparison.savings.chemicalSavingsPercentage)}, 
            protecting soil health and beneficial insects.
          </p>
        </div>
      </div>
    </div>
  );
}
