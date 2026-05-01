import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSimulation } from '../../contexts/SimulationContext';
import { Zap, X, Sliders, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function SandboxControl() {
  const { state, toggleActive, setRateShock, setFxVol, setDefaultShock } = useSimulation();

  if (!state.isActive) return null;

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      className="absolute top-24 right-0 z-[50] w-80 glass-card p-0 overflow-hidden shadow-2xl border-blue-500/30"
    >
      <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-white fill-white" />
            <span className="text-[10px] font-black tracking-widest text-white uppercase italic">Scenario Sandbox v1</span>
         </div>
         <button onClick={toggleActive} className="text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
         </button>
      </div>

      <div className="p-8 space-y-8">
        {/* Interest Rate Shock */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Activity className="w-3 h-3 text-orange-400" /> Rate Shock
              </label>
              <span className="text-xs font-mono font-bold text-orange-400">+{state.interestRateShock}bps</span>
           </div>
           <input 
             type="range" min="0" max="500" step="25"
             value={state.interestRateShock}
             onChange={(e) => setRateShock(parseInt(e.target.value))}
             className="w-full accent-orange-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
           />
        </div>

        {/* FX Volatility */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <DollarSign className="w-3 h-3 text-emerald-400" /> FX Vol
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">+{((state.fxVolatility - 1) * 100).toFixed(0)}%</span>
           </div>
           <input 
             type="range" min="1" max="1.5" step="0.01"
             value={state.fxVolatility}
             onChange={(e) => setFxVol(parseFloat(e.target.value))}
             className="w-full accent-emerald-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
           />
        </div>

        {/* Credit/Default Shock */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <TrendingUp className="w-3 h-3 text-purple-400" /> Default Multiplier
              </label>
              <span className="text-xs font-mono font-bold text-purple-400">x{state.defaultRateShock.toFixed(1)}</span>
           </div>
           <input 
             type="range" min="1" max="3" step="0.1"
             value={state.defaultRateShock}
             onChange={(e) => setDefaultShock(parseFloat(e.target.value))}
             className="w-full accent-purple-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
           />
        </div>

        <div className="pt-4 border-t border-white/5">
           <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Global Nexus Recalculation Active</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
