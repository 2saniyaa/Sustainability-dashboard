import React, { useRef } from 'react';
import Papa from 'papaparse';
import { generateDemoData } from '../data/demoData';
import './CSVUpload.css';

const CSVUpload = ({ onDataUpload }) => {
  const fileInputRef = useRef(null);
  
  // Expected columns for power plant data
  const expectedColumns = [
    'Month',
    'Year', 
    'Generation_MW',
    'Gas_Consumption_m3',
    'CO2_Emissions_tonns'
  ];

  // Validate that uploaded file has the correct columns
  const validateColumns = (columns) => {
    console.log('Validating columns:', columns);
    console.log('Expected columns:', expectedColumns);
    
    // Clean and normalize column names for comparison
    const normalizedColumns = columns.map(col => col.trim().replace(/[\s\-_]/g, '_').toLowerCase());
    const normalizedExpected = expectedColumns.map(col => col.trim().replace(/[\s\-_]/g, '_').toLowerCase());
    
    console.log('Normalized columns:', normalizedColumns);
    console.log('Normalized expected:', normalizedExpected);
    
    const missingColumns = expectedColumns.filter(expectedCol => {
      const normalizedExpectedCol = expectedCol.trim().replace(/[\s\-_]/g, '_').toLowerCase();
      return !normalizedColumns.some(col => col === normalizedExpectedCol);
    });
    
    if (missingColumns.length > 0) {
      return {
        isValid: false,
        error: `Missing required columns: ${missingColumns.join(', ')}. Expected columns: ${expectedColumns.join(', ')}. Found columns: ${columns.join(', ')}`
      };
    }
    
    return { isValid: true };
  };

  // Manual parsing fallback
  const tryManualParsing = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        console.log('Manual parsing - raw text sample:', text.substring(0, 500));
        
        const lines = text.split('\n').filter(line => line.trim());
        console.log('Manual parsing - lines count:', lines.length);
        
        if (lines.length < 2) {
          alert('File appears to be empty or invalid');
          return;
        }
        
        // Parse header
        const headerLine = lines[0];
        const headers = headerLine.split(';').map(h => h.trim());
        console.log('Manual parsing - headers:', headers);
        
        // Validate headers
        const validation = validateColumns(headers);
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }
        
        // Parse data rows
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(';').map(v => v.trim());
          const row = {};
          expectedColumns.forEach((col, colIndex) => {
            row[col] = values[colIndex] || '';
          });
          return row;
        }).filter(row => Object.values(row).some(value => value !== '' && value !== null && value !== undefined));
        
        console.log('Manual parsing - processed data sample:', data.slice(0, 2));
        
        // Clean and process the data
        const cleanedData = cleanAndProcessData(data);
        const processedColumns = [...expectedColumns, 'Carbon_Intensity_kgCO2_MWh'];
        
        onDataUpload({
          data: cleanedData,
          columns: processedColumns,
          fileName: file.name,
          rowCount: cleanedData.length,
          dataType: 'power_plant'
        });
        
      } catch (error) {
        console.error('Manual parsing error:', error);
        alert(`Error parsing CSV file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Clean and process power plant data
  const cleanAndProcessData = (rawData) => {
    return rawData.map((row, index) => {
      try {
        // Clean each field
        const cleanedRow = {};
        
        // Clean Month (remove extra spaces, tabs)
        cleanedRow.Month = String(row.Month || '').trim().replace(/[\t\n\r]/g, '');
        
        // Clean Year (convert to number)
        cleanedRow.Year = parseInt(String(row.Year || '0').replace(/[\t\n\r\s]/g, '')) || 0;
        
        // Clean Generation_MW (handle European decimal format)
        const genValue = String(row.Generation_MW || '0')
          .replace(/[\t\n\r\s]/g, '')
          .replace(',', '.');
        cleanedRow.Generation_MW = parseFloat(genValue) || 0;
        
        // Clean Gas_Consumption_m3 (handle European decimal format)
        const gasValue = String(row.Gas_Consumption_m3 || '0')
          .replace(/[\t\n\r\s]/g, '')
          .replace(',', '.');
        cleanedRow.Gas_Consumption_m3 = parseFloat(gasValue) || 0;
        
        // Clean CO2_Emissions_tonns (handle European decimal format)
        const co2Value = String(row.CO2_Emissions_tonns || '0')
          .replace(/[\t\n\r\s]/g, '')
          .replace(',', '.');
        cleanedRow.CO2_Emissions_tonns = parseFloat(co2Value) || 0;
        
        // Calculate Carbon Intensity (kgCO2/MWh)
        // Formula: (CO2_Emissions_tonns * 1000) / Generation_MW
        if (cleanedRow.Generation_MW > 0) {
          cleanedRow.Carbon_Intensity_kgCO2_MWh = (cleanedRow.CO2_Emissions_tonns * 1000) / cleanedRow.Generation_MW;
        } else {
          cleanedRow.Carbon_Intensity_kgCO2_MWh = 0;
        }
        
        // Add original row for reference
        cleanedRow._originalRow = row;
        cleanedRow._rowIndex = index;
        
        return cleanedRow;
      } catch (error) {
        console.error(`Error processing row ${index}:`, error, row);
        return null;
      }
    }).filter(row => row !== null); // Remove failed rows
  };

  const handleDemoDataLoad = () => {
    console.log('Loading demo data...');
    const demoData = generateDemoData();
    console.log('Demo data generated:', demoData);
    onDataUpload(demoData);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    // Try multiple parsing configurations - prioritize semicolon for your data
    const parseConfigs = [
      {
        header: true,
        skipEmptyLines: true,
        delimiter: ';',
        quotes: false,
        escapeChar: '"'
      },
      {
        header: true,
        skipEmptyLines: true,
        delimiter: ',',
        quotes: false,
        escapeChar: '"'
      },
      {
        header: true,
        skipEmptyLines: true,
        delimiter: '\t',
        quotes: false,
        escapeChar: '"'
      },
      {
        header: true,
        skipEmptyLines: true,
        delimiter: '',
        quotes: false,
        escapeChar: '"'
      }
    ];

    let currentConfigIndex = 0;

    const tryParse = (config) => {
      console.log('Trying parse config:', config);
      
      Papa.parse(file, {
        ...config,
        complete: (results) => {
          console.log('CSV parsing results:', results);
          console.log('Parsing errors:', results.errors);
          
          // Check if we have valid data
          const data = results.data.filter(row => {
            if (!row || typeof row !== 'object') return false;
            return Object.values(row).some(value => value !== '' && value !== null && value !== undefined);
          });
          
          console.log('Raw parsed data sample:', data.slice(0, 2));
          console.log('Raw data keys:', data[0] ? Object.keys(data[0]) : 'No data');

          let columns = results.meta.fields || (data.length > 0 ? Object.keys(data[0]) : []);
          
          console.log('Detected columns:', columns);
          
          // If no columns detected, try to extract from first row
          if (columns.length === 0 && data.length > 0) {
            const firstRow = data[0];
            if (firstRow && typeof firstRow === 'object') {
              columns = Object.keys(firstRow);
              console.log('Extracted columns from first row:', columns);
            }
          }

          // If we have data and columns, validate and process
          if (data.length > 0 && columns.length > 0) {
            console.log('Successfully parsed with config:', config);
            console.log('Raw columns found:', columns);
            console.log('First few rows of data:', data.slice(0, 3));
            
            // Validate columns
            const validation = validateColumns(columns);
            if (!validation.isValid) {
              console.error('Column validation failed:', validation.error);
              alert(validation.error);
              return;
            }
            
            // Clean and process the data
            const cleanedData = cleanAndProcessData(data);
            const processedColumns = [...expectedColumns, 'Carbon_Intensity_kgCO2_MWh'];
            
            console.log('Processed data:', { 
              data: cleanedData, 
              columns: processedColumns, 
              dataLength: cleanedData.length,
              sampleRow: cleanedData[0]
            });

            onDataUpload({
              data: cleanedData,
              columns: processedColumns,
              fileName: file.name,
              rowCount: cleanedData.length,
              dataType: 'power_plant'
            });
            return;
          }

          // If no data, try next config
          if (currentConfigIndex < parseConfigs.length - 1) {
            currentConfigIndex++;
            tryParse(parseConfigs[currentConfigIndex]);
          } else {
            // Try manual parsing as last resort
            console.log('Automatic parsing failed, trying manual parsing...');
            tryManualParsing(file);
          }
        },
        error: (error) => {
          console.error('CSV parsing error with config:', config, error);
          
          // Try next config if available
          if (currentConfigIndex < parseConfigs.length - 1) {
            currentConfigIndex++;
            tryParse(parseConfigs[currentConfigIndex]);
          } else {
            alert(`Error reading CSV file: ${error.message}. Please try a different file or check the file format.`);
          }
        }
      });
    };

    // Start with first config
    tryParse(parseConfigs[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      };
      handleFileUpload(fakeEvent);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="csv-upload">
      <div 
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <div className="upload-icon">⚡</div>
          <h3>Upload Power Plant Data</h3>
          <p>Drag and drop your CSV file here, or click to browse</p>
          <div className="expected-format">
            <p><strong>Expected columns:</strong></p>
            <p>Month; Year; Generation_MW; Gas_Consumption_m3; CO2_Emissions_tonns</p>
          </div>
          <button className="upload-button">Choose File</button>
        </div>
      </div>
      
      <div className="demo-section">
        <div className="demo-divider">
          <span>OR</span>
        </div>
        
        <div className="demo-content">
          <h4>🚀 Try Demo Data</h4>
          <p>Load a realistic 4-year power plant dataset to explore the dashboard</p>
          <div className="demo-features">
            <span className="demo-feature">48 months of data</span>
            <span className="demo-feature">Seasonal patterns</span>
            <span className="demo-feature">EU ETS compliance challenges</span>
          </div>
          <button 
            className="demo-button"
            onClick={handleDemoDataLoad}
          >
            📊 Load Demo Data
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CSVUpload;
