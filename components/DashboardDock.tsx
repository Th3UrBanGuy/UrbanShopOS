'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Package, Ticket, ShoppingCart, BarChart3, Settings, ArrowLeft, BookOpen, Wallet, Handshake, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useDashboardStore, DashboardTab } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';

const DOCK_ITEMS: { icon: React.ReactNode; label: DashboardTab }[] = [
  { icon: <LayoutGrid size={20} />, label: "Hub" },
  { icon: <BarChart3 size={20} />, label: "Stats" },
  { icon: <ShoppingCart size={20} />, label: "PoS" },
  { icon: <Wallet size={20} />, label: "Khorochkhata" },
  { icon: <Layers size={21} />, label: "Management" },
];

function DockIcon({ children, label, active, onClick, mouseX, isCompact, isMobile }: { 
  children: React.ReactNode; 
  label: DashboardTab;
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

  const baseWidth = isMobile ? 48 : 48; // Significantly larger on mobile (matching desktop base)
  const hoverWidth = isMobile ? 64 : 72;
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
          ? "bg-indigo-500/25 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.4)] text-indigo-200" 
          : "bg-white/10 border-white/15 text-white/70 hover:text-white shadow-resin"
      )}
    >
      <motion.div style={{ scale }} className="relative z-10 flex items-center justify-center">
        {children}
      </motion.div>

      {active && (
        <motion.div 
          layoutId="dock-glow"
          className="absolute inset-0 rounded-[1rem] md:rounded-[1.25rem] bg-indigo-500/10 blur-sm -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div className="absolute inset-0 rounded-[1rem] md:rounded-[1.25rem] bg-gradient-to-br from-white/20 to-transparent pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity" />
      <div className="absolute inset-px rounded-[0.9rem] md:rounded-[1.15rem] border border-white/10 pointer-events-none" />
      
      {!isMobile && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap translate-y-2 group-hover:translate-y-0 shadow-2xl">
          {label}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45" />
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardDock() {
  const mouseX = useMotionValue(Infinity);
  const { activeTab, setActiveTab } = useDashboardStore();
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
    <div className={cn(
      "fixed inset-x-0 bottom-0 z-[100] flex p-4 md:p-6 pointer-events-none transition-all duration-500",
      isPosMode ? "justify-start" : "justify-center"
    )}>
      <motion.div 
        layout
        initial={false}
        animate={{
          padding: isMobile ? '0.4rem' : '0.5rem',
          borderRadius: isPosMode ? '0.85rem' : (isMobile ? '1.25rem' : '1.75rem'),
          opacity: isInputFocused ? 0.15 : 1,
          scale: isInputFocused ? 0.85 : 1,
          height: isPosMode ? 'auto' : (isMobile ? '4.5rem' : '5rem'),
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ pointerEvents: isInputFocused ? 'none' : 'auto' }}
        className="bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] flex flex-col items-center w-max pointer-events-auto"
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
                label="Hub"
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
                  label={item.label}
                  active={activeTab === item.label}
                  onClick={() => setActiveTab(item.label)}
                  mouseX={mouseX}
                  isMobile={isMobile}
                >
                  {React.cloneElement(item.icon as any, { 
                    size: isMobile ? 24 : 20 
                  })}
                </DockIcon>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {!isPosMode && (
        <div className="absolute -bottom-1 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-sm" />
      )}
      </motion.div>
    </div>
  );
}
