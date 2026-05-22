import { z } from 'zod';

// 1. Hubs Table: Henry Hub, Waha Hub, SoCal Citygate
export const insertHubSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  locationCode: z.string().min(1),
  benchmarkType: z.enum(['GAS', 'POWER']),
  currentSpotPrice: z.coerce.number().nonnegative(), // Prevent floating-point crashes
});

export const selectHubSchema = insertHubSchema.omit({
  id: true,
});

// 2. Pipeline Tariffs Table: For Basis Spread Calculations
export const insertTariffSchema = z.object({
  id: z.string().uuid(),
  sourceHubId: z.string().uuid(),
  destinationHubId: z.string().uuid(),
  tariffRate: z.coerce.number().positive(),
  capacityLimit: z.coerce.number().nonnegative().optional(),
});

export const selectTariffSchema = insertTariffSchema.omit({
  id: true,
});

// Export schema types for type-safe operations
export type InsertHub = z.infer<typeof insertHubSchema>;
export type SelectHub = z.infer<typeof selectHubSchema>;
export type InsertTariff = z.infer<typeof insertTariffSchema>;
export type SelectTariff = z.infer<typeof selectTariffSchema>;

// Hub reference types (for API responses)
export const hubReferenceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  locationCode: z.string(),
  benchmarkType: z.enum(['GAS', 'POWER']),
  currentSpotPrice: z.number().nonnegative(),
});

export type HubReference = z.infer<typeof hubReferenceSchema>;

// Pipeline tariff reference types
export const tariffReferenceSchema = z.object({
  id: z.string().uuid(),
  sourceHubId: z.string(),
  destinationHubId: z.string(),
  tariffRate: z.number().positive(),
  capacityLimit: z.number().nonnegative().nullable(),
});

export type TariffReference = z.infer<typeof tariffReferenceSchema>;