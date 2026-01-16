/**
 * DroneMarker Component
 * Displays current drone position with custom icon
 */

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom drone icon
const droneIcon = L.divIcon({
  className: 'custom-drone-icon',
  html: '<div class="drone-marker-icon">🚁</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

export default function DroneMarker({ position }) {
  if (!position) return null;

  return (
    <Marker position={[position.lat, position.lng]} icon={droneIcon}>
      <Popup>
        <div className="marker-popup">
          <div className="popup-header">🚁 Drone Position</div>
          <div className="popup-detail">
            <span className="popup-label">Latitude:</span>
            <span className="popup-value">{position.lat.toFixed(6)}°</span>
          </div>
          <div className="popup-detail">
            <span className="popup-label">Longitude:</span>
            <span className="popup-value">{position.lng.toFixed(6)}°</span>
          </div>
          <div className="popup-detail">
            <span className="popup-label">Status:</span>
            <span className="popup-value" style={{ color: '#10b981' }}>Active</span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
