import React from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Database, 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  CreditCard,
  ExternalLink,
  RefreshCw,
  MoreVertical
} from 'lucide-react';

interface Props {
  onAddConnection?: () => void;
}

export default function ConnectivityManager({ onAddConnection }: Props) {
  const connections = [
    { 
      id: 'SWIFT', 
      name: 'SWIFT gpi Gateway', 
      desc: 'Institutional messaging and tracking', 
      status: 'active', 
      latency: '24ms',
      type: 'Direct',
      icon: Globe,
      color: 'blue'
    },
    { 
      id: 'SAP', 
      name: 'SAP S/4HANA', 
      desc: 'ERP General Ledger synchronization', 
      status: 'active', 
      latency: '110ms',
      type: 'Middleware',
      icon: Database,
      color: 'emerald'
    },
    { 
      id: 'CEREBRO', 
      name: 'Cerebro AI Engine', 
      desc: 'Neural liquidity forecasting context', 
      status: 'active', 
      latency: '5ms',
      type: 'Internal',
      icon: Cpu,
      color: 'purple'
    },
    { 
      id: 'VISA', 
      name: 'Visa B2B Connect', 
      desc: 'Cross-border settlement rails', 
      status: 'warning', 
      latency: '450ms',
      type: 'API',
      icon: CreditCard,
      color: 'amber'
    },
    { 
      id: 'BLOOMBERG', 
      name: 'Bloomberg Terminal', 
      desc: 'Market data & forward curve feed', 
      status: 'active', 
      latency: '15ms',
      type: 'Feed',
      icon: RefreshCw,
      color: 'blue'
    },
    { 
      id: 'REUTERS', 
      name: 'Refinitiv Eikon', 
      desc: 'Secondary pricing oracle', 
      status: 'active', 
      latency: '18ms',
      type: 'Feed',
      icon: RefreshCw,
      color: 'blue'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Wifi className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Global Status</h4>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Operational</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
             <h3 className="text-4xl font-light text-white">99.98%</h3>
             <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Uptime</span>
          </div>
        </div>

        <div className="glass-card p-8 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Avg Latency</h4>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1">High Performance</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
             <h3 className="text-4xl font-light text-white">42ms</h3>
             <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Across Nodes</span>
          </div>
        </div>

        <div className="glass-card p-8 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Active Links</h4>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Verified TLS 1.3</p>
            </div>
          </div>
          <div className="flex items-end gap-3">
             <h3 className="text-4xl font-light text-white">12</h3>
             <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Certified Gateways</span>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400/70">External Integration Hub</h4>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-mono">Real-time Heartbeat Monitoring</p>
          </div>
          <div className="flex gap-4">
            <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all">
              Manage API Keys
            </button>
            <button 
              onClick={onAddConnection}
              className="px-5 py-2 bg-blue-600 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all"
            >
              Add Connection
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {connections.map((conn, i) => (
            <div key={conn.id} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
              <div className="flex items-center gap-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                  conn.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  conn.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  conn.color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                  'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <conn.icon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h5 className="text-lg font-semibold text-white tracking-tight">{conn.name}</h5>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                      conn.type === 'Direct' ? 'bg-blue-500/20 text-blue-400' :
                      conn.type === 'Internal' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {conn.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{conn.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Latency</p>
                  <p className="text-xs font-mono text-slate-300 mt-1">{conn.latency}</p>
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Signal</p>
                  <div className="flex items-center justify-end gap-2 mt-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${conn.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${conn.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {conn.status === 'active' ? 'Online' : 'Latency Alert'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-600 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
