import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Globe, Landmark, Layout, ArrowRight, X, Zap } from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { useIndustry } from '../../IndustryContext';

interface SearchResult {
  id: string;
  type: 'Vertical' | 'Entity' | 'Account';
  label: string;
  sublabel?: string;
  payload?: any;
}

export interface NeuralSearchHandle {
  open: () => void;
  close: () => void;
}

const NeuralSearch = forwardRef<NeuralSearchHandle, {}>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const { activeVertical, updateVertical } = useIndustry();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  useImperativeHandle(ref, () => ({
    open,
    close
  }));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggle]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const performSearch = async () => {
      const verticalLabels: Record<string, string> = {
        'Manufacturing': 'Industrial & Supply Chain',
        'Healthcare': 'Medical & Biotech Buffers',
        'Real Estate': 'Portfolio & Trust Monitor',
        'Retail': 'POS & Netting Hub',
        'Technology': 'Scale & Valuation Engine',
        'Oil & Gas': 'Energy Hedging Cockpit',
        'Insurance': 'Solvency & ALM Duration',
        'DEV': 'System Debug & Sandbox'
      };

      const verticals: SearchResult[] = Object.keys(verticalLabels).map(key => ({
        id: key,
        type: 'Vertical',
        label: key,
        sublabel: verticalLabels[key]
      }));

      try {
        const [entities, accounts] = await Promise.all([
          treasuryService.getEntities(),
          treasuryService.getAccounts()
        ]);

        const entityResults: SearchResult[] = entities.map(e => ({
          id: e.id,
          type: 'Entity',
          label: e.name,
          sublabel: `Subsidiary • ${e.baseCurrency}`
        }));

        const accountResults: SearchResult[] = accounts.map(a => ({
          id: a.id,
          type: 'Account',
          label: a.name,
          sublabel: `${a.bank} • ${a.currency} • ${a.glCode}`
        }));

        const allResults = [...verticals, ...entityResults, ...accountResults];
        
        if (query.trim()) {
          const filtered = allResults.filter(r => 
            r.label.toLowerCase().includes(query.toLowerCase()) ||
            r.type.toLowerCase().includes(query.toLowerCase()) ||
            (r.sublabel || '').toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered.slice(0, 10));
        } else {
          setResults(allResults.slice(0, 5));
        }
      } catch (err) {
        console.error("Search index failed:", err);
      }
    };

    performSearch();
  }, [isOpen, query]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'Vertical') {
      updateVertical(result.id as any);
    } else {
      console.log(`Jumping to ${result.type}: ${result.id}`);
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <Search className="w-6 h-6 text-blue-500" />
              <input 
                autoFocus
                placeholder="Jump to account, vertical, or subsidiary..."
                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-slate-600 font-light"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
               <div className="space-y-2">
                  {results.length > 0 ? (
                    results.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 group transition-all text-left"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                          result.type === 'Vertical' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                          result.type === 'Entity' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {result.type === 'Vertical' && <Globe className="w-5 h-5" />}
                          {result.type === 'Entity' && <Landmark className="w-5 h-5" />}
                          {result.type === 'Account' && <Layout className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{result.label}</h4>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              {result.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{result.sublabel}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-slate-600 font-mono text-sm tracking-tight italic">No Nexus relays matched your frequency...</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-slate-500 font-bold border border-white/10">↑↓</kbd>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-slate-500 font-bold border border-white/10">Enter</kbd>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600 group">
                 <Zap className="w-3 h-3 text-blue-500/50" />
                 <span className="text-[10px] font-black italic tracking-tighter">NEURAL_INDEX_V4.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default NeuralSearch;
