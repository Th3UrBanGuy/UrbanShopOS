import type { SaleTransaction } from '@/types';
import type { BillDesign } from '@/store/settingsStore';
import { generateReceiptHtml } from './generateReceiptHtml';

interface PrintSettings {
  siteName: string;
  currency: string;
  billDesign: BillDesign;
}

/**
 * Standardized Print Utility
 * Opens a new window with a design-compliant HTML receipt.
 */
export function printReceipt(tx: SaleTransaction, settings: PrintSettings): void {
  const printWindow = window.open('', '_blank', 'width=500,height=800');
  if (!printWindow) {
    console.error('Failed to open print window. Pop-up might be blocked.');
    return;
  }

  const html = generateReceiptHtml(tx, {
    siteName: settings.siteName,
    currency: settings.currency,
    billDesign: settings.billDesign
  });

  printWindow.document.write(html);
  printWindow.document.close();
}
