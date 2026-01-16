/**
 * Infected Zone Detection
 * Maps detections to grid cells and identifies problem areas
 */

import { createFieldGrid, findCellForPoint } from './fieldGrid';

/**
 * Map detections to grid cells
 * @param {Array} detections - Detection objects with GPS
 * @returns {Array<Array<GridCell>>} Grid with mapped detections
 */
export function mapDetectionsToGrid(detections) {
  // Create empty grid
  const grid = createFieldGrid();
  
  // Process each detection
  detections.forEach(detection => {
    if (!detection.gps) return;
    
    // Find which cell this detection belongs to
    const cell = findCellForPoint(detection.gps, grid);
    
    if (cell) {
      // Add detection ID to cell
      cell.detections.push(detection.id);
      
      // Mark cell as infected
      cell.infected = true;
    }
  });
  
  return grid;
}

/**
 * Identify contiguous infected zones (clusters)
 * @param {Array<Array<GridCell>>} grid
 * @returns {Array<Array<GridCell>>} Array of zone clusters
 */
export function identifyInfectedZones(grid) {
  const zones = [];
  const visited = new Set();
  
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Depth-first search to find connected components
  function dfs(row, col, currentZone) {
    const cellId = `${row}_${col}`;
    
    // Boundary checks
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (visited.has(cellId)) return;
    if (!grid[row][col].infected) return;
    
    visited.add(cellId);
    currentZone.push(grid[row][col]);
    
    // Check 4 adjacent cells (not diagonal)
    dfs(row - 1, col, currentZone);  // North
    dfs(row + 1, col, currentZone);  // South
    dfs(row, col - 1, currentZone);  // West
    dfs(row, col + 1, currentZone);  // East
  }
  
  // Find all zones
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellId = `${row}_${col}`;
      
      if (grid[row][col].infected && !visited.has(cellId)) {
        const zone = [];
        dfs(row, col, zone);
        
        if (zone.length > 0) {
          zones.push(zone);
        }
      }
    }
  }
  
  return zones;
}

/**
 * Get zone statistics
 * @param {Array<Array<GridCell>>} zones
 * @returns {Object}
 */
export function getZoneStatistics(zones) {
  return {
    zoneCount: zones.length,
    totalInfectedCells: zones.reduce((sum, zone) => sum + zone.length, 0),
    averageZoneSize: zones.length > 0 
      ? (zones.reduce((sum, zone) => sum + zone.length, 0) / zones.length).toFixed(1)
      : 0,
    largestZone: zones.length > 0
      ? Math.max(...zones.map(zone => zone.length))
      : 0
  };
}
