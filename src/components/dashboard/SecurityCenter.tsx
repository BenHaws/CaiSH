import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { SecurityAudit, ComplianceScore } from '../../types';
import { ShieldCheck, ShieldAlert, Lock, Fingerprint, Activity, Clock, FileCheck, Info, ChevronRight, Search, Vault, Users, Settings, Wifi } from 'lucide-react';
import AdminConsole from './AdminConsole';
import ConnectivityManager from './ConnectivityManager';

interface Props {
  triggerWizard?: () => void;
}

export default function SecurityCenter({ triggerWizard }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'admin' | 'connectivity'>('overview');
  const [audits, setAudits] = useState<SecurityAudit[]>([]);
  const [compliance, setCompliance] = useState<ComplianceScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditData, complianceData] = await Promise.all([
          treasuryService.getSecurityAudits(),
          treasuryService.getComplianceScores()
        ]);
        setAudits(auditData);
        setCompliance(complianceData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'high': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (isLoading) return <div className="text-white animate-pulse text-center p-20">Verifying Identity Nodes...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Vault & <span className="font-semibold">Security</span></h2>
          <p className="text-slate-400">Institutional-grade identity isolation and multi-tenant boundary surveillance.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
            <Fingerprint className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Identity: Ben@cwgs.wtf</span>
          </div>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-10 border-b border-white/5 pb-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'overview' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Vault className="w-4 h-4" />
          Security Overview
          {activeTab === 'overview' && (
            <motion.div layoutId="sectab-active" className="absolute -bottom-6 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('connectivity')}
          className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'connectivity' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Wifi className="w-4 h-4" />
          Connectivity
          {activeTab === 'connectivity' && (
            <motion.div layoutId="sectab-active" className="absolute -bottom-6 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'admin' ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Settings className="w-4 h-4" />
          Admin Console
          {activeTab === 'admin' && (
            <motion.div layoutId="sectab-active" className="absolute -bottom-6 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Compliance Scores */}
              <div className="lg:col-span-1 space-y-6">
                 {compliance.map((item, i) => (
                   <motion.div 
                     key={item.category}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="glass-card p-6 group hover:border-white/20 transition-all"
                   >
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{item.category}</p>
                        <FileCheck className={`w-4 h-4 ${item.status === 'compliant' ? 'text-emerald-400' : 'text-blue-400'}`} />
                      </div>
                      <div className="flex items-end gap-3 mb-4">
                        <h3 className="text-3xl font-light text-white">{item.score}%</h3>
                        <span className="text-[10px] font-bold text-slate-400 mb-1">HEALTH</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} className={`h-full ${item.status === 'compliant' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-4 uppercase tracking-widest font-mono">Last Audit: {item.lastAudit}</p>
                   </motion.div>
                 ))}
              </div>

              {/* Security Audit Log */}
              <div className="lg:col-span-3 glass-card flex flex-col">
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                   <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400/70">Real-time Authorization Feed</h4>
                   <div className="flex items-center gap-4">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Boundary Guard Active</span>
                   </div>
                </div>
                <div className="flex-1 divide-y divide-white/5">
                  {audits.map((audit, i) => (
                    <motion.div 
                      key={audit.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                          {audit.status === 'flagged' ? <ShieldAlert className="w-5 h-5 text-purple-400" /> : <Lock className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{audit.event}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-slate-500 font-mono italic">Node: {audit.node}</span>
                            <span className="text-slate-700">•</span>
                            <span className="text-[10px] text-slate-500 font-mono italic">ID: {audit.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Actor</p>
                          <p className="text-xs font-semibold text-slate-300 mt-1">{audit.actor}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${getSeverityStyle(audit.severity)}`}>
                          {audit.severity}
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">System Status</p>
                          <p className={`text-xs font-semibold mt-1 ${audit.status === 'verified' ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {audit.status === 'verified' ? 'PASS' : audit.status.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )) || <div className="p-10 text-center text-slate-500 italic">No authorization events detected.</div>}
                </div>
              </div>
            </div>

            {/* Security Infrastructure Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-10 bg-blue-500/5 border-blue-500/20 group">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white tracking-tight">RLS Integrity Protocol</h4>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">Row-Level Security Active</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
                  "CaiSH utilizes PostgreSQL native RLS. Every database call is wrapped in a session context derived from your OIDC token. 
                  Cross-tenant leakage is mathematically prevented at the storage layer."
                </p>
                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Enforcement Level: ABSOLUTE</span>
                  </div>
                  <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">
                    Read Policy Docs
                  </button>
                </div>
              </div>

              <div className="glass-card p-10 bg-purple-500/5 border-purple-500/20">
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                     <Lock className="w-8 h-8 text-purple-400" />
                   </div>
                   <div>
                     <h4 className="text-xl font-semibold text-white tracking-tight">Webhook HMAC Gateway</h4>
                     <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.2em] mt-1">Institutional Signature Hub</p>
                   </div>
                </div>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Ingestion Endpoints</span>
                      <span className="text-emerald-400">STATUS: PROTECTED</span>
                   </div>
                   <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 overflow-x-auto">
                      POST /api/ingest/swift-gpi <br/>
                      Header: X-Kyr-Signature (HMAC-SHA256)
                   </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <ShieldAlert className="w-4 h-4 text-purple-400" />
                   <p className="text-[10px] text-slate-400 italic leading-relaxed">
                      "Automatic rejection of unverified payloads. Idempotency layer (24h) active for SWIFT UETR strings."
                   </p>
                </div>
              </div>

              <div className="glass-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-white transform group-hover:rotate-12 transition-transform duration-700">
                  <ShieldCheck className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                       <Clock className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white tracking-tight">Audit Archive</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-10">
                     Automated compliance reporting for internal and external auditors. 
                     Generate full-chain traceability for any intercompany transfer in seconds.
                  </p>
                  <div className="space-y-4">
                    <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group">
                      Initiate Compliance Export
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-blue-900/40">
                      Contact Technical Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'connectivity' ? (
          <ConnectivityManager onAddConnection={triggerWizard} />
        ) : (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminConsole />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
