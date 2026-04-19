'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Wallet, Smartphone, X, Printer, Settings2, ReceiptText, ArrowRight, Phone } from 'lucide-react';
import ResinCard from '@/components/ResinCard';
import LiquidButton from '@/components/LiquidButton';
import { cn } from '@/lib/utils';
import { useInventoryStore, InventoryProduct, getProductDisplayImage } from '@/store/inventoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSalesStore } from '@/store/salesStore';
import { useCouponStore, Coupon } from '@/store/couponStore';
import { useToastStore } from '@/store/toastStore';
import TerminalSettings from './TerminalSettings';
import ReceiptDocument from './ReceiptDocument';
import { printReceipt } from '@/lib/printReceipt';
import { Ticket, BadgeCheck, BadgeAlert } from 'lucide-react';

interface CartItem extends InventoryProduct {
  quantity: number;
  image?: string;
  selectedVariant?: {
    color: string;
    size: string;
  };
}

export default function POSView() {
  const { products, decrementStock, decrementVariantStock, addHold, removeHold, cleanupHolds, getAvailableStock, sessionId, initialize: initInventory } = useInventoryStore();
  const settings = useSettingsStore();
  const addTransaction = useSalesStore((s) => s.addTransaction);
  
  // Initialization
  React.useEffect(() => {
    initInventory();
  }, [initInventory]);

  // Reservation cleanup loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      products.forEach(p => {
        if (p.holds && p.holds.length > 0) cleanupHolds(p.id);
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [products, cleanupHolds]);

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showBill, setShowBill] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  
  const generateTxId = () => `TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const [transactionId, setTransactionId] = useState(generateTxId());
  
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPhoneToast, setShowPhoneToast] = useState(false);
  
  const { validateCoupon, incrementUses } = useCouponStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');

  const [pickingVariantFor, setPickingVariantFor] = useState<InventoryProduct | null>(null);
  
  const billRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.article.toLowerCase().includes(searchQuery.toLowerCase())) &&
    p.stock > 0
  );

  const addToCart = (product: InventoryProduct, variant?: { color: string; size: string }) => {
    // Find price adjustment if variant is selected
    let priceAdjustment = 0;
    if (variant && product.variants) {
      const v = product.variants.find(v => v.color === variant.color);
      const s = v?.sizes.find(sz => sz.size === variant.size);
      priceAdjustment = s?.priceAdjustment || 0;
    }

    const available = getAvailableStock(product.id, variant?.color || '', variant?.size || '');
    if (available <= 0) {
      useToastStore.getState().addToast('No more pairs available in this size', 'error');
      return;
    }

    const finalPrice = product.price + priceAdjustment;
    
    // Find variant image
    let variantImage = product.image;
    if (variant && product.variants) {
      const v = product.variants.find(v => v.color === variant.color);
      if (v?.image) variantImage = v.image;
    }

    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedVariant?.color === variant?.color && 
        item.selectedVariant?.size === variant?.size
      );
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && 
           item.selectedVariant?.color === variant?.color && 
           item.selectedVariant?.size === variant?.size)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, image: variantImage, price: finalPrice, quantity: 1, selectedVariant: variant }];
    });

    // Create reservation
    addHold(product.id, variant?.color || '', variant?.size || '', 1, sessionId);
    
    setPickingVariantFor(null);
  };

  const removeFromCart = (id: number, variant?: { color: string; size: string }) => {
    setCart(prev => prev.filter(item => 
      !(item.id === id && 
        item.selectedVariant?.color === variant?.color && 
        item.selectedVariant?.size === variant?.size)
    ));
    removeHold(id, variant?.color || '', variant?.size || '', sessionId);
    if (expandedItemId === id) setExpandedItemId(null);
  };

  const handleProductClick = (product: InventoryProduct) => {
    if (product.variants && product.variants.length > 0) {
      setPickingVariantFor(product);
    } else {
      addToCart(product);
    }
  };

  const updateQuantity = (id: number, delta: number, variant?: { color: string; size: string }) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && 
          item.selectedVariant?.color === variant?.color && 
          item.selectedVariant?.size === variant?.size) {
        const newQty = Math.max(1, item.quantity + delta);
        
        // Sync hold (adjust quantity by delta)
        addHold(id, variant?.color || '', variant?.size || '', delta, sessionId);
        
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalTax = cart.reduce((acc, item) => acc + (item.price * item.quantity * (item.tax / 100)), 0);
  
  const handleApplyCoupon = () => {
    if (!couponCode) return;
    const cartPayload = cart.map(i => ({ productId: i.id, quantity: i.quantity }));
    const result = validateCoupon(couponCode, cartPayload);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setCouponError(result.error || 'Invalid Coupon');
    }
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const discountAmount = appliedCoupon 
    ? (appliedCoupon.type === 'percent' ? (subtotal * (appliedCoupon.value / 100)) : appliedCoupon.value)
    : 0;

  const total = Math.max(0, subtotal + totalTax - discountAmount);

  const handleCheckout = () => {
    if (cart.length > 0 && paymentMethod) {
      // Record transaction in sales store
      addTransaction({
        id: transactionId,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          article: item.article,
          price: item.price,
          quantity: item.quantity,
          tax: item.tax,
          selectedVariant: item.selectedVariant
        })),
        subtotal,
        taxTotal: totalTax,
        discount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: appliedCoupon?.code ?? undefined,
        total,
        paymentMethod,
        timestamp: new Date().toISOString(),
        customerPhone: customerPhone || undefined,
        channel: 'pos',
        status: 'completed',
      });
      // Decrement inventory stock
      cart.forEach((item) => {
        if (item.selectedVariant) {
          decrementVariantStock(item.id, item.selectedVariant.color, item.selectedVariant.size, item.quantity, sessionId);
        } else {
          decrementStock(item.id, item.quantity);
        }
      });
      // Increment coupon usage if applicable
      if (appliedCoupon) {
        incrementUses(appliedCoupon.id);
      }
      setShowBill(true);
      useToastStore.getState().addToast('Payment confirmed & receipt generated', 'success');
    }
  };

  const handlePrint = () => {
    printReceipt(
      {
        id: transactionId,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          article: item.article,
          price: item.price,
          quantity: item.quantity,
          tax: item.tax,
          selectedVariant: item.selectedVariant
        })),
        subtotal,
        taxTotal: totalTax,
        discount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: appliedCoupon?.code ?? undefined,
        total,
        paymentMethod: paymentMethod ?? 'N/A',
        timestamp: new Date().toISOString(),
        channel: 'pos',
        status: 'completed',
      },
      settings
    );
  };

  const resetPOS = () => {
    setCart([]);
    setPaymentMethod(null);
    setShowBill(false);
    setTransactionId(`TXN-${Date.now().toString().slice(-8)}-${Math.floor(10000 + Math.random() * 90000)}`);
    setSearchQuery('');
    setExpandedItemId(null);
  };

  const handleSendToPhone = async () => {
    if (!customerPhone || !customerPhone.includes('@')) {
      alert('Please enter a valid email address in the customer field before sending.');
      return;
    }
    
    setShowPhoneToast(true);
    try {
      const payload = {
        to: customerPhone,
        subject: `Receipt from ${settings.siteName}`,
        storeName: settings.siteName,
        receiptDetails: {
          items: cart.map(i => ({ 
            name: i.name, 
            price: settings.getConvertedAmount(i.price),
            quantity: i.quantity,
            total: settings.getConvertedAmount(i.price * i.quantity),
            article: i.article,
            variant: i.selectedVariant ? `${i.selectedVariant.color} / ${i.selectedVariant.size}` : undefined
          })),
          tax: settings.getConvertedAmount(totalTax),
          discount: settings.getConvertedAmount(discountAmount),
          total: settings.getConvertedAmount(total),
          txnId: transactionId,
          paymentMethod: paymentMethod || 'N/A',
          channel: 'pos',
          currency: settings.currency === 'BDT' ? '৳' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : '$'
        }
      };

      const res = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to send receipt');
      
      setTimeout(() => setShowPhoneToast(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to send email receipt. Check console for details.');
      setShowPhoneToast(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden relative">
      
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--card-border)] shrink-0">
        <button 
          onClick={() => setMobileTab('products')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            mobileTab === 'products' ? "bg-[var(--text-primary)] text-[var(--background)] shadow-resin" : "text-[var(--text-muted)]"
          )}
        >
          Products
        </button>
        <button 
          onClick={() => setMobileTab('cart')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            mobileTab === 'cart' ? "bg-[var(--text-primary)] text-[var(--background)] shadow-resin" : "text-[var(--text-muted)]"
          )}
        >
          Cart ({cart.length})
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
        
        {/* Left: Product Browser */}
        <div className={cn(
          "flex-1 flex flex-col gap-6 overflow-hidden h-full",
          mobileTab === 'cart' ? "hidden lg:flex" : "flex"
        )}>
          <div className="flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-resin">
                  <ShoppingCart size={18} />
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase truncate text-[var(--text-primary)]">Checkout <span className="hidden sm:inline text-[var(--text-muted)] ml-2">Shop Terminal</span></h2>
             </div>
             <button 
               onClick={() => setShowSettings(true)}
               className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
             >
                <Settings2 size={18} />
             </button>
          </div>

          <div className="relative shrink-0 px-1">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-[2rem] py-4 pl-14 pr-6 text-sm font-bold outline-none focus:bg-[var(--card-bg)] focus:border-[var(--accent)]/30 transition-all shadow-resin"
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pr-2 min-h-0">
             <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-32">
                {filteredProducts.map((p) => (
                  <ResinCard 
                    key={p.id} 
                    onClick={() => handleProductClick(p)}
                    className="p-3 sm:p-4 group h-full flex flex-col justify-between"
                    glowingColor="rgba(30,58,138,0.1)"
                  >
                    <div className="aspect-square rounded-xl bg-[var(--background)] border border-[var(--card-border)] mb-3 flex items-center justify-center relative overflow-hidden shrink-0 group-hover:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-500">
                      {getProductDisplayImage(p) ? (
                        <motion.div whileHover={{ scale: 1.1 }} className="w-full h-full relative">
                          <Image 
                            src={getProductDisplayImage(p)!} 
                            alt={p.name} 
                            fill
                            className="object-cover transition-transform duration-700"
                          />
                        </motion.div>
                      ) : (
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-tighter select-none">{p.article.split('-')[0]}</span>
                      )}
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[var(--accent)]/10 backdrop-blur-[2px]">
                          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)] scale-50 group-hover:scale-100 transition-transform duration-300">
                             <Plus size={24} strokeWidth={3} />
                          </div>
                       </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold truncate mb-1 text-[var(--text-primary)]">{p.name}</h4>
                      <div className="flex justify-between items-center">
                         <span className="text-xs sm:text-sm font-black tracking-tighter text-[var(--text-primary)]">${p.price}</span>
                         <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase", p.stock < 20 ? "bg-rose-500/20 text-rose-400" : "bg-[var(--card-bg)] text-[var(--text-muted)]")}>
                           {p.stock}
                         </span>
                      </div>
                    </div>
                  </ResinCard>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Checkout Stall */}
        <div className={cn(
          "w-full lg:w-[400px] xl:w-[450px] flex flex-col gap-4 lg:gap-6 shrink-0 h-full overflow-hidden",
          mobileTab === 'products' ? "hidden lg:flex" : "flex"
        )}>
          {/* Cart Card */}
          <ResinCard className="flex-1 flex flex-col overflow-hidden min-h-0" glowingColor="var(--accent-glow)">
             <div className="p-4 sm:p-6 border-b border-[var(--card-border)] flex items-center justify-between shrink-0">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                  <ReceiptText size={16} /> Your Cart
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--card-bg)] text-[10px] font-black text-[var(--text-muted)]">{cart.length}</span>
             </div>

             <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-3 gap-2 no-scrollbar min-h-0 bg-[var(--glass-bg)] content-start">
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => {
                    const isExpanded = expandedItemId === item.id;
                    return (
                      <motion.div
                        key={`${item.id}-${item.selectedVariant?.color || 'default'}-${item.selectedVariant?.size || 'default'}`}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn(
                          "rounded-xl border transition-all duration-500 overflow-hidden cursor-pointer relative",
                          isExpanded 
                            ? "col-span-3 bg-[var(--card-bg)] border-[var(--card-border)] shadow-resin p-4" 
                            : "col-span-1 bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--text-muted)] p-2 aspect-square flex flex-col items-center justify-center"
                        )}
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      >
                        {!isExpanded ? (
                          <>
                            <div className="w-12 h-12 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)] flex items-center justify-center relative overflow-hidden mb-1 shadow-inner">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                <span className="text-[10px] font-black text-[var(--accent)]">{item.quantity}</span>
                              )}
                              <div className="absolute top-0 right-0 px-1 bg-[var(--accent)] text-[var(--background)] text-[8px] font-black rounded-bl-lg">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="text-[8px] font-black text-[var(--text-muted)] uppercase truncate w-full text-center px-1">
                              {item.name}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center relative overflow-hidden shrink-0 shadow-resin">
                                  {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-black uppercase text-[var(--accent)]">{item.article.split('-')[0]}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{item.name}</h4>
                                  {item.selectedVariant && (
                                    <p className="text-[9px] font-black text-[var(--accent)]/80 uppercase tracking-widest">
                                      {item.selectedVariant.color} / {item.selectedVariant.size}
                                    </p>
                                  )}
                                  <p className="text-[10px] font-black text-[var(--text-muted)] tracking-widest">{settings.formatPrice(item.price)} / unit</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                 <span className="text-sm font-black tracking-tight shrink-0 ml-3 text-[var(--text-primary)]">
                            {settings.formatPrice(item.price * item.quantity)}
                          </span>
                                 <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase">Total Line</span>
                              </div>
                            </div>
                             <div className="pt-4 mt-4 border-t border-[var(--card-border)] flex items-center justify-between w-full">
                               <div className="flex items-center gap-2 bg-[var(--background)]/40 rounded-xl p-1 border border-[var(--card-border)]">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1, item.selectedVariant); }} 
                                    className="w-8 h-8 flex items-center justify-center hover:bg-[var(--card-bg)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-sm font-black w-8 text-center text-[var(--text-primary)]">{item.quantity}</span>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1, item.selectedVariant); }} 
                                    className="w-8 h-8 flex items-center justify-center hover:bg-[var(--card-bg)] rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                  >
                                    <Plus size={14} />
                                  </button>
                               </div>
                               
                               <button 
                                 onClick={(e) => { e.stopPropagation(); removeFromCart(item.id, item.selectedVariant); }} 
                                 className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {cart.length === 0 && (
                  <div className="h-full py-12 flex flex-col items-center justify-center text-center opacity-10 col-span-3">
                     <ShoppingCart size={48} className="mb-4" />
                     <p className="text-xs font-black uppercase tracking-widest">Cart is empty</p>
                  </div>
                )}
             </div>

             <div className="p-4 sm:p-6 bg-[var(--glass-bg)] space-y-2 border-t border-[var(--card-border)] shrink-0">
                <div className="flex justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                   <span>Subtotal</span>
                   <span>{settings.formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                     <span className="flex items-center gap-2 px-1">
                        <BadgeCheck size={12} /> {appliedCoupon.code}
                     </span>
                     <span>-{settings.formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                   <span>Taxes</span>
                   <span>{settings.formatPrice(totalTax)}</span>
                </div>
                
                {/* Coupon Bar */}
                {!appliedCoupon ? (
                  <div className="pt-2 pb-1 relative">
                    <input 
                      type="text" 
                      placeholder="Coupon Code..." 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl py-2.5 pl-9 pr-14 text-[10px] font-bold outline-none focus:border-[var(--accent)]/30 transition-all uppercase text-[var(--text-primary)]"
                    />
                    <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <button 
                      onClick={handleApplyCoupon}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[var(--text-primary)] text-[var(--background)] rounded-lg text-[8px] font-black uppercase tracking-tighter hover:scale-105 transition-all"
                    >
                      Apply
                    </button>
                    {couponError && (
                      <p className="text-[8px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                        <BadgeAlert size={10} /> {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={clearCoupon}
                    className="w-full py-1 text-[8px] font-black text-rose-500/50 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors"
                  >
                    Remove Discount
                  </button>
                )}

                <div className="flex justify-between text-xl font-black pt-3 mt-2 border-t border-[var(--card-border)] text-[var(--text-primary)]">
                   <span className="uppercase tracking-tighter">Total</span>
                   <span className="text-[var(--accent)] font-black">{settings.formatPrice(total)}</span>
                </div>
             </div>
          </ResinCard>

          {/* Checkout Action */}
          <div className="shrink-0 mb-20 md:mb-0">
             <LiquidButton 
               onClick={() => setShowPaymentModal(true)}
               disabled={cart.length === 0}
               className={cn(
                 "w-full py-5 text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                 cart.length > 0 ? "bg-[var(--text-primary)] text-[var(--background)] shadow-[0_20px_40px_rgba(0,0,0,0.3)]" : "opacity-20 cursor-not-allowed text-[var(--text-muted)]"
               )}
             >
               Finalize Bill <ArrowRight size={18} />
             </LiquidButton>
          </div>
        </div>
      </div>

      {/* Payment Selection Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 backdrop-blur-3xl bg-[var(--background)]/60">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-[480px]"
             >
                <ResinCard className="p-8 sm:p-10 !rounded-[2.5rem] bg-[var(--background)] border-[var(--card-border)] shadow-2xl relative" glowingColor="var(--accent-glow)">
                   <button 
                     onClick={() => setShowPaymentModal(false)}
                     className="absolute top-6 right-6 p-2 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                   >
                     <X size={20} />
                   </button>

                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-10 text-center">Payment Method</h3>
                   
                   <div className="grid grid-cols-2 gap-3 mb-8">
                      {[
                        { id: 'cash', label: 'Cash', icon: <Banknote size={18} />, color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
                        { id: 'bkash', label: 'bKash', icon: <Smartphone size={18} />, color: 'pink', bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
                        { id: 'nagad', label: 'Nagad', icon: <Wallet size={18} />, color: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
                        { id: 'card', label: 'Credit Card', icon: <CreditCard size={18} />, color: 'indigo', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={cn(
                            "group relative p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center gap-2",
                            paymentMethod === m.id 
                              ? `bg-${m.color}-500/20 border-${m.color}-500/40 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-[1.02]` 
                              : "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--card-border)] hover:bg-[var(--card-bg)]/80"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                            paymentMethod === m.id ? `bg-${m.color}-500 text-white shadow-[0_0_15px_var(--tw-shadow-color)] shadow-${m.color}-500/50` : "bg-[var(--background)]/20 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                          )}>
                            {m.icon}
                          </div>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                            paymentMethod === m.id ? "text-white" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                          )}>{m.label}</span>
                          
                          {paymentMethod === m.id && (
                            <motion.div 
                              layoutId="selection-ring"
                              className={cn("absolute inset-0 border-2 rounded-2xl", `border-${m.color}-500/30`)}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </button>
                      ))}
                   </div>

                   <div className="mb-6 relative group">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-pink-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Customer Email/Phone (Optional)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl py-4 pl-12 pr-6 text-xs font-bold outline-none focus:border-[var(--accent)]/30 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      />
                   </div>

                   <LiquidButton 
                     onClick={() => {
                        handleCheckout();
                        setShowPaymentModal(false);
                     }}
                     disabled={!paymentMethod}
                     className={cn(
                       "w-full py-5 text-sm font-black uppercase tracking-[0.3em] transition-all rounded-2xl",
                       paymentMethod ? "bg-[var(--accent)] border-[var(--accent)] shadow-[0_0_30px_var(--accent-glow)] text-white" : "opacity-20 cursor-not-allowed"
                     )}
                   >
                     Confirm Payment
                   </LiquidButton>
                </ResinCard>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bill Modal */}
      <AnimatePresence>
        {showBill && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-[var(--background)]/80">
             <motion.div
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9, y: 50 }}
               className="relative w-full max-w-[400px]"
             >
                <button 
                  onClick={resetPOS}
                  className="absolute -top-12 right-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  New Order <X size={18} />
                </button>

                 {/* Unified receipt — reads all design tokens from settingsStore */}
                 <div
                   ref={billRef}
                   className="w-full shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-[2.5rem]"
                   style={{ maxHeight: 'calc(100dvh - 10rem)' }}
                 >
                   <ReceiptDocument
                     siteName={settings.siteName}
                     currency={settings.currency}
                     billDesign={settings.billDesign}
                     transactionId={transactionId}
                     timestamp={new Date().toISOString()}
                     items={cart.map(item => ({
                       name: item.name,
                       quantity: item.quantity,
                       price: item.price,
                       article: item.article,
                     }))}
                     subtotal={subtotal}
                     taxTotal={totalTax}
                     discount={discountAmount > 0 ? discountAmount : undefined}
                     couponCode={appliedCoupon?.code}
                     total={total}
                     paymentMethod={paymentMethod ?? 'N/A'}
                     channel="pos"
                   />
                 </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 shrink-0">
                   <button 
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[var(--text-primary)] text-[var(--background)] rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                   >
                      <Printer size={18} /> Print 
                   </button>
                   <button 
                     onClick={handleSendToPhone}
                     className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[var(--accent)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all relative overflow-hidden"
                   >
                      <Smartphone size={18} /> 
                      {showPhoneToast ? "Sent!" : "Send to Phone"}
                      {showPhoneToast && (
                        <motion.div 
                          className="absolute inset-0 bg-white/30 rounded-2xl pointer-events-none"
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TerminalSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Variant Picker Modal */}
      <AnimatePresence>
        {pickingVariantFor && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-3xl bg-[var(--background)]/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <ResinCard className="p-8 !rounded-[2.5rem] bg-[var(--background)] border-[var(--card-border)] shadow-2xl relative" glowingColor="var(--accent-glow)">
                <button 
                  onClick={() => setPickingVariantFor(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex gap-6 mb-8 items-start">
                   <div className="w-24 h-24 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center relative overflow-hidden shrink-0 shadow-resin">
                      {pickingVariantFor.image ? (
                        <Image src={pickingVariantFor.image} alt={pickingVariantFor.name} fill className="object-cover" />
                      ) : (
                        <span className="text-xl font-black text-[var(--accent)]">{pickingVariantFor.article.split('-')[0]}</span>
                      )}
                   </div>
                   <div className="min-w-0 pt-2">
                     <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">Select Variant</h3>
                     <h2 className="text-xl font-black text-[var(--text-primary)] truncate">{pickingVariantFor.name}</h2>
                     <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest mt-1">{pickingVariantFor.article}</p>
                   </div>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                  {pickingVariantFor.variants.map((v) => (
                    <div key={v.color} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color.toLowerCase().includes('white') ? 'white' : v.color.toLowerCase().includes('black') ? '#333' : v.color }} />
                          {v.color}
                        </p>
                        {v.image && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--card-border)] shadow-sm relative">
                            <Image src={v.image} alt={v.color} fill className="object-cover" />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {v.sizes.map((s) => {
                          const available = getAvailableStock(pickingVariantFor.id, v.color, s.size);
                          return (
                            <button
                              key={s.size}
                              disabled={available <= 0}
                              onClick={() => addToCart(pickingVariantFor, { color: v.color, size: s.size })}
                              className={cn(
                                "p-3 rounded-xl border transition-all text-left relative overflow-hidden group",
                                available <= 0 
                                  ? "bg-[var(--card-bg)]/50 border-[var(--card-border)] opacity-50 cursor-not-allowed grayscale" 
                                  : "bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5"
                              )}
                            >
                              <div className="flex justify-between items-center">
                                <span className={cn(
                                  "text-xs font-bold transition-colors",
                                  available <= 0 ? "text-[var(--text-muted)]" : "text-[var(--text-primary)] group-hover:text-[var(--accent)]"
                                )}>{s.size}</span>
                                <span className={cn(
                                  "text-[9px] font-black px-1.5 py-0.5 rounded",
                                  available <= 0 ? "bg-black/20 text-white/20" : 
                                  available < 5 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                                )}>
                                  {available <= 0 ? "HOLD / SOLD" : available}
                                </span>
                              </div>
                              {s.priceAdjustment !== 0 && (
                                <p className="text-[8px] font-bold text-[var(--text-muted)] mt-1">
                                  {s.priceAdjustment > 0 ? '+' : ''}{settings.formatPrice(s.priceAdjustment)}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ResinCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
