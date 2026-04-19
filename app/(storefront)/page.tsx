'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Play, X, Shield } from 'lucide-react';
import LiquidButton from '@/components/LiquidButton';
import Link from 'next/link';
import { useInventoryStore, getProductDisplayImage } from '@/store/inventoryStore';
import { cn } from '@/lib/utils';

export default function Home() {
  const products = useInventoryStore((s) => s.products);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Show first 6 products for a richer bento
  const featured = products.slice(0, 6);

  // Bento Span Config (Desktop: 4 columns)
  const BENTO_SPANS = [
    'md:col-span-2 md:row-span-2 h-[520px]', // Large Featured
    'md:col-span-2 h-[250px]',              // Wide
    'md:col-span-1 h-[250px]',              // Square
    'md:col-span-1 h-[250px]',              // Square
    'md:col-span-2 h-[250px]',              // Wide
    'md:col-span-2 h-[250px]',              // Wide
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <main className="pt-24 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* System Status Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">System Status: Operational</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30"
          >
            Ecosystem v2.5.0
          </motion.div>
        </div>

        {/* Bento Grid Container */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-auto"
        >
          
          {/* 1. Substrate Hero Card */}
          <motion.div 
            variants={item}
            className="md:col-span-4 relative h-[60vh] min-h-[400px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden group shadow-2xl border border-white/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10" />
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)',
                  'radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
                  'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 opacity-40"
            />
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 backdrop-blur-xl">
                <Star size={12} className="fill-indigo-400" /> Authorized Substrate
              </span>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.85] uppercase">
                ENGINEERED <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 transition-all duration-700">FLUIDITY.</span>
              </h1>
              <p className="text-white/40 max-w-lg mb-10 text-sm md:text-base font-medium leading-relaxed">
                Dismantling the limitations of infrastructure through the convergence 
                of specialized software and high-precision robotics.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Link href="/market">
                   <LiquidButton className="px-10 py-5 text-xs font-black tracking-widest uppercase">
                      Access Vault <ArrowRight size={16} className="ml-2" />
                   </LiquidButton>
                 </Link>
                 <LiquidButton variant="secondary" onClick={() => setIsVideoOpen(true)} className="px-8 py-5 text-xs font-black tracking-widest uppercase">
                    Execution <Play size={14} className="ml-2" />
                 </LiquidButton>
              </div>
            </div>

            {/* Geometric Decals */}
            <div className="absolute bottom-10 left-10 hidden md:block">
              <div className="w-12 h-1 bg-white/10 rounded-full mb-1" />
              <div className="w-24 h-1 bg-white/5 rounded-full" />
            </div>
            <div className="absolute top-10 right-10 hidden md:block text-[10px] font-black text-white/5 uppercase tracking-[0.5em] [writing-mode:vertical-lr]">
              Tectonic Ecosystem
            </div>
          </motion.div>

          {/* 2. Featured Drops Loop */}
          {featured.map((product, i) => (
            <motion.div 
              key={product.id} 
              variants={item}
              className={cn(
                "relative rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 group bg-white/[0.02]",
                BENTO_SPANS[i] || 'md:col-span-1 h-[250px]'
              )}
            >
              <Link href={`/product/${product.id}`} className="block h-full group">
                <div className="absolute inset-0 z-0">
                  {getProductDisplayImage(product) ? (
                    <Image 
                      src={getProductDisplayImage(product)!} 
                      alt={product.name} 
                      fill
                      className="object-cover opacity-40 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/5 uppercase">
                      {product.article.split('-')[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                </div>

                <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/70">
                      {product.tag || 'New Entry'}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-1">{product.category}</p>
                    <h3 className={cn(
                      "font-black uppercase tracking-tighter leading-none mb-2",
                      i === 0 ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
                    )}>{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-light text-white/60">${product.price}</span>
                      {i === 0 && (
                        <div className="hidden md:flex items-center gap-1 text-xs text-yellow-500/50">
                          <Star size={10} className="fill-yellow-500/50" />
                          <span>{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* 3. Utility Bento Card: Mission */}
          <motion.div 
            variants={item}
            className="md:col-span-2 h-[250px] rounded-[2rem] md:rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 p-8 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute -right-4 -bottom-4 text-9xl font-black text-white/[0.03] select-none group-hover:text-white/[0.05] transition-colors uppercase italic">Tech</div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Core Mission</h4>
            <p className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-tight max-w-sm mb-6">
              Empowering global entities through unified intelligence.
            </p>
            <Link href="/about" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2">
              Learn about our team <ArrowRight size={12} />
            </Link>
          </motion.div>

          {/* 4. Utility Bento Card: Quick Social / Stats */}
          <motion.div 
            variants={item}
            className="md:col-span-2 h-[250px] rounded-[2rem] md:rounded-[3rem] bg-pink-600/10 border border-pink-500/20 p-8 flex flex-col justify-center relative overflow-hidden group"
          >
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400 mb-2">Network</h5>
                   <p className="text-3xl font-black uppercase tracking-tighter">Global</p>
                   <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Cross-border logistics</p>
                </div>
                <div>
                   <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400 mb-2">Vault</h5>
                   <p className="text-3xl font-black uppercase tracking-tighter">Secure</p>
                   <p className="text-[9px] text-white/30 font-bold uppercase mt-1">AES-256 Protection</p>
                </div>
             </div>
             <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={80} className="text-pink-400" />
             </div>
          </motion.div>

        </motion.div>
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
              onClick={() => setIsVideoOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.3)] bg-[#0a0a0a] border border-white/10"
            >
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-8 right-8 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/10"
              >
                <X size={24} />
              </button>
              
              <div className="h-full flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20" />
                 <div className="text-center">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-32 h-32 rounded-full bg-indigo-500/20 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                    <Play size={64} className="text-indigo-400 mb-6 mx-auto relative z-10" />
                    <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white/50 relative z-10">System Execution Demo</h3>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
