import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { FXExposure } from '../../types';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function FXRisk() {
  const [exposures, setExposures] = useState<FXExposure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await treasuryService.getFXExposures();
        setExposures(data);
        setErrorMessage('');
      } catch (error) {
        console.error(error);
        setErrorMessage('Unable to load FX exposure data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#60a5fa', '#8b5cf6', '#a855f7', '#d946ef'];

  const chartData = exposures.map(e => ({ name: e.currency, value: e.usdEquivalent }));
  const totalExposure = exposures.reduce((s, x) => s + x.usdEquivalent, 0);

  if (isLoading) return <div className="text-white animate-pulse">Loading FX Risk Data...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">FX <span className="font-semibold">Exposure</span></h2>
          <p className="text-slate-400">Total multi-currency risk and value-at-risk (VaR) for global nodes.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-4">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-200/80">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exposure List */}
        <div className="lg:col-span-2 space-y-6">
          {exposures.map((e, i) => (
            <motion.div 
              key={e.currency}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass p-6 flex items-center justify-between group hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                  <span className="text-xl font-bold text-white group-hover:text-blue-400 tracking-tight">{e.currency}</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white tracking-tight">{e.currency} Exposure</h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1.5 opacity-60">Status: {e.riskLevel.toUpperCase()} RISK</p>
                </div>
              </div>

              <div className="flex items-center gap-12 text-right">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Local Balance</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: e.currency }).format(e.balance)}
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="pr-4">
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-1">USD EQUIVALENT</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <p className="text-xl font-bold text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(e.usdEquivalent)}
                    </p>
                    <span className={`text-xs font-bold ${e.change24h >= 0 ? 'text-emerald-400' : 'text-purple-400'} flex items-center`}>
                      {e.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(e.change24h)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Distribution */}
        <div className="liquid-glass p-8 flex flex-col items-center">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-8 self-start">Portfolio Density</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4 w-full">
            {exposures.map((e, i) => (
              <div key={e.currency} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-400">{e.currency}</span>
                </div>
                <span className="text-white font-bold">{totalExposure > 0 ? ((e.usdEquivalent / totalExposure) * 100).toFixed(1) : '0.0'}%</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 w-full">
            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-[10px] text-blue-200/70 italic leading-relaxed">
                "AI Observation: High JPY exposure detected. Regional volatility trending above 1.2% threshold. Recommend hedging via spot contracts."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
