'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Globe, 
  CreditCard, 
  ChevronLeft,
  Monitor,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Box,
  LayoutGrid,
  Zap,
  Printer
} from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { cn } from '@/lib/utils';
import { useSalesStore } from '@/store/salesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { SaleTransaction } from '@/types';
import { printReceipt } from '@/lib/printReceipt';

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SalesView() {
  const { transactions, updateStatus } = useSalesStore();
  const settings = useSettingsStore();
  const [selectedOrder, setSelectedOrder] = useState<SaleTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pos' | 'online'>('all');

  const filteredTransactions = transactions.filter(tx => 
    activeTab === 'all' || tx.channel === activeTab
  );

  const totalRev = filteredTransactions.reduce((acc, tx) => acc + tx.total, 0);
  const avgValue = filteredTransactions.length > 0 ? totalRev / filteredTransactions.length : 0;
  
  const todayStr = new Date().toDateString();
  const todayRev = filteredTransactions
    .filter(t => new Date(t.timestamp).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.total, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRev = filteredTransactions
    .filter(t => new Date(t.timestamp) >= weekAgo)
    .reduce((sum, t) => sum + t.total, 0);

  const getPaymentColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card': return 'indigo';
      case 'cash': return 'emerald';
      case 'wallet': return 'purple';
      case 'online payment': return 'cyan';
      default: return 'rose';
    }
  };

  const statusIcons = {
    pending: <Clock size={12} />,
    processing: <Zap size={12} />,
    shipped: <Truck size={12} />,
    delivered: <CheckCircle2 size={12} />,
    completed: <CheckCircle2 size={12} />,
  };

  const handlePrint = (tx: SaleTransaction) => {
    printReceipt(tx, settings);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden relative">
      
      {/* Left: Sales Stream */}
      <div className={cn(
        "flex-1 flex flex-col gap-6 h-full overflow-hidden",
        selectedOrder ? "hidden lg:flex" : "flex"
      )}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
          {[
            { label: 'PoS Revenue', value: settings.formatPrice(transactions.filter(t => t.channel === 'pos').reduce((s, t) => s + t.total, 0)), icon: <Monitor size={14} />, color: 'indigo' },
            { label: 'Site Revenue', value: settings.formatPrice(transactions.filter(t => t.channel === 'online').reduce((s, t) => s + t.total, 0)), icon: <Globe size={14} />, color: 'cyan' },
            { label: 'Today\'s Sales', value: settings.formatPrice(todayRev), icon: <Users size={14} />, color: 'emerald' },
            { label: 'Total Orders', value: filteredTransactions.length.toString(), icon: <ShoppingBag size={14} />, color: 'purple' },
            { label: 'Avg Order', value: settings.formatPrice(avgValue), icon: <Zap size={14} />, color: 'amber' },
          ].map((stat, i) => (
            <ResinCard key={i} className="p-3" glowingColor={`var(--color-${stat.color}-500)`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("p-1 rounded-lg border border-white/5 shadow-inner bg-white/5", `text-${stat.color}-400`)}>{stat.icon}</div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 truncate">{stat.label}</span>
              </div>
              <p className="text-sm sm:text-base font-black tracking-tight">{stat.value}</p>
            </ResinCard>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
               {[
                 { id: 'all', label: 'All Sales', icon: <LayoutGrid size={14} /> },
                 { id: 'pos', label: 'Terminal / PoS', icon: <Monitor size={14} /> },
                 { id: 'online', label: 'Store Orders', icon: <Globe size={14} /> },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={cn(
                     "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     activeTab === tab.id 
                       ? "bg-white text-black shadow-resin" 
                       : "text-white/30 hover:text-white/60 hover:bg-white/5"
                   )}
                 >
                   {tab.icon}
                   <span className="hidden sm:inline">{tab.label}</span>
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               LIVE
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-32">
            {filteredTransactions.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-white/10 border-2 border-dashed border-white/5 rounded-[3rem]">
                <Package size={48} className="mb-4" />
                 <p className="font-black tracking-[0.3em] uppercase text-xs">No orders found</p>
              </div>
            ) : (
              filteredTransactions.map((tx, i) => {
                const color = getPaymentColor(tx.paymentMethod);
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedOrder(tx)}
                    className={cn(
                      "p-5 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group flex items-center justify-between relative overflow-hidden",
                      selectedOrder?.id === tx.id 
                        ? "bg-white/10 border-white/20 shadow-resin" 
                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
                    )}
                  >
                    <div className="flex items-center gap-5 min-w-0 relative z-10">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-resin border border-white/10 shrink-0",
                         tx.channel === 'pos' ? "bg-indigo-500/20 text-indigo-400" : "bg-cyan-500/20 text-cyan-400"
                       )}>
                         {tx.channel === 'pos' ? <Monitor size={20} /> : <Globe size={20} />}
                       </div>
                       <div className="min-w-0">
                         <h4 className="text-sm font-black tracking-tight truncate uppercase">{tx.customerName || 'Walk-in Customer'}</h4>
                         <div className="flex items-center gap-3">
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{tx.id}</p>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{formatTimeAgo(tx.timestamp)}</p>
                         </div>
                       </div>
                    </div>

                    <div className="text-right shrink-0 relative z-10 flex flex-col items-end gap-1.5">
                      <p className="text-base font-black tracking-tighter">{settings.formatPrice(tx.total)}</p>
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                           tx.status === 'completed' || tx.status === 'delivered'
                             ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                             : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                         )}>
                            {tx.status}
                         </span>
                      </div>
                    </div>

                    {/* Background Subtle Gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                      tx.channel === 'pos' ? "from-indigo-500/5 to-transparent" : "from-cyan-500/5 to-transparent"
                    )} />
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right: Detailed Spotlight */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
              "w-full lg:w-[450px] h-full flex flex-col gap-6",
              "fixed inset-0 z-50 p-4 bg-[#050508]/90 backdrop-blur-3xl lg:bg-transparent lg:relative lg:p-0 lg:z-auto"
            )}
          >
            <div className="flex items-center gap-4 lg:hidden mb-2 shrink-0">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-black tracking-tight uppercase">Order Details</h2>
            </div>

            <ResinCard className="p-8 flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" glowingColor="rgba(255,255,255,0.05)">
                <div className="flex items-center justify-between mb-8 shrink-0">
                   <div className={cn(
                     "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                     selectedOrder.channel === 'pos' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                   )}>
                      {selectedOrder.channel === 'pos' ? <Monitor size={12} /> : <Globe size={12} />}
                      {selectedOrder.channel}
                   </div>
                   <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                      {new Date(selectedOrder.timestamp).toLocaleString()}
                   </div>
                </div>

                <div className="text-center mb-8 shrink-0">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-3xl font-black shadow-resin border-2 border-white/10 relative">
                    {(selectedOrder.customerName || 'W')[0].toUpperCase()}
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#090a0f] border border-white/10 flex items-center justify-center text-emerald-400 shadow-resin">
                       <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase">{selectedOrder.customerName || 'Walk-in Customer'}</h2>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2 italic">{selectedOrder.id}</p>
                </div>

                {/* Status Controller (Only for online orders or all?) */}
                <div className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 mb-8 shrink-0">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Order Status</p>
                   <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'shipped', 'delivered', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            updateStatus(selectedOrder.id, status as any);
                            setSelectedOrder({...selectedOrder, status: status as any});
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                            selectedOrder.status === status
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-white/30 border-white/5 hover:border-white/20 hover:text-white"
                          )}
                        >
                          {statusIcons[status as keyof typeof statusIcons]}
                          {status}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 shrink-0">
                  <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 text-center relative overflow-hidden">
                     <p className="text-[8px] font-black text-white/20 uppercase mb-1">Order Total</p>
                    <p className="text-xl font-black tracking-tight">${selectedOrder.total.toFixed(2)}</p>
                    <TrendingUp size={48} className="absolute -bottom-4 -right-4 text-white/[0.02] -rotate-12" />
                  </div>
                  <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 text-center relative overflow-hidden">
                     <p className="text-[8px] font-black text-white/20 uppercase mb-1">Items Ordered</p>
                    <p className="text-xl font-black tracking-tight">{selectedOrder.items.reduce((acc, i) => acc + i.quantity, 0)}</p>
                    <Box size={48} className="absolute -bottom-4 -right-4 text-white/[0.02] -rotate-12" />
                  </div>
                </div>

                <div className="space-y-6 flex-1 min-h-0">
                  <div className="space-y-4">
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                        <LayoutGrid size={12} /> Items
                     </h5>
                    <div className="space-y-3">
                       {selectedOrder.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-3xl border border-white/5 group hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-[10px] font-black leading-tight border border-white/10 shadow-resin group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                                  <span>{item.quantity}</span>
                                  <span className="text-[6px] opacity-40 uppercase tracking-tighter">QTY</span>
                               </div>
                               <div>
                                  <p className="text-[11px] font-black uppercase tracking-tight">{item.name}</p>
                                  <p className="text-[8px] uppercase tracking-[0.2em] text-white/20">{item.article}</p>
                               </div>
                            </div>
                            <span className="text-xs font-black tracking-tight">${(item.price * item.quantity).toFixed(2)}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-3">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-white/20">Payment Method</span>
                        <span className="text-indigo-400">{selectedOrder.paymentMethod}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-white/20">Customer</span>
                        <span className="text-white/60">{selectedOrder.customerName || 'Walk-in'}</span>
                     </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex gap-3 shrink-0">
                   <LiquidButton 
                     onClick={() => selectedOrder && handlePrint(selectedOrder)}
                     className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em]"
                   >
                      <Printer size={16} className="mr-2" /> Print Receipt
                   </LiquidButton>
                   <LiquidButton variant="icon" className="w-14 h-14 p-0 border-white/10 hover:bg-white/10">
                      <CreditCard size={18} />
                   </LiquidButton>
                </div>
            </ResinCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
