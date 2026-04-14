import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BillDesign {
  // Text Content
  headerText: string;
  subHeaderText: string;
  footerText: string;
  tagline: string;
  showLogo: boolean;

  // Color System
  accentColor: string;
  bgColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  totalBgColor: string;

  // Typography
  fontFamily: 'mono' | 'sans' | 'serif';
  fontSize: 'sm' | 'base' | 'lg';
  headerAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold' | 'black';

  // Layout & Structure
  paperType: 'thermal' | 'classic' | 'modern';
  paperWidth: 'narrow' | 'standard' | 'wide';
  borderStyle: 'none' | 'solid' | 'dashed' | 'double';
  borderRadius: 'none' | 'sm' | 'md' | 'lg';
  cornerStyle: 'square' | 'rounded' | 'pill';

  // Sections Visibility
  showDate: boolean;
  showTime: boolean;
  showOrderId: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showPaymentMethod: boolean;
  showBarcode: boolean;
  showQrCode: boolean;
  showSignatureLine: boolean;
  showSeparatorLines: boolean;
  showCustomerPhone: boolean;

  // Decorative
  showPerforations: boolean;
  headerPattern: 'none' | 'dots' | 'lines' | 'grid';
  accentPosition: 'top' | 'bottom' | 'both' | 'left' | 'none';
  accentWidth: number;
}

interface SettingsState {
  siteName: string;
  currency: string;
  defaultTaxRate: number;
  lowStockThreshold: number;
  billDesign: BillDesign;
  exchangeRates: Record<string, number>;

  setSiteName: (name: string) => void;
  setCurrency: (cur: string) => void;
  setDefaultTaxRate: (rate: number) => void;
  setLowStockThreshold: (threshold: number) => void;
  setBillDesign: (design: Partial<BillDesign>) => void;
  resetBillDesign: () => void;
  updateExchangeRates: (rates: Record<string, number>) => void;
  formatPrice: (amount: number) => string;
  getConvertedAmount: (amount: number) => number;
}

const DEFAULT_BILL: BillDesign = {
  headerText: 'Official Receipt',
  subHeaderText: 'Premium Resin Products',
  footerText: 'Thank you for touching the future.',
  tagline: 'aeroresin.co',
  showLogo: true,

  accentColor: '#6366f1',
  bgColor: '#ffffff',
  textColor: '#1a1a1a',
  mutedColor: '#888888',
  borderColor: '#e5e5e5',
  totalBgColor: '#f5f5f5',

  fontFamily: 'sans',
  fontSize: 'base',
  headerAlign: 'center',
  fontWeight: 'bold',

  paperType: 'thermal',
  paperWidth: 'standard',
  borderStyle: 'dashed',
  borderRadius: 'md',
  cornerStyle: 'rounded',

  showDate: true,
  showTime: true,
  showOrderId: true,
  showTax: true,
  showDiscount: true,
  showPaymentMethod: true,
  showBarcode: false,
  showQrCode: false,
  showSignatureLine: false,
  showSeparatorLines: true,
  showCustomerPhone: true,

  showPerforations: true,
  headerPattern: 'none',
  accentPosition: 'top',
  accentWidth: 4,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      siteName: 'AERO RESIN',
      currency: 'BDT',
      defaultTaxRate: 10,
      lowStockThreshold: 10,
      billDesign: DEFAULT_BILL,
      exchangeRates: { BDT: 1, USD: 0.0083, EUR: 0.0075, GBP: 0.0065 },

      setSiteName: (siteName) => set({ siteName }),
      setCurrency: (currency) => set({ currency }),
      setDefaultTaxRate: (defaultTaxRate) => set({ defaultTaxRate }),
      setLowStockThreshold: (lowStockThreshold) => set({ lowStockThreshold }),
      setBillDesign: (design) => set((state) => ({ billDesign: { ...state.billDesign, ...design } })),
      resetBillDesign: () => set({ billDesign: DEFAULT_BILL }),
      updateExchangeRates: (rates) => set({ exchangeRates: rates }),
      formatPrice: (amount: number) => {
        const { currency, exchangeRates } = get();
        const rate = exchangeRates[currency] || 1;
        const converted = amount * rate;
        const symbol = currency === 'BDT' ? '৳' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
      getConvertedAmount: (amount: number) => {
        const { currency, exchangeRates } = get();
        const rate = exchangeRates[currency] || 1;
        return amount * rate;
      },
    }),
    { name: 'aero-resin-settings' }
  )
);
