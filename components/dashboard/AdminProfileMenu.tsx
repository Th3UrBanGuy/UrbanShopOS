'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Settings, LogOut, ChevronRight, Edit2, X, Save,
  Bell, Shield, Moon, Palette, Key, LayoutGrid
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toastStore';

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

  const { pushNotifications, setPushNotifications, isDarkMode, setDarkMode, isCompactView, setCompactView } = useSettingsStore();
  const { currentUser } = useAuthStore();
  const { updateUser } = useUserStore();
  const { addToast } = useToastStore();

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinData, setPinData] = useState({ current: '', new: '', confirm: '' });

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Admin Chief',
    email: 'admin@aeroresin.com',
    role: 'Super Administrator',
  });
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

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

  const toggleSetting = (key: string) => {
    if (key === 'darkMode') setDarkMode(!isDarkMode);
    if (key === 'compactView') setCompactView(!isCompactView);
    if (key === 'notifications') setPushNotifications(!pushNotifications);
  };

  const handlePinChange = async () => {
    if (!currentUser) return;
    if (pinData.current !== currentUser.pin) return addToast('Current PIN is incorrect', 'error');
    if (pinData.new.length !== 6) return addToast('New PIN must be 6 digits', 'error');
    if (pinData.new !== pinData.confirm) return addToast('New PINs do not match', 'error');

    await updateUser(currentUser.id, { pin: pinData.new });
    addToast('Security PIN updated successfully', 'success');
    setShowPinModal(false);
    setPinData({ current: '', new: '', confirm: '' });
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
                className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm"
                onClick={() => { if (!editing) setModalOpen(false); }}
              />

              {/* Modal Panel */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                className="relative z-10 w-full sm:max-w-lg mx-0 sm:mx-4 
                           bg-[var(--background)] border-t sm:border border-[var(--card-border)] 
                           rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                style={{
                  maxHeight: 'calc(100vh - 48px)',
                  boxShadow: 'var(--shadow-resin)',
                }}
              >
                {/* Drag Handle (mobile) */}
                <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/20" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 px-6 pt-4 pb-4 border-b border-[var(--card-border)] shrink-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center">
                    <User size={24} className="text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[var(--text-primary)] text-base leading-none truncate">{profile.name}</p>
                    <p className="text-[11px] text-indigo-400 uppercase tracking-widest mt-1 truncate">{profile.role}</p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="shrink-0 w-8 h-8 rounded-full bg-[var(--card-bg)] hover:bg-[var(--card-bg)]/80 border border-[var(--card-border)] flex items-center justify-center transition-colors text-[var(--text-primary)]"
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
                        'flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                        activeTab === tab
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]/80'
                      )}
                    >
                      {tab === 'profile' ? '👤 Profile' : '⚙️ Preferences'}
                    </button>
                  ))}
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">

                  {/* ── PROFILE TAB ── */}
                  {activeTab === 'profile' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Identity Record</p>
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
                              className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-indigo-500 focus:bg-[var(--input-bg)]/80 transition-all"
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
                              className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-indigo-500 focus:bg-[var(--input-bg)]/80 transition-all"
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
                            className="flex-1 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]/80 text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--card-border)]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="flex-1 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
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
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-2">Account Preferences</p>

                      <div className="space-y-2">
                        <ToggleRow 
                          icon={Bell} 
                          label="Push Notifications" 
                          sub="Dashboard alerts and updates" 
                          value={pushNotifications} 
                          onChange={setPushNotifications} 
                        />
                        <ToggleRow 
                          icon={Moon} 
                          label="Dark Interface" 
                          sub="Always use dark theme" 
                          value={isDarkMode} 
                          onChange={setDarkMode} 
                        />
                        <ToggleRow 
                          icon={LayoutGrid} 
                          label="Compact View" 
                          sub="Dense data layout mode" 
                          value={isCompactView} 
                          onChange={setCompactView} 
                        />
                      </div>

                      {/* Security section */}
                      <div className="mt-6">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mb-3">Security</p>
                        <button 
                          onClick={() => setShowPinModal(true)}
                          className="w-full flex items-center gap-4 bg-[var(--card-bg)] hover:bg-[var(--card-bg)]/80 border border-[var(--card-border)] rounded-2xl px-4 py-4 transition-colors group text-left"
                        >
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--card-bg)]/50 border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                            <Key size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">Change Access PIN</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1">Update your 6-digit portal PIN</p>
                          </div>
                          <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Footer */}
                <div className="px-6 pb-6 pt-3 border-t border-[var(--card-border)] shrink-0">
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
              ? 'border-[var(--accent)] from-[var(--accent)] to-purple-700 shadow-[0_0_18px_var(--accent-glow)]'
              : 'border-[var(--card-border)] from-indigo-500 to-purple-600 hover:border-[var(--accent)]/30'
          )}
        >
          <User size={18} className="text-white" />
        </motion.button>

        {/* Dropdown Mini-Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="absolute top-12 right-0 w-60 z-[500] rounded-2xl overflow-hidden border border-[var(--card-border)]"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(24px)',
                boxShadow: 'var(--shadow-resin)',
              }}
            >
              {/* Identity strip */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--card-border)]">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border border-indigo-500/30 flex items-center justify-center">
                  <User size={17} className="text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate leading-none">{profile.name}</p>
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
                <div className="h-px bg-[var(--card-border)] my-1" />
                <div className="p-2 space-y-1">
                          <button
                            onClick={() => setShowPinModal(true)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--card-bg)]/80 transition-colors group/item"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Key size={16} />
                              </div>
                              <span className="text-xs font-bold text-[var(--text-muted)] group-hover/item:text-[var(--text-primary)]">Change Access PIN</span>
                            </div>
                            <ChevronRight size={14} className="text-[var(--text-muted)] group-hover/item:text-[var(--text-muted)]/50" />
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-rose-500/10 transition-colors group/item"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                                <LogOut size={16} />
                              </div>
                              <span className="text-xs font-bold text-rose-400 group-hover/item:text-rose-300">End Session</span>
                            </div>
                          </button>
                        </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* PIN CHANGE MODAL */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--background)] border border-[var(--card-border)] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight">Security PIN</h3>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Update Access Code</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Current PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinData.current}
                    onChange={(e) => setPinData({ ...pinData, current: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-indigo-500/50 transition-colors text-[var(--text-primary)]"
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">New 6-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinData.new}
                    onChange={(e) => setPinData({ ...pinData, new: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-indigo-500/50 transition-colors text-[var(--text-primary)]"
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Confirm New PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinData.confirm}
                    onChange={(e) => setPinData({ ...pinData, confirm: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-3 px-4 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-indigo-500/50 transition-colors text-[var(--text-primary)]"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => setShowPinModal(false)}
                  className="py-3.5 rounded-2xl border border-[var(--card-border)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--card-bg)]/80 transition-colors text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinChange}
                  className="py-3.5 rounded-2xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)]/90 transition-colors shadow-lg shadow-[var(--accent)]/20"
                >
                  Update PIN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>

      {modal}
    </>
  );
}

/* ── Helpers ── */
function ToggleRow({ 
  icon: Icon, label, sub, value, onChange, accent = 'var(--accent)' 
}: { 
  icon: React.ElementType; label: string; sub: string; value: boolean; onChange: (v: boolean) => void; accent?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[2rem] bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--card-bg)]/80 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{label}</p>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{sub}</p>
        </div>
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-all flex items-center px-1",
          value ? "bg-[var(--accent)]" : "bg-[var(--card-border)]"
        )}
      >
        <motion.div 
          animate={{ x: value ? 20 : 0 }}
          className="w-4 h-4 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}

function MenuItem({
  icon: Icon, label, sub, onClick
}: { icon: React.ElementType; label: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--card-bg)]/80 transition-colors group text-left"
    >
      <div className="w-7 h-7 rounded-lg bg-[var(--card-bg)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-300 group-hover:bg-indigo-500/15 transition-colors">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-primary)] leading-none">{label}</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{sub}</p>
      </div>
      <ChevronRight size={13} className="text-[var(--text-muted)]/50 group-hover:text-[var(--text-primary)]/50 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5 pl-1">{label}</label>
      {children}
    </div>
  );
}

function DisplayField({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div className={cn(
      'w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-sm font-medium',
      dim ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
    )}>
      {children}
    </div>
  );
}
