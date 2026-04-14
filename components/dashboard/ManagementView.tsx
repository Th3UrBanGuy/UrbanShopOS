'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Archive, 
  Ticket, 
  Users, 
  Settings, 
  ArrowRight, 
  Layers,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Settings as SettingsIcon
} from 'lucide-react';
import { useDashboardStore, DashboardTab } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import ResinCard from '@/components/ResinCard';

const MANAGEMENT_TOOLS: {
  id: DashboardTab;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  requiredRole?: 'admin' | 'manager';
}[] = [
  {
    id: 'Inventory',
    title: 'Stock Room',
    description: 'Check products, add items, and update stock.',
    icon: <Archive size={32} />,
    color: '#A855F7', // Bright Purple
    gradient: 'from-purple-500/30 to-violet-600/30',
  },
  {
    id: 'Parties',
    title: 'Partner List',
    description: 'Manage suppliers, owners, and payments.',
    icon: <Users size={32} />,
    color: '#3B82F6', // Bright Blue
    gradient: 'from-blue-500/30 to-cyan-600/30',
    requiredRole: 'admin',
  },
  {
    id: 'Coupons',
    title: 'Offers',
    description: 'Create discount codes and special deals.',
    icon: <Ticket size={32} />,
    color: '#F43F5E', // Bright Rose
    gradient: 'from-rose-500/30 to-pink-600/30',
  },
  {
    id: 'Settings',
    title: 'App Settings',
    description: 'Update price rates, business info, and more.',
    icon: <Settings size={32} />,
    color: '#10B981', // Bright Emerald
    gradient: 'from-emerald-500/30 to-teal-600/30',
    requiredRole: 'admin',
  },
];

export default function ManagementView() {
  const { setActiveTab } = useDashboardStore();
  const { currentUser } = useAuthStore();

  const allowedTools = MANAGEMENT_TOOLS.filter(tool => {
    // Super admins see everything
    if (currentUser?.role === 'super_admin') return true;
    
    // Check if the specific module is allowed
    return currentUser?.allowedModules.includes(tool.id);
  });

  return (
    <div className="h-full flex flex-col space-y-8 max-w-6xl mx-auto py-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Layers size={20} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Management Tools</h2>
        </div>
        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
          Everything You Need to Run Your Business
        </p>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allowedTools.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="group"
            onClick={() => setActiveTab(tool.id)}
          >
            <ResinCard 
              className="h-full cursor-pointer overflow-hidden border-white/5 hover:border-white/30 transition-all duration-500 p-8 flex flex-col justify-between min-h-[320px] relative"
              glowingColor={tool.color + '44'} // 44 is approx 25% opacity in hex
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                tool.gradient
              )} />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110",
                    "bg-white/5 border border-white/10 group-hover:border-white/20"
                  )} style={{ color: tool.color }}>
                    {tool.icon}
                  </div>
                  <div className="p-3 rounded-full bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 shadow-resin">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight text-white uppercase group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm font-bold text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-4 mt-auto">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
                  Open Module <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                {i === 0 && <Sparkles size={120} />}
                {i === 1 && <ShieldCheck size={120} />}
                {i === 2 && <Zap size={120} />}
                {i === 3 && <SettingsIcon size={120} />}
              </div>
            </ResinCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ResinCard className="p-6 border-dashed border-white/10 flex items-center justify-between gap-6" glowingColor="rgba(255,255,255,0.02)">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">System Access</p>
                <p className="text-xs font-bold text-white/30">Your role provides full administrative access to all listed management modules.</p>
              </div>
           </div>
           <div className="hidden md:block">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                Active Session
              </span>
           </div>
        </ResinCard>
      </motion.div>
    </div>
  );
}
