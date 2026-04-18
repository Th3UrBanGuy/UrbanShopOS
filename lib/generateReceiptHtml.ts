import type { SaleTransaction } from '@/types';
import type { BillDesign } from '@/store/settingsStore';

interface ReceiptOptions {
  siteName: string;
  currency: string;
  billDesign: BillDesign;
}

export function generateReceiptHtml(tx: SaleTransaction, options: ReceiptOptions): string {
  const { billDesign: d, siteName, currency } = options;
  const { 
    id, items, subtotal, taxTotal, discount = 0, couponCode, 
    total, paymentMethod, timestamp, customerName, customerPhone,
    deliveryAddress, deliveryCity, customerEmail 
  } = tx;

  const date = new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currSym = currency === 'BDT' ? '৳' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  // Helper mappings
  const getFontFamily = (f: string) => {
    if (f === 'mono') return "'JetBrains Mono', 'Courier New', monospace";
    if (f === 'serif') return "'Playfair Display', Georgia, serif";
    return "'Inter', system-ui, sans-serif";
  };

  const getWidth = (w: string) => {
    if (w === 'narrow') return '300px';
    if (w === 'wide') return '440px';
    return '380px';
  };

  const getRadius = (c: string) => {
    if (c === 'pill') return '32px';
    if (c === 'rounded') return '16px';
    return '0px';
  };

  const getWeight = (w: string) => {
    if (w === 'black') return '900';
    if (w === 'bold') return '700';
    return '400';
  };

  const getAlign = (a: string) => a || 'center';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt — ${id}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: ${d.accentColor};
      --bg: ${d.bgColor};
      --text: ${d.textColor};
      --muted: ${d.mutedColor};
      --border: ${d.borderColor};
      --total-bg: ${d.totalBgColor};
      --font-main: ${getFontFamily(d.fontFamily)};
      --weight-main: ${getWeight(d.fontWeight)};
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: var(--font-main);
      font-weight: var(--weight-main);
      background: #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: var(--text);
      -webkit-print-color-adjust: exact;
      font-size: ${d.fontSize === 'sm' ? '11px' : d.fontSize === 'lg' ? '14px' : '12px'};
    }

    .document {
      width: ${getWidth(d.paperWidth)};
      background: var(--bg);
      border-radius: ${getRadius(d.cornerStyle)};
      box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15);
      position: relative;
      overflow: hidden;
      border: ${d.borderStyle === 'none' ? 'none' : `1px ${d.borderStyle} var(--border)`};
    }

    .accent-bar {
      height: ${d.accentWidth}px;
      background: var(--accent);
    }

    .perforations {
      display: flex;
      justify-content: space-around;
      padding: 4px 10px;
      overflow: hidden;
      background: var(--bg);
    }
    .perforations div {
      width: 10px;
      height: 10px;
      background: #f1f5f9;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .content {
      padding: 30px 25px;
      position: relative;
    }

    .header {
      text-align: ${getAlign(d.headerAlign)};
      margin-bottom: 25px;
    }

    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 4px;
    }

    .header-text {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: var(--muted);
    }

    .sub-header-text {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-top: 2px;
    }

    .separator {
      margin: 15px 0;
      border-top: ${d.borderStyle === 'none' ? 'none' : `1px ${d.borderStyle} var(--border)`};
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
    }

    .info-label { color: var(--muted); }
    .info-val { color: var(--text); }

    .items-container {
      margin-bottom: 20px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .item-main { flex: 1; min-width: 0; }
    .item-name { 
      font-size: 11px; 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 0.02em; 
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-meta { 
      font-size: 9px; 
      color: var(--muted); 
      font-weight: 700; 
    }
    .item-total { 
      font-size: 12px; 
      font-weight: 900; 
      padding-left: 15px; 
      white-space: nowrap;
    }

    .totals-container {
      background: var(--total-bg);
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid var(--border);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .total-row:last-child { margin-bottom: 0; }

    .grand-total {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .grand-label { font-size: 13px; font-weight: 900; }
    .grand-val { font-size: 22px; font-weight: 900; color: var(--accent); letter-spacing: -0.02em; }

    .payment-badge {
      display: inline-block;
      padding: 4px 12px;
      background: var(--accent);
      color: white;
      border-radius: 20px;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .barcode-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      margin-bottom: 20px;
      opacity: 0.7;
    }

    .barcode {
      height: 30px;
      width: 160px;
      background: repeating-linear-gradient(90deg, var(--text), var(--text) 1px, transparent 1px, transparent 3px, var(--text) 3px, var(--text) 4px);
    }

    .footer {
      text-align: ${getAlign(d.headerAlign)};
    }

    .footer-text {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      line-height: 1.6;
      color: var(--muted);
    }

    .tagline {
      font-size: 9px;
      font-weight: 900;
      color: var(--accent);
      margin-top: 6px;
      letter-spacing: 0.1em;
    }

    .signature-line {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 8px;
      font-weight: 800;
      color: var(--muted);
      text-transform: uppercase;
    }

    .print-btn {
      margin-top: 30px;
      padding: 14px 34px;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 50px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.2s;
    }
    .print-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }

    @media print {
      body { background: #fff; padding: 0; }
      .document { box-shadow: none; border-radius: 0; width: 100%; border: none; }
      .print-btn { display: none; }
      @page { margin: 0; size: auto; }
      .perforations div { background: #fff; }
    }
  </style>
</head>
<body>
  <div class="document">
    ${d.showPerforations ? `<div class="perforations"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>` : ''}
    ${(d.accentPosition === 'top' || d.accentPosition === 'both') ? `<div class="accent-bar"></div>` : ''}
    
    <div class="content">
      <div class="header">
        <div class="brand-name">${siteName}</div>
        <div class="header-text">${d.headerText}</div>
        ${d.subHeaderText ? `<div class="sub-header-text">${d.subHeaderText}</div>` : ''}
      </div>

      <div class="info-grid">
        ${d.showOrderId ? `
          <div class="info-row">
            <span class="info-label">Transaction ID</span>
            <span class="info-val">#${id.substr(-8).toUpperCase()}</span>
          </div>
        ` : ''}
        ${d.showDate ? `
          <div class="info-row">
            <span class="info-label">Date Sequence</span>
            <span class="info-val">${date}</span>
          </div>
        ` : ''}
        ${d.showTime ? `
          <div class="info-row">
            <span class="info-label">Arrival Time</span>
            <span class="info-val">${time}</span>
          </div>
        ` : ''}
        ${(d.showCustomerPhone && (customerPhone || customerName)) ? `
          <div class="info-row">
            <span class="info-label">Customer</span>
            <span class="info-val">${customerName ? customerName : ''} ${customerPhone ? `(${customerPhone})` : ''}</span>
          </div>
        ` : ''}
        ${deliveryAddress ? `
          <div class="info-row" style="margin-top: 4px;">
            <span class="info-label">Ship To</span>
            <span class="info-val" style="text-align: right; max-width: 150px;">${deliveryAddress}, ${deliveryCity}</span>
          </div>
        ` : ''}
        ${customerEmail ? `
          <div class="info-row">
            <span class="info-label">Reference Email</span>
            <span class="info-val">${customerEmail}</span>
          </div>
        ` : ''}
      </div>

      ${d.showSeparatorLines ? `<div class="separator"></div>` : ''}

      <div class="items-container">
        ${items.map(item => `
          <div class="item-row">
            <div class="item-main">
              <div class="item-name">${item.name}</div>
              <div class="item-meta">${item.quantity} units @ ${currSym}${item.price.toFixed(2)}</div>
            </div>
            <div class="item-total">${currSym}${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>

      ${d.showSeparatorLines ? `<div class="separator"></div>` : ''}

      <div class="totals-container">
        <div class="total-row"><span>Subtotal</span><span>${currSym}${subtotal.toFixed(2)}</span></div>
        ${(d.showDiscount && discount > 0) ? `<div class="total-row" style="color:#16a34a;"><span>Saving${couponCode ? ` (${couponCode})` : ''}</span><span>−${currSym}${discount.toFixed(2)}</span></div>` : ''}
        ${(d.showTax && taxTotal > 0) ? `<div class="total-row"><span>Tax Provision</span><span>${currSym}${taxTotal.toFixed(2)}</span></div>` : ''}
        <div class="grand-total">
          <span class="grand-label">NET TOTAL</span>
          <span class="grand-val">${currSym}${total.toFixed(2)}</span>
        </div>
      </div>

      ${d.showPaymentMethod ? `
        <div style="text-align: center;">
          <div class="payment-badge">${paymentMethod}</div>
        </div>
      ` : ''}

      ${d.showBarcode ? `
        <div class="barcode-section">
          <div class="barcode"></div>
          <div style="font-size: 7px; font-weight: 900; letter-spacing: 0.3em; color: var(--muted);">SECURE VERIFIED PROTOCOL</div>
        </div>
      ` : ''}

      <div class="footer">
        <div class="footer-text">${d.footerText}</div>
        ${d.tagline ? `<div class="tagline">${d.tagline}</div>` : ''}
      </div>

      ${d.showSignatureLine ? `
        <div class="signature-line">Authorized Personnel</div>
      ` : ''}
    </div>

    ${(d.accentPosition === 'bottom' || d.accentPosition === 'both') ? `<div class="accent-bar" style="margin-top:0px;"></div>` : ''}
    ${d.showPerforations ? `<div class="perforations" style="padding-top:0px; padding-bottom:10px;"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>` : ''}
  </div>

  <button class="print-btn" onclick="window.print()">PROCEED TO PRINT</button>

  <script>
    window.onload = () => {
      setTimeout(() => {
        if (window.innerWidth < 600) window.print();
      }, 600);
    };
  </script>
</body>
</html>`;
}
