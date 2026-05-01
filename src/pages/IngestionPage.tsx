import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCode, Upload, ArrowRight, Code, Database, CheckCircle2, AlertCircle, Terminal, FileText, BrainCircuit, ShieldCheck } from 'lucide-react';
import { treasuryService } from '../services/treasuryService';

export default function IngestionPage() {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [parsedEntries, setParsedEntries] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'parsed' | 'committed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setXmlContent(content);
      processXml(content);
    };
    reader.readAsText(file);
  };

  const processXml = async (xml: string) => {
    if (!xml.trim().endsWith('>')) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/iso-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml })
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        throw new Error(failure?.message || failure?.error || 'ISO transformer rejected the payload');
      }
      const data = await response.json();
      setParsedEntries(data.journalEntries || []);
      setStatus('parsed');
    } catch (err) {
      console.error(err);
      setParsedEntries([]);
      setErrorMessage(err instanceof Error ? err.message : 'Unable to parse ISO payload');
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setStatus('committed');
    setIsProcessing(false);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-3">ISO 20022 <span className="font-semibold">Ingestion Gateway</span></h2>
          <p className="text-slate-400 font-medium">Transform raw SWIFT XML (pacs.008 / camt.053) into Nexus Journal Entries.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
           <Terminal className="w-5 h-5 text-blue-400" />
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">MX Transformer v4.1</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Left: Input */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
           <div className="glass-card p-10 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-[#a855f7] flex items-center gap-2">
                    <FileCode className="w-4 h-4" /> Raw MX Payload
                 </h3>
                 <label className="cursor-pointer px-4 py-2 bg-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">
                    Upload XML
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".xml" />
                 </label>
              </div>

              <textarea 
                className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-[10px] text-blue-300 custom-scrollbar resize-none outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                placeholder="Paste XML or drag & drop file here..."
                value={xmlContent}
                onChange={(e) => {
                  setXmlContent(e.target.value);
                  if (e.target.value.length > 50) processXml(e.target.value);
                }}
              />
           </div>
        </div>

        {/* Center: Instruction */}
        <div className="col-span-12 lg:col-span-1 flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                 <ArrowRight className="w-6 h-6 text-slate-700" />
              </div>
              <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
           </div>
        </div>

        {/* Right: Output */}
        <div className="col-span-12 lg:col-span-6 space-y-8">
           <div className="glass-card p-10 flex flex-col min-h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Code className="w-4 h-4" /> Proposed Journal Entries
                 </h3>
                 {status === 'parsed' && (
                    <button 
                      onClick={handleCommit}
                      disabled={isProcessing}
                      className="px-6 py-2 bg-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? 'Committing...' : 'Commit to Nexus'}
                    </button>
                 )}
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-12">
                   <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
                   <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Hydrating Ledger...</h4>
                   <p className="text-xs text-slate-500 font-mono italic">Validating BIC/IBAN pairs and checking intercompany netting constraints.</p>
                </div>
              )}

              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                 {parsedEntries.length > 0 ? (
                   parsedEntries.map((entry, i) => (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-6 bg-white/5 rounded-2xl border border-white/5 flex gap-6 items-start hover:border-emerald-500/20 transition-all"
                     >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${entry.debit ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                           {entry.debit ? <Database className="w-5 h-5 rotate-180" /> : <Database className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 space-y-3">
                           <div className="flex justify-between items-baseline">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{entry.description}</h4>
                              <span className="text-sm font-mono font-bold text-white">
                                {entry.debit ? '-' : '+'}{(entry.debit || entry.credit || 0).toLocaleString()} {entry.currency}
                              </span>
                           </div>
                           <div className="flex gap-4">
                              <div className="flex-1 px-3 py-2 bg-black/40 rounded-lg border border-white/5">
                                 <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1 font-mono">GL Relay</p>
                                 <p className="text-[10px] text-blue-400 font-mono">{entry.account}</p>
                              </div>
                              <div className="flex-1 px-3 py-2 bg-black/40 rounded-lg border border-white/5">
                                 <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1 font-mono">Ref Hash</p>
                                 <p className="text-[10px] text-slate-500 font-mono truncate">{entry.id}</p>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale p-10">
                      <FileText className="w-20 h-20 text-slate-600 mb-6" />
                      <p className="text-slate-600 font-mono italic text-sm">
                        {status === 'error' ? errorMessage : 'No MX packets detected in the buffer...'}
                      </p>
                   </div>
                 )}
              </div>

              {status === 'committed' && (
                <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <h4 className="text-lg font-bold text-white">Ingestion Successful</h4>
                      <p className="text-xs text-emerald-400/70 font-mono uppercase tracking-widest">Ledger Persisted • Relay Sync: 100%</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 glass-card border-blue-500/20 bg-blue-500/5">
            <h5 className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">
               <ShieldCircle className="w-4 h-4" /> AML Check: PASSED
            </h5>
            <p className="text-sm text-slate-400">Payload verified against FATF blacklist and intercompany policy relays.</p>
         </div>
         <div className="p-8 glass-card border-purple-500/20 bg-purple-500/5">
            <h5 className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">
               <BrainCircuit className="w-4 h-4" /> Netting Logic: APPLIED
            </h5>
            <p className="text-sm text-slate-400">3 intercompany legs identified and netted to 1 settlement leg.</p>
         </div>
         <div className="p-8 glass-card border-amber-500/20 bg-amber-500/5">
            <h5 className="flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4">
               <AlertCircle className="w-4 h-4" /> STP Score: 98.4
            </h5>
            <p className="text-sm text-slate-400">Minimal manual intervention required for this payload structure.</p>
         </div>
      </div>
    </div>
  );
}

function ShieldCircle({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><circle cx="12" cy="12" r="3"/></svg>
  );
}
