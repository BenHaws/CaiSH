import { Router } from 'express';
import { db, getTenantId } from '../db/index.ts';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { subsidiaries, accounts, virtualLedger } from '../db/schema.ts';
import { transformMXToNexus } from '../services/isoTransformer.ts';
import { mockPayments, mockRiskAlerts, mockEnergyHedges, mockFXExposures } from '../db/mocks.ts';

export const treasuryRouter = Router();

// Energy & Commodity Specific Routes
treasuryRouter.get('/energy/basis-hubs', (req, res) => {
  res.json([
    { id: 'hub-1', name: 'Henry Hub', benchmarkRef: 'NYMEX', isNodal: false },
    { id: 'hub-2', name: 'Waha Hub', benchmarkRef: 'Permian', pipelineTariff: 0.15, isNodal: false },
    { id: 'hub-3', name: 'SoCal Citygate', benchmarkRef: 'SoCal', pipelineTariff: 0.22, isNodal: true },
  ]);
});

treasuryRouter.get('/energy/hedges', (req, res) => {
  res.json(mockEnergyHedges);
});

treasuryRouter.get('/energy/simulate-cva', (req, res) => {
  // Use v4.0 Quantitative engine logic (simulated for route response)
  res.json({
    epe: [100, 120, 140, 130, 110, 90, 70],
    ene: [50, 40, 30, 20, 10, 5, 0],
    cva: 12500,
    dva: 4200,
    bcva: 8300,
    paths: 1000
  });
});

treasuryRouter.post('/execute-strategy', async (req, res, next) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  
  try {
    const result = db.transaction((tx) => {
      // 1. Validate accounts and balances
      const [fromAcc] = tx.select().from(accounts).where(eq(accounts.id, fromAccountId)).all();
      const [toAcc] = tx.select().from(accounts).where(eq(accounts.id, toAccountId)).all();
      
      if (!fromAcc || !toAcc) throw new Error('Source or destination account not found');
      if (fromAcc.balance < amount) throw new Error('Insufficient liquidity in source relay');

      const transId = uuidv4();
      const timestamp = new Date().toISOString();

      // 2. Atomic Balance Updates
      tx.update(accounts)
        .set({ balance: sql`${accounts.balance} - ${amount}` })
        .where(eq(accounts.id, fromAccountId))
        .run();
      
      tx.update(accounts)
        .set({ balance: sql`${accounts.balance} + ${amount}` })
        .where(eq(accounts.id, toAccountId))
        .run();

      // 3. Ledger Entries (Double-Entry Bookkeeping)
      tx.insert(virtualLedger).values([
        {
          id: `VL-${transId}-D`,
          tenantId: getTenantId(),
          accountId: fromAccountId,
          amount: amount,
          currency: fromAcc.currency,
          description: description,
          type: 'DEBIT',
          status: 'settled',
          createdAt: timestamp
        },
        {
          id: `VL-${transId}-C`,
          tenantId: getTenantId(),
          accountId: toAccountId,
          amount: amount,
          currency: toAcc.currency,
          description: description,
          type: 'CREDIT',
          status: 'settled',
          createdAt: timestamp
        }
      ]).run();

      return { transId, status: 'SUCCESS' };
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ status: 'FAILED', error: err.message });
  }
});

treasuryRouter.post('/iso-ingest', (req, res, next) => {
  try {
    const { xml } = req.body;
    if (!xml) throw new Error('Missing XML payload');
    
    const result = transformMXToNexus(xml);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

treasuryRouter.get('/entities', async (req, res, next) => {
  try {
    const results = await db.select().from(subsidiaries);
    res.json(results);
  } catch (err: any) {
    next(err);
  }
});

treasuryRouter.get('/accounts', async (req, res, next) => {
  try {
    const entityId = req.query.entityId as string;
    let query = db.select().from(accounts);
    if (entityId) {
      // @ts-ignore
      query = query.where(eq(accounts.entityId, entityId));
    }
    const results = await query;
    res.json(results);
  } catch (err: any) {
    next(err);
  }
});

treasuryRouter.post('/simulate-liquidity', (req, res) => {
  const { currentCash, driftRate, volatility, horizon } = req.body;
  
  const iterations = 1000;
  const paths = [];
  const dt = 1 / 365;
  
  const lambda = 0.1;
  const jumpMean = -0.05;
  const jumpVol = 0.1;

  for (let i = 0; i < iterations; i++) {
    let pathValue = currentCash;
    for (let t = 0; t < horizon; t++) {
      const dW = Math.random() * 2 - 1;
      const drift = (driftRate - 0.5 * Math.pow(volatility, 2)) * dt;
      const diffusion = volatility * Math.sqrt(dt) * dW;
      
      let jump = 0;
      if (Math.random() < lambda * dt) {
         const J = jumpMean + jumpVol * (Math.random() * 2 - 1);
         jump = Math.exp(J) - 1;
      }

      pathValue = pathValue * Math.exp(drift + diffusion) * (1 + jump);
    }
    paths.push(pathValue);
  }

  const successCount = paths.filter(v => v > 0).length;
  const chanceOfSurvival = (successCount / iterations) * 100;
  const expectedLow = Math.min(...paths);
  const sortedPaths = paths.sort((a, b) => a - b);
  const var95 = sortedPaths[Math.floor(iterations * 0.05)];

  const dailyProjection = Array.from({ length: horizon }, (_, i) => ({
    day: i + 1,
    cash: currentCash * (1 + (driftRate / 365) * (i + 1)) + (Math.random() - 0.5) * currentCash * 0.05
  }));

  res.json({
    chanceOfSurvival: chanceOfSurvival.toFixed(2),
    expectedLow: expectedLow.toFixed(2),
    var95: var95.toFixed(2),
    status: 'CALCULATION_COMPLETE',
    dailyProjection
  });
});

treasuryRouter.get('/fx-exposure', (req, res) => {
  res.json(mockFXExposures);
});

treasuryRouter.get('/payments', (req, res) => {
  res.json(mockPayments);
});

treasuryRouter.get('/ledger', (req, res) => {
  res.json([
    { id: 'JE-901', date: new Date().toISOString(), description: 'ZBA Sweep from Sub-NA', account: '1001-OPS', debit: 2500000, credit: null, currency: 'USD', type: 'liquidity', referenceRelay: 'Sub-NA' },
    { id: 'JE-902', date: new Date().toISOString(), description: 'FX Spot Sell EUR/USD', account: '2001-OPS', debit: null, credit: 500000, currency: 'EUR', type: 'trade', referenceRelay: 'Sub-EMEA' },
    { id: 'JE-903', date: new Date().toISOString(), description: 'Relay Connectivity Fee', account: '1002-PAY', debit: 125, credit: null, currency: 'USD', type: 'fee', referenceRelay: 'Main-HQ' },
    { id: 'JE-904', date: new Date().toISOString(), description: 'Intercompany Dividend Repatriation', account: '3001-TRE', debit: 1500000, credit: null, currency: 'SGD', type: 'liquidity', referenceRelay: 'Sub-APAC' },
    { id: 'JE-905', date: new Date().toISOString(), description: 'Balance Adjustment: JP Morgan', account: '1001-OPS', debit: null, credit: 450, currency: 'USD', type: 'adjustment', referenceRelay: 'Sub-NA' },
  ]);
});
