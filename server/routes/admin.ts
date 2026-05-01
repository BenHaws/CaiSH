import { Router } from 'express';
import { adminUsers, mockSecurityAudits, mockComplianceScores } from '../db/mocks.ts';
import { verifyInstitutionalSignature } from '../middleware/context.ts';

export const adminRouter = Router();

let activeVertical = 'Oil & Gas';

adminRouter.get('/users', (req, res) => {
  res.json(adminUsers);
});

adminRouter.get('/industry-config', (req, res) => {
  res.json({
    activeVertical,
    optimizationFocus: activeVertical === 'Technology' ? 'R&D Capital / FX Exposure' : 'Operational Liquidity',
    enabledPBCs: ['IP_VALUATION', 'R&D_STRESS_TEST']
  });
});

adminRouter.post('/industry-config', (req, res) => {
  activeVertical = req.body.vertical;
  res.json({ success: true, vertical: activeVertical });
});

// Security & Compliance
adminRouter.get('/security-audits', (req, res) => {
  res.json(mockSecurityAudits);
});

adminRouter.get('/compliance', (req, res) => {
  res.json(mockComplianceScores);
});

// Ingestion Gateway
adminRouter.post('/ingest/swift-gpi', (req, res) => {
  const signature = req.headers['x-kyraibos-signature'] as string;
  
  if (!verifyInstitutionalSignature(req.body, signature)) {
    console.warn("SECURITY_ALERT: HMAC mismatch detected from IP:", req.ip);
    return res.status(403).json({ error: 'INVALID_PAYLOAD_INTEGRITY' });
  }

  const { uetr, amount, entityId } = req.body;
  
  console.log(`LATTICE_ROUTER: Routing ${amount} to Entity_ID ${entityId} [UETR: ${uetr}]`);
  
  res.json({
    status: 'SETTLED_LATTICE',
    uetr,
    timestamp: new Date().toISOString()
  });
});
