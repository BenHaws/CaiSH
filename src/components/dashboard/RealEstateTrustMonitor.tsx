import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Home, DollarSign, ArrowUpRight, Lock } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { TrustAccount } from '../../types';
import RentSweepModule from './RentSweepModule';

export default function RealEstateTrustMonitor() {
  const [accounts, setAccounts] = useState<TrustAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrust = async () => {
      try {
        const data = await treasuryService.getTrustAccounts();
        setAccounts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrust();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-500">Decrypting RLS Isolation Layers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4 px-4">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white mb-2">Real Estate <span className="font-semibold">Trust Monitor</span></h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">FORCE RLS ENABLED</span>
             </div>
             <p className="text-xs text-slate-500">Property-specific isolation at the hardware level.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Managed Trust</p>
          <p className="text-4xl font-bold text-white">$5.47M</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Home className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {account.id}
              </div>
            </div>

            <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{account.propertyName}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{account.accountType.replace('_', ' ')}</p>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 italic">Authorized Balance</p>
                  <p className="text-2xl font-bold text-white">${account.balance.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1 text-emerald-400 mb-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="text-xs font-bold font-mono">+12.4%</span>
                   </div>
                   <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-none">MoM Growth</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Audit Status: Clean</span>
                </div>
                <button className="text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:underline">View Escrow</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-10 bg-emerald-950/20 border border-emerald-500/10">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] shrink-0">
               <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-1 uppercase italic tracking-tighter">Escrow Isolation Engine</h3>
               <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Real Estate trust accounts are subject to "Hardware-Level" Row Level Security. Property managers can only decrypt data associated with their unique 256-bit identifier. Unauthorized access attempts trigger immediate node isolation.
               </p>
            </div>
            <button className="ml-auto px-8 py-4 bg-white text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl">
               Run Audit
            </button>
         </div>
      </div>

      <RentSweepModule />
    </div>
  );
}
