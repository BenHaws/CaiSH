import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  RefreshCw,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  ChevronRight,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { CorporateEntity, BankAccount } from '../../types';
import { treasuryService } from '../../services/treasuryService';
import ConnectivityWizard from './ConnectivityWizard';
import { useNavigation } from '../../contexts/NavigationContext';

interface Props {
  entity: CorporateEntity;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
};

type DrillDownTarget = 'ledger' | 'cerebro' | 'security' | 'scenario';

interface DrillDownData {
  title: string;
  description: string;
  target: DrillDownTarget;
  icon: any;
  color: string;
}

export default function LiquidityCockpit({ entity }: Props) {
  const { setActiveTab } = useNavigation();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeDrillDown, setActiveDrillDown] = useState<DrillDownData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await treasuryService.getAccounts(entity.id);
      setAccounts(data);
      setTotalBalance(data.reduce((sum, acc) => sum + acc.balance, 0));
    };
    fetchData();
  }, [entity]);

  const chartData = useMemo(() => [
    { name: 'Mon', balance: totalBalance * 0.95, forecast: totalBalance * 0.96 },
    { name: 'Tue', balance: totalBalance * 0.98, forecast: totalBalance * 1.01 },
    { name: 'Wed', balance: totalBalance * 1.02, forecast: totalBalance * 1.04 },
    { name: 'Thu', balance: totalBalance * 0.99, forecast: totalBalance * 1.02 },
    { name: 'Fri', balance: totalBalance, forecast: totalBalance * 1.05 },
    { name: 'Sat', balance: totalBalance * 1.05, forecast: totalBalance * 1.09 },
    { name: 'Sun', balance: totalBalance * 1.08, forecast: totalBalance * 1.12 },
  ], [totalBalance]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: entity.baseCurrency,
      notation: 'compact',
    }).format(val);
  };

  const survivalDays = 142; // Simulated metric
  const dailyBurn = totalBalance * 0.007;

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 button-bg-blue-600 button-hover-blue-500 shadow-blue-900/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 button-bg-emerald-600 button-hover-emerald-500 shadow-emerald-900/20',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400 button-bg-purple-600 button-hover-purple-500 shadow-purple-900/20',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 button-bg-amber-600 button-hover-amber-500 shadow-amber-900/20',
  };

  const getThemeClasses = (color: string) => {
    switch (color) {
      case 'emerald': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' };
      case 'purple': return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' };
      case 'amber': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' };
      default: return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' };
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Cerebro Strategic Insight Pulse */}
      <motion.div 
        variants={itemVariants}
        className="relative p-6 liquid-glass border-blue-500/30 overflow-hidden bg-blue-500/[0.03]"
      >
        <div className="absolute top-0 right-0 p-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-blue-400 opacity-30" />
          </motion.div>
        </div>
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <div className="relative">
              <Zap className="w-5 h-5 text-blue-400 relative z-10" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-blue-400/40 blur-md rounded-full"
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Cerebro AI Strategy</span>
              <span className="text-[10px] text-slate-500 font-mono">ID: CX-9942</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed max-w-3xl font-light italic">
              "System volatility is trending towards a local minimum. I recommend aggregating the $4.2M surplus from **EMEA Ledger** into the **Global Netting Hub** to capture a 24bps yield spread before the 14:00 SWIFT cutoff."
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95">
              Execute Strategy
            </button>
            <button className="px-5 py-2 glass-card hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
              Alternative Paths
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          variants={itemVariants} 
          onClick={() => setActiveDrillDown({
            title: 'Virtual Ledger',
            description: 'Deconstruct consolidated liquidity into real-time ledger nodes and intercompany sub-accounts.',
            target: 'ledger',
            icon: Wallet,
            color: 'blue'
          })}
          className="liquid-glass p-6 group relative overflow-hidden cursor-pointer hover:border-blue-500/40 transition-all active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              +12%
            </div>
          </div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 block opacity-70">Total Liquidity</p>
          <h3 className="text-3xl font-light tracking-tighter text-white font-mono">{formatCurrency(totalBalance)}</h3>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          onClick={() => setActiveDrillDown({
            title: 'Cerebro AI',
            description: 'Review autonomous optimization proposals and simulated yield capture strategies.',
            target: 'cerebro',
            icon: Zap,
            color: 'emerald'
          })}
          className="liquid-glass p-6 group border-emerald-500/10 cursor-pointer hover:border-emerald-500/40 transition-all active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-emerald-500/50 text-[9px] font-black uppercase">Active</span>
          </div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 block opacity-70">Surplus Delta</p>
          <h3 className="text-3xl font-light tracking-tighter text-emerald-400 font-mono">+{formatCurrency(totalBalance * 0.12)}</h3>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          onClick={() => setActiveDrillDown({
            title: 'Vault & Security',
            description: 'Monitor RLS integrity, OIDC session health, and cryptographic settlement proofs.',
            target: 'security',
            icon: ShieldCheck,
            color: 'purple'
          })}
          className="liquid-glass p-6 group border-purple-500/10 cursor-pointer hover:border-purple-500/40 transition-all active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest italic opacity-50">Score</span>
          </div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 block opacity-70">Resilience Index</p>
          <h3 className="text-3xl font-light tracking-tighter text-white font-mono">94.2<span className="text-sm opacity-40 ml-1">/100</span></h3>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          onClick={() => setActiveDrillDown({
            title: 'Scenario Engine',
            description: 'Simulate black-swan events and analyze liquidity survival horizons under stress.',
            target: 'scenario',
            icon: Activity,
            color: 'amber'
          })}
          className="liquid-glass p-6 group border-amber-500/10 bg-amber-500/[0.02] cursor-pointer hover:border-amber-500/40 transition-all active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <Info className="w-4 h-4 text-slate-600 hover:text-white cursor-pointer" />
          </div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 block opacity-70">Survival Horizon</p>
          <h3 className="text-3xl font-light tracking-tighter text-amber-400 font-mono">{survivalDays}<span className="text-xs uppercase ml-1 opacity-60">Days</span></h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Advanced Predictive Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3 liquid-glass p-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h4 className="text-2xl font-light tracking-tighter text-white">Monte Carlo <span className="font-semibold italic text-blue-400">Projection</span></h4>
              <p className="text-sm text-slate-500 mt-1 font-medium italic">Simulating 10,000 liquidity paths with Jump-Diffusion</p>
            </div>
            <div className="flex gap-1.5 p-1 liquid-glass rounded-2xl border border-white/5">
              {['1D', '7D', '30D', '90D'].map((t) => (
                <button 
                  key={t}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${t === '7D' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-600 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }} 
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(2, 6, 23, 0.9)', 
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '24px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}
                />
                <ReferenceLine y={totalBalance} stroke="rgba(52,211,153,0.2)" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorForecast)" 
                  name="AI SENSITIVITY"
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  name="LIVE LEDGER"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex gap-10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Ledger Stream</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500/50 border border-purple-500/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">95% Confidence Interval</span>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">● System Stable</span>
            </div>
          </div>
        </motion.div>

        {/* Actionable Side Registry */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="liquid-glass p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 mb-6 relative">
              <Activity className="w-10 h-10 text-blue-400" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500/20 rounded-full"
              />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white">Daily Burn</h4>
            <p className="text-2xl font-light text-white font-mono mt-1">{formatCurrency(dailyBurn)}</p>
            <p className="text-[10px] text-slate-600 font-bold mt-4 uppercase tracking-widest">Target Reduction: -4%</p>
          </motion.div>

          <motion.div variants={itemVariants} className="liquid-glass p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 opacity-80">Sync Nodes</h4>
              <RefreshCw className="w-3.5 h-3.5 text-slate-600 hover:text-white transition-colors cursor-pointer" />
            </div>
            <div className="space-y-3">
              {accounts.slice(0, 4).map(acc => (
                <div 
                  key={acc.id} 
                  onMouseEnter={() => setHoveredNode(acc.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">
                      {acc.bank.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{acc.name}</p>
                      <p className="text-[9px] text-slate-600 font-mono mt-0.5">{acc.glCode}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3 h-3 text-slate-600 transition-transform ${hoveredNode === acc.id ? 'translate-x-1 text-white' : ''}`} />
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowWizard(true)}
              className="w-full mt-6 py-4 liquid-glass hover:bg-blue-600 rounded-xl text-[9px] text-white transition-all flex items-center justify-center gap-2.5 font-black uppercase tracking-[0.3em] active:scale-[0.98] border border-white/5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Discovery
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showWizard && (
          <ConnectivityWizard 
            onComplete={() => setShowWizard(false)} 
          />
        )}
      </AnimatePresence>

      {/* Drill Down Modal */}
      <AnimatePresence>
        {activeDrillDown && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrillDown(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg liquid-glass-high p-10 overflow-hidden"
            >
              {(() => {
                const theme = getThemeClasses(activeDrillDown.color);
                return (
                  <>
                    <div className="absolute top-0 right-0 p-6">
                      <button 
                        onClick={() => setActiveDrillDown(null)}
                        className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div className={`w-20 h-20 rounded-3xl ${theme.bg} flex items-center justify-center border ${theme.border} mb-8`}>
                        <activeDrillDown.icon className={`w-10 h-10 ${theme.text}`} />
                      </div>
                      
                      <h3 className="text-3xl font-light tracking-tight text-white mb-4 uppercase">
                        {activeDrillDown.title}
                      </h3>
                      
                      <p className="text-slate-100 text-sm leading-relaxed mb-10 max-w-xs font-medium italic">
                        "{activeDrillDown.description}"
                      </p>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <button 
                          onClick={() => setActiveDrillDown(null)}
                          className="py-4 glass-card hover:bg-white/5 text-slate-300 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                        >
                          Close
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab(activeDrillDown.target);
                            setActiveDrillDown(null);
                          }}
                          className={`py-4 ${theme.btn} text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-lg`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Investigate
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

