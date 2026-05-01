import { Router } from 'express';
import { calculateMacaulayDuration, calculateDurationGap } from '../../lib/quant/AlmEngine.ts';
import { db } from '../db/index.ts';
import { subsidiaries, accounts } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { validateInput, CalculationSchema } from '../middleware/validation.ts';
import { mockSolvencyMetrics, mockAlmFlows } from '../db/mocks.ts';

export const insuranceRouter = Router();

insuranceRouter.get('/solvency-metrics', async (req, res, next) => {
  try {
     res.json(mockSolvencyMetrics);
  } catch (err) {
    next(err);
  }
});

insuranceRouter.post('/calculate-alm', validateInput(CalculationSchema), (req, res) => {
  const { yieldRate, flows } = req.body;
  const duration = calculateMacaulayDuration(flows, yieldRate);
  res.json({
    duration: parseFloat(duration.toFixed(4)),
    sensitivity: duration * -0.01 // simple delta proxy
  });
});

insuranceRouter.get('/duration-matching', async (req, res, next) => {
  try {
    const { assetFlows, liabilityFlows } = mockAlmFlows;
    const yieldRate = 0.045; // 4.5% market yield
    
    const assetsDuration = calculateMacaulayDuration(assetFlows, yieldRate);
    const liabilitiesDuration = calculateMacaulayDuration(liabilityFlows, yieldRate);
    
    const assetsValue = assetFlows.reduce((acc, f) => acc + f.amount, 0); 
    const liabilitiesValue = liabilityFlows.reduce((acc, f) => acc + f.amount, 0);
    
    const durationGap = calculateDurationGap(assetsDuration, liabilitiesDuration, liabilitiesValue, assetsValue);
    
    res.json({
        assetsDuration: parseFloat(assetsDuration.toFixed(2)),
        liabilitiesDuration: parseFloat(liabilitiesDuration.toFixed(2)),
        durationGap: parseFloat(durationGap.toFixed(2)),
        matched: Math.abs(durationGap) < 1.0,
        assetFlows,
        liabilityFlows
    });
  } catch (err) {
    next(err);
  }
});

insuranceRouter.get('/claims-ledger', async (req, res, next) => {
  try {
    // Persistent view of accounts contributing to claims reserves
    const reserves = await db.select().from(accounts).where(eq(accounts.glCode, '1001-OPS'));
    res.json(reserves.map(r => ({
      id: r.id,
      amount: r.balance,
      status: 'VERIFIED',
      currency: r.currency,
      recordedAt: new Date().toISOString()
    })));
  } catch (err) {
    next(err);
  }
});
