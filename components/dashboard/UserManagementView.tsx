'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Trash2, Edit2, X, Check, Shield, Crown, User as UserIcon, Users,
  Eye, EyeOff, Key, ChevronDown, ChevronRight, AlertTriangle, Lock,
  LayoutGrid, BarChart3, Package, Ticket, ShoppingCart, BookOpen, Settings, Wallet
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUserStore, SystemUser, UserRole, MANAGEABLE_MODULES } from '@/store/userStore';
import { DashboardTab } from '@/store/dashboardStore';
import { cn } from '@/lib/utils';

// ── Role metadata ─────────────────────────────────────────────────────────
const ROLE_META: Record<UserRole, { label: string; icon: React.ElementType; color: string; bg: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    description: 'Full system access. Can manage all users, roles, and settings.',
  },
  admin: {
    label: 'Administrator',
    icon: Shield,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    description: 'Can assign/remove module access. Cannot delete users or change passwords.',
  },
  user: {
    label: 'Staff Member',
    icon: UserIcon,
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.12)',
    description: 'Limited access to assigned modules only.',
  },
};

const MODULE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  Hub: { label: 'General Hub', icon: LayoutGrid, color: '#6366f1' },
  Stats: { label: 'Sales Analytics', icon: BarChart3, color: '#22d3ee' },
  Inventory: { label: 'Stock Room', icon: Package, color: '#f59e0b' },
  Coupons: { label: 'Offers & Coupons', icon: Ticket, color: '#ec4899' },
  PoS: { label: 'Sales Terminal (PoS)', icon: ShoppingCart, color: '#22c55e' },
  Khorochkhata: { label: 'Expense Ledger', icon: Wallet, color: '#a78bfa' },
  Parties: { label: 'Partner List', icon: Users, color: '#3b82f6' },
  Management: { label: 'Management Hub', icon: Shield, color: '#f43f5e' },
  Settings: { label: 'App Settings', icon: Settings, color: '#94a3b8' },
};

// ── Sub-components ────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const m = ROLE_META[role];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ background: m.bg, color: m.color, borderColor: `${m.color}25` }}>
      <Icon size={10} />
      {m.label}
    </span>
  );
}

function ModuleChip({ tab, active, onClick, disabled }: { tab: DashboardTab; active: boolean; onClick?: () => void; disabled?: boolean }) {
  const m = MODULE_META[tab];
  const Icon = m.icon;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide border transition-all',
        active
          ? 'text-white border-white/20'
          : 'text-white/30 border-white/5 bg-transparent hover:border-white/15 hover:text-white/50',
        disabled && 'cursor-default opacity-70'
      )}
      style={active ? { background: `${m.color}18`, borderColor: `${m.color}35`, color: m.color } : {}}
    >
      <Icon size={11} />
      {m.label}
    </button>
  );
}

// ── Add/Edit User Modal ───────────────────────────────────────────────────

interface UserFormState {
  name: string;
  email: string;
  pin: string;
  role: UserRole;
  allowedModules: DashboardTab[];
}

const EMPTY_FORM: UserFormState = {
  name: '',
  email: '',
  pin: '',
  role: 'user',
  allowedModules: ['Hub'],
};

function UserModal({
  mode,
  initialData,
  onClose,
  onSave,
  currentUserRole,
}: {
  mode: 'add' | 'edit';
  initialData?: Partial<UserFormState>;
  onClose: () => void;
  onSave: (data: UserFormState) => void;
  currentUserRole: UserRole;
}) {
  const [form, setForm] = useState<UserFormState>({ ...EMPTY_FORM, ...initialData });
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormState, string>>>({});

  const isSuperAdmin = currentUserRole === 'super_admin';

  const toggleModule = (tab: DashboardTab) => {
    setForm(f => ({
      ...f,
      allowedModules: f.allowedModules.includes(tab)
        ? f.allowedModules.filter(m => m !== tab)
        : [...f.allowedModules, tab],
    }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.pin || form.pin.length < 4) e.pin = 'PIN must be at least 4 digits';
    if (!/^\d+$/.test(form.pin)) e.pin = 'PIN must be numeric only';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative z-10 w-full sm:max-w-lg mx-0 sm:mx-4 bg-[#09090f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 48px)', boxShadow: '0 -20px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Drag handle mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            {mode === 'add' ? <UserPlus size={18} /> : <Edit2 size={18} />}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-white text-base">{mode === 'add' ? 'Create New User' : 'Edit User'}</h3>
            <p className="text-[11px] text-white/40 uppercase tracking-widest mt-0.5">User Details</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto overscroll-contain px-6 py-5 space-y-5" style={{ maxHeight: 'calc(100vh - 220px)' }}>

          {/* Identity */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">User Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sarah Khan"
                  className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                />
                {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@aeroresin.com"
                  className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>
          </div>

          {/* PIN */}
          {isSuperAdmin && (
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Secret PIN *</p>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={form.pin}
                  onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                  placeholder="Numeric PIN (4–8 digits)"
                  className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.pin && <p className="text-[10px] text-rose-400 mt-1">{errors.pin}</p>}
              <p className="text-[10px] text-white/25 mt-1.5">Use a unique PIN not used by another user.</p>
            </div>
          )}

          {/* Role */}
          {isSuperAdmin && (
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Role</p>
              <div className="space-y-2">
                {(Object.keys(ROLE_META) as UserRole[]).filter(r => r !== 'super_admin').map(role => {
                  const m = ROLE_META[role];
                  const Icon = m.icon;
                  return (
                    <button
                      key={role}
                      onClick={() => setForm(f => ({ ...f, role }))}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                        form.role === role ? 'border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'
                      )}
                      style={form.role === role ? { background: m.bg, borderColor: `${m.color}30` } : {}}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: m.bg, color: m.color }}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{m.label}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{m.description}</p>
                      </div>
                      {form.role === role && <Check size={14} style={{ color: m.color }} className="mt-1 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Module Access */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Module Access</p>
              <div className="flex gap-2">
                <button onClick={() => setForm(f => ({ ...f, allowedModules: [...MANAGEABLE_MODULES] }))} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">All</button>
                <span className="text-white/20">·</span>
                <button onClick={() => setForm(f => ({ ...f, allowedModules: [] }))} className="text-[10px] font-bold text-white/30 hover:text-white/50">None</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {MANAGEABLE_MODULES.map(tab => (
                <ModuleChip
                  key={tab}
                  tab={tab}
                  active={form.allowedModules.includes(tab)}
                  onClick={() => toggleModule(tab)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/8 text-white/50 hover:text-white hover:bg-white/5 text-sm font-bold uppercase tracking-wider transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Check size={15} />
            {mode === 'add' ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function UserManagementView() {
  const { currentUser } = useAuthStore();
  const { users, addUser, updateUser, deleteUser, toggleModule } = useUserStore();

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<SystemUser | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const role = currentUser?.role;
  const canDelete = role === 'super_admin';
  const canEditData = role === 'super_admin';
  const canManageAccess = role === 'super_admin' || role === 'admin';

  const openAdd = () => {
    setEditTarget(null);
    setModalMode('add');
  };

  const openEdit = (user: SystemUser) => {
    setEditTarget(user);
    setModalMode('edit');
  };

  const handleSave = (data: ReturnType<typeof EMPTY_FORM extends infer T ? () => T : never>) => {
    // TypeScript-friendly call
  };

  const handleModalSave = (data: { name: string; email: string; pin: string; role: UserRole; allowedModules: DashboardTab[] }) => {
    if (modalMode === 'add') {
      addUser({
        name: data.name,
        email: data.email,
        pin: data.pin,
        role: data.role,
        allowedModules: data.allowedModules,
        createdBy: currentUser?.id ?? 'unknown',
        isActive: true,
      });
    } else if (modalMode === 'edit' && editTarget) {
      updateUser(editTarget.id, {
        name: data.name,
        email: data.email,
        ...(canEditData ? { pin: data.pin, role: data.role } : {}),
        allowedModules: data.allowedModules,
      });
    }
    setModalMode(null);
    setEditTarget(null);
  };

  if (!canManageAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <Lock size={28} />
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Access Denied</h3>
        <p className="text-sm text-white/40">You don't have permission to manage users.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">Access & Permissions</h3>
          <p className="text-[11px] text-white/35 uppercase tracking-widest mt-0.5">
            {users.length} account{users.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        {canEditData && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold uppercase tracking-wider transition-all"
          >
            <UserPlus size={15} /> Add User
          </button>
        )}
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(ROLE_META) as UserRole[]).map(r => {
          const m = ROLE_META[r];
          const Icon = m.icon;
          return (
            <span key={r} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border" style={{ color: m.color, background: m.bg, borderColor: `${m.color}20` }}>
              <Icon size={9} /> {m.label}
            </span>
          );
        })}
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {users.map(user => {
          const m = ROLE_META[user.role];
          const Icon = m.icon;
          const isExpanded = expandedUser === user.id;
          const isSelf = user.id === currentUser?.id;
          const isSystemAdmin = user.id === 'super-admin';

          return (
            <div
              key={user.id}
              className="rounded-2xl border border-white/5 bg-white/[0.025] overflow-hidden transition-all"
            >
              {/* Row header */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border" style={{ background: m.bg, borderColor: `${m.color}25`, color: m.color }}>
                  <Icon size={18} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-white truncate">{user.name}</p>
                    {isSelf && <span className="text-[9px] bg-white/10 text-white/50 border border-white/10 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">You</span>}
                    {isSystemAdmin && <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">System</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <RoleBadge role={user.role} />
                    {user.email && <span className="text-[10px] text-white/30 truncate">{user.email}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {canEditData && !isSystemAdmin && (
                    <button
                      onClick={() => openEdit(user)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/15 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/25 flex items-center justify-center text-white/40 transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                  {/* Admin can only toggle modules via expand */}
                  {!canEditData && canManageAccess && !isSystemAdmin && (
                    <button
                      onClick={() => openEdit(user)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/40 transition-all"
                    >
                      <Key size={13} />
                    </button>
                  )}
                  {canDelete && !isSystemAdmin && !isSelf && (
                    deleteConfirm === user.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { deleteUser(user.id); setDeleteConfirm(null); }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 text-[10px] font-bold uppercase hover:bg-rose-500/25 transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-white transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 flex items-center justify-center text-white/40 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all"
                  >
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>
                </div>
              </div>

              {/* Expanded module access panel */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Module Access</p>
                        {user.role !== 'super_admin' && canManageAccess && !isSystemAdmin && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => useUserStore.getState().setModules(user.id, [...MANAGEABLE_MODULES])}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                            >
                              Grant All
                            </button>
                            <span className="text-white/20">·</span>
                            <button
                              onClick={() => useUserStore.getState().setModules(user.id, [])}
                              className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
                            >
                              Revoke All
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.role === 'super_admin'
                          ? MANAGEABLE_MODULES.map(tab => <ModuleChip key={tab} tab={tab} active disabled />)
                          : MANAGEABLE_MODULES.map(tab => (
                              <ModuleChip
                                key={tab}
                                tab={tab}
                                active={user.allowedModules.includes(tab)}
                                onClick={canManageAccess && !isSystemAdmin ? () => toggleModule(user.id, tab) : undefined}
                                disabled={!canManageAccess || isSystemAdmin}
                              />
                            ))
                        }
                      </div>
                      {user.role === 'super_admin' && (
                        <p className="text-[10px] text-amber-400/60 mt-3 flex items-center gap-1.5">
                          <Crown size={10} /> Super Admin has unrestricted access to all modules.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Warning for admins */}
      {role === 'admin' && (
        <div className="mt-5 flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4">
          <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/50">
            As an <span className="text-amber-400 font-bold">Administrator</span>, you can manage module access for staff members, but cannot delete users or change their passwords and roles. Contact the Super Admin for those actions.
          </p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalMode && (
          <UserModal
            mode={modalMode}
            initialData={editTarget ? {
              name: editTarget.name,
              email: editTarget.email,
              pin: editTarget.pin,
              role: editTarget.role,
              allowedModules: editTarget.allowedModules,
            } : undefined}
            onClose={() => { setModalMode(null); setEditTarget(null); }}
            onSave={handleModalSave}
            currentUserRole={role ?? 'user'}
          />
        )}
      </AnimatePresence>
    </>
  );
}
