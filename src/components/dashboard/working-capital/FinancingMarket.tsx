import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { treasuryService } from '../../../services/treasuryService';
import { Supplier, FinancingBid, Invoice } from '../../../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  GanttChart, 
  Clock, 
  DollarSign, 
  ChevronRight,
  TrendingUp,
  CircleDollarSign,
  Briefcase
} from 'lucide-react';

export default function FinancingMarket() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [bids, setBids] = useState<FinancingBid[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supData, bidData] = await Promise.all([
          treasuryService.getSuppliers(),
          treasuryService.getFinancingBids()
        ]);
        setSuppliers(supData);
        // Matching Logic: Lowest Rate, then FIFO
        const sortedBids = [...(bidData || [])].sort((a, b) => {
          if (a.apr !== b.apr) return a.apr - b.apr;
          return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
        });
        setBids(sortedBids);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">Financing <span className="font-semibold">Market</span></h2>
          <p className="text-slate-400">Institutional liquidity bridge for invoice discounting and dynamic bids.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 glass-card bg-emerald-500/5 border-emerald-500/20 text-center">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Avg Discount APR</p>
              <p className="text-xl font-bold text-white">4.38%</p>
           </div>
           <div className="px-6 py-3 glass-card bg-blue-500/5 border-blue-500/20 text-center">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Market Depth</p>
              <p className="text-xl font-bold text-white">$2.4B</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {/* Marketplace List */}
        <div className="col-span-2 space-y-8">
          <div className="glass-card overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Approved Invoices</span>
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{suppliers.length} active suppliers</span>
            </div>
            
            <div className="divide-y divide-white/5">
              {suppliers.map(sup => (
                <div key={sup.id}>
                  <div className="p-6 bg-white/[0.01] flex items-center gap-4 border-b border-white/5">
                    <Briefcase className="w-4 h-4 text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{sup.name}</span>
                  </div>
                  {sup.invoices.map(inv => (
                    <div 
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`p-8 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer group ${selectedInvoice?.id === inv.id ? 'bg-blue-500/[0.03] border-l-2 border-blue-500' : ''}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${inv.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{inv.invoiceNumber}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-mono text-slate-600">Due: {inv.dueDate}</span>
                            <span className="text-slate-800">•</span>
                            <span className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest">{inv.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Capitalization</p>
                          <p className="text-lg font-bold text-white mt-1">{formatCurrency(inv.amount, inv.currency)}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-700 group-hover:translate-x-1 group-hover:text-white transition-all ${selectedInvoice?.id === inv.id ? 'text-white' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Bid Interface */}
        <div className="col-span-1 space-y-8">
           <AnimatePresence mode="wait">
             {selectedInvoice ? (
               <motion.div 
                key="bid-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card p-10 border-blue-500/20 bg-blue-500/[0.02]"
               >
                 <div className="mb-10">
                   <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white tracking-tight">Bid Intelligence</h3>
                   </div>
                   <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Selected Invoice</p>
                      <p className="text-sm font-bold text-white">{selectedInvoice.invoiceNumber}</p>
                      <p className="text-2xl font-light text-blue-400 mt-2">{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</p>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Institution Bids</p>
                   {bids.map(bid => (
                     <div key={bid.id} className="p-6 glass-card bg-white/[0.02] border-white/5 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-xs font-bold text-white">{bid.financierName}</span>
                           <span className="text-[10px] font-bold text-emerald-400">{bid.apr}% APR</span>
                        </div>
                        <div className="flex justify-between items-end">
                           <div>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Est. Cost</p>
                              <p className="text-lg font-bold text-white">{formatCurrency(bid.totalCost)}</p>
                           </div>
                           <button className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all">Accept</button>
                        </div>
                     </div>
                   ))}
                 </div>

                 <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-500 italic leading-relaxed">
                      "Dynamic Discounting logic calculated based on 18 days paid early. Rate locked based on corporate credit rating of Anchor Buyer (AAA)."
                    </p>
                 </div>
               </motion.div>
             ) : (
               <motion.div 
                key="select-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10"
               >
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <CircleDollarSign className="w-8 h-8 text-slate-600" />
                 </div>
                 <h4 className="text-lg font-semibold text-slate-400">Select an invoice to view <br /> market depth</h4>
                 <p className="text-xs text-slate-600 mt-4 leading-relaxed">Institutions are ready to provide liquidity at rates between 3.8% and 4.9%.</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
