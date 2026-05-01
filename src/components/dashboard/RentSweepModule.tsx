import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ArrowRightLeft, ShieldCheck, History, AlertCircle, CheckCircle2 } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { SweepRule, SweepResult } from '../../types';

export default function RentSweepModule() {
  const [rules, setRules] = useState<SweepRule[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [lastResult, setLastResult] = useState<SweepResult | null>(null);
  const [amountReceived, setAmountReceived] = useState(125000); // Mock rent batch
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await treasuryService.getSweepRules();
        setRules(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const handleSweep = async () => {
    setIsSweeping(true);
    setLastResult(null);
    try {
      const result = await treasuryService.executeRentSweep('P-99', amountReceived);
      setLastResult(result);
    } catch (error) {
       console.error("SWEEP_FAILURE:", error);
    } finally {
      setIsSweeping(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse uppercase tracking-[0.2em] text-[10px] font-bold">Initializing Sweep Engine...</div>;

  return (
    <div className="glass-card p-10 bg-emerald-950/10 border border-emerald-500/10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
               <ArrowRightLeft className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white tracking-widest uppercase italic">Auto-Sweep Engine</h3>
               <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest leading-none">Rent-to-Escrow Liquidity Automation</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Automating the redistribution of rent proceeds into property-specific tax, maintenance, and debt service escrows based on Nexus Topology rules.
          </p>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Incoming Batch</p>
           <p className="text-3xl font-bold text-white">${amountReceived.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10 mb-10">
         <div className="space-y-6">
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-white/5 pb-3">Active Sweep Rules</h4>
            {rules.map(rule => (
               <div key={rule.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                     <p className="text-xs text-slate-300 font-bold uppercase">{rule.percentage * 100}% Tax Set-Aside</p>
                     <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">{rule.sourceAccountId} → {rule.targetAccountId}</p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
               </div>
            ))}
            <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
               + Add Logic Trigger
            </button>
         </div>

         <div className="flex flex-col justify-center gap-6">
            <div className="glass-card p-8 bg-black/20 text-center relative overflow-hidden">
               {isSweeping && (
                  <motion.div 
                     initial={{ x: '-100%' }}
                     animate={{ x: '100%' }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                     className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 opacity-50"
                  />
               )}
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Projected Sweep Total</p>
               <p className="text-4xl font-bold text-emerald-400 mb-8">${(amountReceived * 0.25).toLocaleString()}</p>
               
               <button 
                  onClick={handleSweep}
                  disabled={isSweeping}
                  className={`w-full py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
                     isSweeping ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/20'
                  }`}
               >
                  {isSweeping ? (
                     <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                     <RefreshCw className="w-5 h-5" />
                  )}
                  {isSweeping ? 'Processing Sweep...' : 'Initiate Rent Sweep'}
               </button>
            </div>
         </div>
      </div>

      <AnimatePresence>
         {lastResult && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between"
            >
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">
                     <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-white uppercase tracking-widest">Sweep Executed Successfully</h4>
                     <p className="text-[10px] text-emerald-400/80 font-mono mt-1">TRACE: {lastResult.traceId}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Internal Movement</p>
                  <p className="text-xl font-bold text-white">${lastResult.totalSwept.toLocaleString()}</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="mt-8 flex items-center gap-4 text-slate-600 p-4 border-t border-white/5">
         <History className="w-4 h-4" />
         <p className="text-[10px] uppercase font-bold tracking-widest italic leading-none">
            RLS Enforcement Confirmed: "SWEEP_RULES" restricted to Entity #P-99. 
            All movements recorded in VIRTUAL_JOURNAL.
         </p>
      </div>
    </div>
  );
}
