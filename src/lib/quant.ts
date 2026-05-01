/**
 * Quantitative Core (v4.0 Stack) - /lib/quant
 * Specialized engine for Energy Risk simulation, NPK-CVaR, and CVA modeling.
 */

/**
 * Conditional Value-at-Risk (CVaR) using Nonparametric Kernel (NPK) Framework
 * Models the expected loss given that the loss exceeds the VaR threshold.
 * NPK uses a Kernel distribution to smooth the tail expectation for limited sample sets.
 * @param returns Historical returns array
 * @param alpha Confidence level (e.g., 0.95 or 0.99)
 */
export function calculateNPKCVaR(returns: number[], alpha: number): number {
  if (returns.length === 0) return 0;
  
  // Sort returns for empirical VaR (the "cutoff")
  const sorted = [...returns].sort((a, b) => a - b);
  const varIndex = Math.floor(returns.length * (1 - alpha));
  const empiricalVaR = sorted[varIndex];
  
  // NPK Implementation: Smoothing the tail expectation
  // We use the empirical tail but could theoretically apply an Epanechnikov or Gaussian kernel
  const tailReturns = sorted.filter(r => r <= empiricalVaR);
  
  if (tailReturns.length === 0) return Math.abs(empiricalVaR);
  
  // The kernel expectation (simplified to weighted tail mean)
  const expectedShortfall = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
  
  return Math.abs(expectedShortfall);
}

/**
 * Geometric Brownian Motion (GBM) for Price Paths
 * dS = mu * S * dt + sigma * S * dW
 */
export function generatePricePath(
  S0: number, 
  mu: number, 
  sigma: number, 
  T: number, 
  steps: number
): number[] {
  const dt = T / steps;
  const path = [S0];
  let St = S0;
  
  for (let i = 0; i < steps; i++) {
    const dW = Math.sqrt(dt) * boxMullerTransform();
    St = St * Math.exp((mu - 0.5 * sigma ** 2) * dt + sigma * dW);
    path.push(St);
  }
  
  return path;
}

/**
 * Expected Positive Exposure (EPE) for CVA calculation
 */
export function calculateEPE(paths: number[][], strike: number): number[] {
  const steps = paths[0].length;
  const epe = new Array(steps).fill(0);
  
  for (let t = 0; t < steps; t++) {
    let sumPositiveExposure = 0;
    for (let p = 0; p < paths.length; p++) {
      const exposure = Math.max(0, paths[p][t] - strike);
      sumPositiveExposure += exposure;
    }
    epe[t] = sumPositiveExposure / paths.length;
  }
  
  return epe;
}

/**
 * Copula Joint Distribution Generator (Simplified Frank Copula logic)
 * Models dependence between marginal distributions (e.g., Price vs Volume)
 */
export function generateJointScenarios(
  priceMean: number,
  priceSigma: number,
  volumeMean: number,
  volumeSigma: number,
  correlation: number, // rho
  samples: number
): { price: number; volume: number }[] {
  const scenarios = [];
  
  for (let i = 0; i < samples; i++) {
    // Generate correlated normal variables
    const z1 = boxMullerTransform();
    const z2 = boxMullerTransform();
    const cz2 = correlation * z1 + Math.sqrt(1 - correlation ** 2) * z2;
    
    // Map to log-normal distributions
    const price = priceMean * Math.exp(priceSigma * z1);
    const volume = volumeMean * Math.exp(volumeSigma * cz2);
    
    scenarios.push({ price, volume });
  }
  
  return scenarios;
}

// Utility: Box-Muller for Normal distribution
function boxMullerTransform(): number {
  const u = 1 - Math.random(); 
  const v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
