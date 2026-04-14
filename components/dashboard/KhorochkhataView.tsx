'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Trash2, CalendarDays, Receipt, Search, Check, History } from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePartyStore } from '@/store/partyStore';
import { cn } from '@/lib/utils';

export default function KhorochkhataView() {
  const { expenses, addExpense, removeExpense } = useExpenseStore();
  const settings = useSettingsStore();
  const { parties, addEntry } = usePartyStore();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  // Extract unique dates from expenses
  const availableDates = Array.from(new Set([
    new Date().toDateString(),
    ...expenses.map(e => new Date(e.date).toDateString())
  ])).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const numericAmount = parseFloat(amount);

    addExpense({
      description: description.trim(),
      amount: numericAmount,
    });

    if (selectedPartyId) {
      addEntry(selectedPartyId, {
        description: `Paid - ${description.trim()}`,
        dealAmount: 0,
        paidAmount: numericAmount,
        type: 'payment'
      });
    }

    // Interactive Confirmation
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setDescription('');
      setAmount('');
      setSelectedPartyId('');
    }, 1500);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesDate = new Date(e.date).toDateString() === selectedDate;
    return matchesSearch && matchesDate;
  });

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const dailySpent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="h-full flex flex-col gap-6 md:gap-8 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none mb-1">Expenses</h2>
          <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Record Your Costs</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
          <ResinCard className="px-4 py-2 flex items-center gap-3 shrink-0" glowingColor="rgba(167,139,250,0.15)">
            <Wallet size={14} className="text-purple-400" />
            <div className="flex flex-col">
              <p className="text-[7px] font-black tracking-widest text-white/20 uppercase">Day's Total</p>
              <p className="text-sm font-black tracking-tight text-white">{settings.formatPrice(dailySpent)}</p>
            </div>
          </ResinCard>
          <div className="w-[1px] h-8 bg-white/5 mx-2 shrink-0" />
          <ResinCard className="px-4 py-2 flex items-center gap-3 shrink-0" glowingColor="rgba(255,255,255,0.05)">
            <History size={14} className="text-white/40" />
            <div className="flex flex-col">
              <p className="text-[7px] font-black tracking-widest text-white/20 uppercase">Total Logged</p>
              <p className="text-sm font-black tracking-tight text-white/60">{settings.formatPrice(totalSpent)}</p>
            </div>
          </ResinCard>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 overflow-hidden min-h-0">
        
        {/* ── Left: Composer ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-4 shrink-0 relative">
          <ResinCard className="p-6 sm:p-8 relative overflow-hidden" glowingColor="rgba(255,255,255,0.05)">
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  className="absolute inset-0 z-50 bg-indigo-500/10 flex flex-col items-center justify-center space-y-3"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                  >
                    <Check size={32} strokeWidth={4} />
                  </motion.div>
                  <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-300"
                  >
                    Saved Successfully
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Plus size={14} /> Add New Record
            </h4>

            <form onSubmit={handleAdd} className="space-y-5">
              {/* Costing Field */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-white/20 uppercase ml-1">Paid for? (Purpose)</label>
                <input
                  type="text"
                  placeholder="e.g. Office Supplies"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:border-purple-500/40 transition-all text-white placeholder:text-white/20"
                />
              </div>

              {/* Taka Field */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-white/20 uppercase ml-1">How much?</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black">৳</div>
                   <input
                     type="number"
                     placeholder="0.00"
                     min="0"
                     step="0.01"
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-black outline-none focus:border-purple-500/40 transition-all text-white placeholder:text-white/20"
                   />
                </div>
              </div>

              {/* Partner Link */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[9px] font-black text-white/20 uppercase ml-1">For a Partner? (Optional)</label>
                <select
                  value={selectedPartyId}
                  onChange={e => setSelectedPartyId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-xs font-black outline-none focus:border-purple-500/40 transition-all text-white/60 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Personal / Other</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name} (Due: {settings.formatPrice(usePartyStore.getState().getBalance(p.id).remaining)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <LiquidButton
                type="submit"
                disabled={!description.trim() || !amount || showSuccess}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-purple-600 border-purple-500 hover:bg-purple-500 hover:border-purple-400 disabled:opacity-50"
              >
                {showSuccess ? "Saved" : <><Plus size={14} /> Save Record</>}
              </LiquidButton>
            </form>
          </ResinCard>
        </div>

        {/* ── Right: Expense List ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden min-h-0">
          
          <div className="flex flex-col gap-4 shrink-0 overflow-hidden">
            {/* Date Scroller */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
              {availableDates.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const isToday = dateStr === new Date().toDateString();
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[60px] h-14 rounded-2xl border transition-all duration-300",
                      isSelected 
                        ? "bg-purple-600 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] text-white" 
                        : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                      {isToday ? "Today" : dateObj.toLocaleString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black leading-none">
                      {dateObj.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative shrink-0">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-purple-500/30 transition-all text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-32 min-h-0 pr-2">
            <AnimatePresence mode="popLayout">
              {filteredExpenses.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30"
                >
                  <Receipt size={40} className="mb-2 text-white/50" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">
                    {search ? 'No matches found' : 'No costings recorded yet'}
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredExpenses.map((expense) => {
                    const date = new Date(expense.date);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={expense.id}
                      >
                        <ResinCard className="p-4 flex items-center justify-between border-dashed border border-white/10 hover:border-white/20 transition-all">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-black text-purple-400 leading-none">{date.getDate()}</span>
                              <span className="text-[8px] font-black text-purple-400/60 uppercase">{date.toLocaleString('en-US', { month: 'short' })}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                               <p className="text-sm font-black text-white truncate max-w-[200px] sm:max-w-xs">{expense.description}</p>
                               <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">
                                 <CalendarDays size={10} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <p className="text-base font-black text-white/90 whitespace-nowrap">
                              {settings.formatPrice(expense.amount)}
                            </p>
                            <button
                              onClick={() => removeExpense(expense.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 text-white/30 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-colors shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </ResinCard>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
