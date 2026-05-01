import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { DebtInstrument } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  LineChart, 
  Activity, 
  Calendar,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ShieldEllipsis,
  X,
  ChevronRight,
  History,
  Info
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SensitivityResult } from '../../types';

export default function DebtInvestmentsModule() {
  const [instruments, setInstruments] = useState<DebtInstrument[]>([]);
  const [sensitivity, setSensitivity] = useState<SensitivityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedInstrument = instruments.find(i => i.id === selectedId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const instData = await treasuryService.getDebtInvestments();
        setInstruments(instData);
        if (instData.length > 0) {
          const sens = await treasuryService.runDebtSensitivityAnalysis(instData[0].id);
          setSensitivity(sens);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Debt & <span className="font-semibold">Investments</span></h2>
          <p className="text-slate-400">Institutional lifecycle management for complex financial instruments and derivatives.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 glass-card bg-blue-500/5 border-blue-500/20 text-center">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Total Outstanding</p>
              <p className="text-xl font-bold text-white">$1.24B</p>
           </div>
           <div className="px-6 py-3 glass-card bg-emerald-500/5 border-emerald-500/20 text-center">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Market Value (MtM)</p>
              <p className="text-xl font-bold text-white">$1.22B</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Instrument Pipeline */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Active Portfolio</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing Feed Active (SOFR: 5.32%)</span>
               </div>
            </div>
            
            <div className="divide-y divide-white/5">
              {instruments.map(inst => (
                <div 
                  key={inst.id} 
                  onClick={() => setSelectedId(inst.id)}
                  className="p-8 hover:bg-white/[0.04] transition-all group flex items-center justify-between cursor-pointer"
                >
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${inst.type === 'Bond' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                         {inst.type === 'Bond' ? <ShieldCheck className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-white tracking-wide">{inst.name}</h4>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{inst.type}</span>
                            <span className="text-slate-800">•</span>
                            <span className="text-[10px] font-mono text-slate-600">{inst.principal.toLocaleString()} {inst.currency}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-16">
                      <div className="text-right hidden sm:block">
                         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Coupon / Base</p>
                         <p className="text-sm font-bold text-white mt-1">{inst.currentRate}% {inst.rateType === 'Floating' ? `(${inst.baseRate})` : ''}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Maturity</p>
                         <p className="text-sm font-bold text-white mt-1">{inst.maturityDate}</p>
                      </div>
                      <div className="w-px h-10 bg-white/10 hidden sm:block" />
                      <div className="text-right">
                         <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">MtM Valuation</p>
                         <p className="text-lg font-bold text-white mt-1">
                           {inst.valuations?.length > 0 
                             ? formatCurrency(inst.valuations[inst.valuations.length - 1].mtm, inst.currency)
                             : 'N/A'
                           }
                         </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                   </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {selectedInstrument && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card bg-blue-500/[0.03] border-blue-500/20 p-8 space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <Info className="w-5 h-5 text-blue-400" />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-white">{selectedInstrument.name} Details</h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Instrument ID: {selectedInstrument.id}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedId(null)}
                      className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Instrument Parameters</p>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-white/5">
                             <span className="text-[10px] text-slate-400 uppercase">Principal</span>
                             <span className="text-xs font-mono text-white">{selectedInstrument.principal.toLocaleString()} {selectedInstrument.currency}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/5">
                             <span className="text-[10px] text-slate-400 uppercase">Effective Rate</span>
                             <span className="text-xs font-mono text-white">{selectedInstrument.currentRate}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-white/5">
                             <span className="text-[10px] text-slate-400 uppercase">Maturity Date</span>
                             <span className="text-xs font-mono text-emerald-400 font-bold">{selectedInstrument.maturityDate}</span>
                          </div>
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Coupon Payment History</p>
                          <History className="w-3 h-3 text-slate-600" />
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedInstrument.couponHistory?.map((coupon, i) => (
                             <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center group hover:border-blue-500/20 transition-all">
                                <div>
                                   <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{coupon.date}</p>
                                   <p className="text-sm font-mono text-white">{formatCurrency(coupon.amount, selectedInstrument.currency)}</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${coupon.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                   {coupon.status}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-6">
             <div className="glass-card p-8 bg-blue-500/[0.02] border-blue-500/10">
                <div className="flex items-center gap-3 mb-6">
                   <Activity className="w-5 h-5 text-blue-400" />
                   <h4 className="text-xs font-bold text-white uppercase tracking-widest">Sensitivity Analysis</h4>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">IR Shock (±100bps)</p>
                      <p className="text-sm font-bold text-blue-400">-$14.2M Delta</p>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[40%] bg-blue-500/40" />
                   </div>
                   <p className="text-[10px] text-slate-500 italic">"Compliant with IFRS 9 / US GAAP disclosure requirements."</p>
                </div>
             </div>

             <div className="glass-card p-8 bg-emerald-500/[0.02] border-emerald-500/10">
                <div className="flex items-center gap-3 mb-6">
                   <LineChart className="w-5 h-5 text-emerald-400" />
                   <h4 className="text-xs font-bold text-white uppercase tracking-widest">Mark-to-Market Feed</h4>
                </div>
                <div className="h-24 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={[
                        { t: 0, v: 495 }, { t: 1, v: 492 }, { t: 2, v: 498 }, { t: 3, v: 502 }, { t: 4, v: 510 }
                      ]}>
                         <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
                      </ReLineChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass-card p-10 bg-white/[0.01]">
              <h3 className="text-xl font-semibold text-white tracking-tight mb-8">Instrument Lifecycle</h3>
              <div className="space-y-4">
                 <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40">
                    <PlusIcon className="w-4 h-4" />
                    New Bond Issuance
                 </button>
                 <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
                    Initiate IR Swap Hedge
                 </button>
                 <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
                    Term Loan Prepayment
                 </button>
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-slate-950/50 border border-white/5">
                 <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Regulatory Alert</span>
                 </div>
                 <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    "SOFR transition for <strong>Term Loan B</strong> node complete. Historical fallback delta archived for auditing."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
