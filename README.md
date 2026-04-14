# AERO RESIN - Smart Store Management System

A modern, feature-rich Point of Sale (POS) and Retail Store Management System built with Next.js 15, Firebase, and Tailwind CSS 4. Designed for retail businesses with inventory management, sales tracking, multi-party ledger, coupon systems, and customizable receipt generation.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Architecture & Design](#architecture--design)
7. [Module Documentation](#module-documentation)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)
10. [Security](#security)
11. [Troubleshooting](#troubleshooting)
12. [License](#license)

---

## Project Overview

**AERO RESIN** is a comprehensive store management system that combines:

- **Point of Sale (POS)** - Full retail terminal with product search, cart management, variant selection, coupon application, and multiple payment methods
- **Inventory Management** - Product catalog with variants (colors/sizes), stock tracking, pricing, categories, and e-commerce visibility
- **Sales Analytics** - Transaction history, daily/weekly revenue tracking, order status management
- **Party/Ledger System** - Track deals and payments with customers/vendors
- **Coupon System** - Advanced coupon validation with percentage/fixed discounts, usage limits, product-specific rules
- **Customizable Receipts** - Full receipt design customization (thermal, classic, modern styles)
- **Multi-currency Support** - BDT, USD, EUR, GBP with real-time conversion
- **Firebase Backend** - Cloud-synced data with offline support

---

## Features

### Point of Sale (POS)
- Product search by name or article number
- Product grid with real-time stock indicators
- Variant selection (color/size) for products with variants
- Expandable cart with quantity controls
- Coupon code application with validation
- Multiple payment methods (Cash, bKash, Nagad, Credit Card)
- Digital receipt generation with print support
- Email receipt delivery
- Customer phone/email capture

### Inventory Management
- Product catalog with 8 default products
- Category and tag organization
- Variant management (colors, sizes, style)
- Stock level tracking with low-stock alerts
- Purchase price and selling price
- Tax rate per product
- Sales history (7-day rolling)
- E-commerce visibility toggle

### Sales & Transactions
- Real-time transaction recording
- Daily and weekly revenue analytics
- Order status tracking (pending, processing, shipped, delivered)
- Transaction history with filtering
- Revenue by date range queries

### Party/Ledger System
- Party (customer/vendor) management
- Deal entries (credit)
- Payment entries (debit)
- Balance calculation (total deals - total paid)
- Full transaction history per party

### Coupon System
- Percentage and fixed discount types
- Usage limits (per coupon)
- Expiration dates
- Product-specific coupons
- Minimum quantity requirements

### Receipt Customization
- Header/footer text configuration
- Color system (accent, background, text, borders)
- Typography (font family, size, weight)
- Paper types (thermal, classic, modern)
- Section visibility toggles
- Decorative elements (perforations, patterns)

### Multi-Currency
- Supported currencies: BDT (৳), USD ($), EUR (€), GBP (£)
- Configurable exchange rates
- Real-time conversion in receipts

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript 5.x
- **UI Runtime**: React 19.0.0
- **Styling**: Tailwind CSS 4.0.5 + Tailwind Merge + clsx
- **Animations**: Framer Motion 12.4.1
- **Icons**: Lucide React 0.474.0
- **State Management**: Zustand 5.0.3

### Backend & Storage
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Email**: Nodemailer 8.0.5 (for receipt emails)

### Development
- **Linting**: ESLint 9
- **Type Checking**: TypeScript

---

## Project Structure

```
frontend_native/
├── app/
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard page (protected)
│   ├── layout.tsx             # Root layout with fonts
│   └── globals.css            # Global styles
├── components/
│   ├── AuthGuard.tsx         # Authentication guard
│   ├── BookViewer.tsx         # Legacy component
│   ├── CartDrawer.tsx         # Shopping cart drawer
│   ├── ClientOnly.tsx          # Client-side only render
│   ├── Dashboard.tsx           # Legacy AI SmartBook dashboard
│   ├── DashboardDock.tsx      # Dashboard navigation dock
│   ├── Footer.tsx           # Footer component
│   ├── LiquidButton.tsx       # Animated button component
│   ├── Navbar.tsx            # Navigation bar
│   ├── ResinCard.tsx         # Card component with glow effects
│   ├── TextInput.tsx         # Legacy text input
│   ├── ToastContainer.tsx      # Toast notifications
│   └── dashboard/
│       ├── CouponView.tsx          # Coupon management
│       ├── HubView.tsx              # Hub/dashboard home
│       ├── InventoryView.tsx         # Inventory management
│       ├── KhorochkhataView.tsx    # Expense tracking
│       ├── ManagementView.tsx      # Management dashboard
│       ├── PartiesView.tsx          # Party/ledger management
│       ├── POSView.tsx            # Point of Sale terminal
│       ├── PartiesView.tsx          # Parties (deals & payments)
│       ├── ReceiptDocument.tsx     # Receipt template
│       ├── SalesView.tsx            # Sales analytics
│       ├── SettingsView.tsx       # Settings panel
│       ├── TerminalSettings.tsx    # Receipt design settings
│       └── UserManagementView.tsx  # User management
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   ├── printReceipt.ts      # Receipt printing
│   ├── exportUtils.ts       # Export utilities
│   ├── utils.ts            # Utility functions
│   ├── hooks/
│   │   └── useFirebaseSync.ts  # Firebase sync hook
│   └── services/
│       ├── couponService.ts     # Coupon CRUD
│       ├── inventoryService.ts # Inventory CRUD
│       ├── salesService.ts  # Sales CRUD
│       ├── settingsService.ts # Settings CRUD
│       ├── userService.ts    # User CRUD
│       └── index.ts         # Service exports
├── store/
│   ├── authStore.ts           # Authentication state
│   ├── bookStore.ts          # Legacy book state
│   ├── cartStore.ts          # Shopping cart
│   ├── couponStore.ts       # Coupon management
│   ├── dashboardStore.ts    # Dashboard state
│   ├── expenseStore.ts     # Expense tracking
│   ├── inventoryStore.ts  # Inventory state
│   ├── partyStore.ts      # Party/ledger state
│   ├── salesStore.ts     # Sales state
│   ├── settingsStore.ts   # Settings & bill design
│   ├── toastStore.ts     # Toast notifications
│   └── userStore.ts      # User management
├── types/
│   ├── index.ts            # TypeScript interfaces
│   └── inventory.ts       # Additional inventory types
├── .env.example          # Environment variables template
├── next.config.ts       # Next.js config
├── package.json         # Dependencies
├── tsconfig.json       # TypeScript config
├── eslint.config.mjs    # ESLint config
└── tailwind.config.ts   # Tailwind config
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (free tier)

### 2. Clone and Install

```bash
cd frontend_native
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

#### Required Firebase Variables

```env
# Firebase Configuration (get from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Use Firebase Emulator
NEXT_PUBLIC_USE_EMULATOR=false
```

#### Setting up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** (start in test mode or set rules)
4. Enable **Authentication** (Email/Password provider)
5. Copy configuration to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## Architecture & Design

### State Management (Zustand)

All stores use Zustand with the `persist` middleware for localStorage persistence:

| Store | Purpose | Persistence Key |
|-------|---------|-----------------|
| `useInventoryStore` | Product inventory | `aero-resin-inventory` |
| `useSalesStore` | Transactions | `aero-resin-sales` |
| `useCartStore` | Shopping cart | `aero-resin-cart` |
| `usePartyStore` | Parties/Ledger | `aero-resin-parties` |
| `useCouponStore` | Coupons | `aero-resin-coupons` |
| `useAuthStore` | Authentication | `aero-resin-auth` |
| `useSettingsStore` | Settings | `aero-resin-settings` |
| `useExpenseStore` | Expenses | `aero-resin-expenses` |

### Firebase Collections

```typescript
const collections = {
  USERS: 'users',
  INVENTORY: 'inventory',
  COUPONS: 'coupons',
  SALES: 'sales',
  SETTINGS: 'settings',
} as const;
```

### Data Flow

1. **Initialize** → Load data from Firestore (if available)
2. **Fallback** → Use local persisted data
3. **Sync** → Push changes to Firestore when online
4. **Offline Mode** → Queue changes when offline (logged to console)

### Component Architecture

- **ResinCard**: Glassmorphism card with glow effects
- **LiquidButton**: Animated button with press effects
- **DashboardDock**: Tab-based navigation
- **POSView**: Full POS terminal experience

---

## Module Documentation

### Store Modules

#### Inventory Store (`store/inventoryStore.ts`)

```typescript
interface InventoryProduct {
  id: number;
  article: string;
  name: string;
  price: number;
  purchasePrice: number;
  stock: number;
  category: string;
  tag: string;
  rating: number;
  tax: number;
  sales7d: number[];
  showInEcom: boolean;
  image?: string;
  description?: string;
  variants: ColorVariant[];
}

interface ColorVariant {
  color: string;
  image?: string;
  sizes: { size: string; stock: number; priceAdjustment: number; }[];
  styles: string[];
}
```

**Methods:**
- `initialize()` - Load products from Firebase or local
- `updateStock(id, newStock)` - Update stock quantity
- `decrementStock(id, quantity)` - Decrease stock
- `decrementVariantStock(productId, color, size, quantity)` - Decrease variant stock
- `addProduct(product)` - Add new product
- `updateProduct(product)` - Update product

#### Sales Store (`store/salesStore.ts`)

```typescript
interface SaleTransaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  discount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: string;
  timestamp: string;
  customerName?: string;
  customerPhone?: string;
  channel: 'pos' | 'online';
  status: 'completed' | 'pending' | 'processing' | 'shipped' | 'delivered';
}
```

**Methods:**
- `addTransaction(tx)` - Add new sale
- `updateStatus(id, status)` - Update order status
- `getTodayRevenue()` - Today's total revenue
- `getTodayCount()` - Number of transactions today
- `getWeekRevenue()` - Last 7 days revenue

#### Settings Store (`store/settingsStore.ts`)

```typescript
interface BillDesign {
  headerText: string;
  subHeaderText: string;
  footerText: string;
  tagline: string;
  showLogo: boolean;
  
  // Colors
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
  
  // Layout
  paperType: 'thermal' | 'classic' | 'modern';
  paperWidth: 'narrow' | 'standard' | 'wide';
  borderStyle: 'none' | 'solid' | 'dashed' | 'double';
  borderRadius: 'none' | 'sm' | 'md' | 'lg';
  cornerStyle: 'square' | 'rounded' | 'pill';
  
  // Visibility
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
```

**Exchange Rates (Default):**
```json
{
  "BDT": 1,
  "USD": 0.0083,
  "EUR": 0.0075,
  "GBP": 0.0065
}
```

#### Coupon Store (`store/couponStore.ts`)

```typescript
interface Coupon {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxUses: number;  // 0 = unlimited
  uses: number;
  status: 'Active' | 'Inactive';
  color: string;
  expiresAt?: string | null;
  applicableProductId?: number | null;
  minQuantity?: number | null;
}
```

**Validation Logic:**
1. Check coupon exists and is active
2. Check usage limit not reached
3. Check expiration date
4. Check product-specific requirements
5. Check minimum quantity requirements

---

## API Reference

### Firebase Services

#### Inventory Service

```typescript
inventoryService.getAll(): Promise<InventoryProduct[]>
inventoryService.getById(id: number): Promise<InventoryProduct | null>
inventoryService.getByCategory(category: string): Promise<InventoryProduct[]>
inventoryService.getEcommerce(): Promise<InventoryProduct[]>
inventoryService.create(product: InventoryProduct): Promise<InventoryProduct>
inventoryService.update(id: number, patch: Partial<InventoryProduct>): Promise<void>
inventoryService.setStock(id: number, newStock: number): Promise<void>
inventoryService.decrementStock(id: number, quantity: number): Promise<void>
inventoryService.delete(id: number): Promise<void>
```

#### Sales Service

```typescript
salesService.getAll(): Promise<SaleTransaction[]>
salesService.getById(id: string): Promise<SaleTransaction | null>
salesService.getRecent(count: number): Promise<SaleTransaction[]>
salesService.getToday(): Promise<SaleTransaction[]>
salesService.create(transaction): Promise<SaleTransaction>
salesService.updateStatus(id: string, status): Promise<void>
salesService.getTodayRevenue(): Promise<number>
salesService.getTodayCount(): Promise<number>
salesService.getWeekRevenue(): Promise<number>
salesService.getRevenueByDateRange(start: Date, end: Date): Promise<number>
```

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Configure environment variables in Vercel Dashboard.

### Other Platforms

1. Build: `npm run build`
2. Configure environment variables
3. Deploy the `.next` folder

---

## Security

### Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Authentication

- Email/Password login via Firebase Auth
- PIN-based login for quick access
- Session persistence via Zustand

---

## Troubleshooting

### Firebase Connection Issues

1. Check environment variables in `.env.local`
2. Verify Firestore is enabled in Firebase Console
3. Check network connectivity

### Offline Mode

The app works offline with local persistence. Changes are synced when online.

### Build Issues

```bash
# Clear cache
rm -rf .next
npm run build
```

---

## License

MIT License - See LICENSE file for details.

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## Support

- Open an issue on GitHub
- Check existing issues for solutions
- Review Firebase documentation

---

## Changelog

### v0.1.0 (Current)

- Initial release
- Full POS terminal
- Inventory management
- Sales tracking
- Party/ledger system
- Coupon system
- Customizable receipts
- Multi-currency support
- Firebase backend