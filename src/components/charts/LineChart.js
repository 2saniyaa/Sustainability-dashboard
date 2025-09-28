import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, xColumn, yColumn }) => {
  console.log('LineChart received:', { data, xColumn, yColumn });
  
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
    
    console.log(`LineChart row ${index}:`, { xValue, yValue, xColumn, yColumn });
    
    return {
      name: String(xValue || `Point ${index + 1}`),
      value: parseFloat(yValue) || 0,
      originalData: row
    };
  });
  
  console.log('LineChart processed data:', chartData);

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
        <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
