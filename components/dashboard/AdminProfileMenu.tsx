'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Settings, LogOut, ChevronRight, Edit2, X, Save,
  Bell, Shield, Moon, Palette, Key
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface AccountSettings {
  notifications: boolean;
  darkMode: boolean;
  compactView: boolean;
}

type ActiveTab = 'profile' | 'settings';

export default function AdminProfileMenu() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const triggerRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Admin Chief',
    email: 'admin@aeroresin.com',
    role: 'Super Administrator',
  });
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  const [settings, setSettings] = useState<AccountSettings>({
    notifications: true,
    darkMode: true,
    compactView: false,
  });

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    setModalOpen(false);
    logout();
    router.push('/');
  };

  const openModal = (tab: ActiveTab) => {
    setMenuOpen(false);
    setActiveTab(tab);
    setTempProfile(profile);
    setEditing(false);
    setModalOpen(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditing(false);
  };

  const toggleSetting = (key: keyof AccountSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // ESC to close modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const settingsItems = [
    { key: 'notifications' as const, icon: Bell, label: 'Push Notifications', desc: 'Dashboard alerts and updates' },
    { key: 'darkMode' as const, icon: Moon, label: 'Dark Interface', desc: 'Always use dark theme' },
    { key: 'compactView' as const, icon: Palette, label: 'Compact View', desc: 'Dense data layout mode' },
  ];

  const modal = mounted && modalOpen
    ? createPortal(
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => { if (!editing) setModalOpen(false); }}
              />

              {/* Modal Panel */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                className="relative z-10 w-full sm:max-w-lg mx-0 sm:mx-4 
                           bg-[#09090f] border-t sm:border border-white/10 
                           rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                style={{
                  maxHeight: 'calc(100vh - 48px)',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                {/* Drag Handle (mobile) */}
                <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 px-6 pt-4 pb-4 border-b border-white/5 shrink-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center">
                    <User size={24} className="text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base leading-none truncate">{profile.name}</p>
                    <p className="text-[11px] text-indigo-400 uppercase tracking-widest mt-1 truncate">{profile.role}</p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-4 shrink-0">
                  {(['profile', 'settings'] as ActiveTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); if (editing) handleCancel(); }}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                        activeTab === tab
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      )}
                    >
                      {tab === 'profile' ? '👤 Profile' : '⚙️ Settings'}
                    </button>
                  ))}
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">

                  {/* ── PROFILE TAB ── */}
                  {activeTab === 'profile' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Identity Record</p>
                        {!editing && (
                          <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                        )}
                      </div>

                      {/* Name */}
                      <Field label="Full Name">
                        {editing
                          ? <input
                              autoFocus
                              value={tempProfile.name}
                              onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
                            />
                          : <DisplayField>{profile.name}</DisplayField>
                        }
                      </Field>

                      {/* Email */}
                      <Field label="Contact Email">
                        {editing
                          ? <input
                              type="email"
                              value={tempProfile.email}
                              onChange={e => setTempProfile({ ...tempProfile, email: e.target.value })}
                              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
                            />
                          : <DisplayField dim>{profile.email}</DisplayField>
                        }
                      </Field>

                      {/* Role (read-only) */}
                      <Field label="System Role">
                        <DisplayField>
                          <span className="flex items-center gap-2">
                            <Shield size={13} className="text-indigo-400" />
                            {profile.role}
                          </span>
                        </DisplayField>
                      </Field>

                      {/* Action bar in edit mode */}
                      {editing && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 pt-2"
                        >
                          <button
                            onClick={handleCancel}
                            className="flex-1 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm font-bold uppercase tracking-wider transition-all border border-white/5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                          >
                            <Save size={14} /> Save
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* ── SETTINGS TAB ── */}
                  {activeTab === 'settings' && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-2">Account Preferences</p>

                      {settingsItems.map(({ key, icon: Icon, label, desc }) => (
                        <div
                          key={key}
                          className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/5 border border-white/5 rounded-2xl px-4 py-4 transition-colors"
                        >
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50">
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-none">{label}</p>
                            <p className="text-[11px] text-white/35 mt-1 truncate">{desc}</p>
                          </div>
                          {/* Toggle */}
                          <button
                            onClick={() => toggleSetting(key)}
                            className={cn(
                              'relative w-11 h-6 rounded-full transition-colors shrink-0 flex-shrink-0',
                              settings[key] ? 'bg-indigo-500' : 'bg-white/15'
                            )}
                          >
                            <motion.div
                              layout
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                              style={{ left: settings[key] ? 'calc(100% - 20px)' : '4px' }}
                            />
                          </button>
                        </div>
                      ))}

                      {/* Security section */}
                      <div className="mt-6">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-3">Security</p>
                        <button className="w-full flex items-center gap-4 bg-white/[0.03] hover:bg-white/5 border border-white/5 rounded-2xl px-4 py-4 transition-colors group text-left">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 group-hover:text-indigo-400 transition-colors">
                            <Key size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white leading-none">Change Access PIN</p>
                            <p className="text-[11px] text-white/35 mt-1">Update your 6-digit portal PIN</p>
                          </div>
                          <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Footer */}
                <div className="px-6 pb-6 pt-3 border-t border-white/5 shrink-0">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all text-sm font-bold uppercase tracking-widest"
                  >
                    <LogOut size={15} />
                    End Session
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      <div ref={triggerRef} className="relative">
        {/* Profile Icon */}
        <motion.button
          onClick={() => setMenuOpen(v => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-9 h-9 md:w-10 md:h-10 rounded-full border bg-gradient-to-br flex items-center justify-center cursor-pointer overflow-hidden transition-all',
            menuOpen
              ? 'border-indigo-400 from-indigo-600 to-purple-700 shadow-[0_0_18px_rgba(99,102,241,0.45)]'
              : 'border-white/10 from-indigo-500 to-purple-600 hover:border-indigo-300/30'
          )}
        >
          <User size={18} className="text-white/90" />
        </motion.button>

        {/* Dropdown Mini-Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="absolute top-12 right-0 w-60 z-[500] rounded-2xl overflow-hidden border border-white/10"
              style={{
                background: 'rgba(8,8,16,0.95)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 50px -5px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Identity strip */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border border-indigo-500/30 flex items-center justify-center">
                  <User size={17} className="text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate leading-none">{profile.name}</p>
                  <p className="text-[9px] uppercase tracking-widest text-indigo-400 mt-1 truncate">{profile.role}</p>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <MenuItem
                  icon={User}
                  label="Profile"
                  sub="View & edit your details"
                  onClick={() => openModal('profile')}
                />
                <MenuItem
                  icon={Settings}
                  label="Settings"
                  sub="Preferences & security"
                  onClick={() => openModal('settings')}
                />
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 transition-colors group text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/5 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                    <LogOut size={14} />
                  </div>
                  <span className="text-sm font-semibold text-rose-400 group-hover:text-rose-300">End Session</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {modal}
    </>
  );
}

/* ── Helpers ── */
function MenuItem({
  icon: Icon, label, sub, onClick
}: { icon: React.ElementType; label: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group text-left"
    >
      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:text-indigo-300 group-hover:bg-indigo-500/15 transition-colors">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 group-hover:text-white leading-none">{label}</p>
        <p className="text-[10px] text-white/35 mt-0.5 truncate">{sub}</p>
      </div>
      <ChevronRight size={13} className="text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-white/35 mb-1.5 pl-1">{label}</label>
      {children}
    </div>
  );
}

function DisplayField({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div className={cn(
      'w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm font-medium',
      dim ? 'text-white/50' : 'text-white'
    )}>
      {children}
    </div>
  );
}
