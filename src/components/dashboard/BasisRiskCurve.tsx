import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { Activity, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

// Energy Hub Types matching the Nodal Registry schema
type BenchmarkType = 'GAS' | 'POWER';
type HubId = string;

interface EnergyHubData {
  id: HubId;
  name: string;
  locationCode: string;
  benchmarkType: BenchmarkType;
  currentSpotPrice: number;
}

interface PipelineTariffData {
  id: string;
  sourceHubId: HubId;
  destinationHubId: HubId;
  tariffRate: number;
  capacityLimit?: number;
}

// Sample data for Henry Hub, Waha Hub, SoCal Citygate benchmarks
const HUB_DATA: EnergyHubData[] = [
  {
    id: 'hub-henry',
    name: 'Henry Hub',
    locationCode: 'US-LLS',
    benchmarkType: 'GAS',
    currentSpotPrice: 2.85,
  },
  {
    id: 'hub-waha',
    name: 'Waha Hub',
    locationCode: 'US-Waha',
    benchmarkType: 'GAS',
    currentSpotPrice: 3.12,
  },
  {
    id: 'hub-socal',
    name: 'SoCal Citygate',
    locationCode: 'US-Socal',
    benchmarkType: 'GAS',
    currentSpotPrice: 3.45,
  },
];

// Sample pipeline tariffs for basis spread calculations
const TARIFF_DATA: PipelineTariffData[] = [
  {
    id: 'tariff-henry-waha',
    sourceHubId: 'hub-henry',
    destinationHubId: 'hub-waha',
    tariffRate: 0.28,
    capacityLimit: 150000,
  },
  {
    id: 'tariff-henry-socal',
    sourceHubId: 'hub-henry',
    destinationHubId: 'hub-socal',
    tariffRate: 0.42,
    capacityLimit: 120000,
  },
  {
    id: 'tariff-waha-socal',
    sourceHubId: 'hub-waha',
    destinationHubId: 'hub-socal',
    tariffRate: 0.35,
    capacityLimit: 100000,
  },
];

// Calculate basis spread between hubs
const calculateBasisSpread = (sourcePrice: number, destinationPrice: number): number => {
  return destinationPrice - sourcePrice;
};

// NPK-CVaR calculation for tail risk assessment
const calculateNPkCVaR = (losses: number[], alpha: number = 0.95): number => {
  if (losses.length === 0) return 0;

  const sortedLosses = [...losses].sort((a, b) => a - b);
  const index = Math.floor(sortedLosses.length * alpha);
  const varThreshold = sortedLosses[index];
  const tailLosses = sortedLosses.slice(index);

  if (tailLosses.length === 0) return Math.abs(varThreshold);

  const n = tailLosses.length;
  const stdDev = Math.sqrt(tailLosses.reduce((acc, loss) => acc + Math.pow(loss - varThreshold, 2), 0) / n);
  const bandwidth = 1.06 * stdDev * Math.pow(n, -0.2);

  const sumTail = tailLosses.reduce((acc, loss) => {
    const normalizedDistance = (loss - varThreshold) / bandwidth;
    const weight = Math.exp(-0.5 * normalizedDistance * normalizedDistance);
    return acc + (loss * weight);
  }, 0);

  const totalWeight = tailLosses.reduce((acc, loss) => {
    const normalizedDistance = (loss - varThreshold) / bandwidth;
    return acc + Math.exp(-0.5 * normalizedDistance * normalizedDistance);
  }, 0);

  return sumTail / totalWeight;
};

// Box-Muller transform for normal distribution sampling
function boxMuller(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0;
}

// Generate simulated historical losses for each hub pair
const generateHistoricalLosses = (basisSpread: number, volatility: number = 0.15): number[] => {
  const losses: number[] = [];
  const baseLoss = Math.abs(basisSpread) * volatility;
  
  for (let i = 0; i < 50; i++) {
    // Simulate loss distribution with occasional extreme tail events
    const z = boxMuller();
    const loss = baseLoss + (baseLoss * z * volatility) + (Math.random() > 0.95 ? baseLoss * 3 : 0);
    losses.push(Math.abs(loss));
  }
  
  return losses;
};

interface BasisRiskCurveProps {
  data?: EnergyHubData[];
  tariffs?: PipelineTariffData[];
}

export default function BasisRiskCurve({ data = HUB_DATA, tariffs = TARIFF_DATA }: BasisRiskCurveProps) {
  const [selectedHubPair, setSelectedHubPair] = useState<string>('hub-henry-hub-waha');
  
  // Calculate CVaR for each hub pair using NPK method
  const cvarData = useMemo(() => {
    return data.reduce((acc, source) => {
      const destinations = data.filter(d => d.id !== source.id);
      destinations.forEach(dest => {
        const basisSpread = calculateBasisSpread(source.currentSpotPrice, dest.currentSpotPrice);
        const losses = generateHistoricalLosses(basisSpread);
        const cvaR = calculateNPkCVaR(losses, 0.95);
        
        // Calculate 95th percentile threshold for pulse animation trigger
        const sortedLosses = [...losses].sort((a, b) => a - b);
        const percentileIndex = Math.floor(sortedLosses.length * 0.95);
        const ninetyFifthPercentile = sortedLosses[percentileIndex];

        acc.push({
          sourceHub: source.name,
          destHub: dest.name,
          basisSpread,
          cvaR,
          ninetyFifthPercentile,
          exceedsThreshold: cvaR > ninetyFifthPercentile * 1.05, // 5% buffer for pulse trigger
        });
      });
      return acc;
    }, [] as Array<{
      sourceHub: string;
      destHub: string;
      basisSpread: number;
      cvaR: number;
      ninetyFifthPercentile: number;
      exceedsThreshold: boolean;
    }>);
  }, [data]);

  // Prepare sparkline data for the selected hub pair
  const sparklineData = useMemo(() => {
    const pair = cvarData.find(p => 
      `${p.sourceHub}-${p.destHub}` === selectedHubPair ||
      `${p.destHub}-${p.sourceHub}` === selectedHubPair
    );

    if (!pair) return [];

    // Generate multi-line sparkline data showing basis spread history simulation
    const sparkline: Array<{ name: string; value: number; color: string }> = [
      { name: 'Henry Hub', value: 2.85, color: '#3b82f6' },
      { name: 'Waha Hub', value: 3.12, color: '#10b981' },
      { name: 'SoCal Citygate', value: 3.45, color: '#f59e0b' },
    ];

    return sparkline.map(hub => ({
      ...hub,
      value: hub.value + (Math.random() - 0.5) * 0.1, // Add slight variation for motion effect
    }));
  }, [selectedHubPair, cvarData]);

  const selectedPair = cvarData.find(p => 
    `${p.sourceHub}-${p.destHub}` === selectedHubPair ||
    `${p.destHub}-${p.sourceHub}` === selectedHubPair
  );

  return (
    <div className="relative w-full h-[500px] bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
      {/* Dynamic Background with Glass Effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-slate-950 to-emerald-950/10" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Header - Liquid Glass Card */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-light text-white tracking-tight">Basis Risk Curve</h2>
            <p className="text-xs text-slate-400 font-mono">Nodal Spread Analysis • NPK-CVaR Engine</p>
          </div>
        </div>

        {/* CVaR Status Indicator */}
        <div className={`px-4 py-2 rounded-full backdrop-blur-xl border shadow-lg ${
          selectedPair?.exceedsThreshold 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider">
            {selectedPair?.exceedsThreshold ? 'Elevated Risk' : 'Stable'}
          </span>
        </div>
      </div>

      {/* Multi-line Sparkline Chart */}
      <div className="relative z-10 p-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            {sparklineData.map((hub) => (
              <Line
                key={hub.name}
                type="monotone"
                dataKey="value"
                name={hub.name}
                stroke={hub.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={1000}
              />
            ))}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hub Spread Comparison Table */}
      <div className="relative z-10 p-6 grid grid-cols-2 gap-4">
        {cvarData.map((pair) => (
          <motion.button
            key={`${pair.sourceHub}-${pair.destHub}`}
            onClick={() => setSelectedHubPair(`${pair.sourceHub}-${pair.destHub}`)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
              selectedHubPair === `${pair.sourceHub}-${pair.destHub}`
                ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                : 'bg-slate-900/50 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {pair.sourceHub} → {pair.destHub}
              </span>
              <span className={`text-xs font-mono ${
                pair.basisSpread > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {pair.basisSpread > 0 ? '+' : ''}{pair.basisSpread.toFixed(3)} $/MMBtu
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">CVaR₉₅:</span>
                <span className={`text-sm font-bold font-mono ${
                  pair.cvaR > pair.ninetyFifthPercentile * 1.05 
                    ? 'text-red-400' 
                    : 'text-blue-400'
                }`}>
                  {pair.cvaR.toFixed(3)}
                </span>
              </div>
              
              {/* Pulse Animation on Hub Node when CVaR exceeds 95th percentile */}
              {pair.exceedsThreshold && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.4, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    delay: 0.3
                  }}
                  className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                />
              )}
            </div>

            {/* 95th Percentile Reference */}
            <div className="mt-2 pt-2 border-t border-white/5">
              <span className="text-[10px] text-slate-600 font-mono">
                95th Pctl: {pair.ninetyFifthPercentile.toFixed(3)}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Micro-prompt for CVaR Alert */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: selectedPair?.exceedsThreshold ? 1 : 0,
          y: selectedPair?.exceedsThreshold ? 0 : 10
        }}
        transition={{ duration: 0.3 }}
        className="relative z-20 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl mb-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-300 mb-1">
              ⚠️ CVaR Alert: Risk Exceeds 95th Percentile
            </p>
            <p className="text-[11px] text-red-400/80 leading-relaxed">
              The NPK-CVaR for this hub pair ({selectedPair?.sourceHub} → {selectedPair?.destHub}) 
              has exceeded the 95th percentile threshold. Consider rebalancing or hedging.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer Stats */}
      <div className="relative z-10 px-6 pb-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-slate-500 font-mono">Real-time Deltas</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-500 font-mono">Gaussian Smoothing</span>
          </div>
        </div>

        <div className="px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5 backdrop-blur-md">
          <span className="text-slate-500 font-mono">Global Scenario Sandbox • Live</span>
        </div>
      </div>

      {/* Liquid Glass Card Style */}
      <style>{`
        .liquid-glass {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}