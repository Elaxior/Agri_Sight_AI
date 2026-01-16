/**
 * Sensor Data Simulator
 * Generates realistic agricultural sensor readings
 */


/**
 * Soil Moisture (%)
 * - 0-20%: Very dry (drought stress)
 * - 20-40%: Dry (irrigation needed)
 * - 40-70%: Optimal (healthy)
 * - 70-90%: Wet (fungal risk)
 * - 90-100%: Saturated (root rot risk)
 */
export function generateSoilMoisture() {
  // Simulate realistic patterns
  const base = 50 + Math.random() * 30; // 50-80% typical range
  const variation = (Math.random() - 0.5) * 20; // ±10% daily variation
  const moisture = Math.max(10, Math.min(95, base + variation));
  return parseFloat(moisture.toFixed(1));
}


/**
 * Soil Temperature (°C)
 * - <15°C: Cold (slow growth)
 * - 15-25°C: Optimal
 * - 25-35°C: Warm (normal for summer)
 * - 35-45°C: Hot (stress risk)
 * - >45°C: Extreme (damage risk)
 */
export function generateSoilTemperature() {
  // Simulate diurnal pattern
  const hour = new Date().getHours();
  const baseTemp = 25; // Average soil temp
  const dailyVariation = Math.sin((hour - 6) * Math.PI / 12) * 8; // ±8°C variation
  const randomNoise = (Math.random() - 0.5) * 3;
  const temp = baseTemp + dailyVariation + randomNoise;
  return parseFloat(Math.max(15, Math.min(45, temp)).toFixed(1));
}


/**
 * Air Humidity (%)
 * - <30%: Very dry
 * - 30-50%: Dry
 * - 50-70%: Comfortable
 * - 70-85%: Humid (fungal risk)
 * - >85%: Very humid (high disease risk)
 */
export function generateAirHumidity() {
  const base = 60 + Math.random() * 20; // 60-80% typical
  const variation = (Math.random() - 0.5) * 15;
  const humidity = Math.max(25, Math.min(95, base + variation));
  return parseFloat(humidity.toFixed(1));
}


/**
 * Soil pH (6.0-7.5 optimal for most crops)
 * - <5.5: Acidic (nutrient issues)
 * - 5.5-6.5: Slightly acidic (good for most)
 * - 6.5-7.5: Neutral (optimal)
 * - 7.5-8.5: Slightly alkaline
 * - >8.5: Alkaline (nutrient lockout)
 */
export function generateSoilPH() {
  const base = 6.8; // Optimal
  const variation = (Math.random() - 0.5) * 0.8;
  const ph = Math.max(5.5, Math.min(8.0, base + variation));
  return parseFloat(ph.toFixed(1));
}


/**
 * Light Intensity (lux)
 * - <10,000: Low light
 * - 10,000-30,000: Moderate
 * - 30,000-80,000: Full sun
 * - >80,000: Very bright
 */
export function generateLightIntensity() {
  const hour = new Date().getHours();
  // Simulate solar cycle
  if (hour < 6 || hour > 19) {
    return Math.random() * 100; // Night
  }
  const solarAngle = Math.sin((hour - 6) * Math.PI / 13); // Peak at noon
  const maxLight = 75000;
  const light = maxLight * solarAngle + (Math.random() - 0.5) * 10000;
  return Math.round(Math.max(1000, light));
}


/**
 * Generate complete sensor snapshot
 */
export function generateSensorSnapshot() {
  return {
    soil_moisture: generateSoilMoisture(),
    soil_temperature: generateSoilTemperature(),
    air_humidity: generateAirHumidity(),
    soil_ph: generateSoilPH(),
    light_intensity: generateLightIntensity(),
    timestamp: new Date().toISOString(),
    sensor_id: 'FIELD_01_SENSOR_A',
    status: 'online'
  };
}


/**
 * Simulate sensor readings over time
 * Updates every 30 seconds (realistic for IoT sensors)
 */
export function startSensorStream(callback, interval = 30000) {
  // Initial reading
  callback(generateSensorSnapshot());
  
  // Periodic updates
  const intervalId = setInterval(() => {
    callback(generateSensorSnapshot());
  }, interval);
  
  return () => clearInterval(intervalId);
}


/**
 * Categorize sensor values for fusion logic
 */
export function categorizeSensorData(sensorData) {
  const { soil_moisture, soil_temperature, air_humidity, soil_ph } = sensorData;
  
  return {
    moisture: {
      value: soil_moisture,
      category: soil_moisture < 30 ? 'dry' :
                soil_moisture < 50 ? 'moderate' :
                soil_moisture < 75 ? 'optimal' :
                'wet',
      status: soil_moisture < 30 ? 'warning' :
              soil_moisture > 80 ? 'warning' :
              'normal'
    },
    temperature: {
      value: soil_temperature,
      category: soil_temperature < 18 ? 'cold' :
                soil_temperature < 28 ? 'optimal' :
                soil_temperature < 38 ? 'warm' :
                'hot',
      status: soil_temperature < 18 ? 'caution' :
              soil_temperature > 35 ? 'warning' :
              'normal'
    },
    humidity: {
      value: air_humidity,
      category: air_humidity < 40 ? 'dry' :
                air_humidity < 70 ? 'moderate' :
                air_humidity < 85 ? 'humid' :
                'very_humid',
      status: air_humidity > 80 ? 'warning' :
              air_humidity < 35 ? 'caution' :
              'normal'
    },
    ph: {
      value: soil_ph,
      category: soil_ph < 6.0 ? 'acidic' :
                soil_ph < 7.0 ? 'slightly_acidic' :
                soil_ph < 7.5 ? 'neutral' :
                'alkaline',
      status: soil_ph < 5.8 || soil_ph > 7.8 ? 'caution' : 'normal'
    }
  };
}


/**
 * Get current sensor data (convenience function)
 * Returns a single snapshot of current sensor readings
 * 
 * This is a wrapper around generateSensorSnapshot() for clearer API usage
 */
export function getSensorData() {
  return generateSensorSnapshot();
}
