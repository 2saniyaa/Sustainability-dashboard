import React, { useState } from 'react';
import CSVUpload from './CSVUpload';
import CarbonIntensityChart from './charts/CarbonIntensityChart';
import DualAxisChart from './charts/DualAxisChart';
import AnnualSummaryCards from './AnnualSummaryCards';
import ComplianceStatus from './ComplianceStatus';
import HydrogenSimulation from './HydrogenSimulation';
import ComplianceReportGenerator from './ComplianceReportGenerator';
import DataTable from './DataTable';
import './Dashboard.css';

const Dashboard = () => {
  const [csvData, setCsvData] = useState(null);
  const [simulatedData, setSimulatedData] = useState(null);
  const [hydrogenBlend, setHydrogenBlend] = useState(0);
  const [complianceStatus, setComplianceStatus] = useState(null);

  const handleDataUpload = (uploadData) => {
    console.log('Dashboard received data:', uploadData);
    setCsvData(uploadData);
    setSimulatedData(null); // Reset simulation when new data is uploaded
    setHydrogenBlend(0);
    setComplianceStatus(null);
  };

  const handleSimulationUpdate = (newSimulatedData) => {
    setSimulatedData(newSimulatedData);
  };

  const handleComplianceUpdate = (status) => {
    setComplianceStatus(status);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>⚡ Power Plant Analytics Dashboard</h1>
        <p>Comprehensive energy generation and emissions analysis with EU ETS compliance monitoring</p>
      </header>

      <div className="dashboard-content">
        <div className="upload-section">
          <CSVUpload onDataUpload={handleDataUpload} />
        </div>

        {csvData && (
          <div className="visualization-section">
            {/* Hydrogen Simulation Panel */}
            <div className="simulation-section">
              <HydrogenSimulation 
                data={csvData.data} 
                onDataUpdate={handleSimulationUpdate}
                onComplianceUpdate={handleComplianceUpdate}
              />
            </div>

            {/* Compliance Report Generator */}
            <div className="report-section">
              <ComplianceReportGenerator 
                data={csvData.data}
                simulatedData={simulatedData}
                hydrogenBlend={hydrogenBlend}
                complianceStatus={complianceStatus}
              />
            </div>

            {/* Annual Summary Cards */}
            <div className="summary-section">
              <AnnualSummaryCards data={simulatedData || csvData.data} />
            </div>

            {/* Compliance Status */}
            <div className="compliance-section">
              <ComplianceStatus data={simulatedData || csvData.data} />
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              <div className="chart-item">
                <CarbonIntensityChart 
                  data={simulatedData || csvData.data} 
                  isSimulated={!!simulatedData}
                />
              </div>
              
              <div className="chart-item">
                <DualAxisChart data={simulatedData || csvData.data} />
              </div>
            </div>

            {/* Data Table */}
            <div className="table-section">
              <DataTable 
                data={simulatedData || csvData.data} 
                columns={csvData.columns} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
