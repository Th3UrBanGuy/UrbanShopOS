'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, ShieldAlert, Unlock, Package, ChevronRight, SearchIcon, Sparkles, Truck, MapPin, Phone, CreditCard, Calendar, Activity, ShieldCheck, Box } from 'lucide-react';
import LiquidButton from '@/components/LiquidButton';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSalesStore } from '@/store/salesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { SaleTransaction } from '@/types';

const NAV_LINKS = [
  { href: '/market', label: 'Marketplace' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<'hub' | 'tracker'>('hub');
  const totalItems = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const toggleCart = useCartStore((s) => s.toggleOpen);

  // Auth & Search state
  const {} = useAuthStore();
  const { transactions } = useSalesStore();
  const settings = useSettingsStore();
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState<SaleTransaction | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDrawerOpen(true);
    setDrawerView('hub');
    setMobileOpen(false);
  };

  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    setIsSearching(true);
    // Simulate a brief search delay for "premium" feel
    setTimeout(() => {
      const order = transactions.find(t => t.id.toLowerCase() === searchId.toLowerCase().trim());
      setFoundOrder(order || null);
      setIsSearching(false);
    }, 600);
  };

  // Listen to escape key for drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-black/20 backdrop-blur-2xl border border-white/5 rounded-full px-6 md:px-8 py-3 md:py-4 shadow-resin">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent"
          >
            Urban<span className="font-light">ShopOS</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors relative',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-white'
                    : 'hover:text-white'
                )}
              >
                {link.label}
                {(pathname === link.href || pathname.startsWith(link.href + '/')) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400 to-purple-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <LiquidButton
              variant="icon"
              className="w-10 h-10 p-0 relative"
              onClick={toggleCart}
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-[#090a0f]"
                >
                  {totalItems}
                </motion.div>
              )}
            </LiquidButton>
            <LiquidButton
              variant="icon"
              className="w-10 h-10 p-0 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </LiquidButton>

            {/* Admin Hub Link (Desktop Right Side) */}
            <button
              onClick={handleAdminClick}
              className={cn(
                'hidden md:block transition-colors relative rounded-none border-none bg-transparent cursor-pointer font-medium text-sm pl-4 ml-4 border-l border-white/10',
                pathname.startsWith('/dashboard')
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              )}
            >
              Admin Hub
              {pathname.startsWith('/dashboard') && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400 to-purple-400"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[100] w-72 bg-[#0a0a12] border-l border-white/5 p-8 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end mb-8 p-2 rounded-full bg-white/5 border border-white/10"
              >
                <X size={18} />
              </button>
              <div className="space-y-6">
                {[{ href: '/', label: 'Home' }, ...NAV_LINKS].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block text-lg font-bold uppercase tracking-wider transition-colors',
                      pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <button
                onClick={handleAdminClick}
                className={cn(
                  'block mt-auto text-left w-full text-lg font-bold uppercase tracking-wider transition-colors border-none bg-transparent cursor-pointer pt-6 border-t border-white/10',
                  pathname.startsWith('/dashboard') ? 'text-indigo-400' : 'text-white/40 hover:text-white'
                )}
              >
                Admin Hub
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Expandable Liquid Glass Multi-View Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%', borderTopLeftRadius: '100%', borderBottomLeftRadius: '100%' }}
              animate={{ x: 0, borderTopLeftRadius: '32px', borderBottomLeftRadius: '32px' }}
              exit={{ x: '100%', borderTopLeftRadius: '100%', borderBottomLeftRadius: '100%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed top-0 right-0 bottom-0 z-[110] w-full max-w-[400px] md:max-w-[480px] lg:max-w-[540px] bg-white/5 border-l border-white/10 backdrop-blur-3xl shadow-2xl flex flex-col p-8 md:p-14 overflow-hidden"
              style={{
                boxShadow: '-30px 0 80px rgba(0,0,0,0.6), inset 1px 0 0 rgba(255,255,255,0.2)'
              }}
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors z-20"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 h-full flex flex-col">
                <AnimatePresence mode="wait">
                  {drawerView === 'hub' ? (
                    <motion.div
                      key="hub"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-1 flex flex-col justify-center items-center text-center"
                    >
                      <div className="w-20 h-20 mb-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-md text-white">
                        <Sparkles size={32} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2 tracking-tight uppercase">
                        Access Portal
                      </h2>
                      <p className="text-[10px] font-black text-white/30 tracking-[0.3em] mb-12 uppercase">
                        Select an Operation
                      </p>

                      <div className="w-full space-y-4">
                        <LiquidButton 
                          onClick={() => {
                            setDrawerOpen(false);
                            router.push('/dashboard');
                          }}
                          className="w-full py-5 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 group flex items-center justify-between px-8"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                              <Unlock size={20} />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm uppercase tracking-wider">Admin Gateway</p>
                              <p className="text-[10px] text-white/40 font-bold">Manage inventory & sales</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </LiquidButton>

                        <LiquidButton 
                          onClick={() => setDrawerView('tracker')}
                          className="w-full py-5 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 group flex items-center justify-between px-8"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                              <Package size={20} />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm uppercase tracking-wider">Order Status</p>
                              <p className="text-[10px] text-white/40 font-bold">Track your transaction</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </LiquidButton>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tracker"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-1 flex flex-col pt-12"
                    >
                      <button 
                        onClick={() => {
                          setDrawerView('hub');
                          setFoundOrder(null);
                        }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-8"
                      >
                        <X size={12} className="rotate-45" /> Back to Portal
                      </button>

                      <h2 className="text-2xl font-black mb-2 tracking-tight uppercase">Track Order</h2>
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-8">Enter your Transaction ID below</p>

                      <form onSubmit={handleOrderSearch} className="relative mb-12">
                         <div className="relative group">
                           <input 
                             type="text"
                             value={searchId}
                             onChange={(e) => setSearchId(e.target.value)}
                             placeholder="TXN-XXXXXX"
                             className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg font-black tracking-widest outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/5 shadow-inner"
                             autoFocus
                           />
                           <button 
                             type="submit"
                             disabled={isSearching}
                             className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-resin hover:scale-105 active:scale-95 transition-all"
                           >
                             {isSearching ? <Sparkles size={18} className="animate-spin" /> : <SearchIcon size={18} />}
                           </button>
                         </div>
                         <p className="mt-3 text-[9px] font-bold text-white/10 uppercase tracking-widest text-center">
                           Demo? Try an ID from recent POS sales
                         </p>
                      </form>

                       <AnimatePresence mode="wait">
                         {foundOrder ? (
                           <motion.div
                             key="result-found"
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="flex-1 flex flex-col min-h-0"
                           >
                              <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-4">
                                 {/* Status Hero Card - Full Width */}
                                 <motion.div 
                                   whileHover={{ scale: 0.995 }}
                                   className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-white/[0.03] to-transparent border border-white/10 relative overflow-hidden group shadow-2xl"
                                 >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                       <Activity size={80} className="text-indigo-400" />
                                    </div>
                                    
                                    <div className="relative z-10">
                                       <div className="flex justify-between items-start mb-10">
                                          <div>
                                             <div className="flex items-center gap-3 mb-2">
                                                <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                                                   <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{foundOrder.status}</p>
                                                </div>
                                                {foundOrder.status === 'processing' && (
                                                   <div className="flex gap-1">
                                                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                                                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping delay-75" />
                                                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping delay-150" />
                                                   </div>
                                                )}
                                             </div>
                                             <h3 className="text-3xl font-black tracking-tighter uppercase italic italic-none drop-shadow-lg">
                                                Track <span className="text-indigo-400">Sequence</span>
                                             </h3>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Value</p>
                                             <p className="text-2xl font-black text-white drop-shadow-md">{settings.formatPrice(foundOrder.total)}</p>
                                          </div>
                                       </div>

                                       <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                                          <motion.div 
                                             initial={{ width: 0 }}
                                             animate={{ 
                                                width: foundOrder.status === 'completed' || foundOrder.status === 'delivered' ? '100%' :
                                                       foundOrder.status === 'shipped' ? '75%' :
                                                       foundOrder.status === 'processing' ? '50%' : '25%' 
                                             }}
                                             transition={{ duration: 1.5, ease: "easeOut" }}
                                             className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                                          />
                                       </div>
                                       
                                       <div className="flex justify-between px-1">
                                          {['Pending', 'Process', 'Ship', 'Finish'].map((label, idx) => {
                                             const statuses = ['pending', 'processing', 'shipped', 'delivered', 'completed'];
                                             const currentIdx = statuses.indexOf(foundOrder.status);
                                             const isPast = currentIdx >= idx;
                                             return (
                                                <span key={label} className={cn(
                                                   "text-[8px] font-black uppercase tracking-tighter transition-colors duration-500",
                                                   isPast ? "text-indigo-400" : "text-white/10"
                                                )}>
                                                   {label}
                                                </span>
                                             );
                                          })}
                                       </div>
                                    </div>
                                 </motion.div>

                                 {/* Intelligence Grid - 2 Columns on MD */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Logistics Card */}
                                    <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md flex flex-col justify-between group hover:bg-white/[0.05] transition-all duration-500">
                                       <div>
                                          <div className="flex items-center gap-2 mb-6">
                                             <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <Truck size={14} />
                                             </div>
                                             <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Logistics</h5>
                                          </div>
                                          
                                          {foundOrder.deliveryAddress ? (
                                             <div className="space-y-4">
                                                <div className="flex gap-3">
                                                   <MapPin size={14} className="text-indigo-400 shrink-0 mt-1" />
                                                   <div>
                                                      <p className="text-[11px] font-bold text-white/80 leading-relaxed">{foundOrder.deliveryAddress}</p>
                                                      <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest mt-1">{foundOrder.deliveryCity}</p>
                                                   </div>
                                                </div>
                                             </div>
                                          ) : (
                                             <div className="py-4 flex flex-col items-center justify-center text-center">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/10 mb-2">
                                                   <Package size={16} />
                                                </div>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">In-Store Collection</p>
                                             </div>
                                          )}
                                       </div>
                                       
                                       <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-widest">
                                          <span>Zone: {foundOrder.deliveryCity || 'Alpha-1'}</span>
                                          <div className="flex gap-1">
                                             <div className="w-1 h-1 rounded-full bg-white/20" />
                                             <div className="w-1 h-1 rounded-full bg-white/20" />
                                          </div>
                                       </div>
                                    </div>

                                    {/* Identity & Payment Card */}
                                    <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 backdrop-blur-md space-y-6 hover:bg-white/[0.05] transition-all duration-500">
                                       <div className="flex items-center gap-2 mb-2">
                                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                             <CreditCard size={14} />
                                          </div>
                                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Checkout ID</h5>
                                       </div>

                                       <div className="space-y-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                                <Phone size={12} />
                                             </div>
                                             <div>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Contact Signal</p>
                                                <p className="text-[10px] font-bold text-white/80">{foundOrder.customerPhone || 'DIRECT POS'}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                                <ShieldCheck size={12} />
                                             </div>
                                             <div>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Payment Protocol</p>
                                                <p className="text-[10px] font-black text-purple-400 uppercase">{foundOrder.paymentMethod}</p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Manifest Block - High Density Vault */}
                                 <div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                       <Box size={40} className="text-white" />
                                    </div>
                                    
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                       Vault manifest
                                    </h5>

                                    <div className="space-y-3">
                                       {foundOrder.items.map((item, i) => (
                                         <motion.div 
                                           key={i} 
                                           whileHover={{ x: 5 }}
                                           className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 group/item transition-colors hover:bg-white/[0.04]"
                                         >
                                            <div className="flex items-center gap-4">
                                               <div className="relative">
                                                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[11px] font-black z-10 relative">
                                                     {item.quantity}
                                                  </div>
                                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-black/50 z-20" />
                                               </div>
                                               <div>
                                                  <p className="text-[11px] font-bold text-white/90">{item.name}</p>
                                                  {item.selectedVariant && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                       <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[7px] font-black text-indigo-400 uppercase tracking-widest italic">
                                                          {item.selectedVariant.color}
                                                       </span>
                                                       <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[7px] font-black text-white/30 uppercase tracking-widest">
                                                          SZ:{item.selectedVariant.size}
                                                       </span>
                                                    </div>
                                                  )}
                                               </div>
                                            </div>
                                            <div className="text-right">
                                               <p className="text-[10px] font-black text-white/60">{settings.formatPrice(item.price * item.quantity)}</p>
                                               <p className="text-[7px] font-bold text-white/10 uppercase tracking-widest mt-0.5">Verified</p>
                                            </div>
                                         </motion.div>
                                       ))}
                                    </div>
                                 </div>

                                 {/* Technical Log Footer */}
                                 <div className="pt-4 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-white/20 tracking-wider">
                                       <Calendar size={10} />
                                       SEQUENCE INITIATED: {new Date(foundOrder.timestamp).toLocaleDateString()}
                                    </div>
                                    <p className="text-[8px] font-black text-white/5 uppercase tracking-[0.5em]">T-ID: {foundOrder.id}</p>
                                    <div className="h-10" /> {/* Spacer */}
                                 </div>
                              </div>
                             </motion.div>
                         ) : searchId && !isSearching ? (
                            <motion.div
                              animate={{ opacity: 1 }}
                              className="text-center py-12"
                            >
                               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                                  <ShieldAlert size={24} />
                               </div>
                               <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Transaction Not Found</p>
                               <p className="text-[9px] text-white/10 mt-2 uppercase font-black">Please check your ID and try again</p>
                            </motion.div>
                         ) : null}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

