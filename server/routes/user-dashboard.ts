import { Router } from 'express';

export const dashboardRouter = Router();

// Dashboard Persistence
let userDashboard = {
  id: 'dash-001',
  userId: 'Ben@cwgs.wtf',
  entityId: '1',
  name: 'Executive Liquidity View',
  config: [
    { id: 'w1', componentKey: 'LIQUIDITY_OVERVIEW', w: 12, title: 'Global Liquidity' },
    { id: 'w2', componentKey: 'FX_EXPOSURE_MINI', w: 6, title: 'Top FX Risks' },
    { id: 'w3', componentKey: 'PENDING_PAYMENTS', w: 6, title: 'Strategic Payments' },
    { id: 'oil-gas-hedge-effectiveness', componentKey: 'OIL_GAS_HEDGE_EFFECTIVENESS', w: 6, title: 'Hedge Effectiveness' },
    { id: 'oil-gas-basis-risk', componentKey: 'OIL_GAS_BASIS_RISK', w: 6, title: 'Basis Risk Curve' },
  ],
  updatedAt: new Date().toISOString()
};

dashboardRouter.get('/', (req, res) => {
  res.json(userDashboard);
});

dashboardRouter.post('/', (req, res) => {
  userDashboard = { ...userDashboard, ...req.body, updatedAt: new Date().toISOString() };
  res.json(userDashboard);
});

// Connectivity & Discovery
dashboardRouter.post('/discovery/start', (req, res) => {
  setTimeout(() => {
    const discovered = [
      { bankName: 'JP Morgan Chase', accountType: 'Operating', suggestedGL: '1000-001', balance: 12500000, currency: 'USD', confidence: 0.98 },
      { bankName: 'HSBC London', accountType: 'Tax', suggestedGL: '2100-050', balance: 4200000, currency: 'GBP', confidence: 0.92 },
      { bankName: 'BNP Paribas', accountType: 'Payroll', suggestedGL: '1000-005', balance: 850000, currency: 'EUR', confidence: 0.89 },
      { bankName: 'Goldman Sachs', accountType: 'Investment', suggestedGL: '1500-100', balance: 25000000, currency: 'USD', confidence: 0.95 },
    ];
    res.json(discovered);
  }, 2000);
});
