import React, { useState } from 'react';
import { Globe, Zap, Cpu, Shield, Crosshair, RadioTower, Banknote, Orbit, Rocket, Star, Satellite } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type DeploymentHub = 'EARTH' | 'OFF_EARTH' | 'ORBITAL' | 'MARS';

interface HubConfig {
  id: DeploymentHub;
  title: string;
  titleAccent: string;
  subtitle: string;
  image: string;
  stats: { label: string; value: string; icon: any }[];
  accentColor: string;
  vibe: string;
}

const HUBS: Record<DeploymentHub, HubConfig> = {
  EARTH: {
    id: 'EARTH',
    title: 'Global Payment',
    titleAccent: 'Routes',
    subtitle: 'Payment Vector: EARTH-01',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2069&auto=format&fit=crop',
    accentColor: 'blue',
    vibe: 'Live Payment Route Mesh',
    stats: [
      { label: 'Active Routes', value: '18', icon: RadioTower },
      { label: 'Integrity', value: '99.9%', icon: Shield },
      { label: 'Latency', value: '120ms', icon: Zap }
    ]
  },
  OFF_EARTH: {
    id: 'OFF_EARTH',
    title: 'Off-Earth',
    titleAccent: 'Asset Management',
    subtitle: 'Asset Vector: LUNAR-02',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
    accentColor: 'cyan',
    vibe: 'Lunar Treasury Asset View',
    stats: [
      { label: 'Asset Nodes', value: '7', icon: Orbit },
      { label: 'Escrow Health', value: '98.6%', icon: Shield },
      { label: 'Relay Lag', value: '1.3s', icon: Zap }
    ]
  },
  ORBITAL: {
    id: 'ORBITAL',
    title: 'Orbital',
    titleAccent: 'Asset Management',
    subtitle: 'Asset Vector: ORBIT-03',
    image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=2080&auto=format&fit=crop',
    accentColor: 'violet',
    vibe: 'Orbital Custody Control Plane',
    stats: [
      { label: 'Orbital Assets', value: '12', icon: Rocket },
      { label: 'Custody Proof', value: '99.2%', icon: Shield },
      { label: 'Telemetry', value: 'Live', icon: RadioTower }
    ]
  },
  MARS: {
    id: 'MARS',
    title: 'Ares',
    titleAccent: 'Network',
    subtitle: 'Neural Vector: RED-HUB',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1974&auto=format&fit=crop',
    accentColor: 'red',
    vibe: 'Interplanetary Bridge Alpha',
    stats: [
      { label: 'Atmosphere', value: '0.6% Earth', icon: Cpu },
      { label: 'Daily Yield', value: '1,200 Sol', icon: Shield },
      { label: 'Signal Lag', value: '14m 2s', icon: Zap }
    ]
  }
};

const PAYMENT_HUBS = [
  { id: 'NYC', label: 'New York', x: 27, y: 43, amount: '$45.0M', tone: 'blue' },
  { id: 'LDN', label: 'London', x: 48, y: 36, amount: '$28.0M', tone: 'emerald' },
  { id: 'FRA', label: 'Frankfurt', x: 52, y: 39, amount: '$18.4M', tone: 'cyan' },
  { id: 'DXB', label: 'Dubai', x: 61, y: 52, amount: '$9.8M', tone: 'amber' },
  { id: 'SGP', label: 'Singapore', x: 76, y: 66, amount: '$15.0M', tone: 'purple' },
  { id: 'TKY', label: 'Tokyo', x: 84, y: 45, amount: '$7.2M', tone: 'rose' },
  { id: 'SAO', label: 'Sao Paulo', x: 36, y: 74, amount: '$4.9M', tone: 'emerald' },
];

const PAYMENT_ROUTES = [
  { from: 'NYC', to: 'LDN', value: '$12.4M', delay: 0 },
  { from: 'LDN', to: 'FRA', value: '$6.1M', delay: 0.5 },
  { from: 'FRA', to: 'DXB', value: '$8.7M', delay: 1 },
  { from: 'DXB', to: 'SGP', value: '$9.2M', delay: 1.5 },
  { from: 'SGP', to: 'TKY', value: '$3.8M', delay: 2 },
  { from: 'NYC', to: 'SAO', value: '$4.9M', delay: 2.5 },
  { from: 'LDN', to: 'SGP', value: '$11.6M', delay: 3 },
];

const ASSET_NODES = [
  { id: 'LUNA-1', label: 'Lunar Escrow', x: 34, y: 44, amount: '$18.2M', tone: 'cyan' },
  { id: 'LUNA-2', label: 'Regolith Rights', x: 47, y: 57, amount: '$9.4M', tone: 'blue' },
  { id: 'ORBIT-1', label: 'Orbital SPV', x: 62, y: 38, amount: '$31.7M', tone: 'purple' },
  { id: 'ORBIT-2', label: 'Telemetry Lease', x: 73, y: 61, amount: '$6.8M', tone: 'emerald' },
];

const hubById = Object.fromEntries(PAYMENT_HUBS.map(hub => [hub.id, hub]));

const routePath = (fromId: string, toId: string) => {
  const from = hubById[fromId];
  const to = hubById[toId];
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - Math.abs(to.x - from.x) * 0.18 - 8;
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
};

const toneClass: Record<string, string> = {
  blue: 'bg-blue-400 shadow-blue-400/60 border-blue-200/60',
  emerald: 'bg-emerald-400 shadow-emerald-400/60 border-emerald-200/60',
  cyan: 'bg-cyan-400 shadow-cyan-400/60 border-cyan-200/60',
  amber: 'bg-amber-400 shadow-amber-400/60 border-amber-200/60',
  purple: 'bg-purple-400 shadow-purple-400/60 border-purple-200/60',
  rose: 'bg-rose-400 shadow-rose-400/60 border-rose-200/60',
};

const accentClasses: Record<DeploymentHub, { border: string; bg: string; text: string; dot: string; active: string; inactiveHover: string }> = {
  EARTH: {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    dot: 'bg-blue-500 shadow-blue-500/50',
    active: 'border-blue-500/40 bg-blue-500/10 text-white',
    inactiveHover: 'hover:border-blue-500/30 hover:text-white'
  },
  OFF_EARTH: {
    border: 'border-cyan-500/25',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400 shadow-cyan-400/50',
    active: 'border-cyan-400/50 bg-cyan-400/10 text-white shadow-[0_0_24px_rgba(34,211,238,0.12)]',
    inactiveHover: 'hover:border-cyan-400/30 hover:text-cyan-100'
  },
  ORBITAL: {
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/5',
    text: 'text-violet-300',
    dot: 'bg-violet-400 shadow-violet-400/50',
    active: 'border-violet-400/50 bg-violet-400/10 text-white shadow-[0_0_24px_rgba(167,139,250,0.14)]',
    inactiveHover: 'hover:border-violet-400/30 hover:text-violet-100'
  },
  MARS: {
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
    text: 'text-red-400',
    dot: 'bg-red-500 shadow-red-500/50',
    active: 'border-red-500/40 bg-red-500/10 text-white',
    inactiveHover: 'hover:border-red-500/30 hover:text-white'
  }
};

export default function GlobalPulseMap() {
  const [currentHub, setCurrentHub] = useState<DeploymentHub>(() => {
    const saved = window.localStorage.getItem('caish-global-pulse-mode') as DeploymentHub | null;
    return saved && saved in HUBS ? saved : 'EARTH';
  });
  const config = HUBS[currentHub];
  const accent = accentClasses[currentHub];
  const setPulseHub = (hub: DeploymentHub) => {
    setCurrentHub(hub);
    window.localStorage.setItem('caish-global-pulse-mode', hub);
  };

  const toggleMars = () => {
    setPulseHub(currentHub === 'MARS' ? 'EARTH' : 'MARS');
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
      {/* Dynamic Environment Background */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentHub}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentHub === 'MARS' ? 0.5 : 0.28 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className={`absolute inset-0 mix-blend-screen scale-110 ${currentHub === 'MARS' ? 'hue-rotate-[-30deg] saturate-150' : ''}`}
          style={{
            backgroundImage: `url('${config.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>
      
      {currentHub === 'EARTH' && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.22),transparent_40%),linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.78))]" />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="routeGlow">
                <feGaussianBlur stdDeviation="0.45" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="routeGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#5eead4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            {PAYMENT_ROUTES.map(route => (
              <g key={`${route.from}-${route.to}`}>
                <path
                  d={routePath(route.from, route.to)}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeWidth="0.28"
                />
                <motion.path
                  d={routePath(route.from, route.to)}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="0.48"
                  strokeLinecap="round"
                  filter="url(#routeGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0.25] }}
                  transition={{ duration: 3.4, repeat: Infinity, delay: route.delay, ease: 'easeInOut' }}
                />
              </g>
            ))}
          </svg>

          {PAYMENT_HUBS.map((hub, i) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group/hub"
              style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
            >
              <div className={`relative w-4 h-4 rounded-full border shadow-[0_0_22px_currentColor] ${toneClass[hub.tone]}`}>
                <span className="absolute inset-[-12px] rounded-full border border-current opacity-20 animate-ping" />
                <span className="absolute inset-[-24px] rounded-full border border-current opacity-10" />
              </div>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/hub:opacity-100 transition-opacity whitespace-nowrap px-3 py-2 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-xl shadow-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-white">{hub.label}</p>
                <p className="text-[10px] font-mono text-blue-300 mt-0.5">{hub.amount} live liquidity</p>
              </div>
            </motion.div>
          ))}

          <div className="absolute left-12 bottom-28 grid grid-cols-2 gap-2 pointer-events-none">
            {PAYMENT_ROUTES.slice(0, 4).map(route => (
              <div key={`${route.from}-${route.to}-ticket`} className="px-3 py-2 rounded-xl bg-slate-950/55 border border-white/10 backdrop-blur-md">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{route.from} {'->'} {route.to}</p>
                <p className="text-[11px] font-mono text-cyan-300">{route.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(currentHub === 'OFF_EARTH' || currentHub === 'ORBITAL') && (
        <div className="absolute inset-0">
          <div className={`absolute inset-0 ${
            currentHub === 'OFF_EARTH'
              ? 'bg-[radial-gradient(circle_at_38%_44%,rgba(34,211,238,0.24),transparent_24%),radial-gradient(circle_at_70%_55%,rgba(59,130,246,0.16),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.8))]'
              : 'bg-[radial-gradient(circle_at_62%_38%,rgba(167,139,250,0.24),transparent_24%),radial-gradient(circle_at_42%_62%,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.8))]'
          }`} />
          <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="assetRouteGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={currentHub === 'OFF_EARTH' ? '#22d3ee' : '#a78bfa'} stopOpacity="0.12" />
                <stop offset="50%" stopColor="#f8fafc" stopOpacity="0.75" />
                <stop offset="100%" stopColor={currentHub === 'OFF_EARTH' ? '#60a5fa' : '#22d3ee'} stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <motion.ellipse
              cx="52"
              cy="52"
              rx={currentHub === 'OFF_EARTH' ? '34' : '38'}
              ry={currentHub === 'OFF_EARTH' ? '18' : '24'}
              fill="none"
              stroke="url(#assetRouteGradient)"
              strokeWidth="0.45"
              strokeDasharray="2 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
            />
            <motion.ellipse
              cx="52"
              cy="52"
              rx={currentHub === 'OFF_EARTH' ? '22' : '26'}
              ry={currentHub === 'OFF_EARTH' ? '38' : '31'}
              fill="none"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="0.3"
              strokeDasharray="1.5 2.5"
              animate={{ opacity: [0.25, 0.75, 0.25] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </svg>

          {ASSET_NODES.map((node, i) => (
            <motion.div
              key={`${currentHub}-${node.id}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group/hub"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`relative w-4 h-4 rounded-full border shadow-[0_0_22px_currentColor] ${toneClass[node.tone]}`}>
                <span className="absolute inset-[-14px] rounded-full border border-current opacity-20 animate-ping" />
              </div>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/hub:opacity-100 transition-opacity whitespace-nowrap px-3 py-2 rounded-xl bg-slate-950/85 border border-white/10 backdrop-blur-xl shadow-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-white">{node.label}</p>
                <p className="text-[10px] font-mono text-cyan-300 mt-0.5">{node.amount} managed value</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* HUD-style Overlay */}
      <div className="absolute inset-0 pointer-events-none p-8 xl:p-12 flex flex-col justify-between">
        <div className="flex justify-between items-start">
           <div className={`p-6 xl:p-8 liquid-glass backdrop-blur-xl rounded-[32px] transition-all duration-700 ${accent.border} ${accent.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                 <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] ${accent.dot}`}
                 />
                 <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${accent.text}`}>Nexus Synchronization</span>
              </div>
              <h3 className="text-2xl xl:text-3xl font-light text-white tracking-tighter uppercase font-mono mb-2 max-w-[520px]">
                {config.title} <span className={accent.text}>{config.titleAccent}</span>
              </h3>
              
              {/* HIDDEN MARS TRIGGER */}
              <button 
                onClick={toggleMars}
                className="pointer-events-auto group/mars"
              >
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] group-hover/mars:text-red-500 transition-colors">
                  {config.subtitle} 
                  <span className="opacity-0 group-hover/mars:opacity-100 ml-2 font-black transition-opacity">_OVERRIDE_</span>
                </p>
              </button>
           </div>

           <div className="flex gap-4">
             {config.stats.map((stat, i) => (
               <div key={i} className="px-8 py-6 glass-card bg-slate-950/60 border-white/5 text-center backdrop-blur-md">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                    <stat.icon className="w-3 h-3" /> {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white font-mono tracking-tighter">{stat.value}</p>
               </div>
             ))}
           </div>
        </div>

        <div className="flex justify-between items-end">
           {/* Hub Switch UI */}
           <div className="pointer-events-auto flex gap-2">
              {(['EARTH'] as DeploymentHub[]).map(hub => (
                <button
                  key={hub}
                  onClick={() => setPulseHub(hub)}
                  className={`px-6 py-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${
                    currentHub === hub 
                      ? 'border-blue-500/40 bg-blue-500/10 text-white'
                      : 'border-white/5 bg-white/[0.02] text-slate-500 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{hub}</span>
                </button>
              ))}
              <div className="px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-slate-500 flex items-center gap-3">
                <Banknote className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">SWIFT gpi</span>
              </div>
              <button
                onClick={() => setPulseHub('OFF_EARTH')}
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                  currentHub === 'OFF_EARTH'
                    ? accentClasses.OFF_EARTH.active
                    : `border-white/5 bg-white/[0.02] text-slate-500 ${accentClasses.OFF_EARTH.inactiveHover}`
                }`}
                title="Off-Earth Asset Management"
                aria-label="Off-Earth Asset Management"
              >
                <Orbit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPulseHub('ORBITAL')}
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                  currentHub === 'ORBITAL'
                    ? accentClasses.ORBITAL.active
                    : `border-white/5 bg-white/[0.02] text-slate-500 ${accentClasses.ORBITAL.inactiveHover}`
                }`}
                title="Orbital Asset Management"
                aria-label="Orbital Asset Management"
              >
                <Rocket className="w-4 h-4" />
              </button>
           </div>

           <div className={`px-8 py-4 liquid-glass-high rounded-2xl border transition-colors ${accent.border}`}>
              <span className={`text-[11px] font-black uppercase tracking-[0.6em] ${accent.text}`}>{config.vibe}</span>
           </div>
        </div>
      </div>

      {/* Crosshair Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
         <div className="absolute left-1/2 top-0 w-px h-full bg-white/10" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border border-white/10 rounded-full" />
            <div className="w-64 h-64 border border-white/5 rounded-full" />
            <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/5" />
         </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10% }
          100% { top: 110% }
        }
      `}</style>
    </div>
  );
}