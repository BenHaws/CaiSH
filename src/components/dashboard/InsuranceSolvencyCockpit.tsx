import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity, BarChart3, Clock, AlertTriangle, ArrowRight, TrendingUp, Anchor, Zap } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { CorporateEntity } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useSimulation } from '../../contexts/SimulationContext';
import { applySimulationShocks } from '../../../lib/quant/AlmEngine';

interface InsuranceSolvencyCockpitProps {
  entity: CorporateEntity;
}

export const InsuranceSolvencyCockpit: React.FC<InsuranceSolvencyCockpitProps> = ({ entity }) => {
  const [solvencyData, setSolvencyData] = useState<any>(null);
  const [almData, setAlmData] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { state: simState } = useSimulation();

  const simulatedMetrics = useMemo(() => {
    if (!solvencyData || !almData || !simState.isActive) return null;
    return applySimulationShocks(
      { solvencyRatio: solvencyData.solvencyRatio, durationGap: almData.durationGap },
      { rateShockBps: simState.interestRateShock, fxVol: simState.fxVolatility }
    );
  }, [solvencyData, almData, simState]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [solvency, alm, claimsLedger] = await Promise.all([
          treasuryService.getSolvencyMetrics(entity.id),
          treasuryService.getDurationMatching(entity.id),
          treasuryService.getBitemporalClaims(entity.id)
        ]);
        setSolvencyData(solvency);
        setAlmData(alm);
        setClaims(claimsLedger);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity.id]);

  const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#f43f5e'];

  if (loading || !solvencyData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Solvency Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 glass-card p-8 border-sky-500/30 bg-sky-500/5 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              Solvency Ratio (SCR)
            </h4>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-light tracking-tighter transition-colors ${simulatedMetrics ? 'text-slate-500 line-through text-2xl' : 'text-white'}`}>
                {(solvencyData.solvencyRatio * 100).toFixed(0)}%
              </span>
              {simulatedMetrics && (
                <div className="flex items-center gap-2">
                   <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                   <span className="text-4xl font-semibold text-orange-400 tracking-tighter">
                     {(simulatedMetrics.solvencyRatio * 100).toFixed(0)}%
                   </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${solvencyData.solvencyRatio * 50}%` }}
                 className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
               />
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2">Target: 150% (Regulatory Floor)</p>
          </div>
        </div>

        <div className="lg:col-span-3 glass-card p-8 grid grid-cols-3 gap-8">
           <div className="border-r border-white/5 pr-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 italic">MCR Gauge</h4>
              <p className="text-xl font-mono text-white mb-1">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(solvencyData.mcr)}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Minimum Capital Req.</p>
           </div>
           <div className="border-r border-white/5 pr-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 italic">VaR Confidence</h4>
              <p className="text-xl font-mono text-white mb-1">{(solvencyData.confidenceLevel * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Solvency II Standard</p>
           </div>
           <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 italic">Operational SCR</h4>
              <p className="text-xl font-mono text-white mb-1">
                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(solvencyData.riskSegments.find((s:any) => s.name === 'Operational')?.value)}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Non-Technical Risk</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Risk Composition */}
        <div className="glass-card p-10">
          <h3 className="text-lg font-light text-white mb-8 tracking-tight">Risk Weighted <span className="font-semibold">Composition</span></h3>
          <div className="h-64 flex gap-10 items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={solvencyData.riskSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {solvencyData.riskSegments.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4">
               {solvencyData.riskSegments.map((segment: any, idx: number) => (
                 <div key={segment.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{segment.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white">
                      {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(segment.value)}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* ALM Duration Matching */}
        <div className="glass-card p-10 bg-indigo-500/5 border-indigo-500/20">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-light text-white tracking-tight">ALM <span className="font-semibold">Duration Matching</span></h3>
            <div className={`px-4 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest ${almData.matched ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
               {almData.matched ? 'Immunized' : 'Duration Gap Detected'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-16 bg-white/5" />
             
             <div className="text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Asset Duration (Da)</p>
                <p className="text-3xl font-light text-sky-400 font-mono italic">{almData.assetsDuration}y</p>
             </div>
             <div className="text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Liability Duration (Dl)</p>
                <p className="text-3xl font-light text-indigo-400 font-mono italic">{almData.liabilitiesDuration}y</p>
             </div>
          </div>

          <div className="mt-10 p-6 bg-black/40 rounded-2xl border border-white/5 space-y-6">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration Gap</span>
                <div className="flex items-center gap-3">
                   <span className={`text-sm font-mono font-bold ${simulatedMetrics ? 'text-slate-600 line-through' : (Math.abs(almData.durationGap) < 1 ? 'text-emerald-400' : 'text-orange-400')}`}>
                      {almData.durationGap.toFixed(2)}y
                   </span>
                   {simulatedMetrics && (
                     <div className="flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className={`text-sm font-mono font-bold ${Math.abs(simulatedMetrics.durationGap) < 1 ? 'text-emerald-400' : 'text-orange-400'}`}>
                           {simulatedMetrics.durationGap.toFixed(2)}y
                        </span>
                     </div>
                   )}
                </div>
             </div>
             <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-3">
                   <Anchor className="w-4 h-4 text-indigo-400" />
                   <p className="text-[9px] text-slate-400 leading-tight uppercase font-bold tracking-widest">Immunization Strategy</p>
                 </div>
                 <button className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase underline tracking-widest">Rebalance Portfolio</button>
             </div>
          </div>
        </div>
      </div>

      {/* Bitemporal Claims Ledger */}
      <div className="glass-card overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-lg font-light text-white tracking-tight">Bitemporal <span className="font-semibold">Claims Ledger</span></h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Valid Time vs. Transaction Time (IFRS 17)</p>
              </div>
           </div>
           <div className="flex gap-2">
              <button className="px-5 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 transition-colors">Historical Audit</button>
              <button className="px-5 py-2 bg-sky-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-sky-900/20">Post Adjustment</button>
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-10 py-5 text-left">Claim ID</th>
                  <th className="px-10 py-5 text-right">Reserve Amount</th>
                  <th className="px-10 py-5 text-left">Status</th>
                  <th className="px-10 py-5 text-left">Valid From</th>
                  <th className="px-10 py-5 text-left">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                 {claims.map((claim, idx) => (
                   <tr key={`${claim.id}-${idx}`} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-5 text-sky-400">{claim.id}</td>
                      <td className="px-10 py-5 text-right text-white font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(claim.amount)}</td>
                      <td className="px-10 py-5">
                         <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold uppercase italic text-slate-400 border border-white/5">{claim.status}</span>
                      </td>
                      <td className="px-10 py-5 text-slate-400">{claim.validFrom}</td>
                      <td className="px-10 py-5 text-slate-500 italic">{claim.recordedAt}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
