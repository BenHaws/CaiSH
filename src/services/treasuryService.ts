/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorporateEntity, BankAccount, SimulationResult, FXExposure, PaymentItem, JournalEntry, SecurityAudit, ComplianceScore, DashboardLayout, BankDiscoveryItem, UserRole, Supplier, FinancierPortfolio, FinancingBid, StressTestResult, DebtInstrument, IndustryConfig, IndustryVertical, EnergyMarketState, SensitivityResult, RecallResponse, TechValuationMetrics, PatentAnalysis, InventoryItem, IBLResult, IPScannerMetrics, TrustAccount, DevGlobalStats, SweepRule, SweepResult, BasisHub, EnergyHedge, CvaSimulationResult } from '../types';

const getHeaders = (role: string = 'ADMIN', tenantId: string = 't-1') => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-tenant-id': tenantId,
  'x-user-role': role
});

export const treasuryService = {
  async getEntities(): Promise<CorporateEntity[]> {
    const response = await fetch('/api/entities', { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch entities');
    return response.json();
  },

  async getAccounts(entityId?: string): Promise<BankAccount[]> {
    const url = entityId ? `/api/accounts?entityId=${entityId}` : '/api/accounts';
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  async simulateLiquidity(
    currentCash: number, 
    driftRate: number, 
    volatility: number, 
    horizon: number
  ): Promise<SimulationResult> {
    const response = await fetch('/api/simulate-liquidity', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentCash, driftRate, volatility, horizon }),
    });
    if (!response.ok) throw new Error('Simulation failed');
    return response.json();
  },

  async getFXExposures(): Promise<FXExposure[]> {
    const response = await fetch('/api/fx-exposure');
    if (!response.ok) throw new Error('Failed to fetch FX exposures');
    return response.json();
  },

  async getPayments(): Promise<PaymentItem[]> {
    const response = await fetch('/api/payments');
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  async getLedgerEntries(): Promise<JournalEntry[]> {
    const response = await fetch('/api/ledger');
    if (!response.ok) throw new Error('Failed to fetch ledger');
    return response.json();
  },

  async getSecurityAudits(): Promise<SecurityAudit[]> {
    const response = await fetch('/api/admin/security-audits');
    if (!response.ok) throw new Error('Failed to fetch audits');
    return response.json();
  },

  async getComplianceScores(): Promise<ComplianceScore[]> {
    const response = await fetch('/api/admin/compliance');
    if (!response.ok) throw new Error('Failed to fetch compliance');
    return response.json();
  },

  async getDashboard(): Promise<DashboardLayout> {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  },

  async updateDashboard(layout: Partial<DashboardLayout>): Promise<DashboardLayout> {
    const response = await fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layout),
    });
    if (!response.ok) throw new Error('Failed to update dashboard');
    return response.json();
  },

  async startDiscovery(): Promise<BankDiscoveryItem[]> {
    const response = await fetch('/api/dashboard/discovery/start', { method: 'POST' });
    if (!response.ok) throw new Error('Discovery failed');
    return response.json();
  },

  async getAdminUsers(): Promise<UserRole[]> {
    const response = await fetch('/api/admin/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getCurrentUser(): Promise<UserRole> {
    // Mocking the current user session
    // In a real environment, this would come from an auth provider or JWT
    return {
      id: 'USER_CURRENT',
      email: 'ben@cwgs.wtf',
      role: 'ADMIN', // Change to TREASURER or AUDITOR to test restrictions
      entityId: 'ROOT',
      status: 'active'
    };
  },

  async getSuppliers(): Promise<Supplier[]> {
    const response = await fetch('/api/working-capital/suppliers');
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    return response.json();
  },

  async getFinancingPortfolio(): Promise<FinancierPortfolio> {
    const response = await fetch('/api/working-capital/portfolio');
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
  },

  async getFinancingBids(): Promise<FinancingBid[]> {
    const response = await fetch('/api/working-capital/bids');
    if (!response.ok) throw new Error('Failed to fetch bids');
    return response.json();
  },

  async runPortfolioStressTest(aum: number, rateShock: number, defaultRate: number): Promise<StressTestResult> {
    const response = await fetch('/api/working-capital/stress-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aum, rateShock, defaultRate }),
    });
    if (!response.ok) throw new Error('Stress test failed');
    return response.json();
  },

  async getDebtInvestments(): Promise<DebtInstrument[]> {
    const response = await fetch('/api/debt-investments');
    if (!response.ok) throw new Error('Failed to fetch debt & investments');
    return response.json();
  },

  async getIndustryConfig(): Promise<IndustryConfig> {
    const response = await fetch('/api/admin/industry-config');
    if (!response.ok) throw new Error('Failed to fetch industry config');
    return response.json();
  },

  async updateIndustryVertical(vertical: IndustryVertical): Promise<{ success: boolean }> {
    const response = await fetch('/api/admin/industry-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical }),
    });
    if (!response.ok) throw new Error('Failed to update vertical');
    return response.json();
  },

  async getEnergyMarketState(): Promise<EnergyMarketState> {
    const response = await fetch('/api/energy/market-state');
    if (!response.ok) throw new Error('Failed to fetch energy market state');
    return response.json();
  },

  async runDebtSensitivityAnalysis(instrumentId: string): Promise<SensitivityResult> {
    const response = await fetch('/api/debt/sensitivity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instrumentId }),
    });
    if (!response.ok) throw new Error('Sensitivity analysis failed');
    return response.json();
  },

  async initiateStopAndRecall(tradeId: string): Promise<RecallResponse> {
    const response = await fetch('/api/energy/recall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tradeId }),
    });
    if (!response.ok) throw new Error('Recall failed');
    return response.json();
  },

  async getTechValuation(): Promise<TechValuationMetrics> {
    const response = await fetch('/api/tech/valuation');
    if (!response.ok) throw new Error('Failed to fetch tech valuation');
    return response.json();
  },

  async getPatents(): Promise<PatentAnalysis[]> {
    const response = await fetch('/api/tech/patents');
    if (!response.ok) throw new Error('Failed to fetch patents');
    return response.json();
  },

  async getInventory(): Promise<InventoryItem[]> {
    const response = await fetch('/api/manufacturing/inventory');
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  async calculateIBL(items: InventoryItem[], advanceRate: number = 0.85): Promise<IBLResult> {
    const response = await fetch('/api/manufacturing/calculate-ibl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, advanceRate }),
    });
    if (!response.ok) throw new Error('IBL calculation failed');
    return response.json();
  },

  async getIPScannerMetrics(): Promise<IPScannerMetrics> {
    const response = await fetch('/api/tech/ip-scanner');
    if (!response.ok) throw new Error('Failed to fetch IP scanner metrics');
    return response.json();
  },

  async getTrustAccounts(): Promise<TrustAccount[]> {
    const response = await fetch('/api/real-estate/trust-accounts');
    if (!response.ok) throw new Error('Failed to fetch trust accounts');
    return response.json();
  },

  async getStressTest(aum: number, rateShock: number, defaultRate: number): Promise<any> {
    const response = await fetch('/api/working-capital/stress-test', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ aum, rateShock, defaultRate }),
    });
    if (!response.ok) throw new Error('Stress test failed');
    return response.json();
  },

  async getSolvencyMetrics(entityId: string): Promise<any> {
    const response = await fetch(`/api/insurance/solvency-metrics?entityId=${entityId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch solvency metrics');
    return response.json();
  },

  async getDurationMatching(entityId: string): Promise<any> {
    const response = await fetch(`/api/insurance/duration-matching?entityId=${entityId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch duration matching');
    return response.json();
  },

  async getBitemporalClaims(entityId: string): Promise<any> {
    const response = await fetch(`/api/insurance/claims-ledger?entityId=${entityId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch claims ledger');
    return response.json();
  },

  async getDevGlobalStats(): Promise<DevGlobalStats> {
    const response = await fetch('/api/dev/global-stats', { headers: getHeaders('DEV_ADMIN') });
    if (!response.ok) throw new Error('Failed to fetch dev stats');
    return response.json();
  },

  async getDevAuditLogs(): Promise<any[]> {
    const response = await fetch('/api/dev/audit-logs', { headers: getHeaders('DEV_ADMIN') });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  async getInventoryAging(): Promise<any[]> {
    const response = await fetch('/api/manufacturing/inventory-aging');
    if (!response.ok) throw new Error('Failed to fetch inventory aging');
    return response.json();
  },

  async executeRentSweep(propertyId: string, amount: number): Promise<SweepResult> {
    const response = await fetch('/api/real-estate/sweep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, amount }),
    });
    if (!response.ok) throw new Error('Sweep failed');
    return response.json();
  },

  async getSweepRules(): Promise<SweepRule[]> {
    const response = await fetch('/api/real-estate/sweep-rules');
    if (!response.ok) throw new Error('Failed to fetch sweep rules');
    return response.json();
  },

  async getIntercompanyInvoices(): Promise<any[]> {
    const response = await fetch('/api/retail/intercompany-invoices', { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch IC invoices');
    return response.json();
  },

  async calculateNetting(): Promise<any> {
    const response = await fetch('/api/retail/calculate-netting', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Netting calculation failed');
    return response.json();
  },

  async executeNetting(cycleId: string): Promise<any> {
    const response = await fetch('/api/retail/execute-netting', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cycleId }),
    });
    if (!response.ok) throw new Error('Netting execution failed');
    return response.json();
  },
  
  async executeStrategy(params: { fromAccountId: string, toAccountId: string, amount: number, description: string }): Promise<any> {
    const response = await fetch('/api/execute-strategy', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Strategy execution communication failed');
    return response.json();
  },

  async getBasisHubs(): Promise<BasisHub[]> {
    const response = await fetch('/api/energy/basis-hubs');
    if (!response.ok) throw new Error('Failed to fetch basis hubs');
    return response.json();
  },

  async getEnergyHedges(): Promise<EnergyHedge[]> {
    const response = await fetch('/api/energy/hedges');
    if (!response.ok) throw new Error('Failed to fetch energy hedges');
    return response.json();
  },

  async runCvaSimulation(tradeId: string): Promise<CvaSimulationResult> {
    const response = await fetch(`/api/energy/simulate-cva?tradeId=${tradeId}`);
    if (!response.ok) throw new Error('CVA simulation failed');
    return response.json();
  }
};
