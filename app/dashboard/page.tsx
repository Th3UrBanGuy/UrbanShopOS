'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Bell, Search, Lock } from 'lucide-react';
import LiquidButton from '@/components/LiquidButton';
import DashboardDock from '@/components/DashboardDock';
import ClientOnly from '@/components/ClientOnly';
import AuthGuard from '@/components/AuthGuard';
import HubView from '@/components/dashboard/HubView';
import InventoryView from '@/components/dashboard/InventoryView';
import SalesView from '@/components/dashboard/SalesView';
import CouponView from '@/components/dashboard/CouponView';
import POSView from '@/components/dashboard/POSView';
import SettingsView from '@/components/dashboard/SettingsView';
import KhorochkhataView from '@/components/dashboard/KhorochkhataView';
import PartiesView from '@/components/dashboard/PartiesView';
import ManagementView from '@/components/dashboard/ManagementView';
import UserManagementView from '@/components/dashboard/UserManagementView';
import AdminProfileMenu from '@/components/dashboard/AdminProfileMenu';
import ToastContainer from '@/components/ToastContainer';
import { useDashboardStore, DashboardTab } from '@/store/dashboardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useDashboardStore();
  const settings = useSettingsStore();
  const { currentUser, loading: authLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [authLoading, currentUser, router]);

  // Handle Initial Module Access & Auto-Redirect
  useEffect(() => {
    if (!authLoading && currentUser) {
      // If user is on Hub but not allowed, redirect to first allowed or POS
      if (activeTab === 'Hub' && currentUser.role !== 'super_admin' && !currentUser.allowedModules.includes('Hub')) {
        const firstAllowed = currentUser.allowedModules[0] as DashboardTab || 'PoS';
        setActiveTab(firstAllowed);
      }
    }
  }, [authLoading, currentUser, activeTab, setActiveTab]);

  const canAccess = (tab: string) =>
    !currentUser ||
    currentUser.role === 'super_admin' ||
    currentUser.allowedModules.includes(tab as DashboardTab);

  const AccessDenied = ({ tab }: { tab: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
        <Lock size={36} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">{tab}</h2>
      <p className="text-sm text-white/30 mb-1">You don&apos;t have access to this module.</p>
      <p className="text-[10px] text-white/20 uppercase tracking-widest">Contact Super Admin to request access.</p>
    </div>
  );

  const renderView = () => {
    switch (activeTab) {
      case 'Hub':        return canAccess('Hub')        ? <HubView />       : <AccessDenied tab="Hub" />;
      case 'Inventory':  return canAccess('Inventory')  ? <InventoryView /> : <AccessDenied tab="Inventory" />;
      case 'Stats':      return canAccess('Stats')      ? <SalesView />     : <AccessDenied tab="Stats" />;
      case 'Coupons':    return canAccess('Coupons')    ? <CouponView />    : <AccessDenied tab="Coupons" />;
      case 'PoS':        return canAccess('PoS')        ? <POSView />       : <AccessDenied tab="PoS" />;
      case 'Khorochkhata':return canAccess('Khorochkhata')? <KhorochkhataView />: <AccessDenied tab="Khorochkhata" />;
      case 'Parties':    return canAccess('Parties')    ? <PartiesView />    : <AccessDenied tab="Parties" />;
      case 'Management': return canAccess('Management') ? <ManagementView /> : <AccessDenied tab="Management" />;
      case 'Settings':   return canAccess('Settings')   ? <SettingsView />  : <AccessDenied tab="Settings" />;
      case 'Users':      return canAccess('Users')      ? <UserManagementView /> : <AccessDenied tab="Users" />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white/10">
            <LayoutGrid size={80} className="mb-4 opacity-5 animate-pulse" />
            <h2 className="text-xl font-black uppercase tracking-widest">{activeTab} Module</h2>
            <p className="text-sm">Optimizing resin materials for this interface...</p>
          </div>
        );
    }
  };

  return (
    <ClientOnly>
      <AuthGuard>
        <div className="h-screen bg-[var(--background)] text-[var(--text-primary)] selection:bg-[var(--accent)]/30 flex flex-col overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header - Compact & Responsive */}
      <header className="px-4 py-2.5 md:px-6 md:py-3.5 flex items-center justify-between z-[60] backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--card-border)] shrink-0">
        <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-resin shrink-0"
          >
            <LayoutGrid className="text-indigo-400" size={18} />
          </motion.div>
          <div className="min-w-0">
            <h1 className="text-base md:text-xl font-black tracking-tighter uppercase leading-none truncate">
              {activeTab === 'Hub' ? 'The Hub' : activeTab}
            </h1>
            <p className="hidden xs:block text-[8px] md:text-[9px] font-bold text-[var(--text-muted)] opacity-50 uppercase tracking-[0.2em] mt-0.5">{settings.siteName} OS • 1.0.4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <motion.div 
            initial={false}
            whileHover={{ scale: 1.02 }}
            className="relative hidden lg:block"
          >
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Command search..." 
              className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-full py-2.5 pl-12 pr-6 text-xs text-[var(--text-primary)] outline-none focus:bg-[var(--card-bg)] focus:border-[var(--accent)]/50 focus:shadow-[0_0_20px_var(--accent-glow)] transition-all w-64 placeholder:text-[var(--text-muted)]"
            />
          </motion.div>
          <div className="flex items-center gap-2">
            <LiquidButton variant="icon" className="w-9 h-9 md:w-10 md:h-10 p-0 relative">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--background)]" />
            </LiquidButton>
            <AdminProfileMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, scale: 1.02, filter: "blur(10px)" }}
            transition={{ 
              type: "spring", 
              stiffness: 180, 
              damping: 24,
              mass: 1
            }}
            className="w-full min-h-full p-4 md:p-6 pb-28 md:pb-32"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Skeuomorphic Dock */}
      <DashboardDock />

      {/* Global Notifications */}
      <ToastContainer />
    </div>
    </AuthGuard>
    </ClientOnly>
  );
}
