/**
 * Decision Rules Configuration
 * Centralized rule definitions for alert system
 */

export const DECISION_RULES = [
  
  // === CRITICAL RULES (Priority 1) ===
  
  {
    id: 'RULE_001',
    name: 'Critical Infection Outbreak',
    priority: 1,
    condition: (signals) => {
      return signals.infectionPercentage > 25 &&
             (signals.fusionSeverity === 'high' || signals.fusionSeverity === 'medium');
    },
    alert: {
      type: 'CRITICAL',
      title: '🚨 Disease Outbreak Detected',
      message: (signals) => 
        `${signals.infectionPercentage.toFixed(1)}% of field infected. Disease spreading rapidly.`,
      action: 'Apply appropriate fungicide/pesticide within 24 hours. Target infected zones first.',
      timeline: '0-24 hours',
      estimatedLoss: (signals) => signals.potentialLoss,
      icon: '🚨'
    }
  },
  
  {
    id: 'RULE_003',
    name: 'Critical Drought Stress',
    priority: 1,
    condition: (signals) => {
      return signals.soilMoisture < 20 || 
             (signals.fusionDiagnosis && signals.fusionDiagnosis.toLowerCase().includes('drought'));
    },
    alert: {
      type: 'CRITICAL',
      title: '💧 Severe Drought Detected',
      message: (signals) => 
        `Soil moisture critically low (${signals.soilMoisture.toFixed(1)}%). Plants under severe stress.`,
      action: 'Irrigate immediately. Do NOT apply chemicals until soil moisture restored to 40%+.',
      timeline: '0-12 hours',
      icon: '💧',
      preventMistake: 'Prevents misdiagnosis as disease - saves unnecessary chemical costs'
    }
  },
  
  {
    id: 'RULE_007',
    name: 'High Economic Risk',
    priority: 1,
    condition: (signals) => {
      return signals.potentialLoss > 100000 && signals.infectionPercentage > 15;
    },
    alert: {
      type: 'CRITICAL',
      title: '💸 High Economic Risk',
      message: (signals) => 
        `Potential loss: ₹${(signals.potentialLoss / 1000).toFixed(0)}k if untreated.`,
      action: 'Immediate intervention economically justified. Apply treatment within 24 hours.',
      timeline: '0-24 hours',
      icon: '💸'
    }
  },
  
  {
    id: 'RULE_008',
    name: 'Rapid Infection Growth',
    priority: 1,
    condition: (signals) => {
      return signals.infectionGrowthRate > 2.0;
    },
    alert: {
      type: 'CRITICAL',
      title: '📈 Rapid Disease Spread',
      message: (signals) => 
        `Infection spreading at ${signals.infectionGrowthRate.toFixed(1)}% per hour.`,
      action: 'Immediate containment required. Apply treatment to infected zones. Consider quarantine.',
      timeline: '0-12 hours',
      icon: '📈'
    }
  },
  
  // === WARNING RULES (Priority 2) ===
  
  {
    id: 'RULE_002',
    name: 'Moderate Infection Warning',
    priority: 2,
    condition: (signals) => {
      return signals.infectionPercentage >= 10 && 
             signals.infectionPercentage <= 25 &&
             signals.fusionSeverity !== 'none';
    },
    alert: {
      type: 'WARNING',
      title: '⚠️ Infection Spreading',
      message: (signals) => 
        `${signals.infectionPercentage.toFixed(1)}% of field affected. Monitor closely.`,
      action: 'Prepare treatment equipment. Verify diagnosis. Schedule spray within 48 hours.',
      timeline: '24-48 hours',
      icon: '⚠️'
    }
  },
  
  {
    id: 'RULE_004',
    name: 'Heat Stress Alert',
    priority: 2,
    condition: (signals) => {
      return signals.soilTemperature > 35 || 
             (signals.fusionDiagnosis && signals.fusionDiagnosis.toLowerCase().includes('heat'));
    },
    alert: {
      type: 'WARNING',
      title: '🌡️ Heat Stress Risk',
      message: (signals) => 
        `Soil temperature ${signals.soilTemperature.toFixed(1)}°C exceeds safe threshold (35°C).`,
      action: 'Increase irrigation frequency. Monitor for wilting. Avoid spraying in peak heat.',
      timeline: '12-24 hours',
      icon: '🌡️'
    }
  },
  
  {
    id: 'RULE_005',
    name: 'Fungal Outbreak Risk',
    priority: 2,
    condition: (signals) => {
      return (signals.airHumidity > 85 && signals.soilMoisture > 70) ||
             (signals.fusionDiagnosis && signals.fusionDiagnosis.toLowerCase().includes('fungal'));
    },
    alert: {
      type: 'WARNING',
      title: '💨 High Fungal Risk',
      message: (signals) => 
        `Humidity ${signals.airHumidity.toFixed(0)}% + soil moisture ${signals.soilMoisture.toFixed(0)}% creates ideal fungal conditions.`,
      action: 'Apply preventive fungicide. Reduce irrigation frequency. Improve field drainage.',
      timeline: '24-48 hours',
      icon: '💨'
    }
  },
  
  {
    id: 'RULE_006',
    name: 'Low ROI Warning',
    priority: 2,
    condition: (signals) => {
      return signals.roiRatio > 0 && signals.roiRatio < 2 && signals.infectionPercentage < 15;
    },
    alert: {
      type: 'WARNING',
      title: '💰 Low ROI - Verify Before Action',
      message: (signals) => 
        `ROI only ${signals.roiRatio.toFixed(1)}×. Treatment cost may exceed benefit.`,
      action: 'DO NOT spray yet. Monitor for 24 hours. Consider spot treatment in worst zones only.',
      timeline: 'Monitor 24-48h',
      icon: '💰',
      savingsPotential: 'Prevents unnecessary spending on marginal cases'
    }
  },
  
  // === INFO RULES (Priority 4-5) ===
  
  {
    id: 'RULE_010',
    name: 'Early Detection - Preventive Action',
    priority: 4,
    condition: (signals) => {
      return signals.infectionPercentage >= 3 && 
             signals.infectionPercentage < 10 &&
             signals.fusionConfidence > 0.7;
    },
    alert: {
      type: 'INFO',
      title: '🛡️ Early Detection - Preventive Opportunity',
      message: (signals) => 
        `${signals.infectionPercentage.toFixed(1)}% infection detected early. Ideal time for low-cost prevention.`,
      action: 'Consider spot treatment in affected zones only. Continue monitoring unaffected areas.',
      timeline: '48-72 hours',
      icon: '🛡️',
      benefit: 'Early intervention prevents escalation and reduces treatment costs by 60%'
    }
  },
  
  {
    id: 'RULE_009',
    name: 'System Healthy',
    priority: 5,
    condition: (signals) => {
      return signals.infectionPercentage < 5 &&
             signals.soilMoisture >= 40 && signals.soilMoisture <= 70 &&
             signals.soilTemperature >= 20 && signals.soilTemperature <= 32 &&
             (signals.fusionDiagnosis && signals.fusionDiagnosis.toLowerCase().includes('healthy'));
    },
    alert: {
      type: 'INFO',
      title: '✅ Field Health Excellent',
      message: 'All environmental and disease metrics within optimal range.',
      action: 'Continue current care regimen. Routine monitoring sufficient.',
      timeline: 'N/A',
      icon: '✅'
    }
  }
  
];
