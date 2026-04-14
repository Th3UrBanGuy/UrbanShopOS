'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Play, X, ShoppingBag } from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import Link from 'next/link';
import { useInventoryStore } from '@/store/inventoryStore';
import { useCartStore } from '@/store/cartStore';

export default function Home() {
  const products = useInventoryStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Show first 5 products as "Featured Drops"
  const featured = products.slice(0, 5);

  const SPANS = [
    'col-span-1 md:col-span-2 row-span-2',
    'col-span-1',
    'col-span-1 md:col-span-2',
    'col-span-1',
    'col-span-1',
  ];

  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[600px] w-full rounded-[3rem] overflow-hidden mb-12 shadow-resin border border-white/10 flex items-center justify-center">
          {/* Abstract Hero Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-black pointer-events-none" />
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.4) 0%, transparent 60%)',
                'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.4) 0%, transparent 60%)',
                'radial-gradient(circle at 50% 80%, rgba(56, 189, 248, 0.4) 0%, transparent 60%)',
                'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.4) 0%, transparent 60%)',
              ],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 opacity-50 pointer-events-none"
          />

          <div className="relative z-10 text-center flex flex-col items-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 text-sm font-medium text-indigo-200">
                <Star size={14} className="fill-indigo-400 text-indigo-400" />
                <span>Introducing the Fluid Collection</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
                FEEL THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  DIFFERENCE
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-10 font-light">
                Immerse yourself in a tactile digital experience. Our new lineup
                features materials that bend light and defy expectations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/market">
                  <LiquidButton>
                    Explore Catalog <ArrowRight size={18} />
                  </LiquidButton>
                </Link>
                <LiquidButton variant="secondary" onClick={() => setIsVideoOpen(true)}>
                  Watch Video <Play size={16} className="ml-2" />
                </LiquidButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Organic Grid Section — from Inventory */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Featured Drops</h2>
            <Link
              href="/market"
              className="text-sm font-medium text-white/50 hover:text-white transition-colors flex items-center gap-2"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {featured.map((product, i) => (
              <Link key={product.id} href={`/product/${product.id}`} className={SPANS[i] || 'col-span-1'}>
                <ResinCard
                  glowingColor={
                    i % 2 === 0
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(236, 72, 153, 0.2)'
                  }
                  className="h-full cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                >
                  <div className="p-8 flex flex-col h-full justify-between relative group">
                    <div className="flex justify-between items-start">
                      {product.tag && (
                        <span className="px-3 py-1 text-xs font-semibold bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/90">
                          {product.tag}
                        </span>
                      )}
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={16} />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <p className="text-sm text-white/50 mb-1 font-medium tracking-wide uppercase">
                        {product.category}
                      </p>
                      <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-light text-white/80">
                          ${product.price}
                        </p>
                        <LiquidButton
                          variant="icon"
                          className="w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({
                              productId: product.id,
                              name: product.name,
                              article: product.article,
                              price: product.price,
                              tax: product.tax,
                            });
                          }}
                        >
                          <ShoppingBag size={16} />
                        </LiquidButton>
                      </div>
                    </div>
                  </div>
                </ResinCard>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setIsVideoOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] bg-black border border-white/10"
            >
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all border border-white/10"
              >
                <X size={24} />
              </button>
              
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simulated Video Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-black to-purple-900/40" />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl absolute"
                />
                <div className="relative z-10 text-center flex flex-col items-center">
                  <Play size={64} className="text-white/20 mb-6" />
                  <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white/40">Aero Resin Demo</h3>
                  <p className="text-sm font-medium text-white/20 mt-2 uppercase tracking-widest">Connect to reality</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
