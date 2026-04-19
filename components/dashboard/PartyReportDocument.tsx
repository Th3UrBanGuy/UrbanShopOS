'use client';

import React from 'react';
import { Party } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { Building2, User, Calendar, MapPin, Phone, Mail, Printer, X, Download, ShieldCheck, Zap } from 'lucide-react';
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
    <div className="bg-[#fdfaf6] text-slate-900 min-h-screen font-serif selection:bg-slate-900 selection:text-white print:bg-white print:p-0">
      {/* Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] print:hidden" />

      <div className="max-w-5xl mx-auto p-6 md:p-12 lg:p-16 relative z-10">
        {/* Superior Branding Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900/10 pb-8 mb-12 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white rotate-3 shadow-xl">
                 <Zap size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{settings.siteName}</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Industrial Transition OS</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              <p className="flex items-center gap-2"><MapPin size={12} className="text-slate-300" /> Sector 7-C, Industrial Area, Dhaka</p>
              <p className="flex items-center gap-2"><Phone size={12} className="text-slate-300" /> +880 (2) 5501-9283</p>
              <p className="flex items-center gap-2"><Mail size={12} className="text-slate-300" /> terminal@urbanshop.systems</p>
              <p className="flex items-center gap-2"><ShieldCheck size={12} className="text-slate-300" /> Verified Merchant Account</p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end w-full md:w-auto">
            <div className="bg-slate-900 px-6 py-3 text-white mb-4 w-full md:w-64">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Electronic Manifest ID</p>
              <p className="text-xs font-mono font-bold tracking-widest uppercase">TRN-PRTY-{party.id}-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
            <div className="space-y-1 text-left md:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Issued</p>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-tighter">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Partner Metadata */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 border-l-2 border-slate-900 pl-3">Transition Entity</h3>
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-white border-2 border-slate-900/5 flex items-center justify-center text-slate-900 shadow-sm shrink-0">
                  <Building2 size={32} strokeWidth={1} />
                </div>
                <div>
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">{party.name}</h2>
                   <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <p className="flex items-center gap-2 bg-white px-3 py-1 border border-slate-900/5">
                        <User size={12} className="text-slate-300" /> {party.owner || 'Registered Executive'}
                      </p>
                      <p className="flex items-center gap-2 bg-white px-3 py-1 border border-slate-900/5">
                        <Calendar size={12} className="text-slate-300" /> Since {new Date(party.createdAt).getFullYear()}
                      </p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 border-y border-slate-900/5 py-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
               <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger Status</p>
                 <p className={cn("text-xs font-black uppercase tracking-widest", balance > 0 ? "text-rose-600" : "text-emerald-600")}>
                   {balance > 0 ? 'CR / DEBIT PENDING' : 'ACCOUNT CLEAN'}
                 </p>
               </div>
               <div className="space-y-1">
                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Total Transactions</p>
                 <p className="text-xs font-black text-slate-900">{party.entries.length} Events</p>
               </div>
               <div className="space-y-1 hidden sm:block">
                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Asset Velocity</p>
                 <p className="text-xs font-black text-slate-900">High Frequency</p>
               </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-900 text-white p-8 space-y-8 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                <ShieldCheck size={120} />
             </div>
             <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Cumulative Debit</p>
               <p className="text-2xl font-black tracking-tight">{settings.formatPrice(totalDeals)}</p>
             </div>
             <div className="space-y-1 text-emerald-400">
               <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Cumulative Credit</p>
               <p className="text-2xl font-black tracking-tight">{settings.formatPrice(totalPaid)}</p>
             </div>
             <div className="pt-8 border-t border-white/10">
               <p className={cn(
                 "text-[9px] font-black uppercase tracking-[0.2em] mb-1",
                 balance > 0 ? "text-rose-400" : "text-emerald-400"
               )}>Final Remittance Balance</p>
               <p className={cn(
                 "text-4xl font-black tracking-tighter",
                 balance === 0 ? "text-emerald-400" : ""
               )}>{settings.formatPrice(balance)}</p>
             </div>
          </div>
        </div>

        {/* Transaction Table - Mobile Horizontal Scroll */}
        <div className="mb-20">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3">
             <span className="w-8 h-px bg-slate-900/20" /> Detailed Transaction Manifest
          </h3>
          <div className="overflow-x-auto -mx-6 px-6 no-scrollbar pb-4 md:mx-0 md:px-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-5 px-3">Sync Date</th>
                  <th className="py-5 px-3">Description of Event</th>
                  <th className="py-5 px-3 text-right">Debit (Bill)</th>
                  <th className="py-5 px-3 text-right text-emerald-600">Credit (Paid)</th>
                  <th className="py-5 px-3 text-right bg-slate-900/5">Running Ledger</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold uppercase tracking-tighter divide-y divide-slate-200">
                {sortedEntries.map((entry) => {
                  runningBalance += (entry.dealAmount - entry.paidAmount);
                  return (
                    <tr key={entry.id} className="hover:bg-white transition-colors group">
                      <td className="py-5 px-3 text-slate-400 font-mono tracking-normal">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-5 px-3 text-slate-900">{entry.description}</td>
                      <td className="py-5 px-3 text-right">{entry.dealAmount > 0 ? settings.formatPrice(entry.dealAmount) : '—'}</td>
                      <td className="py-5 px-3 text-right text-emerald-600">{entry.paidAmount > 0 ? settings.formatPrice(entry.paidAmount) : '—'}</td>
                      <td className={cn(
                        "py-5 px-3 text-right font-black bg-slate-900/[0.02] group-hover:bg-slate-900/[0.04] transition-colors", 
                        runningBalance > 0 ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {settings.formatPrice(runningBalance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {party.entries.length === 0 && (
              <div className="py-32 text-center border-b border-slate-900/5">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No Entry Streams Detected</p>
              </div>
            )}
          </div>
          {/* Mobile Scroll Indicator */}
          <div className="md:hidden mt-4 flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400 opacity-50">
             <span>Shift for Details</span>
             <div className="w-12 h-1 bg-slate-400/20 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ x: [-12, 12, -12] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1/2 h-full bg-slate-400"
                />
             </div>
          </div>
        </div>

        {/* Footer / Authority Section */}
        <div className="pt-24 border-t border-slate-900/10 flex flex-col md:flex-row justify-between items-end gap-16 pb-20">
          <div className="w-full md:w-auto">
            <div className="space-y-12">
               <div className="max-w-xs">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 pb-4 border-b border-slate-900/5">Executive Authorization</p>
                 <div className="h-1 text-center font-serif italic text-slate-300 text-sm mb-2 opacity-50 select-none">
                    Digital Signature Verified
                 </div>
                 <div className="h-px bg-slate-900/20 w-full" />
                 <p className="text-[8px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Controller of Accounts</p>
               </div>
            </div>
          </div>
          
          <div className="text-left md:text-right space-y-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-sm ml-auto">
              This document serves as an official transition record between {settings.siteName} and the transition entity. 
              Manifest generated via UrbanShopOS V1.0 - Terminal Protocol.
            </p>
            <div className="flex md:justify-end gap-4">
               <div className="w-8 h-8 border border-slate-900/10 flex items-center justify-center opacity-20">
                 <Download size={12} />
               </div>
               <div className="w-8 h-8 border border-slate-900/10 flex items-center justify-center opacity-20">
                 <ShieldCheck size={12} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Interaction Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex items-center justify-between z-50 print:hidden"
      >
        <div className="flex items-center gap-6">
           <div className="hidden sm:block">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Active Ledger</p>
              <p className="text-xs font-black text-white uppercase tracking-tighter">{party.name} · {settings.formatPrice(balance)}</p>
           </div>
           <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
           >
              <X size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Close</span>
           </button>
        </div>

        <div className="flex gap-3">
          <button 
            className="px-4 h-11 border border-white/10 text-white/80 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Download size={16} /> <span className="hidden xs:inline">Manifest</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="px-6 h-11 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Printer size={16} /> Execute Print
          </button>
        </div>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }

        .font-mono {
          font-family: 'Space Mono', monospace;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .bg-\\[\\#fdfaf6\\],
          .bg-\\[\\#fdfaf6\\] * {
            visibility: visible;
          }
          .bg-\\[\\#fdfaf6\\] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0 !important;
            background-color: white !important;
            box-shadow: none !important;
          }
          .max-w-5xl {
            max-width: 100% !important;
          }
          .fixed, .print\\:hidden {
            display: none !important;
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
