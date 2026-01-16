/**
 * MapView Component
 * Interactive map showing drone position, detection pins, and spray path
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import DroneMarker from './DroneMarker';
import DetectionMarker from './DetectionMarker';
import SprayPathOverlay from './SprayPathOverlay';
import { getFieldCenter, generateFieldGPS } from '../utils/gpsSimulator';
import './MapView.css';

// Fix for default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ detections, sprayPath }) {
  const [dronePosition, setDronePosition] = useState(null);
  const fieldCenter = getFieldCenter();

  // Debug: Component render
  console.log('🔧 ===== MapView RENDERED =====');
  console.log('🔧 Detections count:', detections.length);
  console.log('🔧 sprayPath prop:', sprayPath);
  console.log('🔧 sprayPath exists:', sprayPath?.pathExists);

  // Enrich detections with GPS coordinates (simulation)
  const detectionsWithGPS = useMemo(() => {
    console.log('🔧 [useMemo] Enriching detections with GPS...');
    
    const enriched = detections.map(detection => {
      // If detection already has GPS (from backend), use it
      if (detection.gps) {
        return detection;
      }
      
      // Otherwise, generate simulated GPS
      return {
        ...detection,
        gps: generateFieldGPS()
      };
    });
    
    console.log('✅ Enriched detections:', enriched.length);
    console.log('✅ Sample enriched detection:', enriched[0]);
    
    return enriched;
  }, [detections]);

  // Simulate drone movement (follows last detection)
  useEffect(() => {
    console.log('🔧 [useEffect] Updating drone position...');
    
    if (detectionsWithGPS.length > 0) {
      const latestDetection = detectionsWithGPS[0];
      
      // Update drone position to latest detection
      if (latestDetection.gps) {
        console.log('✅ Setting drone position to:', latestDetection.gps);
        setDronePosition(latestDetection.gps);
      }
    } else {
      // Default position (field center)
      console.log('⚠️ No detections, using field center for drone');
      setDronePosition(fieldCenter);
    }
  }, [detectionsWithGPS, fieldCenter]);

  // Debug: Watch sprayPath changes
  useEffect(() => {
    console.log('🔧 [useEffect] sprayPath prop changed:', sprayPath);
    if (sprayPath) {
      console.log('🔧 Waypoints:', sprayPath.waypoints?.length);
    }
  }, [sprayPath]);

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
              <span className="legend-icon path">💧</span>
              Spray Path ({sprayPath.waypoints.length})
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
          {/* Base map tiles (OpenStreetMap) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Spray path overlay (rendered first, so it appears under markers) */}
          {sprayPath && <SprayPathOverlay pathData={sprayPath} />}

          {/* Drone position marker */}
          {dronePosition && (
            <DroneMarker position={dronePosition} />
          )}

          {/* Detection markers */}
          {detectionsWithGPS.map((detection) => (
            <DetectionMarker
              key={detection.id}
              detection={detection}
            />
          ))}

          {/* Auto-fit bounds when detections change */}
          <MapBoundsUpdater detections={detectionsWithGPS} />
        </MapContainer>
      </div>
    </div>
  );
}

/**
 * Helper component to auto-fit map bounds
 */
function MapBoundsUpdater({ detections }) {
  const map = useMap();

  useEffect(() => {
    if (detections.length > 0) {
      const bounds = detections
        .filter(d => d.gps)
        .map(d => [d.gps.lat, d.gps.lng]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      }
    }
  }, [detections, map]);

  return null;
}
