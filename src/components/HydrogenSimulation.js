import React, { useState, useEffect } from 'react';
import './HydrogenSimulation.css';

const HydrogenSimulation = ({ data, onDataUpdate, onComplianceUpdate }) => {
  const [hydrogenBlend, setHydrogenBlend] = useState(0);
  const [complianceStatus, setComplianceStatus] = useState(null);
  const [annualSavings, setAnnualSavings] = useState(0);

  const calculateSimulation = React.useCallback(() => {
    if (!data || data.length === 0) return;

    // Find minimum hydrogen blend for compliance function
    const findMinBlendForCompliance = () => {
      if (!data || data.length === 0) return 0;
      
      const euThreshold = 350;
      
      // Binary search to find minimum hydrogen blend for compliance
      let left = 0;
      let right = 100;
      let minBlend = 100;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        // Calculate emissions with this blend
        const testData = data.map(row => {
          const currentEmissions = parseFloat(row.CO2_Emissions_tonns) || 0;
          const generation = parseFloat(row.Generation_MW) || 0;
          const newEmissions = currentEmissions * (1 - mid / 100);
          const newCarbonIntensity = generation > 0 ? (newEmissions * 1000) / generation : 0;
          return newCarbonIntensity;
        });
        
        const maxIntensity = Math.max(...testData);
        const avgIntensity = testData.reduce((sum, val) => sum + val, 0) / testData.length;
        
        if (maxIntensity <= euThreshold && avgIntensity <= euThreshold) {
          minBlend = mid;
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
      
      return minBlend;
    };

    // Calculate new emissions with hydrogen blend
    const newData = data.map(row => {
      const currentEmissions = parseFloat(row.CO2_Emissions_tonns) || 0;
      const generation = parseFloat(row.Generation_MW) || 0;
      
      // New emissions formula: Current_Emissions × (1 - Hydrogen_Blend/100)
      const newEmissions = currentEmissions * (1 - hydrogenBlend / 100);
      
      // Recalculate carbon intensity with new emissions
      const newCarbonIntensity = generation > 0 ? (newEmissions * 1000) / generation : 0;
      
      return {
        ...row,
        CO2_Emissions_tonns: newEmissions,
        Carbon_Intensity_kgCO2_MWh: newCarbonIntensity,
        Original_Emissions: currentEmissions,
        Emissions_Reduction: currentEmissions - newEmissions
      };
    });

    // Calculate annual savings
    const totalOriginalEmissions = data.reduce((sum, row) => sum + (parseFloat(row.CO2_Emissions_tonns) || 0), 0);
    const totalNewEmissions = newData.reduce((sum, row) => sum + row.CO2_Emissions_tonns, 0);
    const totalSavings = totalOriginalEmissions - totalNewEmissions;
    setAnnualSavings(totalSavings);

    // Calculate compliance status
    const averageCarbonIntensity = newData.reduce((sum, row) => sum + row.Carbon_Intensity_kgCO2_MWh, 0) / newData.length;
    const maxCarbonIntensity = Math.max(...newData.map(row => row.Carbon_Intensity_kgCO2_MWh));
    const euThreshold = 350; // kgCO2/MWh
    
    const isCompliant = averageCarbonIntensity <= euThreshold && maxCarbonIntensity <= euThreshold;
    const complianceRate = (newData.filter(row => row.Carbon_Intensity_kgCO2_MWh <= euThreshold).length / newData.length) * 100;
    
    // Find minimum hydrogen blend for compliance
    const minBlendForCompliance = findMinBlendForCompliance();
    
    const complianceData = {
      isCompliant,
      complianceRate,
      averageCarbonIntensity,
      maxCarbonIntensity,
      minBlendForCompliance,
      euThreshold
    };
    
    setComplianceStatus(complianceData);

    // Update parent component with simulated data
    if (onDataUpdate) {
      onDataUpdate(newData);
    }
    
    // Update parent component with compliance status
    if (onComplianceUpdate) {
      onComplianceUpdate(complianceData);
    }
  }, [data, hydrogenBlend, onDataUpdate, onComplianceUpdate]);

  useEffect(() => {
    if (data && data.length > 0) {
      calculateSimulation();
    }
  }, [data, hydrogenBlend, calculateSimulation]);



  const handleSliderChange = (event) => {
    setHydrogenBlend(parseInt(event.target.value));
  };

  if (!data || data.length === 0) {
    return (
      <div className="simulation-placeholder">
        <p>Upload power plant data to enable hydrogen blend simulation</p>
      </div>
    );
  }

  return (
    <div className="hydrogen-simulation">
      <div className="simulation-header">
        <h3>🔬 Hydrogen Blend Simulation</h3>
        <p>Simulate the environmental impact of hydrogen integration</p>
      </div>

      <div className="simulation-controls">
        <div className="slider-container">
          <label htmlFor="hydrogen-blend" className="slider-label">
            Hydrogen Blend: <span className="blend-value">{hydrogenBlend}%</span>
          </label>
          <input
            id="hydrogen-blend"
            type="range"
            min="0"
            max="100"
            value={hydrogenBlend}
            onChange={handleSliderChange}
            className="hydrogen-slider"
          />
          <div className="slider-labels">
            <span>0% (Current)</span>
            <span>100% (Pure Hydrogen)</span>
          </div>
        </div>
      </div>

      <div className="simulation-results">
        <div className="results-grid">
          {/* CO2 Savings */}
          <div className="result-card savings">
            <div className="card-icon">🌱</div>
            <div className="card-content">
              <div className="card-title">Annual CO2 Savings</div>
              <div className="card-value">
                {annualSavings.toLocaleString()}
                <span className="card-unit">tonnes</span>
              </div>
              <div className="card-description">
                {((annualSavings / data.reduce((sum, row) => sum + (parseFloat(row.CO2_Emissions_tonns) || 0), 0)) * 100).toFixed(1)}% reduction
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className={`result-card compliance ${complianceStatus?.isCompliant ? 'compliant' : 'non-compliant'}`}>
            <div className="card-icon">
              {complianceStatus?.isCompliant ? '✅' : '⚠️'}
            </div>
            <div className="card-content">
              <div className="card-title">EU ETS Compliance</div>
              <div className="card-value">
                {complianceStatus?.isCompliant ? 'Compliant' : 'Non-compliant'}
              </div>
              <div className="card-description">
                {complianceStatus?.complianceRate.toFixed(1)}% of months compliant
              </div>
            </div>
          </div>

          {/* Carbon Intensity */}
          <div className="result-card intensity">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-title">Average Carbon Intensity</div>
              <div className="card-value">
                {complianceStatus?.averageCarbonIntensity.toFixed(1)}
                <span className="card-unit">kgCO2/MWh</span>
              </div>
              <div className="card-description">
                EU Threshold: {complianceStatus?.euThreshold} kgCO2/MWh
              </div>
            </div>
          </div>

          {/* Minimum Blend for Compliance */}
          <div className="result-card threshold">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <div className="card-title">Min Blend for Compliance</div>
              <div className="card-value">
                {complianceStatus?.minBlendForCompliance}%
              </div>
              <div className="card-description">
                {complianceStatus?.minBlendForCompliance <= hydrogenBlend ? 'Target achieved!' : 'Increase blend to achieve compliance'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="compliance-progress">
        <div className="progress-header">
          <span>Compliance Progress</span>
          <span>{complianceStatus?.complianceRate.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${complianceStatus?.complianceRate || 0}%` }}
          />
        </div>
        <div className="progress-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Simulation Summary */}
      <div className="simulation-summary">
        <h4>Simulation Summary</h4>
        <div className="summary-content">
          <p>
            With <strong>{hydrogenBlend}% hydrogen blend</strong>, your power plant would:
          </p>
          <ul>
            <li>
              Reduce CO2 emissions by <strong>{annualSavings.toLocaleString()} tonnes annually</strong>
            </li>
            <li>
              Achieve <strong>{complianceStatus?.complianceRate.toFixed(1)}% compliance</strong> with EU ETS standards
            </li>
            <li>
              {complianceStatus?.isCompliant ? 
                '✅ Meet all EU ETS requirements' : 
                `⚠️ Need ${complianceStatus?.minBlendForCompliance}% blend for full compliance`
              }
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HydrogenSimulation;
