# UrbanShopOS Technical Guide

## System Architecture Overview
UrbanShopOS is a high-performance e-commerce and retail management ecosystem built on the modern web stack. It utilizes a **Motion-First UI** logic, decoupled **State-Driven Architecture**, and a **Real-Time Database Synchronizer**.

### Core Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js 18+
- **State Management**: Zustand (Multi-Store Architecture)
- **Database/Auth**: Firebase (Client SDK + Admin SDK)
- **Styling**: Tailwind CSS + Vanilla CSS (Aero Resin Design System)
- **Animations**: Framer Motion
- **Communication**: Nodemailer (SMTP Service)

---

## 1. Storefront Modules

### Dynamic Market Engine
- **Search & Filtering**: Real-time fuzzy search for products and articles.
- **Product Details**: High-fidelity variant selection (Color/Size) with automatic price adjustments.
- **Cart Management**: Persistent shopping cart with auto-validation against live inventory.

### Bento-Grid Order Tracking
- **Visual Timeline**: 4-stage dynamic progress tracking.
- **Logistics Intelligence**: Real-time display of shipping metadata and contact points.
- **Vault Manifest**: Itemized breakdown of variants with secure transaction indexing.

---

## 2. Administrative Dashboard Modules

### Point of Sale (PoS) Terminal
- **Inventory Hold System**: 10-12 minute real-time stock reservation (session-based) to prevent race conditions during checkout.
- **Coupon Integration**: Multi-tier discount validation.
- **Payment Protocols**: Support for Cash, Card, and Mobile Financial Services (MFS).
- **Print System**: Native browser-based thermal and standard receipt generation.

### Inventory Vault
- **Variant Matrix**: Granular management of Color/Size/Price per product.
- **Article System**: Unique identifier tracking for every SKU.
- **Stock Automation**: Automatic decrements across both storefront and OS channels.

### Khorochkhata (Expense Ledger)
- **Real-Time Ledger**: Daily expense tracking with category classification.
- **Visual Analytics**: Quick stats for daily spending monitoring.

### Sales & Stats
- **Transaction History**: Deep audit logs of all POS and Storefront sales.
- **Delivery Intelligence**: Dedicated dashboard for fulfilling and tracking e-commerce shipments.

### User Management & RBAC
- **PIN Authentication**: Secure dashboard access via unique 6-digit PINs.
- **Module Permissions**: Granular toggle-based access to specific dashboard views (e.g., Stats, Users, Settings).

---

## 3. Operational Logic

### State Management (Zustand)
- `inventoryStore`: Manages products, variants, and real-time stock reservations.
- `salesStore`: Handles transaction persistence and online order fulfillment.
- `userStore`: Manages system users and authentication states.
- `settingsStore`: Global configuration for site name, currency, and branding.

### Environment & Security
- **Admin PIN**: Abstracted into `NEXT_PUBLIC_SUPER_ADMIN_PIN` for deployment security.
- **Service Accounts**: Utilizes Firebase Admin SDK for authenticated server-side operations.
- **Exclusions**: Robust `.gitignore` prevents exposure of project-specific JSON keys and local state.

---

## 4. Setup & Deployment

### Local Configuration
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Synchronize environment: `cp .env.example .env.local`.
4. Populate Firebase Client keys and SMTP credentials.
5. Launch Dev: `npm run dev`.

### Deployment Checklist
- [x] Abstract all PII/Secrets to environment variables.
- [x] Verify Firebase Firestore & Storage rules.
- [x] Confirm `.env.local` is ignored in Git.
- [x] Ensure thermal printer drivers are installed for PoS.
