/**
 * Fusion-Aware Path Planner
 * Plans actions based on fused diagnoses, not just vision
 */

import { performFusion } from './fusionEngine';

/**
 * Generate action-specific paths based on fusion results
 */
export function generateFusionAwarePath(grid, sensorData) {
  const chemicalSprayZones = [];
  const irrigationZones = [];
  const monitoringZones = [];
  const noActionZones = [];
  
  // Analyze each cell
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      
      if (!cell.infected || !cell.detections || cell.detections.length === 0) {
        noActionZones.push({ row, col, action: 'none' });
        continue;
      }
      
      // Get primary detection
      const primaryDetection = cell.detections[0];
      
      // Perform fusion
      const fusionResult = performFusion(primaryDetection, sensorData);
      
      if (!fusionResult.diagnosis) {
        noActionZones.push({ row, col, action: 'none' });
        continue;
      }
      
      const diagnosis = fusionResult.diagnosis.refined_diagnosis;
      const severity = fusionResult.diagnosis.severity;
      
      // Route based on diagnosis
      if (diagnosis.includes('Fungal') || diagnosis.includes('Disease')) {
        chemicalSprayZones.push({
          row, col,
          action: 'chemical_spray',
          diagnosis,
          severity,
          priority: severity === 'high' ? 1 : 2
        });
      } else if (diagnosis.includes('Drought') || diagnosis.includes('Heat')) {
        irrigationZones.push({
          row, col,
          action: 'irrigation',
          diagnosis,
          severity,
          priority: severity === 'high' ? 1 : 2
        });
      } else if (diagnosis.includes('Risk') || severity === 'low') {
        monitoringZones.push({
          row, col,
          action: 'monitor',
          diagnosis,
          severity,
          priority: 3
        });
      } else {
        noActionZones.push({
          row, col,
          action: 'none',
          diagnosis
        });
      }
    }
  }
  
  return {
    chemicalSpray: {
      zones: chemicalSprayZones,
      count: chemicalSprayZones.length,
      highPriority: chemicalSprayZones.filter(z => z.priority === 1).length
    },
    irrigation: {
      zones: irrigationZones,
      count: irrigationZones.length,
      highPriority: irrigationZones.filter(z => z.priority === 1).length
    },
    monitoring: {
      zones: monitoringZones,
      count: monitoringZones.length
    },
    noAction: {
      zones: noActionZones,
      count: noActionZones.length
    },
    totalActionable: chemicalSprayZones.length + irrigationZones.length
  };
}

/**
 * Calculate cost savings from fusion-aware decisions
 */
export function calculateFusionSavings(visionOnlyPath, fusionAwarePath, config) {
  // Vision-only would spray all detected zones
  const visionCost = visionOnlyPath.infectedCount * config.costPerCell;
  
  // Fusion-aware only sprays confirmed disease zones
  const fusionCost = fusionAwarePath.chemicalSpray.count * config.costPerCell;
  
  // Additional savings from preventing wrong treatments
  const falsePositivePrevention = 
    (visionOnlyPath.infectedCount - fusionAwarePath.chemicalSpray.count) * 
    config.averageFalsePositiveCost;
  
  return {
    visionOnlyCost: visionCost,
    fusionAwareCost: fusionCost,
    chemicalSavings: visionCost - fusionCost,
    falsePositivePrevention,
    totalSavings: (visionCost - fusionCost) + falsePositivePrevention,
    savingsPercentage: ((visionCost - fusionCost) / visionCost * 100).toFixed(1)
  };
}
