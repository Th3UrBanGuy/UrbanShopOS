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
  Printer, 
  FileSpreadsheet,
  Calendar,
  X
} from 'lucide-react';
import { exportToCSV, printReport } from '@/lib/exportUtils';
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
  const { transactions, updateStatus, getTransactionsByRange } = useSalesStore();
  const settings = useSettingsStore();
  const [selectedOrder, setSelectedOrder] = useState<SaleTransaction | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pos' | 'online'>('all');
  
  // Date Range State
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  const filteredTransactions = transactions.filter(tx => {
    const matchesTab = activeTab === 'all' || tx.channel === activeTab;
    if (!matchesTab) return false;

    if (dateRange.start || dateRange.end) {
      const txDate = new Date(tx.timestamp);
      txDate.setHours(0, 0, 0, 0);

      if (dateRange.start) {
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }

      if (dateRange.end) {
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) return false;
      }
    }
    return true;
  });

  const totalRev = filteredTransactions.reduce((acc, tx) => acc + tx.total, 0);
  const avgValue = filteredTransactions.length > 0 ? totalRev / filteredTransactions.length : 0;
  
  const todayStr = new Date().toDateString();
  const todayRev = filteredTransactions
    .filter(t => new Date(t.timestamp).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.total, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  filteredTransactions
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

  const handleExportList = () => {
    const csvData = filteredTransactions.map(tx => ({
      ID: tx.id,
      Date: new Date(tx.timestamp).toLocaleString(),
      Customer: tx.customerName || 'Walk-in',
      Items: tx.items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
      Total: tx.total,
      Status: tx.status,
      Channel: tx.channel,
      Payment: tx.paymentMethod
    }));
    exportToCSV(csvData, `Sales_Report_${activeTab}`);
  };

  const handlePrintList = () => {
    printReport({
      title: 'Sales Report',
      subtitle: activeTab === 'all' ? 'All Channels' : `${activeTab.toUpperCase()} Channel`,
      data: filteredTransactions,
      columns: [
        { key: 'timestamp', label: 'Date/Time', format: (v) => new Date(v as string | number | Date).toLocaleString() },
        { key: 'customerName', label: 'Customer', format: (v) => v as string || 'Walk-in' },
        { key: 'total', label: 'Total', format: (v) => settings.formatPrice(v as number) },
        { key: 'paymentMethod', label: 'Payment' },
        { key: 'status', label: 'Status' }
      ],
      summary: [
        { label: 'Total Revenue', value: settings.formatPrice(totalRev) },
        { label: 'Total Orders', value: filteredTransactions.length.toString() },
        { label: 'Avg Order', value: settings.formatPrice(avgValue) }
      ],
      settings: {
        siteName: settings.siteName,
        formatPrice: settings.formatPrice,
        billDesign: settings.billDesign
      }
    });
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
            { label: 'PoS Revenue', value: settings.formatPrice(filteredTransactions.filter(t => t.channel === 'pos').reduce((s, t) => s + t.total, 0)), icon: <Monitor size={14} />, color: 'var(--accent)' },
            { label: 'Site Revenue', value: settings.formatPrice(filteredTransactions.filter(t => t.channel === 'online').reduce((s, t) => s + t.total, 0)), icon: <Globe size={14} />, color: 'var(--accent)' },
            { label: 'Filtered Sales', value: settings.formatPrice(todayRev), icon: <Users size={14} />, color: 'var(--accent)' },
            { label: 'Matches', value: filteredTransactions.length.toString(), icon: <ShoppingBag size={14} />, color: 'var(--accent)' },
            { label: 'Avg Order', value: settings.formatPrice(avgValue), icon: <Zap size={14} />, color: 'var(--accent)' },
          ].map((stat, i) => (
             <ResinCard key={i} className="p-3" glowingColor={stat.color.startsWith('var') ? stat.color : `var(--color-${stat.color}-500)`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn(
                  "p-1 rounded-lg border border-[var(--card-border)] shadow-inner bg-[var(--card-bg)]/50", 
                  stat.color.startsWith('var') ? "text-[var(--accent)]" : `text-${stat.color}-400`
                )}>{stat.icon}</div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] truncate">{stat.label}</span>
              </div>
              <p className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)]">{stat.value}</p>
            </ResinCard>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-2xl border border-[var(--card-border)]">
               {[
                 { id: 'all', label: 'All Sales', icon: <LayoutGrid size={14} /> },
                 { id: 'pos', label: 'Terminal / PoS', icon: <Monitor size={14} /> },
                 { id: 'online', label: 'Store Orders', icon: <Globe size={14} /> },
               ].map((tab) => (
                 <button
                   key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'all' | 'pos' | 'online')}
                    className={cn(
                     "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     activeTab === tab.id 
                       ? "bg-[var(--text-primary)] text-[var(--background)] shadow-resin" 
                       : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]/80"
                   )}
                 >
                   {tab.icon}
                   <span className="hidden sm:inline">{tab.label}</span>
                 </button>
               ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2 bg-[var(--input-bg)] p-1.5 rounded-2xl border border-[var(--card-border)]">
                  <div className="flex items-center gap-2 px-3 border-r border-[var(--card-border)] mr-1">
                     <Calendar size={12} className="text-[var(--text-muted)]" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Range</span>
                  </div>
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-transparent text-[10px] font-black text-[var(--text-primary)] outline-none border-none uppercase p-1 w-28"
                  />
                  <span className="text-[var(--text-muted)] px-1 opacity-30">—</span>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-transparent text-[10px] font-black text-[var(--text-primary)] outline-none border-none uppercase p-1 w-28"
                  />
                  {(dateRange.start || dateRange.end) && (
                    <button 
                      onClick={() => setDateRange({ start: '', end: '' })}
                      className="ml-2 p-1.5 rounded-lg hover:bg-white/10 text-rose-500 transition-colors"
                      title="Clear Filter"
                    >
                      <X size={12} />
                    </button>
                  )}
               </div>
               
               <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportList}
                    className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]/80 transition-all group"
                    title="Export to CSV"
                  >
                    <FileSpreadsheet size={16} />
                  </button>
                  <button 
                    onClick={handlePrintList}
                    className="p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]/80 transition-all group"
                    title="Print List"
                  >
                    <Printer size={16} />
                  </button>
                  <div className="w-px h-6 bg-[var(--card-border)] mx-1" />
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      LIVE
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-32">
             {filteredTransactions.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--text-muted)] border-2 border-dashed border-[var(--card-border)] rounded-[3rem]">
                <Package size={48} className="mb-4" />
                 <p className="font-black tracking-[0.3em] uppercase text-xs">No orders found</p>
              </div>
            ) : (
              filteredTransactions.map((tx, i) => {
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
                        ? "bg-[var(--card-bg)] border-[var(--text-primary)]/20 shadow-resin" 
                        : "bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--text-muted)] hover:bg-[var(--card-bg)]/80"
                    )}
                  >
                    <div className="flex items-center gap-5 min-w-0 relative z-10">
                        <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--text-primary)] shadow-resin border border-[var(--card-border)] shrink-0",
                         tx.channel === 'pos' ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-cyan-500/20 text-cyan-400"
                       )}>
                         {tx.channel === 'pos' ? <Monitor size={20} /> : <Globe size={20} />}
                       </div>
                        <div className="min-w-0">
                         <h4 className="text-sm font-black tracking-tight truncate uppercase text-[var(--text-primary)]">{tx.customerName || 'Walk-in Customer'}</h4>
                         <div className="flex items-center gap-3">
                             <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{tx.id}</p>
                             <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/20" />
                             <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{formatTimeAgo(tx.timestamp)}</p>
                             {tx.deliveryCity && (
                               <>
                                 <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/20" />
                                 <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{tx.deliveryCity}</p>
                               </>
                             )}
                          </div>
                       </div>
                    </div>

                     <div className="text-right shrink-0 relative z-10 flex flex-col items-end gap-1.5">
                      <p className="text-base font-black tracking-tighter text-[var(--text-primary)]">{settings.formatPrice(tx.total)}</p>
                      <div className="flex items-center gap-2">
                         <span className={cn(
                           "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm",
                           tx.status === 'completed' || tx.status === 'delivered'
                             ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400"
                             : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                         )}>
                            {tx.status}
                         </span>
                      </div>
                    </div>

                    {/* Background Subtle Gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                      tx.channel === 'pos' ? "from-[var(--accent)]/5 to-transparent" : "from-cyan-500/5 to-transparent"
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
              "fixed inset-0 z-50 p-4 bg-[var(--background)]/90 backdrop-blur-3xl lg:bg-transparent lg:relative lg:p-0 lg:z-auto"
            )}
          >
            <div className="flex items-center gap-4 lg:hidden mb-2 shrink-0">
               <button 
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)]"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-black tracking-tight uppercase text-[var(--text-primary)]">Order Details</h2>
            </div>

            <ResinCard className="p-8 flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" glowingColor="rgba(255,255,255,0.05)">
                <div className="flex items-center justify-between mb-8 shrink-0">
                   <div className={cn(
                     "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                     selectedOrder.channel === 'pos' ? "bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                   )}>
                      {selectedOrder.channel === 'pos' ? <Monitor size={12} /> : <Globe size={12} />}
                      {selectedOrder.channel}
                   </div>
                    <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                      {new Date(selectedOrder.timestamp).toLocaleString()}
                   </div>
                </div>

                <div className="text-center mb-8 shrink-0">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-indigo-600 mx-auto mb-4 flex items-center justify-center text-3xl font-black shadow-resin border-2 border-white/10 relative text-white">
                    {(selectedOrder.customerName || 'W')[0].toUpperCase()}
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#090a0f] border border-white/10 flex items-center justify-center text-emerald-400 shadow-resin">
                       <CheckCircle2 size={18} />
                    </div>
                  </div>
                   <h2 className="text-3xl font-black tracking-tighter uppercase text-[var(--text-primary)]">{selectedOrder.customerName || 'Walk-in Customer'}</h2>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mt-2 italic">{selectedOrder.id}</p>
                </div>

                {/* Status Controller (Only for online orders or all?) */}
                 <div className="p-5 rounded-[2rem] bg-[var(--input-bg)] border border-[var(--card-border)] mb-8 shrink-0">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Order Status</p>
                   <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'shipped', 'delivered', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            updateStatus(selectedOrder.id, status as SaleTransaction['status']);
                            setSelectedOrder({...selectedOrder, status: status as SaleTransaction['status']});
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                             selectedOrder.status === status
                               ? "bg-[var(--text-primary)] text-[var(--background)] border-[var(--text-primary)]"
                               : "bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--card-border)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          {statusIcons[status as keyof typeof statusIcons]}
                          {status}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 shrink-0">
                   <div className="p-5 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] text-center relative overflow-hidden">
                     <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Order Total</p>
                    <p className="text-xl font-black tracking-tight text-[var(--text-primary)]">${selectedOrder.total.toFixed(2)}</p>
                    <TrendingUp size={48} className="absolute -bottom-4 -right-4 text-[var(--text-muted)]/10 -rotate-12" />
                  </div>
                   <div className="p-5 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] text-center relative overflow-hidden">
                     <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">Items Ordered</p>
                    <p className="text-xl font-black tracking-tight text-[var(--text-primary)]">{selectedOrder.items.reduce((acc, i) => acc + i.quantity, 0)}</p>
                    <Box size={48} className="absolute -bottom-4 -right-4 text-[var(--text-muted)]/10 -rotate-12" />
                  </div>
                </div>

                <div className="space-y-6 flex-1 min-h-0">
                  <div className="space-y-4">
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-2 opacity-60">
                        <LayoutGrid size={12} /> Items
                     </h5>
                    <div className="space-y-3">
                       {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[var(--input-bg)] p-4 rounded-3xl border border-[var(--card-border)] group hover:bg-[var(--card-bg)]/80 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-2xl bg-[var(--card-bg)] flex flex-col items-center justify-center text-[10px] font-black leading-tight border border-[var(--card-border)] shadow-resin group-hover:bg-[var(--accent)]/20 group-hover:text-[var(--accent)] transition-colors">
                                  <span className="text-[var(--text-primary)]">{item.quantity}</span>
                                  <span className="text-[6px] text-[var(--text-muted)] uppercase tracking-tighter">QTY</span>
                               </div>
                               <div>
                                  <p className="text-[11px] font-black uppercase tracking-tight text-[var(--text-primary)]">{item.name}</p>
                                  <div className="flex items-center gap-2">
                                     <p className="text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{item.article}</p>
                                     {item.selectedVariant && (
                                       <>
                                         <span className="w-0.5 h-0.5 rounded-full bg-[var(--text-muted)]/30" />
                                         <p className="text-[8px] font-black text-[var(--accent)] uppercase tracking-[0.2em]">
                                           {item.selectedVariant.color} / {item.selectedVariant.size}
                                         </p>
                                       </>
                                     )}
                                  </div>
                               </div>
                            </div>
                            <span className="text-xs font-black tracking-tight text-[var(--text-primary)]">${(item.price * item.quantity).toFixed(2)}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {(selectedOrder.deliveryAddress || selectedOrder.customerPhone) && (
                    <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 mb-6">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 flex items-center gap-2">
                        <Truck size={12} /> Delivery Intelligence
                      </h5>
                      <div className="space-y-4">
                        {selectedOrder.deliveryAddress && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Address</span>
                            <p className="text-xs font-bold text-white/90">{selectedOrder.deliveryAddress}</p>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedOrder.deliveryCity}</p>
                          </div>
                        )}
                        <div className="flex gap-6">
                          {selectedOrder.customerPhone && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Contact</span>
                              <p className="text-[10px] font-bold text-white/80">{selectedOrder.customerPhone}</p>
                            </div>
                          )}
                          {selectedOrder.customerEmail && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Email</span>
                              <p className="text-[10px] font-bold text-white/80">{selectedOrder.customerEmail}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-5 rounded-[2rem] bg-[var(--input-bg)] border border-[var(--card-border)] space-y-3">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-[var(--text-muted)]">Payment Method</span>
                        <span className="text-[var(--accent)]">{selectedOrder.paymentMethod}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-[var(--text-muted)]">Channel</span>
                        <span className="text-[var(--text-muted)] uppercase">{selectedOrder.channel}</span>
                     </div>
                  </div>
                </div>

                 <div className="mt-8 pt-8 border-t border-[var(--card-border)] flex gap-3 shrink-0">
                   <LiquidButton 
                     onClick={() => selectedOrder && handlePrint(selectedOrder)}
                     className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em]"
                   >
                      <Printer size={16} className="mr-2" /> Print Receipt
                   </LiquidButton>
                   <LiquidButton variant="icon" className="w-14 h-14 p-0 border-[var(--card-border)] hover:bg-[var(--card-bg)]/80 text-[var(--text-primary)]">
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
