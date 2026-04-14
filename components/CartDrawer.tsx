'use client';

import React, { useState, useRef } from 'react';
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
  MapPin,
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

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, clearCart, getSubtotal, getTaxTotal, getTotal } = useCartStore();
  const { decrementStock } = useInventoryStore();
  const { addTransaction } = useSalesStore();
  const settings = useSettingsStore();
  const { validateCoupon, incrementUses } = useCouponStore();

  const [view, setView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showPhoneToast, setShowPhoneToast] = useState(false);

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
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const newId = `TXN-${Math.floor(Math.random() * 1000000)}`;
      setTransactionId(newId);

      // Record transaction
      addTransaction({
        id: newId,
        items: [...items],
        subtotal,
        taxTotal,
        total,
        paymentMethod: paymentMethod || 'Online Payment',
        timestamp: new Date().toISOString(),
        customerName: customerName || 'Online Customer',
        customerPhone: customerPhone || undefined,
        channel: 'online',
        status: 'pending'
      });

      // Decrement inventory stock
      items.forEach(item => {
        decrementStock(item.productId, item.quantity);
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const { billDesign } = settings;
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transactionId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:wght@400;900&display=swap');
            
            :root {
              --accent: ${billDesign.accentColor};
              --text: ${billDesign.textColor};
              --muted: ${billDesign.mutedColor};
              --bg: ${billDesign.bgColor};
              --border: ${billDesign.borderColor};
            }

            body { 
              font-family: ${billDesign.fontFamily === 'mono' ? "'JetBrains Mono'" : billDesign.fontFamily === 'serif' ? "'Playfair Display'" : "'Inter'"}, sans-serif;
              background: white; 
              margin: 0; 
              padding: 0;
              color: var(--text);
              font-size: ${billDesign.fontSize === 'sm' ? '10px' : billDesign.fontSize === 'lg' ? '14px' : '12px'};
            }

            .receipt { 
              width: ${billDesign.paperWidth === 'narrow' ? '250px' : billDesign.paperWidth === 'wide' ? '400px' : '320px'}; 
              margin: 0 auto; 
              padding: 40px 20px;
              background: var(--bg);
              min-height: 100vh;
            }

            .header { 
              text-align: ${billDesign.headerAlign}; 
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: ${billDesign.borderStyle === 'none' ? 'none' : `1px ${billDesign.borderStyle} var(--border)`};
              position: relative;
            }

            ${billDesign.accentPosition === 'top' || billDesign.accentPosition === 'both' ? `
            .header::before {
              content: '';
              position: absolute;
              top: -40px;
              left: 0;
              right: 0;
              height: ${billDesign.accentWidth}px;
              background: var(--accent);
            }
            ` : ''}

            .brand { 
              font-size: 28px; 
              font-weight: 900; 
              letter-spacing: -1.5px; 
              color: var(--accent);
              text-transform: uppercase;
              margin-bottom: 4px;
            }

            .tagline { 
              font-size: 10px; 
              text-transform: uppercase; 
              font-weight: 900;
              letter-spacing: 2px;
              color: var(--muted);
            }

            .meta { 
              display: flex; 
              justify-content: space-between; 
              font-size: 9px; 
              font-weight: 700;
              text-transform: uppercase;
              color: var(--muted); 
              margin-bottom: 30px;
              letter-spacing: 1px;
            }

            .items { margin-bottom: 30px; }
            .item { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 12px; 
            }
            .item-info { display: flex; flex-direction: column; }
            .item-name { font-weight: 800; text-transform: uppercase; font-size: 11px; }
            .item-qty { font-size: 9px; color: var(--muted); font-weight: 700; }

            .totals { 
              border-top: 1px dashed var(--border); 
              padding-top: 20px; 
              margin-bottom: 40px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 6px;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 10px;
            }
            .grand-total { 
              font-size: 20px; 
              font-weight: 900; 
              margin-top: 15px; 
              color: var(--accent);
              letter-spacing: -1px;
            }

            .footer { 
              text-align: center; 
              font-size: 9px; 
              font-weight: 800;
              text-transform: uppercase;
              color: var(--muted);
              letter-spacing: 1px;
              line-height: 1.6;
            }

            @media print {
              body { padding: 0; }
              .receipt { width: 100%; min-height: auto; padding: 20px; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="brand">${settings.siteName}</div>
              <div class="tagline">${billDesign.headerText}</div>
            </div>
            
            <div class="meta">
              <div>
                ${billDesign.showOrderId ? `<div>ID: ${transactionId}</div>` : ''}
                ${billDesign.showDate ? `<div>Date: ${date}</div>` : ''}
              </div>
              <div style="text-align: right">
                ${billDesign.showTime ? `<div>Time: ${time}</div>` : ''}
                ${billDesign.showPaymentMethod ? `<div>Paid: ${paymentMethod || 'Online'}</div>` : ''}
              </div>
            </div>

            <div class="items">
              ${items.map(item => `
                <div class="item">
                  <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">${item.quantity} x $${item.price.toFixed(2)}</span>
                  </div>
                  <span style="font-weight: 900">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>

            <div class="totals">
              <div class="total-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
              ${billDesign.showTax ? `<div class="total-row"><span>Tax (${settings.defaultTaxRate}%)</span><span>$${taxTotal.toFixed(2)}</span></div>` : ''}
              ${billDesign.showDiscount && appliedCoupon ? `
                <div class="total-row" style="color: #059669">
                  <span>Discount (${appliedCoupon.code})</span>
                  <span>-$${discountAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="total-row grand-total">
                <span>TOTAL</span>
                <span>$${total.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              ${billDesign.footerText}
              <div style="margin-top: 20px; opacity: 0.1; font-size: 8px;">
                ${transactionId} | AERO RESIN CORE | ONLINE
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                        key={item.productId}
                        layout
                        className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="min-w-0">
                            <h4 className="text-xs font-black uppercase tracking-tight truncate">{item.name}</h4>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{item.article}</p>
                          </div>
                          <span className="text-sm font-black tracking-tight shrink-0 ml-3">
                            {settings.formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/60"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white/60"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
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
                                   <p className="text-[10px] font-black tracking-tight">{transactionId}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[8px] font-black text-black/30 uppercase mb-1">Channel</p>
                                   <p className="text-[10px] font-black text-indigo-600 uppercase">E-Commerce</p>
                                </div>
                             </div>

                             <div className="space-y-4">
                                {items.map(item => (
                                  <div key={item.productId} className="flex justify-between items-center gap-4 text-black">
                                     <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-black truncate">{item.name}</span>
                                        <span className="text-[10px] text-black/40">{item.quantity} x ${item.price.toFixed(2)}</span>
                                     </div>
                                     <span className="text-xs font-black shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                             </div>

                             <div className="pt-6 border-t border-dashed border-black/20 space-y-2 text-black">
                                <div className="flex justify-between text-xs font-bold text-black/40 uppercase">
                                   <span>Subtotal</span>
                                   <span className="text-black">{settings.formatPrice(subtotal)}</span>
                                </div>
                                {appliedCoupon && (
                                  <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase">
                                     <span>Discount ({appliedCoupon.code})</span>
                                     <span>-{settings.formatPrice(discountAmount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-xs font-bold text-black/40 uppercase">
                                   <span>Security Tax</span>
                                   <span className="text-black">{settings.formatPrice(taxTotal)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-4">
                                   <span className="tracking-tighter uppercase">Total</span>
                                   <span className="text-indigo-600" style={{ color: settings.billDesign.accentColor }}>{settings.formatPrice(total)}</span>
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
