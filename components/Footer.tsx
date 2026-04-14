'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="text-2xl font-black tracking-tighter mb-8 opacity-50">
          AERO RESIN
        </div>
        <div className="flex justify-center gap-8 text-sm text-white/30 mb-12">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">X / Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Discord</a>
        </div>
        <div className="flex justify-center gap-6 text-xs text-white/20 mb-6">
          <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
          <Link href="/market" className="hover:text-white/50 transition-colors">Marketplace</Link>
          <Link href="/about" className="hover:text-white/50 transition-colors">About</Link>
        </div>
        <p className="text-xs text-white/20 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} AERO RESIN CO. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
