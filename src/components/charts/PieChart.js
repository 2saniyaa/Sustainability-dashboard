import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PieChart = ({ data, xColumn, yColumn }) => {
  // Process data for the chart
  const chartData = data.map((row, index) => ({
    name: row[xColumn] || `Item ${index + 1}`,
    value: parseFloat(row[yColumn]) || 0,
    originalData: row
  }));

  // Generate colors for each segment
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', 
    '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb',
    '#dda0dd', '#98fb98', '#f0e68c', '#ffa07a'
  ];

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={400}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, yColumn]}
            labelFormatter={(label) => `${xColumn}: ${label}`}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
