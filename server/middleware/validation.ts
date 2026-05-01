
import { z } from 'zod';
import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from './errors.ts';

/**
 * Validates request body against a Zod schema
 */
export const validateInput = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return next(new AppError(`Validation failed: ${details}`, 400));
    }
    next(error);
  }
};

// Common Schemas
export const CalculationSchema = z.object({
  yieldRate: z.coerce.number().min(0).max(1),
  flows: z.array(z.object({
    timeInYears: z.coerce.number().positive(),
    amount: z.coerce.number()
  }))
});

export const SCRSchema = z.object({
  entityId: z.string().uuid().optional(),
  marketRisk: z.coerce.number().default(0),
  underwritingRisk: z.coerce.number().default(0)
});

// Working Capital Marketplace Schemas
export const invoiceAskSchema = z.object({
  invoiceId: z.string().uuid(),
  supplierId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3).transform(val => val.toUpperCase()),
  dueDate: z.coerce.date(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const financierBidSchema = z.object({
  bidId: z.string().uuid().optional(),
  invoiceId: z.string().uuid(),
  financierId: z.string().uuid(),
  discountRate: z.coerce.number().min(0).max(100), // Percent interest
  offeredAmount: z.coerce.number().positive(),
  expiryDate: z.coerce.date().refine((date: Date) => date > new Date(), {
    message: "Bid expiry must be in the future",
  }),
});
