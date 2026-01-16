/**
 * Multimodal Fusion Engine
 * Combines vision-based detections with sensor context
 * to produce refined, context-aware diagnoses
 */

import { categorizeSensorData } from './sensorSimulator';

/**
 * Fusion Rules Database
 * Each rule combines vision + sensor patterns
 */
const FUSION_RULES = [
  {
    id: 'drought_stress',
    vision_pattern: ['yellow_leaves', 'wilting', 'leaf_curl'],
    sensor_conditions: {
      moisture: 'dry',
      temperature: ['optimal', 'warm', 'hot']
    },
    refined_diagnosis: 'Drought Stress',
    confidence: 0.95,
    severity: 'high',
    action: 'Immediate irrigation needed. Not a disease.',
    false_positive_prevention: 'Prevents misdiagnosis as fungal infection',
    icon: '💧',
    color: '#f59e0b'
  },
  
  {
    id: 'fungal_infection_wet',
    vision_pattern: ['yellow_leaves', 'spots', 'blight'],
    sensor_conditions: {
      moisture: ['optimal', 'wet'],
      humidity: ['humid', 'very_humid']
    },
    refined_diagnosis: 'Fungal Infection (High Humidity)',
    confidence: 0.90,
    severity: 'high',
    action: 'Apply fungicide immediately. Reduce irrigation.',
    false_positive_prevention: 'Confirms disease with environmental evidence',
    icon: '🦠',
    color: '#ef4444'
  },
  
  {
    id: 'nutrient_deficiency',
    vision_pattern: ['yellow_leaves', 'discoloration'],
    sensor_conditions: {
      moisture: ['moderate', 'optimal'],
      ph: ['acidic', 'alkaline']
    },
    refined_diagnosis: 'Nutrient Deficiency (pH imbalance)',
    confidence: 0.85,
    severity: 'medium',
    action: 'Test soil nutrients. Adjust pH. Apply appropriate fertilizer.',
    false_positive_prevention: 'Distinguishes from disease based on pH',
    icon: '🧪',
    color: '#8b5cf6'
  },
  
  {
    id: 'heat_stress',
    vision_pattern: ['wilting', 'leaf_curl', 'browning'],
    sensor_conditions: {
      temperature: ['hot'],
      moisture: ['dry', 'moderate']
    },
    refined_diagnosis: 'Heat Stress',
    confidence: 0.92,
    severity: 'high',
    action: 'Increase irrigation. Provide shade if possible. Monitor closely.',
    false_positive_prevention: 'Prevents misdiagnosis as disease',
    icon: '🌡️',
    color: '#f97316'
  },
  
  {
    id: 'preventive_risk_high_humidity',
    vision_pattern: ['healthy'],
    sensor_conditions: {
      humidity: ['very_humid'],
      moisture: ['wet']
    },
    refined_diagnosis: 'High Disease Risk (Preventive Alert)',
    confidence: 0.75,
    severity: 'low',
    action: 'Monitor closely. Reduce irrigation. Improve ventilation. Consider preventive spray.',
    false_positive_prevention: 'Early warning based on conditions',
    icon: '⚠️',
    color: '#f59e0b'
  },
  
  {
    id: 'confirmed_healthy',
    vision_pattern: ['healthy'],
    sensor_conditions: {
      moisture: ['moderate', 'optimal'],
      temperature: ['optimal'],
      humidity: ['moderate', 'humid']
    },
    refined_diagnosis: 'Healthy (Confirmed)',
    confidence: 0.98,
    severity: 'none',
    action: 'Continue current care regimen. No intervention needed.',
    false_positive_prevention: 'Multi-modal confirmation',
    icon: '✅',
    color: '#10b981'
  },
  
  {
    id: 'overwatering',
    vision_pattern: ['yellow_leaves', 'wilting', 'root_issues'],
    sensor_conditions: {
      moisture: ['wet']
    },
    refined_diagnosis: 'Overwatering / Root Rot Risk',
    confidence: 0.88,
    severity: 'high',
    action: 'Stop irrigation immediately. Improve drainage. Check roots.',
    false_positive_prevention: 'Prevents confusion with disease',
    icon: '💦',
    color: '#3b82f6'
  },
  
  {
    id: 'cold_stress',
    vision_pattern: ['discoloration', 'stunted_growth'],
    sensor_conditions: {
      temperature: ['cold']
    },
    refined_diagnosis: 'Cold Stress',
    confidence: 0.80,
    severity: 'medium',
    action: 'Protect from cold. Wait for warmer weather before major actions.',
    false_positive_prevention: 'Identifies environmental cause',
    icon: '❄️',
    color: '#06b6d4'
  }
];

/**
 * Main Fusion Function
 * Combines vision detection with sensor data
 */
export function performFusion(visionDetection, sensorData) {
  // Handle missing data
  if (!visionDetection) {
    return {
      status: 'no_vision_data',
      message: 'No vision detection available',
      diagnosis: null
    };
  }
  
  if (!sensorData) {
    return {
      status: 'no_sensor_data',
      message: 'Sensor data unavailable - using vision only',
      diagnosis: {
        type: visionDetection.class_name,
        confidence: visionDetection.confidence,
        source: 'vision_only',
        action: 'Limited context - verify manually'
      }
    };
  }
  
  // Categorize sensor readings
  const sensorCategories = categorizeSensorData(sensorData);
  
  // Extract vision pattern
  const visionPattern = normalizeVisionClass(visionDetection.class_name);
  
  // Find matching fusion rules
  const matchedRules = FUSION_RULES.filter(rule => {
    // Check vision pattern match
    const visionMatch = rule.vision_pattern.includes(visionPattern);
    if (!visionMatch) return false;
    
    // Check sensor conditions match
    const moistureMatch = matchSensorCondition(
      sensorCategories.moisture.category,
      rule.sensor_conditions.moisture
    );
    
    const tempMatch = !rule.sensor_conditions.temperature ||
                      matchSensorCondition(
                        sensorCategories.temperature.category,
                        rule.sensor_conditions.temperature
                      );
    
    const humidityMatch = !rule.sensor_conditions.humidity ||
                          matchSensorCondition(
                            sensorCategories.humidity.category,
                            rule.sensor_conditions.humidity
                          );
    
    const phMatch = !rule.sensor_conditions.ph ||
                    matchSensorCondition(
                      sensorCategories.ph.category,
                      rule.sensor_conditions.ph
                    );
    
    return moistureMatch && tempMatch && humidityMatch && phMatch;
  });
  
  // Sort by confidence and get best match
  const bestMatch = matchedRules.sort((a, b) => b.confidence - a.confidence)[0];
  
  if (bestMatch) {
    return {
      status: 'fusion_success',
      message: 'Multimodal diagnosis complete',
      diagnosis: {
        ...bestMatch,
        vision_input: {
          class: visionDetection.class_name,
          confidence: visionDetection.confidence
        },
        sensor_input: {
          moisture: sensorCategories.moisture,
          temperature: sensorCategories.temperature,
          humidity: sensorCategories.humidity,
          ph: sensorCategories.ph
        },
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // No rule matched - return uncertain diagnosis
  return {
    status: 'uncertain',
    message: 'Conflicting signals - manual verification recommended',
    diagnosis: {
      refined_diagnosis: 'Uncertain - Multiple Factors',
      confidence: 0.50,
      severity: 'unknown',
      action: 'Manual inspection recommended. Vision and sensor data conflict.',
      vision_input: {
        class: visionDetection.class_name,
        confidence: visionDetection.confidence
      },
      sensor_input: sensorCategories,
      icon: '❓',
      color: '#6b7280'
    }
  };
}

/**
 * Normalize vision class names to standard patterns
 */
function normalizeVisionClass(className) {
  const normalized = className.toLowerCase();
  
  // Map disease names to symptom patterns
  if (normalized.includes('blight') || normalized.includes('spot')) {
    return 'spots';
  }
  if (normalized.includes('yellow') || normalized.includes('chlorosis')) {
    return 'yellow_leaves';
  }
  if (normalized.includes('wilt')) {
    return 'wilting';
  }
  if (normalized.includes('curl')) {
    return 'leaf_curl';
  }
  if (normalized.includes('healthy') || normalized.includes('normal')) {
    return 'healthy';
  }
  if (normalized.includes('brown')) {
    return 'browning';
  }
  if (normalized.includes('root')) {
    return 'root_issues';
  }
  
  // Default: use class name as pattern
  return normalized.replace(/[^a-z]/g, '_');
}

/**
 * Check if sensor value matches condition
 */
function matchSensorCondition(actual, expected) {
  if (!expected) return true;
  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }
  return actual === expected;
}

/**
 * Batch fusion for multiple detections
 */
export function performBatchFusion(detections, sensorData) {
  return detections.map(detection => {
    // Get first detection from frame (most confident)
    const primaryDetection = detection.detections?.[0];
    if (!primaryDetection) return null;
    
    const fusionResult = performFusion(primaryDetection, sensorData);
    
    return {
      frame_id: detection.frame_id,
      detection_id: detection.id,
      timestamp: detection.timestamp,
      ...fusionResult
    };
  }).filter(Boolean);
}

/**
 * Get fusion statistics
 */
export function getFusionStats(fusionResults) {
  const total = fusionResults.length;
  const successful = fusionResults.filter(r => r.status === 'fusion_success').length;
  const uncertain = fusionResults.filter(r => r.status === 'uncertain').length;
  const visionOnly = fusionResults.filter(r => r.status === 'no_sensor_data').length;
  
  // Count diagnosis types
  const diagnosisCounts = {};
  fusionResults.forEach(result => {
    if (result.diagnosis?.refined_diagnosis) {
      const diag = result.diagnosis.refined_diagnosis;
      diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
    }
  });
  
  return {
    total,
    successful,
    uncertain,
    visionOnly,
    fusionRate: ((successful / total) * 100).toFixed(1),
    diagnosisCounts,
    mostCommon: Object.entries(diagnosisCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  };
}
