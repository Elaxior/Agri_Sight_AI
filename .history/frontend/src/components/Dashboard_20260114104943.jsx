import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🌾 Precision Agriculture Analytics</h1>
        <div className="status-badge">
          <span className="status-indicator active"></span>
          <span>System Ready</span>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>🚁 Drone Status</h2>
          <p className="card-value">Standby</p>
          <p className="card-label">Awaiting model deployment</p>
        </div>

        <div className="dashboard-card">
          <h2>📊 Analytics Pipeline</h2>
          <p className="card-value">Inactive</p>
          <p className="card-label">AI inference not configured</p>
        </div>

        <div className="dashboard-card">
          <h2>🔥 Firebase Connection</h2>
          <p className="card-value">Not Connected</p>
          <p className="card-label">Will be configured in Part 5</p>
        </div>

        <div className="dashboard-card">
          <h2>🌱 Field Data</h2>
          <p className="card-value">No Data</p>
          <p className="card-label">Waiting for drone imagery</p>
        </div>
      </div>

      <div className="info-banner">
        <strong>Part 1 Complete:</strong> Project foundation established. 
        Proceed to Part 2 for AI model training.
      </div>
    </div>
  );
};

export default Dashboard;
