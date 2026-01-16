/**
 * DetectionMarker Component
 * Displays disease detection pins with popup info
 */

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';

// Custom detection icon
const detectionIcon = L.divIcon({
  className: 'custom-detection-icon',
  html: '<div class="detection-marker-icon">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function DetectionMarker({ detection }) {
  if (!detection.gps) return null;

  const { gps, frame_id, timestamp, detections = [], detection_count } = detection;

  // Format timestamp
  const timeAgo = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : 'Unknown';

  // Get confidence class for styling
  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.7) return 'confidence-high';
    if (confidence >= 0.4) return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <Marker position={[gps.lat, gps.lng]} icon={detectionIcon}>
      <Popup>
        <div className="marker-popup">
          <div className="popup-header">
            📍 Frame {frame_id}
          </div>
          
          <div className="popup-detail">
            <span className="popup-label">Detected:</span>
            <span className="popup-value">{timeAgo}</span>
          </div>

          <div className="popup-detail">
            <span className="popup-label">GPS:</span>
            <span className="popup-value">
              {gps.lat.toFixed(6)}°, {gps.lng.toFixed(6)}°
            </span>
          </div>

          <div className="popup-detail">
            <span className="popup-label">Diseases:</span>
            <span className="popup-value">{detection_count}</span>
          </div>

          {detections.length > 0 && (
            <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e0e0e0', paddingTop: '0.5rem' }}>
              {detections.map((disease, idx) => (
                <div key={idx} className="popup-detail">
                  <span className="popup-label">{disease.class_name}:</span>
                  <span className={getConfidenceClass(disease.confidence)}>
                    {(disease.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
