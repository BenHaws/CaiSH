import { Router } from 'express';
import { db } from '../db/index.ts';
import { accounts } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export const verticalsRouter = Router();

// Manufacturing
verticalsRouter.get('/manufacturing/inventory', (req, res) => {
  res.json([
    { sku: 'RAW-ST-01', name: 'Stainless Steel Sheet', quantity: 450, unitCost: 120, agingDays: 14, category: 'RAW' },
    { sku: 'WIP-GB-04', name: 'Gearbox Assembly (Partial)', quantity: 25, unitCost: 4500, agingDays: 45, category: 'WIP' },
    { sku: 'FIN-EX-09', name: 'Industrial Excavator Unit', quantity: 12, unitCost: 85000, agingDays: 5, category: 'FINISHED' },
    { sku: 'FIN-EX-12', name: 'Excavator Unit (Stale)', quantity: 4, unitCost: 85000, agingDays: 125, category: 'FINISHED' }
  ]);
});

verticalsRouter.post('/manufacturing/calculate-ibl', (req, res) => {
  const { items, advanceRate = 0.85 } = req.body;
  const eligibleStock = items.filter((item: any) => item.agingDays <= 90);
  const eligibleValue = eligibleStock.reduce((acc: number, item: any) => acc + (item.quantity * item.unitCost), 0);

  const bbTotal = eligibleStock.reduce((acc: number, item: any) => {
      let categoryWeight = 0.85; 
      if (item.category === 'RAW') categoryWeight = 0.60;
      if (item.category === 'WIP') categoryWeight = 0.30; 
      return acc + (item.quantity * item.unitCost * categoryWeight * advanceRate);
  }, 0);

  res.json({ status: "SUCCESS", borrowingLimit: bbTotal, eligibleStockValue: eligibleValue });
});

verticalsRouter.get('/manufacturing/inventory-aging', (req, res) => {
  const items = [];
  const categories = ['RAW', 'WIP', 'FINISHED'];
  for (let i = 0; i < 48; i++) {
      items.push({
          id: `SKU-${i}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          aging: Math.floor(Math.random() * 120),
          value: Math.floor(Math.random() * 5000) + 1000
      });
  }
  res.json(items);
});

// Real Estate
verticalsRouter.get('/real-estate/trust-accounts', async (req, res, next) => {
  try {
    const trustAccounts = await db.select().from(accounts).where(eq(accounts.glCode, '1001-OPS'));
    res.json(trustAccounts.map(acc => ({
        id: acc.id,
        propertyName: `Property ${acc.id.slice(-4)}`,
        accountType: acc.glCode === '1001-OPS' ? 'ESCROW' : 'RENT_COLLECTION',
        balance: acc.balance,
        status: 'PROTECTED',
        lastTransaction: new Date().toISOString()
    })));
  } catch (err) {
    next(err);
  }
});

verticalsRouter.post('/real-estate/sweep', (req, res) => {
  const { amount } = req.body;
  res.json({
    success: true,
    totalSwept: amount * 0.25,
    traceId: `V_JRNL_${Math.random().toString(36).substring(7).toUpperCase()}`,
    timestamp: new Date().toISOString()
  });
});

verticalsRouter.get('/real-estate/sweep-rules', (req, res) => {
  res.json([
    { id: 'SR-001', propertyId: 'P-99', sourceAccountId: 'TR-002', targetAccountId: 'TR-001', percentage: 0.25 }
  ]);
});

// Tech
verticalsRouter.get('/tech/valuation', (req, res) => {
  res.json({
    arr: 45000000, nrr: 118, churnRate: 3.5, magicNumber: 1.2, burnMultiple: 1.8, trlLevel: 7, defensibilityScore: 88, ipMultiplier: 1.18,
    terminalValue: { median: 480000000, p95: 620000000, p5: 390000000 }
  });
});

verticalsRouter.get('/tech/patents', (req, res) => {
  res.json([
    { id: 'PAT-001', title: 'Data Flywheel Orchestrator', trl: 8, status: 'Analyzed', score: 92 },
    { id: 'PAT-002', title: 'Exponential Scaling Algorithm', trl: 6, status: 'Analyzed', score: 85 },
    { id: 'PAT-003', title: 'Privacy-Preserving Nexus Layer', trl: 4, status: 'Pending', score: 0 }
  ]);
});

verticalsRouter.get('/tech/ip-scanner', (req, res) => {
  res.json({
    commitDensity: 42.5,
    libraryDependencies: ['@google/genai', 'framer-motion', 'recharts', 'd3'],
    codeUniquenessScore: 94.2,
    lastSync: new Date().toISOString()
  });
});

// Energy
verticalsRouter.get('/energy/market-state', (req, res) => {
  const spotPrice = 78.45;
  const forwardCurve = ['May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26'].map((m, i) => ({
    period: m, price: spotPrice + (i * 0.8), type: 'Monthly'
  }));
  res.json({ spotPrice, marketShape: 'Contango', forwardCurve, pfeValue: 12500000, varValue: 4200000 });
});

verticalsRouter.post('/energy/recall', (req, res) => {
  res.json({ status: 'PENDING', uetr: `UETR-${Math.random().toString(36).substring(7).toUpperCase()}` });
});

// Debt
verticalsRouter.get('/debt-investments', (req, res) => {
  res.json([
    { 
      id: 'debt-1', 
      name: 'Global Series A Bond', 
      principal: 500000000, 
      currency: 'USD', 
      currentRate: 4.2, 
      type: 'Bond', 
      maturityDate: '2032-12-15',
      valuations: [{ date: new Date().toISOString(), mtm: 498000000 }],
      couponHistory: [
        { date: '2025-12-15', amount: 10500000, status: 'Paid' },
        { date: '2025-06-15', amount: 10500000, status: 'Paid' },
        { date: '2024-12-15', amount: 10500000, status: 'Paid' }
      ]
    },
    { 
      id: 'debt-2', 
      name: 'Term Loan B', 
      principal: 250000000, 
      currency: 'SGD', 
      currentRate: 6.8, 
      type: 'Term Loan',
      maturityDate: '2029-06-30',
      valuations: [{ date: new Date().toISOString(), mtm: 248500000 }],
      couponHistory: [
        { date: '2025-03-31', amount: 4250000, status: 'Paid' },
        { date: '2025-06-30', amount: 4250000, status: 'Pending' }
      ]
    }
  ]);
});

verticalsRouter.post('/debt/sensitivity', (req, res) => {
  res.json({ shockScenario: "+100bps", pAndLImpact: -1420000, complianceReady: true });
});
