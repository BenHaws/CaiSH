import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal, Cpu, Network, Activity, ShieldAlert, Zap } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { DevGlobalStats } from '../../types';

export default function DevGlobalAggregator() {
  const [stats, setStats] = useState<DevGlobalStats | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          treasuryService.getDevGlobalStats(),
          treasuryService.getDevAuditLogs()
        ]);
        setStats(statsData);
        setLogs(logsData);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("FORCE RLS LOCKDOWN: Mission Control Access Restricted. Verify 'BYPASSRLS' role.");
      } finally {
        setLoading(false);
      }
    };
    fetchDevData();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-red-500 font-mono italic animate-pulse tracking-[0.3em]">SECURE_HANDSHAKE_INITIATED...</div>;

  if (error) return (
    <div className="p-20 text-center glass-card border-red-500/30 bg-red-500/5">
       <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
       <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">Access Denied</h3>
       <p className="text-red-400 font-mono text-xs uppercase italic">{error}</p>
       <button 
          onClick={() => window.location.reload()}
          className="mt-10 px-8 py-3 border border-red-500/30 text-red-400 rounded-full text-[10px] font-bold hover:bg-red-500/10 transition-all"
       >
          Re-Authenticate Nexus Relay
       </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center animate-pulse">
               <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white tracking-widest uppercase italic">DEV_MISSION_CONTROL</h2>
               <p className="text-[10px] text-red-400 font-bold uppercase tracking-[0.3em] mt-1">System Override Active - RLS_BYPASS Enabled</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="text-right">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Global Health</p>
               <p className="text-2xl font-mono font-bold text-emerald-400">{stats?.systemHealth}%</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="glass-card p-6 bg-slate-900/60 border border-white/5">
           <Zap className="w-5 h-5 text-yellow-400 mb-4" />
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Group Liquidity</p>
           <p className="text-3xl font-bold text-white font-mono">${(stats?.totalLiquidity || 0 / 1e9).toFixed(1)}B</p>
        </div>
        <div className="glass-card p-6 bg-slate-900/60 border border-white/5">
           <Network className="w-5 h-5 text-blue-400 mb-4" />
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Active Webhooks</p>
           <p className="text-3xl font-bold text-white font-mono">{stats?.activeWebhooks}</p>
        </div>
        <div className="glass-card p-6 bg-slate-900/60 border border-white/5">
           <Cpu className="w-5 h-5 text-purple-400 mb-4" />
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Nexus Relays</p>
           <p className="text-3xl font-bold text-white font-mono">{stats?.totalNodes}</p>
        </div>
        <div className="glass-card p-6 bg-slate-900/60 border border-white/5">
           <Activity className="w-5 h-5 text-pink-400 mb-4" />
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">IP Avg Multiplier</p>
           <p className="text-3xl font-bold text-white font-mono">{stats?.avgIpMultiplier}x</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
         <div className="col-span-2 glass-card p-8 bg-slate-950/60 border border-white/5">
            <div className="flex items-center gap-3 mb-6">
               <Terminal className="w-5 h-5 text-red-500" />
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Real-time Override Audit Log</h3>
            </div>
            <div className="space-y-3">
               {logs.map((log, i) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 font-mono text-[10px]">
                     <div className="flex items-center gap-4">
                        <span className="text-slate-600">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className="text-red-400 font-bold">{log.action}</span>
                        <span className="text-slate-400">TARGET: {log.resource}</span>
                     </div>
                     <span className="text-slate-500 uppercase">USR: {log.user}</span>
                  </div>
               ))}
               <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] text-red-400 font-italic text-center animate-pulse">
                  SYSTEM_LISTENER_ACTIVE -- MONITORING ALL CROSS-TENANT EVENTS
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="glass-card p-6 bg-slate-900/40 border border-white/5">
               <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">System Overrides</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-300 uppercase tracking-tighter">Bypass RLS</span>
                     <div className="w-10 h-5 bg-red-500 rounded-full flex items-center px-1">
                        <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-300 uppercase tracking-tighter">Cross-Nexus Sync</span>
                     <div className="w-10 h-5 bg-slate-700 rounded-full flex items-center px-1 opacity-50">
                        <div className="w-3 h-3 bg-white rounded-full" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl shadow-xl shadow-red-900/20">
               <p className="text-[10px] text-red-200 font-bold uppercase tracking-widest mb-2">Security Warning</p>
               <h4 className="text-white font-bold mb-4 uppercase tracking-tighter">Emergency Purge Initiation</h4>
               <p className="text-xs text-red-100/70 leading-relaxed mb-6">
                  Initiating an Emergency Purge will isolate the current node and wipe all local ledger cache. Use only in event of physical security breach.
               </p>
               <button className="w-full py-3 bg-white text-red-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">
                  Inhibit Purge
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
