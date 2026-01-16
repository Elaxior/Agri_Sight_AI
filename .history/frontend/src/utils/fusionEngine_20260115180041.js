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
  // DEFENSIVE CHECK: Handle missing or invalid vision detection
  if (!visionDetection) {
    return {
      status: 'no_vision_data',
      message: 'No vision detection available',
      diagnosis: null
    };
  }
  
  // DEFENSIVE CHECK: Extract class name with multiple fallbacks
  const className = visionDetection.class_name || 
                    visionDetection.className || 
                    visionDetection.class || 
                    visionDetection.label ||
                    'unknown';
  
  const confidence = visionDetection.confidence || 0.5;
  
  // Handle missing sensor data
  if (!sensorData) {
    return {
      status: 'no_sensor_data',
      message: 'Sensor data unavailable - using vision only',
      diagnosis: {
        type: className,
        confidence: confidence,
        source: 'vision_only',
        action: 'Limited context - verify manually'
      }
    };
  }
  
  // Categorize sensor readings
  const sensorCategories = categorizeSensorData(sensorData);
  
  // Extract vision pattern (now safe with className guaranteed)
  const visionPattern = normalizeVisionClass(className);
  
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
          class: className,
          confidence: confidence
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
        class: className,
        confidence: confidence
      },
      sensor_input: sensorCategories,
      icon: '❓',
      color: '#6b7280'
    }
  };
}

/**
 * Normalize vision class names to standard patterns
 * NOW WITH DEFENSIVE CHECKS
 */
function normalizeVisionClass(className) {
  // DEFENSIVE CHECK: Handle undefined, null, or non-string values
  if (!className) {
    return 'unknown';
  }
  
  // DEFENSIVE CHECK: Ensure it's a string
  if (typeof className !== 'string') {
    return 'unknown';
  }
  
  // Safe to call toLowerCase now
  const normalized = className.toLowerCase().trim();
  
  // Handle empty string after trimming
  if (!normalized) {
    return 'unknown';
  }
  
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
  if (!detections || !Array.isArray(detections)) {
    return [];
  }
  
  return detections.map(detection => {
    // Handle both direct detection objects and nested detection arrays
    const primaryDetection = detection.detections?.[0] || detection;
    
    if (!primaryDetection) return null;
    
    try {
      const fusionResult = performFusion(primaryDetection, sensorData);
      
      return {
        frame_id: detection.frame_id || detection.id,
        detection_id: detection.id,
        timestamp: detection.timestamp || new Date().toISOString(),
        ...fusionResult
      };
    } catch (error) {
      console.error('Fusion error for detection:', detection, error);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Get fusion statistics
 */
export function getFusionStats(fusionResults) {
  if (!fusionResults || !Array.isArray(fusionResults) || fusionResults.length === 0) {
    return {
      total: 0,
      successful: 0,
      uncertain: 0,
      visionOnly: 0,
      fusionRate: '0.0',
      diagnosisCounts: {},
      mostCommon: 'None'
    };
  }
  
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
    fusionRate: total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0',
    diagnosisCounts,
    mostCommon: Object.entries(diagnosisCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  };
}

/**
 * Handle edge cases in fusion process
 */

// 1. MISSING SENSOR DATA
export function handleMissingSensorData(detection) {
  const className = detection?.class_name || 
                    detection?.className || 
                    detection?.class ||
                    'Unknown';
  
  const confidence = detection?.confidence || 0.5;
  
  return {
    status: 'sensor_unavailable',
    diagnosis: {
      refined_diagnosis: `${className} (Vision Only)`,
      confidence: confidence * 0.8, // Reduce confidence
      severity: 'uncertain',
      action: '⚠️ Sensor data unavailable. Manual verification recommended before action.',
      icon: '⚠️',
      color: '#f59e0b',
      limitation: 'Limited context without environmental data'
    }
  };
}

// 2. CONFLICTING SIGNALS
export function detectConflict(visionPattern, sensorCategories) {
  if (!visionPattern || !sensorCategories) {
    return { hasConflict: false };
  }
  
  // Example: Vision sees disease but all conditions are optimal
  if (visionPattern !== 'healthy' && 
      sensorCategories.moisture?.category === 'optimal' &&
      sensorCategories.temperature?.category === 'optimal' &&
      sensorCategories.humidity?.category === 'moderate') {
    return {
      hasConflict: true,
      message: 'Vision and sensor data conflict - possible edge case',
      recommendation: 'Manual inspection strongly recommended'
    };
  }
  
  // Vision sees healthy but extreme conditions
  if (visionPattern === 'healthy' &&
      (sensorCategories.moisture?.status === 'warning' ||
       sensorCategories.temperature?.status === 'warning')) {
    return {
      hasConflict: true,
      message: 'Plant appears healthy but stress conditions detected',
      recommendation: 'Monitor closely - early intervention may be needed'
    };
  }
  
  return { hasConflict: false };
}

// 3. EXTREME SENSOR VALUES
export function validateSensorData(sensorData) {
  if (!sensorData) {
    return {
      valid: false,
      errors: ['No sensor data provided'],
      warnings: [],
      status: 'error'
    };
  }
  
  const warnings = [];
  const errors = [];
  
  // Check for impossible values
  if (sensorData.soil_moisture < 0 || sensorData.soil_moisture > 100) {
    errors.push('Invalid soil moisture reading');
  }
  
  if (sensorData.soil_temperature < -10 || sensorData.soil_temperature > 60) {
    errors.push('Soil temperature out of realistic range');
  }
  
  if (sensorData.air_humidity < 0 || sensorData.air_humidity > 100) {
    errors.push('Invalid humidity reading');
  }
  
  // Check for extreme (but possible) values
  if (sensorData.soil_moisture < 10) {
    warnings.push('⚠️ Critically low soil moisture - immediate irrigation needed');
  }
  
  if (sensorData.soil_temperature > 45) {
    warnings.push('⚠️ Extreme heat detected - crop damage risk');
  }
  
  if (sensorData.air_humidity > 90) {
    warnings.push('⚠️ Very high humidity - disease outbreak risk');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    status: errors.length > 0 ? 'error' : 
            warnings.length > 0 ? 'warning' : 
            'normal'
  };
}

// 4. SENSOR TIMEOUT/STALE DATA
export function checkSensorFreshness(sensorData, maxAgeMinutes = 5) {
  if (!sensorData || !sensorData.timestamp) {
    return {
      fresh: false,
      ageMinutes: 0,
      warning: 'Sensor timestamp unavailable'
    };
  }
  
  const sensorTime = new Date(sensorData.timestamp);
  const now = new Date();
  const ageMinutes = (now - sensorTime) / 60000;
  
  if (ageMinutes > maxAgeMinutes) {
    return {
      fresh: false,
      ageMinutes: Math.round(ageMinutes),
      warning: `Sensor data is ${Math.round(ageMinutes)} minutes old. Readings may be stale.`
    };
  }
  
  return { fresh: true };
}

// Enhanced fusion with all edge case handling
export function performRobustFusion(visionDetection, sensorData) {
  // 1. Check vision detection validity
  if (!visionDetection) {
    return {
      status: 'error',
      error: 'No vision detection provided',
      diagnosis: null
    };
  }
  
  // 2. Check sensor availability
  if (!sensorData) {
    return handleMissingSensorData(visionDetection);
  }
  
  // 3. Validate sensor data
  const validation = validateSensorData(sensorData);
  if (!validation.valid) {
    return {
      status: 'sensor_error',
      errors: validation.errors,
      diagnosis: handleMissingSensorData(visionDetection).diagnosis
    };
  }
  
  // 4. Check data freshness
  const freshness = checkSensorFreshness(sensorData);
  
  // 5. Perform standard fusion
  const fusionResult = performFusion(visionDetection, sensorData);
  
  // 6. Check for conflicts
  const sensorCategories = categorizeSensorData(sensorData);
  const className = visionDetection.class_name || 
                    visionDetection.className || 
                    visionDetection.class ||
                    'unknown';
  const visionPattern = normalizeVisionClass(className);
  const conflict = detectConflict(visionPattern, sensorCategories);
  
  // 7. Enhance result with edge case info
  return {
    ...fusionResult,
    validation,
    freshness,
    conflict,
    warnings: [
      ...validation.warnings,
      ...(freshness.fresh ? [] : [freshness.warning]),
      ...(conflict.hasConflict ? [conflict.message] : [])
    ]
  };
}
