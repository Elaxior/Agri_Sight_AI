// utils/reportDataAggregator.js

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
  
  // Calculate mission duration
  const missionDuration = (
    new Date(missionMetadata.missionEnd) - 
    new Date(missionMetadata.missionStart)
  ) / 1000 / 60; // minutes

  // Severity breakdown
  const severityBreakdown = {
    critical: detections.filter(d => 
      fusionResults.find(f => 
        f.diagnosis?.severity === 'critical'
      )
    ).length,
    high: detections.filter(d => 
      fusionResults.find(f => 
        f.diagnosis?.severity === 'high'
      )
    ).length,
    medium: detections.filter(d => 
      fusionResults.find(f => 
        f.diagnosis?.severity === 'medium'
      )
    ).length,
    low: detections.filter(d => 
      fusionResults.find(f => 
        f.diagnosis?.severity === 'low'
      )
    ).length
  };

  // Affected area percentage
  const totalDetected = detections.length;
  const affectedPercentage = missionMetadata.fieldAreaHectares > 0
    ? ((economicData.affectedAreaHectares / missionMetadata.fieldAreaHectares) * 100).toFixed(1)
    : 0;

  // Top diagnosis
  const diagnosisCounts = {};
  fusionResults.forEach(r => {
    const diag = r.diagnosis?.refined_diagnosis || 'Unknown';
    diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
  });
  const topDiagnosis = Object.entries(diagnosisCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'No detections';

  // Average confidence
  const avgConfidence = fusionResults.length > 0
    ? (fusionResults.reduce((sum, r) => sum + (r.diagnosis?.confidence || 0), 0) / 
       fusionResults.length * 100).toFixed(1)
    : 0;

  return {
    // Metadata
    missionMetadata,
    missionDuration: Math.round(missionDuration),
    
    // Detection Summary
    detections: {
      total: totalDetected,
      affected: economicData.affectedAreaHectares,
      affectedPercentage,
      topDiagnosis,
      averageConfidence: avgConfidence,
      severityBreakdown,
      diagnosisCounts
    },
    
    // Environmental Data
    environmental: {
      temperature: sensorData?.air_temperature || 'N/A',
      humidity: sensorData?.air_humidity || 'N/A',
      soilMoisture: sensorData?.soil_moisture || 'N/A',
      soilTemperature: sensorData?.soil_temperature || 'N/A',
      ph: sensorData?.soil_ph || 'N/A',
      timestamp: sensorData?.timestamp || new Date().toISOString()
    },
    
    // Spray Recommendations
    spray: {
      recommendation: sprayRecommendation,
      pathLength: mapState?.sprayPath?.length || 0,
      estimatedTime: sprayRecommendation?.estimatedTime || 'N/A',
      coverageArea: economicData.affectedAreaHectares
    },
    
    // Economic Data
    economic: economicData,
    
    // Alerts (top 10)
    alerts: alerts.slice(0, 10),
    
    // Detailed Detections (max 50 for table)
    detailsTable: fusionResults.slice(0, 50).map((result, idx) => ({
      index: idx + 1,
      diagnosis: result.diagnosis?.refined_diagnosis || 'Unknown',
      severity: result.diagnosis?.severity || 'N/A',
      confidence: Math.round((result.diagnosis?.confidence || 0) * 100),
      visionConfidence: Math.round((result.vision_input?.confidence || 0) * 100),
      location: result.location || 'N/A'
    }))
  };
}
