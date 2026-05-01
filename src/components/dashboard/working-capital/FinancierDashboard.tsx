import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { treasuryService } from '../../../services/treasuryService';
import { FinancierPortfolio } from '../../../types';
import { 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  PieChart as PieIcon, 
  Globe, 
  Briefcase, 
  Activity,
  ArrowUpRight,
  ChevronRight,
  Microscope,
  RotateCcw,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, AreaChart, Area, CartesianGrid } from 'recharts';
import { StressTestResult } from '../../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];

export default function FinancierDashboard() {
  const [portfolio, setPortfolio] = useState<FinancierPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stress Test State
  const [rateShock, setRateShock] = useState(0);
  const [defaultRate, setDefaultRate] = useState(1.5);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    treasuryService.getFinancingPortfolio()
      .then(setPortfolio)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (portfolio) {
      const timer = setTimeout(() => {
        handleStressTest();
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [portfolio, rateShock, defaultRate]);

  const handleStressTest = async () => {
    if (!portfolio) return;
    setIsSimulating(true);
    try {
      const res = await treasuryService.runPortfolioStressTest(portfolio.aum, rateShock, defaultRate);
      setStressResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!portfolio) return <div className="p-20 text-center animate-pulse text-slate-500 font-mono text-xs uppercase italic">Loading Asset Metadata...</div>;
  if (!portfolio.exposure) return <div className="p-20 text-center text-rose-500 font-mono text-xs uppercase italic">Portfolio Integrity Error: Exposure Data Missing</div>;

  const industryData = Object.entries(portfolio.exposure.industry || {}).map(([name, value]) => ({ name, value }));
  const regionData = Object.entries(portfolio.exposure.region || {}).map(([name, value]) => ({ name, value }));
  const creditData = Object.entries(portfolio.exposure.creditRating || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Financier <span className="font-semibold">Scorecard</span></h2>
          <p className="text-slate-400">Strategic portfolio monitoring and cross-entity risk surveillance.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Capital Deployed (AUM)</p>
              <p className="text-3xl font-light text-white">${(portfolio.aum / 1e9).toFixed(1)}B</p>
           </div>
           <div className="h-10 w-px bg-white/10" />
           <div className="text-right">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">CAGR (Annualized)</p>
              <p className="text-3xl font-light text-emerald-400">+{portfolio.cagr}%</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* Portfolio Stress (Financier) - Mockup Matched */}
         <div className="col-span-12 lg:col-span-4 glass-card p-10 bg-slate-900/60 border-white/5">
            <div className="mb-10">
               <h3 className="text-[10px] font-bold text-[#a855f7] uppercase tracking-[0.2em] mb-1">Portfolio Stress</h3>
               <p className="text-[10px] font-bold text-[#a855f7]/60 uppercase tracking-[0.1em]">(Financier)</p>
            </div>
            
            <div className="space-y-12">
               {/* Interest Rate Shock */}
               <div className="space-y-6">
                  <div className="flex justify-between items-baseline">
                     <label className="text-sm font-bold text-slate-100 tracking-tight">Interest Rate<br/>Shock</label>
                     <span className="text-lg font-bold text-orange-500">{rateShock > 0 ? '+' : ''}{rateShock} bps</span>
                  </div>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200" 
                    step="25"
                    value={rateShock}
                    onChange={(e) => setRateShock(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
               </div>

               {/* Default Probability */}
               <div className="space-y-6">
                  <div className="flex justify-between items-baseline">
                     <label className="text-sm font-bold text-slate-100 tracking-tight">Default Probability</label>
                     <span className="text-lg font-bold text-rose-500">{defaultRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={defaultRate}
                    onChange={(e) => setDefaultRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
               </div>
            </div>

            {stressResult && (
              <div className="mt-14 p-6 bg-black/20 rounded-xl border border-white/5">
                 <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-2">Simulated VaR Impact</p>
                 <p className="text-2xl font-light text-rose-400">-${(stressResult.var95 / 1e6).toFixed(1)}M</p>
              </div>
            )}
         </div>

         {/* Fan Chart / Probability Bands */}
         <div className="col-span-12 lg:col-span-8 glass-card p-10">
            <div className="flex justify-between items-center mb-10">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white tracking-tight">Monte Carlo Probability Bands</h3>
               </div>
               <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <RotateCcw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
                  {isSimulating ? 'Recalculating...' : 'Real-time Feed'}
               </div>
            </div>

            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { x: -2, p5: (stressResult?.p5 || 4400000000) * 0.98, median: (stressResult?.median || 4500000000) * 0.99, p95: (stressResult?.p95 || 4600000000) * 1.0 },
                    { x: -1, p5: (stressResult?.p5 || 4400000000) * 0.99, median: (stressResult?.median || 4500000000) * 1.0, p95: (stressResult?.p95 || 4600000000) * 1.01 },
                    { x: 0, p5: stressResult?.p5, median: stressResult?.median, p95: stressResult?.p95 },
                    { x: 1, p5: (stressResult?.p5 || 4400000000) * 1.01, median: (stressResult?.median || 4500000000) * 1.02, p95: (stressResult?.p95 || 4600000000) * 1.03 },
                    { x: 2, p5: (stressResult?.p5 || 4400000000) * 1.02, median: (stressResult?.median || 4500000000) * 1.04, p95: (stressResult?.p95 || 4600000000) * 1.06 }
                  ]}>
                    <defs>
                      <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="x" hide />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${(val / 1e9).toFixed(1)}B`}
                    />
                    <Tooltip 
                       contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="p95" stroke="none" fill="#1e293b" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="median" stroke="#3b82f6" strokeWidth={3} fill="url(#colorMedian)" />
                    <Area type="monotone" dataKey="p5" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            
            <div className="mt-8 flex justify-center gap-10">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expected Outcome</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-rose-500 border-dashed rounded-full" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stress P5 Boundary</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-800 rounded-full" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Probability Horizon</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
         <div className="col-span-1 glass-card p-10 flex flex-col items-center justify-center text-center">
            <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center mb-6 ${portfolio.riskScore > 80 ? 'border-emerald-500/30' : 'border-blue-500/30'}`}>
               <div className="text-center">
                  <p className="text-3xl font-light text-white">{portfolio.riskScore}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Score</p>
               </div>
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Portfolio Health</h4>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">OPTIMIZED</p>
         </div>

         <div className="col-span-3 glass-card p-10">
            <div className="flex justify-between items-center mb-10">
               <div className="flex items-center gap-3">
                  <PieIcon className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Credit Rating Exposure</h4>
               </div>
               <div className="flex gap-4">
                  {creditData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{d.name}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="h-40 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={creditData} layout="vertical">
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} width={40} />
                     <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                     />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {creditData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
         <div className="glass-card p-10">
            <div className="flex items-center gap-3 mb-10">
               <Briefcase className="w-5 h-5 text-purple-400" />
               <h4 className="text-sm font-bold text-white uppercase tracking-widest">Industry Distribution</h4>
            </div>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="glass-card p-10">
            <div className="flex items-center gap-3 mb-10">
               <Globe className="w-5 h-5 text-emerald-400" />
               <h4 className="text-sm font-bold text-white uppercase tracking-widest">Geographic Allocation</h4>
            </div>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={regionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="glass-card p-12 border-purple-500/20 bg-purple-500/[0.03] group hover:border-purple-500/40 transition-all">
         <div className="flex justify-between items-center">
            <div className="flex gap-8 items-center">
               <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-purple-400" />
               </div>
               <div>
                  <h4 className="text-xl font-semibold text-white tracking-tight">Cerebro Risk Surveillance</h4>
                  <p className="text-sm text-slate-400 mt-2 italic">Institutional heatmaps show exposure across 12 industry sectors.</p>
               </div>
            </div>
            <button className="flex items-center gap-3 px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-purple-900/40 transition-all">
               View Exposure Heatmaps <ArrowUpRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}
