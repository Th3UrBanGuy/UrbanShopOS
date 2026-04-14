import type { SaleTransaction } from '@/types';
import type { BillDesign } from '@/store/settingsStore';

interface PrintSettings {
  siteName: string;
  currency: string;
  billDesign: BillDesign;
}

function getFontFamily(f: BillDesign['fontFamily']): string {
  if (f === 'mono') return "'JetBrains Mono', 'Courier New', monospace";
  if (f === 'serif') return "'Playfair Display', Georgia, serif";
  return "'Inter', system-ui, sans-serif";
}

function getPaperWidth(w: BillDesign['paperWidth']): string {
  if (w === 'narrow') return '280px';
  if (w === 'wide') return '440px';
  return '360px';
}

function getCornerRadius(c: BillDesign['cornerStyle']): string {
  if (c === 'pill') return '24px';
  if (c === 'rounded') return '12px';
  return '0px';
}

export function printReceipt(tx: SaleTransaction, settings: PrintSettings): void {
  const printWindow = window.open('', '_blank', 'width=500,height=700');
  if (!printWindow) return;

  const { billDesign, siteName, currency } = settings;
  const { subtotal, taxTotal, discount = 0, couponCode, total, paymentMethod, timestamp, id, items, channel, customerName, customerPhone } = tx;

  const date = new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const currSym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;

  const accentBar = (pos: 'top' | 'bottom') => {
    const show = billDesign.accentPosition === pos || billDesign.accentPosition === 'both';
    return show ? `<div style="height:${billDesign.accentWidth}px;background:${billDesign.accentColor};width:100%;"></div>` : '';
  };

  const perfRow = `
    <div style="display:flex;justify-content:space-between;padding:0 6px;overflow:hidden;line-height:0;">
      ${Array.from({ length: 18 }).map(() => `<div style="width:14px;height:14px;border-radius:50%;background:${billDesign.bgColor};border:1px solid ${billDesign.borderColor};"></div>`).join('')}
    </div>`;

  const separatorLine = billDesign.showSeparatorLines
    ? `<div style="border-top:1px ${billDesign.borderStyle === 'none' ? 'solid' : billDesign.borderStyle} ${billDesign.borderColor};margin:16px 0;"></div>`
    : '<div style="margin:16px 0;"></div>';

  const itemsHTML = items.map(item => `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
      <div>
        <div style="font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;">${item.name}</div>
        <div style="font-size:9px;color:${billDesign.mutedColor};font-weight:600;margin-top:2px;">${item.quantity} × ${currSym}${item.price.toFixed(2)}</div>
      </div>
      <div style="font-weight:900;font-size:12px;">${currSym}${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  const discountRow = discount > 0 && billDesign.showDiscount ? `
    <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;margin-bottom:6px;">
      <span>Discount${couponCode ? ` (${couponCode})` : ''}</span>
      <span>−${currSym}${discount.toFixed(2)}</span>
    </div>` : '';

  const taxRow = billDesign.showTax ? `
    <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:${billDesign.mutedColor};text-transform:uppercase;margin-bottom:6px;">
      <span>Tax</span><span style="color:${billDesign.textColor};">${currSym}${taxTotal.toFixed(2)}</span>
    </div>` : '';

  const paymentRow = billDesign.showPaymentMethod ? `
    <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:6px;color:${billDesign.mutedColor};">
      <span>Payment</span><span style="color:${billDesign.textColor};">${paymentMethod}</span>
    </div>` : '';

  const customerRow = customerName ? `
    <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:6px;color:${billDesign.mutedColor};">
      <span>Customer</span><span style="color:${billDesign.textColor};">${customerName}</span>
    </div>` : '';

  const phoneRow = (billDesign.showCustomerPhone && customerPhone) ? `
    <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;text-transform:uppercase;margin-bottom:6px;color:${billDesign.mutedColor};">
      <span>Phone</span><span style="color:${billDesign.textColor};">${customerPhone}</span>
    </div>` : '';

  const channelBadge = channel === 'online' ? `
    <div style="display:inline-block;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;border:1px solid ${billDesign.accentColor};color:${billDesign.accentColor};padding:2px 8px;border-radius:4px;margin-bottom:16px;">
      ONLINE ORDER
    </div>` : '';

  const barcodeSection = billDesign.showBarcode ? `
    <div style="display:flex;justify-content:center;gap:1px;margin:16px 0;opacity:0.2;">
      ${Array.from({ length: 40 }).map((_, i) =>
        `<div style="width:${i % 3 === 0 ? 2 : 1}px;height:${i % 5 === 0 ? 40 : 28}px;background:${billDesign.textColor};"></div>`
      ).join('')}
    </div>` : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt — ${id}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${getFontFamily(billDesign.fontFamily)};
      background: #e5e7eb;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100vh;
      padding: 32px 16px;
      color: ${billDesign.textColor};
    }
    .receipt {
      width: ${getPaperWidth(billDesign.paperWidth)};
      background: ${billDesign.bgColor};
      border-radius: ${getCornerRadius(billDesign.cornerStyle)};
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .inner {
      padding: 28px 24px 24px;
    }
    .header {
      text-align: ${billDesign.headerAlign};
      margin-bottom: 24px;
    }
    .brand {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -1px;
      text-transform: uppercase;
      color: ${billDesign.accentColor};
      margin-bottom: 4px;
    }
    .tagline {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: ${billDesign.mutedColor};
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${billDesign.mutedColor};
      margin-bottom: 4px;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid ${billDesign.borderColor};
    }
    .grand-total-label { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    .grand-total-value { font-size: 26px; font-weight: 900; letter-spacing: -1px; color: ${billDesign.accentColor}; }
    .footer {
      text-align: center;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: ${billDesign.mutedColor};
      line-height: 1.8;
      margin-top: 20px;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; width: 100%; }
      @page { margin: 0; size: auto; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    ${accentBar('top')}
    ${billDesign.showPerforations ? perfRow : ''}
    <div class="inner">
      <div class="header">
        <div class="brand">${siteName}</div>
        <div class="tagline">${billDesign.headerText}</div>
        ${billDesign.subHeaderText ? `<div style="font-size:9px;color:${billDesign.mutedColor};text-transform:uppercase;letter-spacing:0.15em;margin-top:2px;">${billDesign.subHeaderText}</div>` : ''}
      </div>

      ${channelBadge}

      <div style="margin-bottom:16px;">
        ${billDesign.showOrderId ? `<div class="meta-row"><span>Order</span><span style="color:${billDesign.textColor};font-size:9px;">${id}</span></div>` : ''}
        ${billDesign.showDate ? `<div class="meta-row"><span>Date</span><span style="color:${billDesign.textColor};">${date}</span></div>` : ''}
        ${billDesign.showTime ? `<div class="meta-row"><span>Time</span><span style="color:${billDesign.textColor};">${time}</span></div>` : ''}
        ${customerRow}
        ${phoneRow}
      </div>

      ${separatorLine}

      <div style="margin-bottom:8px;">
        ${itemsHTML}
      </div>

      ${separatorLine}

      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:${billDesign.mutedColor};text-transform:uppercase;margin-bottom:6px;">
          <span>Subtotal</span><span style="color:${billDesign.textColor};">${currSym}${subtotal.toFixed(2)}</span>
        </div>
        ${discountRow}
        ${taxRow}
        ${paymentRow}
      </div>

      <div class="grand-total-row">
        <span class="grand-total-label">Total</span>
        <span class="grand-total-value">${currSym}${total.toFixed(2)}</span>
      </div>

      ${billDesign.showSignatureLine ? `
      <div style="margin-top:32px;border-top:1px solid ${billDesign.borderColor};padding-top:8px;text-align:center;font-size:8px;color:${billDesign.mutedColor};text-transform:uppercase;letter-spacing:0.12em;">Signature</div>
      ` : ''}

      ${barcodeSection}

      <div class="footer">
        ${billDesign.footerText}
        ${billDesign.tagline ? `<div style="margin-top:4px;opacity:0.4;">${billDesign.tagline}</div>` : ''}
      </div>
    </div>
    ${billDesign.showPerforations ? perfRow : ''}
    ${accentBar('bottom')}
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); }, 600);
    });
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
