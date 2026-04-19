'use client';

import React, { useState } from 'react';
import {
  Globe, Percent, Palette, Type, Check,
  Layout, Zap, Bell, Sliders,
  Eye, EyeOff, RotateCcw, Star, AlignLeft, AlignCenter,
  AlignRight, Minus, FileText, Hash, Clock, Calendar,
  CreditCard, Barcode, PenLine, Scissors, Layers, Sparkles, Phone, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore, BillDesign } from '@/store/settingsStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useToastStore } from '@/store/toastStore';
import ReceiptDocument from './ReceiptDocument';

// ─── UI Primitives ──────────────────────────────────────────────────────────


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] font-medium outline-none transition-all focus:border-[var(--accent)]/50 focus:bg-[var(--card-bg)] placeholder:text-[var(--text-muted)]"
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
    <div className="flex bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-1 gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
            value === opt.value ? 'bg-[var(--text-primary)] text-[var(--background)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
      <div className="flex items-center gap-2.5 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-3 py-2 group-hover:border-[var(--text-muted)] transition-colors">
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
      value ? 'bg-[var(--card-bg)] border-[var(--card-border)]' : 'bg-transparent border-[var(--card-border)]'
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

// ─── Report Live Preview ────────────────────────────────────────────────────

function ReportPreview({ d, siteName }: { d: BillDesign; siteName: string }) {
  const showSerial = d.showSerial ?? true;
  const reportAccent = d.reportAccentColor ?? '#10b981';
  const reportHeader = d.reportHeader || 'Shop Sales Report';
  const reportFooter = d.reportFooter || 'Created with UrbanShopOS';

  return (
    <div className="w-full bg-white text-black rounded-sm overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ height: 6, background: reportAccent }} />
      <div className="px-6 py-5">
        <div className="pb-4 mb-4 flex flex-col border-b-2 border-gray-100/20" style={{ borderBottom: '2px solid #eee' }}>
          <span style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', color: reportAccent, letterSpacing: '-0.03em' }}>{siteName}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>{reportHeader}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Monthly Report</span>
        </div>
        
        <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0, marginTop: 10 }}>
          <thead>
            <tr>
              {showSerial && <th style={{ padding: '8px 10px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#666', borderBottom: '2px solid #eee', background: '#fcfcfc', width: 30, textAlign: 'center' }}>SL</th>}
              <th style={{ padding: '8px 10px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#666', borderBottom: '2px solid #eee', background: '#fcfcfc' }}>Description</th>
              <th style={{ padding: '8px 10px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#666', borderBottom: '2px solid #eee', background: '#fcfcfc', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {[
              { desc: 'Resin Restock', amt: '$120.00' },
              { desc: 'Packaging Materials', amt: '$45.50' },
              { desc: 'Marketing Ad Spend', amt: '$250.00' }
            ].map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 1 ? '#fafafa' : '#fff' }}>
                {showSerial && <td style={{ padding: 8, fontSize: 10, fontWeight: 700, color: '#999', borderBottom: '1px solid #f2f2f2', textAlign: 'center' }}>{String(idx + 1).padStart(2, '0')}</td>}
                <td style={{ padding: 8, fontSize: 10, fontWeight: 500, color: '#333', borderBottom: '1px solid #f2f2f2' }}>{row.desc}</td>
                <td style={{ padding: 8, fontSize: 10, fontWeight: 500, color: '#333', borderBottom: '1px solid #f2f2f2', textAlign: 'right' }}>{row.amt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: 30, paddingTop: 15, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{reportFooter}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Preset Themes ──────────────────────────────────────────────────────────

const PRESET_THEMES: { name: string; emoji: string; patch: Partial<BillDesign> }[] = [
  { name: 'Urban',     emoji: '✦', patch: { accentColor: '#6366f1', bgColor: '#ffffff', textColor: '#1a1a1a', mutedColor: '#888', totalBgColor: '#f5f5f5', fontFamily: 'sans', cornerStyle: 'rounded' } },
  { name: 'Midnight', emoji: '🌑', patch: { accentColor: '#a78bfa', bgColor: '#0d0d14', textColor: '#e8e8ff', mutedColor: '#6060a0', totalBgColor: '#14141f', fontFamily: 'mono', cornerStyle: 'rounded' } },
  { name: 'Forest',   emoji: '🌿', patch: { accentColor: '#22c55e', bgColor: '#f0faf0', textColor: '#1a2a1a', mutedColor: '#5a8060', totalBgColor: '#e8f5e8', fontFamily: 'sans', cornerStyle: 'rounded' } },
  { name: 'Fire',     emoji: '🔥', patch: { accentColor: '#f97316', bgColor: '#fff9f0', textColor: '#2a1a0a', mutedColor: '#9a6040', totalBgColor: '#fef3e8', fontFamily: 'serif', cornerStyle: 'square' } },
  { name: 'Ocean',    emoji: '🌊', patch: { accentColor: '#06b6d4', bgColor: '#f0faff', textColor: '#0a1a2a', mutedColor: '#407080', totalBgColor: '#e0f5ff', fontFamily: 'sans', cornerStyle: 'rounded' } },
  { name: 'Rose',     emoji: '🌸', patch: { accentColor: '#e879a0', bgColor: '#fff0f5', textColor: '#2a0a1a', mutedColor: '#a06080', totalBgColor: '#ffe8f0', fontFamily: 'serif', cornerStyle: 'pill' } },
];

const TOOLBOX_CARDS = [
  { id: 'org', icon: Globe, label: 'Business Info', desc: 'Shop name, currency, and tax', color: '#6366f1' },
  { id: 'bill', icon: Sparkles, label: 'Receipt Setup', desc: 'Design your billing receipts', color: '#f59e0b' },
  { id: 'report', label: 'Report Style', icon: FileText, desc: 'Customize printed reports', color: '#10b981' },
  { id: 'prefs', label: 'System Tips', icon: Sliders, desc: 'Notifications & animations', color: '#8b5cf6' }
];

// ─── Main ───────────────────────────────────────────────────────────────────

export default function SettingsView() {
  const settings = useSettingsStore();
  const { setActiveTab: setGlobalTab } = useDashboardStore();
  const [d, setD] = useState<BillDesign>(settings.billDesign);
  const { addToast } = useToastStore();

  const upd = (updates: Partial<BillDesign>) => setD(prev => ({ ...prev, ...updates }));

  const handleApply = () => {
    settings.setBillDesign(d);
    addToast('Design settings applied successfully', 'success');
  };


  const [notifs, setNotifs] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [previewZoom, setPreviewZoom] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="w-full space-y-4 md:space-y-6">

      {/* Page title - Compact */}
      <div className="mb-2 flex items-center gap-4">
        <button 
          onClick={() => activeTool ? setActiveTool(null) : setGlobalTab('Hub')}
          className="w-10 h-10 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-all shadow-resin"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none mb-1">Settings</h2>
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">System setup & branding</p>
        </div>
      </div>

      {/* ── SYSTEM TOOLBOX ── */}
      {!activeTool && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 mt-4">
          {TOOLBOX_CARDS.map(card => (
            <button
              key={card.id}
              onClick={() => setActiveTool(card.id)}
              className="group text-left p-8 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--text-muted)] hover:bg-[var(--card-bg)] transition-all duration-300 flex flex-col gap-5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div 
                className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-resin relative z-10"
                style={{ background: card.color + '15', border: `1px solid ${card.color}30`, color: card.color }}
              >
                <card.icon size={26} strokeWidth={1.5} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tighter">{card.label}</h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mt-1">{card.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTool && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-4">
          {/* Left controls */}
          <div className="xl:col-span-3 space-y-4">
             <button onClick={() => setActiveTool(null)} className="flex w-fit items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all uppercase tracking-widest">
               <ArrowLeft size={12} /> Back to Toolbox
             </button>
             
             <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 space-y-8">
               
               {/* ORGANIZATION TOOL */}
               {activeTool === 'org' && (
                 <>
                  <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 mb-4"><Globe className="text-[var(--accent)]" size={20} /> Business Info</h3>
                    <div className="space-y-4">
                      <Field label="Shop Name">
                        <TextInput value={settings.siteName} onChange={e => settings.setSiteName(e.target.value)} placeholder="Shop name..." />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Currency">
                          <div className="flex gap-2">
                            <select
                              value={settings.currency}
                              onChange={e => settings.setCurrency(e.target.value)}
                              className="flex-1 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent)]/5 focus:bg-[var(--card-bg)] transition-all appearance-none"
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
                                } catch {
                                  addToast('Failed to fetch exchange rates', 'error');
                                }
                              }}
                              className="px-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--text-muted)] text-[var(--accent)] transition-all"
                              title="Fetch Latest Rates"
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </Field>
                        <Field label="Govt Tax %">
                          <TextInput type="number" value={settings.defaultTaxRate} onChange={e => settings.setDefaultTaxRate?.(Number(e.target.value))} min={0} max={100} />
                        </Field>
                      </div>
                      <Field label={`Alert when stock is below: ${settings.lowStockThreshold} units`}>
                        <div className="flex items-center gap-4">
                           <input type="range" min="5" max="50" value={settings.lowStockThreshold}
                             onChange={e => settings.setLowStockThreshold?.(Number(e.target.value))}
                             className="flex-1 h-1.5 bg-[var(--card-border)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]" />
                           <span className="text-xs font-black text-[var(--accent)] min-w-[20px]">{settings.lowStockThreshold}</span>
                        </div>
                      </Field>
                      <Field label={`Stock Hold at Counter: ${settings.stockHoldMinutes} minutes`}>
                        <div className="flex items-center gap-4">
                           <input type="range" min="1" max="60" value={settings.stockHoldMinutes}
                             onChange={e => settings.setStockHoldMinutes?.(Number(e.target.value))}
                             className="flex-1 h-1.5 bg-[var(--card-border)] rounded-full appearance-none cursor-pointer accent-amber-500" />
                           <span className="text-xs font-black text-amber-500 min-w-[20px] ml-1">{settings.stockHoldMinutes}</span>
                        </div>
                      </Field>
                    </div>
                  </div>
                 </>
               )}

               {/* BILL DESIGNER TOOL */}
               {activeTool === 'bill' && (
                 <>
                  <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 mb-4"><Sparkles className="text-amber-500" size={20} /> Receipt Setup</h3>
                  
                  {/* Quick themes */}
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Quick Themes</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_THEMES.map(({ name, emoji, patch }) => (
                        <button key={name} onClick={() => upd(patch)} title={name}
                          className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all group">
                          <span className="text-xl">{emoji}</span>
                          <span className="text-[9px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] uppercase tracking-wide leading-none text-center">{name}</span>
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
                      <Field label="Footer Title"><TextInput value={d.footerText} onChange={e => upd({ footerText: e.target.value })} placeholder="e.g. Thank you!" /></Field>
                      <Field label="Slogan / Website"><TextInput value={d.tagline} onChange={e => upd({ tagline: e.target.value })} placeholder="e.g. urbanshopos.com" /></Field>
                    </div>
                  </div>

                  {/* Colour System */}
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><Palette size={10} /> Colors</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <ColorSwatch label="Accent Color" value={d.accentColor} onChange={v => upd({ accentColor: v })} />
                      <ColorSwatch label="Background" value={d.bgColor} onChange={v => upd({ bgColor: v })} />
                      <ColorSwatch label="Text" value={d.textColor} onChange={v => upd({ textColor: v })} />
                      <ColorSwatch label="Small Text" value={d.mutedColor} onChange={v => upd({ mutedColor: v })} />
                      <ColorSwatch label="Border" value={d.borderColor} onChange={v => upd({ borderColor: v })} />
                      <ColorSwatch label="Total Box BG" value={d.totalBgColor} onChange={v => upd({ totalBgColor: v })} />
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2"><Type size={10} /> Typography</p>
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
                 </>
               )}

               {/* REPORT BRANDING TOOL */}
               {activeTool === 'report' && (
                 <>
                  <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 mb-4"><FileText className="text-emerald-500" size={20} /> Report Style</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Default Report Header">
                        <TextInput value={d.reportHeader} onChange={e => upd({ reportHeader: e.target.value })} placeholder="e.g. Official Business Report" />
                      </Field>
                      <Field label="Default Report Footer">
                        <TextInput value={d.reportFooter} onChange={e => upd({ reportFooter: e.target.value })} placeholder="e.g. Created with UrbanShopOS" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <ColorSwatch label="Report Accent" value={d.reportAccentColor} onChange={v => upd({ reportAccentColor: v })} />
                      <div className="flex items-end pb-1">
                        <ToggleRow icon={Hash} label="Show Serial Numbers" value={d.showSerial} onChange={v => upd({ showSerial: v })} accent="#10b981" />
                      </div>
                    </div>
                  </div>
                 </>
               )}



               {/* PREFERENCES TOOL */}
               {activeTool === 'prefs' && (
                 <>
                  <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 mb-4"><Sliders className="text-purple-500" size={20} /> System Tips</h3>
                  <div className="space-y-2">
                    <ToggleRow icon={Bell} label="Push Notifications" sub="Inventory and order alerts" value={notifs} onChange={setNotifs} accent="#8b5cf6" />
                    <ToggleRow icon={Zap} label="Auto-Save Changes" sub="No manual confirmation required" value={autoSave} onChange={setAutoSave} accent="#8b5cf6" />
                    <ToggleRow icon={Star} label="Motion & Animations" sub="UI micro-interactions" value={animations} onChange={setAnimations} accent="#8b5cf6" />
                  </div>
                 </>
               )}
             </div>
          </div>
          
          {/* Right: Live Preview (Only for bill and report) */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><Check size={18} /></div>
              <div>
                <p className="text-xs font-black uppercase text-emerald-400">Status</p>
                <p className="text-[10px] text-white/30 uppercase tracking-tight">Active Workspace</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {(activeTool === 'bill' || activeTool === 'report') && (
              <div className="xl:sticky xl:top-4 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                      {activeTool === 'bill' ? 'Bill Preview' : 'Report Preview'}
                    </p>
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
                    {activeTool === 'bill' && (
                      <ReceiptDocument 
                        siteName={settings.siteName}
                        currency={settings.currency}
                        billDesign={d}
                        transactionId="TXN-DEMO-8240"
                        timestamp={new Date().toISOString()}
                        items={[
                          { name: 'Fluid Resin Panel', quantity: 2, price: 140.00, article: 'SH-2024-X' },
                          { name: 'AeroGel Coating', quantity: 1, price: 85.00, article: 'AC-992-B' }
                        ]}
                        subtotal={365.00}
                        taxTotal={43.80}
                        discount={15.00}
                        couponCode="AERO15"
                        total={393.80}
                        paymentMethod="CASH"
                        channel="pos"
                        customerName="Test Customer"
                        customerPhone="+880 1712-345678"
                        className="shadow-2xl scale-[0.8] lg:scale-[0.9] origin-top mx-auto"
                      />
                    )}
                    {activeTool === 'report' && <ReportPreview d={d} siteName={settings.siteName} />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { settings.resetBillDesign?.(); setD(settings.billDesign); addToast('Settings reset to default', 'info'); }}
                    className="py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                    <RotateCcw size={11} /> Reset
                  </button>
                  <button onClick={handleApply} className="py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                    <Zap size={11} /> Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
