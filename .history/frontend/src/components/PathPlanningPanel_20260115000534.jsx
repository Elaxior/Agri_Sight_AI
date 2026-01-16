/**
 * PathPlanningPanel Component
 * Controls and displays path planning information
 */

import React, { useState, useMemo, useEffect } from 'react';
import { mapDetectionsToGrid } from '../utils/zoneDetection';
import { generateSprayPath } from '../utils/pathPlanner';
import { calculateGridStats } from '../utils/fieldGrid';
import './PathPlanningPanel.css';

export default function PathPlanningPanel({ detections, onPathGenerated, onGridStatsCalculated }) {
  const [pathData, setPathData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  console.log('🔧 ===== PathPlanningPanel RENDERED =====');
  console.log('🔧 Detections prop:', detections);
  console.log('🔧 Detections length:', detections?.length);
  console.log('🔧 onPathGenerated callback:', typeof onPathGenerated);
  console.log('🔧 onGridStatsCalculated callback:', typeof onGridStatsCalculated);
  console.log('🔧 pathData state:', pathData);

  // Calculate grid and stats directly from detections
  const gridData = useMemo(() => {
    console.log('🔧 [useMemo] Calculating gridData...');
    
    if (!detections || detections.length === 0) {
      console.log('⚠️ No detections available');
      return null;
    }

    // Check GPS coordinates
    const detectionsWithValidGPS = detections.filter(d => d.gps);
    console.log('🔧 Total detections:', detections.length);
    console.log('🔧 Detections with GPS:', detectionsWithValidGPS.length);
    console.log('🔧 Sample detection:', detections[0]);
    console.log('🔧 Sample GPS:', detections[0]?.gps);
    
    if (detectionsWithValidGPS.length === 0) {
      console.error('❌ NO DETECTIONS HAVE GPS COORDINATES!');
      return null;
    }
    
    try {
      console.log('🔧 Calling mapDetectionsToGrid...');
      const grid = mapDetectionsToGrid(detections);
      console.log('✅ Grid created:', grid);
      
      console.log('🔧 Calling calculateGridStats...');
      const stats = calculateGridStats(grid);
      console.log('✅ Stats calculated:', stats);
      
      return { grid, stats };
    } catch (error) {
      console.error('❌ Error creating grid:', error);
      return null;
    }
  }, [detections]);

  // Watch gridData changes
  useEffect(() => {
    console.log('🔧 [useEffect] gridData changed:', gridData);
  }, [gridData]);

  // ✅ NEW: Notify parent component when grid stats are calculated
  useEffect(() => {
    if (gridData && onGridStatsCalculated) {
      console.log('📊 Notifying Dashboard of grid stats:', gridData.stats);
      onGridStatsCalculated(gridData.stats);
    } else if (!gridData && onGridStatsCalculated) {
      // Clear stats when no data
      console.log('📊 Clearing grid stats');
      onGridStatsCalculated(null);
    }
  }, [gridData, onGridStatsCalculated]);

  const handleGeneratePath = () => {
    console.log('🔧 ===== GENERATE PATH BUTTON CLICKED =====');
    console.log('🔧 gridData:', gridData);
    console.log('🔧 isGenerating:', isGenerating);
    
    if (!gridData) {
      console.error('❌ Cannot generate path: No gridData');
      alert('Cannot generate path: No detection data available with GPS coordinates');
      return;
    }
    
    console.log('🔧 Setting isGenerating = true');
    setIsGenerating(true);
    
    setTimeout(() => {
      console.log('🔧 Timeout fired, generating path...');
      
      try {
        console.log('🔧 Calling generateSprayPath with grid:', gridData.grid);
        const path = generateSprayPath(gridData.grid);
        
        console.log('✅ Path generated successfully!');
        console.log('✅ Path data:', path);
        console.log('✅ Path exists:', path.pathExists);
        console.log('✅ Waypoints count:', path.waypoints?.length);
        
        console.log('🔧 Updating local pathData state');
        setPathData(path);
        
        if (onPathGenerated) {
          console.log('🔧 Calling onPathGenerated callback');
          onPathGenerated(path);
          console.log('✅ Callback executed');
        } else {
          console.error('❌ onPathGenerated callback is undefined!');
        }
        
        console.log('🔧 Setting isGenerating = false');
        setIsGenerating(false);
        console.log('✅ ===== PATH GENERATION COMPLETE =====');
        
      } catch (error) {
        console.error('❌ ERROR during path generation:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        setIsGenerating(false);
        alert('Error generating path: ' + error.message);
      }
    }, 500);
  };

  const handleClearPath = () => {
    console.log('🔧 Clear path clicked');
    setPathData(null);
    if (onPathGenerated) {
      console.log('🔧 Calling onPathGenerated with null');
      onPathGenerated(null);
    }
  };

  if (!detections || detections.length === 0) {
    console.log('🔧 Rendering empty state (no detections)');
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

  console.log('🔧 Rendering main panel UI');

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
            disabled={isGenerating || !gridData}
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
