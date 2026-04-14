'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Star } from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { useInventoryStore } from '@/store/inventoryStore';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function MarketPage() {
  const products = useInventoryStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter(
    (p) =>
      (activeCategory === 'All' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      article: product.article,
      price: product.price,
      tax: product.tax,
    });
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
          >
            THE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              MARKETPLACE
            </span>
          </motion.h1>
          <p className="text-white/50 max-w-lg font-light">
            Discover the next generation of tactile technology. Every product is
            crafted with our signature resin-finish aesthetic.
          </p>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/30 group-focus-within:text-indigo-400 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-resin"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === cat
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/product/${product.id}`}>
                  <ResinCard
                    glowingColor={
                      i % 2 === 0
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(236, 72, 153, 0.2)'
                    }
                    className="h-full cursor-pointer hover:translate-y-[-4px] transition-transform"
                  >
                    <div className="p-6 flex flex-col h-full group">
                      <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5 mb-6 flex items-center justify-center relative overflow-hidden">
                        <div className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors select-none">
                          {product.article.split('-')[0]}
                        </div>
                        {product.tag && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                            {product.tag}
                          </div>
                        )}
                        {product.stock < 20 && (
                          <div className="absolute top-4 right-4 px-2 py-1 bg-rose-500/20 backdrop-blur-md rounded-full border border-rose-500/30 text-[8px] font-bold uppercase text-rose-400">
                            Low Stock
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-white/50">
                            <Star
                              size={10}
                              className="fill-yellow-500 text-yellow-500"
                            />
                            {product.rating}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tighter">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xl font-light">
                            ${product.price}
                          </span>
                          <LiquidButton
                            variant="icon"
                            className="w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            <ShoppingBag size={16} />
                          </LiquidButton>
                        </div>
                      </div>
                    </div>
                  </ResinCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
              <Search size={32} className="text-white/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-white/50">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
