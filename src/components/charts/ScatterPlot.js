import React from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ScatterPlot = ({ data, xColumn, yColumn }) => {
  // Process data for the chart
  const chartData = data.map((row, index) => ({
    x: parseFloat(row[xColumn]) || 0,
    y: parseFloat(row[yColumn]) || 0,
    name: `${row[xColumn] || `Point ${index + 1}`}`,
    originalData: row
  }));

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xColumn}
            scale="linear"
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yColumn}
            scale="linear"
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) => [value, name === 'x' ? xColumn : yColumn]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `${xColumn}: ${payload[0].payload.x}, ${yColumn}: ${payload[0].payload.y}`;
              }
              return '';
            }}
          />
          <Scatter 
            dataKey="y" 
            fill="#8884d8"
            r={6}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterPlot;
