/**
 * Report Data Aggregator
 * Collects and processes dashboard state for report generation
 * No Firebase queries - uses existing state only
 */

export function aggregateReportData({
  missionMetadata,
  detections,
  sensorData,
  sprayRecommendation,
  economicData,
  fusionResults,
  alerts,
  mapState
}) {
  if (!missionMetadata) {
    throw new Error('Mission metadata required');
  }

  // ========== DETECTION ANALYSIS ==========
  const totalDetections = detections?.length || 0;
  
  const severityBreakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  const diagnosisCounts = {};
  let totalConfidence = 0;

  if (fusionResults && fusionResults.length > 0) {
    fusionResults.forEach(result => {
      const severity = result.diagnosis?.severity || 'low';
      const diagnosis = result.diagnosis?.refined_diagnosis || 'Unknown';
      const confidence = result.diagnosis?.confidence || 0;

      // Count severity
      if (severity === 'critical') severityBreakdown.critical++;
      else if (severity === 'high') severityBreakdown.high++;
      else if (severity === 'medium') severityBreakdown.medium++;
      else severityBreakdown.low++;

      // Count diagnosis
      diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;

      // Accumulate confidence
      totalConfidence += confidence;
    });
  }

  // Calculate top diagnosis
  const topDiagnosis =
    Object.entries(diagnosisCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'No detections';

  // Calculate average confidence
  const averageConfidence = fusionResults?.length > 0
    ? Math.round((totalConfidence / fusionResults.length) * 100)
    : 0;

  // Calculate affected area percentage
  const affectedAreaHa = economicData?.affectedAreaHectares || 0;
  const fieldAreaHa = missionMetadata?.fieldAreaHectares || 1;
  const affectedPercentage = fieldAreaHa > 0
    ? ((affectedAreaHa / fieldAreaHa) * 100).toFixed(1)
    : 0;

  // ========== MISSION DURATION ==========
  const missionStart = new Date(missionMetadata.missionStart);
  const missionEnd = new Date(missionMetadata.missionEnd || new Date());
  const missionDurationMs = missionEnd - missionStart;
  const missionDurationMin = Math.round(missionDurationMs / 60000);

  // ========== ENVIRONMENTAL ASSESSMENT ==========
  const temperature = sensorData?.air_temperature ?? sensorData?.soil_temperature ?? null;
  const humidity = sensorData?.air_humidity;
  const soilMoisture = sensorData?.soil_moisture;
  const ph = sensorData?.soil_ph;

  // Risk assessment based on conditions
  const riskFactors = [];
  if (humidity && humidity > 85) riskFactors.push('High humidity (disease risk)');
  if (soilMoisture && soilMoisture > 75) riskFactors.push('High soil moisture (waterlogging risk)');
  if (temperature && temperature > 35) riskFactors.push('High temperature (heat stress)');
  if (temperature && temperature < 5) riskFactors.push('Low temperature (cold stress)');
  if (ph && (ph < 6.0 || ph > 7.5)) riskFactors.push('pH imbalance');

  // ========== ECONOMIC CALCULATIONS ==========
  const cropLossUntreated = economicData?.cropLossUntreated || 0;
  const treatmentCost = economicData?.treatmentCost || 0;
  const expectedSavings = economicData?.expectedSavings || cropLossUntreated - treatmentCost;
  const roi = treatmentCost > 0
    ? Math.round(((expectedSavings - treatmentCost) / treatmentCost) * 100)
    : expectedSavings > 0 ? 100 : 0;

  // ========== SPRAY PLANNING ==========
  const pathLength = mapState?.sprayPath?.length || 0;
  const spray = {
    recommendation: sprayRecommendation,
    pathLength,
    estimatedTime: sprayRecommendation?.estimatedTime || '2-3 hours',
    coverageArea: affectedAreaHa
  };

  // ========== ALERTS PROCESSING ==========
  const processedAlerts = (alerts || [])
    .slice(0, 10)
    .map(alert => ({
      ...alert,
      severity: alert.severity || 'medium',
      title: alert.title || 'Alert',
      message: alert.message || '',
      recommendation: alert.recommendation || 'Review details'
    }));

  // ========== DETECTION DETAILS TABLE ==========
  const detailsTable = (fusionResults || [])
    .slice(0, 50)
    .map((result, idx) => ({
      index: idx + 1,
      diagnosis: result.diagnosis?.refined_diagnosis || 'Unknown',
      severity: result.diagnosis?.severity || 'unknown',
      confidence: Math.round((result.diagnosis?.confidence || 0) * 100),
      visionConfidence: Math.round((result.vision_input?.confidence || 0) * 100),
      location: result.location || 'N/A'
    }));

  // ========== RETURN AGGREGATED DATA ==========
  return {
    // Metadata
    missionMetadata,
    missionDuration: missionDurationMin,

    // Detection Summary
    detections: {
      total: totalDetections,
      affected: affectedAreaHa,
      affectedPercentage,
      topDiagnosis,
      averageConfidence,
      severityBreakdown,
      diagnosisCounts
    },

    // Environmental Data
    environmental: {
      temperature: temperature !== null ? temperature : 'N/A',
      humidity: humidity !== null ? humidity : 'N/A',
      soilMoisture: soilMoisture !== null ? soilMoisture : 'N/A',
      soilTemperature: sensorData?.soil_temperature || 'N/A',
      ph: ph !== null ? ph : 'N/A',
      riskFactors,
      timestamp: sensorData?.timestamp || new Date().toISOString()
    },

    // Spray Recommendations
    spray,

    // Economic Data
    economic: {
      cropLossUntreated,
      treatmentCost,
      expectedSavings,
      roi,
      affectedAreaHectares: affectedAreaHa
    },

    // Alerts
    alerts: processedAlerts,

    // Detailed Detections
    detailsTable,

    // Report Metadata
    reportMetadata: {
      generatedAt: new Date().toISOString(),
      systemVersion: '1.0',
      dataSource: 'Firebase Realtime DB + Edge AI Vision'
    }
  };
}
