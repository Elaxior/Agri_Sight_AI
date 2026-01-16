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
 * Compare cost of system vs. benefits
 */
export function calculateROI(financialData, interventionCosts, yieldData) {
  const { precision, blanket, savings } = interventionCosts;
  const { moneySavedByTreatment } = financialData;
  
  // Cost of our precision system (per application)
  const systemCost = precision.totalCost;
  
  // Benefits:
  // 1. Yield protection value
  const yieldProtectionValue = yieldData.yieldSavedByTreatment * ECONOMIC_CONFIG.crop.pricePerKg;
  
  // 2. Chemical cost savings (vs blanket)
  const chemicalCostSavings = savings.costSavings;
  
  // Total benefit
  const totalBenefit = yieldProtectionValue + chemicalCostSavings;
  
  // Net profit (benefit - cost)
  const netProfit = totalBenefit - systemCost;
  
  // ROI multiplier
  const roiMultiplier = totalBenefit / systemCost;
  
  // ROI percentage
  const roiPercentage = ((totalBenefit - systemCost) / systemCost) * 100;
  
  // === SEASONAL ANALYSIS ===
  const { applicationsPerSeason } = ECONOMIC_CONFIG.intervention;
  const seasonalSystemCost = systemCost * applicationsPerSeason;
  const seasonalBenefit = totalBenefit * applicationsPerSeason;
  const seasonalNetProfit = seasonalBenefit - seasonalSystemCost;
  
  // === BREAK-EVEN ===
  // How many applications to break even?
  const breakEvenApplications = systemCost / totalBenefit;
  
  return {
    perApplication: {
      systemCost,
      yieldProtectionValue,
      chemicalCostSavings,
      totalBenefit,
      netProfit,
      roiMultiplier,
      roiPercentage
    },
    seasonal: {
      applications: applicationsPerSeason,
      totalCost: seasonalSystemCost,
      totalBenefit: seasonalBenefit,
      netProfit: seasonalNetProfit,
      roiMultiplier: seasonalBenefit / seasonalSystemCost,
      roiPercentage: ((seasonalBenefit - seasonalSystemCost) / seasonalSystemCost) * 100
    },
    breakEven: {
      applications: Math.ceil(breakEvenApplications),
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
