import React, { useState } from 'react';
import { Globe, Zap, Cpu, Shield, Crosshair, RadioTower, Banknote, Orbit, Rocket, Star, Satellite } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type DeploymentHub = 'EARTH' | 'MOON' | 'ISS' | 'MARS';

interface HubConfig {
  id: DeploymentHub;
  title: string;
  subtitle: string;
  image: string;
  stats: { label: string; value: string; icon: any }[];
  accentColor: string;
  vibe: string;
}

const HUBS: Record<DeploymentHub, HubConfig> = {
  EARTH: {
    id: 'EARTH',
    title: 'Global Settlement Map',
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
  MOON: {
    id: 'MOON',
    title: 'Lunar Asset Hub',
    subtitle: 'Lunar Vector: SECTOR-4',
    image: 'https://images.unsplash.com/photo-1541963463572-dae8d2733a4c?q=80&w=2070&auto=format&fit=crop',
    accentColor: 'cyan',
    vibe: 'Lunar Operations Online',
    stats: [
      { label: 'Orbit Altitude', value: '384,400 km', icon: Orbit },
      { label: 'Resource Yield', value: '2.4M Sol', icon: Banknote },
      { label: 'Signal Delay', value: '1.3s', icon: Zap }
    ]
  },
  ISS: {
    id: 'ISS',
    title: 'Orbital Asset Hub',
    subtitle: 'Station Vector: ALPHA-7',
    image: 'https://images.unsplash.com/photo-1614728883729-5e889cdde682?q=80&w=2070&auto=format&fit=crop',
    accentColor: 'indigo',
    vibe: 'Orbital Bridge Active',
    stats: [
      { label: 'Altitude', value: '408 km', icon: Satellite },
      { label: 'Daily Yield', value: '890 Sol', icon: Banknote },
      { label: 'Signal Delay', value: '2.5ms', icon: Zap }
    ]
  },
  MARS: {
    id: 'MARS',
    title: 'Ares Network',
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

export default function GlobalPulseMap() {
  const [activeRelay, setActiveRelay] = useState<DeploymentHub>('EARTH');
  const config = HUBS[activeRelay];

  const handleRelaySwitch = () => {
    // Kinetic accent animation trigger
    const accentColors: Record<DeploymentHub, string> = {
      EARTH: 'blue',
      MOON: 'cyan',
      ISS: 'indigo',
      MARS: 'red'
    };
    
    // Trigger kinetic feedback via motion
    document.body.style.background = `linear-gradient(135deg, ${accentColors[activeRelay] === 'blue' ? '#1e3a8a' : accentColors[activeRelay] === 'cyan' ? '#0e7490' : accentColors[activeRelay] === 'indigo' ? '#312e81' : '#7f1d1d'}15, #02061b)`;
    setTimeout(() => {
      document.body.style.background = '';
    }, 300);
  };

  const toggleMars = () => {
    setActiveRelay(prev => prev === 'MARS' ? 'EARTH' : 'MARS');
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
      {/* Dynamic Environment Background */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeRelay}
          initial={{ opacity: 0 }}
          animate={{ opacity: activeRelay === 'MARS' ? 0.5 : 0.28 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className={`absolute inset-0 mix-blend-screen scale-110 ${activeRelay === 'MARS' ? 'hue-rotate-[-30deg] saturate-150' : ''}`}
          style={{
            backgroundImage: `url('${config.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>
      
      {activeRelay === 'EARTH' && (
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

      {/* HUD-style Overlay */}
      <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between">
        <div className="flex justify-between items-start">
           <div className={`p-8 liquid-glass backdrop-blur-xl rounded-[32px] transition-all duration-700 ${
             activeRelay === 'MARS' ? 'border-red-500/20 bg-red-500/5' : 
             activeRelay === 'MOON' || activeRelay === 'ISS' ? 'border-cyan-500/20 bg-cyan-500/5' :
             'border-blue-500/20 bg-blue-500/5'
           }`}>
              <div className="flex items-center gap-3 mb-2">
                 <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${
                      activeRelay === 'MARS' ? 'bg-red-500 shadow-red-500/50' :
                      activeRelay === 'MOON' || activeRelay === 'ISS' ? 'bg-cyan-500 shadow-cyan-500/50' :
                      'bg-blue-500 shadow-blue-500/50'
                    }`} 
                 />
                 <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${
                   activeRelay === 'MARS' ? 'text-red-400' :
                   activeRelay === 'MOON' || activeRelay === 'ISS' ? 'text-cyan-400' :
                   'text-blue-400'
                 }`}>Nexus Synchronization</span>
              </div>
              <h3 className="text-3xl font-light text-white tracking-tighter uppercase font-mono mb-2 max-w-[520px]">
                {activeRelay === 'EARTH' ? 'Global ' : activeRelay === 'MOON' || activeRelay === 'ISS' ? config.title.split(' ')[0] + ' ' : config.title.split(' ')[0]} <span className={
                  activeRelay === 'MARS' ? 'text-red-500' :
                  activeRelay === 'MOON' || activeRelay === 'ISS' ? 'text-cyan-500' :
                  'text-blue-500'
                }>{activeRelay === 'EARTH' ? 'Payment Routes' : config.title.split(' ')[1]}</span>
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
          {/* Hub Switch UI - Three Circular Buttons in Bottom-Right Panel */}
          <div className="pointer-events-auto flex gap-2">
            {/* EARTH Button: Globe icon + "EARTH" label */}
            <button
              onClick={() => setActiveRelay('EARTH')}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                activeRelay === 'EARTH' 
                  ? 'border-blue-500/60 bg-blue-500/10 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                  : 'border-white/10 bg-white/[0.02] text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest ml-1">EARTH</span>
            </button>

            {/* MOON Button: Rocket icon only (no text label) */}
            <button
              onClick={() => setActiveRelay('MOON')}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                activeRelay === 'MOON' 
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                  : 'border-white/10 bg-white/[0.02] text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              <Rocket className="w-5 h-5" />
            </button>

            {/* ISS Button: Orbit icon only (no text label) */}
            <button
              onClick={() => setActiveRelay('ISS')}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                activeRelay === 'ISS' 
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                  : 'border-white/10 bg-white/[0.02] text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              <Orbit className="w-5 h-5" />
            </button>

            {/* SWIFT GPI indicator */}
            <div className="px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-slate-500 flex items-center gap-3">
              <Banknote className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">SWIFT gpi</span>
            </div>
          </div>

          <div className={`px-8 py-4 liquid-glass-high rounded-2xl border transition-colors ${
            activeRelay === 'MARS' ? 'border-red-500/30' : 
            activeRelay === 'MOON' || activeRelay === 'ISS' ? 'border-cyan-500/30' :
            'border-blue-500/30'
          }`}>
             <span className={`text-[11px] font-black uppercase tracking-[0.6em] ${
               activeRelay === 'MARS' ? 'text-red-400/60' : 
               activeRelay === 'MOON' || activeRelay === 'ISS' ? 'text-cyan-400/60' : 'text-blue-400/60'
             }`}>{config.vibe}</span>
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