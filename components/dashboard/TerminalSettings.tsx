'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Store, Percent, Receipt } from 'lucide-react';
import LiquidButton from '@/components/LiquidButton';
import { useSettingsStore } from '@/store/settingsStore';

export default function TerminalSettings({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const settings = useSettingsStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-stretch justify-end bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0" 
          onClick={onClose} 
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="relative w-full max-w-sm bg-[#0a0a0f] border-l border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)] flex flex-col z-10"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Store size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">Terminal Config</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Live Sync Active</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/50">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 border-b border-white/10 pb-2">
                <Store size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Store Profile</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase ml-1">Terminal Identifier</label>
                <input 
                  type="text" 
                  value={settings.siteName}
                  onChange={(e) => settings.setSiteName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-500/50 focus:bg-white/5" 
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 border-b border-white/10 pb-2">
                <Percent size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Financial Rules</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase ml-1">Default Tax (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={settings.defaultTaxRate}
                    onChange={(e) => settings.setDefaultTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-500/50 focus:bg-white/5" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase ml-1">Base Currency</label>
                  <input 
                    type="text" 
                    value={settings.currency}
                    onChange={(e) => settings.setCurrency(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-500/50 focus:bg-white/5 uppercase" 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 border-b border-white/10 pb-2">
                <Receipt size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Bill Personalization</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase ml-1">Header Statement</label>
                <input 
                  type="text" 
                  value={settings.billDesign.headerText}
                  onChange={(e) => settings.setBillDesign({ headerText: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-500/50 focus:bg-white/5" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase ml-1">Footer Statement</label>
                <input 
                  type="text" 
                  value={settings.billDesign.footerText}
                  onChange={(e) => settings.setBillDesign({ footerText: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-500/50 focus:bg-white/5" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase ml-1">Brand Accent Color</label>
                <div className="flex gap-2">
                   <div 
                     className="w-10 h-10 rounded-xl border border-white/20 shadow-inner flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer"
                   >
                     <input 
                       type="color" 
                       value={settings.billDesign.accentColor}
                       onChange={(e) => settings.setBillDesign({ accentColor: e.target.value })}
                       className="absolute inset-[-10px] w-20 h-20 opacity-0 cursor-pointer"
                     />
                     <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: settings.billDesign.accentColor }} />
                   </div>
                   <input 
                     type="text" 
                     value={settings.billDesign.accentColor}
                     onChange={(e) => settings.setBillDesign({ accentColor: e.target.value })}
                     className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-500/50 uppercase" 
                   />
                </div>
              </div>
            </section>
          </div>
          
          <div className="p-6 border-t border-white/10 bg-[#0a0a0f] absolute bottom-0 left-0 right-0 shrink-0">
             <LiquidButton onClick={onClose} className="w-full py-3.5 flex justify-center items-center">
                <Save size={16} className="mr-2" /> Apply & Close
             </LiquidButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
