import React from 'react';
import './ComplianceStatus.css';

const ComplianceStatus = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="compliance-placeholder">
        <p>No data available for compliance assessment</p>
      </div>
    );
  }

  // Calculate compliance metrics
  const calculateCompliance = () => {
    const euThreshold = 350; // kgCO2/MWh
    const carbonIntensities = data.map(row => parseFloat(row.Carbon_Intensity_kgCO2_MWh) || 0);
    
    const averageIntensity = carbonIntensities.reduce((sum, val) => sum + val, 0) / carbonIntensities.length;
    const maxIntensity = Math.max(...carbonIntensities);
    const minIntensity = Math.min(...carbonIntensities);
    
    const compliantMonths = carbonIntensities.filter(intensity => intensity <= euThreshold).length;
    const totalMonths = carbonIntensities.length;
    const complianceRate = (compliantMonths / totalMonths) * 100;
    
    // Determine overall status
    let overallStatus = 'compliant';
    let statusColor = 'green';
    let statusText = 'Fully Compliant';
    
    if (complianceRate < 50) {
      overallStatus = 'non-compliant';
      statusColor = 'red';
      statusText = 'Non-Compliant';
    } else if (complianceRate < 80) {
      overallStatus = 'warning';
      statusColor = 'orange';
      statusText = 'At Risk';
    } else if (complianceRate < 100) {
      overallStatus = 'partial';
      statusColor = 'yellow';
      statusText = 'Mostly Compliant';
    }
    
    return {
      averageIntensity,
      maxIntensity,
      minIntensity,
      complianceRate,
      compliantMonths,
      totalMonths,
      overallStatus,
      statusColor,
      statusText,
      euThreshold
    };
  };

  const compliance = calculateCompliance();

  const complianceItems = [
    {
      title: 'EU ETS Compliance',
      value: `${compliance.complianceRate.toFixed(1)}%`,
      description: `${compliance.compliantMonths}/${compliance.totalMonths} months compliant`,
      status: compliance.overallStatus,
      threshold: `${compliance.euThreshold} kgCO2/MWh`,
      icon: '🇪🇺'
    },
    {
      title: 'Average Carbon Intensity',
      value: `${compliance.averageIntensity.toFixed(1)}`,
      unit: 'kgCO2/MWh',
      description: 'Monthly average',
      status: compliance.averageIntensity <= compliance.euThreshold ? 'compliant' : 'non-compliant',
      threshold: compliance.euThreshold,
      icon: '📊'
    },
    {
      title: 'Peak Intensity',
      value: `${compliance.maxIntensity.toFixed(1)}`,
      unit: 'kgCO2/MWh',
      description: 'Highest monthly value',
      status: compliance.maxIntensity <= compliance.euThreshold ? 'compliant' : 'non-compliant',
      threshold: compliance.euThreshold,
      icon: '📈'
    },
    {
      title: 'Best Performance',
      value: `${compliance.minIntensity.toFixed(1)}`,
      unit: 'kgCO2/MWh',
      description: 'Lowest monthly value',
      status: 'compliant',
      threshold: compliance.euThreshold,
      icon: '🏆'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return '✅';
      case 'partial': return '⚠️';
      case 'warning': return '🟡';
      case 'non-compliant': return '❌';
      default: return '❓';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'compliant': return 'green';
      case 'partial': return 'yellow';
      case 'warning': return 'orange';
      case 'non-compliant': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="compliance-status">
      <div className="compliance-header">
        <h3>Compliance Status</h3>
        <p>EU ETS regulatory compliance assessment</p>
      </div>
      
      {/* Overall Status */}
      <div className={`overall-status ${compliance.statusColor}`}>
        <div className="status-icon">
          {getStatusIcon(compliance.overallStatus)}
        </div>
        <div className="status-content">
          <div className="status-title">{compliance.statusText}</div>
          <div className="status-subtitle">
            {compliance.complianceRate.toFixed(1)}% compliance rate
          </div>
        </div>
        <div className="status-threshold">
          <div className="threshold-label">EU Threshold</div>
          <div className="threshold-value">{compliance.euThreshold} kgCO2/MWh</div>
        </div>
      </div>
      
      {/* Compliance Details */}
      <div className="compliance-details">
        {complianceItems.map((item, index) => (
          <div key={index} className={`compliance-item ${getStatusClass(item.status)}`}>
            <div className="item-header">
              <div className="item-icon">{item.icon}</div>
              <div className="item-title">{item.title}</div>
              <div className="item-status">
                {getStatusIcon(item.status)}
              </div>
            </div>
            
            <div className="item-content">
              <div className="item-value">
                {item.value}
                {item.unit && <span className="item-unit">{item.unit}</span>}
              </div>
              
              <div className="item-description">
                {item.description}
              </div>
              
              <div className="item-threshold">
                Threshold: {item.threshold}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Compliance Summary */}
      <div className="compliance-summary">
        <div className="summary-item">
          <span className="label">Compliant Months:</span>
          <span className="value">{compliance.compliantMonths}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Months:</span>
          <span className="value">{compliance.totalMonths}</span>
        </div>
        <div className="summary-item">
          <span className="label">Compliance Rate:</span>
          <span className={`value ${getStatusClass(compliance.overallStatus)}`}>
            {compliance.complianceRate.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatus;
