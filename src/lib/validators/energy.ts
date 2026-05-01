import { z } from 'zod';

export const energyTradeSchema = z.object({
  entityId: z.string().uuid(),
  notional: z.number().positive(),
  deliveryType: z.enum(['Physical', 'Financial']),
  qualitySpecs: z.object({
    apiGravity: z.number().min(10).max(55).optional(),
    sulfurContent: z.number().min(0).max(5).optional(),
    btuContent: z.number().min(900).max(1100).optional(),
  }).optional(),
  basisHubId: z.string().uuid().optional(),
});

export const ifrs9ValidationSchema = z.object({
  objective: z.string().min(50, "Risk objective must be substantive for auditors"),
  hedgeRatio: z.number().min(0.5).max(1.5),
  methodology: z.enum(['Dollar-Offset', 'Regression', 'NPK-CVaR']),
});

export type EnergyTrade = z.infer<typeof energyTradeSchema>;
export type IFRS9Validation = z.infer<typeof ifrs9ValidationSchema>;
