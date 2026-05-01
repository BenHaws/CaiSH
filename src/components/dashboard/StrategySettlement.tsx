import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight, ShieldCheck, Zap, Fingerprint, X } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';

interface StrategySettlementProps {
  strategy: {
    title: string;
    description: string;
    impactScore: number;
  };
  onClose: () => void;
  onSettled: () => void;
}

export default function StrategySettlement({ strategy, onClose, onSettled }: StrategySettlementProps) {
  const [step, setStep] = useState<'review' | 'biometric' | 'simulating' | 'executing' | 'success'>('review');
  const [error, setError] = useState<string | null>(null);

  const startSettlement = () => setStep('biometric');

  const handleExecute = async () => {
    setStep('simulating');
    
    // Artificial delay for "Atmospheric simulation"
    await new Promise(r => setTimeout(r, 1500));
    
    setStep('executing');
    try {
      // For demo purposes, we pick existing accounts to move money
      const accounts = await treasuryService.getAccounts();
      if (!accounts || accounts.length < 2) {
         throw new Error("Insufficient account relays detected in Nexus for execution.");
      }

      const from = accounts[0];
      const to = accounts[1];
      const amount = 500000; // Mock amount for the strategy

      const result = await treasuryService.executeStrategy({
        fromAccountId: from.id,
        toAccountId: to.id,
        amount,
        description: `Strategy Execution: ${strategy.title}`
      });

      if (result.status === 'SUCCESS') {
        setStep('success');
        setTimeout(() => {
          onSettled();
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error || "Nexus settlement failed.");
      }
    } catch (err: any) {
      setError(err.message);
      setStep('review');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg glass-card p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
        
        <AnimatePresence mode="wait">
          {step === 'review' && (
            <motion.div 
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white tracking-tight">Strategy Settlement</h3>
                  <p className="text-slate-400 text-sm">Policy-enforced transaction orchestration.</p>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Strategy</label>
                  <p className="text-lg font-medium text-white">{strategy.title}</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{strategy.description}</p>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-semibold">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onClose}
                  className="px-6 py-4 rounded-2xl bg-white/5 text-slate-300 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={startSettlement}
                  className="px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  Proceed with Settlement <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'biometric' && (
            <motion.div 
              key="biometric"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-10 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative group cursor-pointer" onClick={handleExecute}>
                 <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-all" />
                 <div className="w-32 h-32 rounded-full border-2 border-blue-500/30 flex items-center justify-center relative bg-black/40 backdrop-blur-xl">
                    <Fingerprint className="w-16 h-16 text-blue-400 animate-pulse" />
                 </div>
                 <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-white" />
                 </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Authority Required</h4>
                <p className="text-sm text-slate-400 max-w-[280px]">
                   Touch the scanner to authorize this $500,000 sweep via **CaiSH Virtual Ledger**.
                </p>
              </div>
              <p className="text-[10px] font-mono text-blue-500/50 uppercase tracking-[0.2em]">Validated against Microsoft Entra ID</p>
            </motion.div>
          )}

          {(step === 'simulating' || step === 'executing') && (
            <motion.div 
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
                <Zap className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-2">
                  {step === 'simulating' ? 'Monte Carlo Validation...' : 'Atomically Settling...'}
                </h4>
                <p className="text-sm text-slate-300 max-w-[250px]">
                  {step === 'simulating' 
                    ? 'Running 10,000 iterations to verify post-settlement solvency.' 
                    : 'Updating Nexus persists and committing to virtual ledger.'}
                </p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 flex flex-col items-center justify-center text-center h-full"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-3">Strategy Settled</h4>
              <p className="text-slate-400 text-sm max-w-[280px]">
                Liquidity has been redistributed according to policy rules. Virtual ledger synchronized.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
