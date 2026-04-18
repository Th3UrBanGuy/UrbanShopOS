'use client';

import React, { useRef, ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

interface ResinCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glowingColor?: string;
}

export default function ResinCard({ children, className, onClick, glowingColor }: ResinCardProps) {
  const { theme } = useUIStore();
  const defaultGlow = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(30, 64, 175, 0.12)';
  const activeGlow = glowingColor || defaultGlow;
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the motion
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden transition-all duration-300 group",
        "bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)]",
        "shadow-resin hover:shadow-resin-hover cursor-pointer",
        "rounded-[var(--radius-base)]",
        className
      )}
    >
      {/* Liquid Glare Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${activeGlow},
              transparent 80%
            )
          `,
        }}
      />
      {/* Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
