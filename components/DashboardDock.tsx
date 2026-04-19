'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ShoppingCart, BarChart3, ArrowLeft, Wallet, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useDashboardStore, DashboardTab } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';

const DOCK_ITEMS: { icon: React.ReactNode; label: DashboardTab; display: string }[] = [
  { icon: <LayoutGrid size={20} />, label: "Hub", display: "Home" },
  { icon: <ShoppingCart size={20} />, label: "PoS", display: "Sell" },
  { icon: <BarChart3 size={20} />, label: "Stats", display: "Reports" },
  { icon: <Wallet size={20} />, label: "Khorochkhata", display: "Expenses" },
  { icon: <Layers size={20} />, label: "Management", display: "Manage" },
];

function DockIcon({ children, display, active, onClick, mouseX, isCompact, isMobile }: { 
  children: React.ReactNode; 
  display: string;
  active: boolean;
  onClick: () => void;
  mouseX: MotionValue<number>;
  isCompact?: boolean;
  isMobile?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const baseWidth = isMobile ? 54 : 48; // Slightly wider for labels
  const hoverWidth = isMobile ? 54 : 72;
  const compactWidth = isMobile ? 42 : 40;

  const widthSync = useTransform(distance, [-150, 0, 150], [isCompact ? compactWidth : baseWidth, isCompact ? baseWidth : hoverWidth, isCompact ? compactWidth : baseWidth]);
  const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.12, 1]);
  
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 20 });
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onClick={onClick}
      whileTap={{ scale: 0.9, y: 5 }}
      className={cn(
        "aspect-square rounded-[1rem] md:rounded-[1.25rem] backdrop-blur-3xl border transition-colors duration-500 flex items-center justify-center cursor-pointer relative group",
        active 
          ? "bg-[var(--accent)]/25 border-[var(--accent)]/50 shadow-[0_0_20px_var(--accent-glow)] text-[var(--accent)]" 
          : "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] shadow-sm"
      )}
    >
      <motion.div style={{ scale }} className="relative z-10 flex flex-col items-center justify-center">
        {children}
        {isMobile && !isCompact && (
          <span className="text-[7px] font-black uppercase tracking-tighter mt-1 opacity-80">{display}</span>
        )}
      </motion.div>

      {active && (
        <motion.div 
          layoutId="dock-glow"
          className="absolute inset-0 rounded-[1rem] md:rounded-[1.25rem] bg-[var(--accent)]/10 blur-sm -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div className="absolute inset-0 rounded-[1rem] md:rounded-[1.25rem] bg-gradient-to-br from-[var(--text-primary)]/10 to-transparent pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity" />
      <div className="absolute inset-px rounded-[0.9rem] md:rounded-[1.15rem] border border-[var(--text-primary)]/5 pointer-events-none" />
      
      {!isMobile && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--foreground)] backdrop-blur-2xl border border-[var(--card-border)] rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-[var(--background)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap translate-y-2 group-hover:translate-y-0 shadow-2xl">
          {display}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--foreground)] border-r border-b border-[var(--card-border)] rotate-45" />
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardDock() {
  const mouseX = useMotionValue(Infinity);
  const { activeTab, setActiveTab, isOverlayOpen } = useDashboardStore();
  const { currentUser } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Filter visible items based on roles
  const visibleItems = DOCK_ITEMS.filter((item) => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return currentUser.allowedModules.includes(item.label);
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if (isInput) setIsInputFocused(true);
    };

    const handleBlur = () => setIsInputFocused(false);

    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const isPosMode = activeTab === 'PoS';

  return (
    <AnimatePresence>
      {!isOverlayOpen && (
        <div className={cn(
          "fixed inset-x-0 bottom-0 z-[100] flex p-4 md:p-6 pointer-events-none transition-all duration-500",
          isPosMode ? "justify-start" : "justify-center"
        )}>
          <motion.div 
            layout
            initial={{ y: 100, opacity: 0 }}
            animate={{
              padding: isMobile ? '0.4rem' : '0.5rem',
              borderRadius: isPosMode ? '0.85rem' : (isMobile ? '1.25rem' : '1.75rem'),
              opacity: isInputFocused ? 0.15 : 1,
              scale: isInputFocused ? 0.85 : 1,
              height: isPosMode ? 'auto' : (isMobile ? '4.5rem' : '5rem'),
              y: 0
            }}
            exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ pointerEvents: isInputFocused ? 'none' : 'auto' }}
        className="bg-[var(--glass-bg)] backdrop-blur-[40px] border border-[var(--card-border)] shadow-resin flex flex-col items-center w-max pointer-events-auto"
      >
      <div 
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn("flex items-end gap-2 md:gap-4 w-full", !isPosMode && "pb-1")}
      >
        <AnimatePresence mode="wait">
          {isPosMode ? (
            <motion.div
              key="pos-dock"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center"
            >
              <DockIcon 
                display="Home"
                active={false}
                onClick={() => setActiveTab('Hub')}
                mouseX={mouseX}
                isCompact
                isMobile={isMobile}
              >
                <ArrowLeft size={isMobile ? 24 : 20} />
              </DockIcon>
            </motion.div>
          ) : (
            <motion.div
              key="full-dock"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-end gap-2 md:gap-4"
            >
              {visibleItems.map((item, i) => (
                <DockIcon 
                  key={i} 
                  display={item.display}
                  active={activeTab === item.label}
                  onClick={() => setActiveTab(item.label)}
                  mouseX={mouseX}
                  isMobile={isMobile}
                >
                  {React.cloneElement(item.icon as React.ReactElement<{ size: number }>, { 
                    size: isMobile ? 24 : 20 
                  })}
                </DockIcon>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {!isPosMode && (
        <div className="absolute -bottom-1 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent blur-sm" />
      )}
      </motion.div>
    </div>
    )}
    </AnimatePresence>
  );
}
