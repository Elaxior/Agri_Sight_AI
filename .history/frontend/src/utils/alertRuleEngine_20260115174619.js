/**
 * Alert Rule Engine
 * Evaluates system signals against decision rules
 */

import { DECISION_RULES } from './decisionRules';

/**
 * Extract signals from system state
 */
export function extractSignals(detections, gridStats, economicImpact, fusionResults, sensorData) {
  // Default signals
  const signals = {
    infectionPercentage: 0,
    roiRatio: 0,
    potentialLoss: 0,
    soilMoisture: 50,
    soilTemperature: 25,
    airHumidity: 60,
    fusionSeverity: 'none',
    fusionDiagnosis: 'Unknown',
    fusionConfidence: 0,
    infectionGrowthRate: 0,
    timestamp: new Date().toISOString()
  };
  
  // Extract from grid stats
  if (gridStats) {
    signals.infectionPercentage = gridStats.infectionPercentage || 0;
    signals.infectedCount = gridStats.infectedCount || 0;
    signals.totalCells = gridStats.totalCells || 100;
  }
  
  // Extract from economic impact
  if (economicImpact && economicImpact.roi) {
    signals.roiRatio = economicImpact.roi.perApplication?.roiRatio || 0;
    signals.potentialLoss = economicImpact.potentialLoss || 0;
  }
  
  // Extract from fusion results (most recent)
  if (fusionResults && fusionResults.length > 0) {
    const latestFusion = fusionResults[fusionResults.length - 1];
    if (latestFusion.diagnosis) {
      signals.fusionSeverity = latestFusion.diagnosis.severity || 'none';
      signals.fusionDiagnosis = latestFusion.diagnosis.refined_diagnosis || 'Unknown';
      signals.fusionConfidence = latestFusion.diagnosis.confidence || 0;
    }
  }
  
  // Extract from sensor data
  if (sensorData) {
    signals.soilMoisture = sensorData.soil_moisture || 50;
    signals.soilTemperature = sensorData.soil_temperature || 25;
    signals.airHumidity = sensorData.air_humidity || 60;
  }
  
  // Calculate growth rate (if we have historical data)
  // For now, estimate from current infection level
  if (signals.infectionPercentage > 15) {
    signals.infectionGrowthRate = signals.infectionPercentage * 0.15; // Rough estimate
  } else if (signals.infectionPercentage > 5) {
    signals.infectionGrowthRate = signals.infectionPercentage * 0.1;
  }
  
  return signals;
}

/**
 * Evaluate all rules and generate alerts
 */
export function evaluateAlerts(signals) {
  const triggeredAlerts = [];
  
  for (const rule of DECISION_RULES) {
    try {
      if (rule.condition(signals)) {
        // Rule triggered - create alert
        const alert = {
          id: `${rule.id}_${Date.now()}`,
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          type: rule.alert.type,
          title: rule.alert.title,
          message: typeof rule.alert.message === 'function' 
            ? rule.alert.message(signals) 
            : rule.alert.message,
          action: rule.alert.action,
          timeline: rule.alert.timeline,
          icon: rule.alert.icon,
          timestamp: new Date().toISOString(),
          signals: { ...signals },  // Include context
          metadata: {
            estimatedLoss: rule.alert.estimatedLoss 
              ? rule.alert.estimatedLoss(signals) 
              : null,
            preventMistake: rule.alert.preventMistake || null,
            savingsPotential: rule.alert.savingsPotential || null,
            benefit: rule.alert.benefit || null
          }
        };
        
        triggeredAlerts.push(alert);
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
    }
  }
  
  // Sort by priority (1 = highest)
  triggeredAlerts.sort((a, b) => a.priority - b.priority);
  
  return triggeredAlerts;
}

/**
 * Handle conflicting alerts - keep only highest priority
 */
export function resolveConflicts(alerts) {
  if (alerts.length <= 1) return alerts;
  
  // Group by category
  const categories = {
    disease: [],
    environmental: [],
    economic: [],
    system: []
  };
  
  alerts.forEach(alert => {
    if (alert.title.includes('Disease') || alert.title.includes('Infection')) {
      categories.disease.push(alert);
    } else if (alert.title.includes('Drought') || alert.title.includes('Heat') || alert.title.includes('Humidity')) {
      categories.environmental.push(alert);
    } else if (alert.title.includes('ROI') || alert.title.includes('Economic')) {
      categories.economic.push(alert);
    } else {
      categories.system.push(alert);
    }
  });
  
  // Keep highest priority from each category
  const resolved = [];
  Object.values(categories).forEach(categoryAlerts => {
    if (categoryAlerts.length > 0) {
      resolved.push(categoryAlerts[0]);  // Already sorted by priority
    }
  });
  
  return resolved;
}

/**
 * Prevent alert spam with debouncing
 */
class AlertDebouncer {
  constructor(windowMs = 30000) {  // 30 seconds
    this.recentAlerts = new Map();
    this.windowMs = windowMs;
  }
  
  shouldShowAlert(alert) {
    const key = `${alert.ruleId}_${alert.type}`;
    const lastShown = this.recentAlerts.get(key);
    const now = Date.now();
    
    if (!lastShown || (now - lastShown) > this.windowMs) {
      this.recentAlerts.set(key, now);
      return true;
    }
    
    return false;
  }
  
  clear() {
    this.recentAlerts.clear();
  }
}

export const alertDebouncer = new AlertDebouncer();
