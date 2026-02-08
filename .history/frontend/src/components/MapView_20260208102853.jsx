/**
 * MapView Component
 * Interactive map showing drone position, detection pins, and spray path
 * Using MapLibre GL JS with free tiles
 */

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import { getFieldCenter } from '../utils/gpsSimulator';
import './MapView.css';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView({ detections, sprayPath }) {
  const [dronePosition, setDronePosition] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showDronePopup, setShowDronePopup] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true); // Start in 3D mode
  const [mapStyle, setMapStyle] = useState('hybrid'); // streets, satellite, hybrid
  const mapRef = useRef();
  const fieldCenter = getFieldCenter();

  // Map style URLs - for satellite/hybrid, we use a blank canvas style
  const mapStyles = {
    streets: 'https://tiles.openfreemap.org/styles/positron',
    satellite: {
      version: 8,
      sources: {},
      layers: []
    }, // Blank canvas for pure satellite
    hybrid: 'https://tiles.openfreemap.org/styles/positron' // Positron base with labels
  };

  const getMapStyleUrl = () => {
    return mapStyles[mapStyle] || mapStyles.streets;
  };

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

  // 3D Buildings layer
  const buildingsLayer = {
    id: '3d-buildings',
    source: 'openmaptiles',
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: 15,
    paint: {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'render_height'],
      'fill-extrusion-base': ['get', 'render_min_height'],
      'fill-extrusion-opacity': 0.6
    }
  };

  // Toggle between 2D and 3D view
  const toggle3DMode = () => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      if (is3DMode) {
        // Switch to 2D
        map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
        setIs3DMode(false);
      } else {
        // Switch to 3D
        map.easeTo({ pitch: 60, bearing: 0, duration: 1000 });
        setIs3DMode(true);
      }
    }
  };

  // Change map style
  const changeMapStyle = (style) => {
    setMapStyle(style);
  };

  return (
    <div className="map-view-panel">
      <div className="map-header">
        <h3>🗺️ Field Map {is3DMode ? '(3D)' : '(2D)'}</h3>
        <div className="map-controls">
          <button 
            className="map-3d-toggle"
            onClick={toggle3DMode}
            title={is3DMode ? 'Switch to 2D' : 'Switch to 3D'}
          >
            {is3DMode ? '🌐 3D' : '🗺️ 2D'}
          </button>
          <div className="map-style-selector">
            <button 
              className={`style-btn ${mapStyle === 'streets' ? 'active' : ''}`}
              onClick={() => changeMapStyle('streets')}
              title="Street Map"
            >
              🗺️
            </button>
            <button 
              className={`style-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
              onClick={() => changeMapStyle('satellite')}
              title="Satellite (Pure)"
            >
              🛰️
            </button>
            <button 
              className={`style-btn ${mapStyle === 'hybrid' ? 'active' : ''}`}
              onClick={() => changeMapStyle('hybrid')}
              title="Hybrid (Satellite + Labels)"
            >
              🌍
            </button>
          </div>
        </div>
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
            zoom: 16,
            pitch: 60,  // 3D tilt angle (0-85 degrees)
            bearing: 0  // Rotation angle
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={getMapStyleUrl()}
          attributionControl={true}
          terrain={{ source: 'terrainSource', exaggeration: 1.5 }} // Enable 3D terrain
        >
          {/* Terrain source for 3D elevation */}
          <Source
            id="terrainSource"
            type="raster-dem"
            url="https://demotiles.maplibre.org/terrain-tiles/tiles.json"
            tileSize={256}
          />

          {/* Satellite imagery (for both satellite and hybrid modes) */}
          {(mapStyle === 'satellite' || mapStyle === 'hybrid') && (
            <>
              <Source
                id="satellite"
                type="raster"
                tiles={[
                  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                ]}
                tileSize={256}
                maxzoom={19}
                attribution='© Esri, Maxar, Earthstar Geographics'
              >
                <Layer
                  id="satellite-layer"
                  type="raster"
                  source="satellite"
                  paint={{
                    'raster-opacity': mapStyle === 'hybrid' ? 0.75 : 1.0,
                    'raster-contrast': 0.1,
                    'raster-brightness-min': 0,
                    'raster-brightness-max': 1,
                    'raster-saturation': 0.2
                  }}
                />
              </Source>
            </>
          )}

          {/* 3D Navigation Control (includes pitch/rotation) */}
          <NavigationControl position="top-right" visualizePitch={true} />

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
            
            return (
              <React.Fragment key={detection.id}>
                <Marker
                  longitude={detection.gps.lng}
                  latitude={detection.gps.lat}
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
