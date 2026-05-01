// Shared Quantitative Utility Library
import { type CashFlow } from '../../src/shared/types/index.ts';

/**
 * Calculates Macaulay Duration (D)
 * Formula: D = sum(t * PV(CFt)) / Price
 */
export const calculateMacaulayDuration = (flows: CashFlow[], yieldRate: number): number => {
  const price = flows.reduce((acc, cf) => 
    acc + cf.amount / Math.pow(1 + yieldRate, cf.timeInYears), 0);
  
  const weightedTime = flows.reduce((acc, cf) => 
    acc + (cf.timeInYears * cf.amount) / Math.pow(1 + yieldRate, cf.timeInYears), 0);
  
  return price === 0 ? 0 : weightedTime / price;
};

/**
 * Calculates Duration Gap
 * Formula: Gap = Da - (L/A) * Dl
 */
export const calculateDurationGap = (
  assetDur: number, 
  liabDur: number, 
  liabilities: number, 
  assets: number
): number => {
  if (assets === 0) return 0;
  return assetDur - (liabilities / assets) * liabDur;
};

/**
 * Applies Simulation Shocks to quantitative metrics
 */
export const applySimulationShocks = (metrics: { solvencyRatio: number, durationGap: number }, shocks: { rateShockBps: number, fxVol: number }) => {
  // Sensitivity: 100bps rise reduces solvency ratio by ~5% (mock logic)
  const rateImpact = (shocks.rateShockBps / 100) * -0.05;
  const fxImpact = (shocks.fxVol - 1) * -0.02;

  // Sensitivity: 100bps rise narrows gap by 0.1y (mock logic)
  const gapImpact = (shocks.rateShockBps / 100) * -0.1;

  return {
    solvencyRatio: Math.max(0, metrics.solvencyRatio + rateImpact + fxImpact),
    durationGap: metrics.durationGap + gapImpact
  };
};
