import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Maximize2, ChevronRight, Info } from 'lucide-react';
import { WidgetRegistry } from './WidgetRegistry';
import { WidgetConfig } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const DRILL_DOWN_DATA: Record<string, any> = {
  LIQUIDITY_OVERVIEW: {
    primaryMetric: "$54.2M Surplus",
    description: "Global liquidity is trending 12% above seasonal baselines. Treasury surplus is currently allocated across Tier 1 interest-bearing vehicles.",
    stats: [
      { label: "Surplus Velocity", value: "High" },
      { label: "Allocation Efficiency", value: "98%" }
    ],
    items: ["ZBA Aggregation Relay #4", "Sub-Account #92", "Intercompany Loan Pool"]
  },
  WORKING_CAPITAL_PULSE: {
    primaryMetric: "32 Days DPO",
    description: "Working capital cycles are optimizing. Current drift indicates a potential reduction in trapped liquidity by $2.1M over next 12h.",
    stats: [
      { label: "Cash Conversion", value: "-1.2d" },
      { label: "Inventory Turn", value: "Optimal" }
    ],
    items: ["Receivables Batch A-12", "Payables Queue Expansion", "Entity #01 Settlement"]
  },
  AVAILABLE_TO_DISCOUNT: {
    primaryMetric: "$12.4M Ready",
    description: "Liquidity available for early settlement discounts. Hardened compliance checks passed for following tranches.",
    stats: [
      { label: "Yield Capture", value: "2.4%" },
      { label: "Risk Score", value: "0.05" }
    ],
    items: ["Supplier Tranche #8", "Discount Batch Beta", "Early Settlement Pool"]
  },
  FX_EXPOSURE_MINI: {
    primaryMetric: "85% Hedged",
    description: "FX exposure concentration is centered in JPY/EUR. Variance is within tactical drift parameters.",
    stats: [
      { label: "Volatility Delta", value: "Minimal" },
      { label: "Neural Hedge Sync", value: "Active" }
    ],
    items: ["JPY/USD Relay", "EUR Neutralization", "GBP Exposure Alert"]
  },
  PENDING_PAYMENTS: {
    primaryMetric: "14 Items Pending",
    description: "High-integrity payment items awaiting final settlement authorization. Sanctions screening complete.",
    stats: [
      { label: "Velocity Index", value: "99.9" },
      { label: "Security Layer", value: "Hardened" }
    ],
    items: ["Entity #45 Dividend", "Nexus Settlement #9", "M&A Escrow Release"]
  },
  SWIFT_GPI_TRACKER: {
    primaryMetric: "120ms Latency",
    description: "Global settlement nexus is performing optimally. Intermediary relays are reporting near-instant confirmation.",
    stats: [
      { label: "Relay Sync", value: "Global" },
      { label: "Packet Integrity", value: "100%" }
    ],
    items: ["Relay #SGD-01", "Intermediary Hop 4", "Destination Vault B"]
  }
};

interface DashboardWidgetProps {
  widget: WidgetConfig;
  onRemove?: (id: string) => void;
  isEditing: boolean;
}

export default function DashboardWidget({ widget, onRemove, isEditing }: DashboardWidgetProps) {
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [hoveringInfo, setHoveringInfo] = useState(false);
  
  // Neural Insight widgets don't have drill down
  const hasDrillDown = widget.componentKey !== 'CEREBRO_QUICK';
  const drillData = DRILL_DOWN_DATA[widget.componentKey] || DRILL_DOWN_DATA.LIQUIDITY_OVERVIEW;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id, disabled: !isEditing });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const WidgetComponent = WidgetRegistry[widget.componentKey];

  return (
    <>
    <div 
      ref={setNodeRef} 
      style={style}
      className={`liquid-glass flex flex-col h-full group relative transition-all duration-300 ${isEditing ? 'ring-1 ring-blue-500/30' : 'hover:border-blue-500/30'}`}
    >
      {/* Header */}
      <div className="px-5 py-2.5 border-b border-white/5 flex justify-between items-center bg-white/[0.02] min-h-11">
        <div className="flex items-center gap-3 overflow-hidden">
          {isEditing && (
            <button 
              {...attributes} 
              {...listeners} 
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors"
            >
              <GripVertical className="w-4 h-4 text-slate-500" />
            </button>
          )}
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-400 transition-colors truncate">
            {widget.title}
          </h4>
          {hasDrillDown && !isEditing && (
            <div className="relative">
              <button 
                onMouseEnter={() => setHoveringInfo(true)}
                onMouseLeave={() => setHoveringInfo(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDrillDown(true);
                }}
                className="p-1 text-slate-600 hover:text-blue-400 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              
              <AnimatePresence>
                {hoveringInfo && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[60] pointer-events-none"
                  >
                    <div className="whitespace-nowrap px-3 py-1.5 bg-blue-500 border border-blue-500/30 backdrop-blur-xl rounded-lg shadow-xl shadow-blue-500/10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white">Tactical Drill Down Available</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing && (
            <button 
              onClick={() => onRemove?.(widget.id)}
              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
            >
              <X className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area - No Scrollbars */}
      <div 
        className="p-5 flex-1 overflow-hidden transition-colors"
      >
        <div 
          className={`h-full clickable-content overflow-hidden ${hasDrillDown && !isEditing ? 'cursor-pointer' : ''}`}
          onClick={() => hasDrillDown && !isEditing && setShowDrillDown(true)}
        >
          {WidgetComponent ? <WidgetComponent /> : <div className="text-slate-600 italic text-xs">Unknown Widget: {widget.componentKey}</div>}
        </div>
      </div>

      <style>{`
        .clickable-content div, 
        .clickable-content span, 
        .clickable-content p, 
        .clickable-content h1, 
        .clickable-content h2, 
        .clickable-content h3 {
          transition: all 0.2s ease;
        }
        .clickable-content p:hover,
        .clickable-content h4:hover {
          color: white !important;
        }
      `}</style>
    </div>

    {/* Drill Down Overlay (Centered Modal) */}
    <AnimatePresence>
      {showDrillDown && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setShowDrillDown(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col relative max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                     <Maximize2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                     <h3 className="text-lg font-light text-white tracking-tight uppercase">{widget.title} <span className="text-blue-500 font-bold ml-2">Intelligence</span></h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Tactical Precision Viewport v4.0</p>
                  </div>
               </div>
               <button 
                onClick={() => setShowDrillDown(false)}
                className="p-2.5 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all duration-300"
               >
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar-hidden">
               <div className="grid grid-cols-2 gap-5 mb-6">
                  {drillData.stats.map((stat: any, i: number) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-[24px] group hover:border-blue-500/20 transition-all duration-500 appearance-none outline-none">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                       <div className="flex items-center gap-4">
                          {i === 0 && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]" />}
                          <p className={`text-xl font-light text-white font-mono tracking-tighter`}>{stat.value}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-6 liquid-glass-high mb-6 bg-blue-500/[0.03] rounded-[28px] relative overflow-hidden border border-blue-500/10">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[50px] rounded-full" />
                  <div className="relative z-10">
                    <p className="text-xs text-slate-100 leading-relaxed font-medium mb-6 tracking-wide">
                      "{drillData.description}"
                    </p>
                    <div className="h-32 bg-slate-950/60 rounded-[24px] border border-white/5 flex items-center justify-center group overflow-hidden relative">
                       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)]" />
                       <div className="text-center relative z-10">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.8em] group-hover:text-blue-400 transition-all duration-700">Neural Flow Active</span>
                          <div className="mt-3 flex gap-1 justify-center">
                             {[1, 2, 3, 4, 5, 6, 7].map(i => (
                               <motion.div 
                                 key={i} 
                                 animate={{ height: [5, 15, 5], opacity: [0.3, 1, 0.3] }} 
                                 transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }} 
                                 className="w-0.5 bg-blue-500/40 rounded-full" 
                               />
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] px-4 mb-1">Extended Sub-Structures</p>
                  {drillData.items.map((item: string, i: number) => (
                    <button key={i} className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.01] hover:bg-blue-500/5 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all duration-300 text-left group">
                       <span className="text-[9px] font-bold text-slate-300 group-hover:text-white uppercase tracking-widest">{item}</span>
                       <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-900/50 border-t border-white/5 flex justify-end gap-3">
               <button 
                onClick={() => setShowDrillDown(false)}
                className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300"
               >
                 Acknowledge
               </button>
               <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-blue-900/40 hover:-translate-y-1 active:translate-y-0">
                 Full System Audit
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
