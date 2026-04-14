'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Handshake, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  History,
  Trash2,
  X,
  CreditCard,
  Building2,
  UserPlus,
  Check,
  ArrowLeft
} from 'lucide-react';
import { usePartyStore } from '@/store/partyStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';

export default function PartiesView() {
  const { parties, addParty, removeParty, addEntry, removeEntry, getBalance } = usePartyStore();
  const { setActiveTab } = useDashboardStore();
  const settings = useSettingsStore();

  const [search, setSearch] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [showAddParty, setShowAddParty] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [partyName, setPartyName] = useState('');
  const [partyOwner, setPartyOwner] = useState('');
  
  const [entryDesc, setEntryDesc] = useState('');
  const [entryDeal, setEntryDeal] = useState('');
  const [entryPaid, setEntryPaid] = useState('');
  const [entryType, setEntryType] = useState<'deal' | 'payment'>('deal');

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.owner.toLowerCase().includes(search.toLowerCase())
  );

  const selectedParty = parties.find(p => p.id === selectedPartyId);
  const balances = selectedPartyId ? getBalance(selectedPartyId) : { totalDeals: 0, totalPaid: 0, remaining: 0 };

  const handleAddParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;
    addParty(partyName, partyOwner);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setPartyName('');
      setPartyOwner('');
      setShowAddParty(false);
    }, 1500);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId || !entryDesc.trim()) return;
    addEntry(selectedPartyId, {
      description: entryDesc,
      dealAmount: Number(entryDeal) || 0,
      paidAmount: Number(entryPaid) || 0,
      type: entryType,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setEntryDesc('');
      setEntryDeal('');
      setEntryPaid('');
      setShowAddEntry(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResinCard className="p-5 flex items-center gap-4" glowingColor="rgba(99,102,241,0.2)">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Handshake size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Partners</p>
            <p className="text-2xl font-black text-white">{parties.length}</p>
          </div>
        </ResinCard>

        <ResinCard className="p-5 flex items-center gap-4" glowingColor="rgba(34,197,94,0.2)">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">All Deals</p>
            <p className="text-2xl font-black text-white">
              {settings.formatPrice(parties.reduce((acc, p) => acc + getBalance(p.id).totalDeals, 0))}
            </p>
          </div>
        </ResinCard>

        <ResinCard className="p-5 flex items-center gap-4" glowingColor="rgba(244,63,94,0.2)">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Due Balance</p>
            <p className="text-2xl font-black text-white">
              {settings.formatPrice(parties.reduce((acc, p) => acc + getBalance(p.id).remaining, 0))}
            </p>
          </div>
        </ResinCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Party List Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text"
                placeholder="Search partners..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all text-white"
              />
            </div>
            <LiquidButton 
              onClick={() => setShowAddParty(true)}
              className="px-4 py-3 bg-indigo-600 rounded-2xl text-white shadow-lg"
            >
              <UserPlus size={16} />
            </LiquidButton>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[60vh] no-scrollbar pr-1">
            <AnimatePresence mode="popLayout">
              {filteredParties.map(party => {
                const b = getBalance(party.id);
                const isActive = selectedPartyId === party.id;
                return (
                  <motion.div
                    key={party.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedPartyId(party.id)}
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden group",
                      isActive 
                        ? "bg-white/10 border-white/20 shadow-resin ring-1 ring-indigo-500/50" 
                        : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight text-white">{party.name}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase mt-0.5">{party.owner || 'No Owner Info'}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xs font-black", b.remaining > 0 ? "text-rose-400" : "text-emerald-400")}>
                          {settings.formatPrice(b.remaining)}
                        </p>
                        <p className="text-[8px] font-bold text-white/20 uppercase mt-0.5">Due Balance</p>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="active-party-pill"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full" 
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedParty ? (
              <motion.div
                key={selectedParty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <ResinCard className="p-6 relative overflow-hidden" glowingColor="rgba(99,102,241,0.1)">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{selectedParty.name}</h2>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase text-indigo-400 tracking-widest">
                          Active Partner
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Building2 size={12} /> {selectedParty.owner} • Joined {new Date(selectedParty.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <LiquidButton 
                        onClick={() => setShowAddEntry(true)}
                        className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <Plus size={14} /> New Record
                      </LiquidButton>
                      <button 
                         onClick={() => { if(confirm('Are you sure?')) { removeParty(selectedParty.id); setSelectedPartyId(null); } }}
                         className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                    <div>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Total Deals</p>
                      <p className="text-lg font-black text-white">{settings.formatPrice(balances.totalDeals)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Total Paid</p>
                      <p className="text-lg font-black text-emerald-400">{settings.formatPrice(balances.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Due</p>
                      <p className="text-lg font-black text-rose-400">{settings.formatPrice(balances.remaining)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Last Transaction</p>
                      <p className="text-lg font-black text-white/60">
                        {selectedParty.entries[0] ? new Date(selectedParty.entries[0].date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </ResinCard>

                {/* Entry Ledger */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 opacity-40">
                    <History size={14} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">History</h3>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="space-y-2">
                    {selectedParty.entries.map(entry => (
                      <div 
                        key={entry.id} 
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.08] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                            entry.type === 'deal' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          )}>
                            {entry.type === 'deal' ? <Handshake size={18} /> : <CreditCard size={18} />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase">{entry.description}</p>
                            <p className="text-[9px] font-bold text-white/30 uppercase mt-0.5">
                              {new Date(entry.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                           <div>
                              <p className="text-xs font-black text-white">
                               {entry.dealAmount > 0 && <span>Deal: {settings.formatPrice(entry.dealAmount)}</span>}
                                {entry.dealAmount > 0 && entry.paidAmount > 0 && <span className="mx-2 opacity-20">|</span>}
                                {entry.paidAmount > 0 && <span className="text-emerald-400">Payment: {settings.formatPrice(entry.paidAmount)}</span>}
                              </p>
                           </div>
                           <button 
                             onClick={() => removeEntry(selectedParty.id, entry.id)}
                             className="text-white/10 hover:text-rose-400 transition-colors"
                           >
                            <X size={14} />
                           </button>
                        </div>
                      </div>
                    ))}
                    {selectedParty.entries.length === 0 && (
                      <div className="py-20 text-center space-y-3 opacity-20">
                        <History size={48} className="mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest">No entries recorded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-40 bg-white/5 border border-white/5 rounded-3xl border-dashed">
                <Users size={40} className="text-white/10 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-white/20">Select a partner to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Party Modal */}
      <AnimatePresence>
        {showAddParty && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md relative overflow-hidden"
            >
              <ResinCard className="p-8 space-y-6" glowingColor="rgba(99,102,241,0.3)">
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Saved Successfully</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">Add Partner</h2>
                  <button onClick={() => setShowAddParty(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleAddParty} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Name</label>
                    <input 
                      autoFocus
                      type="text"
                      required
                      value={partyName}
                      onChange={e => setPartyName(e.target.value)}
                      placeholder="e.g. Acme Resin Supplies"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Owner Name</label>
                    <input 
                      type="text"
                      value={partyOwner}
                      onChange={e => setPartyOwner(e.target.value)}
                      placeholder="e.g. John Doe (Optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all text-white"
                    />
                  </div>
                  <LiquidButton 
                    type="submit" 
                    disabled={showSuccess}
                    className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
                  >
                    {showSuccess ? "Saved" : "Save Partner"}
                  </LiquidButton>
                </form>
              </ResinCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddEntry && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md relative overflow-hidden"
            >
              <ResinCard className="p-8 space-y-6" glowingColor="rgba(99,102,241,0.3)">
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Saved Successfully</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">New Record</h2>
                  <button onClick={() => setShowAddEntry(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>

                <div className="flex p-1 bg-white/5 rounded-xl gap-1">
                  <button 
                    onClick={() => setEntryType('deal')}
                    className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", entryType === 'deal' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                  >New Deal</button>
                  <button 
                    onClick={() => setEntryType('payment')}
                    className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", entryType === 'payment' ? "bg-white text-black" : "text-white/40 hover:text-white")}
                  >Payment</button>
                </div>

                <form onSubmit={handleAddEntry} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Paid for? (Purpose)</label>
                    <input 
                      autoFocus
                      required
                      type="text"
                      value={entryDesc}
                      onChange={e => setEntryDesc(e.target.value)}
                      placeholder={entryType === 'deal' ? "Supply of epoxy resin batch #4" : "Weekly settlement payment"}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Total Bill</label>
                      <input 
                        type="number"
                        value={entryDeal}
                        onChange={e => setEntryDeal(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Payment</label>
                      <input 
                        type="number"
                        value={entryPaid}
                        onChange={e => setEntryPaid(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all text-white"
                      />
                    </div>
                  </div>

                  <LiquidButton 
                    type="submit" 
                    disabled={showSuccess}
                    className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
                  >
                    {showSuccess ? "Saved" : "Save Record"}
                  </LiquidButton>
                </form>
              </ResinCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
