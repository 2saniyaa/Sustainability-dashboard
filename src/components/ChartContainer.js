import React, { useState } from 'react';
import './ChartContainer.css';

const ChartContainer = ({ data, chartType, xColumn, yColumn }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No data available for visualization</p>
      </div>
    );
  }

  if (!xColumn || !yColumn) {
    return (
      <div className="chart-placeholder">
        <p>Please select both X and Y axis columns to display the chart</p>
      </div>
    );
  }

  // Debug: Log the data and column information
  console.log('ChartContainer Debug:');
  console.log('Data length:', data.length);
  console.log('X Column:', xColumn);
  console.log('Y Column:', yColumn);
  console.log('First data row:', data[0]);
  console.log('Available columns in first row:', data[0] ? Object.keys(data[0]) : 'No data');

  // Process your actual CSV data - fix comma decimal separator
  const chartData = data.map((row, index) => {
    const xValue = row[xColumn];
    const yValue = row[yColumn];
    
    console.log(`Row ${index}: xValue=${xValue}, yValue=${yValue}`);
    
    // Fix European decimal format (comma to dot)
    const cleanYValue = String(yValue || '0').replace(',', '.');
    const numericValue = parseFloat(cleanYValue) || 0;
    
    return {
      name: String(xValue || `Item ${index + 1}`),
      value: numericValue,
      [xColumn]: xValue,
      [yColumn]: numericValue,
      originalData: row
    };
  });

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const range = maxValue - minValue;

  const renderChart = () => {
    return (
      <div className="interactive-chart" style={{ width: '100%', height: '500px', background: 'white', padding: '20px', position: 'relative' }}>
        {/* Chart Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.5rem' }}>
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </h3>
          <p style={{ margin: '0', color: '#666', fontSize: '1rem' }}>
            {xColumn} vs {yColumn}
          </p>
        </div>
        
        {/* Y-Axis Label */}
        <div style={{ 
          position: 'absolute', 
          left: '10px', 
          top: '50%', 
          transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: '14px',
          fontWeight: '600',
          color: '#333',
          whiteSpace: 'nowrap'
        }}>
          {yColumn}
        </div>
        
        {/* Chart Area */}
        <div style={{ 
          marginLeft: '60px', 
          marginRight: '20px', 
          height: '350px', 
          position: 'relative',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          background: '#fafafa'
        }}>
          {/* Grid Lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: `${ratio * 100}%`,
                left: 0,
                right: 0,
                height: '1px',
                background: '#e0e0e0',
                opacity: ratio === 0 ? 1 : 0.5
              }} />
            ))}
          </div>
          
          {/* Chart Content */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'end', 
            height: '100%', 
            gap: '4px', 
            justifyContent: 'space-between',
            paddingTop: '20px',
            paddingBottom: '40px' // Add space for labels
          }}>
            {chartData.slice(0, 12).map((item, index) => { // Show fewer items for cleaner look
              const height = range > 0 ? ((item.value - minValue) / range) * 100 : 50;
              const actualHeight = Math.max(height, 5);
              const isHovered = hoveredIndex === index;
              
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1,
                  minWidth: '30px', // Increased minimum width
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* Bar/Line Point */}
                  <div 
                    style={{ 
                      width: chartType === 'line' ? '12px' : '100%',
                      height: `${actualHeight}%`, 
                      backgroundColor: isHovered ? '#5a6fd8' : '#8884d8',
                      borderRadius: chartType === 'line' ? '50%' : '4px 4px 0 0',
                      marginBottom: '8px', // Increased margin
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      minHeight: '8px',
                      border: `2px solid ${isHovered ? '#3a4f9d' : '#5a6fd8'}`,
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    title={`${item.name}: ${item.value.toLocaleString()}`}
                  />
                  
                  {/* X-Axis Label */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: isHovered ? '#333' : '#666', 
                    transform: 'rotate(-45deg)',
                    whiteSpace: 'nowrap',
                    marginTop: '8px',
                    textAlign: 'center',
                    fontWeight: isHovered ? '600' : '500',
                    width: '60px', // Fixed width for labels
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.name.length > 4 ? item.name.substring(0, 4) : item.name}
                  </div>
                  
                  {/* Value Label - only show on hover */}
                  {isHovered && (
                    <div style={{ 
                      fontSize: '9px', 
                      color: '#333', 
                      marginTop: '2px',
                      textAlign: 'center',
                      fontWeight: '600',
                      background: 'rgba(255,255,255,0.9)',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}>
                      {Math.round(item.value).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Y-Axis Values */}
          <div style={{ position: 'absolute', left: '-50px', top: '0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, minValue].map((value, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#666', textAlign: 'right' }}>
                {Math.round(value).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
        
        {/* X-Axis Label */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '10px', 
          fontSize: '14px',
          fontWeight: '600',
          color: '#333'
        }}>
          {xColumn}
        </div>
        
        {/* Chart Info */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '15px', 
          fontSize: '12px', 
          color: '#666' 
        }}>
          Showing first 12 of {chartData.length} data points | 
          Range: {minValue.toLocaleString()} - {maxValue.toLocaleString()}
        </div>
      </div>
    );
  };

  return renderChart();
};

export default ChartContainer;
