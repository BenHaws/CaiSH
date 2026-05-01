import { Router } from 'express';
import { mockEntities, mockSuppliers, mockBids } from '../db/mocks.ts';

export const workingCapitalRouter = Router();

workingCapitalRouter.get('/suppliers', (req, res) => {
  res.json(mockSuppliers);
});

workingCapitalRouter.get('/portfolio', (req, res) => {
  res.json({
    aum: 4500000000,
    cagr: 12.4,
    riskScore: 88,
    exposure: {
      industry: { 'Tech': 45, 'Pharma': 25, 'Auto': 20, 'Others': 10 },
      region: { 'North America': 55, 'Europe': 30, 'APAC': 15 },
      creditRating: { 'AAA': 40, 'AA': 35, 'A': 20, 'BBB': 5 }
    }
  });
});

workingCapitalRouter.get('/bids', (req, res) => {
  res.json(mockBids.filter(b => b.invoiceId)); // Filter those with invoiceId for the general bids list in this context
});

workingCapitalRouter.post('/stress-test', (req, res) => {
  const { aum, rateShock, defaultRate } = req.body;
  const iterations = 5000;
  const baseYield = 0.05;
  const adjustedYield = baseYield + (rateShock / 10000);
  const results: number[] = [];
  
  const blocksCount = 20;
  const blockSize = aum / blocksCount;

  for (let i = 0; i < iterations; i++) {
    let outcome = 0;
    for (let j = 0; j < blocksCount; j++) {
      const isDefault = Math.random() < (defaultRate / 100);
      outcome += isDefault ? blockSize * 0.4 : blockSize * (1 + adjustedYield);
    }
    results.push(outcome);
  }
  
  results.sort((a, b) => a - b);
  const p5 = results[Math.floor(iterations * 0.05)];
  const median = results[Math.floor(iterations * 0.50)];
  const p95 = results[Math.floor(iterations * 0.95)];
  const var95 = aum - p5;

  const distribution = Array.from({ length: 15 }, (_, i) => {
    const percentile = i * 7; 
    return {
      percentile: `${percentile}%`,
      value: results[Math.floor(iterations * (percentile / 100))] || results[results.length - 1]
    };
  });

  res.json({ p5, median, p95, var95, distribution });
});

workingCapitalRouter.post('/match-bids', async (req, res) => {
  const bids = [
    { id: 'bid-1', financierId: 'fin-1', discountRate: 4.5, createdAt: '2026-04-23T10:00:00Z' },
    { id: 'bid-2', financierId: 'fin-2', discountRate: 4.25, createdAt: '2026-04-23T11:00:00Z' },
    { id: 'bid-3', financierId: 'fin-3', discountRate: 4.25, createdAt: '2026-04-23T10:30:00Z' },
  ];

  const sortedBids = bids.sort((a, b) => {
    if (a.discountRate !== b.discountRate) return a.discountRate - b.discountRate;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const winningBid = sortedBids[0];
  
  res.json({
    status: "MATCH_SUCCESS",
    winnerId: winningBid.financierId,
    rate: winningBid.discountRate,
    traceId: `TRADE_${Math.random().toString(36).substring(7).toUpperCase()}`
  });
});
