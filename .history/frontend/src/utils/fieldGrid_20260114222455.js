/**
 * Field Grid System
 * Divides field into cells for path planning
 */

import { getFieldCenter } from './gpsSimulator';

// Grid configuration
const GRID_CONFIG = {
  rows: 10,      // 10 rows (north-south)
  cols: 10,      // 10 columns (east-west)
  fieldSize: {
    latDelta: 0.002,  // ~220m north-south
    lngDelta: 0.002   // ~220m east-west
  }
};

/**
 * Cell data structure
 * @typedef {Object} GridCell
 * @property {number} row - Row index (0-9)
 * @property {number} col - Column index (0-9)
 * @property {string} id - Unique cell ID "row_col"
 * @property {{lat: number, lng: number}} center - Cell center GPS
 * @property {Array} bounds - [[south, west], [north, east]]
 * @property {Array} detections - Detection IDs in this cell
 * @property {boolean} infected - Has ≥1 detection
 */

/**
 * Create grid structure
 * @returns {Array<Array<GridCell>>} 2D grid array
 */
export function createFieldGrid() {
  const { rows, cols, fieldSize } = GRID_CONFIG;
  const fieldCenter = getFieldCenter();
  
  const grid = [];
  
  // Calculate cell dimensions
  const cellLatSize = fieldSize.latDelta / rows;
  const cellLngSize = fieldSize.lngDelta / cols;
  
  // Field boundaries
  const fieldNorth = fieldCenter.lat + fieldSize.latDelta / 2;
  const fieldWest = fieldCenter.lng - fieldSize.lngDelta / 2;
  
  for (let row = 0; row < rows; row++) {
    const gridRow = [];
    
    for (let col = 0; col < cols; col++) {
      // Calculate cell bounds
      const north = fieldNorth - (row * cellLatSize);
      const south = north - cellLatSize;
      const west = fieldWest + (col * cellLngSize);
      const east = west + cellLngSize;
      
      // Cell center point
      const centerLat = (north + south) / 2;
      const centerLng = (west + east) / 2;
      
      const cell = {
        row,
        col,
        id: `${row}_${col}`,
        center: {
          lat: parseFloat(centerLat.toFixed(6)),
          lng: parseFloat(centerLng.toFixed(6))
        },
        bounds: [
          [south, west],  // Southwest corner
          [north, east]   // Northeast corner
        ],
        detections: [],
        infected: false
      };
      
      gridRow.push(cell);
    }
    
    grid.push(gridRow);
  }
  
  return grid;
}

/**
 * Check if GPS point is inside cell bounds
 * @param {{lat: number, lng: number}} point
 * @param {GridCell} cell
 * @returns {boolean}
 */
export function isPointInCell(point, cell) {
  const [[south, west], [north, east]] = cell.bounds;
  
  return point.lat >= south &&
         point.lat <= north &&
         point.lng >= west &&
         point.lng <= east;
}

/**
 * Find which cell contains a GPS point
 * @param {{lat: number, lng: number}} point
 * @param {Array<Array<GridCell>>} grid
 * @returns {GridCell|null}
 */
export function findCellForPoint(point, grid) {
  for (let row of grid) {
    for (let cell of row) {
      if (isPointInCell(point, cell)) {
        return cell;
      }
    }
  }
  return null;
}

/**
 * Get flat array of all cells
 * @param {Array<Array<GridCell>>} grid
 * @returns {Array<GridCell>}
 */
export function flattenGrid(grid) {
  return grid.flat();
}

/**
 * Get only infected cells
 * @param {Array<Array<GridCell>>} grid
 * @returns {Array<GridCell>}
 */
export function getInfectedCells(grid) {
  return flattenGrid(grid).filter(cell => cell.infected);
}

/**
 * Calculate field statistics
 * @param {Array<Array<GridCell>>} grid
 * @returns {Object}
 */
export function calculateGridStats(grid) {
  const allCells = flattenGrid(grid);
  const infectedCells = allCells.filter(c => c.infected);
  
  const totalCells = allCells.length;
  const infectedCount = infectedCells.length;
  const healthyCount = totalCells - infectedCount;
  
  const infectedPercentage = (infectedCount / totalCells) * 100;
  const healthyPercentage = (healthyCount / totalCells) * 100;
  
  return {
    totalCells,
    infectedCount,
    healthyCount,
    infectedPercentage: parseFloat(infectedPercentage.toFixed(1)),
    healthyPercentage: parseFloat(healthyPercentage.toFixed(1)),
    chemicalSavings: parseFloat(healthyPercentage.toFixed(1))
  };
}
