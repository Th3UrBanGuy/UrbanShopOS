'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Zap, Scissors, Sparkles, Flame, Percent, DollarSign, Users, Search, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Edit2, Settings2, CalendarClock, Package, ArrowLeft } from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { useCouponStore, Coupon } from '@/store/couponStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useToastStore } from '@/store/toastStore';
import { cn } from '@/lib/utils';

const COUPON_COLORS = ['indigo', 'cyan', 'purple', 'pink', 'emerald', 'amber', 'rose', 'orange'];

function CouponTicket({ coupon, onBurn, onToggle, onEdit }: { coupon: Coupon; onBurn: (id: number) => void; onToggle: (id: number) => void; onEdit: (coupon: Coupon) => void }) {
  const isActive = coupon.status === 'Active';
  const maxReached = coupon.maxUses > 0 && coupon.uses >= coupon.maxUses;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(20px)', y: -40 }}
      className="relative group"
    >
      <ResinCard
        className={cn(
          'h-full p-4 sm:p-5 flex flex-col justify-between border-dashed border-2 transition-all',
          isActive && !maxReached ? 'border-white/20' : 'border-white/5 opacity-50'
        )}
        glowingColor={isActive && !maxReached ? `var(--color-${coupon.color}-500)` : 'transparent'}
      >
        {/* Top row */}
        <div className="flex justify-between items-start shrink-0">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg bg-white/5 border border-white/10', `text-${coupon.color}-400`)}>
              {coupon.type === 'percent' ? <Percent size={12} /> : <DollarSign size={12} />}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{coupon.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(coupon)}
              className="text-white/20 hover:text-white transition-colors p-1"
              title="Edit coupon"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onBurn(coupon.id)}
              className="text-white/20 hover:text-rose-500 transition-colors p-1"
              title="Delete coupon"
            >
              <Flame size={14} />
            </button>
          </div>
        </div>

        {/* Code + discount */}
        <div className="text-center py-3">
          <h3 className="text-xl sm:text-2xl font-black tracking-tighter mb-1 leading-none">{coupon.code}</h3>
          <p className="text-[11px] sm:text-sm font-bold text-white/60">
            {coupon.type === 'percent' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
          </p>
        </div>

        {/* Footer row */}
        <div className="flex justify-between items-center pt-3 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-1.5">
            <Users size={10} className="text-white/20" />
            <span className="text-[8px] font-black text-white/40 uppercase">
              {coupon.uses}{coupon.maxUses > 0 ? `/${coupon.maxUses}` : ''} used
            </span>
          </div>
          <button
            onClick={() => onToggle(coupon.id)}
            className={cn(
              'flex items-center gap-1 text-[8px] font-black uppercase tracking-widest transition-all px-2 py-1 rounded-full',
              maxReached
                ? 'text-rose-400 bg-rose-500/10'
                : isActive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-white/30 bg-white/5'
            )}
          >
            {maxReached ? (
              <><AlertCircle size={10} /> Maxed</>
            ) : isActive ? (
              <><ToggleRight size={12} /> Active</>
            ) : (
              <><ToggleLeft size={12} /> Off</>
            )}
          </button>
        </div>

        {/* Ticket notches */}
        <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#050508] border-r border-white/10" />
        <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-[#050508] border-l border-white/10" />
      </ResinCard>
    </motion.div>
  );
}

// ─── Validation ──────────────────────────────────────────────────────────────
function validateForm(
  code: string,
  value: string,
  existingCodes: string[]
): string | null {
  if (!code || code.length < 3) return 'Code must be at least 3 characters';
  if (!/^[A-Z0-9_-]+$/.test(code)) return 'Only letters, numbers, - and _ allowed';
  if (existingCodes.includes(code)) return 'This code already exists';
  const v = parseFloat(value);
  if (isNaN(v) || v <= 0) return 'Value must be greater than 0';
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CouponView() {
  const { coupons, addCoupon, editCoupon, burnCoupon, toggleStatus } = useCouponStore();
  const { setActiveTab } = useDashboardStore();
  const { products } = useInventoryStore();

  // Composer state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');
  const [maxUses, setMaxUses] = useState('0');
  const [color, setColor] = useState('indigo');
  
  // Advanced state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [applicableProductId, setApplicableProductId] = useState<number | null>(null);
  const [minQuantity, setMinQuantity] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  
  const { addToast } = useToastStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setValue('');
    setMaxUses('0');
    setApplicableProductId(null);
    setMinQuantity(null);
    setExpiresAt(null);
    setShowAdvanced(false);
    setFormError(null);
  };

  const handleEditInit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setMaxUses(coupon.maxUses.toString());
    setColor(coupon.color);
    setApplicableProductId(coupon.applicableProductId || null);
    setMinQuantity(coupon.minQuantity || null);
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : null);
    if (coupon.applicableProductId || coupon.minQuantity || coupon.expiresAt) {
      setShowAdvanced(true);
    }
    setFormError(null);
  };

  const handleCreate = async () => {
    const cleanCode = code.trim().toUpperCase();
    const existing = editingId ? coupons.filter(c => c.id !== editingId).map(c => c.code) : coupons.map(c => c.code);
    const err = validateForm(cleanCode, value, existing);
    if (err) { setFormError(err); return; }

    setFormError(null);
    setIsCreating(true);

    const payload = {
      code: cleanCode,
      type,
      value: parseFloat(value),
      maxUses: parseInt(maxUses) || 0,
      color,
      status: 'Active' as const,
      applicableProductId: applicableProductId || null,
      minQuantity: minQuantity || null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
    };

    if (editingId) {
       const existingCoupon = coupons.find(c => c.id === editingId);
       if (existingCoupon) {
          await editCoupon({ ...existingCoupon, ...payload });
          addToast(`Coupon ${cleanCode} updated!`, 'success');
       }
    } else {
       await addCoupon(payload);
       addToast(`Coupon ${cleanCode} created successfully!`, 'success');
    }

    resetForm();
    setIsCreating(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 md:gap-8 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('Management')}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-resin"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none mb-1">Offers</h2>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Campaign & Coupon Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <ResinCard className="px-4 py-2 flex items-center gap-3 shrink-0" glowingColor="rgba(56,189,248,0.1)">
            <Zap size={14} className="text-cyan-400" />
            <p className="text-xs font-black tracking-tight">{coupons.filter(c => c.status === 'Active').length} active</p>
          </ResinCard>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 overflow-hidden min-h-0">

        {/* ── Left: Coupon Composer ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto no-scrollbar pb-4">
          <ResinCard className="p-6 sm:p-8 relative" glowingColor="rgba(255,255,255,0.05)">
            {editingId && (
              <button 
                onClick={resetForm}
                className="absolute top-6 right-6 text-[9px] font-black uppercase text-white/30 hover:text-white transition-colors border border-white/5 bg-white/5 rounded-full px-2 py-1 flex items-center gap-1"
              >
                Cancel Edit
              </button>
            )}
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              {editingId ? <Edit2 size={14} className="text-indigo-400" /> : <Scissors size={14} />} 
              {editingId ? 'Edit Coupon' : 'New Coupon'}
            </h4>

            <div className="space-y-5">

              {/* Code input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-white/20 uppercase ml-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER2026"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase().replace(/\s/g, '')); setFormError(null); }}
                  maxLength={20}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:border-indigo-500/40 transition-all uppercase tracking-widest"
                />
              </div>

              {/* Type selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-white/20 uppercase ml-1">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setType('percent')}
                    className={cn(
                      'py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all border',
                      type === 'percent'
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'
                    )}
                  >
                    <Percent size={14} /> % Off
                  </button>
                  <button
                    onClick={() => setType('fixed')}
                    className={cn(
                      'py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all border',
                      type === 'fixed'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'
                    )}
                  >
                    <DollarSign size={14} /> Fixed $
                  </button>
                </div>
              </div>

              {/* Value + Max Uses */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/20 uppercase ml-1">
                    {type === 'percent' ? 'Percent (%)' : 'Amount ($)'}
                  </label>
                  <input
                    type="number"
                    placeholder={type === 'percent' ? '25' : '50'}
                    value={value}
                    onChange={e => { setValue(e.target.value); setFormError(null); }}
                    min="0"
                    max={type === 'percent' ? 100 : undefined}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-black outline-none focus:border-indigo-500/40 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-white/20 uppercase ml-1">Max Uses (0=∞)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={maxUses}
                    onChange={e => setMaxUses(e.target.value)}
                    min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-black outline-none focus:border-indigo-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="border-t border-white/5 pt-4">
                 <button 
                   onClick={() => setShowAdvanced(!showAdvanced)}
                   className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                 >
                   <span className="flex items-center gap-2"><Settings2 size={12} /> Advanced Setup</span>
                   <span>{showAdvanced ? '-' : '+'}</span>
                 </button>
              </div>

              <AnimatePresence>
                 {showAdvanced && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden border-l-2 border-indigo-500/30 pl-4 py-2"
                    >
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-white/20 uppercase ml-1 flex items-center gap-1.5"><Package size={10} /> Target Product</label>
                          <select 
                            value={applicableProductId || ''} 
                            onChange={(e) => setApplicableProductId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-black outline-none focus:border-indigo-500/40 transition-all text-white appearance-none"
                          >
                            <option value="" className="bg-[#0f111a]">Any Product</option>
                            {products.map(p => (
                               <option key={p.id} value={p.id} className="bg-[#0f111a]">{p.name}</option>
                            ))}
                          </select>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-white/20 uppercase ml-1">Min. Quantity</label>
                            <input 
                              type="number" 
                              placeholder="0 (None)" 
                              value={minQuantity || ''}
                              onChange={e => setMinQuantity(e.target.value ? parseInt(e.target.value) : null)}
                              min="0"
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-black outline-none"
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-white/20 uppercase ml-1 flex items-center gap-1.5"><CalendarClock size={10} /> Expiration</label>
                            <input 
                              type="date" 
                              value={expiresAt || ''}
                              onChange={e => setExpiresAt(e.target.value || null)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black outline-none [color-scheme:dark]"
                            />
                         </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>

              {/* Color picker */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-white/20 uppercase ml-1">Ticket Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COUPON_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      title={c}
                      className={cn(
                        `w-7 h-7 rounded-full transition-all border-2 bg-${c}-500`,
                        color === c ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Error or success message */}
              <AnimatePresence mode="wait">
                {formError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-rose-400 flex items-center gap-1.5"
                  >
                    <AlertCircle size={12} /> {formError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <LiquidButton
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-indigo-600 border-indigo-500"
              >
                {isCreating ? <Sparkles size={14} className="animate-spin" /> : editingId ? <Edit2 size={14} /> : <Plus size={14} />}
                {isCreating ? 'Saving...' : editingId ? 'Save Changes' : 'Create Coupon'}
              </LiquidButton>
            </div>
          </ResinCard>

          {/* Info card */}
          <ResinCard className="p-5 flex items-center gap-4" glowingColor="rgba(168,85,247,0.08)">
            <Sparkles size={18} className="text-purple-400 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-white/60 mb-0.5">{editingId ? 'Updating' : 'Auto-expire'} when maxed</p>
              <p className="text-[8px] text-white/20 uppercase tracking-widest">Set Max Uses to 0 for unlimited</p>
            </div>
          </ResinCard>
        </div>

        {/* ── Right: Ticket Grid ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden min-h-0">

          {/* Search bar */}
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              placeholder="Search coupon codes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-indigo-500/30 transition-all"
            />
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-32 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((coupon) => (
                  <CouponTicket
                    key={coupon.id}
                    coupon={coupon}
                    onBurn={burnCoupon}
                    onToggle={toggleStatus}
                    onEdit={handleEditInit}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30">
                <Ticket size={40} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  {search ? 'No matching codes' : 'No discount codes yet'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
