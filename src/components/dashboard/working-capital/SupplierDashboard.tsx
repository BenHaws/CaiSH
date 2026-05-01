import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  CircleDollarSign,
  History,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const historyData = [
  { day: 'Apr 1', cost: 1.25, line: 3.5 },
  { day: 'Apr 5', cost: 1.15, line: 3.5 },
  { day: 'Apr 10', cost: 1.30, line: 3.5 },
  { day: 'Apr 15', cost: 1.10, line: 3.5 },
  { day: 'Apr 20', cost: 1.05, line: 3.5 },
  { day: 'Apr 23', cost: 0.98, line: 3.5 },
];

export default function SupplierDashboard() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Supplier <span className="font-semibold">Portal</span></h2>
          <p className="text-slate-400">Maximize your cash flow acceleration with dynamic discounting.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Funding Window Open</span>
           </div>
           <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all">
             Request Instant Payout
           </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-1 glass-card p-8 bg-emerald-500/5 border-emerald-500/20 relative overflow-hidden">
           <div className="relative z-10">
              <Zap className="w-6 h-6 text-emerald-400 mb-6" />
              <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest mb-2">Available to Discount</p>
              <h3 className="text-3xl font-light text-white">$12,450,000</h3>
              <p className="text-[10px] text-slate-500 mt-4 italic font-bold">Approved & Ready to Liquidate</p>
           </div>
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <CircleDollarSign className="w-32 h-32 text-emerald-400" />
           </div>
        </div>

        <div className="col-span-1 glass-card p-8">
           <Clock className="w-6 h-6 text-blue-400 mb-6" />
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Avg Days Paid Early</p>
           <h3 className="text-3xl font-light text-white">22.4 Days</h3>
           <p className="text-[10px] text-blue-400 mt-4 italic font-bold">加速 Cash Conversion</p>
        </div>

        <div className="col-span-1 glass-card p-8">
           <TrendingDown className="w-6 h-6 text-purple-400 mb-6" />
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Effective APR saved</p>
           <h3 className="text-3xl font-light text-white">2.8%</h3>
           <p className="text-[10px] text-purple-400 mt-4 italic font-bold">Vs Standard Credit Line</p>
        </div>

        <div className="col-span-1 glass-card p-8">
           <CheckCircle2 className="w-6 h-6 text-slate-400 mb-6" />
           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">Approved Invoices</p>
           <h3 className="text-3xl font-light text-white">18</h3>
           <p className="text-[10px] text-slate-500 mt-4 italic font-bold">Ready for Instant Pay</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 glass-card p-10 flex flex-col">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                 <History className="w-5 h-5 text-blue-400" />
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">Discounting cost vs Credit Line</h4>
              </div>
              <div className="flex gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Discount %</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Credit Line</span>
                 </div>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                       contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCost)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="line" 
                      stroke="#334155" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="transparent" 
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="col-span-1 glass-card p-10 bg-blue-500/5 border-blue-500/20">
           <h4 className="text-xl font-semibold text-white tracking-tight mb-8">AI Liquidity <span className="font-bold">Advice</span></h4>
           <div className="space-y-8">
              <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-4">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-amber-400 transition-colors" />
                 </div>
                 <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Discount Now</p>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    "Market depth for NVIDIA Corp is at a 6-month high. Current APR of 4.1% is 15% lower than your average. Recommended discount: $4.2M."
                 </p>
              </div>

              <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-4">
                    <Clock className="w-5 h-5 text-blue-400" />
                 </div>
                 <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">Wait 48h</p>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    "Two major institutional bidders (BlackRock, JP Morgan) are entering the market on Monday. Yields may compress further. 3.9% floor possible."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
