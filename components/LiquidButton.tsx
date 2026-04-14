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
    primary: "bg-white/10 text-white backdrop-blur-md shadow-resin border border-white/20 px-8 py-4 text-sm uppercase",
    secondary: "bg-black/40 text-white/80 backdrop-blur-md border border-white/5 px-6 py-3 text-sm hover:text-white",
    icon: "bg-white/5 text-white backdrop-blur-md border border-white/10 p-4 rounded-full shadow-resin",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9, y: 2, boxShadow: "var(--shadow-resin-pressed)" }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      
      {/* Subtle top reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
      {/* Ambient glow on hover */}
      <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
}
