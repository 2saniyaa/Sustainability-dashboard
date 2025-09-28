// Demo power plant data generator
export const generateDemoData = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = [2020, 2021, 2022, 2023];
  const data = [];
  
  // Generate 4 years of monthly data (48 months total)
  years.forEach(year => {
    months.forEach((month, monthIndex) => {
      // Seasonal variation factors
      const seasonalFactor = 1 + 0.3 * Math.sin((monthIndex + 1) * Math.PI / 6); // Higher in summer/winter
      
      // Base generation (MW) with seasonal variation
      const baseGeneration = 45000 + Math.random() * 10000;
      const generation = Math.round(baseGeneration * seasonalFactor);
      
      // Gas consumption (m3) - correlates with generation
      const gasConsumption = Math.round(generation * 250 + Math.random() * 5000);
      
      // CO2 emissions (tonnes) - higher in winter due to heating
      const winterFactor = monthIndex >= 10 || monthIndex <= 2 ? 1.2 : 1.0;
      const baseEmissions = gasConsumption * 0.002; // 2kg CO2 per m3 gas
      const emissions = Math.round(baseEmissions * winterFactor * (1 + Math.random() * 0.1));
      
      // Calculate carbon intensity
      const carbonIntensity = generation > 0 ? (emissions * 1000) / generation : 0;
      
      data.push({
        Month: month,
        Year: year,
        Generation_MW: generation,
        Gas_Consumption_m3: gasConsumption,
        CO2_Emissions_tonns: emissions,
        Carbon_Intensity_kgCO2_MWh: Math.round(carbonIntensity * 100) / 100
      });
    });
  });
  
  return {
    data,
    columns: ['Month', 'Year', 'Generation_MW', 'Gas_Consumption_m3', 'CO2_Emissions_tonns', 'Carbon_Intensity_kgCO2_MWh'],
    fileName: 'demo_power_plant_data.csv',
    rowCount: data.length,
    dataType: 'power_plant'
  };
};

// Demo data description for display
export const getDemoDataDescription = () => {
  return {
    title: "European Gas-Fired Power Plant",
    description: "4-year operational dataset (2020-2023) with seasonal variations",
    features: [
      "48 months of operational data",
      "Seasonal generation patterns",
      "Realistic CO2 emissions data",
      "EU ETS compliance challenges",
      "Hydrogen blend simulation ready"
    ],
    metrics: {
      totalGeneration: "~2.4M MW over 4 years",
      averageEmissions: "~90 tonnes CO2/month",
      carbonIntensity: "~400 kgCO2/MWh average",
      complianceStatus: "Non-compliant with EU ETS (needs hydrogen blend)"
    }
  };
};
