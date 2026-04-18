'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Printer, 
  Smartphone,
  ChevronLeft,
  User,
  CreditCard,
  Ticket,
  BadgeCheck,
  BadgeAlert,
  Banknote,
  Wallet,
  Phone
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSalesStore } from '@/store/salesStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCouponStore, Coupon } from '@/store/couponStore';
import LiquidButton from '@/components/LiquidButton';
import { cn } from '@/lib/utils';
import { printReceipt } from '@/lib/printReceipt';

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, clearCart, getSubtotal, getTaxTotal } = useCartStore();
  const { decrementStock } = useInventoryStore();
  const { addTransaction } = useSalesStore();
  const settings = useSettingsStore();
  const { validateCoupon, incrementUses } = useCouponStore();

  const [view, setView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showPhoneToast, setShowPhoneToast] = useState(false);
  
  // Snapshot for success view to fix $0 bug
  const [completedOrder, setCompletedOrder] = useState<{
    items: any[];
    subtotal: number;
    taxTotal: number;
    total: number;
    discount: number;
    appliedCoupon: Coupon | null;
    id: string;
  } | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const taxTotal = getTaxTotal();
  
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.type === 'percent' ? (subtotal * (appliedCoupon.value / 100)) : appliedCoupon.value)
    : 0;

  const total = Math.max(0, subtotal + taxTotal - discountAmount);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    // Map items to simple { productId, quantity } format
    const cartPayload = items.map(i => ({ productId: i.productId, quantity: i.quantity }));
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

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // Validation
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryCity) {
      alert('Please complete all identification and delivery address fields.');
      return;
    }
    
    if (!paymentMethod) {
      alert('Please select an authorization portal (payment method).');
      return;
    }

    setIsProcessing(true);
    
    // Snapshot details before clearing cart
    const orderDetails = {
      items: [...items],
      subtotal,
      taxTotal,
      total,
      discount: discountAmount,
      appliedCoupon,
      id: `TXN-${Math.floor(Math.random() * 1000000)}`
    };

    // Simulate payment processing
    setTimeout(() => {
      setTransactionId(orderDetails.id);
      setCompletedOrder(orderDetails);

      // Record transaction
      addTransaction({
        id: orderDetails.id,
        items: orderDetails.items,
        subtotal: orderDetails.subtotal,
        taxTotal: orderDetails.taxTotal,
        total: orderDetails.total,
        paymentMethod: paymentMethod || 'Online Payment',
        timestamp: new Date().toISOString(),
        customerName,
        customerPhone,
        deliveryAddress,
        deliveryCity,
        channel: 'online',
        status: 'pending'
      });

      const { decrementStock, decrementVariantStock } = useInventoryStore.getState();
      orderDetails.items.forEach(item => {
        if (item.selectedVariant) {
          decrementVariantStock(item.productId, item.selectedVariant.color, item.selectedVariant.size, item.quantity);
        } else {
          decrementStock(item.productId, item.quantity);
        }
      });

      // Increment coupon usage
      if (appliedCoupon) {
        incrementUses(appliedCoupon.id);
      }

      setIsProcessing(false);
      setView('success');
      clearCart();
    }, 1500);
  };

  const handlePrint = () => {
    if (!transactionId) return;

    printReceipt(
      {
        id: transactionId,
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          article: i.article,
          price: i.price,
          quantity: i.quantity,
          tax: i.tax,
          selectedVariant: i.selectedVariant,
        })),
        subtotal: getSubtotal(),
        taxTotal: getTaxTotal(),
        discount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: appliedCoupon?.code ?? undefined,
        total: total,
        paymentMethod: paymentMethod ?? 'Online Payment',
        timestamp: new Date().toISOString(),
        channel: 'online',
        status: 'completed',
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      },
      {
        siteName: settings.siteName,
        currency: settings.currency,
        billDesign: settings.billDesign,
      }
    );
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
          items: items.map(i => ({ name: i.name, price: settings.getConvertedAmount(i.price * i.quantity) })),
          tax: settings.getConvertedAmount(taxTotal),
          discount: settings.getConvertedAmount(discountAmount),
          total: settings.getConvertedAmount(total),
          txnId: transactionId,
          paymentMethod: paymentMethod || 'Online Payment',
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

  const closeAndReset = () => {
    setOpen(false);
    setTimeout(() => {
      setView('cart');
      setCustomerName('');
      setPaymentMethod(null);
      setAppliedCoupon(null);
      setCouponCode('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[210] w-full max-w-md bg-[#0a0a12]/95 backdrop-blur-3xl border-l border-white/5 flex flex-col shadow-[-20px_0_80px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0">
               <div className="flex items-center gap-3">
                 {view !== 'cart' && (
                   <button onClick={() => setView('cart')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors mr-2">
                      <ChevronLeft size={16} />
                   </button>
                 )}
                 <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-resin">
                   <ShoppingBag size={18} className="text-indigo-400" />
                 </div>
                 <div>
                   <h2 className="text-sm font-black uppercase tracking-widest">
                     {view === 'cart' ? 'Your Bag' : view === 'checkout' ? 'Checkout' : 'Order Secured'}
                   </h2>
                   <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Aero Resin Protocol</p>
                 </div>
               </div>
               <button
                 onClick={closeAndReset}
                 className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
               >
                 <X size={18} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              <AnimatePresence mode="wait">
                {view === 'cart' ? (
                  <motion.div
                    key="cart-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-4"
                  >
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.selectedVariant?.color || 'default'}-${item.selectedVariant?.size || 'default'}`}
                        layout
                        className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 group"
                      >
                        <div className="flex gap-4 mb-3">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-[10px] font-black text-white/10 uppercase tracking-tighter">Vault</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <h4 className="text-xs font-black uppercase tracking-tight truncate">{item.name}</h4>
                                <div className="flex flex-col">
                                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{item.article}</p>
                                  {item.selectedVariant && (
                                    <p className="text-[8px] font-black text-indigo-400/80 uppercase tracking-[0.2em] mt-0.5">
                                      {item.selectedVariant.color} / {item.selectedVariant.size}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm font-black tracking-tight shrink-0 ml-3">
                                {settings.formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
                            <button
                              onClick={() => updateQuantity(item.productId, -1, item.selectedVariant)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/60"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1, item.selectedVariant)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/60"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.selectedVariant)}
                            className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-inner"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {items.length === 0 && (
                      <div className="py-24 flex flex-col items-center justify-center text-white/10">
                        <ShoppingBag size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Bag is Empty</p>
                      </div>
                    )}
                  </motion.div>
                ) : view === 'checkout' ? (
                  <motion.div
                    key="checkout-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-8"
                  >
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Customer Identity</h3>
                       <div className="space-y-3">
                         <div className="relative group">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="Full Name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all"
                            />
                         </div>
                         <div className="relative group">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="Phone or Email"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all"
                            />
                         </div>
                         <div className="relative group">
                            <Ticket size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="Full Delivery Address"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all"
                            />
                         </div>
                         <div className="relative group">
                            <BadgeCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="City"
                              value={deliveryCity}
                              onChange={(e) => setDeliveryCity(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs font-bold outline-none focus:border-indigo-500/30 transition-all"
                            />
                         </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Authorization Portal</h3>
                       <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={16} />, color: 'emerald' },
                            { id: 'bkash', label: 'bKash Wallet', icon: <Smartphone size={16} />, color: 'pink' },
                            { id: 'nagad', label: 'Nagad Pay', icon: <Wallet size={16} />, color: 'orange' },
                            { id: 'card', label: 'Credit Card', icon: <CreditCard size={16} />, color: 'indigo' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setPaymentMethod(m.id)}
                              className={cn(
                                "group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2",
                                paymentMethod === m.id 
                                  ? `bg-${m.color}-500/20 border-${m.color}-500/40 shadow-[0_0_15px_rgba(255,255,255,0.05)]` 
                                  : "bg-white/5 border-white/5 text-white/30 hover:border-white/10 hover:bg-white/[0.07]"
                              )}
                            >
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                                paymentMethod === m.id ? `bg-${m.color}-500 text-white shadow-lg` : "bg-black/20 text-white/20"
                              )}>
                                {m.icon}
                              </div>
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest transition-colors",
                                paymentMethod === m.id ? "text-white" : "text-white/20 group-hover:text-white/40"
                              )}>{m.label}</span>
                              
                              {paymentMethod === m.id && (
                                <motion.div 
                                  layoutId="shop-selection-ring"
                                  className={cn("absolute inset-0 border-2 rounded-2xl", `border-${m.color}-500/30`)}
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-2">Order Summary</p>
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-white/40">{totalItems} Items</span>
                          <span>{settings.formatPrice(subtotal)}</span>
                       </div>
                       <div className="flex justify-between text-lg font-black pt-4 border-t border-white/5">
                          <span className="uppercase tracking-tighter">Due for Securing</span>
                          <span className="text-white">{settings.formatPrice(total)}</span>
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6"
                  >
                    {/* Materialized Receipt Design */}
                    <div className="w-full bg-[#fdfdfd] text-[#1a1a1a] rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative max-h-[60vh]">
                       <div className="absolute top-0 left-0 right-0 h-4 bg-white flex justify-between px-2 overflow-hidden shrink-0">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-[#0a0a12] -mt-3 shrink-0" />
                          ))}
                       </div>

                       <div className="p-8 pt-10 overflow-y-auto no-scrollbar">
                          <div className="text-center mb-8 border-b border-black/5 pb-8 shrink-0">
                             <div className="text-2xl font-black tracking-tighter mb-1 text-black" style={{ color: settings.billDesign.accentColor }}>{settings.siteName}</div>
                             <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.4em]">{settings.billDesign.headerText}</p>
                          </div>

                          <div className="space-y-6 mb-8">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-[8px] font-black text-black/30 uppercase mb-1">Transaction</p>
                                   <p className="text-[10px] font-black tracking-tight">{completedOrder?.id}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[8px] font-black text-black/30 uppercase mb-1">Channel</p>
                                   <p className="text-[10px] font-black text-indigo-600 uppercase">E-Commerce</p>
                                </div>
                             </div>
                             <div className="space-y-4">
                                {(completedOrder?.items || []).map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center gap-4 text-black">
                                     <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-black truncate">{item.name}</span>
                                        <span className="text-[10px] text-black/40">{item.quantity} x {settings.formatPrice(item.price)}</span>
                                     </div>
                                     <span className="text-xs font-black shrink-0">{settings.formatPrice(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                             </div>

                             <div className="pt-6 border-t border-dashed border-black/20 space-y-2 text-black">
                                <div className="flex justify-between text-xs font-bold text-black/40 uppercase">
                                   <span>Subtotal</span>
                                   <span className="text-black">{settings.formatPrice(completedOrder?.subtotal || 0)}</span>
                                </div>
                                {completedOrder?.discount ? (
                                  <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase">
                                     <span>Discount ({completedOrder.appliedCoupon?.code})</span>
                                     <span>-{settings.formatPrice(completedOrder.discount)}</span>
                                  </div>
                                ) : null}
                                <div className="flex justify-between text-xs font-bold text-black/40 uppercase">
                                   <span>Security Tax</span>
                                   <span className="text-black">{settings.formatPrice(completedOrder?.taxTotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-4">
                                   <span className="tracking-tighter uppercase">Total</span>
                                   <span className="text-indigo-600" style={{ color: settings.billDesign.accentColor }}>{settings.formatPrice(completedOrder?.total || 0)}</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/[0.03] border border-black/5 mb-8">
                             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
                                <CheckCircle2 className="text-emerald-500" size={20} />
                             </div>
                             <div className="min-w-0">
                                <p className="text-[8px] font-black text-black/30 uppercase tracking-widest">Order Status</p>
                                <p className="text-xs font-black uppercase text-indigo-600 truncate">Pending Shipment</p>
                             </div>
                          </div>

                          <div className="text-center pb-4 shrink-0">
                             <div className="flex justify-center gap-1 mb-4 opacity-10 overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                  <div key={i} className={cn("w-px h-6 bg-black flex-shrink-0", i % 3 === 0 ? "h-8" : "h-5")} />
                                ))}
                             </div>
                             <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em]">{settings.billDesign.footerText}</p>
                          </div>
                       </div>

                       <div className="h-4 bg-white w-full flex justify-between px-2 overflow-hidden mt-auto shrink-0">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-[#0a0a12] mt-3 shrink-0" />
                          ))}
                       </div>
                    </div>

                    <div className="mt-8 space-y-3">
                       <LiquidButton 
                         onClick={handlePrint}
                         className="w-full py-4 text-[10px] font-black uppercase tracking-widest bg-white text-black border-white shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                       >
                          <Printer size={16} /> Print Receipt
                       </LiquidButton>
                       <button 
                         onClick={closeAndReset}
                         className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                       >
                          Close Portal
                       </button>
                    </div>
                    
                    <button 
                      onClick={handleSendToPhone}
                      className="w-full py-4 mt-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-indigo-500 transition-all relative overflow-hidden"
                    >
                      <Phone size={14} /> 
                      {showPhoneToast ? "Sent!" : "Email Receipt"}
                      {showPhoneToast && (
                        <motion.div 
                          className="absolute inset-0 bg-white/30 rounded-xl pointer-events-none"
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky Actions */}
            {view !== 'success' && items.length > 0 && (
              <div className="p-6 bg-black/40 border-t border-white/5 space-y-4 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
                {view === 'cart' ? (
                  <>
                    <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
                       <span>Bag Subtotal</span>
                       <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                         <span className="flex items-center gap-2 px-1">
                            <BadgeCheck size={12} /> {appliedCoupon.code}
                         </span>
                         <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
                       <span>Total Security Tax</span>
                       <span>${taxTotal.toFixed(2)}</span>
                    </div>

                    {/* Coupon Bar */}
                    {!appliedCoupon ? (
                      <div className="pt-2 pb-1 relative">
                        <input 
                          type="text" 
                          placeholder="Coupon Code..." 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-9 pr-14 text-[10px] font-bold outline-none focus:border-indigo-500/30 transition-all uppercase"
                        />
                        <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <button 
                          onClick={handleApplyCoupon}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-black rounded-lg text-[8px] font-black uppercase tracking-tighter hover:scale-105 transition-all"
                        >
                          Apply
                        </button>
                        {couponError && (
                          <p className="text-[8px] font-bold text-rose-400 mt-1.5 flex items-center gap-1">
                            <BadgeAlert size={10} /> {couponError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={clearCoupon}
                        className="w-full py-1 text-[8px] font-black text-rose-500/50 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors"
                      >
                        Release Discount
                      </button>
                    )}

                    <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest pt-2">
                       <span>Bag Total</span>
                       <span>${total.toFixed(2)}</span>
                    </div>
                    <LiquidButton 
                      onClick={() => setView('checkout')}
                      className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] bg-indigo-600 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.3)]"
                    >
                      Initialize Checkout <ArrowRight size={16} />
                    </LiquidButton>
                  </>
                ) : (
                  <LiquidButton 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={cn(
                      "w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(16,185,129,0.3)] bg-emerald-600 border-emerald-500",
                      isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? 'Processing...' : 'Authorize & Place Order'}
                  </LiquidButton>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
