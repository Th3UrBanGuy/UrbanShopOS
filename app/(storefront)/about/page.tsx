'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, Globe, Cpu } from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import Link from 'next/link';

const VALUES = [
  { icon: <Zap className="text-indigo-400" />, title: "Precision Crafted", desc: "Every pixel and physical detail is honed for tactile perfection." },
  { icon: <Shield className="text-purple-400" />, title: "Resilient Design", desc: "Materials and interfaces built to withstand the test of time." },
  { icon: <Sparkles className="text-pink-400" />, title: "Future Aesthetic", desc: "Pushing the boundaries of light, reflection, and digital material." },
  { icon: <Globe className="text-blue-400" />, title: "Global Vision", desc: "Connecting the world through shared high-end design languages." }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  <Cpu size={14} />
                  <span>Established 2026</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                  BEYOND THE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">SURFACE.</span>
                </h1>
                <p className="text-xl text-white/60 font-light max-w-xl leading-relaxed">
                  AERO RESIN was founded on a simple premise: Digital experiences should feel as tactile and premium as a piece of polished art.
                </p>
              </motion.div>
            </div>
            <div className="flex-1 w-full">
              <ResinCard className="aspect-[4/5] md:aspect-square flex items-center justify-center p-12">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <div className="relative text-9xl font-black tracking-tighter opacity-10 select-none">AR</div>
                </div>
              </ResinCard>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="order-2 md:order-1">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4">
                   <div className="h-64 rounded-3xl bg-white/5 border border-white/10 shadow-resin" />
                   <div className="h-48 rounded-3xl bg-indigo-500/10 border border-white/10 shadow-resin" />
                 </div>
                 <div className="space-y-4 pt-8">
                   <div className="h-48 rounded-3xl bg-purple-500/10 border border-white/10 shadow-resin" />
                   <div className="h-64 rounded-3xl bg-white/5 border border-white/10 shadow-resin" />
                 </div>
               </div>
             </div>
             <div className="order-1 md:order-2">
               <h2 className="text-3xl font-bold mb-6 tracking-tight">Our Story</h2>
               <div className="space-y-6 text-white/50 leading-relaxed font-light">
                 <p>
                   We started as a small group of industrial designers and software engineers who were tired of the &quot;flat&quot; web. We missed the depth, the reflections, and the weight of physical objects.
                 </p>
                 <p>
                   Through two years of R&amp;D, we developed our proprietary &quot;Fluid Resin&quot; design language—a system that brings the physics of light and material into the digital realm.
                 </p>
                 <p>
                   Today, AERO RESIN is a global leader in high-end tech lifestyle products, bridging the gap between hardware and software with a singular, liquid aesthetic.
                 </p>
               </div>
             </div>
          </div>
        </section>

        {/* Values Grid */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Philosophy</h2>
            <p className="text-white/50">Four pillars that define every product we release.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <ResinCard key={i} className="p-8 text-center" glowingColor="rgba(255,255,255,0.05)">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-resin">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{val.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{val.desc}</p>
              </ResinCard>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-32">
          <ResinCard className="p-16 text-center overflow-hidden relative" glowingColor="rgba(99, 102, 241, 0.3)">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">READY TO TOUCH THE <br/> FUTURE?</h2>
              <Link href="/market" className="inline-block">
                <LiquidButton>
                  Browse Marketplace <ArrowRight size={18} />
                </LiquidButton>
              </Link>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          </ResinCard>
        </section>
      </main>
    </div>
  );
}
