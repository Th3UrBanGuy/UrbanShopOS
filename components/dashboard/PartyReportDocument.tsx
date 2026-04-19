'use client';

import React from 'react';
import { Party } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { 
  Printer, 
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PartyReportDocumentProps {
  party: Party;
  onClose?: () => void;
}

export default function PartyReportDocument({ party, onClose }: PartyReportDocumentProps) {
  const settings = useSettingsStore();

  const totalDeals = party.entries.reduce((acc, e) => acc + e.dealAmount, 0);
  const totalPaid = party.entries.reduce((acc, e) => acc + e.paidAmount, 0);
  const balance = totalDeals - totalPaid;

  const sortedEntries = [...party.entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningBalance = 0;

  return (
    <div className="bg-white text-[#1a1a1a] min-h-screen font-sans selection:bg-[#1a1a1a] selection:text-white print:p-0">
      <div className="max-w-4xl mx-auto p-4 md:p-12 relative z-10 print:max-w-none print:p-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white relative overflow-hidden"
        >
          <div className="p-8 md:p-16">
            {/* Header: Traditional Enterprise */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-12 mb-12 gap-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight text-[#1a1a1a] uppercase">
                  {settings.siteName}
                </h1>
                <div className="space-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <p>Enterprise Commerce Systems</p>
                  <p>Dhaka Industrial Sector, Bangladesh</p>
                  <p>terminal@${settings.siteName.toLowerCase().replace(/\s/g, '')}.com</p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-[#1a1a1a] mb-2">Statement of Account</h2>
                <div className="space-y-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <p>Report ID: {party.id.substring(0, 8).toUpperCase()}</p>
                  <p>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Account Information Grid */}
            <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-slate-100 pb-2">Partner Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Legal Name</p>
                    <p className="text-xl font-black text-[#1a1a1a] uppercase">{party.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contract Owner</p>
                      <p className="text-[12px] font-bold text-[#1a1a1a] uppercase">{party.owner || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Relationship Date</p>
                      <p className="text-[12px] font-bold text-[#1a1a1a] uppercase">{new Date(party.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 border-b border-slate-100 pb-2">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Liabilities</p>
                    <p className="text-lg font-bold text-[#1a1a1a] font-mono">{settings.formatPrice(totalDeals)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Remittance</p>
                    <p className="text-lg font-bold text-emerald-600 font-mono">{settings.formatPrice(totalPaid)}</p>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-slate-50">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-500">Current Balance</p>
                    <p className={cn(
                      "text-3xl font-black font-mono tracking-tighter",
                      balance > 0 ? "text-rose-600" : (balance < 0 ? "text-emerald-600" : "text-slate-900")
                    )}>
                      {settings.formatPrice(balance)}
                    </p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                      {balance > 0 ? "Credit balance due" : (balance < 0 ? "Advance credit surplus" : "Account perfectly settled")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ledger Manifest */}
            <div className="mb-20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Transition History</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-slate-200">
                    <th className="py-4 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="py-4 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="py-4 px-2 text-[9px] font-black uppercase tracking-widest text-right text-slate-400">Debit</th>
                    <th className="py-4 px-2 text-[9px] font-black uppercase tracking-widest text-right text-slate-400">Credit</th>
                    <th className="py-4 px-2 text-[9px] font-black uppercase tracking-widest text-right text-slate-400">Balance</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {sortedEntries.map((entry) => {
                    runningBalance += (entry.dealAmount - entry.paidAmount);
                    return (
                      <tr key={entry.id} className="border-b border-slate-50">
                        <td className="py-4 px-2 font-bold text-slate-500">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                        <td className="py-4 px-2 font-bold text-[#1a1a1a] uppercase tracking-tight">{entry.description}</td>
                        <td className="py-4 px-2 text-right font-mono text-slate-600">{entry.dealAmount > 0 ? settings.formatPrice(entry.dealAmount) : '—'}</td>
                        <td className="py-4 px-2 text-right font-mono text-emerald-600">{entry.paidAmount > 0 ? settings.formatPrice(entry.paidAmount) : '—'}</td>
                        <td className={cn(
                          "py-4 px-2 text-right font-black font-mono", 
                          runningBalance > 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                          {settings.formatPrice(runningBalance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Final Verification Footer */}
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Financial Document</p>
                <p className="text-[8px] text-slate-300 uppercase mt-1">UrbanShopOS Enterprise Resource Protocol</p>
              </div>
              <div className="h-px w-24 bg-slate-200 hidden md:block" />
              <div className="text-center md:text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Final Balance: {settings.formatPrice(balance)}
                </p>
                <p className="text-[8px] text-slate-300 uppercase mt-1">
                  Generated at {new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interaction Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] backdrop-blur-xl px-1 py-1 rounded-[2rem] flex items-center gap-1 z-[200] shadow-2xl border border-white/10 print:hidden"
      >
        <button 
          onClick={onClose}
          className="h-12 w-12 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-2" />
        <button 
          onClick={() => window.print()}
          className="px-8 h-12 bg-white text-black rounded-[1.8rem] font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Printer size={18} /> Execute Print
        </button>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@500;800&display=swap');
        
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden, .fixed { display: none !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .shadow-2xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
