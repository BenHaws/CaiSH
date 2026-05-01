
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';
import { AsyncLocalStorage } from 'node:async_hooks';

// AsyncLocalStorage for context propagation (tenant_id)
export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

export const sqlite = new Database('nexus_persist.db');
export const db = drizzle(sqlite, { schema });

/**
 * Executes a transaction with RLS-like enforcement
 * Since SQLite doesn't have native RLS, we wrap queries to inject tenant filters
 */
export async function withTenantContext<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  return tenantContext.run({ tenantId }, fn);
}

// Helper to get current tenant filter
export function getTenantId(): string {
  const store = tenantContext.getStore();
  if (!store) throw new Error('Tenant context missing. Operation forbidden.');
  return store.tenantId;
}
