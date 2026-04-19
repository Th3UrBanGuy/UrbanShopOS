'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, Cpu } from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import Link from 'next/link';

const VALUES = [
  { icon: <Zap className="text-indigo-400" />, title: "Integrity", desc: "Honest, transparent mechanisms at the core of every solution." },
  { icon: <Cpu className="text-purple-400" />, title: "Precision", desc: "Minute attention to detail in both physical robotics and digital code." },
  { icon: <Sparkles className="text-pink-400" />, title: "Evolution", desc: "Continuously dismantling limitations to reach the next stage." },
  { icon: <Shield className="text-blue-400" />, title: "Security", desc: "AES-256 grade encryption protecting the substrate of your business." }
];

const TEAM = [
  { name: "Kazi Ahammad Ullah", role: "Chief Executive Officer", focus: "Vision & Strategic Leadership" },
  { name: "Alahi Majnur Osama", role: "Chief Operating Officer", focus: "Operations & Execution" },
  { name: "Tajwar Saiyeed Abid", role: "Chief Technology Officer", focus: "Product Innovation & Tech" },
  { name: "MD. Tahmidul Alam Ahad", role: "Chief Marketing Officer", focus: "Brand & Growth Strategy" }
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
                  <span>Founded 2025 • Chattogram</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                  ARCHITECTING THE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">SUBSTRATE.</span>
                </h1>
                <p className="text-xl text-white/60 font-light max-w-xl leading-relaxed">
                  UrbanShopOS is a convergence of specialized intelligence, unifying software, security, and robotics into a singular, evolutionary force.
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

        {/* Why UrbanShopOS */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="order-2 md:order-1">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4">
                   <ResinCard className="h-64 flex flex-col items-center justify-center p-6 text-center">
                      <Zap className="text-indigo-400 mb-4" size={32} />
                      <h4 className="text-xs font-black uppercase tracking-widest mb-2">Software Mechanism</h4>
                      <p className="text-[10px] text-white/30 font-bold uppercase leading-tight">Autonomous Sales & Inventory Algorithms</p>
                   </ResinCard>
                   <ResinCard className="h-48 flex flex-col items-center justify-center p-6 text-center" glowingColor="rgba(236, 72, 153, 0.1)">
                      <Cpu className="text-pink-400 mb-4" size={32} />
                      <h4 className="text-xs font-black uppercase tracking-widest mb-2">Robotics & IOT</h4>
                      <p className="text-[10px] text-white/30 font-bold uppercase leading-tight">Physical Fulfillment Synchronization</p>
                   </ResinCard>
                 </div>
                 <div className="space-y-4 pt-8">
                   <ResinCard className="h-48 flex flex-col items-center justify-center p-6 text-center" glowingColor="rgba(168, 85, 247, 0.1)">
                      <Shield className="text-purple-400 mb-4" size={32} />
                      <h4 className="text-xs font-black uppercase tracking-widest mb-2">Vault Security</h4>
                      <p className="text-[10px] text-white/30 font-bold uppercase leading-tight">End-to-End Encryption Protocol</p>
                   </ResinCard>
                   <ResinCard className="h-64 flex flex-col items-center justify-center p-6 text-center">
                      <Sparkles className="text-indigo-400 mb-4" size={32} />
                      <h4 className="text-xs font-black uppercase tracking-widest mb-2">Fluid Aesthetic</h4>
                      <p className="text-[10px] text-white/30 font-bold uppercase leading-tight">Interactive Resin-Finish Interfaces</p>
                   </ResinCard>
                 </div>
               </div>
             </div>
             <div className="order-1 md:order-2">
               <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter uppercase">The Convergence</h2>
               <div className="space-y-6 text-white/50 leading-relaxed font-light">
                 <p>
                   We built UrbanShopOS to dismantle the limitations of current business infrastructure. For too long, software has been disconnected from the physical reality of retail and robotics.
                 </p>
                 <p>
                    Tectonic operates at the intersection of imagination and engineering. We&apos;ve combined high-precision software mechanisms with robotics and IOT to create a singular, integrated ecosystem.
                 </p>
                 <p>
                   UrbanShopOS is not just a tool; it is a substrate designed to scale, protect, and evolve alongside your business vision.
                 </p>
               </div>
             </div>
          </div>
        </section>

        {/* The Architects (Team) */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase">The Architects</h2>
            <p className="text-white/50 font-light text-lg">Operating at the intersection of specialized intelligence.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <ResinCard key={i} className="p-8 group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative" glowingColor="rgba(99, 102, 241, 0.1)">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-resin group-hover:border-indigo-500/30 transition-all">
                  <div className="text-xl font-black text-white/10 group-hover:text-indigo-400/50 transition-colors">{member.name.split(' ').map(n => n[0]).join('')}</div>
                </div>
                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{member.name}</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">{member.role}</p>
                <div className="pt-6 border-t border-white/5">
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{member.focus}</p>
                </div>
              </ResinCard>
            ))}
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
