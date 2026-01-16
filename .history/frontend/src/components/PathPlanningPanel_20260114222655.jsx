/**
 * PathPlanningPanel Component
 * Controls and displays path planning information
 */

import React, { useState, useMemo } from 'react';
import { mapDetectionsToGrid } from '../utils/zoneDetection';
import { generateSprayPath } from '../utils/pathPlanner';
import { calculateGridStats } from '../utils/fieldGrid';
import './PathPlanningPanel.css';

export default function PathPlanningPanel({ detections, onPathGenerated }) {
  const [pathData, setPathData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate grid and stats
  const gridData = useMemo(() => {
    if (detections.length === 0) return null;
    
    const grid = mapDetectionsToGrid(detections);
    const stats = calculateGridStats(grid);
    
    return { grid, stats };
  }, [detections]);

  const handleGeneratePath = () => {
    if (!gridData) return;
    
    setIsGenerating(true);
    
    // Simulate processing delay for demo effect
    setTimeout(() => {
      const path = generateSprayPath(gridData.grid);
      setPathData(path);
      
      // Notify parent component
      if (onPathGenerated) {
        onPathGenerated(path);
      }
      
      setIsGenerating(false);
    }, 500);
  };

  const handleClearPath = () => {
    setPathData(null);
    if (onPathGenerated) {
      onPathGenerated(null);
    }
  };

  if (detections.length === 0) {
    return (
      <div className="path-planning-panel">
        <h3>🛫 Spray Path Planning</h3>
        <div className="empty-state">
          <p>⏳ Waiting for detection data...</p>
          <p className="hint">Path planning will be available after detections are received</p>
        </div>
      </div>
    );
  }

  return (
    <div className="path-planning-panel">
      <h3>🛫 Precision Spray Path</h3>

      {/* Field Statistics */}
      {gridData && (
        <div className="field-stats">
          <div className="stat-row">
            <span className="stat-label">Infected Zones:</span>
            <span className="stat-value">
              {gridData.stats.infectedCount} / {gridData.stats.totalCells} cells
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Coverage Required:</span>
            <span className="stat-value highlight">
              {gridData.stats.infectedPercentage}%
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Chemical Savings:</span>
            <span className="stat-value success">
              {gridData.stats.chemicalSavings}% 💰
            </span>
          </div>
        </div>
      )}

      {/* Path Generation Button */}
      <div className="action-buttons">
        {!pathData ? (
          <button
            className="btn-generate"
            onClick={handleGeneratePath}
            disabled={isGenerating}
          >
            {isGenerating ? '⏳ Calculating...' : '🎯 Generate Spray Path'}
          </button>
        ) : (
          <button
            className="btn-clear"
            onClick={handleClearPath}
          >
            🗑️ Clear Path
          </button>
        )}
      </div>

      {/* Path Metrics */}
      {pathData && pathData.pathExists && (
        <div className="path-metrics">
          <h4>📊 Path Details</h4>
          
          <div className="metric-row">
            <span className="metric-icon">📍</span>
            <div className="metric-content">
              <div className="metric-label">Waypoints</div>
              <div className="metric-value">{pathData.waypoints.length}</div>
            </div>
          </div>

          <div className="metric-row">
            <span className="metric-icon">📏</span>
            <div className="metric-content">
              <div className="metric-label">Total Distance</div>
              <div className="metric-value">{pathData.totalDistance}m</div>
            </div>
          </div>

          <div className="metric-row">
            <span className="metric-icon">⏱️</span>
            <div className="metric-content">
              <div className="metric-label">Estimated Time</div>
              <div className="metric-value">
                {Math.floor(pathData.estimatedTime / 60)}m {pathData.estimatedTime % 60}s
              </div>
            </div>
          </div>

          <div className="efficiency-badge">
            <span className="badge-icon">✅</span>
            <span className="badge-text">
              Optimized for precision spraying
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
