import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { to, subject, receiptDetails, storeName } = data;

    if (!to) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Create a slick HTML receipt
    const {
      items = [],
      tax = 0,
      discount = 0,
      total = 0,
      txnId = 'N/A',
      paymentMethod = 'N/A',
      channel = 'pos',
      currency = '$',
      customerName,
      deliveryAddress
    } = receiptDetails || {};

    const brandColor = '#1e3a8a'; // Aero Navy
    const accentColor = '#6366f1'; // Indigo

    const htmlReceipt = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Digital Receipt - ${storeName || 'UrbanShopOS'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Grotesk:wght@300;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fa;
            color: #1a1a1a;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          .header {
            background-color: #0c0c14;
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
            text-transform: uppercase;
          }
          .header p {
            margin: 5px 0 0;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.4em;
            color: ${accentColor};
            text-transform: uppercase;
          }
          .content {
            padding: 30px;
          }
          .meta-grid {
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 1px solid #edf2f7;
            padding-bottom: 20px;
          }
          .meta-item {
            padding: 10px 0;
          }
          .meta-label {
            font-size: 9px;
            font-weight: 800;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 2px;
          }
          .meta-value {
            font-size: 13px;
            font-weight: 700;
            color: #1a202c;
          }
          .address-box {
            background: #f8fafc;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 4px solid ${brandColor};
          }
          .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .item-table th {
            text-align: left;
            font-size: 10px;
            font-weight: 800;
            color: #a0aec0;
            text-transform: uppercase;
            padding-bottom: 10px;
            border-bottom: 2px solid #edf2f7;
          }
          .item-row td {
            padding: 15px 0;
            border-bottom: 1px solid #f7fafc;
          }
          .item-name {
            font-size: 14px;
            font-weight: 700;
            color: #2d3748;
          }
          .item-variant {
            font-size: 10px;
            font-weight: 700;
            color: ${accentColor};
            text-transform: uppercase;
            margin-top: 2px;
          }
          .item-article {
            font-size: 9px;
            color: #a0aec0;
          }
          .summary-table {
            width: 100%;
            margin-top: 20px;
          }
          .summary-row td {
            padding: 4px 0;
            font-size: 13px;
            font-weight: 600;
            color: #4a5568;
          }
          .total-row td {
            padding: 20px 0 0;
            font-size: 24px;
            font-weight: 900;
            color: #1a1a1a;
          }
          .footer {
            padding: 30px;
            background: #f8fafc;
            text-align: center;
            border-top: 1px solid #edf2f7;
          }
          .security-tag {
            display: inline-block;
            padding: 4px 12px;
            background: #e2e8f0;
            border-radius: 20px;
            font-size: 9px;
            font-weight: 800;
            color: #4a5568;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 15px;
          }
          .footer-note {
            font-size: 11px;
            color: #a0aec0;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${storeName || 'UrbanShopOS'}</h1>
            <p>Digital Transaction Manifest</p>
          </div>
          
          <div class="content">
            <table class="meta-grid">
              <tr>
                <td class="meta-item">
                  <div class="meta-label">ID #Manifest</div>
                  <div class="meta-value">${txnId}</div>
                </td>
                <td class="meta-item" style="text-align: right;">
                  <div class="meta-label">Channel</div>
                  <div class="meta-value" style="color: ${accentColor};">${channel.toUpperCase()}</div>
                </td>
              </tr>
              <tr>
                <td class="meta-item">
                  <div class="meta-label">Issued On</div>
                  <div class="meta-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td class="meta-item" style="text-align: right;">
                  <div class="meta-label">Authorization</div>
                  <div class="meta-value">${paymentMethod.toUpperCase()}</div>
                </td>
              </tr>
            </table>

            ${customerName || deliveryAddress ? `
              <div class="address-box">
                <div class="meta-label">Delivery Protocol</div>
                <div class="meta-value" style="margin-top: 5px;">
                  ${customerName ? `<strong>${customerName}</strong><br>` : ''}
                  ${deliveryAddress || ''}
                </div>
              </div>
            ` : ''}

            <table class="item-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th style="text-align: center; width: 60px;">QTY</th>
                  <th style="text-align: right; width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: { name: string; variant?: string; article?: string; quantity: number; price: number; total?: number }) => `
                  <tr class="item-row">
                    <td>
                      <div class="item-name">${item.name}</div>
                      ${item.variant ? `<div class="item-variant">${item.variant}</div>` : ''}
                      <div class="item-article">${item.article || 'N/A'}</div>
                    </td>
                    <td style="text-align: center; font-weight: 700; font-size: 13px;">${item.quantity}</td>
                    <td style="text-align: right; font-weight: 800; font-size: 14px;">${currency}${item.total?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <table class="summary-table">
              <tr class="summary-row">
                <td style="color: #a0aec0;">Subtotal manifest</td>
                <td style="text-align: right;">${currency}${receiptDetails.subtotal?.toFixed(2) || items.reduce((a: number, b: { price: number; quantity: number; total?: number }) => a + (b.total || b.price * b.quantity), 0).toFixed(2)}</td>
              </tr>
              ${discount ? `
                <tr class="summary-row">
                  <td style="color: #48bb78;">Promotion applied</td>
                  <td style="text-align: right; color: #48bb78;">-${currency}${discount.toFixed(2)}</td>
                </tr>
              ` : ''}
              ${tax ? `
                <tr class="summary-row">
                  <td style="color: #a0aec0;">Security & Value tax</td>
                  <td style="text-align: right;">${currency}${tax.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td>TOTAL DUE</td>
                <td style="text-align: right; color: ${brandColor};">${currency}${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <div class="security-tag">Verification: Secure-Aero-${Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
            <div class="footer-note">
              This document serves as your official digital proof of purchase. <br>
              <strong>Verify this manifest online:</strong> 
              <span style="color: ${accentColor}; cursor: pointer;">${storeName || 'UrbanShopOS'}/verify/${txnId}</span>
              <br><br>
              Thank you for chooseing ${storeName || 'UrbanShopOS'}. <br>
              &copy; ${new Date().getFullYear()} Enterprise Commerce Protocol.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"${storeName || 'UrbanShopOS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: subject || 'Your Digital Receipt',
      html: htmlReceipt,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to send email' }, { status: 500 });
  }
}
