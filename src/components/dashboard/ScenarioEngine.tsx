import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, AlertCircle, AreaChart as RefreshChart, Zap, ShieldAlert, Sliders, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { treasuryService } from '../../services/treasuryService';
import { CorporateEntity, SimulationResult } from '../../types';
import { useSimulation } from '../../contexts/SimulationContext';
import SandboxControl from './SandboxControl';

interface Props {
  entity: CorporateEntity;
}

export default function ScenarioEngine({ entity }: Props) {
  const { 
    state: simState, 
    toggleActive: toggleSim, 
    setRateShock, 
    setFxVol, 
    setDefaultShock 
  } = useSimulation();
  const [driftRate, setDriftRate] = useState(0.05); // 5% drift
  const [volatility, setVolatility] = useState(0.15); // 15% vol
  const [horizon, setHorizon] = useState(90); // 90 days
  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const accounts = await treasuryService.getAccounts(entity.id);
      const currentCash = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      
      const simData = await treasuryService.simulateLiquidity(currentCash, driftRate, volatility, horizon);
      setResult(simData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [entity]);

  return (
    <div className="space-y-12 max-w-6xl relative">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <RefreshChart className="w-5 h-5 text-indigo-400" />
             </div>
             <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em]">Merton Jump-Diffusion V3.2</span>
          </div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Scenario <span className="font-semibold">Engine</span></h2>
          <p className="text-slate-400">Modeling probabilistic liquidity using jump-diffusion paths & fat-tailed distributions.</p>
        </div>

        <div className="flex flex-col items-end gap-6">
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl rounded-2xl p-1.5 border border-white/5 shadow-2xl">
              <button 
                onClick={toggleSim}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${simState.isActive ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Zap className={`w-3 h-3 ${simState.isActive ? 'fill-white' : ''}`} />
                Simulation
              </button>
              <button 
                onClick={toggleSim}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${!simState.isActive ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Production
              </button>
           </div>
           
           <button 
             onClick={runSimulation}
             disabled={isSimulating}
             className="px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 disabled:opacity-50 text-white rounded-2xl font-black flex items-center gap-3 transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-[10px]"
           >
             <RefreshChart className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
             {isSimulating ? 'Recalculating...' : 'Refresh Path'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Controls */}
        <div className="liquid-glass p-10 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
             <Sliders className="w-12 h-12 text-blue-500/10" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Hyperparameters</h4>
          
          <div className="space-y-10">
            <div>
              <div className="flex justify-between mb-5">
                <label className="text-sm font-semibold text-slate-200">Expected Drift</label>
                <span className="text-blue-400 font-mono font-bold text-sm">{(driftRate * 100).toFixed(1)}%</span>
              </div>
              <input 
                type="range" min="-0.2" max="0.2" step="0.01" 
                value={driftRate} 
                onChange={(e) => setDriftRate(parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">
                <span>Recession</span>
                <span>Growth</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-5">
                <label className="text-sm font-semibold text-slate-200">Market Volatility</label>
                <span className="text-purple-400 font-mono font-bold text-sm">{(volatility * 100).toFixed(1)}%</span>
              </div>
              <input 
                type="range" min="0.05" max="0.5" step="0.01" 
                value={volatility} 
                onChange={(e) => setVolatility(parseFloat(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">
                <span>Stable</span>
                <span>Violent</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-5">
                <label className="text-sm font-semibold text-slate-200">Horizon (Days)</label>
                <span className="text-white font-mono font-bold text-sm">{horizon} Days</span>
              </div>
              <input 
                type="range" min="30" max="365" step="30" 
                value={horizon} 
                onChange={(e) => setHorizon(parseInt(e.target.value))}
                className="w-full accent-slate-400 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
            <div className="liquid-glass p-12 flex flex-col items-center justify-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.02] flex text-blue-400 group-hover:opacity-[0.05] transition-opacity">
                <Activity className="w-48 h-48" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Chance of Survival</p>
              <h2 className={`text-7xl font-light tracking-tighter transition-colors ${Number(result?.chanceOfSurvival) > 90 ? 'text-emerald-400' : 'text-purple-400'}`}>
                {result?.chanceOfSurvival}<span className="text-3xl font-medium opacity-50 ml-1">%</span>
              </h2>
              <div className="mt-8 flex items-center gap-2 px-6 py-2 bg-white/[0.03] rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-white/5">
                <span>Confidence Interv: 95%</span>
              </div>
            </div>

            <div className="liquid-glass p-12 flex flex-col items-center justify-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Value at Risk (VaR)</p>
              <h2 className="text-6xl font-light tracking-tighter text-white">
                {result ? new Intl.NumberFormat('en-US', { style: 'currency', currency: entity.baseCurrency, notation: 'compact' }).format(Number(result.var95)) : '---'}
              </h2>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Max Loss over {horizon} Days</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simulation Sandbox Pop-out */}
      <AnimatePresence>
        {simState.isActive && (
           <SandboxControl />
        )}
      </AnimatePresence>
    </div>
  );
}
