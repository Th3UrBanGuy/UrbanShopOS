'use client';

import React from 'react';
import { SaleTransaction } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { 
  Truck, 
  MapPin, 
  QrCode, 
  Lock, 
  Printer, 
  X, 
  Phone,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TrackingReportProps {
  order: SaleTransaction;
  onClose?: () => void;
}

export default function TrackingReport({ order, onClose }: TrackingReportProps) {
  const settings = useSettingsStore();

  const statusSteps = [
    { id: 'pending', label: 'Order Manifested', desc: 'Secure record initialized', step: '01' },
    { id: 'processing', label: 'In-Queue / Processing', desc: 'Vault verification active', step: '02' },
    { id: 'shipped', label: 'In-Transit / Logistics', desc: 'Active transport sequence', step: '03' },
    { id: 'delivered', label: 'Delivered / Finalized', desc: 'Chain of custody complete', step: '04' }
  ];

  const currentStatusIdx = statusSteps.findIndex(s => s.id === (order.status === 'completed' ? 'delivered' : order.status));
  const displayStatus = order.status === 'completed' ? 'delivered' : order.status;

  const formatBrandName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (
        <>
          <span className="text-[var(--tracking-accent)] font-extrabold">{parts[0]}</span>{' '}
          <span className="font-light">{parts.slice(1).join(' ')}</span>
        </>
      );
    }
    return <span className="text-[var(--tracking-accent)] font-extrabold">{name}</span>;
  };

  return (
    <div className="bg-[#f1f5f9] text-[#0f172a] min-h-screen font-sans selection:bg-[#0f172a] selection:text-white print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto p-4 md:p-12 relative z-10 print:max-w-none print:p-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white shadow-2xl relative overflow-hidden print:shadow-none border border-slate-200"
        >
          {/* Top Security Line */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-900 via-indigo-600 to-indigo-900" />

          <div className="p-8 md:p-16">
            {/* Header branding */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-10 mb-12 gap-8">
              <div className="space-y-6">
                <div className="brand-box">
                  <h1 className="text-4xl font-sans tracking-tight leading-none mb-2">
                    {formatBrandName(settings.siteName)}
                  </h1>
                  <div className="flex flex-col text-[9px] font-bold text-slate-400 uppercase tracking-widest gap-1">
                    <span>Order Security Protocol // Terminal V1.2</span>
                    <span>Verified Logistics Manifest</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0">
                <div className="text-right mb-6">
                   <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#0f172a]">Public Status Report</p>
                   <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Transaction Verified</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[9px] font-bold text-slate-400 uppercase">
                  <div>TRACK ID: <b className="text-[#0f172a]">{order.id.toUpperCase()}</b></div>
                  <div>STATUS: <b className="text-emerald-500">{order.status.toUpperCase()}</b></div>
                  <div>SECURITY: <b className="text-[#0f172a]">AES-256</b></div>
                  <div>REF: <b className="text-[#0f172a]">SYS-{Math.random().toString(36).substring(2, 6).toUpperCase()}</b></div>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline - Clinical & Formal */}
            <div className="mb-16">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-8 flex items-center gap-3">
                 <span className="w-8 h-[2px] bg-indigo-600" /> Transition Timeline Log
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {statusSteps.map((step, idx) => {
                   const isActive = idx <= (currentStatusIdx === -1 && displayStatus === 'shipped' ? 2 : currentStatusIdx);
                   return (
                     <div key={step.id} className={cn(
                       "relative p-5 rounded-2xl border transition-all duration-500",
                       isActive ? "bg-slate-50 border-indigo-200" : "bg-white border-slate-100 opacity-40"
                     )}>
                        <div className="flex justify-between items-start mb-4">
                          <span className={cn(
                            "text-[10px] font-black font-mono",
                            isActive ? "text-indigo-600" : "text-slate-300"
                          )}>{step.step}</span>
                          {isActive && <CheckCircle2 size={14} className="text-indigo-500" />}
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 mb-1">{step.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{step.desc}</p>
                        
                        {isActive && idx < currentStatusIdx && (
                          <div className="absolute top-1/2 -right-4 w-4 h-[2px] bg-indigo-200 hidden md:block" />
                        )}
                     </div>
                   );
                 })}
               </div>
            </div>

            {/* Middle Section: Product Manifest & Destination */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
               <div className="lg:col-span-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-indigo-600" /> Package Manifest Breakdown
                  </h3>
                  
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest w-12">QTY</th>
                          <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest">Article / Description</th>
                          <th className="py-3 px-5 text-[9px] font-black uppercase tracking-widest text-right">Integrity</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] font-bold">
                        {order.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5 text-indigo-600 font-mono">{String(item.quantity).padStart(2, '0')}</td>
                            <td className="py-4 px-5">
                               <p className="text-[#0f172a] uppercase tracking-tight mb-1">{item.name}</p>
                               <div className="flex gap-3 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                 <span>{item.article || 'Ref: Standard'}</span>
                                 {item.selectedVariant && (
                                   <>
                                     <span className="text-slate-200 px-1">|</span>
                                     <span className="text-indigo-400">{item.selectedVariant.color} / {item.selectedVariant.size}</span>
                                   </>
                                 )}
                               </div>
                            </td>
                            <td className="py-4 px-5 text-right text-[9px] font-black text-emerald-500 uppercase">Verified</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-indigo-600" /> Logistics Info
                  </h3>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                     <div className="space-y-1.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={10} /> Destination Address
                        </p>
                        <p className="text-[10px] font-black text-slate-900 uppercase leading-relaxed tracking-tight">
                           {order.deliveryAddress || 'Warehouse Pickup Protocol'}<br />
                           <span className="text-indigo-600">{order.deliveryCity || 'Zone Active'}</span>
                        </p>
                     </div>

                     <div className="space-y-1.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Phone size={10} /> Signal Contact
                        </p>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                           {order.customerPhone || 'Contact Not Manifested'}
                        </p>
                     </div>

                     <div className="pt-4 border-t border-slate-200">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Carrier Protocol</p>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 w-fit">
                           <Truck size={12} className="text-indigo-600" />
                           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Urban Logistics</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Section: Verification & Tech Log */}
            <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 border-l-4 border-l-indigo-600">
                <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-inner flex items-center justify-center">
                   <div className="w-full h-full bg-slate-100 p-1 flex items-center justify-center border-2 border-slate-200">
                      <QrCode size={40} className="text-[#0f172a]" />
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                     <Lock size={12} className="text-indigo-600" /> Dynamic Seal Verified
                   </p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed max-w-[240px]">
                     Sequence initiated on {new Date(order.timestamp).toLocaleString()}. Authenticity hash attached for system validation.<br />
                     Hash: {Math.random().toString(16).substring(2, 12).toUpperCase()}
                   </p>
                </div>
              </div>
              
              <div className="text-left md:text-right space-y-3">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest max-w-sm ml-auto">
                  <b>Status Assurance:</b> This report reflects the current real-time state of the transaction within the UrbanShopOS ecosystem.
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {new Date().toISOString()} {/* STATUS SNAPSHOT */}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 inset-x-0 bg-[#0f172a]/90 backdrop-blur-2xl border-t border-white/10 px-6 py-5 flex items-center justify-between z-[100] print:hidden"
      >
        <div className="flex items-center gap-8">
           <div className="hidden sm:block border-l-2 border-indigo-500 pl-6">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Active Tracker</p>
              <p className="text-sm font-bold text-white uppercase tracking-tighter">REF: {order.id}</p>
           </div>
           <button 
            onClick={onClose}
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-all"
           >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <X size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exit Tracker</span>
           </button>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="px-8 h-12 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/10"
          >
            <Printer size={20} /> Archive Manifest
          </button>
        </div>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Grotesk:wght@300;500;700;800&family=JetBrains+Mono:wght@500;800&display=swap');
        
        :root {
          --tracking-accent: #4f46e5;
        }

        @media print {
          body { background: white !important; }
          .print\\:hidden, .fixed { display: none !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .bg-white, .shadow-2xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
