import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { FXExposure, PaymentItem, JournalEntry, BankAccount } from '../../types';
import { BrainCircuit, Sparkles, TrendingUp, ShieldAlert, Zap, BarChart, ChevronRight, Info, Fingerprint, X } from 'lucide-react';
import StrategySettlement from './StrategySettlement';

interface Insight {
  category: 'Strategic' | 'Tactical' | 'Risk';
  title: string;
  description: string;
  impactScore: number;
  icon: string;
}

export default function Cerebro() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [report, setReport] = useState<string>('');
  const [selectedStrategy, setSelectedStrategy] = useState<Insight | null>(null);
  const [showBoardReport, setShowBoardReport] = useState(false);
  const [aiMode, setAiMode] = useState<'live' | 'fallback'>('fallback');

  useEffect(() => {
    // ... rest of use effect
    const analyzeIntelligence = async () => {
      setIsAnalyzing(true);
      try {
        const [accounts, fx, payments, ledger] = await Promise.all([
          treasuryService.getAccounts(),
          treasuryService.getFXExposures(),
          treasuryService.getPayments(),
          treasuryService.getLedgerEntries()
        ]);

        const context = {
          totalLiquidity: (accounts || []).reduce((s, a) => s + a.balance, 0),
          fxRisks: (fx || []).map(f => `${f.currency}: ${f.usdEquivalent} USD (Risk: ${f.riskLevel})`),
          pendingPayments: (payments || []).length,
          paymentRiskScores: (payments || []).map(p => p.riskScore),
          ledgerActivity: (ledger || []).length
        };

        const prompt = `
          As the Chief Treasury Strategist AI for CaiSH, analyze the following treasury context and provide 3 high-impact strategic insights in JSON format.
          Also provide a brief Executive Summary narrative.

          Context:
          - Total Liquidity: ${context.totalLiquidity} USD equivalent
          - FX Exposures: ${context.fxRisks.join(', ')}
          - Payments in Queue: ${context.pendingPayments}
          - Payment Risk Profiles: ${context.paymentRiskScores.join(', ')}

          Format the insights as an array of objects: { category: string, title: string, description: string, impactScore: number, icon: string }.
          Available icons: "trending", "shield", "zap", "chart".
        `;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
          throw new Error('Gemini API key not configured; using deterministic demo intelligence.');
        }

        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are Cerebro, the CaiSH AI Engine. You speak in a professional, technical, and slightly futuristic tone. You prioritize capital efficiency and risk mitigation."
          }
        });

        const result = JSON.parse(response.text || '{}');
        setInsights(Array.isArray(result) ? result : result.insights || []);
        setReport(result.summary || "Nexus synchronization complete. Intelligence layers active.");
        setAiMode('live');
      } catch (error) {
        console.error("AI Analysis failed:", error);
        setAiMode('fallback');
        setInsights([
          { category: 'Risk', title: 'Liquidity Concentration', description: '92% of liquidity is held in USD Operational relays. Recommend diversifying to EMEA buffers.', impactScore: 88, icon: 'shield' },
          { category: 'Strategic', title: 'ZBA Optimization', description: 'Automated sweep patterns detected $4.2M in stagnant capital. Efficiency gain projected at 12bps.', impactScore: 74, icon: 'trending' },
          { category: 'Tactical', title: 'Payment Batching', description: 'Identify 14 duplicative intercompany transfers. Consolidating could save $1,200 in transaction fees.', impactScore: 45, icon: 'zap' }
        ]);
        setReport("Cerebro intelligence layer running in decentralized fallback mode. Connect Vertex AI for full predictive analysis.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeIntelligence();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending': return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'shield': return <ShieldAlert className="w-6 h-6 text-purple-400" />;
      case 'zap': return <Zap className="w-6 h-6 text-blue-400" />;
      default: return <BarChart className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-12">
      <AnimatePresence>
        {selectedStrategy && (
          <StrategySettlement 
            strategy={selectedStrategy} 
            onClose={() => setSelectedStrategy(null)}
            onSettled={() => {
              console.log("Nexus reconciled.");
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Cerebro <span className="font-semibold">Intelligence</span></h2>
          <p className="text-slate-400">Deep neural analysis of the Nexus Topology and global liquidity streams.</p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowBoardReport(true)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
          >
            <BarChart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Generate Board Report</span>
          </button>
          <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <Fingerprint className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
              {aiMode === 'live' ? 'Vertex AI Enabled' : 'Demo Intelligence Mode'}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBoardReport && (
          <BoardReportModal onClose={() => setShowBoardReport(false)} report={report} insights={insights} />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
           <div className="liquid-glass p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className={`absolute inset-0 bg-blue-500/5 transition-opacity duration-1000 ${isAnalyzing ? 'opacity-100' : 'opacity-0'}`} />
              <motion.div 
                animate={isAnalyzing ? { rotate: 360, scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-white/20 mb-8 z-10"
              >
                <BrainCircuit className="w-12 h-12 text-white" />
              </motion.div>
              <h4 className="text-xl font-semibold text-white mb-3 z-10 tracking-tight">Neural Sync Status</h4>
              <p className="text-sm text-slate-500 mb-8 max-w-[200px] z-10">{isAnalyzing ? 'Analyzing global balance deviations...' : 'Strategic layers synchronized.'}</p>
              
              <div className="w-full space-y-4 z-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={isAnalyzing ? { x: ['-100%', '100%'] } : { width: '100%' }}
                      transition={{ duration: 1.5 + (i * 0.2), repeat: Infinity, ease: "easeInOut" }}
                      className="h-full w-1/3 bg-blue-500/50" 
                    />
                  </div>
                ))}
              </div>
           </div>

           <div className="liquid-glass p-8 bg-blue-500/5 border-blue-500/20">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-5">Executive Summary</h5>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                 {isAnalyzing ? "Processing..." : `"${report}"`}
              </p>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="popLayout">
            {insights.map((insight, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="liquid-glass p-8 flex gap-8 items-start hover:bg-white/[0.05] transition-all group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-500/10 transition-all shrink-0">
                  {getIcon(insight.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">{insight.category} Insight</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500">IMPACT SCORE</span>
                      <span className={`text-xs font-mono font-bold ${insight.impactScore > 80 ? 'text-purple-400' : 'text-emerald-400'}`}>
                        {insight.impactScore}/100
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2 tracking-tight">{insight.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{insight.description}</p>
                  
                  <div className="mt-6 flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedStrategy(insight)}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Execute Strategy <ChevronRight className="w-3 h-3" />
                    </button>
                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                    <button className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center gap-4 p-8 liquid-glass border-emerald-500/10 bg-emerald-500/5">
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
             </div>
             <div>
               <p className="text-xs text-emerald-200/70 font-semibold tracking-tight uppercase">Strategic Buffer Advisory</p>
               <p className="text-sm text-slate-300 mt-1">Nexus relay #NA-OPS (JPM) has a 12.5% overshoot on expected drift. Efficiency gain achieved.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardReportModal({ onClose, report, insights }: { onClose: () => void, report: string, insights: Insight[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh]"
      >
        {/* Left Panel: Cover & Narrative */}
        <div className="md:w-1/3 bg-black/40 p-12 flex flex-col justify-between border-r border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-12">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Fingerprint className="w-6 h-6 text-white" />
               </div>
               <span className="text-xl font-bold text-white tracking-tighter">NEXUS <span className="font-light opacity-50">CORE</span></span>
            </div>
            
            <h2 className="text-4xl font-light text-white leading-tight mb-8">
              Board <br />
              Intelligence <br />
              <span className="font-semibold text-blue-400">Briefing</span>
            </h2>

            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Executive Sentiment</p>
                <p className="text-sm text-slate-300 leading-relaxed italic line-clamp-4">
                  {report || "Synchronizing global liquidity vectors..."}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Generated At</p>
             <p className="text-sm font-mono text-white/50">{new Date().toISOString()}</p>
          </div>
        </div>

        {/* Right Panel: Insights & Action Items */}
        <div className="flex-1 p-12 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest border-b-2 border-blue-500 pb-2">Strategic Findings</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-6 bg-slate-800/50 border border-white/5 rounded-2xl flex gap-6 group hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                   {getIconForBoard(insight.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                       insight.category === 'Risk' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                     }`}>
                       {insight.category}
                     </span>
                     <span className="text-[10px] font-mono text-slate-500">Node: VERTEX-AI-{idx + 1}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">{insight.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Impact</span>
                   <span className="text-2xl font-mono font-black text-blue-500">{insight.impactScore}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-blue-600 rounded-[28px] text-white flex justify-between items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10">
               <h4 className="text-xl font-bold uppercase tracking-tighter mb-1">Nexus Settlement Ready</h4>
               <p className="text-sm opacity-80 max-w-sm font-medium italic">Authorize all proposed optimizations synchronously via CaiSH Settlement Engine.</p>
            </div>
            <button className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform shadow-xl">
               Authorize Batch
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getIconForBoard(iconName: string) {
  switch (iconName) {
    case 'trending': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    case 'shield': return <ShieldAlert className="w-5 h-5 text-purple-400" />;
    case 'zap': return <Zap className="w-5 h-5 text-blue-400" />;
    default: return <BarChart className="w-5 h-5 text-slate-400" />;
  }
}
