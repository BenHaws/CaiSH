import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { InventoryItem, IBLResult } from '../../types';
import AgingHeatmap from './AgingHeatmap';
import { 
  Factory, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  Database, 
  RotateCcw, 
  ArrowUpRight, 
  Clock, 
  Zap, 
  LayoutGrid,
  FileText,
  Workflow
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function ManufacturingCockpit() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [iblResult, setIblResult] = useState<IBLResult | null>(null);
  const [advanceRate, setAdvanceRate] = useState(0.85);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await treasuryService.getInventory();
      setInventory(data);
      const res = await treasuryService.calculateIBL(data, advanceRate);
      setIblResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setIsLoading(true);
    try {
      const res = await treasuryService.calculateIBL(inventory, advanceRate);
      setIblResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && (inventory?.length || 0) === 0) {
    return <div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">Syncing Warehouse Logs...</div>;
  }

  const categoryColors = {
    RAW: '#6366f1', // Indigo
    WIP: '#f59e0b', // Amber
    FINISHED: '#10b981' // Emerald
  };

  const inventorySummary = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.quantity * item.unitCost);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(inventorySummary).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Factory className="w-5 h-5 text-indigo-400" />
             </div>
             <span className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]">Manufacturing Vertical</span>
          </div>
          <h2 className="text-4xl font-light tracking-tight text-white line-clamp-1">Inventory <span className="font-semibold">Liquidity Hub</span></h2>
          <p className="text-slate-400 mt-2 italic">Unlocking working capital through Asset-Backed Lending (IBL) and WMS integration.</p>
        </div>
        
        <div className="flex gap-6">
           <div className="px-8 py-4 glass-card bg-indigo-500/[0.03] border-indigo-500/20 text-center">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Borrowing Base (BB)</p>
              <p className="text-3xl font-bold text-white">${iblResult ? (iblResult.borrowingLimit / 1e6).toFixed(2) : '0.00'}M</p>
           </div>
           <div className="px-8 py-4 glass-card bg-emerald-500/[0.03] border-emerald-500/20 text-center">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Net Orderly Liquidation Value</p>
              <p className="text-3xl font-light text-white">$12.4M</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* Borrowing Base Logic Explorer */}
         <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="glass-card p-10 bg-white/[0.01]">
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                     <Database className="w-5 h-5 text-indigo-400" />
                     <div>
                        <h3 className="text-xl font-semibold text-white tracking-tight">Eligibility Engine</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time WMS SKU Analysis</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Advance Rate</span>
                      <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={advanceRate} 
                        onChange={(e) => setAdvanceRate(parseFloat(e.target.value))}
                        className="w-24 accent-indigo-500"
                      />
                      <span className="text-xs font-mono text-white">{(advanceRate * 100).toFixed(0)}%</span>
                    </div>
                    <button 
                      onClick={handleRecalculate}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-indigo-400"
                    >
                      <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6 mb-10">
                  {Object.entries(categoryColors).map(([cat, color]) => (
                    <div key={cat} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cat}</p>
                       <p className="text-2xl font-bold text-white mt-1">${(inventorySummary[cat] / 1e6 || 0).toFixed(1)}M</p>
                       <div className="h-1 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${60 + (cat === 'FINISHED' ? 25 : cat === 'WIP' ? -30 : 0)}%`, backgroundColor: color }} />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" debounce={1}>
                     <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                           dataKey="name" 
                           stroke="#475569" 
                           fontSize={10} 
                           tickLine={false} 
                           axisLine={false}
                           dy={10}
                        />
                        <YAxis 
                           stroke="#475569" 
                           fontSize={10} 
                           tickLine={false} 
                           axisLine={false}
                           tickFormatter={(val) => `$${(val / 1e6).toFixed(1)}M`}
                        />
                        <Tooltip 
                           contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={categoryColors[entry.name as keyof typeof categoryColors]} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>

               <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <AlertCircle className="w-5 h-5 text-indigo-400" />
                     <p className="text-xs text-slate-400 italic">
                        "Eligibility logic applied: Excluded <span className="text-white font-bold">$340k</span> in stale finished goods ({'>'}90 days aging). Asset quality remains <span className="text-emerald-400 font-bold uppercase underline">Strong</span>."
                     </p>
                  </div>
                  <button className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                     Audit Eligibility
                  </button>
               </div>
            </div>

            <AgingHeatmap />

            <div className="glass-card p-10 bg-white/[0.01]">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                     <Package className="w-5 h-5 text-indigo-400" />
                     <h3 className="text-xl font-semibold text-white tracking-tight">SKU Catalog Analysis</h3>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-white/5">
                           <th className="pb-4">SKU / Item</th>
                           <th className="pb-4">Category</th>
                           <th className="pb-4">Aging</th>
                           <th className="pb-4">Value</th>
                           <th className="pb-4">Eligibility</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {inventory.map(item => (
                           <tr key={item.sku} className="group hover:bg-white/[0.02]">
                              <td className="py-4">
                                 <p className="text-sm font-bold text-white tracking-tight">{item.name}</p>
                                 <p className="text-[10px] font-mono text-slate-600">{item.sku}</p>
                              </td>
                              <td className="py-4">
                                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${item.category === 'RAW' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : item.category === 'WIP' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                    {item.category}
                                 </span>
                              </td>
                              <td className="py-4">
                                 <div className="flex items-center gap-2">
                                    <Clock className={`w-3 h-3 ${item.agingDays > 90 ? 'text-rose-400' : 'text-slate-500'}`} />
                                    <span className={`text-[10px] font-bold ${item.agingDays > 90 ? 'text-rose-400' : 'text-slate-400'}`}>{item.agingDays}d</span>
                                 </div>
                              </td>
                              <td className="py-4">
                                 <p className="text-[10px] font-mono text-white">${(item.quantity * item.unitCost / 1000).toFixed(0)}k</p>
                                 <p className="text-[8px] text-slate-500 font-bold">{item.quantity} units</p>
                              </td>
                              <td className="py-4">
                                 {item.agingDays <= 90 ? (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                       <ShieldCheck className="w-4 h-4" />
                                       <span className="text-[10px] font-bold uppercase italic">Eligible</span>
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-2 text-rose-500">
                                       <AlertCircle className="w-4 h-4" />
                                       <span className="text-[10px] font-bold uppercase italic opacity-50">Excluded</span>
                                    </div>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Sidebar Actions */}
         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="glass-card p-10 bg-white/[0.01]">
               <h3 className="text-xl font-semibold text-white tracking-tight mb-8">Drawdown Manager</h3>
               <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                     <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-2">Available to Draw</p>
                     <p className="text-4xl font-bold text-white">$1,450,000</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                     <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-3">
                        <TrendingUp className="w-4 h-4" />
                        Execute Drawdown
                     </button>
                     <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                        View Credit Agreement
                     </button>
                  </div>
               </div>

               <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                     <Zap className="w-4 h-4 text-amber-400" />
                     <h4 className="text-[10px] text-white font-bold uppercase tracking-widest">Asset-Link Health</h4>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">WMS Connection</span>
                        <span className="text-emerald-400 font-bold">STABLE</span>
                     </div>
                     <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">Last Sync</span>
                        <span className="text-slate-300">4m ago</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="glass-card p-10 bg-slate-950/50">
               <div className="flex items-center gap-3 mb-8">
                  <Workflow className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">Automation Modules</h4>
               </div>
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                     <FileText className="w-5 h-5 text-slate-500" />
                     <div>
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">WMS Field Mapper</p>
                        <p className="text-[8px] text-slate-500 italic mt-0.5">Asset-Link L4 Active</p>
                     </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 opacity-50">
                     <ShieldCheck className="w-5 h-5 text-slate-500" />
                     <div>
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">AI Obsolescence Guard</p>
                        <p className="text-[8px] text-slate-500 italic mt-0.5">Vertex AI scanning...</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
