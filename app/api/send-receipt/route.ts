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
    const htmlReceipt = `
      <div style="font-family: monospace; max-width: 400px; margin: 0 auto; padding: 20px; background: #fff; border: 1px solid #ccc; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900;">${storeName || 'UrbanShopOS'}</h1>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">DIGITAL RECEIPT</p>
        </div>
        
        <div style="border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 15px 0; margin-bottom: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${receiptDetails?.items?.map((item: { name: string; price: number }) => `
                <tr>
                  <td style="padding: 4px 0; text-align: left;">${item.name}</td>
                  <td style="padding: 4px 0; text-align: right;">${receiptDetails.currency || '$'}${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 15px; font-size: 13px; color: #333;">
          ${receiptDetails?.txnId ? `<p style="margin: 2px 0;"><strong>TXN ID:</strong> ${receiptDetails.txnId}</p>` : ''}
          ${receiptDetails?.paymentMethod ? `<p style="margin: 2px 0;"><strong>PAID VIA:</strong> ${receiptDetails.paymentMethod}</p>` : ''}
        </div>

        <div style="margin-bottom: 15px;">
          ${receiptDetails?.discount ? `
            <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 5px;">
              <span>Discount</span>
              <span style="float: right; color: #16a34a;">-${receiptDetails.currency || '$'}${receiptDetails.discount.toFixed(2)}</span>
            </div>
            <div style="clear: both;"></div>
          ` : ''}
          ${receiptDetails?.tax ? `
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>Tax</span>
              <span style="float: right;">${receiptDetails.currency || '$'}${receiptDetails.tax.toFixed(2)}</span>
            </div>
            <div style="clear: both;"></div>
          ` : ''}
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; display: inline-block;">TOTAL</h2>
          <h2 style="margin: 0; float: right;">${receiptDetails.currency || '$'}${receiptDetails?.total?.toFixed(2)}</h2>
          <div style="clear: both;"></div>
        </div>

        <div style="text-align: center; color: #888; font-size: 12px;">
          <p>Thank you for your business!</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
      </div>
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
