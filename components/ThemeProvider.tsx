'use client';

import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/store/uiStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, compactMode } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply theme classes
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    
    // Set attribute as fallback or for other selectors
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply compact mode
    document.documentElement.setAttribute('data-compact', compactMode.toString());
    
    // Theme-specific body classes or meta tags can go here
  }, [theme, compactMode, mounted]);

  // Prevent flicker during hydration for theme attributes
  // In a real app, you might want a theme script in layout.tsx head
  return <>{children}</>;
}
