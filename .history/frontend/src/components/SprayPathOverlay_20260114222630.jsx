/**
 * SprayPathOverlay Component
 * Visualizes spray path on map
 */

import React from 'react';
import { Polyline, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Custom waypoint icon
const waypointIcon = L.divIcon({
  className: 'custom-waypoint-icon',
  html: '<div class="waypoint-marker">💧</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

export default function SprayPathOverlay({ pathData, showWaypoints = true }) {
  if (!pathData || !pathData.pathExists) {
    return null;
  }

  const { waypoints, startPoint, endPoint } = pathData;

  // Build path coordinates
  const pathCoordinates = [
    [startPoint.lat, startPoint.lng],
    ...waypoints.map(wp => [wp.position.lat, wp.position.lng]),
    [endPoint.lat, endPoint.lng]
  ];

  return (
    <>
      {/* Flight path line */}
      <Polyline
        positions={pathCoordinates}
        pathOptions={{
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
          lineJoin: 'round'
        }}
      />

      {/* Start point marker */}
      <Circle
        center={[startPoint.lat, startPoint.lng]}
        radius={15}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.5,
          weight: 2
        }}
      >
        <Popup>
          <div className="marker-popup">
            <div className="popup-header">🏠 Launch Point</div>
            <div className="popup-detail">
              <span className="popup-label">GPS:</span>
              <span className="popup-value">
                {startPoint.lat.toFixed(6)}°, {startPoint.lng.toFixed(6)}°
              </span>
            </div>
          </div>
        </Popup>
      </Circle>

      {/* Waypoint markers */}
      {showWaypoints && waypoints.map((waypoint, index) => (
        <React.Fragment key={waypoint.cellId}>
          {/* Spray zone circle */}
          <Circle
            center={[waypoint.position.lat, waypoint.position.lng]}
            radius={12}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 1
            }}
          />

          {/* Waypoint marker */}
          <Marker
            position={[waypoint.position.lat, waypoint.position.lng]}
            icon={waypointIcon}
          >
            <Popup>
              <div className="marker-popup">
                <div className="popup-header">💧 Spray Waypoint #{index + 1}</div>
                <div className="popup-detail">
                  <span className="popup-label">Cell:</span>
                  <span className="popup-value">{waypoint.cellId}</span>
                </div>
                <div className="popup-detail">
                  <span className="popup-label">Detections:</span>
                  <span className="popup-value">{waypoint.detectionCount}</span>
                </div>
                <div className="popup-detail">
                  <span className="popup-label">GPS:</span>
                  <span className="popup-value">
                    {waypoint.position.lat.toFixed(6)}°, {waypoint.position.lng.toFixed(6)}°
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}
    </>
  );
}
