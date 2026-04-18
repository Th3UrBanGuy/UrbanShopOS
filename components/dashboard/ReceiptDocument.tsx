'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BillDesign } from '@/store/settingsStore';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  article?: string;
}

interface ReceiptDocumentProps {
  siteName: string;
  currency: string;
  billDesign: BillDesign;
  transactionId: string;
  timestamp?: string;
  items: ReceiptItem[];
  subtotal: number;
  taxTotal: number;
  discount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: string;
  channel?: 'pos' | 'online';
  customerName?: string;
  customerPhone?: string;
  /** if true renders a "REPRINT" badge */
  isReprint?: boolean;
  className?: string;
}

/**
 * ReceiptDocument — the single source-of-truth in-app receipt rendering.
 * Used inside the POS bill modal and the SalesView detail panel.
 * All visual tokens come from settingsStore.billDesign.
 */
export default function ReceiptDocument({
  siteName, currency, billDesign,
  transactionId, timestamp,
  items, subtotal, taxTotal, discount = 0, couponCode,
  total, paymentMethod, channel, customerName, customerPhone,
  isReprint = false, className,
}: ReceiptDocumentProps) {

  const currSym = currency === 'BDT' ? '৳' 
    : currency === 'USD' ? '$' 
    : currency === 'EUR' ? '€' 
    : currency === 'GBP' ? '£' 
    : currency;
  const date = timestamp ? new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const displayPhone = customerPhone || (billDesign.showCustomerPhone ? "017XX-XXXXXX" : null);

  const cornerClass = billDesign.cornerStyle === 'pill' ? 'rounded-[32px]'
    : billDesign.cornerStyle === 'rounded' ? 'rounded-[16px]'
    : 'rounded-none';

  const fontStyle = billDesign.fontFamily === 'mono' ? { fontFamily: "'JetBrains Mono', monospace" }
    : billDesign.fontFamily === 'serif' ? { fontFamily: "'Playfair Display', serif" }
    : { fontFamily: "'Inter', sans-serif" };

  const fsBase = billDesign.fontSize === 'sm' ? 11 : billDesign.fontSize === 'lg' ? 14 : 12;
  const fw = billDesign.fontWeight === 'black' ? '900' : billDesign.fontWeight === 'bold' ? '700' : '400';

  const alignClass = billDesign.headerAlign === 'left' ? 'text-left'
    : billDesign.headerAlign === 'right' ? 'text-right'
    : 'text-center';

  const sep = billDesign.showSeparatorLines ? (
    <div
      className="my-4"
      style={{
        borderTop: billDesign.borderStyle === 'none'
          ? 'none'
          : `1px ${billDesign.borderStyle} ${billDesign.borderColor}`,
      }}
    />
  ) : <div className="my-4" />;

  return (
    <div
      className={cn('w-full overflow-hidden flex flex-col relative transition-all duration-500 shadow-2xl', cornerClass, className)}
      style={{ 
        backgroundColor: billDesign.bgColor, 
        color: billDesign.textColor, 
        ...fontStyle,
        fontSize: `${fsBase}px`,
        fontWeight: fw
      }}
    >
      {/* Accent bar — top */}
      {(billDesign.accentPosition === 'top' || billDesign.accentPosition === 'both') && (
        <div style={{ height: `${billDesign.accentWidth}px`, background: billDesign.accentColor, flexShrink: 0 }} />
      )}

      {/* Left accent bar */}
      {billDesign.accentPosition === 'left' && (
        <div className="absolute left-0 top-0 bottom-0" style={{ width: billDesign.accentWidth, background: billDesign.accentColor }} />
      )}

      {/* Perforations — top */}
      {billDesign.showPerforations && (
        <div className="flex justify-between px-2 overflow-hidden py-1" style={{ backgroundColor: billDesign.bgColor }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full -mt-1.5 shrink-0 bg-black/10" />
          ))}
        </div>
      )}

      {/* Main scrollable content */}
      <div
        className={cn('flex-1 overflow-y-auto no-scrollbar px-6 py-5', billDesign.accentPosition === 'left' ? 'pl-10' : '')}
      >
        {/* Header */}
        <div className={cn('mb-6', alignClass)}>
          <div className="text-3xl font-black tracking-tighter leading-none mb-1" style={{ color: billDesign.accentColor, fontFamily: "'Space Grotesk', sans-serif" }}>
            {siteName}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.25em] mb-1" style={{ color: billDesign.mutedColor }}>
            {billDesign.headerText}
          </div>
          {billDesign.subHeaderText && (
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: billDesign.mutedColor }}>
              {billDesign.subHeaderText}
            </div>
          )}
        </div>

        {/* Reprint / Channel badge */}
        <div className="flex flex-wrap gap-2 mb-4">
          {isReprint && (
            <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border" style={{ borderColor: billDesign.accentColor, color: billDesign.accentColor }}>
              Receipt Copy
            </span>
          )}
          {channel === 'online' && (
            <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border" style={{ borderColor: billDesign.mutedColor, color: billDesign.mutedColor }}>
              Online Order
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="space-y-1 mb-4">
          {billDesign.showOrderId && (
            <div className="flex justify-between">
              <span className="text-[8px] font-black uppercase" style={{ color: billDesign.mutedColor }}>Order</span>
              <span className="text-[8px] font-black" style={{ color: billDesign.textColor }}>{transactionId}</span>
            </div>
          )}
          {billDesign.showDate && date && (
            <div className="flex justify-between">
              <span className="text-[8px] font-black uppercase" style={{ color: billDesign.mutedColor }}>Date</span>
              <span className="text-[8px] font-black" style={{ color: billDesign.textColor }}>{date}</span>
            </div>
          )}
          {billDesign.showTime && time && (
            <div className="flex justify-between">
              <span className="text-[8px] font-black uppercase" style={{ color: billDesign.mutedColor }}>Time</span>
              <span className="text-[8px] font-black" style={{ color: billDesign.textColor }}>{time}</span>
            </div>
          )}
          {customerName && (
            <div className="flex justify-between">
              <span className="text-[8px] font-black uppercase" style={{ color: billDesign.mutedColor }}>Customer</span>
              <span className="text-[8px] font-black" style={{ color: billDesign.textColor }}>{customerName}</span>
            </div>
          )}
          {billDesign.showCustomerPhone && displayPhone && (
            <div className="flex justify-between">
              <span className="text-[8px] font-black uppercase" style={{ color: billDesign.mutedColor }}>Phone</span>
              <span className="text-[8px] font-black" style={{ color: billDesign.textColor }}>{displayPhone}</span>
            </div>
          )}
        </div>

        {sep}

        {/* Items */}
        <div className="space-y-2.5 mb-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase leading-tight truncate" style={{ color: billDesign.textColor }}>{item.name}</div>
                <div className="text-[9px] mt-0.5" style={{ color: billDesign.mutedColor }}>{item.quantity} × {currSym}{item.price.toFixed(2)}</div>
              </div>
              <div className="text-xs font-black shrink-0" style={{ color: billDesign.textColor }}>{currSym}{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {sep}

        {/* Totals */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[10px] font-bold uppercase">
            <span style={{ color: billDesign.mutedColor }}>Subtotal</span>
            <span style={{ color: billDesign.textColor }}>{currSym}{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && billDesign.showDiscount && (
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span style={{ color: '#16a34a' }}>Discount{couponCode ? ` (${couponCode})` : ''}</span>
              <span style={{ color: '#16a34a' }}>−{currSym}{discount.toFixed(2)}</span>
            </div>
          )}
          {billDesign.showTax && (
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span style={{ color: billDesign.mutedColor }}>Tax</span>
              <span style={{ color: billDesign.textColor }}>{currSym}{taxTotal.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Grand total */}
        <div
          className="flex justify-between items-baseline py-3 px-3 rounded-xl mb-4"
          style={{ backgroundColor: billDesign.totalBgColor, border: `1px solid ${billDesign.borderColor}` }}
        >
          <span className="text-sm font-black uppercase tracking-wider" style={{ color: billDesign.textColor }}>Total</span>
          <span className="text-2xl font-black tracking-tighter" style={{ color: billDesign.accentColor }}>{currSym}{total.toFixed(2)}</span>
        </div>

        {/* Payment method */}
        {billDesign.showPaymentMethod && (
          <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ backgroundColor: billDesign.totalBgColor, border: `1px solid ${billDesign.borderColor}` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: billDesign.bgColor }}>
              <CheckCircle2 size={16} color="#16a34a" />
            </div>
            <div>
              <div className="text-[8px] font-black uppercase" style={{ color: billDesign.mutedColor }}>Payment Method</div>
              <div className="text-xs font-black uppercase" style={{ color: billDesign.accentColor }}>{paymentMethod}</div>
            </div>
          </div>
        )}

        {/* Barcode visual */}
        {billDesign.showBarcode && (
          <div className="flex justify-center gap-px mb-4 opacity-20">
            {Array.from({ length: 34 }).map((_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? 2 : 1, height: i % 5 === 0 ? 36 : 24, backgroundColor: billDesign.textColor }} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className={cn('text-[8px] font-black uppercase tracking-[0.15em] leading-relaxed', alignClass)} style={{ color: billDesign.mutedColor }}>
          {billDesign.footerText}
          {billDesign.tagline && <div className="mt-1 opacity-50">{billDesign.tagline}</div>}
        </div>

        {/* Signature line */}
        {billDesign.showSignatureLine && (
          <div className="mt-8 pt-2 text-center" style={{ borderTop: `1px solid ${billDesign.borderColor}` }}>
            <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: billDesign.mutedColor }}>Authorized Personnel</span>
          </div>
        )}
      </div>

      {/* Perforations — bottom */}
      {billDesign.showPerforations && (
        <div className="flex justify-between px-2 overflow-hidden" style={{ backgroundColor: billDesign.bgColor }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#e5e7eb' }} />
          ))}
        </div>
      )}

      {/* Accent bar — bottom */}
      {(billDesign.accentPosition === 'bottom' || billDesign.accentPosition === 'both') && (
        <div style={{ height: billDesign.accentWidth, background: billDesign.accentColor, flexShrink: 0 }} />
      )}
    </div>
  );
}
