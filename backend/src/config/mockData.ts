// Mock data for fallback when database is not available

export const mockMetrics = [
  // Economy metrics
  { name: 'inflation', category: 'economy', value: 4.2, date: new Date('2026-02-01'), unit: 'percentage', periodType: 'monthly', source: 'INDEC' },
  { name: 'usd_official', category: 'economy', value: 1415.5, date: new Date('2026-03-10'), unit: 'ars', periodType: 'daily', source: 'BCRA' },
  { name: 'usd_blue', category: 'economy', value: 1420.0, date: new Date('2026-03-10'), unit: 'ars', periodType: 'daily', source: 'Blue Markets' },
  { name: 'usd_mep', category: 'economy', value: 1385.25, date: new Date('2026-03-10'), unit: 'ars', periodType: 'daily', source: 'MAE' },
  { name: 'usd_ccl', category: 'economy', value: 1395.0, date: new Date('2026-03-10'), unit: 'ars', periodType: 'daily', source: 'CNV' },
  { name: 'interest_rate', category: 'economy', value: 38.0, date: new Date('2026-03-10'), unit: 'percentage', periodType: 'daily', source: 'BCRA' },
  { name: 'reserves', category: 'economy', value: 28500000, date: new Date('2026-03-09'), unit: 'ars', periodType: 'daily', source: 'BCRA' },
  { name: 'country_risk', category: 'economy', value: 1785, date: new Date('2026-03-10'), unit: 'points', periodType: 'daily', source: 'JPMorgan' },
  { name: 'gdp', category: 'economy', value: -1.5, date: new Date('2025-12-31'), unit: 'percentage', periodType: 'quarterly', source: 'INDEC' },
  
  // Social metrics
  { name: 'poverty', category: 'social', value: 38.5, date: new Date('2025-09-30'), unit: 'percentage', periodType: 'quarterly', source: 'INDEC' },
  { name: 'unemployment', category: 'social', value: 7.2, date: new Date('2025-12-31'), unit: 'percentage', periodType: 'quarterly', source: 'INDEC' },
  
  // Consumption metrics
  { name: 'retail_sales', category: 'consumption', value: -2.3, date: new Date('2026-01-31'), unit: 'percentage', periodType: 'monthly', source: 'INDEC' },
];

export const mockUSDRates = {
  oficial: { buy: 1390, sell: 1441, updatedAt: new Date().toISOString() },
  blue: { buy: 1405, sell: 1425, updatedAt: new Date().toISOString() },
  mep: { buy: 1378, sell: 1395, updatedAt: new Date().toISOString() },
  ccl: { buy: 1388, sell: 1412, updatedAt: new Date().toISOString() },
  oficial_euro: { buy: 1511, sell: 1566, updatedAt: new Date().toISOString() },
  blue_euro: { buy: 1527, sell: 1549, updatedAt: new Date().toISOString() },
  brecha: { value: -1.11, unit: 'percentage' },
};

export const mockCountryRisk = {
  value: 1785,
  variation: -2.5,
  updatedAt: new Date().toISOString(),
};

export const mockInflation = {
  monthly: 4.2,
  annual: 52.3,
  last12Months: [3.2, 3.5, 4.0, 3.8, 4.1, 3.9, 4.2, 4.0, 3.8, 4.1, 4.3, 4.2],
  updatedAt: new Date().toISOString(),
};

export const mockIndicators = {
  usd: {
    oficial: 1415.5,
    blue: 1420.0,
    mep: 1385.25,
    ccl: 1395.0,
    updatedAt: new Date().toISOString(),
  },
  inflation: {
    monthly: 4.2,
    annual: 52.3,
    updatedAt: new Date().toISOString(),
  },
  interestRate: {
    value: 38.0,
    updatedAt: new Date().toISOString(),
  },
  countryRisk: {
    value: 1785,
    updatedAt: new Date().toISOString(),
  },
  reserves: {
    value: 28500000,
    updatedAt: new Date().toISOString(),
  },
};
