import React, { useEffect, useState } from 'react';
import { treasuryService } from '../../services/treasuryService';
import { FXExposure, PaymentItem, CorporateEntity } from '../../types';
import { TrendingUp, ShieldAlert, Globe2, Activity, Zap, PieChart, CircleDollarSign, Flame, Gauge } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, BarChart, Bar, XAxis, YAxis, ComposedChart, Line, CartesianGrid } from 'recharts';

type LiquidityPeriod = 'YTD' | 'CQ' | 'PQ' | 'NQ';

const buildQuarterSeries = (startCash: number, dailyDrift: number, projectionLift: number) =>
  Array.from({ length: 84 }, (_, index) => {
    const dayOfMonth = (index % 28) + 1;
    const seasonalWave = Math.sin(index / 8) * 0.45;
    const cash = startCash + index * dailyDrift + seasonalWave;
    return {
      label: `${dayOfMonth}`,
      cash: Number(cash.toFixed(2)),
      projection: Number((cash + projectionLift + index * 0.035).toFixed(2))
    };
  });

const liquiditySeries: Record<LiquidityPeriod, { label: string; cash: number; projection: number }[]> = {
  YTD: [
    { label: 'Jan', cash: 42.1, projection: 43.0 },
    { label: 'Feb', cash: 44.8, projection: 45.2 },
    { label: 'Mar', cash: 46.2, projection: 47.0 },
    { label: 'Apr', cash: 49.4, projection: 50.1 },
    { label: 'May', cash: 51.0, projection: 52.4 },
    { label: 'Jun', cash: 53.2, projection: 55.0 }
  ],
  CQ: buildQuarterSeries(48.6, 0.055, 0.45),
  PQ: buildQuarterSeries(41.8, 0.052, 0.65),
  NQ: buildQuarterSeries(53.2, 0.061, 1.1)
};

// Global Registry mapping keys to components
export const WidgetRegistry: Record<string, React.FC<{ entityContext?: CorporateEntity }>> = {
  LIQUIDITY_OVERVIEW: () => {
    const [period, setPeriod] = useState<LiquidityPeriod>('CQ');
    const data = liquiditySeries[period];

    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Total Cash Position</p>
              <p className="text-lg font-light text-white">${data[data.length - 1].cash.toFixed(1)}M</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[9px] uppercase tracking-widest text-blue-400 font-black">Forecast Projection</p>
              <p className="text-lg font-light text-white">${data[data.length - 1].projection.toFixed(1)}M</p>
            </div>
          </div>
          <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
            {(['YTD', 'CQ', 'PQ', 'NQ'] as LiquidityPeriod[]).map(option => (
              <button
                key={option}
                onClick={(event) => {
                  event.stopPropagation();
                  setPeriod(option);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                  period === option ? 'bg-blue-500/80 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 18 }}>
              <defs>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.16)' }}
                interval={period === 'YTD' ? 0 : 4}
                angle={0}
                textAnchor="middle"
                height={34}
                label={{
                  value: 'Forecast Day',
                  position: 'insideBottom',
                  offset: -4,
                  fill: '#64748b',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.16)' }}
                tickFormatter={(value) => `$${Number(value).toFixed(0)}M`}
                label={{
                  value: 'Cash / Forecast',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: '#64748b',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number, name: string) => [`$${Number(value).toFixed(1)}M`, name === 'cash' ? 'Total Cash Position' : 'Total Cash Projection']}
              />
              <Bar dataKey="cash" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={period === 'YTD' ? 28 : 4} />
              <Line type="monotone" dataKey="projection" stroke="#5eead4" strokeWidth={3} dot={{ r: 3, fill: '#5eead4' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },

  WORKING_CAPITAL_PULSE: () => {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
           <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Trapped Liquidity</p>
              <h4 className="text-2xl font-light text-white">$42.8M</h4>
           </div>
           <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Optimized</span>
              <p className="text-xs font-bold text-white mt-1">+12.4%</p>
           </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
           <div className="h-full w-[65%] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <p className="text-[10px] text-slate-600 italic">"ZBA protocols active across 4 nodes."</p>
      </div>
    );
  },

  AVAILABLE_TO_DISCOUNT: () => {
    return (
      <div className="flex items-center gap-6 p-4 liquid-glass bg-emerald-500/5 border-emerald-500/20">
         <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <CircleDollarSign className="w-6 h-6 text-emerald-400" />
         </div>
         <div>
            <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest mb-1">Available to Discount</p>
            <h4 className="text-xl font-bold text-white">$12.4M</h4>
         </div>
      </div>
    );
  },

  FX_EXPOSURE_MINI: () => {
    const [fx, setFx] = useState<FXExposure[]>([]);
    useEffect(() => {
      treasuryService.getFXExposures().then(setFx);
    }, []);

    return (
      <div className="space-y-4">
        {fx.slice(0, 3).map(f => (
          <div key={f.currency} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white uppercase">{f.currency}</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(f.usdEquivalent)}
            </span>
          </div>
        ))}
      </div>
    );
  },

  PENDING_PAYMENTS: () => {
    const [payments, setPayments] = useState<PaymentItem[]>([]);
    useEffect(() => {
      treasuryService.getPayments().then(p => setPayments(p.slice(0, 3)));
    }, []);

    return (
      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
             </div>
             <div className="flex-1">
               <p className="text-xs font-bold text-white truncate">{p.beneficiary}</p>
               <p className="text-[10px] text-slate-500 uppercase font-mono">{p.type}</p>
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-white">${p.amount.toLocaleString()}</p>
             </div>
          </div>
        ))}
      </div>
    );
  },

  SWIFT_GPI_TRACKER: () => {
    return (
      <div className="space-y-6 py-2">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Zap className="w-4 h-4 text-amber-400" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Latency</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">120ms</span>
         </div>
         <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 3 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`} />
            ))}
         </div>
         <p className="text-[10px] text-slate-500 leading-relaxed italic">
            "Node #SGD-01 confirmed at intermediary. Settlement predicted in 14m."
         </p>
      </div>
    );
  },

  CEREBRO_QUICK: () => {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start">
         <Activity className="w-5 h-5 text-blue-400 mt-1" />
         <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">AI Recommendation</p>
            <p className="text-xs text-slate-200 leading-relaxed">
              Drift threshold in JPY operational node exceeded. Execute <strong>ZBA-Hedge Protocol</strong> immediately.
            </p>
         </div>
      </div>
    );
  },

  OIL_GAS_HEDGE_EFFECTIVENESS: () => {
    const [hedges, setHedges] = useState<any[]>([]);

    useEffect(() => {
      treasuryService.getEnergyHedges().then(setHedges).catch(() => setHedges([]));
    }, []);

    const avgEffectiveness = hedges.length
      ? hedges.reduce((sum, hedge) => sum + (hedge.effectivenessScore || 91), 0) / hedges.length
      : 93.4;

    return (
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-orange-300 font-black uppercase tracking-widest mb-1">Hedge Effectiveness</p>
            <h4 className="text-3xl font-light text-white">{avgEffectiveness.toFixed(1)}%</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
        </div>
        <div className="space-y-3">
          {(hedges.length ? hedges : [
            { id: 'HDG-001', commodity: 'Crude Oil', type: 'Swap', volume: 50000, status: 'active' },
            { id: 'HDG-002', commodity: 'Natural Gas', type: 'Call Option', volume: 100000, status: 'pending' }
          ]).slice(0, 3).map((hedge) => (
            <div key={hedge.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-xs font-bold text-white">{hedge.commodity}</p>
                <p className="text-[9px] uppercase tracking-widest text-slate-500">{hedge.type} / {hedge.status}</p>
              </div>
              <span className="text-xs font-mono text-orange-300">{Number(hedge.volume || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },

  OIL_GAS_BASIS_RISK: () => {
    const [curve, setCurve] = useState<any[]>([]);
    const [marketShape, setMarketShape] = useState('Contango');

    useEffect(() => {
      treasuryService.getEnergyMarketState()
        .then(state => {
          setCurve(state.forwardCurve || []);
          setMarketShape(state.marketShape);
        })
        .catch(() => {
          setCurve([
            { period: 'May 26', price: 78.45 },
            { period: 'Jun 26', price: 79.25 },
            { period: 'Jul 26', price: 80.05 },
            { period: 'Aug 26', price: 80.85 }
          ]);
        });
    }, []);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-cyan-300 font-black uppercase tracking-widest mb-1">Basis Risk Curve</p>
            <h4 className="text-2xl font-light text-white">{marketShape}</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Gauge className="w-6 h-6 text-cyan-300" />
          </div>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={curve}>
              <XAxis dataKey="period" hide />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.92)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'Forward']}
              />
              <Bar dataKey="price" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-500 italic">Henry Hub / Waha / SoCal basis surveillance active.</p>
      </div>
    );
  }
};

// Widget Metadata for the selection panel
export const AvailableWidgets = [
  { key: 'LIQUIDITY_OVERVIEW', title: 'Global Liquidity Trend', icon: TrendingUp, description: '30-day projected cash movements.' },
  { key: 'WORKING_CAPITAL_PULSE', title: 'Working Capital Pulse', icon: PieChart, description: 'Trapped liquidity surveillance.' },
  { key: 'AVAILABLE_TO_DISCOUNT', title: 'Available to Discount', icon: CircleDollarSign, description: 'Instant payout liquidity pool.' },
  { key: 'FX_EXPOSURE_MINI', title: 'Top FX Risks', icon: Globe2, description: 'Concentration risk analysis by currency.' },
  { key: 'PENDING_PAYMENTS', title: 'Strategic Payments', icon: ShieldAlert, description: 'High-value items in integrity queue.' },
  { key: 'SWIFT_GPI_TRACKER', title: 'SWIFT gpi Tracking', icon: Zap, description: 'Real-time settlement latency monitor.' },
  { key: 'CEREBRO_QUICK', title: 'Neural Insight', icon: Activity, description: 'AI-driven tactical advice.' },
  { key: 'OIL_GAS_HEDGE_EFFECTIVENESS', title: 'Hedge Effectiveness', icon: Flame, description: 'Oil & Gas hedge coverage and effectiveness pulse.' },
  { key: 'OIL_GAS_BASIS_RISK', title: 'Basis Risk Curve', icon: Gauge, description: 'Forward curve and nodal basis risk surveillance.' },
];
