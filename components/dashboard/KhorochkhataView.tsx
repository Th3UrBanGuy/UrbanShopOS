'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Trash2, 
  Receipt, 
  Search, 
  Check, 
  History, 
  Printer, 
  FileSpreadsheet,
  Tag,
  ArrowUpRight,
  PieChart,
  Target,
  AlertCircle
} from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { useExpenseStore, ExpenseCategory } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePartyStore } from '@/store/partyStore';
import { cn } from '@/lib/utils';
import { exportToCSV, printReport } from '@/lib/exportUtils';

const CATEGORIES: { id: ExpenseCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'Stock', label: 'Stock / Inventory', icon: <Target size={14} />, color: 'emerald' },
  { id: 'Utility', label: 'Bills / Utility', icon: <AlertCircle size={14} />, color: 'amber' },
  { id: 'Staff', label: 'Staff / Salary', icon: <History size={14} />, color: 'indigo' },
  { id: 'Rent', label: 'Rent / Space', icon: <Wallet size={14} />, color: 'purple' },
  { id: 'Marketing', label: 'Ads / Promo', icon: <ArrowUpRight size={14} />, color: 'rose' },
  { id: 'Food', label: 'Food / Refreshment', icon: <Tag size={14} />, color: 'orange' },
  { id: 'Other', label: 'Miscellaneous', icon: <Tag size={14} />, color: 'slate' },
];

export default function KhorochkhataView() {
  const { expenses, addExpense, removeExpense } = useExpenseStore();
  const settings = useSettingsStore();
  const { parties, addEntry } = usePartyStore();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

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
      category: category
    });

    if (selectedPartyId) {
      addEntry(selectedPartyId, {
        description: `Paid [${category}] - ${description.trim()}`,
        dealAmount: 0,
        paidAmount: numericAmount,
        type: 'payment'
      });
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setDescription('');
      setAmount('');
      setSelectedPartyId('');
      setCategory('Other');
    }, 1500);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesDate = new Date(e.date).toDateString() === selectedDate;
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesDate && matchesCat;
  });

  const dayTotal = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const monthTotal = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + curr.amount, 0);

  const topCategory = CATEGORIES.find(c => {
    const total = expenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0);
    return total === Math.max(...CATEGORIES.map(cat => expenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0)));
  }) || CATEGORIES[0];

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      
      {/* ── Header: High Octane Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <ResinCard className="p-5 flex items-center justify-between group overflow-hidden" glowingColor="var(--accent-glow)">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mb-1 opacity-60">Today&apos;s Spend</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{settings.formatPrice(dayTotal)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
             <Receipt size={24} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20" />
        </ResinCard>

        <ResinCard className="p-5 flex items-center justify-between group overflow-hidden" glowingColor="rgba(56,189,248,0.15)">
           <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-sky-400 mb-1 opacity-60">Month Projection</p>
            <p className="text-2xl font-black text-[var(--text-primary)]">{settings.formatPrice(monthTotal)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
             <PieChart size={24} />
          </div>
        </ResinCard>

        <ResinCard className="p-5 flex items-center justify-between group overflow-hidden" glowingColor="rgba(168,85,247,0.15)">
           <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-1 opacity-60">Top Sink</p>
            <p className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">{topCategory.label.split(' / ')[0]}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
             {topCategory.icon}
          </div>
        </ResinCard>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
        
        {/* ── Left: Tactile Composer ─────────────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 relative min-h-0">
          <ResinCard className="p-8 relative overflow-hidden flex flex-col h-fit" glowingColor="rgba(255,255,255,0.03)">
            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  className="absolute inset-0 z-50 bg-[var(--accent)]/10 flex flex-col items-center justify-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-resin"
                  >
                    <Check size={32} strokeWidth={4} />
                  </motion.div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mt-4">Record Materialized</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full shadow-[0_0_10px_var(--accent)]" />
              <h3 className="text-lg font-black tracking-tight uppercase">New Record</h3>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Spend Purpose</label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-4 px-5 text-sm font-black outline-none focus:border-[var(--accent)]/40 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <label className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-black text-xs opacity-50">৳</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-4 pl-8 pr-5 text-sm font-black outline-none focus:border-[var(--accent)]/40 transition-all text-[var(--text-primary)]"
                    />
                  </div>
                 </div>
                 <div className="space-y-2">
                  <label className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-4 px-4 text-[10px] font-black outline-none focus:border-[var(--accent)]/40 transition-all text-[var(--text-primary)] appearance-none cursor-pointer uppercase tracking-widest"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Link to Party</label>
                <select
                  value={selectedPartyId}
                  onChange={e => setSelectedPartyId(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-4 px-5 text-[10px] font-black outline-none focus:border-[var(--accent)]/40 transition-all text-[var(--text-primary)]/60 appearance-none cursor-pointer uppercase tracking-widest"
                >
                  <option value="">Personal / General</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <LiquidButton
                type="submit"
                disabled={!description.trim() || !amount || showSuccess}
                className="w-full py-5 text-xs font-black uppercase tracking-[0.3em]"
              >
                 Commit Record
              </LiquidButton>
            </form>
          </ResinCard>

          <ResinCard className="p-6 bg-gradient-to-br from-[var(--accent)]/5 to-transparent border-dashed border-2 border-[var(--accent)]/10">
             <div className="flex items-center gap-3 mb-3">
                <AlertCircle size={14} className="text-[var(--accent)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Quick Tip</span>
             </div>
             <p className="text-[10px] font-medium text-[var(--text-muted)] leading-relaxed">
                Linking expenses to a **Party** automatically updates their ledger in the Parties module.
             </p>
          </ResinCard>
        </div>

        {/* ── Right: Ledger Vault ────────────────────────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-5 overflow-hidden min-h-0">
          
          <div className="flex flex-col gap-4 shrink-0">
             {/* Date Scroller */}
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {availableDates.map((dateStr) => {
                  const dateObj = new Date(dateStr);
                  const isToday = dateStr === new Date().toDateString();
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "flex flex-col items-center justify-center min-w-[70px] h-16 rounded-2xl border transition-all duration-500 relative overflow-hidden group",
                        isSelected 
                          ? "bg-[var(--text-primary)] border-[var(--text-primary)] shadow-resin text-[var(--background)]" 
                          : "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                      )}
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">
                        {isToday ? "Today" : dateObj.toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black font-mono">
                        {String(dateObj.getDate()).padStart(2, '0')}
                      </span>
                      {isSelected && (
                         <motion.div layoutId="ledger-active" className="absolute inset-0 bg-white/10" />
                      )}
                    </button>
                  );
                })}
             </div>

             <div className="flex items-center gap-3">
                <div className="relative flex-1 group">
                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                   <input
                     type="text"
                     placeholder="Search the ledger..."
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-3.5 pl-11 pr-5 text-xs font-black outline-none focus:border-[var(--accent)]/40 transition-all text-[var(--text-primary)]"
                   />
                </div>
                
                <div className="flex items-center gap-1.5 p-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-x-auto no-scrollbar max-w-[300px] md:max-w-none">
                   {(['All', ...CATEGORIES.map(c => c.id)] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                          selectedCategory === cat 
                            ? "bg-[var(--text-primary)] text-[var(--background)] shadow-sm"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {cat}
                      </button>
                   ))}
                </div>

                <div className="flex items-center gap-2">
                   <button onClick={() => exportToCSV(filteredExpenses, `Ledger_${selectedDate}`)} className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                      <FileSpreadsheet size={16} />
                   </button>
                   <button 
                    onClick={() => printReport({ 
                      title: 'Expense Ledger', 
                      subtitle: `Date: ${selectedDate}`,
                      data: filteredExpenses, 
                      columns: [
                        { key: 'description', label: 'Item/Purpose' },
                        { key: 'category', label: 'Category' },
                        { key: 'amount', label: 'Amount', format: (v) => settings.formatPrice(v as number) },
                        { key: 'date', label: 'Time', format: (v) => new Date(v as string).toLocaleTimeString() }
                      ],
                      summary: [{ label: 'Total', value: settings.formatPrice(dayTotal) }],
                      settings 
                    })} 
                    className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                   >
                      <Printer size={16} />
                   </button>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-3 min-h-0">
             <AnimatePresence mode="popLayout">
                {filteredExpenses.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[var(--card-border)] rounded-[3rem] opacity-20">
                     <Receipt size={48} className="mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Ledger State</p>
                  </motion.div>
                ) : (
                  filteredExpenses.map((expense, idx) => {
                    const catInfo = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[6];
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        key={expense.id}
                      >
                        <ResinCard className={cn(
                          "p-4 flex items-center justify-between group transition-all duration-500 hover:bg-[var(--background)] relative overflow-hidden",
                          "border-l-4",
                          expense.category === 'Stock' ? "border-l-emerald-500" :
                          expense.category === 'Utility' ? "border-l-amber-500" :
                          expense.category === 'Staff' ? "border-l-indigo-500" :
                          expense.category === 'Rent' ? "border-l-purple-500" :
                          expense.category === 'Marketing' ? "border-l-rose-500" :
                          expense.category === 'Food' ? "border-l-orange-500" : "border-l-slate-500"
                        )}>
                           <div className="flex items-center gap-5 relative z-10 min-w-0">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner",
                                `bg-${catInfo.color}-500/10 text-${catInfo.color}-400 group-hover:bg-${catInfo.color}-500 group-hover:text-white transition-colors duration-500`
                              )}>
                                 {catInfo.icon}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-black tracking-tight uppercase truncate text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{expense.description}</p>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--input-bg)] px-2 py-0.5 rounded-lg border border-[var(--card-border)]">
                                       {expense.category}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/20" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                       {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 relative z-10 shrink-0">
                              <div className="text-right">
                                 <p className="text-lg font-black font-mono tracking-tighter text-[var(--text-primary)]">
                                    {settings.formatPrice(expense.amount)}
                                 </p>
                                 <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-40">Impact Applied</p>
                              </div>
                              <button
                                onClick={() => removeExpense(expense.id)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>

                           {/* Subtle category glow */}
                           <div className={cn(
                             "absolute -right-10 -top-10 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none",
                             `bg-${catInfo.color}-500`
                           )} />
                        </ResinCard>
                      </motion.div>
                    );
                  })
                )}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
