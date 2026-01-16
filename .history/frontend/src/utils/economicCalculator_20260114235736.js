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
