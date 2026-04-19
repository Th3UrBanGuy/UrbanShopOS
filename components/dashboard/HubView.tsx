'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Zap, 
  ArrowUpRight,
  ShoppingBag
} from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store/dashboardStore';
import { useSalesStore } from '@/store/salesStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSettingsStore } from '@/store/settingsStore';

interface StatTileProps {
  title: string;
  value: string;
  change: string;
  color: string;
  className?: string;
}

function StatTile({ title, value, change, color, className }: StatTileProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((event.clientX - centerX) / 15);
    y.set((event.clientY - centerY) / 10);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseX, y: mouseY }}
      className={cn("h-full", className)}
    >
      <ResinCard className="p-6 h-full group" glowingColor={color}>
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">{title}</span>
            <motion.div 
              whileHover={{ rotate: 45, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl bg-[var(--background)]/20 border border-[var(--card-border)] flex items-center justify-center shadow-resin group-hover:bg-[var(--background)]/30 transition-colors"
            >
              <TrendingUp size={16} className="text-emerald-400" />
            </motion.div>
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-2 group-hover:scale-[1.02] origin-left transition-transform duration-500 text-[var(--text-primary)]">{value}</h3>
            <div className="flex items-center gap-1.5">
               <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400">+{change}%</div>
               <p className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-widest">vs Last Week</p>
            </div>
          </div>
        </div>
      </ResinCard>
    </motion.div>
  );
}

function InventoryTile({ className }: { className?: string }) {
  const { products } = useInventoryStore();
  
  // Get top 3 products with lowest stock percentage or just first 3
  const stocks = itemsToStockTiles(products).slice(0, 3);

  return (
    <ResinCard className={cn("p-6 md:p-8 h-full group", className)} glowingColor="rgba(255,191,0,0.08)">
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">Stock Levels</h4>
        <ArrowUpRight size={14} className="text-[var(--text-muted)] opacity-20 group-hover:opacity-40 transition-opacity" />
      </div>
      <div className="space-y-6">
        {stocks.map((s, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">{s.name}</span>
              <span className={cn("transition-colors", s.level < 20 ? "text-rose-400" : "text-[var(--text-muted)] opacity-30")}>{s.level}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--background)]/40 rounded-full overflow-hidden shadow-inner p-[1px] border border-[var(--card-border)]">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${s.level}%` }} 
                transition={{ duration: 1.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r", 
                  s.color,
                  "shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                )} 
              />
            </div>
          </div>
        ))}
      </div>
    </ResinCard>
  );
}

function SalesFeedTile({ className }: { className?: string }) {
  const transactions = useSalesStore(s => s.transactions).slice(0, 3);
  const settings = useSettingsStore();

  return (
    <ResinCard className={cn("p-6 md:p-8 h-full group", className)} glowingColor="rgba(99,102,241,0.08)">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-30 group-hover:opacity-50 transition-opacity">Recent Sales</h4>
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent)]" />
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[8px] font-black text-[var(--accent)] tracking-widest shadow-resin">LIVE</div>
      </div>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="py-10 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">No sales tracked yet</div>
        ) : transactions.map((tx, i) => (
          <motion.div 
            key={i} 
            whileHover={{ x: 5, backgroundColor: "var(--card-bg)" }}
            className="flex items-center justify-between p-4 rounded-[1.5rem] bg-[var(--background)]/20 border border-[var(--card-border)] group/item transition-all duration-300 cursor-pointer shadow-resin overflow-hidden relative"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-[var(--accent)] opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center text-[11px] font-black shadow-resin shrink-0 text-white border border-white/10">
                {tx.customerPhone ? 'P' : 'C'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[var(--text-primary)] opacity-90 group-hover/item:opacity-100 truncate tracking-tight">{tx.id}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{tx.paymentMethod}</p>
                   <span className="text-[8px] font-black text-[var(--accent)]/50 uppercase tracking-tighter">{tx.status}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
               <p className="text-sm font-black tracking-tighter text-[var(--text-primary)]">{settings.formatPrice(tx.total)}</p>
               <p className="text-[8px] font-bold text-[var(--text-muted)] opacity-20 uppercase mt-0.5">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </ResinCard>
  );
}

function itemsToStockTiles(products: { name: string; stock: number }[]) {
  return products.map(p => {
    // Basic stock percentage calculation (max 100 for visual)
    const stockPercent = Math.min(100, Math.floor((p.stock / 100) * 100));
    return {
      name: p.name,
      level: stockPercent,
      color: stockPercent < 20 ? "from-rose-500 to-rose-400" : "from-[var(--accent)] to-[var(--accent)]/70"
    };
  }).sort((a, b) => a.level - b.level);
}

export default function HubView() {
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '1Y'>('1W');
  const setActiveTab = useDashboardStore((state) => state.setActiveTab);
  const { transactions, getChartData } = useSalesStore();
  const settings = useSettingsStore();

  const chartData = getChartData(period);
  const totalRevenue = transactions.reduce((acc, tx) => acc + tx.total, 0);

  // Derived dynamic stats
  const totalVisitors = 42800 + transactions.length * 15; // Persistent simulation base + multiplier
  const posCount = transactions.filter(t => t.channel === 'pos').length;
  const onlineCount = transactions.filter(t => t.channel === 'online').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
      {/* Row 1 & 2: Revenue Main */}
      <div className="sm:col-span-2 sm:row-span-2 min-h-[380px] md:min-h-[420px]">
         <ResinCard className="p-6 md:p-8 h-full flex flex-col" glowingColor="rgba(99,102,241,0.15)">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div>
                 <div className="flex items-center gap-2 mb-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                   <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-40">Total Revenue</h3>
                </div>
                <p className="text-3xl md:text-5xl font-black tracking-tighter leading-none bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-transparent">
                  {settings.formatPrice(totalRevenue)}
                </p>
              </div>
             <div className="flex items-center gap-1 bg-[var(--glass-bg)] p-1.5 rounded-2xl border border-[var(--card-border)] self-end md:self-auto relative shadow-resin">
                {['1D', '1W', '1M', '1Y'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setPeriod(t as '1D' | '1W' | '1M' | '1Y')}
                    className={cn(
                      "relative px-5 py-2.5 rounded-xl text-[10px] font-black transition-all z-10 uppercase tracking-widest",
                      period === t ? 'text-[var(--background)]' : 'text-[var(--text-muted)] opacity-40 hover:opacity-60'
                    )}
                  >
                    {t}
                    {period === t && (
                      <motion.div 
                        layoutId="period-pill"
                        className="absolute inset-0 bg-[var(--text-primary)] rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                  </button>
                ))}
             </div>
           </div>
           
            <div className="relative h-48 md:h-64 w-full mt-auto flex items-end gap-1.5 md:gap-3 px-2 group/chart">
              {chartData.map((d, i) => {
                const maxVal = Math.max(...chartData.map(cd => cd.value), 100);
                const heightPercent = (d.value / maxVal) * 100;
                
                return (
                  <motion.div 
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${Math.max(5, heightPercent)}%`, opacity: 1 }}
                    whileHover={{ scaleX: 1.1, filter: "brightness(1.5)" }}
                    transition={{ duration: 1.2, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "flex-1 rounded-t-xl relative group/bar cursor-crosshair transition-colors duration-500 bg-gradient-to-t from-[var(--accent)]/10 via-[var(--accent)]/60 to-[var(--accent)]"
                    )}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-30 transition-opacity rounded-t-xl" />
                    <AnimatePresence>
                      <motion.div 
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--background)] text-[10px] font-black px-2 py-1 rounded-lg shadow-2xl opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap z-20 pointer-events-none"
                      >
                        {settings.formatPrice(d.value)}
                        <p className="text-[7px] text-center opacity-50">{d.label}</p>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--text-primary)] rotate-45" />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                );
              })}
           </div>
        </ResinCard>
      </div>
      
      <InventoryTile className="sm:col-span-2 lg:col-span-2 cursor-pointer transition-transform hover:scale-[1.01]" />
      
      <div className="sm:col-span-1" onClick={() => setActiveTab('PoS')}>
         <ResinCard className="p-6 h-full flex flex-col justify-center items-center text-center group cursor-pointer" glowingColor="rgba(255,255,255,0.05)">
            <motion.div 
               whileHover={{ rotate: 180, scale: 1.1 }}
               className="w-12 h-12 rounded-2xl bg-[var(--background)]/20 border border-[var(--card-border)] flex items-center justify-center mb-5 shadow-resin text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30 transition-colors"
             >
               <BarChart3 size={24} />
             </motion.div>
             <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Shop Sales</p>
            <p className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">{posCount}</p>
         </ResinCard>
      </div>
      
      <div className="sm:col-span-1" onClick={() => setActiveTab('Stats')}>
         <ResinCard className="p-6 h-full relative overflow-hidden group cursor-pointer" glowingColor="rgba(236,72,153,0.15)">
            <div className="flex flex-col h-full justify-between items-center text-center relative z-10">
              <motion.div 
                whileHover={{ y: -5, scale: 1.1 }}
                className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-5 shadow-resin"
              >
                <ShoppingBag size={24} />
              </motion.div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-20">Website Orders</h4>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-[20px] font-black text-[var(--text-primary)] tracking-widest uppercase">{onlineCount}</p>
              </div>
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
         </ResinCard>
      </div>

      <SalesFeedTile className="sm:col-span-2 lg:col-span-2 sm:row-span-2" />

      <StatTile title="Total Transactions" value={transactions.length.toLocaleString()} change="12" color="rgba(56,189,248,0.12)" className="sm:col-span-1" />
      
      <div className="sm:col-span-1" onClick={() => setActiveTab('Stats')}>
         <ResinCard className="p-6 h-full flex flex-col justify-center items-center text-center group cursor-pointer" glowingColor="rgba(56,189,248,0.05)">
            <motion.div 
              whileHover={{ rotate: -20, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl bg-[var(--background)]/20 border border-[var(--card-border)] flex items-center justify-center mb-5 shadow-resin text-[var(--text-muted)] opacity-30 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors"
            >
              <Users size={24} />
            </motion.div>
            <p className="text-[10px] font-black text-[var(--text-muted)] opacity-20 uppercase tracking-[0.2em] mb-1">Total Visitors</p>
            <p className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">{(totalVisitors / 1000).toFixed(1)}k</p>
         </ResinCard>
      </div>

      <div className="sm:col-span-2 lg:col-span-2">
         <ResinCard className="p-6 md:p-10 h-full flex items-center justify-between group overflow-hidden" glowingColor="rgba(16,185,129,0.12)">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-30 mb-3 group-hover:opacity-50 transition-opacity">Customer Rating</h4>
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-transparent">4.9</span>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Zap size={18} className="text-amber-400 fill-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-[var(--background)]/40 border border-[var(--card-border)] shadow-resin flex items-center justify-center group-hover:rotate-6 transition-transform duration-700">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="50%" cy="50%" r="40%" 
                    className="fill-none stroke-[var(--text-muted)] opacity-10 stroke-[8px]" 
                  />
                  <motion.circle 
                    cx="50%" cy="50%" r="40%" 
                    className="fill-none stroke-emerald-500 stroke-[8px] rounded-full" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 0.98 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    strokeDasharray="100 100"
                  />
               </svg>
               <div className="relative flex flex-col items-center">
                 <span className="text-2xl md:text-3xl font-black tracking-tighter text-[var(--text-primary)]">98%</span>
                 <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em]">Trust</p>
               </div>
            </div>
            
            {/* Absolute element decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] -z-10 group-hover:bg-emerald-500/10 transition-colors" />
         </ResinCard>
      </div>
    </div>
  );
}
