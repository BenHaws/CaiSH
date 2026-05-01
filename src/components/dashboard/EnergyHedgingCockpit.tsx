import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position, 
  Node, 
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  BarChart3, 
  Settings2, 
  Globe, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Layers,
  Activity,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { EnergyHedge, BasisHub, CvaSimulationResult } from '../../types';
import { calculateNPKCVaR } from '../../lib/quant';

// --- Custom Components & Styles ---

const GLASS_CARD = "liquid-glass hover:bg-white/[0.05] transition-all duration-500 ease-out";
const ACCENT_BLUE = "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]";
const ACCENT_GREEN = "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]";
const ACCENT_PURPLE = "text-purple-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]";

const CustomHedgeNode = ({ data }: any) => (
  <div className="liquid-glass p-5 min-w-[200px] hover:border-blue-500/50 transition-colors">
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-blue-500 ring-4 ring-blue-500/20" />
    <div className="flex justify-between items-start mb-3">
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 py-0.5 bg-white/5 rounded-full">{data.type}</span>
      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${data.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
        {data.status}
      </span>
    </div>
    <p className="text-sm font-semibold text-white mb-1 tracking-tight">{data.commodity}</p>
    <div className="flex justify-between items-end mt-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 leading-none">Notional</p>
        <p className="text-xs font-mono text-white mt-1.5">{data.volume} {data.unit || 'MW'}</p>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 leading-none">Efficiency</p>
        <p className={`text-xs font-mono mt-1.5 ${data.score >= 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {(data.score * 100).toFixed(1)}%
        </p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-blue-500 ring-4 ring-blue-500/20" />
  </div>
);

const nodeTypes = {
  hedge: CustomHedgeNode,
};

// --- Main Component ---

export default function EnergyHedgingCockpit() {
  const [hedges, setHedges] = useState<EnergyHedge[]>([]);
  const [hubs, setHubs] = useState<BasisHub[]>([]);
  const [selectedView, setSelectedView] = useState<'ladder' | 'exposure' | 'credit'>('ladder');
  const [isLoading, setIsLoading] = useState(true);
  const [scenarioImpact, setScenarioImpact] = useState(0);
  const [cvaResult, setCvaResult] = useState<CvaSimulationResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hedgeData, hubData] = await Promise.all([
          treasuryService.getEnergyHedges(),
          treasuryService.getBasisHubs()
        ]);
        setHedges(hedgeData);
        setHubs(hubData);
        
        if (hedgeData.length > 0) {
           const simulation = await treasuryService.runCvaSimulation(hedgeData[0].id);
           setCvaResult(simulation);
        }
      } catch (err) {
        console.error("Failed to fetch energy data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const reactFlowNodes: Node[] = React.useMemo(() => hedges.map((h, i) => ({
    id: h.id,
    type: 'hedge',
    position: { x: 100 + (i % 3) * 250, y: 50 + Math.floor(i / 3) * 200 },
    data: { 
      type: h.type, 
      status: h.status, 
      commodity: h.commodity, 
      volume: h.volume, 
      score: h.effectivenessScore || 0.85 
    }
  })), [hedges]);

  const reactFlowEdges: Edge[] = React.useMemo(() => {
    if (hedges.length === 0) return [];
    return hedges.slice(1).map((h, i) => ({
      id: `e-${hedges[0].id}-${h.id}`,
      source: hedges[0].id,
      target: h.id,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    }));
  }, [hedges]);

  if (isLoading) return <div className="text-white animate-pulse text-center p-20 font-mono tracking-widest uppercase">Initializing Energy Nexus...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header - Unified Data Fabric Title */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-[0.2em] border border-blue-500/20 rounded">Commodity Command Center</span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest italic opacity-60">Nexus v4.0 Quantitative Core</span>
          </div>
          <h2 className="text-5xl font-light tracking-tighter text-white mb-2">Energy <span className="font-semibold italic">Hedging Cockpit</span></h2>
          <p className="text-slate-400 max-w-2xl font-light text-sm italic border-l border-white/10 pl-6">
            Real-time management of Basis Risk, Volumetric Uncertainty, and IFRS 9 Compliance within the Unified Data Fabric.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl">
          {[
            { id: 'ladder', label: 'Hedge Ladder', icon: Layers },
            { id: 'exposure', label: 'Optimize Exposure', icon: Globe },
            { id: 'credit', label: 'Credit Heatmap', icon: Shield }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedView === view.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <view.icon className="w-3.5 h-3.5" />
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={GLASS_CARD}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Compliant</span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Portfolio Hedge Ratio</p>
            <h3 className="text-3xl font-light text-white tracking-tighter">0.82 <span className="text-sm font-bold text-slate-600">/ 1.0</span></h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
              <Activity className="w-3 h-3 text-emerald-500" />
              IFRS 9 Effective (R²: 0.94)
            </div>
          </div>
        </div>

        <div className={GLASS_CARD}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">BCVA Adjustment</p>
            <h3 className="text-3xl font-light text-white tracking-tighter">
              {cvaResult ? `$${(cvaResult.bcva / 1000).toFixed(1)}k` : '--'}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
              <ArrowDownRight className="w-3 h-3 text-blue-400" />
              EPE: $1.2M Profile
            </div>
          </div>
        </div>

        <div className={GLASS_CARD}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Tail Risk (CVaR)</p>
            <h3 className="text-3xl font-light text-white tracking-tighter">$4.2M</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic font-mono">
              NPK Framework @ 99.5%
            </div>
          </div>
        </div>

        <div className={GLASS_CARD}>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Basis Variation</p>
            <h3 className="text-3xl font-light text-amber-400 tracking-tighter">+14.2%</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
              Henry Hub vs. SoCal Gate
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[700px]">
        {/* Main Workspace (v4.0 React Flow Ladder or Exposure Globe) */}
        <div className="xl:col-span-9 h-full flex flex-col gap-8">
          <div className={`${GLASS_CARD} flex-1 relative bg-black/40`}>
            {selectedView === 'ladder' && (
              <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                nodeTypes={nodeTypes}
                onConnect={() => {}}
                fitView
                className="bg-transparent"
              >
                <Background color="#333" gap={32} size={1} />
                <Controls className="bg-white/5 border-white/10 fill-white" />
                <div className="absolute bottom-6 right-6 p-4 glass-card border-white/5 bg-black/80 backdrop-blur-3xl">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Auto-Layout Engine</p>
                   <p className="text-xs text-blue-400 font-mono mt-1 italic">"Chronological Tranche Sequencing Active"</p>
                </div>
              </ReactFlow>
            )}

            {selectedView === 'exposure' && (
              <div className="p-10 h-full flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h4 className="text-2xl font-light text-white tracking-tight">Unified <span className="font-semibold">Basis Map</span></h4>
                    <p className="text-slate-500 text-xs mt-1">Cross-entity commodity ledger visualization.</p>
                  </div>
                  <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Rebalance Tranches
                  </button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Regional Exposure Concentration</p>
                      {hubs.map(hub => (
                        <div key={hub.id} className="p-5 glass-card border-white/5 hover:border-blue-500/30 transition-all group">
                           <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-3">
                                 <Globe className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                 <span className="text-sm font-bold text-white">{hub.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">{hub.benchmarkRef}</span>
                           </div>
                           <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full w-[65%]" />
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="glass-card border-blue-500/20 bg-blue-500/5 p-8 relative flex flex-col justify-center text-center">
                      <div className="absolute top-6 left-6 text-[10px] font-black text-blue-400/50 uppercase tracking-[0.3em]">AI Signals</div>
                      <Cpu className="w-16 h-16 text-blue-400/20 mx-auto mb-6" />
                      <h5 className="text-xl font-light text-blue-400 tracking-tight">Vertex AI Recommendation</h5>
                      <p className="text-slate-400 text-sm mt-4 italic leading-relaxed">
                        "Basis widening at Waha Hub detected (+12%). Suggest rotating 20k BBL WTI tranches into Permian-local exposure to mitigate locational leakage."
                      </p>
                      <button className="mt-10 px-8 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-500 shadow-2xl shadow-blue-900/40 transition-all">
                        Execute Optimized Swap
                      </button>
                   </div>
                </div>
              </div>
            )}
            
            {selectedView === 'credit' && (
              <div className="p-10 h-full flex flex-col">
                 <h4 className="text-2xl font-light text-white tracking-tight mb-10">Counterparty <span className="font-semibold italic">Credit Heatmap</span></h4>
                 <div className="flex-1 grid grid-cols-4 md:grid-cols-6 gap-4">
                    {Array.from({ length: 24 }).map((_, i) => {
                       const intensity = Math.random();
                       const color = intensity > 0.8 ? 'bg-red-500/40 border-red-500/50' : 
                                    intensity > 0.5 ? 'bg-amber-500/20 border-amber-500/30' : 
                                    'bg-emerald-500/20 border-emerald-500/30';
                       return (
                         <motion.div 
                           key={i}
                           whileHover={{ scale: 1.05 }}
                           className={`aspect-square ${color} border rounded-2xl flex flex-col items-center justify-center cursor-help transition-all shadow-lg`}
                         >
                            <span className="text-[10px] font-black text-white/50 mb-1">CP-{100+i}</span>
                            <span className="text-[8px] font-mono text-white/30 uppercase">{(intensity*10).toFixed(1)}k BCVA</span>
                         </motion.div>
                       );
                    })}
                 </div>
                 <div className="mt-10 flex gap-10 items-center border-t border-white/10 pt-10">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 bg-red-500/50 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Critical: 2</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 bg-amber-500/30 rounded-full" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Warning: 6</span>
                    </div>
                    <div className="flex items-center gap-3 ml-auto italic">
                       <span className="text-[10px] text-slate-600 tracking-tighter">Powered by Default Swap Probability Curves (CDX.IG.40)</span>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Scenario Engine & Task Stream */}
        <aside className="xl:col-span-3 space-y-8 flex flex-col h-full overflow-y-auto pr-2">
          {/* Scenario Engine Task Card */}
          <div className={`${GLASS_CARD} border-blue-500/20 bg-blue-500/5`}>
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Scenario Engine</p>
                <Database className="w-4 h-4 text-blue-400 opactiy-50" />
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Regional Basis Shock</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full accent-blue-500 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
                      onChange={(e) => setScenarioImpact(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between mt-2 font-mono text-[10px] text-slate-600">
                      <span>Baseline</span>
                      <span className="text-white">+{scenarioImpact}%</span>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Res Convergence Level</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full accent-purple-500 bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
                      defaultValue="30"
                    />
                    <div className="flex justify-between mt-2 font-mono text-[10px] text-slate-600">
                      <span>Stochastic</span>
                      <span className="text-white">30% Volume</span>
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4">
                 <div className="flex justify-between items-center opacity-70">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Unrealized P&L Impact</span>
                    <span className={`text-xs font-mono ${scenarioImpact > 10 ? 'text-red-400' : 'text-slate-400'}`}>-$1.42M</span>
                 </div>
                 <button className="w-full py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
                   Run MC Simulation 
                   <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          </div>

          {/* Task Feed (Instruction v4.0 Flow) */}
          <div className="flex-1 space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4">Autonomous Tasks</p>
             
             {[
               { icon: Settings2, title: 'Rebalance Tranche 772-A', desc: 'Volume deviation in APAC node detected.', time: '2m ago' },
               { icon: Shield, title: 'Update CVA Margins', desc: 'New CDS spread for HSBC North.', time: '14m ago' },
               { icon: Activity, title: 'IFRS 9 Doc Review', desc: 'Designation required for Q3 gas swaps.', time: '1h ago' }
             ].map((task, i) => (
               <div key={i} className="p-5 glass-card border-white/5 hover:bg-white/[0.02] flex gap-4 items-start cursor-pointer group transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-blue-500/30">
                     <task.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                     <h6 className="text-xs font-bold text-white truncate">{task.title}</h6>
                     <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{task.desc}</p>
                     <p className="text-[9px] text-slate-600 font-mono mt-2">{task.time}</p>
                  </div>
               </div>
             ))}
          </div>

          {/* Bottom Trust Status */}
          <div className="p-6 bg-black/40 border border-white/5 rounded-3xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Cpu className="w-5 h-5 text-emerald-400" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Link</p>
                <p className="text-[11px] text-white font-bold opacity-80">99.8% Sync Confidence</p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
