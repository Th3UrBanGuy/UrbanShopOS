'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, ShieldAlert, Unlock, Package, ChevronRight, SearchIcon, Sparkles } from 'lucide-react';
import LiquidButton from '@/components/LiquidButton';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSalesStore } from '@/store/salesStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { cn } from '@/lib/utils';
import { SaleTransaction } from '@/types';
import TrackingReport from './TrackingReport';


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
  const { setOverlayOpen } = useDashboardStore();
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState<SaleTransaction | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setOverlayOpen(foundOrder !== null);
  }, [foundOrder, setOverlayOpen]);

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
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-[100] bg-[#f1f5f9] overflow-y-auto no-scrollbar"
                              id="printable-tracker"
                            >
                               <TrackingReport 
                                 order={foundOrder} 
                                 onClose={() => {
                                   setFoundOrder(null);
                                   setDrawerOpen(false);
                                   setSearchId('');
                                 }} 
                               />
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
