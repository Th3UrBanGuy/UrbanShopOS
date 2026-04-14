'use client';

import React, { useState } from 'react';
import {
  Globe, Percent, Printer, Palette, Type, Check,
  Layout, ChevronDown, Zap, Shield, Bell, Sliders,
  Eye, EyeOff, RotateCcw, Star, AlignLeft, AlignCenter,
  AlignRight, Minus, FileText, Hash, Clock, Calendar,
  CreditCard, Barcode, PenLine, Scissors, Layers, Sparkles, Phone, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore, BillDesign } from '@/store/settingsStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { printReceipt } from '@/lib/printReceipt';
import UserManagementView from '@/components/dashboard/UserManagementView';

// ─── UI Primitives ──────────────────────────────────────────────────────────

function SectionAccordion({
  icon: Icon, title, accent = '#6366f1', defaultOpen = false, children
}: {
  icon: React.ElementType; title: string; accent?: string;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.025] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center"
          style={{ background: accent + '18', border: `1px solid ${accent}30`, color: accent }}>
          <Icon size={15} />
        </div>
        <span className="flex-1 text-sm font-bold uppercase tracking-widest text-white/80">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-2 border-t border-white/5 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-white/35 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium outline-none transition-all focus:border-indigo-500/50 focus:bg-black/40 placeholder:text-white/20"
    />
  );
}

function Toggle({ value, onChange, accent = '#6366f1' }: { value: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-[22px] rounded-full transition-colors shrink-0"
      style={{ background: value ? accent : 'rgba(255,255,255,0.12)' }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
        style={{ left: value ? 'calc(100% - 19px)' : '3px' }}
      />
    </button>
  );
}

function SegmentControl<T extends string>({
  value, onChange, options
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: React.ReactNode }[] }) {
  return (
    <div className="flex bg-black/30 border border-white/10 rounded-xl p-1 gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
            value === opt.value ? 'bg-white text-black shadow-sm' : 'text-white/35 hover:text-white/60'
          )}
        >
          {opt.icon}{opt.label}
        </button>
      ))}
    </div>
  );
}

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 cursor-pointer group">
      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2.5 bg-black/30 border border-white/10 rounded-xl px-3 py-2 group-hover:border-white/20 transition-colors">
        <div className="w-6 h-6 rounded-lg border border-white/15 shrink-0 overflow-hidden">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 -m-1 cursor-pointer border-none bg-transparent" />
        </div>
        <span className="font-mono text-[11px] text-white/50 group-hover:text-white/70 transition-colors">{value}</span>
      </div>
    </label>
  );
}

function ToggleRow({ icon: Icon, label, sub, value, onChange, accent = '#6366f1' }: {
  icon: React.ElementType; label: string; sub?: string;
  value: boolean; onChange: (v: boolean) => void; accent?: string;
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl px-3 py-3 transition-all border',
      value ? 'bg-white/[0.04] border-white/10' : 'bg-transparent border-white/5'
    )}>
      <div className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center"
        style={{ background: value ? accent + '20' : 'rgba(255,255,255,0.05)', color: value ? accent : 'rgba(255,255,255,0.3)' }}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-none">{label}</p>
        {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
      </div>
      <Toggle value={value} onChange={onChange} accent={accent} />
    </div>
  );
}

// ─── Bill Live Preview ──────────────────────────────────────────────────────

function BillPreview({ d, siteName, currency }: { d: BillDesign; siteName: string; currency: string }) {
  const sym = currency === 'BDT' ? '৳' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const fontClass = d.fontFamily === 'mono' ? 'font-mono' : d.fontFamily === 'serif' ? 'font-serif' : 'font-sans';
  const fsBase = d.fontSize === 'sm' ? 10 : d.fontSize === 'lg' ? 13 : 11.5;
  const alignClass = d.headerAlign === 'left' ? 'text-left' : d.headerAlign === 'right' ? 'text-right' : 'text-center';
  const fw = d.fontWeight === 'black' ? '900' : d.fontWeight === 'bold' ? '700' : '400';
  const bRadius = d.cornerStyle === 'pill' ? '2rem' : d.cornerStyle === 'rounded' ? '1rem' : '0.25rem';

  const perfRow = (
    <div className="flex justify-around px-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: '#0a0a10' }} />
      ))}
    </div>
  );

  const accentBar = (pos: string) =>
    pos !== 'none' && (d.accentPosition === pos || d.accentPosition === 'both')
      ? <div style={{ height: d.accentWidth, background: d.accentColor }} />
      : null;

  const sep = d.showSeparatorLines
    ? <div style={{ borderTop: `1px ${d.borderStyle === 'none' ? 'solid' : d.borderStyle} ${d.borderColor}`, margin: '8px 0' }} />
    : <div style={{ height: 8 }} />;

  const ts: React.CSSProperties = { color: d.textColor, fontWeight: fw };
  const ms: React.CSSProperties = { color: d.mutedColor };

  return (
    <div className={cn('w-full overflow-hidden', fontClass)} style={{
      background: d.bgColor, borderRadius: bRadius,
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      border: d.borderStyle !== 'none' ? `1px ${d.borderStyle} ${d.borderColor}` : 'none',
      fontSize: fsBase,
    }}>
      {d.showPerforations && <div className="pt-1.5">{perfRow}</div>}
      {accentBar('top')}
      <div className="px-5 py-4" style={ts}>
        <div className={cn('pb-3', alignClass)}>
          <p style={{ fontSize: fsBase * 1.5, fontWeight: 900, color: d.accentColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{siteName}</p>
          <p style={{ fontSize: fsBase * 0.85, ...ms, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{d.headerText}</p>
          {d.subHeaderText && <p style={{ fontSize: fsBase * 0.8, ...ms, marginTop: 1 }}>{d.subHeaderText}</p>}
        </div>
        {sep}
        {(d.showDate || d.showOrderId || d.showCustomerPhone) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
            {(d.showDate || d.showOrderId) && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {d.showDate && <span style={{ fontSize: fsBase * 0.8, ...ms }}>10 Apr 2026</span>}
                {d.showOrderId && <span style={{ fontSize: fsBase * 0.8, ...ms }}>#AR-2840</span>}
              </div>
            )}
            {d.showCustomerPhone && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span style={{ fontSize: fsBase * 0.8, ...ms }}>Cust: +880 1712-345678</span>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {[['Fluid Resin Panel × 2', `${sym}140.00`], ['AeroGel Coating × 1', `${sym}85.00`]].map(([n, p]) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: fsBase * 0.9 }}>{n}</span>
              <span style={{ fontSize: fsBase * 0.9, fontWeight: 700 }}>{p}</span>
            </div>
          ))}
        </div>
        {sep}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
          {d.showDiscount && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: fsBase * 0.85, ...ms }}>Discount</span>
            <span style={{ fontSize: fsBase * 0.85, color: '#16a34a' }}>-{sym}15.00</span>
          </div>}
          {d.showTax && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: fsBase * 0.85, ...ms }}>Tax 12%</span>
            <span style={{ fontSize: fsBase * 0.85, ...ms }}>{sym}25.20</span>
          </div>}
        </div>
        <div style={{ background: d.totalBgColor, borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: fsBase * 1.1, fontWeight: 800 }}>TOTAL</span>
          <span style={{ fontSize: fsBase * 1.4, fontWeight: 900, color: d.accentColor }}>{sym}235.20</span>
        </div>
        {d.showPaymentMethod && <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: fsBase * 0.8, background: d.accentColor + '18', color: d.accentColor, padding: '3px 10px', borderRadius: 99, border: `1px solid ${d.accentColor}30`, fontWeight: 700 }}>CASH</span>
        </div>}
        {d.showSignatureLine && <div style={{ marginTop: 12, borderTop: `1px solid ${d.borderColor}`, paddingTop: 6, textAlign: 'center' }}>
          <span style={{ fontSize: fsBase * 0.75, ...ms }}>Authorized Signature</span>
        </div>}
        {d.showBarcode && <div style={{ textAlign: 'center', marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 1, justifyContent: 'center', height: 24 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? 3 : 1.5, height: '100%', background: d.textColor, opacity: 0.8 }} />
            ))}
          </div>
          <p style={{ fontSize: fsBase * 0.7, ...ms, marginTop: 2, letterSpacing: '0.1em' }}>AR-2840-2026</p>
        </div>}
        {sep}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: fsBase * 0.85, ...ms, fontStyle: 'italic', lineHeight: 1.4 }}>{d.footerText}</p>
          {d.tagline && <p style={{ fontSize: fsBase * 0.75, color: d.accentColor, marginTop: 4, letterSpacing: '0.1em' }}>{d.tagline}</p>}
        </div>
      </div>
      {accentBar('bottom')}
      {d.showPerforations && <div className="pb-1.5">{perfRow}</div>}
    </div>
  );
}

// ─── Preset Themes ──────────────────────────────────────────────────────────

const PRESET_THEMES: { name: string; emoji: string; patch: Partial<BillDesign> }[] = [
  { name: 'Aero',     emoji: '✦', patch: { accentColor: '#6366f1', bgColor: '#ffffff', textColor: '#1a1a1a', mutedColor: '#888', totalBgColor: '#f5f5f5', fontFamily: 'sans', cornerStyle: 'rounded' } },
  { name: 'Midnight', emoji: '🌑', patch: { accentColor: '#a78bfa', bgColor: '#0d0d14', textColor: '#e8e8ff', mutedColor: '#6060a0', totalBgColor: '#14141f', fontFamily: 'mono', cornerStyle: 'rounded' } },
  { name: 'Forest',   emoji: '🌿', patch: { accentColor: '#22c55e', bgColor: '#f0faf0', textColor: '#1a2a1a', mutedColor: '#5a8060', totalBgColor: '#e8f5e8', fontFamily: 'sans', cornerStyle: 'rounded' } },
  { name: 'Fire',     emoji: '🔥', patch: { accentColor: '#f97316', bgColor: '#fff9f0', textColor: '#2a1a0a', mutedColor: '#9a6040', totalBgColor: '#fef3e8', fontFamily: 'serif', cornerStyle: 'square' } },
  { name: 'Ocean',    emoji: '🌊', patch: { accentColor: '#06b6d4', bgColor: '#f0faff', textColor: '#0a1a2a', mutedColor: '#407080', totalBgColor: '#e0f5ff', fontFamily: 'sans', cornerStyle: 'rounded' } },
  { name: 'Rose',     emoji: '🌸', patch: { accentColor: '#e879a0', bgColor: '#fff0f5', textColor: '#2a0a1a', mutedColor: '#a06080', totalBgColor: '#ffe8f0', fontFamily: 'serif', cornerStyle: 'pill' } },
];

// ─── Main ───────────────────────────────────────────────────────────────────

export default function SettingsView() {
  const settings = useSettingsStore();
  const { setActiveTab: setGlobalTab } = useDashboardStore();
  const [d, setD] = useState<BillDesign>(settings.billDesign);
  const { addToast } = useToastStore();
  const { currentUser } = useAuthStore();

  const upd = (updates: Partial<BillDesign>) => setD(prev => ({ ...prev, ...updates }));

  const handleApply = () => {
    settings.setBillDesign(d);
    addToast('Bill design settings applied successfully', 'success');
  };

  const handleTest = () => {
    // Generate dummy transaction for test
    const dummyTx = {
      id: 'TEST-1000',
      timestamp: new Date().toISOString(),
      items: [
        { id: 1, productId: 1, name: 'Cyberpunk Keycap', article: 'KC-001', variant: 'Neon', price: 45.0, quantity: 1, tax: 3.6 },
        { id: 2, productId: 2, name: 'Resin Switch Lube', article: 'SL-002', variant: 'Standard', price: 15.0, quantity: 2, tax: 2.4 }
      ],
      subtotal: 75.0,
      taxTotal: 6.0,
      discount: 0,
      total: 81.0,
      paymentMethod: 'Credit Card',
      channel: 'pos' as const,
      status: 'completed' as const,
    };
    printReceipt(dummyTx, { ...settings, billDesign: d });
    addToast('Test receipt generated', 'info');
  };

  const [notifs, setNotifs] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [previewZoom, setPreviewZoom] = useState(false);
  const [subTab, setSubTab] = useState<'system' | 'users'>('system');

  const canManageUsers = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  return (
    <div className="w-full space-y-4 md:space-y-6">

      {/* Page title - Compact */}
      <div className="mb-2 flex items-center gap-4">
        <button 
          onClick={() => setGlobalTab('Management')}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-resin"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none mb-1">Settings</h2>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em]">Manage your store & receipt design</p>
        </div>
      </div>

      {/* Sub-tabs (admin+ only) */}
      {canManageUsers && (
        <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-2xl p-1 w-fit">
          {[{ key: 'system', label: '⚙️ System & Bill Designer' }, { key: 'users', label: '👥 Team & Access' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key as typeof subTab)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                subTab === tab.key
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── USER MANAGEMENT ── */}
      {canManageUsers && subTab === 'users' && <UserManagementView />}

      {/* ── SYSTEM + BILL DESIGNER ── */}
      {subTab === 'system' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Left controls */}
          <div className="xl:col-span-3 space-y-3">

            {/* Organization */}
            <SectionAccordion icon={Globe} title="Organization" accent="#6366f1" defaultOpen>
              <Field label="Brand Name">
                <TextInput value={settings.siteName} onChange={e => settings.setSiteName(e.target.value)} placeholder="Your brand..." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Currency">
                  <div className="flex gap-2">
                    <select
                      value={settings.currency}
                      onChange={e => settings.setCurrency(e.target.value)}
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all appearance-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="BDT">BDT (৳)</option>
                    </select>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/exchange-rates');
                          if (!res.ok) throw new Error('API failed');
                          const data = await res.json();
                          settings.updateExchangeRates(data.rates);
                          addToast('Exchange rates updated successfully', 'success');
                        } catch (err) {
                          addToast('Failed to fetch exchange rates', 'error');
                        }
                      }}
                      className="px-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-indigo-400 hover:text-indigo-300 transition-all"
                      title="Fetch Latest Rates"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </Field>
                <Field label="Tax Rate %">
                  <TextInput type="number" value={settings.defaultTaxRate} onChange={e => settings.setDefaultTaxRate?.(Number(e.target.value))} min={0} max={100} />
                </Field>
              </div>
              <Field label={`Alert when stock is below: ${settings.lowStockThreshold} units`}>
                <input type="range" min="5" max="50" value={settings.lowStockThreshold}
                  onChange={e => settings.setLowStockThreshold?.(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" />
              </Field>
            </SectionAccordion>

            {/* Bill Designer */}
            <SectionAccordion icon={Sparkles} title="Bill Designer" accent="#f59e0b" defaultOpen>

              {/* Quick themes */}
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Quick Themes</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_THEMES.map(({ name, emoji, patch }) => (
                    <button key={name} onClick={() => upd(patch)} title={name}
                      className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all group">
                      <span className="text-xl">{emoji}</span>
                      <span className="text-[9px] font-bold text-white/40 group-hover:text-white/70 uppercase tracking-wide leading-none text-center">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="border-t border-white/5 pt-5 space-y-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><FileText size={10} /> Content</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Header Title"><TextInput value={d.headerText} onChange={e => upd({ headerText: e.target.value })} placeholder="e.g. Official Receipt" /></Field>
                  <Field label="Sub-Header"><TextInput value={d.subHeaderText} onChange={e => upd({ subHeaderText: e.target.value })} placeholder="e.g. Premium Products" /></Field>
                  <Field label="Footer Message"><TextInput value={d.footerText} onChange={e => upd({ footerText: e.target.value })} placeholder="e.g. Thank you!" /></Field>
                  <Field label="Brand Tagline"><TextInput value={d.tagline} onChange={e => upd({ tagline: e.target.value })} placeholder="e.g. aeroresin.co" /></Field>
                </div>
              </div>

              {/* Colour System */}
              <div className="border-t border-white/5 pt-5 space-y-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><Palette size={10} /> Colors</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <ColorSwatch label="Brand Color" value={d.accentColor} onChange={v => upd({ accentColor: v })} />
                  <ColorSwatch label="Background" value={d.bgColor} onChange={v => upd({ bgColor: v })} />
                  <ColorSwatch label="Text" value={d.textColor} onChange={v => upd({ textColor: v })} />
                  <ColorSwatch label="Caption Text" value={d.mutedColor} onChange={v => upd({ mutedColor: v })} />
                  <ColorSwatch label="Border" value={d.borderColor} onChange={v => upd({ borderColor: v })} />
                  <ColorSwatch label="Total Row BG" value={d.totalBgColor} onChange={v => upd({ totalBgColor: v })} />
                </div>
              </div>

              {/* Typography */}
              <div className="border-t border-white/5 pt-5 space-y-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><Type size={10} /> Typography</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Font Family">
                    <SegmentControl value={d.fontFamily} onChange={v => upd({ fontFamily: v })}
                      options={[{ value: 'sans', label: 'Sans' }, { value: 'mono', label: 'Mono' }, { value: 'serif', label: 'Serif' }]} />
                  </Field>
                  <Field label="Font Size">
                    <SegmentControl value={d.fontSize} onChange={v => upd({ fontSize: v })}
                      options={[{ value: 'sm', label: 'Sm' }, { value: 'base', label: 'Md' }, { value: 'lg', label: 'Lg' }]} />
                  </Field>
                  <Field label="Font Weight">
                    <SegmentControl value={d.fontWeight} onChange={v => upd({ fontWeight: v })}
                      options={[{ value: 'normal', label: 'Reg' }, { value: 'bold', label: 'Bld' }, { value: 'black', label: 'Blk' }]} />
                  </Field>
                </div>
                <Field label="Header Alignment">
                  <SegmentControl value={d.headerAlign} onChange={v => upd({ headerAlign: v })}
                    options={[
                      { value: 'left', label: 'Left', icon: <AlignLeft size={11} /> },
                      { value: 'center', label: 'Center', icon: <AlignCenter size={11} /> },
                      { value: 'right', label: 'Right', icon: <AlignRight size={11} /> },
                    ]} />
                </Field>
              </div>

              {/* Layout & Shape */}
              <div className="border-t border-white/5 pt-5 space-y-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><Layout size={10} /> Layout &amp; Shape</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Paper Type">
                    <SegmentControl value={d.paperType} onChange={v => upd({ paperType: v })}
                      options={[{ value: 'thermal', label: 'Thermal' }, { value: 'classic', label: 'Classic' }, { value: 'modern', label: 'Modern' }]} />
                  </Field>
                  <Field label="Corner Style">
                    <SegmentControl value={d.cornerStyle} onChange={v => upd({ cornerStyle: v })}
                      options={[{ value: 'square', label: 'Square' }, { value: 'rounded', label: 'Round' }, { value: 'pill', label: 'Pill' }]} />
                  </Field>
                  <Field label="Border Style">
                    <SegmentControl value={d.borderStyle} onChange={v => upd({ borderStyle: v })}
                      options={[{ value: 'none', label: 'None' }, { value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dash' }, { value: 'double', label: 'Dbl' }]} />
                  </Field>
                  <Field label="Accent Bar">
                    <SegmentControl value={d.accentPosition} onChange={v => upd({ accentPosition: v })}
                      options={[{ value: 'none', label: 'None' }, { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bot' }, { value: 'both', label: 'Both' }]} />
                  </Field>
                </div>
                <Field label={`Accent Bar Width: ${d.accentWidth}px`}>
                  <input type="range" min="2" max="12" value={d.accentWidth} onChange={e => upd({ accentWidth: Number(e.target.value) })}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-400" />
                </Field>
              </div>

              {/* Section Visibility */}
              <div className="border-t border-white/5 pt-5 space-y-2">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2"><Eye size={10} /> Section Visibility</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <ToggleRow icon={Calendar} label="Date" value={d.showDate} onChange={v => upd({ showDate: v })} />
                  <ToggleRow icon={Clock} label="Time" value={d.showTime} onChange={v => upd({ showTime: v })} />
                  <ToggleRow icon={Hash} label="Order ID" value={d.showOrderId} onChange={v => upd({ showOrderId: v })} />
                  <ToggleRow icon={Percent} label="Tax Line" value={d.showTax} onChange={v => upd({ showTax: v })} />
                  <ToggleRow icon={Minus} label="Discount Line" value={d.showDiscount} onChange={v => upd({ showDiscount: v })} />
                  <ToggleRow icon={CreditCard} label="Payment Method" value={d.showPaymentMethod} onChange={v => upd({ showPaymentMethod: v })} />
                  <ToggleRow icon={Barcode} label="Barcode" value={d.showBarcode} onChange={v => upd({ showBarcode: v })} accent="#8b5cf6" />
                  <ToggleRow icon={PenLine} label="Signature Line" value={d.showSignatureLine} onChange={v => upd({ showSignatureLine: v })} accent="#8b5cf6" />
                  <ToggleRow icon={Phone} label="Customer Phone" value={d.showCustomerPhone} onChange={v => upd({ showCustomerPhone: v })} accent="#8b5cf6" />
                  <ToggleRow icon={Scissors} label="Perforations" value={d.showPerforations} onChange={v => upd({ showPerforations: v })} accent="#f59e0b" />
                  <ToggleRow icon={Layers} label="Separator Lines" value={d.showSeparatorLines} onChange={v => upd({ showSeparatorLines: v })} accent="#f59e0b" />
                </div>
              </div>
            </SectionAccordion>

            {/* Interface Preferences */}
            <SectionAccordion icon={Sliders} title="App Preferences" accent="#8b5cf6">
              <div className="space-y-2">
                <ToggleRow icon={Bell} label="Push Notifications" sub="Inventory and order alerts" value={notifs} onChange={setNotifs} accent="#8b5cf6" />
                <ToggleRow icon={Zap} label="Auto-Save Changes" sub="No manual confirmation required" value={autoSave} onChange={setAutoSave} accent="#8b5cf6" />
                <ToggleRow icon={Star} label="Motion & Animations" sub="UI micro-interactions" value={animations} onChange={setAnimations} accent="#8b5cf6" />
              </div>
            </SectionAccordion>

            {/* Security */}
            <SectionAccordion icon={Shield} title="Security" accent="#ef4444">
              <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><Shield size={16} /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">PIN Login Enabled</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Role-based access is enabled for all users</p>
                </div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">Active</span>
              </div>
            </SectionAccordion>

          </div>

          {/* Right: Live Preview */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><Check size={18} /></div>
              <div>
                <p className="text-xs font-black uppercase text-emerald-400">Saved</p>
                <p className="text-[10px] text-white/30 uppercase tracking-tight">Deployed: Just now</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="xl:sticky xl:top-4 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Bill Preview</p>
                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </div>
                </div>
                <button onClick={() => setPreviewZoom(v => !v)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 hover:text-white/70 transition-colors">
                  {previewZoom ? <EyeOff size={12} /> : <Eye size={12} />}
                  {previewZoom ? 'Fit' : 'Zoom'}
                </button>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-3xl p-5 shadow-inner overflow-hidden"
                style={{ maxHeight: previewZoom ? 'none' : 520 }}>
                <div className="origin-top transition-transform duration-300"
                  style={{ transform: previewZoom ? 'scale(1)' : 'scale(0.88)', transformOrigin: 'top center' }}>
                  <BillPreview d={d} siteName={settings.siteName} currency={settings.currency} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => { settings.resetBillDesign?.(); setD(settings.billDesign); addToast('Settings reset to default', 'info'); }}
                  className="py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                  <RotateCcw size={11} /> Reset
                </button>
                <button onClick={handleTest} className="py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                  <Printer size={11} /> Test
                </button>
                <button onClick={handleApply} className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                  <Zap size={11} /> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
