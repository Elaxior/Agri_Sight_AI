/**
 * Economic Configuration for ROI Calculations
 * All values are approximate and configurable
 */

export const ECONOMIC_CONFIG = {
  // === FIELD CHARACTERISTICS ===
  field: {
    // Total field size (hectares)
    // 1 hectare = 10,000 m² = 2.47 acres
    totalAreaHectares: 2.0,
    
    // Grid configuration (must match fieldGrid.js)
    gridRows: 10,
    gridCols: 10,
    totalCells: 100,
    
    // Area per grid cell (hectares)
    cellAreaHectares: 0.02  // 2 hectares / 100 cells = 0.02 ha/cell
  },

  // === CROP PARAMETERS ===
  crop: {
    // Crop type (for display)
    type: 'Tomato',
    
    // Expected yield per hectare (kg/ha) - healthy crop
    // Tomato: 40,000-60,000 kg/ha typical
    // Using conservative 50,000 kg/ha
    yieldPerHectare: 50000,
    
    // Market price per kg (₹ or $)
    // Tomato: ₹15-30/kg typical farm gate price
    // Using ₹25/kg mid-range
    pricePerKg: 25,
    
    // Currency symbol and name
    currency: {
      symbol: '₹',
      code: 'INR',
      name: 'Indian Rupee'
    }
  },

  // === DISEASE IMPACT ===
  disease: {
    // Yield loss percentage per infected cell (if untreated)
    // Early blight/late blight: 30-50% loss typical
    // Using 40% as conservative estimate
    lossPercentageUntreated: 40,
    
    // Yield loss percentage if treated promptly
    // Early intervention can limit loss to 5-10%
    lossPercentageTreated: 8,
    
    // Spread rate (for future use - predictive modeling)
    spreadRatePerWeek: 15  // % of adjacent cells infected per week
  },

  // === INTERVENTION COSTS ===
  intervention: {
    // Cost of pesticide/fungicide per hectare (₹/ha)
    // Includes: chemical cost + drone operation + labor
    // Typical: ₹2000-4000/ha for drone spraying
    costPerHectare: 3000,
    
    // Fixed cost per spray mission (₹)
    // Drone setup, calibration, pilot
    fixedCostPerMission: 500,
    
    // Efficacy of treatment (% of yield loss prevented)
    // Good fungicide applied early: 80-90% effective
    efficacy: 85,
    
    // Application frequency (times per season)
    applicationsPerSeason: 3
  },

  // === TRADITIONAL FARMING COMPARISON ===
  traditional: {
    // Blanket spraying: spray entire field regardless of infection
    sprayEntireField: true,
    
    // Detection delay (days) - time to notice and act
    // Manual scouting: 7-14 days typical
    detectionDelayDays: 10,
    
    // By the time farmer notices, infection has spread
    // Assume 2× infected area due to detection delay
    spreadMultiplier: 2.0
  },

  // === ENVIRONMENTAL IMPACT (BONUS) ===
  environmental: {
    // Chemical usage per hectare (liters)
    chemicalPerHectare: 15,
    
    // Environmental cost per liter (externality)
    // Soil degradation, water contamination, bee deaths
    environmentalCostPerLiter: 50
  }
};

/**
 * Helper function to get configuration
 * Allows override for testing/customization
 */
export function getEconomicConfig(overrides = {}) {
  return {
    ...ECONOMIC_CONFIG,
    ...overrides
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount, config = ECONOMIC_CONFIG) {
  const { symbol, code } = config.crop.currency;
  
  // Round to nearest integer
  const rounded = Math.round(amount);
  
  // Add thousand separators (Indian style: 1,00,000)
  const formatted = rounded.toLocaleString('en-IN');
  
  return `${symbol}${formatted}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format weight for display
 */
export function formatWeight(kg) {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes`;
  }
  return `${Math.round(kg)} kg`;
}
