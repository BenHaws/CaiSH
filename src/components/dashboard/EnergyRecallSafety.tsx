import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, RefreshCw, XCircle, CheckCircle2, Flame, ArrowUpRight } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';

interface Trade {
  id: string;
  instrument: string;
  notional: number;
  uetr: string;
  status: 'SETTLED' | 'IN_FLIGHT' | 'PENDING_RECALL' | 'FIXED';
}

export default function EnergyRecallSafety() {
  const [trade, setTrade] = useState<Trade>({
    id: 'E-7721',
    instrument: 'WTI Swap - Q3 26',
    notional: 12500000,
    uetr: 'UETR-88219-XJQ-SHP',
    status: 'IN_FLIGHT'
  });
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isRecalling, setIsRecalling] = useState(false);
  const [recallSuccess, setRecallSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            executeRecall();
            return 100;
          }
          return prev + 5; // 2 seconds total for long press
        });
      }, 100);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding]);

  const executeRecall = async () => {
    setIsRecalling(true);
    setIsHolding(false);
    try {
      const res = await treasuryService.initiateStopAndRecall(trade.id);
      if (res.status === 'PENDING') {
        setTrade(prev => ({ ...prev, status: 'PENDING_RECALL' }));
        setRecallSuccess(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRecalling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_FLIGHT': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'PENDING_RECALL': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'FIXED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="glass-card p-10 bg-slate-900/60 border border-white/5">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
             </div>
             <span className="text-orange-400 text-[10px] font-bold uppercase tracking-[0.2em]">Energy Hedging Safety</span>
          </div>
          <h3 className="text-2xl font-light text-white tracking-tight">Stop & <span className="font-semibold">Recall Hub</span></h3>
          <p className="text-xs text-slate-500 mt-2 italic max-w-md leading-relaxed">
            Intentional Friction-as-a-Feature. Every recall request requires a 2-second verified intent hold to prevent fat-finger risk in billion-dollar settlement windows.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none mb-1">SWIFT gpi Tracking</p>
              <p className="text-xs font-mono text-slate-400">{trade.uetr}</p>
           </div>
           <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(trade.status)} shadow-lg`}>
              {trade.status.replace('_', ' ')}
           </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-950/40 border border-white/5 mb-10 flex items-center justify-between">
         <div className="flex gap-12">
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Instrument</p>
               <p className="text-xl font-bold text-white uppercase tracking-tight">{trade.instrument}</p>
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Net Notional</p>
               <p className="text-xl font-bold text-white font-mono">${(trade.notional / 1e6).toFixed(1)}M</p>
            </div>
         </div>
         <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-xl text-red-400 border border-red-500/20">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">At Risk</span>
         </div>
      </div>

      <div className="flex flex-col items-center">
         <div className="w-full max-w-sm">
            <button 
               onMouseDown={() => !recallSuccess && setIsHolding(true)}
               onMouseUp={() => setIsHolding(false)}
               onMouseLeave={() => setIsHolding(false)}
               onTouchStart={() => !recallSuccess && setIsHolding(true)}
               onTouchEnd={() => setIsHolding(false)}
               disabled={isRecalling || recallSuccess}
               className={`w-full py-6 rounded-3xl relative overflow-hidden transition-all flex items-center justify-center gap-4 group ${
                  recallSuccess ? 'bg-emerald-500 text-white cursor-default' : 'bg-red-600/10 text-red-500 border-2 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/20'
               }`}
            >
               {/* Progress Bar */}
               {!recallSuccess && (
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${holdProgress}%` }}
                     className="absolute bottom-0 left-0 h-full bg-red-600/30 pointer-events-none" 
                  />
               )}
               
               {isRecalling ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
               ) : recallSuccess ? (
                  <CheckCircle2 className="w-6 h-6" />
               ) : (
                  <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
               )}

               <div className="text-left">
                  <p className="text-sm font-bold uppercase tracking-widest leading-none">
                     {isRecalling ? 'Communicating with SWIFT...' : recallSuccess ? 'STPR_REQUEST_SENT' : 'Hold to Stop & Recall'}
                  </p>
                  {!isRecalling && !recallSuccess && (
                     <p className="text-[9px] font-bold uppercase tracking-tight text-red-400 mt-1 opacity-60">Friction Protocol Level 3</p>
                  )}
               </div>
            </button>
            <p className="text-[10px] text-slate-600 text-center mt-4 font-bold uppercase tracking-widest">
               {recallSuccess ? 'Transaction identified and flagged for reversal.' : 'Intent proof required for trade reversal.'}
            </p>
         </div>
      </div>

      <AnimatePresence>
         {recallSuccess && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="mt-10 p-6 glass-card bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-6"
            >
               <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
                  <ArrowUpRight className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h4 className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-1">STPR SEQUENCE INITIATED</h4>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    SWIFT gpi Tracker has acknowledged the stop. Partner bank "Goldman-Nexus-NY" is holding the funds in pending state for internal review.
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center px-4">
         <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-orange-500/40" />
            <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest leading-none italic">Bank Partner Node: Active</span>
         </div>
         <button className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors">SWIFT API Docs</button>
      </div>
    </div>
  );
}
