import { Router } from 'express';
import { mockEntities, mockIntercompanyInvoices } from '../db/mocks.ts';

export const retailRouter = Router();

retailRouter.get('/intercompany-invoices', (req, res) => {
  res.json(mockIntercompanyInvoices);
});

retailRouter.post('/calculate-netting', (req, res) => {
  const positions: Record<string, number> = {};

  mockIntercompanyInvoices.forEach(inv => {
    let amountInUSD = inv.amount;
    if (inv.currency === 'EUR') amountInUSD = inv.amount * 1.08;
    if (inv.currency === 'SGD') amountInUSD = inv.amount * 0.74;

    if (!positions[inv.debtorId]) positions[inv.debtorId] = 0;
    if (!positions[inv.creditorId]) positions[inv.creditorId] = 0;

    positions[inv.debtorId] -= amountInUSD;
    positions[inv.creditorId] += amountInUSD;
  });

  const results = Object.entries(positions).map(([entityId, netAmount]) => {
    const entity = mockEntities.find(e => e.id === entityId);
    return {
      entityId,
      entityName: entity?.name || 'Unknown',
      netAmount,
      direction: netAmount < 0 ? 'PAY' : 'RECEIVE',
      currency: 'USD'
    };
  });

  const totalVolume = mockIntercompanyInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const savings = totalVolume * 0.013; 

  res.json({
    cycleId: `NET_CYCLE_${Math.random().toString(36).substring(7).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    netFlows: results,
    stats: {
      totalInvoices: mockIntercompanyInvoices.length,
      originalVolume: totalVolume,
      clearedVolume: results.reduce((acc, r) => acc + Math.abs(r.netAmount), 0) / 2,
      leakageSavings: savings
    }
  });
});

retailRouter.post('/execute-netting', (req, res) => {
  const { cycleId } = req.body;
  res.json({
    status: 'EXECUTED',
    cycleId,
    traceId: `BATCH_${Math.random().toString(36).substring(7).toUpperCase()}`,
    settlementDate: new Date(Date.now() + 86400000).toISOString()
  });
});
