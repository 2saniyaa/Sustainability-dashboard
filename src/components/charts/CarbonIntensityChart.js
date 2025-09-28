import React from 'react';
import './CarbonIntensityChart.css';

const CarbonIntensityChart = ({ data, isSimulated = false }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No data available for Carbon Intensity visualization</p>
      </div>
    );
  }

  // Process data for carbon intensity trend
  const chartData = data.map((row, index) => {
    const month = row.Month || `Month ${index + 1}`;
    const year = row.Year || 2023;
    
    // Calculate carbon intensity if not present
    let carbonIntensity = 0;
    if (row.Carbon_Intensity_kgCO2_MWh) {
      carbonIntensity = parseFloat(row.Carbon_Intensity_kgCO2_MWh);
    } else if (row.Generation_MW && row.CO2_Emissions_tonns) {
      // Calculate: (CO2_Emissions_tonns * 1000) / Generation_MW
      const generation = parseFloat(row.Generation_MW);
      const emissions = parseFloat(row.CO2_Emissions_tonns);
      carbonIntensity = generation > 0 ? (emissions * 1000) / generation : 0;
    }
    
    return {
      month: month,
      year: year,
      carbonIntensity: carbonIntensity,
      date: `${month} ${year}`,
      originalData: row
    };
  });

  // Filter to show only 12 months for cleaner visualization
  const displayData = chartData.slice(0, 12);
  
  const maxValue = Math.max(...displayData.map(d => d.carbonIntensity));
  const minValue = Math.min(...displayData.map(d => d.carbonIntensity));
  const range = maxValue - minValue;
  const euComplianceLine = 350; // EU ETS compliance threshold

  // Ensure we have a valid range
  const safeRange = range > 0 ? range : 1;
  const safeMinValue = minValue;

  return (
    <div className="carbon-intensity-chart">
      <div className="chart-header">
        <h3>Carbon Intensity Trend {isSimulated && <span className="simulation-badge">SIMULATED</span>}</h3>
        <p>kgCO2/MWh over time with EU ETS compliance threshold</p>
      </div>
      
      <div className="chart-container">
        {/* Y-Axis Label */}
        <div className="y-axis-label">
          Carbon Intensity (kgCO2/MWh)
        </div>
        
        {/* Chart Area */}
        <div className="chart-area">
          {/* Grid Lines */}
          <div className="grid-lines">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div 
                key={i} 
                className="grid-line"
                style={{ bottom: `${ratio * 100}%` }}
              />
            ))}
          </div>
          
          {/* EU Compliance Line */}
          {euComplianceLine >= safeMinValue && euComplianceLine <= maxValue && (
            <div 
              className="compliance-line"
              style={{ 
                bottom: `${((euComplianceLine - safeMinValue) / safeRange) * 100}%` 
              }}
            >
              <div className="compliance-label">
                EU ETS Threshold: 350 kgCO2/MWh
              </div>
            </div>
          )}
          
          {/* Data Points and Line */}
          <div className="data-container">
            {displayData.map((point, index) => {
              const height = safeRange > 0 ? ((point.carbonIntensity - safeMinValue) / safeRange) * 100 : 50;
              const isAboveThreshold = point.carbonIntensity > euComplianceLine;
              const totalPoints = displayData.length;
              const xPosition = totalPoints > 1 ? (index / (totalPoints - 1)) * 100 : 50;
              
              return (
                <div key={index} className="data-point-container">
                  {/* Data Point */}
                  <div 
                    className={`data-point ${isAboveThreshold ? 'above-threshold' : 'below-threshold'}`}
                    style={{ 
                      bottom: `${height}%`,
                      left: `${xPosition}%`
                    }}
                    title={`${point.date}: ${point.carbonIntensity.toFixed(1)} kgCO2/MWh`}
                  >
                    <div className="point-value">
                      {Math.round(point.carbonIntensity)}
                    </div>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < totalPoints - 1 && (
                    <div 
                      className="trend-line"
                      style={{
                        left: `${xPosition}%`,
                        width: `${100 / (totalPoints - 1)}%`,
                        bottom: `${height}%`,
                        transform: `rotate(${Math.atan2(
                          ((displayData[index + 1].carbonIntensity - safeMinValue) / safeRange) * 100 - height,
                          100 / (totalPoints - 1)
                        ) * 180 / Math.PI}deg)`
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Y-Axis Values */}
          <div className="y-axis-values">
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, minValue].map((value, i) => (
              <div key={i} className="y-axis-value">
                {Math.round(value)}
              </div>
            ))}
          </div>
        </div>
        
        {/* X-Axis Labels */}
        <div className="x-axis-labels">
          {displayData.map((point, index) => (
            <div key={index} className="x-axis-label">
              {point.month.substring(0, 3)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Chart Info */}
      <div className="chart-info">
        <div className="info-item">
          <span className="label">Current Average:</span>
          <span className="value">
            {(displayData.reduce((sum, d) => sum + d.carbonIntensity, 0) / displayData.length).toFixed(1)} kgCO2/MWh
          </span>
        </div>
        <div className="info-item">
          <span className="label">EU Compliance:</span>
          <span className={`value ${displayData.every(d => d.carbonIntensity <= euComplianceLine) ? 'compliant' : 'non-compliant'}`}>
            {displayData.every(d => d.carbonIntensity <= euComplianceLine) ? '✓ Compliant' : '⚠ Non-compliant'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CarbonIntensityChart;
