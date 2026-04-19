'use client';

import React from 'react';
import { Party, DealEntry } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { Building2, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';

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
    <div className="bg-white text-slate-900 p-8 md:p-12 min-h-screen font-serif print:p-0 print:m-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b-4 border-slate-900 pb-8 gap-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">{settings.siteName}</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-6">Partner Transaction Report</p>
          
          <div className="space-y-1 text-sm font-bold text-slate-600 uppercase">
            <p className="flex items-center gap-2"><MapPin size={14} /> 123 Industrial Hub, Dhaka</p>
            <p className="flex items-center gap-2"><Phone size={14} /> +880 1234 567890</p>
            <p className="flex items-center gap-2"><Mail size={14} /> support@urbanshop.os</p>
          </div>
        </div>

        <div className="text-right md:w-64">
          <div className="bg-slate-900 text-white p-4 rounded-lg mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
            <p className="text-xl font-black uppercase tracking-tight">
              {balance > 0 ? 'Payment Pending' : 'Account Settled'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Generated</p>
            <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Party Info Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10 py-10 border-b border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Details</p>
              <h2 className="text-xl font-black uppercase text-slate-900">{party.name}</h2>
            </div>
          </div>
          <div className="pl-13 text-sm font-bold text-slate-600 uppercase">
            <p className="flex items-center gap-2 mb-1"><User size={14} className="opacity-40" /> Owner: {party.owner || 'N/A'}</p>
            <p className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> Member Since: {new Date(party.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Bill</p>
            <p className="text-xl font-black text-slate-900">{settings.formatPrice(totalDeals)}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">Total Paid</p>
            <p className="text-xl font-black text-emerald-600">{settings.formatPrice(totalPaid)}</p>
          </div>
          <div className={cn(
            "p-4 rounded-xl border col-span-2 flex justify-between items-center",
            balance > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
          )}>
            <p className={cn("text-[10px] font-black uppercase tracking-widest", balance > 0 ? "text-rose-600/60" : "text-emerald-600/60")}>Outstanding Balance</p>
            <p className={cn("text-2xl font-black", balance > 0 ? "text-rose-600" : "text-emerald-600")}>{settings.formatPrice(balance)}</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="mb-12">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 ml-1">Transaction History</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="py-4 px-2">Date</th>
              <th className="py-4 px-2">Description</th>
              <th className="py-4 px-2 text-right">Bill Amt</th>
              <th className="py-4 px-2 text-right text-emerald-600">Paid Amt</th>
              <th className="py-4 px-2 text-right">Running Bal.</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold divide-y divide-slate-100">
            {sortedEntries.map((entry) => {
              runningBalance += (entry.dealAmount - entry.paidAmount);
              return (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-2 text-slate-500">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="py-4 px-2 uppercase">{entry.description}</td>
                  <td className="py-4 px-2 text-right">{entry.dealAmount > 0 ? settings.formatPrice(entry.dealAmount) : '-'}</td>
                  <td className="py-4 px-2 text-right text-emerald-600">{entry.paidAmount > 0 ? settings.formatPrice(entry.paidAmount) : '-'}</td>
                  <td className={cn("py-4 px-2 text-right font-black", runningBalance > 0 ? "text-rose-600" : "text-emerald-600")}>
                    {settings.formatPrice(runningBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {party.entries.length === 0 && (
          <div className="py-20 text-center border-b border-slate-100">
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No transactions recorded</p>
          </div>
        )}
      </div>

      {/* Footer / Signature */}
      <div className="mt-auto pt-20 flex justify-between items-end gap-12">
        <div className="flex-1 border-t border-slate-200 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Authorized Signature</p>
          <div className="h-10 border-b border-dashed border-slate-300 w-48" />
        </div>
        
        <div className="text-right flex-1 border-t border-slate-200 pt-4">
          <p className="text-[8px] font-bold text-slate-400 uppercase leading-loose">
            Thank you for being a valued partner of {settings.siteName}. <br />
            This is a computer-generated account statement and does not require a physical stamp. <br />
            For any discrepancies, please contact our support within 7 business days.
          </p>
        </div>
      </div>

      {/* Print Hide Controls */}
      <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
        <button 
          onClick={() => window.print()}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          Confirm Print
        </button>
        <button 
          onClick={onClose}
          className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white.text-slate-900,
          .bg-white.text-slate-900 * {
            visibility: visible;
          }
          .bg-white.text-slate-900 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
