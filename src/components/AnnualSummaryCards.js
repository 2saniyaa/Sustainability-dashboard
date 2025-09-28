import React from 'react';
import './AnnualSummaryCards.css';

const AnnualSummaryCards = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="summary-cards-placeholder">
        <p>No data available for annual summary</p>
      </div>
    );
  }

  // Calculate annual metrics
  const calculateMetrics = () => {
    const totalGeneration = data.reduce((sum, row) => sum + (parseFloat(row.Generation_MW) || 0), 0);
    const totalEmissions = data.reduce((sum, row) => sum + (parseFloat(row.CO2_Emissions_tonns) || 0), 0);
    const averageCarbonIntensity = data.reduce((sum, row) => sum + (parseFloat(row.Carbon_Intensity_kgCO2_MWh) || 0), 0) / data.length;
    
    // Calculate year range
    const years = [...new Set(data.map(row => row.Year))].sort();
    const yearRange = years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : years[0]?.toString() || 'N/A';
    
    // Calculate monthly averages
    const monthlyGeneration = totalGeneration / data.length;
    const monthlyEmissions = totalEmissions / data.length;
    
    // Calculate efficiency metrics
    const efficiencyRatio = totalGeneration / totalEmissions; // MW per tonne
    
    return {
      totalGeneration,
      totalEmissions,
      averageCarbonIntensity,
      yearRange,
      monthlyGeneration,
      monthlyEmissions,
      efficiencyRatio
    };
  };

  const metrics = calculateMetrics();

  const cards = [
    {
      title: 'Average Carbon Intensity',
      value: `${metrics.averageCarbonIntensity.toFixed(1)}`,
      unit: 'kgCO2/MWh',
      icon: '🌱',
      color: metrics.averageCarbonIntensity <= 350 ? 'green' : 'red',
      description: 'Lower is better',
      trend: metrics.averageCarbonIntensity <= 350 ? 'Compliant' : 'Above EU threshold'
    },
    {
      title: 'Total Annual Emissions',
      value: `${metrics.totalEmissions.toLocaleString()}`,
      unit: 'tonnes CO2',
      icon: '🏭',
      color: 'orange',
      description: 'Total CO2 emissions',
      trend: `${metrics.monthlyEmissions.toFixed(0)} tonnes/month avg`
    },
    {
      title: 'Total Generation',
      value: `${metrics.totalGeneration.toLocaleString()}`,
      unit: 'MW',
      icon: '⚡',
      color: 'blue',
      description: 'Total power generated',
      trend: `${metrics.monthlyGeneration.toFixed(0)} MW/month avg`
    },
    {
      title: 'Efficiency Ratio',
      value: `${metrics.efficiencyRatio.toFixed(2)}`,
      unit: 'MW/tonne',
      icon: '📊',
      color: 'purple',
      description: 'Power per emission unit',
      trend: 'Higher is better'
    }
  ];

  return (
    <div className="annual-summary-cards">
      <div className="summary-header">
        <h3>Annual Summary ({metrics.yearRange})</h3>
        <p>Key performance indicators for the reporting period</p>
      </div>
      
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className={`summary-card ${card.color}`}>
            <div className="card-header">
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
            </div>
            
            <div className="card-content">
              <div className="card-value">
                {card.value}
                <span className="card-unit">{card.unit}</span>
              </div>
              
              <div className="card-description">
                {card.description}
              </div>
              
              <div className="card-trend">
                {card.trend}
              </div>
            </div>
            
            <div className="card-footer">
              <div className={`status-indicator ${card.color}`}>
                {card.color === 'green' && '✓'}
                {card.color === 'red' && '⚠'}
                {card.color === 'orange' && '📈'}
                {card.color === 'blue' && '⚡'}
                {card.color === 'purple' && '📊'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="summary-footer">
        <div className="footer-item">
          <span className="label">Data Period:</span>
          <span className="value">{metrics.yearRange}</span>
        </div>
        <div className="footer-item">
          <span className="label">Data Points:</span>
          <span className="value">{data.length} months</span>
        </div>
        <div className="footer-item">
          <span className="label">Last Updated:</span>
          <span className="value">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnualSummaryCards;
