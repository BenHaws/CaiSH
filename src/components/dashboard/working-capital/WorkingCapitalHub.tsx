import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Users, 
  LineChart, 
  ShoppingCart, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  PieChart,
  Target
} from 'lucide-react';
import SupplierOnboarding from './SupplierOnboarding';
import FinancingMarket from './FinancingMarket';
import SupplierDashboard from './SupplierDashboard';
import FinancierDashboard from './FinancierDashboard';

type ViewMode = 'main' | 'onboarding' | 'market' | 'supplier-view' | 'financier-view';

export default function WorkingCapitalHub() {
  const [view, setView] = useState<ViewMode>('main');

  const pillars = [
    {
      id: 'onboarding',
      title: 'Supplier On-boarding',
      description: 'Streamline KYC/KYB with integrated OCR and UBO extraction.',
      icon: Users,
      color: 'blue',
      action: () => setView('onboarding')
    },
    {
      id: 'market',
      title: 'Financing Market',
      description: 'Bid-Ask marketplace for invoice discounting and capital flow.',
      icon: ShoppingCart,
      color: 'emerald',
      action: () => setView('market')
    },
    {
      id: 'supplier-view',
      title: 'Supplier Portal',
      description: 'Unlock trapped liquidity with "Get Paid Early" discounting views.',
      icon: Zap,
      color: 'amber',
      action: () => setView('supplier-view')
    },
    {
      id: 'financier-view',
      title: 'Financier Dashboard',
      description: 'Portfolio risk scorecards, exposure mapping, and AUM performance.',
      icon: Target,
      color: 'purple',
      action: () => setView('financier-view')
    }
  ];

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        {view === 'main' ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-light tracking-tight text-white mb-3">Working <span className="font-semibold">Capital</span></h2>
                <p className="text-slate-400">Unlock trapped liquidity across the 4-pillar supply chain hub.</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Net Working Capital: +$42.8M</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pillars.map((pillar) => (
                <button 
                  key={pillar.id}
                  onClick={pillar.action}
                  className="group text-left glass-card p-10 hover:border-white/20 hover:bg-white/[0.03] transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${pillar.color}-500/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-${pillar.color}-500/10 transition-colors`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-${pillar.color}-500/10 rounded-2xl flex items-center justify-center border border-${pillar.color}-500/20 mb-8`}>
                      <pillar.icon className={`w-8 h-8 text-${pillar.color}-400`} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{pillar.title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-10 max-w-sm">{pillar.description}</p>
                    
                    <div className="flex items-center gap-3 text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                      Explore Module <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="glass-card p-10 flex items-center justify-between border-blue-500/10 bg-blue-500/5">
              <div className="flex gap-8 items-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <ShieldCheck className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white tracking-tight">Trust & Verification Protocol</h4>
                  <p className="text-sm text-slate-400 mt-2">KYC/AML boundary enforcement for all onboarded participants.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-center">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Onboarded</p>
                   <p className="text-lg font-bold text-white">142</p>
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-center">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">In-Market</p>
                   <p className="text-lg font-bold text-emerald-400">$128M</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="module-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-10">
              <button 
                onClick={() => setView('main')}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Working Capital Hub
              </button>
            </div>
            
            {view === 'onboarding' && <SupplierOnboarding />}
            {view === 'market' && <FinancingMarket />}
            {view === 'supplier-view' && <SupplierDashboard />}
            {view === 'financier-view' && <FinancierDashboard />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
