import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, xColumn, yColumn }) => {
  console.log('BarChart received:', { data, xColumn, yColumn });
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '400px',
          color: '#666',
          fontSize: '16px'
        }}>
          No data available
        </div>
      </div>
    );
  }

  // Process data for the chart
  const chartData = data.map((row, index) => {
    const xValue = row[xColumn];
    const yValue = row[yColumn];
    
    console.log(`Processing row ${index}:`, { xValue, yValue, xColumn, yColumn });
    
    return {
      name: String(xValue || `Item ${index + 1}`),
      value: parseFloat(yValue) || 0,
      originalData: row
    };
  }); // Remove the filter to see all data, even zeros
  
  console.log('All chart data (including zeros):', chartData);
  
  console.log('Processed chart data:', chartData);

  if (chartData.length === 0) {
    return (
      <div className="chart">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '400px',
          color: '#666',
          fontSize: '16px'
        }}>
          No valid data found for the selected columns
        </div>
      </div>
    );
  }

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [value, yColumn]}
            labelFormatter={(label) => `${xColumn}: ${label}`}
          />
          <Bar 
            dataKey="value" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
