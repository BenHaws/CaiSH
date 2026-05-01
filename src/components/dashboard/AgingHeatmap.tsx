import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Clock, AlertTriangle } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';

export default function AgingHeatmap() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAging = async () => {
      try {
        const agingData = await treasuryService.getInventoryAging();
        setData(agingData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAging();
  }, []);

  const getLuminanceColor = (aging: number) => {
    if (aging <= 30) return 'bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    if (aging <= 60) return 'bg-emerald-500/40';
    if (aging <= 90) return 'bg-amber-500/40';
    return 'bg-slate-700/30 grayscale opacity-40'; // Trapped capital
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-500">Initializing Nexus Heatmap...</div>;

  return (
    <div className="glass-card p-8 bg-slate-950/40 border border-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white tracking-tight">SKU Aging <span className="text-emerald-400">Heatmap</span></h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Luminance Hierarchy: Freshness vs. Borrowing Eligibility</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Eligible</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-700" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Trapped</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2">
        {data.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`aspect-square rounded-sm ${getLuminanceColor(item.aging)} group relative cursor-help transition-all hover:scale-110 hover:z-10`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
               <p className="text-white font-bold">{item.id}</p>
               <p className="text-slate-400">Aging: {item.aging} days</p>
               <p className="text-emerald-400 font-mono">${item.value.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
         <div className="flex gap-8">
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Eligible Value</p>
               <p className="text-xl font-bold text-white">$4.2M</p>
            </div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Trapped Capital (90d+)</p>
               <p className="text-xl font-bold text-slate-500">$340k</p>
            </div>
         </div>
         <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">RLS Secured View</span>
         </div>
      </div>
    </div>
  );
}
