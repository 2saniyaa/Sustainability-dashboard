import React from 'react';
import './ComplianceReportGenerator.css';

const ComplianceReportGenerator = ({ data, simulatedData, hydrogenBlend, complianceStatus }) => {
  const generateReport = () => {
    if (!data || data.length === 0) {
      alert('No data available to generate report');
      return;
    }

    // Calculate comprehensive metrics
    const metrics = calculateComprehensiveMetrics();
    const reportData = generateReportData(metrics);
    
    // Create and download PDF
    createPDFReport(reportData);
  };

  const calculateComprehensiveMetrics = () => {
    const currentData = simulatedData || data;
    
    // Basic metrics
    const totalGeneration = currentData.reduce((sum, row) => sum + (parseFloat(row.Generation_MW) || 0), 0);
    const totalEmissions = currentData.reduce((sum, row) => sum + (parseFloat(row.CO2_Emissions_tonns) || 0), 0);
    const averageCarbonIntensity = currentData.reduce((sum, row) => sum + (parseFloat(row.Carbon_Intensity_kgCO2_MWh) || 0), 0) / currentData.length;
    
    // EU ETS Compliance
    const euThreshold = 350; // kgCO2/MWh
    const euCompliantMonths = currentData.filter(row => (parseFloat(row.Carbon_Intensity_kgCO2_MWh) || 0) <= euThreshold).length;
    const euComplianceRate = (euCompliantMonths / currentData.length) * 100;
    
    // CSRD Compliance (Corporate Sustainability Reporting Directive)
    const csrdThreshold = 300; // More stringent threshold for CSRD
    const csrdCompliantMonths = currentData.filter(row => (parseFloat(row.Carbon_Intensity_kgCO2_MWh) || 0) <= csrdThreshold).length;
    const csrdComplianceRate = (csrdCompliantMonths / currentData.length) * 100;
    
    // MRV Compliance (Monitoring, Reporting, Verification)
    const hasCompleteData = currentData.every(row => 
      row.Month && row.Year && row.Generation_MW && row.CO2_Emissions_tonns
    );
    const mrvComplianceRate = hasCompleteData ? 100 : 0;
    
    // Hydrogen blend impact
    const originalEmissions = data.reduce((sum, row) => sum + (parseFloat(row.CO2_Emissions_tonns) || 0), 0);
    const currentEmissions = totalEmissions;
    const emissionsReduction = originalEmissions - currentEmissions;
    const reductionPercentage = originalEmissions > 0 ? (emissionsReduction / originalEmissions) * 100 : 0;
    
    return {
      totalGeneration,
      totalEmissions,
      averageCarbonIntensity,
      euComplianceRate,
      csrdComplianceRate,
      mrvComplianceRate,
      emissionsReduction,
      reductionPercentage,
      hydrogenBlend,
      dataPoints: currentData.length,
      yearRange: getYearRange(currentData)
    };
  };

  const getYearRange = (data) => {
    const years = [...new Set(data.map(row => row.Year))].sort();
    return years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : years[0]?.toString() || 'N/A';
  };

  const generateReportData = (metrics) => {
    const currentDate = new Date().toLocaleDateString();
    const reportTitle = `Power Plant Compliance Report - ${currentDate}`;
    
    return {
      title: reportTitle,
      generatedDate: currentDate,
      facility: 'Power Plant Facility',
      metrics,
      complianceStatus: {
        euEts: {
          status: metrics.euComplianceRate >= 80 ? 'Compliant' : 'Non-Compliant',
          rate: metrics.euComplianceRate,
          threshold: 350,
          description: 'EU Emissions Trading System'
        },
        csrd: {
          status: metrics.csrdComplianceRate >= 80 ? 'Compliant' : 'Non-Compliant',
          rate: metrics.csrdComplianceRate,
          threshold: 300,
          description: 'Corporate Sustainability Reporting Directive'
        },
        mrv: {
          status: metrics.mrvComplianceRate >= 100 ? 'Compliant' : 'Non-Compliant',
          rate: metrics.mrvComplianceRate,
          threshold: 100,
          description: 'Monitoring, Reporting, Verification'
        }
      },
      recommendations: generateRecommendations(metrics)
    };
  };

  const generateRecommendations = (metrics) => {
    const recommendations = [];
    
    // EU ETS Recommendations
    if (metrics.euComplianceRate < 80) {
      recommendations.push({
        priority: 'High',
        category: 'EU ETS Compliance',
        action: `Increase hydrogen blend to ${complianceStatus?.minBlendForCompliance || 0}% to achieve compliance`,
        impact: `Will improve compliance rate from ${metrics.euComplianceRate.toFixed(1)}% to 100%`,
        timeline: '6-12 months'
      });
    }
    
    // CSRD Recommendations
    if (metrics.csrdComplianceRate < 80) {
      recommendations.push({
        priority: 'Medium',
        category: 'CSRD Compliance',
        action: 'Implement additional efficiency measures beyond hydrogen blending',
        impact: 'Will improve sustainability reporting compliance',
        timeline: '12-18 months'
      });
    }
    
    // General Recommendations
    if (metrics.hydrogenBlend > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Hydrogen Integration',
        action: `Current ${metrics.hydrogenBlend}% hydrogen blend is reducing emissions by ${metrics.reductionPercentage.toFixed(1)}%`,
        impact: `Annual CO2 savings: ${metrics.emissionsReduction.toLocaleString()} tonnes`,
        timeline: 'Ongoing'
      });
    }
    
    // Data Quality Recommendations
    if (metrics.mrvComplianceRate < 100) {
      recommendations.push({
        priority: 'Medium',
        category: 'Data Quality',
        action: 'Improve data collection and reporting processes',
        impact: 'Will ensure complete MRV compliance',
        timeline: '3-6 months'
      });
    }
    
    return recommendations;
  };

  const createPDFReport = (reportData) => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; }
          .header h1 { color: #2c3e50; margin: 0; font-size: 28px; }
          .header p { color: #7f8c8d; margin: 10px 0 0 0; font-size: 14px; }
          .section { margin: 30px 0; }
          .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          .metrics-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .metrics-table th, .metrics-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .metrics-table th { background-color: #f8f9fa; font-weight: bold; }
          .compliance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .compliance-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
          .compliant { background-color: #d5f4e6; border-color: #27ae60; }
          .non-compliant { background-color: #fadbd8; border-color: #e74c3c; }
          .recommendations { margin: 20px 0; }
          .recommendation { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #3498db; }
          .priority-high { border-left-color: #e74c3c; }
          .priority-medium { border-left-color: #f39c12; }
          .footer { margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportData.title}</h1>
          <p>Generated on ${reportData.generatedDate} | ${reportData.facility}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <p>This report provides a comprehensive analysis of regulatory compliance for the power plant facility, including EU ETS, CSRD, and MRV requirements. The analysis covers ${reportData.metrics.dataPoints} data points from ${reportData.metrics.yearRange}.</p>
        </div>

        <div class="section">
          <h2>Key Performance Metrics</h2>
          <table class="metrics-table">
            <tr><th>Metric</th><th>Value</th><th>Unit</th></tr>
            <tr><td>Total Generation</td><td>${reportData.metrics.totalGeneration.toLocaleString()}</td><td>MW</td></tr>
            <tr><td>Total CO2 Emissions</td><td>${reportData.metrics.totalEmissions.toLocaleString()}</td><td>tonnes</td></tr>
            <tr><td>Average Carbon Intensity</td><td>${reportData.metrics.averageCarbonIntensity.toFixed(1)}</td><td>kgCO2/MWh</td></tr>
            <tr><td>Hydrogen Blend</td><td>${reportData.metrics.hydrogenBlend}</td><td>%</td></tr>
            <tr><td>Emissions Reduction</td><td>${reportData.metrics.emissionsReduction.toLocaleString()}</td><td>tonnes</td></tr>
            <tr><td>Reduction Percentage</td><td>${reportData.metrics.reductionPercentage.toFixed(1)}</td><td>%</td></tr>
          </table>
        </div>

        <div class="section">
          <h2>Regulatory Compliance Status</h2>
          <div class="compliance-grid">
            <div class="compliance-card ${reportData.complianceStatus.euEts.status === 'Compliant' ? 'compliant' : 'non-compliant'}">
              <h3>EU ETS</h3>
              <p><strong>${reportData.complianceStatus.euEts.status}</strong></p>
              <p>Compliance Rate: ${reportData.complianceStatus.euEts.rate.toFixed(1)}%</p>
              <p>Threshold: ${reportData.complianceStatus.euEts.threshold} kgCO2/MWh</p>
            </div>
            <div class="compliance-card ${reportData.complianceStatus.csrd.status === 'Compliant' ? 'compliant' : 'non-compliant'}">
              <h3>CSRD</h3>
              <p><strong>${reportData.complianceStatus.csrd.status}</strong></p>
              <p>Compliance Rate: ${reportData.complianceStatus.csrd.rate.toFixed(1)}%</p>
              <p>Threshold: ${reportData.complianceStatus.csrd.threshold} kgCO2/MWh</p>
            </div>
            <div class="compliance-card ${reportData.complianceStatus.mrv.status === 'Compliant' ? 'compliant' : 'non-compliant'}">
              <h3>MRV</h3>
              <p><strong>${reportData.complianceStatus.mrv.status}</strong></p>
              <p>Compliance Rate: ${reportData.complianceStatus.mrv.rate.toFixed(1)}%</p>
              <p>Data Quality: ${reportData.complianceStatus.mrv.threshold}%</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Scenario Analysis</h2>
          <p>Current hydrogen blend scenario shows significant environmental benefits:</p>
          <ul>
            <li><strong>CO2 Reduction:</strong> ${reportData.metrics.emissionsReduction.toLocaleString()} tonnes annually (${reportData.metrics.reductionPercentage.toFixed(1)}% reduction)</li>
            <li><strong>Compliance Impact:</strong> EU ETS compliance rate of ${reportData.complianceStatus.euEts.rate.toFixed(1)}%</li>
            <li><strong>Carbon Intensity:</strong> ${reportData.metrics.averageCarbonIntensity.toFixed(1)} kgCO2/MWh (vs 350 kgCO2/MWh threshold)</li>
          </ul>
        </div>

        <div class="section">
          <h2>Recommendations</h2>
          <div class="recommendations">
            ${reportData.recommendations.map(rec => `
              <div class="recommendation priority-${rec.priority.toLowerCase()}">
                <h4>${rec.category} (${rec.priority} Priority)</h4>
                <p><strong>Action:</strong> ${rec.action}</p>
                <p><strong>Impact:</strong> ${rec.impact}</p>
                <p><strong>Timeline:</strong> ${rec.timeline}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="footer">
          <p>This report was generated automatically by the Power Plant Analytics Dashboard</p>
          <p>For questions or clarifications, please contact the facility management team</p>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Compliance_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!data || data.length === 0) {
    return (
      <div className="report-generator-placeholder">
        <p>Upload power plant data to generate compliance report</p>
      </div>
    );
  }

  return (
    <div className="compliance-report-generator">
      <div className="report-header">
        <h3>📋 Compliance Report Generator</h3>
        <p>Generate comprehensive regulatory compliance reports</p>
      </div>
      
      <div className="report-controls">
        <button 
          className="generate-report-btn"
          onClick={generateReport}
        >
          📄 Generate Compliance Report
        </button>
        
        <div className="report-info">
          <p>Report includes:</p>
          <ul>
            <li>EU ETS, CSRD, and MRV compliance status</li>
            <li>Key performance metrics summary</li>
            <li>Hydrogen blend scenario analysis</li>
            <li>Compliance recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReportGenerator;
