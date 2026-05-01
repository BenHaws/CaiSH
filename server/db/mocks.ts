// [TEMPLATE] Mock Data for the Nexus Topology
export const mockEntities = [
  { id: '1', name: 'Global Parent Corp', baseCurrency: 'USD', parentId: null, type: 'Holding', region: 'Global' },
  { id: '2', name: 'Subsidiary North America', baseCurrency: 'USD', parentId: '1', type: 'Operating', region: 'NORAM' },
  { id: '3', name: 'Subsidiary EMEA', baseCurrency: 'EUR', parentId: '1', type: 'Operating', region: 'EMEA' },
  { id: '4', name: 'Subsidiary APAC', baseCurrency: 'SGD', parentId: '1', type: 'Operating', region: 'APAC' },
  { id: '5', name: 'Subsidiary LATAM', baseCurrency: 'BRL', parentId: '1', type: 'Operating', region: 'LATAM' },
];

// [TEMPLATE] Mock Accounts
export const mockAccounts = [
  { id: 'acc1', name: 'Main Operational', bank: 'J.P. Morgan', entityId: '2', balance: 45000000, currency: 'USD', glCode: '1001-OPS', status: 'active' },
  { id: 'acc2', name: 'Payroll Account', bank: 'Citi', entityId: '2', balance: 12000000, currency: 'USD', glCode: '1002-PAY', status: 'active' },
  { id: 'acc3', name: 'EMEA Ops', bank: 'HSBC', entityId: '3', balance: 28000000, currency: 'EUR', glCode: '2001-OPS', status: 'active' },
  { id: 'acc4', name: 'APAC Treasury', bank: 'DBS', entityId: '4', balance: 15000000, currency: 'SGD', glCode: '3001-TRE', status: 'active' },
  { id: 'acc5', name: 'Special Purpose Vehicle', bank: 'Goldman Sachs', entityId: '1', balance: 5000000, currency: 'USD', glCode: '9001-SPV', status: 'restricted' },
];

// [TEMPLATE] Mock Admin Users
export const adminUsers = [
  { id: '1', email: 'Ben@cwgs.wtf', role: 'ADMIN', entityId: '1', status: 'active' },
  { id: '2', email: 'sarah.cfo@lattice.com', role: 'TREASURER', entityId: '1', status: 'active' },
  { id: '3', email: 'auditor.gen@pwc.com', role: 'AUDITOR', entityId: '1', status: 'pending' },
];

// [TEMPLATE] Mock Payments for Integrity Guard
export const mockPayments = [
  { id: 'PAY-7721', beneficiary: 'Acme Logistics', amount: 1250000, currency: 'USD', status: 'pending', riskScore: 82, type: 'Supplier', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'PAY-8812', beneficiary: 'Grid Systems Inc', amount: 450000, currency: 'EUR', status: 'approved', riskScore: 12, type: 'Operational', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'PAY-9011', beneficiary: 'Neural Core Ltd', amount: 2100000, currency: 'SGD', status: 'flagged', riskScore: 65, type: 'Internal', createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 'PAY-3342', beneficiary: 'Skyline Real Estate', amount: 890000, currency: 'USD', status: 'pending', riskScore: 24, type: 'Capital', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'PAY-1102', beneficiary: 'Quantum Corp', amount: 3200000, currency: 'USD', status: 'rejected', riskScore: 98, type: 'High Value', createdAt: new Date(Date.now() - 18000000).toISOString() },
];

// [TEMPLATE] Mock Scenarios for Scenario Engine
export const mockScenarios = [
  { id: 'SCN-001', name: 'Global Supply Chain Break', impact: -0.15, probability: 0.25, status: 'simulated' },
  { id: 'SCN-002', name: 'Oil Price Spike +40%', impact: -0.08, probability: 0.12, status: 'active' },
  { id: 'SCN-003', name: 'Tech Valuation Correction', impact: -0.22, probability: 0.08, status: 'draft' },
];

// [TEMPLATE] Mock Risk Alerts
export const mockRiskAlerts = [
  { id: 'ALR-01', severity: 'high', type: 'FX Exposure', title: 'SGD/USD Breach', description: 'Threshold 1.34 exceeded.' },
  { id: 'ALR-02', severity: 'medium', type: 'Liquidity', title: 'Concentration Warning', description: 'HSBC Exposure > 35% of EMEA Group.' },
];

// [TEMPLATE] Mock Security Audits
export const mockSecurityAudits = [
  { id: 'AUTH-101', timestamp: new Date().toISOString(), event: 'RLS Context Verification', actor: 'SYSTEM_DAEMON', severity: 'low', node: 'GLOBAL_ROOT', status: 'verified' },
  { id: 'AUTH-102', timestamp: new Date().toISOString(), event: 'Multi-Tenant Boundary Check', actor: 'Ben@cwgs.wtf', severity: 'low', node: 'SUB_EMEA', status: 'verified' },
  { id: 'AUTH-103', timestamp: new Date().toISOString(), event: 'Anomalous Node Request', actor: 'IP_88.192.x.x', severity: 'high', node: 'SUB_APAC', status: 'flagged' },
  { id: 'AUTH-104', timestamp: new Date().toISOString(), event: 'Gateway Key Rotation', actor: 'SYSTEM_DAEMON', severity: 'medium', node: 'HQ_VAULT', status: 'locked' },
];

// [TEMPLATE] Mock Compliance Scores
export const mockComplianceScores = [
  { category: 'IFRS 9 Reporting', score: 98, status: 'compliant', lastAudit: '2026-04-20' },
  { category: 'Anti-Money Laundering (AML)', score: 99, status: 'compliant', lastAudit: '2026-04-22' },
  { category: 'Regional Tax (EU/VAT)', score: 85, status: 'warning', lastAudit: '2026-04-18' },
  { category: 'Identity Isolation', score: 100, status: 'compliant', lastAudit: '2026-04-23' },
];

// [TEMPLATE] Mock Suppliers for Working Capital
export const mockSuppliers = [
  {
    id: 'sup-1',
    name: 'Nvidia Corp (GPU Logistics)',
    taxId: 'TX-998877',
    kycStatus: 'Verified',
    uboStatus: 'Verified',
    bankAccount: '**** 8822',
    invoices: [
      { id: 'inv-1', invoiceNumber: 'INV-2026-001', amount: 4500000, currency: 'USD', dueDate: '2026-05-15', status: 'Approved' },
      { id: 'inv-2', invoiceNumber: 'INV-2026-002', amount: 2800000, currency: 'USD', dueDate: '2026-06-01', status: 'Pending' },
    ]
  },
  {
    id: 'sup-2',
    name: 'ASML Systems',
    taxId: 'EU-112233',
    kycStatus: 'ActionRequired',
    uboStatus: 'Pending',
    bankAccount: '**** 4455',
    invoices: [
      { id: 'inv-3', invoiceNumber: 'EUR-992-B', amount: 12000000, currency: 'EUR', dueDate: '2026-05-20', status: 'Approved' },
    ]
  }
];

// [TEMPLATE] Mock Bids for Invoice Factoring
export const mockBids = [
  { id: 'bid-1', invoiceId: 'inv-1', financierId: 'fin-1', financierName: 'Citadel Treasury', apr: 4.5, totalCost: 12500, expiryDate: '2026-04-25', createdAt: '2026-04-23T10:00:00Z' },
  { id: 'bid-2', invoiceId: 'inv-1', financierId: 'fin-2', financierName: 'BlackRock Capital', apr: 4.25, totalCost: 11800, expiryDate: '2026-04-26', createdAt: '2026-04-23T11:00:00Z' },
  { id: 'bid-3', financierId: 'fin-3', discountRate: 4.25, createdAt: '2026-04-23T10:30:00Z' },
];

// [TEMPLATE] Mock Commodity Prices for Energy Hedging
export const mockCommodities = [
  { symbol: 'CL', name: 'Crude Oil', price: 82.45, change: 1.2, unit: 'BBL' },
  { symbol: 'NG', name: 'Natural Gas', price: 2.15, change: -0.4, unit: 'MMBtu' },
  { symbol: 'RB', name: 'Gasoline', price: 2.72, change: 0.8, unit: 'GAL' },
  { symbol: 'HO', name: 'Heating Oil', price: 2.65, change: 0.3, unit: 'GAL' },
];

// [TEMPLATE] Mock Energy Hedges
export const mockEnergyHedges = [
  { id: 'HDG-001', type: 'Swap', commodity: 'Crude Oil', volume: 50000, fixedPrice: 78.50, expiry: '2026-12-31', status: 'active' },
  { id: 'HDG-002', type: 'Call Option', commodity: 'Natural Gas', volume: 100000, strikePrice: 2.50, expiry: '2026-06-30', status: 'pending' },
];

// [TEMPLATE] Mock Solvency Data
export const mockSolvencyMetrics = {
  scr: 500000000,
  mcr: 175000000,
  solvencyRatio: 1.85,
  confidenceLevel: 0.995,
  riskSegments: [
    { name: 'Market', value: 450000000 },
    { name: 'Credit', value: 120000000 },
    { name: 'Operational', value: 80000000 },
    { name: 'Diversification', value: 150000000, isNegative: true }
  ]
};

// [TEMPLATE] Mock ALM Flows
export const mockAlmFlows = {
  assetFlows: [{ timeInYears: 1, amount: 50 }, { timeInYears: 5, amount: 150 }, { timeInYears: 10, amount: 600 }],
  liabilityFlows: [{ timeInYears: 3, amount: 200 }, { timeInYears: 8, amount: 400 }, { timeInYears: 15, amount: 500 }]
};

// [TEMPLATE] Mock Intercompany Invoices for Netting
// [TEMPLATE] Mock FX Exposures
export const mockFXExposures = [
  { currency: 'EUR', balance: 4500000, usdEquivalent: 4860000, change24h: 0.12, riskLevel: 'low' },
  { currency: 'GBP', balance: 2100000, usdEquivalent: 2625000, change24h: -0.45, riskLevel: 'medium' },
  { currency: 'JPY', balance: 120000000, usdEquivalent: 810000, change24h: 1.2, riskLevel: 'high' },
  { currency: 'CHF', balance: 350000, usdEquivalent: 395000, change24h: 0.05, riskLevel: 'low' },
];

export const mockIntercompanyInvoices = [
  { id: 'INV-IC-1', debtorId: '2', creditorId: '3', amount: 2500000, currency: 'USD', status: 'OPEN', createdAt: '2026-04-20' },
  { id: 'INV-IC-2', debtorId: '3', creditorId: '2', amount: 1200000, currency: 'EUR', status: 'OPEN', createdAt: '2026-04-21' },
  { id: 'INV-IC-3', debtorId: '4', creditorId: '2', amount: 800000, currency: 'SGD', status: 'OPEN', createdAt: '2026-04-22' },
  { id: 'INV-IC-4', debtorId: '2', creditorId: '4', amount: 1500000, currency: 'USD', status: 'OPEN', createdAt: '2026-04-23' },
  { id: 'INV-IC-5', debtorId: '3', creditorId: '4', amount: 900000, currency: 'EUR', status: 'OPEN', createdAt: '2026-04-24' },
];
