import React, { useState } from 'react';
import './DataTable.css';

const DataTable = ({ data, columns }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const itemsPerPage = 10;

  console.log('DataTable props:', { data, columns });
  console.log('First data row keys:', data[0] ? Object.keys(data[0]) : 'No data');
  console.log('First data row values:', data[0] ? Object.values(data[0]) : 'No data');

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="data-table">
        <h3>Data Table</h3>
        <p>No data available</p>
      </div>
    );
  }

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return (
      <div className="data-table">
        <h3>Data Table</h3>
        <p>No columns available</p>
      </div>
    );
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const getSortIcon = (column) => {
    if (sortColumn !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="data-table">
      <div className="table-header">
        <h3>Data Table</h3>
        <p>Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} rows</p>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column}
                  onClick={() => handleSort(column)}
                  className="sortable"
                >
                  {column} {getSortIcon(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr key={startIndex + index}>
                {columns.map((column) => (
                  <td key={column}>
                    {row[column] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
