/**
 * GPS Simulator
 * Generates realistic GPS coordinates for agricultural field
 */

// Field configuration (New Delhi area)
const FIELD_CONFIG = {
  center: {
    lat: 28.6139,
    lng: 77.2090
  },
  // Field dimensions in degrees (approx 200m x 200m)
  bounds: {
    latDelta: 0.002,  // ~220m north-south
    lngDelta: 0.002   // ~220m east-west
  }
};

/**
 * Generate random GPS coordinate within field bounds
 * @returns {{ lat: number, lng: number }}
 */
export function generateFieldGPS() {
  const { center, bounds } = FIELD_CONFIG;
  
  // Random offset within bounds
  const latOffset = (Math.random() - 0.5) * bounds.latDelta;
  const lngOffset = (Math.random() - 0.5) * bounds.lngDelta;
  
  return {
    lat: parseFloat((center.lat + latOffset).toFixed(6)),
    lng: parseFloat((center.lng + lngOffset).toFixed(6))
  };
}

/**
 * Generate grid-pattern GPS coordinates (systematic drone scan)
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Array<{lat: number, lng: number}>}
 */
export function generateGridGPS(rows = 4, cols = 5) {
  const { center, bounds } = FIELD_CONFIG;
  const coordinates = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate position in grid
      const latOffset = (row / (rows - 1) - 0.5) * bounds.latDelta;
      const lngOffset = (col / (cols - 1) - 0.5) * bounds.lngDelta;
      
      coordinates.push({
        lat: parseFloat((center.lat + latOffset).toFixed(6)),
        lng: parseFloat((center.lng + lngOffset).toFixed(6))
      });
    }
  }
  
  return coordinates;
}

/**
 * Get field center coordinates
 * @returns {{ lat: number, lng: number }}
 */
export function getFieldCenter() {
  return FIELD_CONFIG.center;
}

/**
 * Get field bounds for map viewport
 * @returns {Array<Array<number>>} [[south, west], [north, east]]
 */
export function getFieldBounds() {
  const { center, bounds } = FIELD_CONFIG;
  
  return [
    [center.lat - bounds.latDelta / 2, center.lng - bounds.lngDelta / 2], // Southwest
    [center.lat + bounds.latDelta / 2, center.lng + bounds.lngDelta / 2]  // Northeast
  ];
}

/**
 * Interpolate between two GPS coordinates
 * @param {{lat: number, lng: number}} start
 * @param {{lat: number, lng: number}} end
 * @param {number} t - Interpolation factor (0 to 1)
 * @returns {{lat: number, lng: number}}
 */
export function interpolateGPS(start, end, t) {
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t
  };
}

/**
 * Calculate distance between two GPS coordinates (meters)
 * @param {{lat: number, lng: number}} point1
 * @param {{lat: number, lng: number}} point2
 * @returns {number} Distance in meters
 */
export function calculateDistance(point1, point2) {
  const R = 6371000; // Earth's radius in meters
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}
