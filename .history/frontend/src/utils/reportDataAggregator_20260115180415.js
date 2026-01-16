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
  
  const missionDuration = 
    (new Date(missionMetadata.missionEnd) - new Date(missionMetadata.missionStart)) / 1000 / 60;
  
  // Severity breakdown
  const severityBreakdown = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length
  };
  
  // Affected area calculation
  const totalAffected = new Set(detections.map(d => d.id)).size;
  const affectedPercentage = totalAffected > 0 
    ? ((totalAffected / (detections.length || 1)) * 100).toFixed(1)
    : 0;
  
  // Most common diagnosis
  const diagnosisCounts = {};
  fusionResults.forEach(r => {
    const diag = r.diagnosis?.refined_diagnosis || 'Unknown';
    diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
  });
  
  const topDiagnosis = Object.entries(diagnosisCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'No detections';
  
  return {
    missionMetadata,
    missionDuration: Math.round(missionDuration),
    detections: {
      total: detections.length,
      affected: totalAffected,
      affectedPercentage,
      topDiagnosis,
      severityBreakdown
    },
    environmental: {
      temperature: sensorData?.soil_temperature || 'N/A',
      humidity: sensorData?.air_humidity || 'N/A',
      soilMoisture: sensorData?.soil_moisture || 'N/A',
      ph: sensorData?.soil_ph || 'N/A',
      timestamp: sensorData?.timestamp || new Date().toISOString()
    },
    spray: {
      recommendation: sprayRecommendation,
      pathLength: mapState?.sprayPath?.length || 0,
      estimatedTime: '2-3 hours'
    },
    economic: economicData,
    alerts: alerts.slice(0, 10), // Top 10 alerts
    allDetections: detections.slice(0, 50) // For detailed table (max 50)
  };
}
