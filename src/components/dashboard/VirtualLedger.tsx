import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { treasuryService } from '../../services/treasuryService';
import { JournalEntry } from '../../types';
import { BookOpen, Search, Filter, ArrowRightLeft, FileSpreadsheet, Download, Hash } from 'lucide-react';

export default function VirtualLedger() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await treasuryService.getLedgerEntries();
        setEntries(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'liquidity': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'trade': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'fee': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      case 'adjustment': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-white bg-white/10';
    }
  };

  if (isLoading) return <div className="text-white animate-pulse text-center p-20">Reconstructing Atomic Journal...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Virtual <span className="font-semibold">Ledger</span></h2>
          <p className="text-slate-400">The immutable record of system-generated "shadow" entries for global synchronization.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
             <Search className="w-4 h-4 text-slate-500" />
             <input type="text" placeholder="Search entries..." className="bg-transparent border-none text-white text-sm outline-none placeholder:text-slate-600" />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" />
            Export XLS
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Node / Reference</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Transaction Details</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right">Debit</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right">Credit</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry, i) => (
                <motion.tr 
                  key={entry.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Hash className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{entry.referenceNode}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{entry.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-semibold text-slate-200">{entry.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono italic mt-1">Acct: {entry.account}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getTypeStyle(entry.type)}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {entry.debit && (
                      <p className="text-sm font-bold text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency }).format(entry.debit)}
                      </p>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {entry.credit && (
                      <p className="text-sm font-bold text-purple-400">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency }).format(entry.credit)}
                      </p>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                      <ArrowRightLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-white/[0.02] flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
          <div className="flex items-center gap-4">
             <span>Showing Last 100 Atomic Writes</span>
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
             <span>Ledger Integrity Pulse: 100%</span>
          </div>
          <div className="flex gap-6">
            <button className="hover:text-white transition-colors">Previous</button>
            <button className="hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Ledger Analytics Component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            </div>
            <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Shadow Integrity</h5>
          </div>
          <p className="text-2xl font-light text-white mb-2 tracking-tight">Active Sync</p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="h-full w-1/3 bg-blue-500" />
          </div>
          <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-mono">MD5: F23A-991D-44C1-LK01</p>
        </div>

        <div className="md:col-span-2 glass-card p-8 bg-blue-500/5 border-blue-500/20 relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white">Immutable Audit Protocol</h4>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed italic">
                  "Every liquidity movement and FX trade generates a cryptographic journal entry. 
                  These 'shadow entries' are verified against regional bank statements every 300ms."
                </p>
              </div>
              <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/40 shrink-0">
                Generate Compliance Report
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
