import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import DroneMarker from './DroneMarker';
import DetectionMarker from './DetectionMarker';
import SprayPathOverlay from './SprayPathOverlay';  // ← NEW
import { getFieldCenter, generateFieldGPS } from '../utils/gpsSimulator';
import './MapView.css';

// ... (keep existing icon fix code)

export default function MapView({ detections, sprayPath }) {  // ← Add sprayPath prop
  const [dronePosition, setDronePosition] = useState(null);
  const fieldCenter = getFieldCenter();

  // ... (keep existing detectionsWithGPS code)

  // ... (keep existing drone position code)

  return (
    <div className="map-view-panel">
      <div className="map-header">
        <h3>🗺️ Field Map</h3>
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-icon drone">🚁</span>
            Drone
          </span>
          <span className="legend-item">
            <span className="legend-icon detection">📍</span>
            Detection ({detectionsWithGPS.length})
          </span>
          {sprayPath && sprayPath.pathExists && (
            <span className="legend-item">
              <span className="legend-icon path">─</span>
              Spray Path
            </span>
          )}
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={[fieldCenter.lat, fieldCenter.lng]}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Spray path overlay - NEW */}
          {sprayPath && <SprayPathOverlay pathData={sprayPath} />}

          {/* Drone position marker */}
          {dronePosition && <DroneMarker position={dronePosition} />}

          {/* Detection markers */}
          {detectionsWithGPS.map((detection) => (
            <DetectionMarker key={detection.id} detection={detection} />
          ))}

          <MapBoundsUpdater detections={detectionsWithGPS} />
        </MapContainer>
      </div>
    </div>
  );
}

// ... (keep existing MapBoundsUpdater)
