import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChart = ({ data, xColumn, yColumn }) => {
  // Process data for the chart
  const chartData = data.map((row, index) => ({
    name: row[xColumn] || `Point ${index + 1}`,
    value: parseFloat(row[yColumn]) || 0,
    originalData: row
  }));

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsAreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
