import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './DetectionFeed.css';

export default function DetectionFeed({ detections }) {
  const recentDetections = detections.slice(0, 50);

  if (recentDetections.length === 0) {
    return (
      <div className="detection-feed-panel">
        <h3>📊 Detection Feed</h3>
        <div className="empty-feed">
          <p>⏳ Waiting for detections...</p>
          <p className="hint">Run inference to see live updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detection-feed-panel">
      <h3>📊 Detection Feed ({recentDetections.length})</h3>
      
      <div className="feed-scroll">
        {recentDetections.map((detection) => (
          <DetectionCard key={detection.id} detection={detection} />
        ))}
      </div>
    </div>
  );
}

function DetectionCard({ detection }) {
  const {
    frame_id,
    timestamp,
    detection_count,
    detections: diseaseList = []
  } = detection;

  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className="detection-card">
      <div className="card-top">
        <span className="frame-tag">Frame {frame_id}</span>
        <span className="time-tag">{timeAgo}</span>
      </div>

      <div className="card-content">
        <div className="detection-count">
          <strong>{detection_count}</strong> disease{detection_count !== 1 ? 's' : ''} detected
        </div>

        {diseaseList.length > 0 && (
          <div className="diseases">
            {diseaseList.map((disease, idx) => (
              <div key={idx} className="disease-row">
                <span className="disease-name">{disease.class_name}</span>
                <span className="confidence-tag">
                  {(disease.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
