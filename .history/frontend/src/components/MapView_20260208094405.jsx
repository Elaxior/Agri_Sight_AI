/**
 * MapView Component
 * Interactive map showing drone position, detection pins, and spray path
 * Using MapLibre GL JS with free tiles
 */

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { getFieldCenter } from '../utils/gpsSimulator';
import './MapView.css';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({ detections, sprayPath }) {
  const [dronePosition, setDronePosition] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showDronePopup, setShowDronePopup] = useState(false);
  const mapRef = useRef();
  const fieldCenter = getFieldCenter();

  console.log('🔧 ===== MapView RENDERED =====');
  console.log('🔧 Detections count:', detections.length);
  console.log('🔧 sprayPath prop:', sprayPath);
  console.log('🔧 sprayPath exists:', sprayPath?.pathExists);

  // Simulate drone movement (follows last detection)
  useEffect(() => {
    console.log('🔧 [useEffect] Updating drone position...');
    
    if (detections.length > 0) {
      const latestDetection = detections[0];
      
      if (latestDetection.gps) {
        console.log('✅ Setting drone position to:', latestDetection.gps);
        setDronePosition(latestDetection.gps);
      }
    } else {
      console.log('⚠️ No detections, using field center for drone');
      setDronePosition(fieldCenter);
    }
  }, [detections, fieldCenter]);

  // Auto-fit bounds when detections change
  useEffect(() => {
    if (mapRef.current && detections.length > 0) {
      const bounds = detections
        .filter(d => d.gps)
        .map(d => [d.gps.lng, d.gps.lat]);
      
      if (bounds.length > 0) {
        const map = mapRef.current.getMap();
        const bbox = bounds.reduce((acc, coord) => {
          return [
            Math.min(acc[0], coord[0]),
            Math.min(acc[1], coord[1]),
            Math.max(acc[2], coord[0]),
            Math.max(acc[3], coord[1])
          ];
        }, [bounds[0][0], bounds[0][1], bounds[0][0], bounds[0][1]]);
        
        map.fitBounds(bbox, { padding: 50, maxZoom: 17 });
      }
    }
  }, [detections]);

  // Prepare spray path GeoJSON
  const sprayPathGeoJSON = sprayPath && sprayPath.pathExists ? {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [sprayPath.startPoint.lng, sprayPath.startPoint.lat],
            ...sprayPath.waypoints.map(wp => [wp.position.lng, wp.position.lat]),
            [sprayPath.endPoint.lng, sprayPath.endPoint.lat]
          ]
        }
      }
    ]
  } : null;

  // Spray path style layers
  const pathLineLayer = {
    id: 'spray-path-line',
    type: 'line',
    paint: {
      'line-color': '#3b82f6',
      'line-width': 3,
      'line-opacity': 0.7,
      'line-dasharray': [2, 2]
    }
  };

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
            Detection ({detections.length})
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
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{
            longitude: fieldCenter.lng,
            latitude: fieldCenter.lat,
            zoom: 16
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          attributionControl={true}
        >
          {/* Spray path line */}
          {sprayPathGeoJSON && (
            <Source id="spray-path" type="geojson" data={sprayPathGeoJSON}>
              <Layer {...pathLineLayer} />
            </Source>
          )}

          {/* Start point marker */}
          {sprayPath && sprayPath.pathExists && (
            <>
              <Marker
                longitude={sprayPath.startPoint.lng}
                latitude={sprayPath.startPoint.lat}
                anchor="center"
              >
                <div className="map-marker start-marker">🏠</div>
              </Marker>

              {/* Waypoint markers */}
              {sprayPath.waypoints.map((waypoint, index) => (
                <React.Fragment key={waypoint.cellId}>
                  <Marker
                    longitude={waypoint.position.lng}
                    latitude={waypoint.position.lat}
                    anchor="center"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedWaypoint({ ...waypoint, index });
                    }}
                  >
                    <div className="map-marker waypoint-marker">💧</div>
                  </Marker>
                </React.Fragment>
              ))}

              {/* End point marker */}
              <Marker
                longitude={sprayPath.endPoint.lng}
                latitude={sprayPath.endPoint.lat}
                anchor="center"
              >
                <div className="map-marker end-marker">🏁</div>
              </Marker>
            </>
          )}

          {/* Drone marker */}
          {dronePosition && (
            <>
              <Marker
                longitude={dronePosition.lng}
                latitude={dronePosition.lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setShowDronePopup(true);
                }}
              >
                <div className="map-marker drone-marker">🚁</div>
              </Marker>

              {showDronePopup && (
                <Popup
                  longitude={dronePosition.lng}
                  latitude={dronePosition.lat}
                  anchor="bottom"
                  onClose={() => setShowDronePopup(false)}
                  closeButton={true}
                  closeOnClick={false}
                  offset={20}
                >
                  <div className="marker-popup">
                    <div className="popup-header">🚁 Drone Position</div>
                    <div className="popup-detail">
                      <span className="popup-label">Latitude:</span>
                      <span className="popup-value">{dronePosition.lat.toFixed(6)}°</span>
                    </div>
                    <div className="popup-detail">
                      <span className="popup-label">Longitude:</span>
                      <span className="popup-value">{dronePosition.lng.toFixed(6)}°</span>
                    </div>
                    <div className="popup-detail">
                      <span className="popup-label">Status:</span>
                      <span className="popup-value" style={{ color: '#10b981' }}>Active</span>
                    </div>
                  </div>
                </Popup>
              )}
            </>
          )}

          {/* Detection markers */}
          {detections.map((detection) => {
            if (!detection.gps) return null;
            
            const { gps, frame_id, timestamp, detections: diseases = [], detection_count } = detection;
            
            return (
              <React.Fragment key={detection.id}>
                <Marker
                  longitude={gps.lng}
                  latitude={gps.lat}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedDetection(detection);
                  }}
                >
                  <div className="map-marker detection-marker">📍</div>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Detection popup */}
          {selectedDetection && selectedDetection.gps && (
            <Popup
              longitude={selectedDetection.gps.lng}
              latitude={selectedDetection.gps.lat}
              anchor="bottom"
              onClose={() => setSelectedDetection(null)}
              closeButton={true}
              closeOnClick={false}
              offset={32}
            >
              <div className="marker-popup">
                <div className="popup-header">
                  📍 Frame {selectedDetection.frame_id}
                </div>
                
                <div className="popup-detail">
                  <span className="popup-label">GPS:</span>
                  <span className="popup-value">
                    {selectedDetection.gps.lat.toFixed(6)}°, {selectedDetection.gps.lng.toFixed(6)}°
                  </span>
                </div>

                <div className="popup-detail">
                  <span className="popup-label">Diseases:</span>
                  <span className="popup-value">{selectedDetection.detection_count}</span>
                </div>

                {selectedDetection.detections && selectedDetection.detections.length > 0 && (
                  <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e0e0e0', paddingTop: '0.5rem' }}>
                    {selectedDetection.detections.map((disease, idx) => (
                      <div key={idx} className="popup-detail">
                        <span className="popup-label">{disease.class_name}:</span>
                        <span className={
                          disease.confidence >= 0.7 ? 'confidence-high' : 
                          disease.confidence >= 0.4 ? 'confidence-medium' : 'confidence-low'
                        }>
                          {(disease.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          )}

          {/* Waypoint popup */}
          {selectedWaypoint && (
            <Popup
              longitude={selectedWaypoint.position.lng}
              latitude={selectedWaypoint.position.lat}
              anchor="bottom"
              onClose={() => setSelectedWaypoint(null)}
              closeButton={true}
              closeOnClick={false}
              offset={24}
            >
              <div className="marker-popup">
                <div className="popup-header">💧 Spray Waypoint #{selectedWaypoint.index + 1}</div>
                <div className="popup-detail">
                  <span className="popup-label">Cell:</span>
                  <span className="popup-value">{selectedWaypoint.cellId}</span>
                </div>
                <div className="popup-detail">
                  <span className="popup-label">Detections:</span>
                  <span className="popup-value">{selectedWaypoint.detectionCount}</span>
                </div>
                <div className="popup-detail">
                  <span className="popup-label">GPS:</span>
                  <span className="popup-value">
                    {selectedWaypoint.position.lat.toFixed(6)}°, {selectedWaypoint.position.lng.toFixed(6)}°
                  </span>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}
