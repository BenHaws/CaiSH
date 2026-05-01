import { Router } from 'express';
import { nexusContext } from '../middleware/context.ts';

export const devRouter = Router();

devRouter.get('/global-stats', async (req, res) => {
  const store = nexusContext.getStore();
  const userRole = store?.get('userRole');

  if (userRole !== 'DEV_ADMIN') {
    return res.status(403).json({ error: 'PERMISSION_DENIED', detail: 'FORCE RLS Active - Cross-Tenant Access Restricted' });
  }

  res.json({
    totalLiquidity: 14200000000,
    activeWebhooks: 1042,
    totalNodes: 892,
    avgIpMultiplier: 1.18,
    systemHealth: 99.98
  });
});

devRouter.get('/audit-logs', async (req, res) => {
  const store = nexusContext.getStore();
  const userRole = store?.get('userRole');

  if (userRole !== 'DEV_ADMIN') {
    return res.status(403).json({ error: 'PERMISSION_DENIED' });
  }

  res.json([
    { id: 'L-001', timestamp: new Date().toISOString(), action: 'RLS_BYPASS_INIT', user: 'DEV_ADMIN', resource: 'B_LIQUIDITY' },
    { id: 'L-002', timestamp: new Date().toISOString(), action: 'VERTICAL_SHIFT', user: 'ADMIN', resource: 'REAL_ESTATE' },
    { id: 'L-003', timestamp: new Date().toISOString(), action: 'SKU_AGING_SYNC', user: 'SYSTEM', resource: 'WMS_EXT' }
  ]);
});
