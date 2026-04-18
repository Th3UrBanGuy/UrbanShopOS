'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiquidButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'icon';
}

export default function LiquidButton({ children, className, variant = 'primary', ...props }: LiquidButtonProps) {
  const baseStyles = "relative overflow-hidden rounded-full font-medium tracking-wide transition-colors outline-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: cn(
      "shadow-resin px-8 py-4 text-sm uppercase",
      "bg-[var(--accent)] text-white border border-white/20 transition-shadow",
      "hover:shadow-[0_0_20px_var(--accent-glow)]"
    ),
    secondary: cn(
      "backdrop-blur-md px-6 py-3 text-sm font-bold uppercase tracking-wider",
      "bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--card-border)]",
      "hover:bg-[var(--card-bg)] hover:border-[var(--accent)]/30"
    ),
    icon: cn(
      "backdrop-blur-md p-4 rounded-xl shadow-sm border",
      "bg-[var(--input-bg)] text-[var(--text-primary)] border-[var(--card-border)]",
      "hover:bg-[var(--card-bg)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
    ),
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, y: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      
      {/* Subtle top reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30" />
      {/* Ambient glow on hover */}
      <div className="absolute inset-0 bg-[var(--accent)] opacity-0 hover:opacity-5 transition-opacity duration-300" />
    </motion.button>
  );
}
