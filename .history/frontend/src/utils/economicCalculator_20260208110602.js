/**
 * Economic Impact Calculator
 * Converts detection data into financial metrics
 */

import { ECONOMIC_CONFIG, formatCurrency, formatPercentage, formatWeight } from './economicConfig';

/**
 * STEP 1: Calculate Field Areas
 * 
 * Input: Grid data with infected cells
 * Output: Area breakdown
 */
export function calculateAreas(gridStats) {
  const { totalCells, infectedCount } = gridStats;
  const { totalAreaHectares, cellAreaHectares } = ECONOMIC_CONFIG.field;
  
  // Total field area (already known)
  const totalArea = totalAreaHectares;
  
  // Infected area = infected cells × area per cell
  const infectedArea = infectedCount * cellAreaHectares;
  
  // Healthy area = total - infected
  const healthyArea = totalArea - infectedArea;
  
  // Infection percentage
  const infectionPercentage = (infectedCount / totalCells) * 100;
  
  return {
    totalArea,           // e.g., 2.0 hectares
    infectedArea,        // e.g., 0.5 hectares (25 cells)
    healthyArea,         // e.g., 1.5 hectares (75 cells)
    infectionPercentage, // e.g., 25%
    infectedCells: infectedCount,
    totalCells
  };
}

/**
 * STEP 2: Calculate Yield Loss (Physical)
 * 
 * Input: Area data
 * Output: Yield in kg
 */
export function calculateYieldLoss(areas) {
  const { yieldPerHectare } = ECONOMIC_CONFIG.crop;
  const { lossPercentageUntreated, lossPercentageTreated } = ECONOMIC_CONFIG.disease;
  const { infectedArea, healthyArea, totalArea } = areas;
  
  // Expected yield from healthy area (no loss)
  const healthyYield = healthyArea * yieldPerHectare;
  
  // Expected yield from infected area (if healthy)
  const potentialInfectedYield = infectedArea * yieldPerHectare;
  
  // === SCENARIO 1: No Treatment (worst case) ===
  const yieldLossUntreated = potentialInfectedYield * (lossPercentageUntreated / 100);
  const actualYieldUntreated = potentialInfectedYield - yieldLossUntreated;
  const totalYieldUntreated = healthyYield + actualYieldUntreated;
  
  // === SCENARIO 2: With Treatment (precision spraying) ===
  const yieldLossTreated = potentialInfectedYield * (lossPercentageTreated / 100);
  const actualYieldTreated = potentialInfectedYield - yieldLossTreated;
  const totalYieldTreated = healthyYield + actualYieldTreated;
  
  // === SCENARIO 3: Perfect (no infection) ===
  const perfectYield = totalArea * yieldPerHectare;
  
  // Yield saved by treatment
  const yieldSavedByTreatment = totalYieldTreated - totalYieldUntreated;
  
  return {
    perfectYield,              // e.g., 100,000 kg (2 ha × 50,000 kg/ha)
    yieldLossUntreated,        // e.g., 8,000 kg lost (0.5 ha × 50k × 40% × 0.4)
    totalYieldUntreated,       // e.g., 92,000 kg
    yieldLossTreated,          // e.g., 2,000 kg lost (0.5 ha × 50k × 40% × 0.08)
    totalYieldTreated,         // e.g., 98,000 kg
    yieldSavedByTreatment,     // e.g., 6,000 kg saved
    healthyYield,              // e.g., 75,000 kg from healthy 1.5 ha
    potentialInfectedYield     // e.g., 25,000 kg if infected area was healthy
  };
}

/**
 * STEP 3: Calculate Financial Loss
 * 
 * Input: Yield data
 * Output: Money lost
 */
export function calculateFinancialLoss(yieldData) {
  const { pricePerKg } = ECONOMIC_CONFIG.crop;
  
  // Revenue with perfect health
  const perfectRevenue = yieldData.perfectYield * pricePerKg;
  
  // Revenue if no treatment
  const revenueUntreated = yieldData.totalYieldUntreated * pricePerKg;
  
  // Revenue with treatment
  const revenueTreated = yieldData.totalYieldTreated * pricePerKg;
  
  // Financial loss (compared to perfect)
  const financialLossUntreated = perfectRevenue - revenueUntreated;
  const financialLossTreated = perfectRevenue - revenueTreated;
  
  // Money saved by treating
  const moneySavedByTreatment = revenueUntreated - revenueTreated;
  
  return {
    perfectRevenue,              // e.g., ₹25,00,000 (100,000 kg × ₹25)
    revenueUntreated,            // e.g., ₹23,00,000
    revenueTreated,              // e.g., ₹24,50,000
    financialLossUntreated,      // e.g., ₹2,00,000 lost
    financialLossTreated,        // e.g., ₹50,000 lost
    moneySavedByTreatment        // e.g., ₹1,50,000 saved
  };
}


/**
 * STEP 4: Calculate Intervention Costs
 * 
 * Compare precision spraying vs. blanket spraying
 */
export function calculateInterventionCosts(areas) {
  const { costPerHectare, fixedCostPerMission } = ECONOMIC_CONFIG.intervention;
  const { infectedArea, totalArea } = areas;
  
  // === PRECISION SPRAYING (Our System) ===
  // Only spray infected zones
  const precisionVariableCost = infectedArea * costPerHectare;
  const precisionTotalCost = fixedCostPerMission + precisionVariableCost;
  
  // === BLANKET SPRAYING (Traditional) ===
  // Spray entire field
  const blanketVariableCost = totalArea * costPerHectare;
  const blanketTotalCost = fixedCostPerMission + blanketVariableCost;
  
  // === SAVINGS ===
  const costSavings = blanketTotalCost - precisionTotalCost;
  const savingsPercentage = (costSavings / blanketTotalCost) * 100;
  
  // === CHEMICAL USAGE ===
  const { chemicalPerHectare } = ECONOMIC_CONFIG.environmental;
  const precisionChemicalUsage = infectedArea * chemicalPerHectare;
  const blanketChemicalUsage = totalArea * chemicalPerHectare;
  const chemicalSaved = blanketChemicalUsage - precisionChemicalUsage;
  const chemicalSavingsPercentage = (chemicalSaved / blanketChemicalUsage) * 100;
  
  return {
    precision: {
      fixedCost: fixedCostPerMission,
      variableCost: precisionVariableCost,
      totalCost: precisionTotalCost,
      chemicalUsage: precisionChemicalUsage
    },
    blanket: {
      fixedCost: fixedCostPerMission,
      variableCost: blanketVariableCost,
      totalCost: blanketTotalCost,
      chemicalUsage: blanketChemicalUsage
    },
    savings: {
      costSavings,
      savingsPercentage,
      chemicalSaved,
      chemicalSavingsPercentage
    }
  };
}
/**
 * STEP 5: Calculate Return on Investment (ROI)
 * 
 * Compare precision treatment vs. doing nothing
 * Show additional savings vs. blanket spray separately
 */
export function calculateROI(financialData, interventionCosts, yieldData) {
  const { precision, blanket, savings } = interventionCosts;
  
  // Cost of our precision system (per application)
  const systemCost = precision.totalCost;
  
  // PRIMARY COMPARISON: Precision vs Doing Nothing
  // Benefit = yield protected by treating
  const yieldProtectionValue = yieldData.yieldSavedByTreatment * ECONOMIC_CONFIG.crop.pricePerKg;
  
  // Net benefit = yield value saved - treatment cost
  const netBenefit = yieldProtectionValue - systemCost;
  
  // ROI vs doing nothing
  const roiMultiplier = netBenefit / systemCost;
  const roiPercentage = (netBenefit / systemCost) * 100;
  
  // SECONDARY COMPARISON: Precision vs Blanket (for reference)
  // Both give same yield benefit, but precision costs less
  const costSavingsVsBlanket = savings.costSavings;
  
  // === SEASONAL ANALYSIS ===
  const { applicationsPerSeason } = ECONOMIC_CONFIG.intervention;
  const seasonalSystemCost = systemCost * applicationsPerSeason;
  const seasonalBenefit = netBenefit * applicationsPerSeason;
  const seasonalSavingsVsBlanket = costSavingsVsBlanket * applicationsPerSeason;
  
  // === BREAK-EVEN ===
  // How many applications to break even? (should be < 1 for profitable investment)
  const breakEvenApplications = systemCost / yieldProtectionValue;
  
  return {
    perApplication: {
      systemCost,
      yieldProtectionValue,
      netBenefit,
      roiMultiplier,
      roiPercentage,
      // Separate comparison vs blanket
      costSavingsVsBlanket,
      blanketCost: blanket.totalCost
    },
    seasonal: {
      applications: applicationsPerSeason,
      totalCost: seasonalSystemCost,
      totalBenefit: yieldProtectionValue * applicationsPerSeason,
      netBenefit: seasonalBenefit,
      savingsVsBlanket: seasonalSavingsVsBlanket,
      roiMultiplier: seasonalBenefit / seasonalSystemCost,
      roiPercentage: (seasonalBenefit / seasonalSystemCost) * 100
    },
    breakEven: {
      applications: breakEvenApplications,
      message: breakEvenApplications < 1 
        ? 'Profitable from first application'
        : `Break-even after ${Math.ceil(breakEvenApplications)} applications`
    }
  };
}

/**
 * MASTER FUNCTION: Calculate Complete Economic Impact
 * 
 * Input: Grid stats from path planning
 * Output: Complete economic analysis
 */
export function calculateEconomicImpact(gridStats) {
  // Edge case: No detections
  if (!gridStats || gridStats.infectedCount === 0) {
    return {
      hasInfection: false,
      message: 'No disease detected - field is healthy! 🎉',
      areas: null,
      yieldData: null,
      financialData: null,
      interventionCosts: null,
      roi: null
    };
  }
  
  // Edge case: 100% infection (critical)
  if (gridStats.infectedCount === gridStats.totalCells) {
    console.warn('⚠️ Entire field is infected - immediate action required!');
  }
  
  // Step 1: Areas
  const areas = calculateAreas(gridStats);
  
  // Step 2: Yield
  const yieldData = calculateYieldLoss(areas);
  
  // Step 3: Financial
  const financialData = calculateFinancialLoss(yieldData);
  
  // Step 4: Intervention costs
  const interventionCosts = calculateInterventionCosts(areas);
  
  // Step 5: ROI
  const roi = calculateROI(financialData, interventionCosts, yieldData);
  
  return {
    hasInfection: true,
    message: `${areas.infectedCells} zones infected (${areas.infectionPercentage.toFixed(1)}% of field)`,
    areas,
    yieldData,
    financialData,
    interventionCosts,
    roi,
    timestamp: new Date().toISOString()
  };
}
/**
 * Generate Summary Metrics for Dashboard Display
 */
export function generateSummaryMetrics(economicImpact) {
  if (!economicImpact.hasInfection) {
    return {
      primaryMetrics: [
        { label: 'Field Status', value: 'Healthy', icon: '✅', color: 'success' },
        { label: 'Action Required', value: 'None', icon: '🎉', color: 'success' }
      ],
      secondaryMetrics: []
    };
  }
  
  const { areas, interventionCosts, roi } = economicImpact;
  
  return {
    primaryMetrics: [
      {
        label: 'Estimated Loss (No Action)',
        value: formatCurrency(economicImpact.financialData.financialLossUntreated),
        icon: '⚠️',
        color: 'danger',
        subtitle: `${formatWeight(economicImpact.yieldData.yieldLossUntreated)} yield loss`
      },
      {
        label: 'Precision Treatment Cost',
        value: formatCurrency(interventionCosts.precision.totalCost),
        icon: '💰',
        color: 'primary',
        subtitle: `Only ${formatPercentage(areas.infectionPercentage)} of field`
      },
      {
        label: 'Net Benefit After Treatment',
        value: formatCurrency(roi.perApplication.netBenefit),
        icon: '💵',
        color: 'success',
        subtitle: `Revenue gained minus treatment cost`
      },
      {
        label: 'Return on Investment (ROI)',
        value: `${roi.perApplication.roiMultiplier.toFixed(1)}×`,
        icon: '📈',
        color: 'success',
        subtitle: `Invest ₹${Math.round(roi.perApplication.systemCost).toLocaleString('en-IN')}, gain ₹${Math.round(roi.perApplication.netBenefit).toLocaleString('en-IN')}`
      }
    ],
    
    secondaryMetrics: [
      {
        label: 'Cost vs Traditional',
        value: formatCurrency(roi.perApplication.costSavingsVsBlanket),
        detail: `${formatPercentage(interventionCosts.savings.savingsPercentage)} cheaper than blanket spray`
      },
      {
        label: 'Seasonal Net Benefit',
        value: formatCurrency(roi.seasonal.netBenefit),
        detail: `${roi.seasonal.applications} applications per season`
      },
      {
        label: 'Infected Area',
        value: `${areas.infectedArea.toFixed(2)} ha`,
        detail: `${areas.infectedCells} zones`
      },
      {
        label: 'Break-Even',
        value: roi.breakEven.message,
        detail: 'Immediate profitability'
      }
    ],
    
    comparison: {
      traditional: {
        cost: interventionCosts.blanket.totalCost,
        chemical: interventionCosts.blanket.chemicalUsage
      },
      precision: {
        cost: interventionCosts.precision.totalCost,
        chemical: interventionCosts.precision.chemicalUsage
      },
      savings: interventionCosts.savings
    }
  };
}

/**
 * Calculate ROI with fusion intelligence
 * Accounts for reduced false positives and targeted actions
 */
export function calculateFusionEnhancedROI(gridStats, sensorData, fusionResults) {
  // Base calculation (from Part 8)
  const baseImpact = calculateEconomicImpact(gridStats);
  
  if (!fusionResults || fusionResults.length === 0) {
    return baseImpact; // Fallback to vision-only
  }
  
  // Count diagnosis types
  const diagnosisCounts = {
    disease: 0,
    environmental: 0, // drought, heat, cold
    preventive: 0,
    healthy: 0
  };
  
  fusionResults.forEach(result => {
    const diagnosis = result.diagnosis?.refined_diagnosis?.toLowerCase() || '';
    
    if (diagnosis.includes('fungal') || diagnosis.includes('infection')) {
      diagnosisCounts.disease++;
    } else if (diagnosis.includes('drought') || diagnosis.includes('heat') || diagnosis.includes('cold')) {
      diagnosisCounts.environmental++;
    } else if (diagnosis.includes('risk')) {
      diagnosisCounts.preventive++;
    } else if (diagnosis.includes('healthy')) {
      diagnosisCounts.healthy++;
    }
  });
  
  // Recalculate costs based on actual needs
  const diseaseZones = diagnosisCounts.disease;
  const environmentalZones = diagnosisCounts.environmental;
  
  // Chemical spray only for disease zones
  const chemicalCost = diseaseZones * ECONOMIC_CONFIG.field.cellAreaHectares * 
                       ECONOMIC_CONFIG.intervention.costPerHectare;
  
  // Irrigation for environmental stress (cheaper than chemicals)
  const irrigationCost = environmentalZones * ECONOMIC_CONFIG.field.cellAreaHectares * 
                         (ECONOMIC_CONFIG.intervention.costPerHectare * 0.3); // 30% of spray cost
  
  const totalFusionCost = chemicalCost + irrigationCost + 
                          ECONOMIC_CONFIG.intervention.fixedCostPerMission;
  
  // False positive savings
  const visionOnlyWouldSpray = gridStats.infectedCount;
  const fusionActuallyNeeds = diseaseZones;
  const falsePositivesAvoided = visionOnlyWouldSpray - fusionActuallyNeeds;
  const falsePositiveSavings = falsePositivesAvoided * 
                               ECONOMIC_CONFIG.field.cellAreaHectares * 
                               ECONOMIC_CONFIG.intervention.costPerHectare;
  
  return {
    ...baseImpact,
    fusionEnhanced: true,
    diagnosisCounts,
    costs: {
      chemicalSpray: chemicalCost,
      irrigation: irrigationCost,
      total: totalFusionCost,
      visionOnly: baseImpact.interventionCosts.precisionSpray.totalCost,
      fusionSavings: baseImpact.interventionCosts.precisionSpray.totalCost - totalFusionCost
    },
    falsePositives: {
      avoided: falsePositivesAvoided,
      savings: falsePositiveSavings,
      percentage: ((falsePositivesAvoided / visionOnlyWouldSpray) * 100).toFixed(1)
    },
    roi: {
      ...baseImpact.roi,
      fusionBonus: falsePositiveSavings,
      enhancedROI: (baseImpact.roi.perApplication.netProfit + falsePositiveSavings) / totalFusionCost
    }
  };
}
