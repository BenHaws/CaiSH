/**
 * Quantitative Core (v4.0 Stack) - /lib/quant
 * Specialized engine for Energy Risk simulation, NPK-CVaR, and CVA modeling.
 */

/**
 * NPK-CVaR Engine v4.0
 * Uses Gaussian Smoothing for Non-Parametric Tail-Loss Analysis
 * 
 * Mathematical Approach:
 * - Kernel Density Estimation (KDE): Smooth historical loss observations using Gaussian kernel
 * - VaR Calculation: Find the loss level α where cumulative probability reaches confidence level
 * - CVaR Calculation: Expected value of losses exceeding the VaR threshold
 * 
 * Formula: CVaR_α(L) = (1/(1-α)) × ∫[α,1] VaR_u(L) du ≈ Σ Losses × Kernel Weight
 */
export function calculateNPKCVaR(losses: number[], alpha: number = 0.95): number {
  if (losses.length === 0) return 0;

  // 1. Sort losses to identify the tail (ascending order)
  const sortedLosses = [...losses].sort((a, b) => a - b);
  
  // 2. Determine VaR threshold using empirical quantile
  // For CVaR at confidence level α, we look at the top (1-α) tail losses
  const index = Math.floor(sortedLosses.length * alpha);
  const varThreshold = sortedLosses[index];

  // 3. Apply Gaussian Kernel Smoothing to the tail losses
  // Only consider losses that exceed or equal the VaR threshold (the extreme tail)
  const tailLosses = sortedLosses.slice(index);
  
  if (tailLosses.length === 0) return Math.abs(varThreshold);

  // Calculate optimal bandwidth using Silverman's rule of thumb for Gaussian kernel
  const n = tailLosses.length;
  const stdDev = Math.sqrt(tailLosses.reduce((acc, loss) => acc + Math.pow(loss - varThreshold, 2), 0) / n);
  const bandwidth = 1.06 * stdDev * Math.pow(n, -0.2);

  // Apply Gaussian Kernel weighting to tail losses
  const sumTail = tailLosses.reduce((acc, loss) => {
    const normalizedDistance = (loss - varThreshold) / bandwidth;
    const weight = Math.exp(-0.5 * normalizedDistance * normalizedDistance); // Gaussian Kernel K(x)
    return acc + (loss * weight);
  }, 0);

  const totalWeight = tailLosses.reduce((acc, loss) => {
    const normalizedDistance = (loss - varThreshold) / bandwidth;
    return acc + Math.exp(-0.5 * normalizedDistance * normalizedDistance);
  }, 0);

  // NPK-CVaR: Weighted average of tail losses with Gaussian smoothing
  return sumTail / totalWeight;
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
