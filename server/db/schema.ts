
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Layer 1: Global Tenants
export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  baseCurrency: text('base_currency').notNull().default('USD'),
});

// Layer 2: Subsidiaries (linked to tenant)
export const subsidiaries = sqliteTable('subsidiaries', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  lendingRules: text('lending_rules'), // JSON string
  baseCurrency: text('base_currency').notNull(),
  parentId: text('parent_id'), // hierarchical structure
});

// Layer 3: Bank Partners
export const bankPartners = sqliteTable('bank_partners', {
  id: text('id').primaryKey(),
  subsidiaryId: text('subsidiary_id').notNull().references(() => subsidiaries.id),
  name: text('name').notNull(),
  bicSwift: text('bic_swift').notNull(),
});

// Layer 4: Accounts
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  bankId: text('bank_id').notNull().references(() => bankPartners.id),
  name: text('name').notNull(),
  glCode: text('gl_code').notNull(),
  iban: text('iban'),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull(),
  entityId: text('entity_id').notNull().references(() => subsidiaries.id),
});

// Layer 5: Energy & Commodity Risk (Nodal Registry for Nexus Topology)
// Hubs Table: Henry Hub, Waha Hub, SoCal Citygate benchmarks
export const energyHubs = sqliteTable('energy_hubs', {
  id: text('id').primaryKey(), // e.g., 'hub-henry', 'hub-waha', 'hub-socal'
  tenantId: text('tenant_id').notNull(), // Nexus Topology: Global Tenant
  name: text('name').notNull(),
  locationCode: text('location_code').notNull(), // ISO/Nodal code (e.g., 'US-LLS', 'US-Waha', 'US-Socal')
  benchmarkType: text('benchmark_type').notNull(), // 'GAS' | 'POWER'
  currentSpotPrice: real('current_spot_price').default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// Pipeline Tariffs Table: For Basis Spread Calculations
export const pipelineTariffs = sqliteTable('pipeline_tariffs', {
  id: text('id').primaryKey(),
  sourceHubId: text('source_hub_id').references(() => energyHubs.id),
  destinationHubId: text('destination_hub_id').references(() => energyHubs.id),
  tariffRate: real('tariff_rate').notNull(),
  capacityLimit: real('capacity_limit'),
});

// Commodity Trades (linked to energy hubs for nodal risk)
export const commodityTrades = sqliteTable('commodity_trades', {
  id: text('id').primaryKey(),
  entityId: text('entity_id').notNull().references(() => subsidiaries.id),
  counterpartyId: text('counterparty_id').notNull(),
  energyHubId: text('energy_hub_id').references(() => energyHubs.id),
  deliveryType: text('delivery_type').notNull(), // 'Physical' | 'Financial'
  notional: real('notional').notNull(),
  unit: text('unit').notNull(), // 'MWh', 'BBL', 'MMBtu'
  deliveryStart: text('delivery_start').notNull(),
  deliveryEnd: text('delivery_end').notNull(),
  qualitySpecs: text('quality_specs'), // JSON string for API Gravity, Sulfur, etc.
  riskScore: real('risk_score'),
});

// Hedge Relationships (updated to use energy hubs)
export const hedgeRelationships = sqliteTable('hedge_relationships', {
  id: text('id').primaryKey(),
  objective: text('objective').notNull(),
  strategy: text('strategy').notNull(),
  designatedRisk: text('designated_risk').notNull(),
  isRebalanced: integer('is_rebalanced').default(0),
  effectivenessScore: real('effectiveness_score'),
  lastAudit: text('last_audit'),
});

// Institutional Admin Registry
export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(), // 'ADMIN' | 'TREASURER' | 'AUDITOR'
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  status: text('status').notNull().default('pending'),
});

// Bitemporal Claims Ledger: Track valid and transaction time
export const claimsReserves = sqliteTable('claims_reserves', {
  id: text('id').primaryKey(), // UUID
  claimId: text('claim_id').notNull(),
  entityId: text('entity_id').notNull().references(() => subsidiaries.id),
  reserveAmount: real('reserve_amount').notNull(),
  
  // Valid Time: period during which the fact is true in the real world
  validFrom: text('valid_from').notNull(),
  validTo: text('valid_to').notNull().default('9999-12-31 23:59:59'),
  
  // Transaction Time: period during which the fact is stored in the database
  transFrom: text('trans_from').notNull(), // should use request.time logic or default
  transTo: text('trans_to').notNull().default('9999-12-31 23:59:59'),
});

// Virtual Ledger for Strategy Settlement
export const virtualLedger = sqliteTable('virtual_ledger', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'CREDIT' | 'DEBIT'
  status: text('status').notNull().default('pending'), // 'pending' | 'settled' | 'failed'
  createdAt: text('created_at').notNull(),
});
