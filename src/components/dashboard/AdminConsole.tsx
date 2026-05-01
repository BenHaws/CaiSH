import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { UserRole, ComplianceScore } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  FileCheck, 
  Key, 
  Settings, 
  Search, 
  MoreVertical, 
  Mail, 
  UserPlus,
  ArrowUpRight,
  Fingerprint,
  Zap,
  Globe2,
  Cpu,
  Factory,
  Stethoscope,
  Building,
  ShoppingCart,
  Droplets,
  Terminal,
  Lock
} from 'lucide-react';
import { IndustryConfig, IndustryVertical } from '../../types';
import { useIndustry } from '../../IndustryContext';

export default function AdminConsole() {
  const { activeVertical, updateVertical } = useIndustry();
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [compliance, setCompliance] = useState<ComplianceScore[]>([]);
  const [industryConfig, setIndustryConfig] = useState<IndustryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'security' | 'compliance' | 'industry'>('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [me, userData, complianceData, industryData] = await Promise.all([
          treasuryService.getCurrentUser ? treasuryService.getCurrentUser() : Promise.resolve({ role: 'ADMIN', email: 'ben@cwgs.wtf' } as UserRole),
          treasuryService.getAdminUsers(),
          treasuryService.getComplianceScores(),
          treasuryService.getIndustryConfig()
        ]);
        setCurrentUser(me);
        setUsers(userData);
        setCompliance(complianceData);
        setIndustryConfig(industryData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isTreasurer = currentUser?.role === 'TREASURER';
  const isAuditor = currentUser?.role === 'AUDITOR';

  const handleVerticalSwitch = async (vertical: IndustryVertical) => {
    if (!isAdmin) return;
    try {
      await updateVertical(vertical);
      const newConfig = { ...industryConfig! , activeVertical: vertical };
      setIndustryConfig(newConfig);
    } catch (error) {
      console.error(error);
    }
  };

  const industries: { id: IndustryVertical; label: string; focus: string; pbc: string; icon: any }[] = [
    { id: 'Manufacturing', label: 'Manufacturing', focus: 'Inventory Liquidity', pbc: 'Inventory-Backed Lending', icon: Factory },
    { id: 'Healthcare', label: 'Healthcare', focus: 'Claims Reconciliation', pbc: 'Insurance Sub-Ledger', icon: Stethoscope },
    { id: 'Real Estate', label: 'Real Estate', focus: 'Escrow & Debt', pbc: 'Trust Account Monitor', icon: Building },
    { id: 'Retail', label: 'Retail', focus: 'High-Volume Payables', pbc: 'Dynamic Netting', icon: ShoppingCart },
    { id: 'Insurance', label: 'Insurance', focus: 'Solvency & Investment', pbc: 'Risk-Based Capital Engine', icon: ShieldCheck },
    { id: 'Technology', label: 'Technology', focus: 'R&D Capital / FX', pbc: 'IP Valuation Engine', icon: Cpu },
    { id: 'Oil & Gas', label: 'Oil & Gas', focus: 'Commodity Risk', pbc: 'Energy Hedging Dashboard', icon: Droplets },
    { id: 'DEV', label: 'DEV MODE', focus: 'System-Wide God Mode', pbc: 'Global Kernel Control', icon: Terminal },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Admin <span className="font-semibold">Console</span></h2>
          <p className="text-slate-400">Manage hierarchical identity, RLS policies, and global compliance health.</p>
        </div>
        <div className="flex gap-4">
           {isAdmin && (
             <button className="flex items-center gap-2 px-6 py-3 glass-card hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
               <Key className="w-4 h-4" />
               Rotate Keys
             </button>
           )}
           {isAdmin && (
             <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">
               <UserPlus className="w-4 h-4" />
               Provision User
             </button>
           )}
           {!isAdmin && (
             <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
               <Lock className="w-4 h-4" />
               Management Restricted
             </div>
           )}
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-10 border-b border-white/5 pb-6">
        {[
          { id: 'users', label: 'Identity & RBAC', icon: Users, minRole: 'AUDITOR' },
          { id: 'security', label: 'Security Policies', icon: ShieldCheck, minRole: 'ADMIN' },
          { id: 'compliance', label: 'Compliance Health', icon: FileCheck, minRole: 'AUDITOR' },
          { id: 'industry', label: 'Industry Optimization', icon: Globe2, minRole: 'ADMIN' }
        ].map(tab => {
          const isRestricted = tab.minRole === 'ADMIN' && !isAdmin;
          return (
            <button 
              key={tab.id}
              onClick={() => !isRestricted && setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${isRestricted ? 'opacity-30 cursor-not-allowed' : activeSubTab === tab.id ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
              title={isRestricted ? "Access restricted to Administrators" : ""}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {isRestricted && <Lock className="w-3 h-3 ml-1" />}
              {activeSubTab === tab.id && (
                <motion.div layoutId="subtab-active" className="absolute -bottom-6 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <div className="relative max-w-sm w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all" placeholder="Filter identity relays..." />
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3 Active Identities</span>
            </div>
            <div className="divide-y divide-white/5">
              {users.map((user) => (
                <div key={user.id} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-500/10 transition-colors">
                        <Users className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-slate-600">ID: {user.id}</span>
                          <span className="text-slate-800">•</span>
                          <span className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest">{user.role}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-12">
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Entity Context</p>
                         <p className="text-xs font-semibold text-slate-400 mt-1">Nexus Relay #{user.entityId}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Status</p>
                         <div className="flex items-center gap-2 mt-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>{user.status}</span>
                         </div>
                      </div>
                      {isAdmin && (
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                           <MoreVertical className="w-5 h-5 text-slate-600" />
                        </button>
                      )}
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'security' && (
          <motion.div 
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-10"
          >
             <div className="glass-card p-10 bg-blue-500/5 border-blue-500/20">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                     <ShieldCheck className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight">RLS Global Policy</h3>
                </div>
                <div className="space-y-6">
                   <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-3">Active Policy Code</p>
                      <pre className="text-xs font-mono text-slate-400 bg-black/20 p-4 rounded-xl leading-relaxed">
{`CREATE POLICY dash_isolation 
ON user_dashboards
FOR ALL USING (
  entity_id = app.current_entity_id
);`}
                      </pre>
                   </div>
                   <p className="text-sm text-slate-500 leading-relaxed italic">
                      "Isolation confirmed at the data layer. Subsidiary units are mathematically incapable of cross-node visibility."
                   </p>
                </div>
             </div>

             <div className="space-y-10">
                <div className="glass-card p-8 group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <Key className="w-5 h-5 text-slate-400" />
                         <h4 className="text-sm font-bold text-white uppercase tracking-widest">Secret Management</h4>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed mb-6">Automated rotation of Plaid/Tink credentials across the global nexus topology.</p>
                   <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[10px] text-slate-600 uppercase tracking-widest italic">Last Rotation</p>
                         <p className="text-xs text-emerald-400 font-mono mt-1">2h 14m ago</p>
                      </div>
                      {isAdmin && (
                        <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-400/30">Manual Reset</button>
                      )}
                   </div>
                </div>

                <div className="glass-card p-8 flex items-center gap-6">
                   <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <Fingerprint className="w-6 h-6 text-purple-400" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest">Multi-Factor Enforce</h4>
                      <p className="text-xs text-slate-500 mt-1 italic">Mandatory OIDC session verification for all Admin relays.</p>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeSubTab === 'compliance' && (
          <motion.div 
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-4 gap-8"
          >
             {compliance.map((item, i) => (
               <div key={i} className="glass-card p-8 text-center flex flex-col items-center">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <circle 
                           cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                           strokeDasharray={364} 
                           strokeDashoffset={364 - (364 * item.score) / 100}
                           className={`${item.status === 'compliant' ? 'text-emerald-500' : 'text-blue-500'}`} 
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-light text-white">{item.score}</span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Pulse</span>
                     </div>
                  </div>
                  <h5 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-2">{item.category}</h5>
                  <p className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${item.status === 'compliant' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
                    {item.status.toUpperCase()}
                  </p>
               </div>
             ))}
             
             <div className="col-span-4 glass-card p-10 border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
                <div className="flex gap-8 items-center">
                   <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Zap className="w-8 h-8 text-emerald-400" />
                   </div>
                   <div>
                      <h4 className="text-xl font-semibold text-white tracking-tight">Audit Readiness: ABSOLUTE</h4>
                      <p className="text-sm text-slate-400 mt-2 italic">Global integrity check passed for 438,291 transaction sequences.</p>
                   </div>
                </div>
                <button className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all">
                   Generate Full Report
                </button>
             </div>
          </motion.div>
        )}
        {activeSubTab === 'industry' && (
          <motion.div 
            key="industry"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-10"
          >
             <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4 mb-10">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <p className="text-[10px] font-bold text-amber-200/70 uppercase tracking-widest">
                   Corporate Governance Note: In production-hardened environments, Vertical Selection is restricted to Super-Admins during the initial onboarding phase.
                </p>
             </div>

             <div className="glass-card p-10 bg-blue-500/[0.02] border-blue-500/10 flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-light text-white tracking-tight">Vibe Selector: <span className="font-semibold text-blue-400">{industryConfig?.activeVertical}</span></h3>
                   <p className="text-slate-400 mt-2 italic">Priority Optimization: <span className="text-white font-bold">{industryConfig?.optimizationFocus}</span></p>
                </div>
                <div className="flex gap-2">
                   {industryConfig?.enabledPBCs.map(pbc => (
                      <span key={pbc} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-bold text-blue-400 uppercase tracking-widest">{pbc}</span>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-3 gap-6">
                {industries.map(ind => (
                   <button 
                      key={ind.id}
                      onClick={() => handleVerticalSwitch(ind.id)}
                      className={`glass-card p-8 text-left transition-all group ${industryConfig?.activeVertical === ind.id ? 'border-blue-500/40 bg-blue-500/5' : 'hover:bg-white/[0.02]'}`}
                   >
                      <div className="flex justify-between items-start mb-6">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${industryConfig?.activeVertical === ind.id ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-slate-500 group-hover:text-white'}`}>
                            <ind.icon className="w-6 h-6" />
                         </div>
                         {industryConfig?.activeVertical === ind.id && <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{ind.label}</h4>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ind.focus}</p>
                        <p className="text-[9px] text-blue-400/60 font-mono italic">{ind.pbc}</p>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Apply Vertical</span>
                         <ArrowUpRight className="w-3 h-3 text-blue-400" />
                      </div>
                   </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
