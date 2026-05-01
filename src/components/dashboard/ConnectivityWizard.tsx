import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { BankDiscoveryItem } from '../../types';
import { 
  Building2, 
  Smartphone, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  BrainCircuit,
  Loader2,
  Lock
} from 'lucide-react';

interface ConnectivityWizardProps {
  onComplete: () => void;
}

export default function ConnectivityWizard({ onComplete }: ConnectivityWizardProps) {
  const [step, setStep] = useState(1);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredItems, setDiscoveredItems] = useState<BankDiscoveryItem[]>([]);

  const startDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const data = await treasuryService.startDiscovery();
      setDiscoveredItems(data);
      setStep(3);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const steps = [
    { title: "Connect Core", icon: Lock },
    { title: "AI Analysis", icon: BrainCircuit },
    { title: "Nexus Review", icon: Layers },
    { title: "Finalize", icon: ShieldCheck }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="liquid-glass max-w-4xl w-full p-12 relative overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />

        <div className="relative z-10">
          {/* Stepper Header */}
          <div className="flex justify-between items-center mb-16 px-4">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${step > i + 1 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : step === i + 1 ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                   {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i + 1 ? 'text-slate-300' : 'text-slate-600'}`}>{s.title}</span>
                {i < steps.length - 1 && (
                  <div className="absolute top-5 left-full w-full h-px bg-white/5 ml-10 -translate-x-10" />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-blue-500/10 rounded-[32px] flex items-center justify-center border border-blue-500/20 mx-auto mb-8">
                  <Lock className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-3xl font-light text-white mb-4">Connect your <span className="font-semibold">Master Secret</span></h3>
                <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-10">
                  Securely link your primary treasury institution via high-fidelity APIs. 
                  CaiSH utilizes encrypted OIDC handshakes for initial handshake.
                </p>
                <button 
                  onClick={() => setStep(2)}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:scale-[1.02] transition-all"
                >
                  Link via secure gateway
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                <div className="relative mb-12">
                   <div className="w-32 h-32 rounded-full border-2 border-white/5 mx-auto flex items-center justify-center p-4">
                      <div className="w-full h-full rounded-full border-2 border-dashed border-blue-500/30 animate-spin flex items-center justify-center p-6">
                         <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20">
                            <BrainCircuit className="w-10 h-10 text-white" />
                         </div>
                      </div>
                   </div>
                </div>
                <h3 className="text-3xl font-light text-white mb-4">AI-Driven <span className="font-semibold">Discovery</span></h3>
                <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-10">
                  Cerebro is now parsing your bank statements and API transactions to 
                  autonomously reconstruct your corporate hierarchy.
                </p>
                {!isDiscovering ? (
                  <button 
                    onClick={startDiscovery}
                    className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all"
                  >
                    Initiate Neural Scan
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-blue-400 font-bold text-xs uppercase tracking-widest">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Parsing data streams...
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-light text-white mb-2">Nexus <span className="font-semibold">Context Review</span></h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Verified by Cerebro AI</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {discoveredItems.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="liquid-glass p-6 bg-white/[0.02] border-white/5 hover:border-blue-500/20 transition-all flex items-center gap-6"
                    >
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-white">{item.bankName}</h4>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">{(item.confidence * 100).toFixed(0)}% AI CONF</span>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-medium">Suggested: {item.accountType} (GL: {item.suggestedGL})</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center mt-12 gap-6">
                  <button onClick={() => setStep(2)} className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Adjust Mapping</button>
                  <button 
                    onClick={() => setStep(4)}
                    className="flex items-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all"
                  >
                    Confirm Nexus Integrity <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-emerald-500/40">
                  <ShieldCheck className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-4xl font-light text-white mb-4">RLS <span className="font-semibold">Lockdown Active</span></h3>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 max-w-md mx-auto mb-10">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "Isolation confirmed. Data for Subsidiary A is now mathematically unreachable by other units. 
                    Row-Level Security context has been initialized for user: <strong>Ben@cwgs.wtf</strong>"
                  </p>
                </div>
                <button 
                  onClick={onComplete}
                  className="px-12 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] transition-all"
                >
                  Enter Mission Control
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
