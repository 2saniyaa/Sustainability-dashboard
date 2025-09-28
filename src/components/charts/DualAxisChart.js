import React from 'react';
import './DualAxisChart.css';

const DualAxisChart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No data available for Generation vs Emissions visualization</p>
      </div>
    );
  }

  // Process data for dual-axis chart
  const chartData = data.map((row, index) => {
    const month = row.Month || `Month ${index + 1}`;
    const year = row.Year || 2023;
    const generation = parseFloat(row.Generation_MW) || 0;
    const emissions = parseFloat(row.CO2_Emissions_tonns) || 0;
    
    return {
      month: month,
      year: year,
      generation: generation,
      emissions: emissions,
      date: `${month} ${year}`,
      originalData: row
    };
  });

  const maxGeneration = Math.max(...chartData.map(d => d.generation));
  const minGeneration = Math.min(...chartData.map(d => d.generation));
  const generationRange = maxGeneration - minGeneration;

  const maxEmissions = Math.max(...chartData.map(d => d.emissions));
  const minEmissions = Math.min(...chartData.map(d => d.emissions));
  const emissionsRange = maxEmissions - minEmissions;

  return (
    <div className="dual-axis-chart">
      <div className="chart-header">
        <h3>Monthly Generation vs Emissions</h3>
        <p>Generation (MW) and CO2 Emissions (tonnes) over time</p>
      </div>
      
      <div className="chart-container">
        {/* Left Y-Axis Label */}
        <div className="y-axis-label left">
          Generation (MW)
        </div>
        
        {/* Right Y-Axis Label */}
        <div className="y-axis-label right">
          CO2 Emissions (tonnes)
        </div>
        
        {/* Chart Area */}
        <div className="chart-area">
          {/* Grid Lines */}
          <div className="grid-lines">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div 
                key={i} 
                className="grid-line"
                style={{ top: `${ratio * 100}%` }}
              />
            ))}
          </div>
          
          {/* Data Container */}
          <div className="data-container">
            {/* Generation Bars */}
            <div className="bars-container">
              {chartData.slice(0, 12).map((point, index) => {
                const barHeight = generationRange > 0 ? ((point.generation - minGeneration) / generationRange) * 100 : 50;
                const totalPoints = Math.min(chartData.length, 12);
                const xPosition = totalPoints > 1 ? (index / (totalPoints - 1)) * 100 : 50;
                const barWidth = totalPoints > 1 ? 80 / totalPoints : 80;
                
                return (
                  <div key={`bar-${index}`} className="bar-container">
                    <div 
                      className="generation-bar"
                      style={{ 
                        height: `${barHeight}%`,
                        left: `${xPosition}%`,
                        width: `${barWidth}%`
                      }}
                      title={`${point.date}: ${point.generation.toLocaleString()} MW`}
                    >
                      <div className="bar-value">
                        {Math.round(point.generation)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Emissions Line */}
            <div className="line-container">
              {chartData.slice(0, 12).map((point, index) => {
                const lineHeight = emissionsRange > 0 ? ((point.emissions - minEmissions) / emissionsRange) * 100 : 50;
                const totalPoints = Math.min(chartData.length, 12);
                const xPosition = totalPoints > 1 ? (index / (totalPoints - 1)) * 100 : 50;
                
                return (
                  <div key={`line-${index}`} className="line-point-container">
                    {/* Data Point */}
                    <div 
                      className="emissions-point"
                      style={{ 
                        bottom: `${lineHeight}%`,
                        left: `${xPosition}%`
                      }}
                      title={`${point.date}: ${point.emissions.toLocaleString()} tonnes`}
                    >
                      <div className="point-value">
                        {Math.round(point.emissions)}
                      </div>
                    </div>
                    
                    {/* Connecting Line */}
                    {index < totalPoints - 1 && (
                      <div 
                        className="emissions-line"
                        style={{
                          left: `${xPosition}%`,
                          width: `${100 / (totalPoints - 1)}%`,
                          bottom: `${lineHeight}%`,
                          transform: `rotate(${Math.atan2(
                            ((chartData[index + 1].emissions - minEmissions) / emissionsRange) * 100 - lineHeight,
                            100 / (totalPoints - 1)
                          ) * 180 / Math.PI}deg)`
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Left Y-Axis Values (Generation) */}
          <div className="y-axis-values left">
            {[maxGeneration, maxGeneration * 0.75, maxGeneration * 0.5, maxGeneration * 0.25, minGeneration].map((value, i) => (
              <div key={i} className="y-axis-value">
                {Math.round(value).toLocaleString()}
              </div>
            ))}
          </div>
          
          {/* Right Y-Axis Values (Emissions) */}
          <div className="y-axis-values right">
            {[maxEmissions, maxEmissions * 0.75, maxEmissions * 0.5, maxEmissions * 0.25, minEmissions].map((value, i) => (
              <div key={i} className="y-axis-value">
                {Math.round(value).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
        
        {/* X-Axis Labels */}
        <div className="x-axis-labels">
          {chartData.slice(0, 12).map((point, index) => (
            <div key={index} className="x-axis-label">
              {point.month.substring(0, 3)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color generation"></div>
          <span>Generation (MW)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color emissions"></div>
          <span>CO2 Emissions (tonnes)</span>
        </div>
      </div>
      
      {/* Chart Info */}
      <div className="chart-info">
        <div className="info-item">
          <span className="label">Total Generation:</span>
          <span className="value">
            {chartData.reduce((sum, d) => sum + d.generation, 0).toLocaleString()} MW
          </span>
        </div>
        <div className="info-item">
          <span className="label">Total Emissions:</span>
          <span className="value">
            {chartData.reduce((sum, d) => sum + d.emissions, 0).toLocaleString()} tonnes
          </span>
        </div>
        <div className="info-item">
          <span className="label">Average Efficiency:</span>
          <span className="value">
            {(chartData.reduce((sum, d) => sum + (d.generation / d.emissions), 0) / chartData.length).toFixed(2)} MW/tonne
          </span>
        </div>
      </div>
    </div>
  );
};

export default DualAxisChart;
