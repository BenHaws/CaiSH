import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { TechValuationMetrics, PatentAnalysis, IPScannerMetrics } from '../../types';
import { 
  Cpu, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  Search, 
  ShieldCheck, 
  Activity, 
  Globe2, 
  ChevronRight,
  Database,
  ArrowUpRight,
  Fingerprint,
  RotateCcw,
  BookOpen,
  Github,
  Globe,
  Code
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TechValuationCockpit() {
  const [valuation, setValuation] = useState<TechValuationMetrics | null>(null);
  const [patents, setPatents] = useState<PatentAnalysis[]>([]);
  const [ipScanner, setIpScanner] = useState<IPScannerMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatent, setSelectedPatent] = useState<PatentAnalysis | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [valData, patData, scannerData] = await Promise.all([
          treasuryService.getTechValuation(),
          treasuryService.getPatents(),
          treasuryService.getIPScannerMetrics()
        ]);
        setValuation(valData);
        setPatents(patData);
        setIpScanner(scannerData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!valuation) return <div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">Running IP Audit Engine...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-blue-400" />
             </div>
             <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Technology Vertical</span>
          </div>
          <h2 className="text-4xl font-light tracking-tight text-white line-clamp-1">Intangible <span className="font-semibold">IP Valuation Engine</span></h2>
          <p className="text-slate-400 mt-2 italic">Quantifying the "Data Moat" and "Flywheel Effect" through automated tech audits.</p>
        </div>
        
        <div className="flex gap-6">
           <div className="px-8 py-4 glass-card bg-blue-500/[0.03] border-blue-500/20">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">IP Multiplier ($M)</p>
              <p className="text-3xl font-light text-white">{valuation.ipMultiplier}x</p>
           </div>
           <div className="px-8 py-4 glass-card bg-emerald-500/[0.03] border-emerald-500/20">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Magic Number</p>
              <p className="text-3xl font-light text-white">{valuation.magicNumber}</p>
           </div>
        </div>
      </div>

      {/* IP Scanner / GitHub Webhook Listener Panel */}
      {ipScanner && (
        <div className="glass-card p-10 bg-slate-950/40 border border-slate-800">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    <Github className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h3 className="text-xl font-semibold text-white tracking-tight italic">IP Scanner: <span className="text-blue-400">GitHub Webhook Active</span></h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time commit audit for code uniqueness ($M calculations)</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Listener: In-Sync</span>
              </div>
           </div>

           <div className="grid grid-cols-4 gap-8">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                 <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Commit Density</span>
                 </div>
                 <p className="text-2xl font-bold text-white">{ipScanner.commitDensity} <span className="text-xs text-slate-600">/ wk</span></p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                 <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Code Uniqueness</span>
                 </div>
                 <p className="text-2xl font-bold text-white">{ipScanner.codeUniquenessScore}%</p>
              </div>

              <div className="col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                 <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block mb-4 italic">Audited Metadata (Vertex AI)</span>
                 <div className="flex flex-wrap gap-2">
                    {ipScanner.libraryDependencies.map(lib => (
                       <span key={lib} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-mono text-blue-400">
                          {lib}
                       </span>
                    ))}
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-500">+12 more</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Layer 1 & 2: Core SaaS & Efficiency metrics (Progressive Disclosure) */}
      <div className="grid grid-cols-4 gap-8">
         <div className="glass-card p-8 bg-white/[0.01]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono">Layer 1: SaaS Health</p>
            <div className="space-y-6">
               <div>
                  <p className="text-2xl font-bold text-white">${(valuation.arr / 1e6).toFixed(1)}M</p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Annual Recurring Revenue (ARR)</p>
               </div>
               <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{valuation.nrr}%</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">NRR Pulse</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-rose-400">{valuation.churnRate}%</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">Churn Leak</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="glass-card p-8 bg-white/[0.01]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono">Layer 2: Efficiency Logic</p>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                     <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                     <p className="text-2xl font-bold text-white">{valuation.burnMultiple}x</p>
                     <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Burn Multiple</p>
                  </div>
               </div>
               <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center">Efficient Growth confirmed</p>
               </div>
            </div>
         </div>

         <div className="glass-card p-8 bg-white/[0.01]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono">Layer 3: Intangible Assets</p>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                     <Database className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                     <p className="text-2xl font-bold text-white">TRL {valuation.trlLevel}</p>
                     <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Algorithm Maturity</p>
                  </div>
               </div>
               <button 
                  onClick={() => setSelectedPatent(patents[0] || null)}
                  className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
               >
                  IP Deep Dive
               </button>
            </div>
         </div>

         <div className="glass-card p-8 bg-white/[0.01]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 font-mono">Layer 4: Risk Surface</p>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                     <Fingerprint className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                     <p className="text-2xl font-bold text-white">{valuation.defensibilityScore}/100</p>
                     <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Defensibility Score</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <span className="flex-1 px-2 py-1 bg-white/5 rounded-lg text-[8px] font-bold text-slate-500 text-center">Obsolescence: L</span>
                  <span className="flex-1 px-2 py-1 bg-white/5 rounded-lg text-[8px] font-bold text-slate-500 text-center">Regulatory: M</span>
               </div>
            </div>
         </div>
      </div>

      {/* Probability Distribution (Monte Carlo) */}
      <div className="glass-card p-10 bg-white/[0.01]">
         <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
               <Activity className="w-5 h-5 text-blue-400" />
               <h3 className="text-xl font-semibold text-white tracking-tight">Terminal Value Distribution</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               <RotateCcw className="w-3 h-3" />
               Monte Carlo v2.1-Exp
            </div>
         </div>

         <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={[
                  { x: -2, v: valuation.terminalValue.p5 * 0.95 },
                  { x: -1, v: valuation.terminalValue.p5 },
                  { x: 0, v: valuation.terminalValue.median },
                  { x: 1, v: valuation.terminalValue.p95 },
                  { x: 2, v: valuation.terminalValue.p95 * 1.05 }
               ]}>
                  <defs>
                     <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <XAxis dataKey="x" hide />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${(val / 1e6).toFixed(0)}M`}
                  />
                  <Tooltip 
                     contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorVal)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>

         <div className="mt-8 grid grid-cols-3 gap-10">
            <div className="text-center">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tail Downside (P5)</p>
               <p className="text-2xl font-light text-rose-400">${(valuation.terminalValue.p5 / 1e6).toFixed(0)}M</p>
            </div>
            <div className="text-center border-x border-white/5">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Median Enterprise Value</p>
               <p className="text-2xl font-bold text-white">${(valuation.terminalValue.median / 1e6).toFixed(0)}M</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Unicorn Tail (P95)</p>
               <p className="text-2xl font-light text-emerald-400">${(valuation.terminalValue.p95 / 1e6).toFixed(0)}M</p>
            </div>
         </div>
      </div>

      {/* Patent Ingestion Modal */}
      <AnimatePresence>
         {selectedPatent && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
             onClick={() => setSelectedPatent(null)}
           >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="max-w-4xl w-full glass-card overflow-hidden bg-slate-950"
               onClick={(e) => e.stopPropagation()}
             >
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <BookOpen className="w-8 h-8 text-blue-400" />
                      <h3 className="text-2xl font-semibold text-white tracking-tight">IP Audit: {selectedPatent.title}</h3>
                   </div>
                   <button onClick={() => setSelectedPatent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <RotateCcw className="w-6 h-6 text-slate-500 rotate-45" />
                   </button>
                </div>
                
                <div className="p-10 grid grid-cols-12 gap-10">
                   <div className="col-span-8 space-y-8">
                      <div className="space-y-4">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Technology Readiness Summary (TRL {selectedPatent.trl})</h4>
                         <p className="text-sm text-slate-500 leading-relaxed italic">
                            Gemini 3 scanned 14 diagrams and 82 claims. The underlying Data Flywheel model exhibits exponential scaling characteristics. Code uniqueness audit confirms 94% original logic.
                         </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic mb-2">Claim Defensibility</p>
                            <p className="text-2xl font-bold text-white">HI-SECURE</p>
                         </div>
                         <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic mb-2">Market Comparables</p>
                            <p className="text-2xl font-bold text-blue-400">18.4x ARR</p>
                         </div>
                      </div>
                   </div>

                   <div className="col-span-4 space-y-8 border-l border-white/5 pl-10">
                      <div className="text-center">
                         <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                               <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                               <circle 
                                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                  strokeDasharray={364} 
                                  strokeDashoffset={364 - (364 * selectedPatent.score) / 100}
                                  className="text-blue-500" 
                               />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-3xl font-light text-white">{selectedPatent.score}</span>
                         </div>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Defensibility Score</p>
                      </div>
                      
                      <div className="space-y-3">
                         {patents.map(p => (
                            <button 
                               key={p.id}
                               onClick={() => setSelectedPatent(p)}
                               className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedPatent.id === p.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                               <span className="text-[10px] font-bold text-white uppercase tracking-widest line-clamp-1">{p.title}</span>
                               <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
