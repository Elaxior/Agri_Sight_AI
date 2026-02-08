/**
 * Path Planning Algorithm
 * Generates efficient spray path for infected zones
 */

import { getFieldCenter } from './gpsSimulator';
import { getInfectedCells } from './fieldGrid';

/**
 * Calculate distance between two GPS points (meters)
 * @param {{lat: number, lng: number}} p1
 * @param {{lat: number, lng: number}} p2
 * @returns {number}
 */
function calculateDistance(p1, p2) {
  const R = 6371000; // Earth radius in meters
  const lat1 = p1.lat * Math.PI / 180;
  const lat2 = p2.lat * Math.PI / 180;
  const deltaLat = (p2.lat - p1.lat) * Math.PI / 180;
  const deltaLng = (p2.lng - p1.lng) * Math.PI / 180;
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Generate spray path using Nearest Neighbor algorithm
 * @param {Array<Array<GridCell>>} grid
 * @returns {Object} Path data
 */
export function generateSprayPath(grid) {
  const infectedCells = getInfectedCells(grid);
  
  if (infectedCells.length === 0) {
    return {
      waypoints: [],
      totalDistance: 0,
      estimatedTime: 0,
      pathExists: false
    };
  }
  
  // Start from field center (home/launch point)
  const startPoint = getFieldCenter();
  
  const path = [];
  const unvisited = new Set(infectedCells);
  let currentPosition = startPoint;
  let totalDistance = 0;
  
  // Nearest Neighbor algorithm
  while (unvisited.size > 0) {
    let nearestCell = null;
    let shortestDistance = Infinity;
    
    // Find nearest unvisited cell
    for (let cell of unvisited) {
      const distance = calculateDistance(currentPosition, cell.center);
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestCell = cell;
      }
    }
    
    // Visit nearest cell
    if (nearestCell) {
      path.push({
        cellId: nearestCell.id,
        position: nearestCell.center,
        detectionCount: nearestCell.detections.length
      });
      
      totalDistance += shortestDistance;
      currentPosition = nearestCell.center;
      unvisited.delete(nearestCell);
    }
  }
  
  // Add return to home
  const returnDistance = calculateDistance(currentPosition, startPoint);
  totalDistance += returnDistance;
  
  // Calculate estimated time (drone speed: 5 m/s, spray time: 3s per cell)
  const travelTime = totalDistance / 5;  // seconds
  const sprayTime = path.length * 3;     // seconds
  const estimatedTime = travelTime + sprayTime;
  
  return {
    waypoints: path,
    totalDistance: parseFloat(totalDistance.toFixed(1)),
    estimatedTime: Math.ceil(estimatedTime),
    pathExists: true,
    startPoint,
    endPoint: startPoint  // Returns to home
  };
}

/**
 * Generate path coordinates for map visualization
 * @param {Object} pathData - Output from generateSprayPath
 * @returns {Array<Array<number>>} Array of [lat, lng] pairs
 */
export function getPathCoordinates(pathData) {
  if (!pathData.pathExists) return [];
  
  const coords = [];
  
  // Start point
  coords.push([pathData.startPoint.lat, pathData.startPoint.lng]);
  
  // Waypoints
  pathData.waypoints.forEach(waypoint => {
    coords.push([waypoint.position.lat, waypoint.position.lng]);
  });
  
  // Return to start
  coords.push([pathData.endPoint.lat, pathData.endPoint.lng]);
  
  return coords;
}

/**
 * Alternative: Grid Sweep algorithm (simpler, more systematic)
 * @param {Array<Array<GridCell>>} grid
 * @returns {Object} Path data
 */
export function generateSweepPath(grid) {
  const infectedCells = [];
  
  // Sweep top-to-bottom, left-to-right
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      
      if (cell.infected) {
        infectedCells.push({
          cellId: cell.id,
          position: cell.center,
          detectionCount: cell.detections.length
        });
      }
    }
  }
  
  if (infectedCells.length === 0) {
    return {
      waypoints: [],
      totalDistance: 0,
      estimatedTime: 0,
      pathExists: false
    };
  }
  
  // Calculate total distance
  let totalDistance = 0;
  const startPoint = getFieldCenter();
  
  // Distance to first cell
  totalDistance += calculateDistance(startPoint, infectedCells[0].position);
  
  // Distance between cells
  for (let i = 0; i < infectedCells.length - 1; i++) {
    totalDistance += calculateDistance(
      infectedCells[i].position,
      infectedCells[i + 1].position
    );
  }
  
  // Return to home
  totalDistance += calculateDistance(
    infectedCells[infectedCells.length - 1].position,
    startPoint
  );
  
  const travelTime = totalDistance / 5;
  const sprayTime = infectedCells.length * 3;
  
  return {
    waypoints: infectedCells,
    totalDistance: parseFloat(totalDistance.toFixed(1)),
    estimatedTime: Math.ceil(travelTime + sprayTime),
    pathExists: true,
    startPoint,
    endPoint: startPoint
  };
}
