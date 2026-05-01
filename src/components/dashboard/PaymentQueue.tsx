import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { PaymentItem } from '../../types';
import { ShieldCheck, ShieldAlert, Clock, ArrowRight, User, Filter, Search } from 'lucide-react';

export default function PaymentQueue() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await treasuryService.getPayments();
        setPayments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score < 60) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  };

  const getStatusIcon = (status: string, score: number) => {
    if (status === 'flagged' || score >= 60) return <ShieldAlert className="w-5 h-5 text-purple-400" />;
    return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  };

  const filteredPayments = payments.filter(pay => {
    const matchesSearch = pay.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pay.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pay.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || (
      riskFilter === 'low' ? pay.riskScore < 20 :
      riskFilter === 'medium' ? (pay.riskScore >= 20 && pay.riskScore < 60) :
      pay.riskScore >= 60
    );

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const anomalies = payments.filter(p => p.riskScore >= 60);

  if (isLoading) return <div className="text-white animate-pulse text-center p-12">Analyzing Payment Streams...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3 tracking-[-0.03em]">Integrity <span className="font-semibold">Guard</span></h2>
          <p className="text-slate-300">Real-time payment surveillance and automated risk scoring.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3 group focus-within:border-blue-500/50 transition-all flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search beneficiary or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-white text-sm outline-none w-full placeholder:text-slate-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 border rounded-2xl transition-all flex items-center gap-2 px-6 ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'}`}
          >
            <Filter className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-2 gap-10 border-blue-500/20">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Threshold</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'approved', 'flagged'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s as any)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Risk Severity</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'low', 'medium', 'high'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskFilter(r as any)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${riskFilter === r ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card overflow-hidden border-white/5">
        <div className="p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/[0.01]">
          <div className="flex flex-wrap gap-8 md:gap-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Queue Status</p>
              <p className="text-sm font-bold text-white">{filteredPayments.length} Requests Matched</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">Anomaly Count</p>
              <p className="text-sm font-bold text-purple-400">{anomalies.length} High Risk Items</p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">System Trust</p>
              <p className="text-sm font-bold text-emerald-400">99.98% Confidence</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1.5 leading-none">Neural Surveillance Active</p>
            <p className="text-[11px] text-slate-400 italic">"Autonomous node verification T+0 enabled"</p>
          </div>
        </div>

        <div className="divide-y divide-white/5 bg-black/20">
          {filteredPayments.length > 0 ? filteredPayments.map((pay, i) => (
            <motion.div 
              key={pay.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-8 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-white/[0.03] transition-all group gap-8"
            >
              <div className="flex items-center gap-8 flex-1 min-w-0">
                <div className="flex items-center gap-5 min-w-[280px]">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 shadow-inner group-hover:border-blue-500/30 transition-all">
                    <User className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">{pay.beneficiary}</h5>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em]">{pay.id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="text-[10px] text-blue-400 uppercase font-black tracking-[0.1em]">{pay.type}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 shadow-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
                    {new Date(pay.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-10 xl:gap-20">
                <div className={`px-6 py-2.5 rounded-2xl border backdrop-blur-md shadow-lg ${getRiskColor(pay.riskScore)} flex items-center gap-4 transition-transform group-hover:scale-105`}>
                  {getStatusIcon(pay.status, pay.riskScore)}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Score</p>
                    <p className="text-base font-black leading-none mt-1">{pay.riskScore}</p>
                  </div>
                </div>

                <div className="text-right min-w-[160px]">
                  <p className="text-2xl font-light tracking-tighter text-white font-mono">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: pay.currency }).format(pay.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-2 leading-none flex items-center justify-end gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${pay.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {pay.status === 'pending' ? 'Processing Hub' : 'Verified Node'}
                  </p>
                </div>

                <button className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center bg-white/[0.01] hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all group/btn hover:translate-x-1">
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover/btn:text-white" />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <Search className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-white font-semibold">No transactions found</p>
                <p className="text-slate-400 text-sm mt-1">Adjust your filters to scan different quadrants of the network.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Insights */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative p-10 glass-card border-purple-500/20 bg-black/40 backdrop-blur-2xl flex flex-col lg:flex-row gap-10 items-start lg:items-center">
          <div className="w-20 h-20 bg-purple-500/10 rounded-[24px] flex items-center justify-center shrink-0 border border-purple-500/20 shadow-2xl shadow-purple-900/20">
            <ShieldAlert className="w-10 h-10 text-purple-400 animate-pulse" />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-500/30 rounded">Anomalous Activity Detected</span>
                 <span className="text-[10px] text-slate-500 font-mono">UETR: 7e73-b2a-ff91-002</span>
              </div>
              <h4 className="text-2xl font-light text-white leading-tight tracking-tight">Active <span className="font-semibold italic">Liquidity Heuristics</span></h4>
              <p className="text-slate-300 text-sm leading-relaxed mt-4 max-w-4xl font-light italic border-l-2 border-purple-500/30 pl-6">
                "CaiSH detected a potential settlement mismatch for Acme Logistics. The beneficiary's bank node (DE-HSBC)
                 has seen abnormal latency deviations and high-frequency velocity spikes in the last 4 hours. 
                 <span className="text-purple-400 font-bold ml-1 italic underline decoration-purple-500/30 underline-offset-4">Automated hold recommended to prevent capital leakage.</span>"
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button className="px-10 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:opacity-90 transition-all shadow-2xl shadow-purple-900/40 active:scale-95">
                Execute Forensic Audit
              </button>
              <button className="px-10 py-3.5 bg-white/[0.03] border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/5 hover:text-white transition-all active:scale-95">
                Dismiss Signal
              </button>
            </div>
          </div>
          
          <div className="hidden xl:block w-48 shrink-0 space-y-4 text-right">
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Confidence</p>
                <p className="text-lg font-bold text-purple-400">94.2%</p>
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node Latency</p>
                <p className="text-lg font-bold text-blue-400">+142ms</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
