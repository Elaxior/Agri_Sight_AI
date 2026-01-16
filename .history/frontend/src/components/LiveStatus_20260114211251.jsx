import React from 'react';
import './LiveStatus.css';

export default function LiveStatus({ connected, detections }) {
  const totalDetections = detections.reduce((sum, det) => 
    sum + (det.detection_count || 0), 0
  );

  const framesProcessed = detections.length;
  const avgPerFrame = framesProcessed > 0 
    ? (totalDetections / framesProcessed).toFixed(1) 
    : '0';

  return (
    <div className="live-status-panel">
      <div className="status-header">
        <h2>🚁 Live Drone Analytics</h2>
        <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
          <span className="status-dot"></span>
          {connected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div className="metrics-row">
        <div className="metric-box">
          <div className="metric-value">{totalDetections}</div>
          <div className="metric-label">Total Detections</div>
        </div>

        <div className="metric-box">
          <div className="metric-value">{framesProcessed}</div>
          <div className="metric-label">Frames Processed</div>
        </div>

        <div className="metric-box">
          <div className="metric-value">{avgPerFrame}</div>
          <div className="metric-label">Avg/Frame</div>
        </div>
      </div>
    </div>
  );
}
