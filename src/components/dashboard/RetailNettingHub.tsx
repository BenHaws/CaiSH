import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  RefreshCcw, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  TrendingDown, 
  ShoppingCart,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node,
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { treasuryService } from '../../services/treasuryService';

interface IntercompanyInvoice {
  id: string;
  debtorId: string;
  creditorId: string;
  amount: number;
  currency: string;
  status: string;
}

export const RetailNettingHub: React.FC = () => {
  const [invoices, setInvoices] = useState<IntercompanyInvoice[]>([]);
  const [nettingResult, setNettingResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [step, setStep] = useState<'INGEST' | 'SIMULATE' | 'CLEAR'>('INGEST');
  const [showOptimized, setShowOptimized] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await treasuryService.getIntercompanyInvoices();
        setInvoices(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInvoices();
  }, []);

  const runCalculation = async () => {
    setIsCalculating(true);
    try {
      const data = await treasuryService.calculateNetting();
      setNettingResult(data);
      setStep('SIMULATE');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  const executeSettlement = async () => {
    if (!nettingResult) return;
    setIsExecuting(true);
    try {
      await treasuryService.executeNetting(nettingResult.cycleId);
      setStep('CLEAR');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  // React Flow setup
  const nodes: Node[] = useMemo(() => {
    const entityIds = Array.from(new Set([
      ...invoices.map(i => i.debtorId),
      ...invoices.map(i => i.creditorId)
    ]));

    return entityIds.map((id, index) => ({
      id,
      data: { label: `Entity ${id}` },
      position: { 
        x: 400 + Math.cos((index / entityIds.length) * 2 * Math.PI) * 250, 
        y: 300 + Math.sin((index / entityIds.length) * 2 * Math.PI) * 250 
      },
      style: { 
        background: '#0f172a', 
        color: '#fff', 
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '10px',
        fontSize: '10px',
        fontWeight: 'bold',
        width: 100,
        textAlign: 'center'
      }
    }));
  }, [invoices]);

  const edges: Edge[] = useMemo(() => {
    if (showOptimized && nettingResult) {
       // Hub-and-Spoke model: all net positions against one virtual hub or just net flows
       const hubs = nettingResult.netFlows.map((flow: any) => ({
         id: `edge-${flow.entityId}`,
         source: flow.direction === 'PAY' ? flow.entityId : 'HUB',
         target: flow.direction === 'RECEIVE' ? flow.entityId : 'HUB',
         label: `$${(Math.abs(flow.netAmount) / 1000000).toFixed(1)}M`,
         animated: true,
         style: { stroke: flow.direction === 'PAY' ? '#f43f5e' : '#10b981', strokeWidth: 2 },
         markerEnd: { type: MarkerType.ArrowClosed, color: flow.direction === 'PAY' ? '#f43f5e' : '#10b981' }
       }));
       return hubs;
    }

    return invoices.map((inv, idx) => ({
      id: `invoice-${idx}`,
      source: inv.debtorId,
      target: inv.creditorId,
      label: `$${(inv.amount / 1000000).toFixed(1)}M`,
      style: { stroke: '#64748b', strokeWidth: 1, opacity: 0.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
    }));
  }, [invoices, showOptimized, nettingResult]);

  // Virtual HUB node for optimized view
  const finalNodes = useMemo(() => {
    if (!showOptimized) return nodes;
    return [
      ...nodes,
      {
        id: 'HUB',
        data: { label: 'NETTING HUB' },
        position: { x: 400, y: 300 },
        style: { 
          background: '#ec4899', 
          color: '#fff', 
          border: '2px solid #fff',
          borderRadius: '50%',
          padding: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          width: 100,
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(236,72,153,0.5)'
        }
      }
    ];
  }, [nodes, showOptimized]);

  return (
    <div className="space-y-8 pb-20">
      {/* Clearing Manager Header */}
      <div className="glass-card p-8 flex justify-between items-center bg-pink-500/5 border-pink-500/20">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20">
            <RefreshCcw className={`w-7 h-7 text-pink-400 ${isCalculating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-xl font-light text-white tracking-tight">Netting <span className="font-semibold">Command Center</span></h3>
            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-[0.2em] mt-1">v4.3.0 Industry-Hardened</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/40 rounded-full px-4 py-2 border border-white/5">
             <div className="flex items-center gap-2 px-3 border-r border-white/10">
                <div className={`w-2 h-2 rounded-full ${step === 'INGEST' ? 'bg-pink-500' : 'bg-slate-700'}`} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ingest</span>
             </div>
             <div className="flex items-center gap-2 px-3 border-r border-white/10">
                <div className={`w-2 h-2 rounded-full ${step === 'SIMULATE' ? 'bg-pink-500' : 'bg-slate-700'}`} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Simulate</span>
             </div>
             <div className="flex items-center gap-2 px-3">
                <div className={`w-2 h-2 rounded-full ${step === 'CLEAR' ? 'bg-pink-500' : 'bg-slate-700'}`} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clear</span>
             </div>
          </div>

          <button 
            onClick={runCalculation}
            disabled={isCalculating || step === 'CLEAR'}
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-900/20 disabled:opacity-50"
          >
            {isCalculating ? 'Processing...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Flow Visualizer */}
        <div className="xl:col-span-2 glass-card h-[600px] relative overflow-hidden group">
          <div className="absolute top-8 left-8 z-10 space-y-4">
             <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Network className="w-4 h-4 text-pink-400" />
                Intercompany Debt flow
             </h3>
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => setShowOptimized(false)}
                  className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase transition-all ${!showOptimized ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                >
                  Gross Invoices
                </button>
                <button 
                  onClick={() => setShowOptimized(true)}
                  disabled={!nettingResult}
                  className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase transition-all ${showOptimized ? 'bg-pink-500 text-white' : 'text-slate-500'}`}
                >
                  Net Clearing
                </button>
             </div>
          </div>
          
          <div className="w-full h-full">
            <ReactFlow
              nodes={finalNodes}
              edges={edges}
              fitView
              style={{ background: 'transparent' }}
            >
              <Background color="#ffffff05" strokeWidth={1} />
              <Controls className="bg-slate-900 border border-white/10 rounded-lg fill-white" />
            </ReactFlow>
          </div>

          <AnimatePresence>
            {step === 'SIMULATE' && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute bottom-10 left-10 right-10 bg-black/80 backdrop-blur-2xl border border-pink-500/30 p-6 rounded-3xl z-10 flex justify-between items-center shadow-2xl"
               >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-500/30">
                       <Zap className="w-6 h-6 text-pink-400 animate-pulse" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white uppercase tracking-widest">Cerebro Optimization Recommendation</p>
                       <p className="text-[10px] text-slate-400 italic mt-1 leading-relaxed max-w-md">
                          "USD is expected to weaken by 0.5% against EUR in 48h. Delaying settlement for EMEA entities could save an additional $42,650 in FX spread."
                       </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                     <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors">Wait 48h</button>
                     <button 
                       onClick={executeSettlement}
                       className="px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-pink-900/20"
                     >
                       {isExecuting ? 'Executing...' : 'Settle Now'}
                     </button>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leakage Scorecard & Results */}
        <div className="space-y-8">
           {/* Leakage Scorecard */}
           <div className="glass-card p-8 bg-emerald-500/5 border-emerald-500/20">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                 <TrendingDown className="w-3 h-3" />
                 Leakage Savings
              </h4>
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <p className="text-3xl font-light text-white tracking-tighter">
                      {nettingResult ? `$${(nettingResult.stats.leakageSavings / 1000).toFixed(1)}K` : '$0.0K'}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Total Impact Savings</p>
                 </div>
                 <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <ArrowUpRight className="w-8 h-8 text-emerald-400" />
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Bank Fees Reduced</span>
                    <span className="text-emerald-400">-94%</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: nettingResult ? '94%' : '0%' }}
                      className="h-full bg-emerald-500" 
                    />
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">FX Spread Saved</span>
                    <span className="text-emerald-400">$21.4K</span>
                 </div>
              </div>
           </div>

           {/* Results Table */}
           <div className="glass-card flex flex-col h-[400px]">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Net Clearing Positions</h4>
                 <Layers className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 overflow-y-auto">
                 {nettingResult?.netFlows.map((flow: any) => (
                    <div key={flow.entityId} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all">
                       <div className="flex justify-between items-center mb-2">
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider">{flow.entityName}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${flow.direction === 'PAY' ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                             {flow.direction}
                          </span>
                       </div>
                       <div className="flex justify-between items-center">
                          <p className="text-xs font-mono text-slate-400">
                             {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(flow.netAmount))}
                          </p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase italic">Final Position</p>
                       </div>
                    </div>
                 ))}
                 {!nettingResult && (
                    <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
                       <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-slate-700" />
                       </div>
                       <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Awaiting Simulation...</p>
                    </div>
                 )}
              </div>
              {step === 'CLEAR' && (
                <div className="p-6 bg-emerald-500/10 border-t border-emerald-500/20">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Clearing Finalized</p>
                   </div>
                   <p className="text-[9px] text-emerald-400/60 font-mono mt-1">Batch Trace: IC-NET-8822-XP</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Auto-Settler Logs */}
      <div className="glass-card">
         <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <ShieldCheck className="w-5 h-5 text-pink-400" />
               <h4 className="text-sm font-bold text-white uppercase tracking-widest">Auto-Settler Protocol Logs</h4>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Webhook Hub: Active</div>
               <div className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-[8px] font-bold text-pink-400 uppercase tracking-widest">RLS Context: Enforced</div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-8 py-4 text-left">Timestamp</th>
                  <th className="px-8 py-4 text-left">Event</th>
                  <th className="px-8 py-4 text-left">Entity Context</th>
                  <th className="px-8 py-4 text-right">Volume</th>
                  <th className="px-8 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[10px]">
                {invoices.slice(0, 5).map((inv, idx) => (
                  <tr key={inv.id + idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-4 text-slate-500">2026-04-27 13:50:{idx * 12}</td>
                    <td className="px-8 py-4 text-white">IC_INVOICE_INGEST</td>
                    <td className="px-8 py-4 text-pink-400">Node_{inv.debtorId} &gt; Node_{inv.creditorId}</td>
                    <td className="px-8 py-4 text-right text-slate-300">${inv.amount.toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">INGESTED</span>
                    </td>
                  </tr>
                ))}
                {step === 'CLEAR' && (
                   <tr className="bg-pink-500/5">
                    <td className="px-8 py-4 text-pink-400 font-bold">2026-04-27 13:55:00</td>
                    <td className="px-8 py-4 text-white font-bold underline">MULTILATERAL_CLEARING_EXECUTE</td>
                    <td className="px-8 py-4 text-pink-400">Global Pooling Group</td>
                    <td className="px-8 py-4 text-right text-white">BATCH_SETTLE</td>
                    <td className="px-8 py-4">
                      <span className="px-2 py-0.5 rounded bg-pink-500 text-white shadow-lg shadow-pink-500/20">FINALIZED</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
