import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Upload,
  User,
  Shield,
  Loader2
} from 'lucide-react';

export default function SupplierOnboarding() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const steps = [
    { title: "Business Details", icon: Building2 },
    { title: "UBO Verification", icon: User },
    { title: "Payment Alpha", icon: CreditCard },
    { title: "Review", icon: ShieldCheck }
  ];

  const handleDocUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setStep(step + 1);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-light text-white mb-4">Supplier <span className="font-semibold">On-boarding</span></h2>
        <p className="text-slate-400">Join the Unified Data Fabric for instant liquidity access.</p>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-16 px-4">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3 relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${step > i + 1 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : step === i + 1 ? 'bg-blue-500 border-blue-400 text-white shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/10 text-slate-600'}`}>
               {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i + 1 ? 'text-slate-300' : 'text-slate-600'}`}>{s.title}</span>
            {i < steps.length - 1 && (
              <div className="absolute top-6 left-full w-full h-px bg-white/5 ml-14 -translate-x-14" />
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-12 bg-white/[0.01]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legal Entity Name</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50" defaultValue="Nvidia Corp (GPU Logistics)" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tax ID / VAT</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50" defaultValue="TX-998877" />
                </div>
              </div>
              <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center group hover:border-blue-500/30 transition-all cursor-pointer">
                 <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Upload className="w-6 h-6 text-blue-400" />
                 </div>
                 <p className="text-sm font-semibold text-white mb-2">Upload Certificate of Incorporation</p>
                 <p className="text-xs text-slate-500">Integrated OCR will extract data automatically.</p>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-blue-900/20 flex items-center gap-3"
                >
                  Save & Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-blue-500/10 rounded-[32px] flex items-center justify-center border border-blue-500/20 mx-auto mb-8">
                <Shield className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-light text-white mb-4">Ultimate Beneficial Owner</h3>
              <p className="text-slate-400 max-w-sm mx-auto leading-relaxed mb-10">
                Please upload passport or identity documentation for verification. 
                Our AI will verify authenticity against global databases.
              </p>
              
              {!isUploading ? (
                <button 
                  onClick={handleDocUpload}
                  className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-3"
                >
                  <Upload className="w-4 h-4" />
                  Initiate UBO Scanning
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Neural extraction in progress...</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-4xl font-light text-white mb-4">Integrity <span className="font-semibold">Confirmed</span></h3>
              <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-12">
                Nvidia Corp (GPU Logistics) has been successfully verified. 
                Your "Available to Discount" pool is now being calculated.
              </p>
              <button 
                className="px-12 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] transition-all"
              >
                Access Liquidity Pool
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-between items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Data Handshake Active</span>
        </div>
        <p className="text-[10px] text-slate-600 italic">Institutional KYC boundary compliance v1.0.4</p>
      </div>
    </div>
  );
}
