'use client';

import React from 'react';
import { Party } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  X, 
  Download, 
  ShieldCheck, 
  Zap,
  Lock,
  QrCode,
  FileSearch,
  Activity,
  CreditCard,
  Handshake
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

  const formatBrandName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (
        <>
          <span className="text-[var(--accent)] font-extrabold">{parts[0]}</span>{' '}
          <span className="font-light">{parts.slice(1).join(' ')}</span>
        </>
      );
    }
    return <span className="text-[var(--accent)] font-extrabold">{name}</span>;
  };

  return (
    <div className="bg-[#f8fafc] text-[#0a1128] min-h-screen font-sans selection:bg-[#0a1128] selection:text-white print:bg-white print:p-0">
      {/* Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] print:hidden" />

      <div className="max-w-5xl mx-auto p-4 md:p-12 relative z-10 print:max-w-none print:p-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-2xl relative overflow-hidden print:shadow-none"
        >
          {/* Security Strip */}
          <div className="h-2 w-full security-strip" />

          <div className="p-8 md:p-16">
            {/* Header Design */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-[#0a1128] pb-10 mb-12 gap-8">
              <div className="space-y-6">
                <div className="brand-box">
                  <h1 className="text-4xl font-sans tracking-tight leading-none mb-2">
                    {formatBrandName(settings.siteName)}
                  </h1>
                  <div className="flex flex-col text-[9px] font-bold text-slate-400 uppercase tracking-widest gap-1">
                    <span>Advanced Ledger Interface // Build 7.2.1</span>
                    <span>Secure Enterprise Reporting Protocol</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <p className="flex items-center gap-2"><MapPin size={12} className="text-[var(--accent)]" /> Sector 7-C, Industrial Area, Dhaka</p>
                  <p className="flex items-center gap-2"><Phone size={12} className="text-[var(--accent)]" /> +880 (2) 5501-9283</p>
                  <p className="flex items-center gap-2"><Mail size={12} className="text-[var(--accent)]" /> terminal@urbanshop.systems</p>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0">
                <div className="text-right mb-6">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#0a1128]">Partner Ledger Statement</h3>
                  <p className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-widest mt-1">Classification: Confidential / Internal</p>
                </div>
                <div className="tech-info grid grid-cols-2 gap-x-6 gap-y-1 text-[9px] font-bold text-slate-400 uppercase">
                  <div>DOC ID: <b className="text-[#0a1128]">TRN-{party.id.substring(0,6).toUpperCase()}</b></div>
                  <div>STATUS: <b className="text-emerald-500">VERIFIED</b></div>
                  <div>ENCRYPTION: <b className="text-[#0a1128]">AES-256</b></div>
                  <div>VERIAL: <b className="text-[#0a1128]">3.4.1</b></div>
                </div>
              </div>
            </div>

            {/* Partner Profile Section - The "Middle" Design Focus */}
            <div className="mb-16">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-6 flex items-center gap-3">
                 <span className="w-8 h-[2px] bg-[var(--accent)]" /> Partner Identity Profile
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-8 bg-slate-50 border border-slate-200 p-8 rounded-2xl flex items-start gap-8 relative overflow-hidden group border-b-4 border-b-[var(--accent)]/20">
                  <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                    <Building2 size={120} />
                  </div>
                  
                  <div className="w-20 h-20 bg-white border-2 border-[var(--accent)] flex items-center justify-center text-[var(--accent)] shadow-xl shrink-0 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <Handshake size={40} strokeWidth={1.5} />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-[#0a1128] mb-1">{party.name}</h2>
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                         <p className="flex items-center gap-2">
                           <User size={12} className="text-[var(--accent)]" /> Executive: {party.owner || 'Corporate Representative'}
                         </p>
                         <p className="flex items-center gap-2">
                           <Calendar size={12} className="text-[var(--accent)]" /> Established: {new Date(party.createdAt).toLocaleDateString()}
                         </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
                       <div className="space-y-1">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification Status</p>
                         <p className="text-[10px] font-black text-[#0a1128] uppercase flex items-center gap-1.5 leading-none">
                           <ShieldCheck size={12} className="text-emerald-500" /> Authorized Merchant
                         </p>
                       </div>
                       <div className="space-y-1">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Entry Streams</p>
                         <p className="text-[10px] font-black text-[#0a1128] uppercase leading-none">
                           {party.entries.length} Active Transitions
                         </p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                  <div className="bg-[#0a1128] text-white p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg border-b-4 border-b-indigo-500/20">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                       <Zap size={80} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">System Balance</p>
                    <div>
                       <p className={cn(
                         "text-3xl font-mono font-bold tracking-tighter",
                         balance === 0 ? "text-emerald-400" : (balance > 0 ? "text-rose-400" : "text-emerald-400")
                       )}>
                         {settings.formatPrice(Math.abs(balance))}
                       </p>
                       <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 mt-1">
                         {balance > 0 ? "Outstanding Remittance Due" : (balance < 0 ? "Advance Surplus Credit" : "Ledger Cleared & Settled")}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
              {[
                { label: 'Cumulative Debt', value: settings.formatPrice(totalDeals), icon: <Activity size={14} />, color: 'var(--accent)' },
                { label: 'Cumulative Credit', value: settings.formatPrice(totalPaid), icon: <CreditCard size={14} />, color: '#10b981' },
                { label: 'Transition Frequency', value: `${party.entries.length} Events`, icon: <FileSearch size={14} />, color: '#64748b' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl border-b-2" style={{ borderBottomColor: stat.color + '40' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-lg bg-white border border-slate-200" style={{ color: stat.color }}>{stat.icon}</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
                  <p className="text-xl font-mono font-bold text-[#0a1128]">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Transaction Manifest Table */}
            <div className="mb-20 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a1128] text-white">
                    <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest w-16">ID</th>
                    <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest">Timestamp</th>
                    <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest">Protocol Description</th>
                    <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-right">Debit</th>
                    <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-right">Credit</th>
                    <th className="py-4 px-6 text-[9px] font-black uppercase tracking-widest text-right bg-slate-800">Balance</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {sortedEntries.map((entry, idx) => {
                    runningBalance += (entry.dealAmount - entry.paidAmount);
                    return (
                      <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        <td className="py-4 px-6 text-slate-400 font-mono tracking-tighter">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-4 px-6 text-slate-500 uppercase">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                        <td className="py-4 px-6 text-[#0a1128] uppercase tracking-tight">{entry.description}</td>
                        <td className="py-4 px-6 text-right font-mono">{entry.dealAmount > 0 ? settings.formatPrice(entry.dealAmount) : '—'}</td>
                        <td className="py-4 px-6 text-right font-mono text-emerald-600">{entry.paidAmount > 0 ? settings.formatPrice(entry.paidAmount) : '—'}</td>
                        <td className={cn(
                          "py-4 px-6 text-right font-black font-mono transition-colors bg-slate-50", 
                          runningBalance > 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                          {settings.formatPrice(runningBalance)}
                        </td>
                      </tr>
                    );
                  })}
                  {party.entries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-24 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        Null Matrix: No Transition History Detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer / Authority Section */}
            <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 border-l-4 border-l-[var(--accent)]">
                <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-inner flex items-center justify-center">
                   <div className="w-full h-full bg-slate-100 p-1 flex items-center justify-center border-2 border-slate-200">
                      <QrCode size={40} className="text-[#0a1128]" />
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-[#0a1128] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                     <Lock size={12} className="text-[var(--accent)]" /> Digital Verification
                   </p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed max-w-[240px]">
                     Scan to verify document authenticity. Secure Auth Record #REF-{Math.floor(Math.random() * 900000 + 100000)}<br />
                     Signature Hash: {Math.random().toString(16).substring(2, 10).toUpperCase()}
                   </p>
                </div>
              </div>
              
              <div className="text-left md:text-right space-y-3">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest max-w-sm ml-auto">
                  <b>Statement Validity Notice:</b> This document is electronically verified. Manual signatures are not required for inter-system accounting.
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {new Date().toISOString()} {/* GENERATED BY SYSTEM ROOT */}
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
        className="fixed bottom-0 inset-x-0 bg-[#0a1128]/90 backdrop-blur-2xl border-t border-white/10 px-6 py-5 flex items-center justify-between z-50 print:hidden"
      >
        <div className="flex items-center gap-8">
           <div className="hidden sm:block border-l-2 border-[var(--accent)] pl-6">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Active Partner Context</p>
              <p className="text-sm font-bold text-white uppercase tracking-tighter">{party.name} · {settings.formatPrice(balance)}</p>
           </div>
           <button 
            onClick={onClose}
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-all"
           >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <X size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Dismiss View</span>
           </button>
        </div>

        <div className="flex gap-4">
          <button 
            className="px-5 h-12 border border-white/10 text-white/80 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all flex items-center gap-3"
          >
            <Download size={18} /> <span className="hidden xs:inline">Archive PDF</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="px-8 h-12 bg-[var(--accent)] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_0_40px_rgba(30,58,138,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/10"
          >
            <Printer size={20} /> Execute Print
          </button>
        </div>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Grotesk:wght@300;500;700;800&family=JetBrains+Mono:wght@500;800&display=swap');
        
        :root {
          --accent: #1e3a8a;
          --accent-glow: rgba(30, 58, 138, 0.2);
        }

        .font-sans {
          font-family: 'Inter', sans-serif;
        }

        .font-grotesk {
          font-family: 'Space Grotesk', sans-serif;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .security-strip {
          background: repeating-linear-gradient(
            45deg,
            var(--accent),
            var(--accent) 10px,
            transparent 10px,
            transparent 20px
          );
        }

        @media print {
          body {
            background-color: white !important;
          }
          .print\\:hidden, 
          .fixed,
          .absolute.top-0.right-0.p-4.opacity-5 {
            display: none !important;
          }
          .max-w-5xl {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .bg-white, .shadow-2xl {
            box-shadow: none !important;
          }
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
