'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Unlock, LockKeyhole, User, Crown, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';

const ROLE_META = {
  super_admin: { label: 'Super Admin', icon: Crown, color: '#f59e0b' },
  admin: { label: 'Administrator', icon: Shield, color: '#6366f1' },
  user: { label: 'Staff Member', icon: User, color: '#22d3ee' },
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, loginWithUser } = useAuthStore();
  const { getUserByPin } = useUserStore();
  const router = useRouter();

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('Access Denied');
  const [mounted, setMounted] = useState(false);
  const [matchedUser, setMatchedUser] = useState<ReturnType<typeof getUserByPin>>(undefined);

  useEffect(() => { setMounted(true); }, []);

  // Live lookup as user types
  useEffect(() => {
    if (passcode.length === 6) {
      const found = getUserByPin(passcode);
      setMatchedUser(found);
    } else {
      setMatchedUser(undefined);
    }
  }, [passcode, getUserByPin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUserByPin(passcode);
    if (user) {
      loginWithUser(user);
      setPasscode('');
    } else {
      setErrorMsg(passcode.length === 6 ? 'Invalid PIN. Try Again.' : 'Enter full 6-digit PIN.');
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 600);
    }
  };

  if (!mounted) return null;

  if (currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    );
  }

  const roleMeta = matchedUser ? ROLE_META[matchedUser.role] : null;
  const RoleIcon = roleMeta?.icon ?? LockKeyhole;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#05050a] text-white font-sans overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm mx-4"
      >
        {/* Glass card */}
        <div
          className="relative rounded-3xl overflow-hidden border border-white/10 p-8 flex flex-col items-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 30px 80px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Top glow inside card */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Icon */}
          <motion.div
            animate={error ? { x: [-6, 6, -5, 5, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="relative mb-8 mt-2"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300"
              style={{
                background: error
                  ? 'rgba(239,68,68,0.12)'
                  : matchedUser
                  ? `${roleMeta?.color}18`
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.35)' : matchedUser ? `${roleMeta?.color}35` : 'rgba(255,255,255,0.1)'}`,
                boxShadow: error
                  ? '0 0 25px rgba(239,68,68,0.15)'
                  : matchedUser
                  ? `0 0 25px ${roleMeta?.color}20`
                  : '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              {error
                ? <ShieldAlert size={32} className="text-rose-400" strokeWidth={1.5} />
                : <RoleIcon size={32} style={{ color: matchedUser ? roleMeta?.color : 'rgba(255,255,255,0.7)' }} strokeWidth={1.5} />
              }
            </div>
            {/* Ring pulse when matched */}
            <AnimatePresence>
              {matchedUser && !error && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.25, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl border-2"
                  style={{ borderColor: roleMeta?.color }}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            {matchedUser ? `Welcome, ${matchedUser.name.split(' ')[0]}` : 'AERO PORTAL'}
          </h2>

          {/* Role badge or sub-label */}
          <div className="flex items-center gap-2 mb-8">
            {matchedUser ? (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                style={{
                  background: `${roleMeta?.color}15`,
                  borderColor: `${roleMeta?.color}30`,
                  color: roleMeta?.color,
                }}
              >
                {roleMeta?.label}
              </motion.span>
            ) : (
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
                Authorized Staff Only
              </p>
            )}
          </div>

          {/* PIN Input */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError(false);
                }}
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                autoFocus
                className="w-full text-center text-3xl font-black tracking-[0.4em] py-4 px-6 rounded-2xl outline-none transition-all placeholder:text-white/10 placeholder:tracking-[0.3em]"
                style={{
                  background: error ? 'rgba(239,68,68,0.06)' : 'rgba(0,0,0,0.3)',
                  border: `1.5px solid ${error ? 'rgba(239,68,68,0.4)' : matchedUser ? `${roleMeta?.color}40` : 'rgba(255,255,255,0.08)'}`,
                  color: error ? '#fca5a5' : matchedUser ? roleMeta?.color : 'white',
                  boxShadow: matchedUser ? `0 0 20px ${roleMeta?.color}15` : 'none',
                }}
              />
              {/* PIN progress dots */}
              <div className="flex justify-center gap-2 mt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i < passcode.length ? 1.2 : 1,
                      opacity: i < passcode.length ? 1 : 0.2,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: i < passcode.length ? (matchedUser ? roleMeta?.color : '#6366f1') : 'rgba(255,255,255,0.3)' }}
                  />
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-rose-400 font-bold uppercase tracking-wider text-center mt-2"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={passcode.length !== 6}
              className="relative overflow-hidden w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: matchedUser
                  ? `linear-gradient(135deg, ${roleMeta?.color}, ${roleMeta?.color}cc)`
                  : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                boxShadow: matchedUser
                  ? `0 12px 30px ${roleMeta?.color}35`
                  : '0 12px 30px rgba(99,102,241,0.35)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
              <Unlock size={15} className="relative z-10" />
              <span className="relative z-10">Initialize Session</span>
            </motion.button>
          </form>

          <button
            onClick={() => router.push('/')}
            className="mt-6 text-[10px] font-bold text-white/25 uppercase tracking-widest hover:text-white/50 transition-colors"
          >
            ← Return to Storefront
          </button>
        </div>
      </motion.div>
    </div>
  );
}
