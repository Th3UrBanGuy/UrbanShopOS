# UrbanShopOS 💎

### The Ultimate Retail Operating System for Modern Commerce.

**UrbanShopOS** is a high-fidelity, motion-rich retail management platform designed to unify online storefronts and physical Point of Sale (PoS) terminals. Built with a "premium-first" design philosophy, it delivers a world-class experience for both customers and administrators.

---

## 🚀 Key Features

### 🛒 High-Fidelity Storefront
- **Bento-Grid Order Tracking**: A sophisticated, real-time visual tracking system for online orders.
- **Dynamic Market Engine**: Fast, article-indexed product browsing with responsive variant selection.
- **Resin-Theme Aesthetics**: A unique, glassmorphic UI system (Aero Resin) that feels deep and tactile.

### 🏪 Professional Dashboard (10+ Modules)
- **Advanced PoS Terminal**: Real-time sales interface with stock reservation logic and thermal receipt printing.
- **Inventory Vault**: Granular stock management including variants (Color/Size), pricing matrix, and article IDs.
- **Khorochkhata (Expense Ledger)**: Integrated daily ledger for tracking business expenditures.
- **Delivery Intelligence**: Dedicated dashboard for fulfilling and tracking e-commerce shipments.
- **User Management**: Role-Based Access Control (RBAC) secured by 6-digit PIN authentication.

### 🔐 Security & Reliability
- **Environment Isolation**: No hardcoded secrets. Critical access is managed via secure `.env` variables.
- **Transactional Integrity**: Robust state management ensures zero-dollar bugs and race condition prevention.
- **Firebase Synchronization**: Real-time data persistence across all connected devices.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **State**: Zustand (Atomic State Management)
- **Design**: Tailwind CSS 4.0, Framer Motion
- **Backend**: Firebase Firestore, Auth, & Storage
- **Infrastructure**: Nodemailer (SMTP), Open Exchange Rates API

---

## 📦 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- A Firebase Project set up

### Installation & Setup

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Th3UrBanGuy/UrbanShopOS.git
   cd UrbanShopOS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file from the provided template:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Populate the file with your Firebase credentials, SMTP settings, and your desired `NEXT_PUBLIC_SUPER_ADMIN_PIN`.*

4. **Launch Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

---

## 📜 Documentation
For a deep-dive into the system architecture and module-specific internal logic, please refer to the [Technical Guide](./technical_guide.md).

---

## 🤝 Contributing
UrbanShopOS is a premium ecosystem. Contributions that maintain high coding standards and design fidelity are welcome. Please open an issue or submit a pull request for discussions.

---

Built with ❤️ by **Th3UrBanGuy**