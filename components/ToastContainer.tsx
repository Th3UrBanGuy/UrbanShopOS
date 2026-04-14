'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, Toast } from '@/store/toastStore';
import { cn } from '@/lib/utils';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className="pointer-events-auto"
    >
      <div className={cn(
        "relative overflow-hidden flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl min-w-[280px] max-w-[400px]",
        isSuccess ? "bg-emerald-950/40 border-emerald-500/20 shadow-emerald-500/10" :
        isError ? "bg-rose-950/40 border-rose-500/20 shadow-rose-500/10" :
        "bg-white/5 border-white/10 shadow-black/50"
      )}>
        {/* Animated background glow */}
        <div className={cn(
          "absolute -inset-2 opacity-20 blur-xl rounded-full",
          isSuccess ? "bg-emerald-500" : isError ? "bg-rose-500" : "bg-white"
        )} />

        {/* Icon */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
          isSuccess ? "bg-emerald-500/20 text-emerald-400" : 
          isError ? "bg-rose-500/20 text-rose-400" : 
          "bg-white/10 text-white/70"
        )}>
          {isSuccess ? <CheckCircle2 size={16} /> : 
           isError ? <AlertCircle size={16} /> : 
           <Info size={16} />}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0 z-10">
          <p className="text-sm font-bold text-white drop-shadow-md">
            {toast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button 
          onClick={onDismiss}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}
