'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  Check,
  CircleDot
} from 'lucide-react';
import { useInventoryStore, getProductDisplayImage } from '@/store/inventoryStore';
import { useCartStore } from '@/store/cartStore';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products, getAvailableStock, addHold, cleanupHolds } = useInventoryStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleOpen);

  const sessionId = React.useMemo(() => {
    if (typeof window === 'undefined') return 'store-ssr';
    let id = localStorage.getItem('aero-session-id');
    if (!id) {
      id = `store-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('aero-session-id', id);
    }
    return id;
  }, []);

  // Cleanup effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      products.forEach(p => {
        if (p.holds && p.holds.length > 0) cleanupHolds(p.id);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [products, cleanupHolds]);

  const product = products.find((p) => p.id === Number(id));

  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product?.variants?.[0]?.sizes?.[0] || null);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ResinCard className="p-12 max-w-md" glowingColor="rgba(239, 68, 68, 0.2)">
          <ShieldCheck size={48} className="text-rose-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Object Not Found</h1>
          <p className="text-white/40 mb-8 font-medium">The requested item does not exist in our current inventory vault.</p>
          <LiquidButton onClick={() => router.push('/market')}>
            Return to Market <ArrowLeft size={16} className="ml-2" />
          </LiquidButton>
        </ResinCard>
      </div>
    );
  }

  const handleAddToBag = () => {
    addItem({
      productId: product.id,
      name: product.name,
      article: product.article,
      price: product.price + (selectedSize?.priceAdjustment || 0),
      tax: product.tax,
      image: selectedVariant?.image || product.image,
      selectedVariant: selectedVariant ? {
        color: selectedVariant.color,
        size: selectedSize?.size || ''
      } : undefined
    });
    
    // Add stock hold
    if (selectedVariant && selectedSize) {
      addHold(product.id, selectedVariant.color, selectedSize.size, 1, sessionId);
    }
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      toggleCart();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-indigo-500/30">
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        
        {/* Navigation / Breadcrumb */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left: Product Media Gallery */}
          <div className="space-y-6">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-[4/5] rounded-[3rem] bg-white/5 border border-white/10 shadow-resin overflow-hidden relative group"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-50" />
                
                {/* Product Asset Representation */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      key={selectedVariant?.color || 'default'}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full flex items-center justify-center p-12"
                    >
                       {(selectedVariant ? (selectedVariant.image || product.image) : getProductDisplayImage(product)) ? (
                         <Image 
                           src={(selectedVariant ? (selectedVariant.image || product.image) : getProductDisplayImage(product)) as string} 
                           alt={product.name} 
                           width={800}
                           height={1000}
                           className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-transform duration-700 group-hover:scale-110" 
                         />
                       ) : (
                         <div className="relative">
                            <motion.div 
                              animate={{ 
                                rotate: 360,
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              className="w-64 h-64 rounded-full bg-indigo-500/5 blur-[100px] absolute -inset-32"
                            />
                            <div className="relative text-[120px] font-black text-white/[0.03] select-none group-hover:text-white/[0.06] transition-colors tracking-tighter">
                               {product.article.split('-')[0]}
                            </div>
                         </div>
                       )}
                    </motion.div>
                 </div>

                {/* Floating Tags */}
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                   {product.tag && (
                     <span className="px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                        {product.tag}
                     </span>
                   )}
                   <span className="px-4 py-1.5 bg-indigo-500/20 backdrop-blur-xl rounded-full border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      Authentic
                   </span>
                </div>
             </motion.div>

             <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="aspect-square rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                     <CircleDot size={20} className="text-white/20" />
                  </div>
                ))}
             </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col h-full">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
             >
                <div className="flex items-center gap-4 mb-4">
                   <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">{product.category}</span>
                   <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                      <Star size={14} className="fill-yellow-500" />
                      <span>{product.rating}</span>
                      <span className="text-white/20 font-medium ml-1">(124 Reviews)</span>
                   </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9] uppercase">
                   {product.name}
                </h1>

                <p className="text-lg text-white/50 font-light leading-relaxed mb-10 max-w-xl">
                   {product.description || "Experimental design meets high-performance engineering. Our signature resin-finish provides a tactile experience unmatched in the industry."}
                </p>

                <div className="text-4xl font-light mb-12 tracking-tight">
                   ${selectedSize ? (product.price + selectedSize.priceAdjustment).toFixed(2) : product.price.toFixed(2)}
                </div>

                {/* Variants Support */}
                {product.variants.length > 0 && (
                  <div className="space-y-8 mb-12">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Material Finish</p>
                        <div className="flex flex-wrap gap-3">
                           {product.variants.map((v, i) => (
                             <button
                               key={i}
                               onClick={() => {
                                 setSelectedVariant(v);
                                 setSelectedSize(v.sizes[0]);
                               }}
                               className={cn(
                                 "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                 selectedVariant?.color === v.color 
                                   ? "bg-white text-black border-white shadow-resin" 
                                   : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                               )}
                             >
                               {v.color}
                             </button>
                           ))}
                        </div>
                     </div>

                     {selectedVariant && selectedVariant.sizes.length > 0 && (
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Selection Specification</p>
                          <div className="flex flex-wrap gap-3">
                              {selectedVariant.sizes.map((s, i) => {
                                  const available = getAvailableStock(product.id, selectedVariant.color, s.size);
                                  const totalStockInSize = s.stock;
                                  const isSoldOut = totalStockInSize <= 0;
                                  const isReserved = totalStockInSize > 0 && available <= 0;

                                  return (
                                    <button
                                      key={i}
                                      disabled={available <= 0}
                                      onClick={() => setSelectedSize(s)}
                                      className={cn(
                                        "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border relative overflow-hidden group/size",
                                        available <= 0 
                                          ? "bg-white/[0.02] text-white/10 border-white/5 cursor-not-allowed" 
                                          : selectedSize?.size === s.size 
                                            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                                            : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                                      )}
                                    >
                                      <div className="flex flex-col items-center gap-1 relative z-10">
                                        <span>{s.size}</span>
                                        {isSoldOut ? (
                                          <span className="text-[6px] text-rose-500/50">SOLD OUT</span>
                                        ) : isReserved ? (
                                          <span className="text-[6px] text-amber-500/50 animate-pulse">RESERVED</span>
                                        ) : (
                                          <span className="text-[6px] opacity-20 group-hover/size:opacity-50">{available} PAIRS</span>
                                        )}
                                      </div>
                                    </button>
                                  );
                              })}
                          </div>
                       </div>
                     )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-16 pt-8 border-t border-white/5">
                    <LiquidButton 
                      onClick={handleAddToBag}
                      disabled={!selectedSize || getAvailableStock(product.id, selectedVariant?.color || '', selectedSize.size) <= 0}
                      className={cn(
                        "flex-1 py-5 text-sm font-black uppercase tracking-[0.3em] relative overflow-hidden transition-all",
                        (!selectedSize || getAvailableStock(product.id, selectedVariant?.color || '', selectedSize.size) <= 0)
                          ? "bg-white/5 text-white/10 border-white/5 cursor-not-allowed"
                          : "bg-white text-black border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {(!selectedSize || getAvailableStock(product.id, selectedVariant?.color || '', selectedSize.size) <= 0) ? (
                          <motion.div key="soldout" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center justify-center gap-2">
                            Out of Stock
                          </motion.div>
                        ) : isAdded ? (
                         <motion.div 
                           key="check"
                           initial={{ y: 20 }}
                           animate={{ y: 0 }}
                           exit={{ y: -20 }}
                           className="flex items-center justify-center gap-2"
                         >
                           In Bag <Check size={18} />
                         </motion.div>
                       ) : (
                         <motion.div 
                           key="add"
                           initial={{ y: 20 }}
                           animate={{ y: 0 }}
                           exit={{ y: -20 }}
                           className="flex items-center justify-center gap-2"
                         >
                           Add to Bag <ShoppingBag size={18} />
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </LiquidButton>
                   <LiquidButton variant="secondary" className="px-10">
                      Wishlist
                   </LiquidButton>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { icon: <Truck size={18} />, label: "Rapid Logistics", sub: "Global Shipping" },
                     { icon: <ShieldCheck size={18} />, label: "Secure Vault", sub: "AES-256 Encrypted" },
                     { icon: <RefreshCcw size={18} />, label: "30-Day Flux", sub: "Free Exchanges" },
                   ].map((item, i) => (
                     <div key={i} className="flex flex-col gap-2 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                        <div className="text-indigo-400">{item.icon}</div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">{item.label}</p>
                           <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{item.sub}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        </div>

        {/* Technical Specs Accordion (Simulated) */}
        <section className="mt-32 pt-24 border-t border-white/5">
           <div className="max-w-3xl">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">Technical Integrity</h2>
              <div className="space-y-4">
                 {[
                   { label: "Construction", value: "Liquid-infused high-grade polymer" },
                   { label: "Sourcing", value: "Sustainably harvested in digital void" },
                   { label: "Article ID", value: product.article },
                   { label: "Certification", value: "Aero-Resin V2 Standard" },
                 ].map((spec, i) => (
                   <div key={i} className="flex items-center justify-between py-4 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{spec.label}</span>
                      <span className="text-xs font-bold text-white/70">{spec.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
