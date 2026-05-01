
import { db, sqlite } from './index.ts';
import * as schema from './schema.ts';
import { mockEntities, mockAccounts, adminUsers } from './mocks.ts';

export async function seed() {
  console.log('🌱 Initializing schema and seeding database...');

  // 0. Ensure tables exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_currency TEXT NOT NULL DEFAULT 'USD'
    );
    CREATE TABLE IF NOT EXISTS subsidiaries (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      lending_rules TEXT,
      base_currency TEXT NOT NULL,
      parent_id TEXT,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );
    CREATE TABLE IF NOT EXISTS bank_partners (
      id TEXT PRIMARY KEY,
      subsidiary_id TEXT NOT NULL,
      name TEXT NOT NULL,
      bic_swift TEXT NOT NULL,
      FOREIGN KEY(subsidiary_id) REFERENCES subsidiaries(id)
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      bank_id TEXT NOT NULL,
      name TEXT NOT NULL,
      gl_code TEXT NOT NULL,
      iban TEXT,
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      FOREIGN KEY(bank_id) REFERENCES bank_partners(id),
      FOREIGN KEY(entity_id) REFERENCES subsidiaries(id)
    );
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY(tenant_id) REFERENCES tenants(id)
    );
    CREATE TABLE IF NOT EXISTS claims_reserves (
      id TEXT PRIMARY KEY,
      claim_id TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      reserve_amount REAL NOT NULL,
      valid_from TEXT NOT NULL,
      valid_to TEXT NOT NULL DEFAULT '9999-12-31 23:59:59',
      trans_from TEXT NOT NULL,
      trans_to TEXT NOT NULL DEFAULT '9999-12-31 23:59:59',
      FOREIGN KEY(entity_id) REFERENCES subsidiaries(id)
    );
    CREATE TABLE IF NOT EXISTS virtual_ledger (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id),
      FOREIGN KEY(account_id) REFERENCES accounts(id)
    );
  `);

  // 1. Seed Tenant
  await db.insert(schema.tenants).values({
    id: 't-1',
    name: 'Global Nexus Enterprise',
    baseCurrency: 'USD'
  }).onConflictDoNothing();

  // 2. Seed Subsidiaries (from mockEntities)
  for (const ent of mockEntities) {
    await db.insert(schema.subsidiaries).values({
      id: ent.id,
      tenantId: 't-1',
      name: ent.name,
      baseCurrency: ent.baseCurrency,
      parentId: ent.parentId
    }).onConflictDoNothing();
  }

  // 3. Seed Bank Partners (Synthetic)
  const banks = [
    { id: 'b-1', subId: '2', name: 'J.P. Morgan', bic: 'CHASUS33' },
    { id: 'b-2', subId: '3', name: 'HSBC', bic: 'HSBCGBKK' },
  ];
  for (const b of banks) {
    await db.insert(schema.bankPartners).values({
      id: b.id,
      subsidiaryId: b.subId,
      name: b.name,
      bicSwift: b.bic
    }).onConflictDoNothing();
  }

  // 4. Seed Accounts (from mockAccounts)
  for (const acc of mockAccounts) {
    const bankId = acc.bank.includes('Morgan') ? 'b-1' : 'b-2';
    await db.insert(schema.accounts).values({
      id: acc.id,
      bankId,
      name: acc.name,
      glCode: acc.glCode,
      balance: acc.balance,
      currency: acc.currency,
      entityId: acc.entityId
    }).onConflictDoNothing();
  }

  // 5. Seed Admins
  for (const admin of adminUsers) {
    await db.insert(schema.adminUsers).values({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      tenantId: 't-1',
      status: admin.status
    }).onConflictDoNothing();
  }

  console.log('✅ Seeding complete.');
}
