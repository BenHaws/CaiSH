
export interface CorporateEntity {
  id: string;
  name: string;
  baseCurrency: string;
  parentId: string | null;
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  entityId: string;
  balance: number;
  currency: string;
  glCode: string;
}

export interface SimulationResult {
  chanceOfSurvival: string;
  expectedLow: string;
  var95: string;
  status: string;
  dailyProjection: { day: number; cash: number }[];
}

export interface FXExposure {
  currency: string;
  balance: number;
  usdEquivalent: number;
  change24h: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PaymentItem {
  id: string;
  beneficiary: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  riskScore: number;
  type: 'vendor' | 'payroll' | 'intercompany';
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  account: string;
  debit: number | null;
  credit: number | null;
  currency: string;
  type: 'liquidity' | 'trade' | 'fee' | 'adjustment';
  referenceNode: string;
}

export interface SecurityAudit {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  node: string;
  status: 'locked' | 'verified' | 'flagged';
}

export interface ComplianceScore {
  category: string;
  score: number;
  status: 'compliant' | 'warning' | 'critical';
  lastAudit: string;
}

export interface WidgetConfig {
  id: string;
  componentKey: string;
  w: number; // grid column width (1-12)
  h?: number; // optional grid height
  title: string;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  entityId: string;
  name: string;
  config: WidgetConfig[];
  updatedAt: string;
}

export interface BankDiscoveryItem {
  bankName: string;
  accountType: 'Operating' | 'Payroll' | 'Tax' | 'Investment';
  suggestedGL: string;
  balance: number;
  currency: string;
  confidence: number; // AI confidence score
}

export interface UserRole {
  id: string;
  email: string;
  role: 'ADMIN' | 'TREASURER' | 'AUDITOR';
  entityId: string;
  status: 'active' | 'pending';
}

export interface WorkingCapitalState {
  totalTrappedLiquidity: number;
  availableToDiscount: number;
  averageDaysPaidEarly: number;
}

export interface Supplier {
  id: string;
  name: string;
  taxId: string;
  kycStatus: 'Pending' | 'Verified' | 'ActionRequired';
  uboStatus: 'Verified' | 'Pending';
  bankAccount: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Discounted' | 'Settled';
  discountRate?: number;
}

export interface FinancingBid {
  id: string;
  invoiceId: string;
  financierId: string;
  financierName: string;
  apr: number;
  totalCost: number;
  expiryDate: string;
  createdAt?: string;
}

export interface FinancierPortfolio {
  aum: number;
  cagr: number;
  riskScore: number;
  exposure: {
    industry: { [key: string]: number };
    region: { [key: string]: number };
    creditRating: { [key: string]: number };
  };
}

export type EntityType = 'MASTER' | 'SUBSIDIARY' | 'ACCOUNT';

export interface OnboardingState {
  step: number;
  isComplete: boolean;
  discoveredAccounts: BankDiscoveryItem[];
}

export type IndustryVertical = 'Manufacturing' | 'Healthcare' | 'Real Estate' | 'Retail' | 'Technology' | 'Oil & Gas' | 'Insurance' | 'DEV';

export interface TrustAccount {
  id: string;
  propertyName: string;
  accountType: 'ESCROW' | 'RENT_COLLECTION';
  balance: number;
  status: 'PROTECTED' | 'ACTIVE';
  lastTransaction: string;
}

export interface DevGlobalStats {
  totalLiquidity: number;
  activeWebhooks: number;
  totalNodes: number;
  avgIpMultiplier: number;
  systemHealth: number;
}

export interface DebtInstrument {
  id: string;
  name: string;
  type: 'Bond' | 'Term Loan' | 'RCF' | 'IR Swap';
  principal: number;
  currency: string;
  rateType: 'Fixed' | 'Floating';
  baseRate?: string; // e.g. SOFR, EURIBOR
  spread?: number;
  currentRate: number;
  maturityDate: string;
  valuations: { date: string; mtm: number }[];
  couponHistory?: { date: string; amount: number; status: 'Paid' | 'Pending' }[];
}

export interface StressTestResult {
  p5: number;
  median: number;
  p95: number;
  var95: number;
  var95Value: number;
}

export interface IndustryConfig {
  activeVertical: IndustryVertical;
  optimizationFocus: string;
  enabledPBCs: string[];
}

export interface FinancialInstrument {
  id: string;
  entityId: string;
  name: string;
  type: 'BOND' | 'RCF' | 'TERM_LOAN' | 'IR_SWAP';
  status: 'ACTIVE' | 'SETTLED' | 'DEFAULTED';
  notionalAmount: number;
  currency: string;
  rateType: 'FIXED' | 'FLOATING';
  baseRateValue: number; // Fixed rate or Spread
  benchmarkIndex?: string; // e.g. 'TERM_SOFR'
  creditAdjustmentSpread: number;
  issueDate: string;
  maturityDate: string;
  isGuaranteed: boolean;
}

export interface MtMValuation {
  valuationId: string;
  instrumentId: string;
  valuationDate: string;
  marketValue: number;
  unrealizedGainLoss: number;
  rateUsed: number;
}

export interface ForwardCurvePoint {
  period: string; // e.g. "May 26", "Jun 26"
  price: number;
  type: 'Monthly' | 'Seasonal' | 'Quarterly';
}

export interface EnergyMarketState {
  spotPrice: number;
  marketShape: 'Contango' | 'Backwardation';
  forwardCurve: ForwardCurvePoint[];
  pfeValue: number; // Potential Future Exposure
  varValue: number; // Value at Risk
}

export interface SensitivityResult {
  instrumentId: string;
  shockScenario: string;
  pAndLImpact: number;
  complianceReady: boolean;
}

export interface RecallResponse {
  status: 'PENDING' | 'REJECTED' | 'SUCCESS';
  uetr: string; // Unique End-to-End Transaction Reference 
}

export interface TechValuationMetrics {
  arr: number;
  nrr: number; // Net Revenue Retention
  churnRate: number;
  magicNumber: number; // (Rev Growth / S&M Spend)
  burnMultiple: number;
  trlLevel: number; // Technology Readiness Level (1-9)
  defensibilityScore: number; // 0-100
  ipMultiplier: number; // M_audit (e.g. 1.15)
  terminalValue: {
    median: number;
    p95: number;
    p5: number;
  };
  ipScanner?: IPScannerMetrics;
}

export interface IPScannerMetrics {
  commitDensity: number;
  libraryDependencies: string[];
  codeUniquenessScore: number;
  lastSync: string;
}

export interface InventoryItem {
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  agingDays: number; // For obsolescence logic
  category: 'RAW' | 'WIP' | 'FINISHED';
}

export interface IBLResult {
  status: 'SUCCESS' | 'FAILED';
  borrowingLimit: number;
  eligibleStockValue: number;
  message?: string;
}

export interface PatentAnalysis {
  id: string;
  title: string;
  trl: number;
  status: 'Analyzed' | 'Pending';
  score: number;
}

export interface NexusRelay {
  id: string;
  name: string;
  type: EntityType;
  parentId: string | null;
  children?: NexusRelay[];
}

export interface SweepRule {
  id: string;
  propertyId: string;
  sourceAccountId: string;
  targetAccountId: string;
  percentage: number;
}

export interface SweepResult {
  success: boolean;
  totalSwept: number;
  traceId: string;
  timestamp: string;
}

export interface CashFlow {
  timeInYears: number;
  amount: number;
}

export interface SCRMetrics {
  solvencyRatio: number;
  marketRisk: number;
  underwritingRisk: number;
  operationalRisk: number;
  eligibleOwnFunds: number;
  scr: number;
}

export interface NettingInvoice {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface BasisHub {
  id: string;
  name: string;
  benchmarkRef: string;
  pipelineTariff?: number;
  isNodal: boolean;
}

export interface EnergyHedge {
  id: string;
  entityId: string;
  type: 'Swap' | 'Option' | 'Basis Swap';
  commodity: string;
  volume: number;
  price: number;
  expiry: string;
  status: 'active' | 'pending' | 'settled';
  effectivenessScore?: number;
  basisHub?: string;
}

export interface CvaSimulationResult {
  epe: number[];
  ene: number[];
  cva: number;
  dva: number;
  bcva: number;
  paths: number;
}

export interface ValidationErrorInfo {
  field: string;
  message: string;
}
