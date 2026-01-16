import React, { useMemo } from 'react';
import './StatsPanel.css';

export default function StatsPanel({ detections }) {
  const stats = useMemo(() => {
    if (detections.length === 0) {
      return { totalDiseases: 0, uniqueDiseases: 0, highConfidence: 0, diseaseTypes: {} };
    }

    const diseaseTypes = {};
    let totalDiseases = 0;
    let highConfidence = 0;

    detections.forEach(detection => {
      const diseaseList = detection.detections || [];
      
      diseaseList.forEach(disease => {
        totalDiseases++;
        const name = disease.class_name;
        diseaseTypes[name] = (diseaseTypes[name] || 0) + 1;
        
        if (disease.confidence > 0.7) {
          highConfidence++;
        }
      });
    });

    return {
      totalDiseases,
      uniqueDiseases: Object.keys(diseaseTypes).length,
      highConfidence,
      diseaseTypes
    };
  }, [detections]);

  const topDiseases = useMemo(() => {
    return Object.entries(stats.diseaseTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [stats.diseaseTypes]);

  return (
    <div className="stats-panel">
      <h3>📈 Analytics</h3>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">{stats.totalDiseases}</div>
          <div className="stat-text">Total Diseases</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{stats.uniqueDiseases}</div>
          <div className="stat-text">Unique Types</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{stats.highConfidence}</div>
          <div className="stat-text">High Confidence</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">
            {stats.totalDiseases > 0 
              ? ((stats.highConfidence / stats.totalDiseases) * 100).toFixed(0)
              : 0}%
          </div>
          <div className="stat-text">Accuracy</div>
        </div>
      </div>

      {topDiseases.length > 0 && (
        <div className="top-diseases">
          <h4>Top Diseases Detected</h4>
          {topDiseases.map(disease => (
            <div key={disease.name} className="disease-bar-item">
              <div className="bar-name">{disease.name}</div>
              <div className="bar-wrapper">
                <div 
                  className="bar-progress"
                  style={{ width: `${(disease.count / topDiseases[0].count) * 100}%` }}
                ></div>
                <span className="bar-value">{disease.count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
