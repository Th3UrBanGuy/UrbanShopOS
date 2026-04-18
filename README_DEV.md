# UrbanShopOS Development Guide 🛠️

Welcome to the development heartbeat of **UrbanShopOS**. This document outlines the standards, patterns, and workflows required to maintain the ecosystem's high-fidelity performance.

---

## 🏗️ Architectural Core

UrbanShopOS is a **State-Prioritized Application**. UI components are secondary to the data orchestration layer.

### 1. State Management Pattern (Zustand)
All stores are located in `store/`. Follow these rules when adding state:
- **Persistence**: Use `persist` middleware only for user preferences (UI theme, PoS terminal settings). Do NOT persist inventory or sales data to local storage; these must remain synchronized with Firebase.
- **Actions**: Keep actions atomic. Complex business logic (e.g., PoS checkout) should be extracted into helper functions in `lib/`.

### 2. Design System (Aero Resin)
The UI is built on a custom "Aero Resin" logic.
- **Tokens**: Colors/Fonts are managed via Tailwind's `@theme` or `globals.css`.
- **Motion**: Use `framer-motion` for all transitions. Avoid static state changes where motion can provide spatial context.
- **Components**: Use `ResinCard` and `LiquidButton` for consistent skeuomorphic depth.

---

## 🧪 Development Workflow

### Feature Implementation Sequence
1. **State Definition**: Model the data in the relevant `store/`.
2. **Logic Abstraction**: Implement core business rules in `lib/`.
3. **UI materialization**: Build the component using the design system.
4. **Integration**: Connect the component to the store.

### Debugging & Testing
- Use the **Dashboard Management View** to toggle experimental modules.
- Monitor the **PoS Reservation Cleanup** loop in `POSView.tsx` to ensure stock integrity.

---

## 🚀 Deployment

The system is optimized for **Vercel** or **Static Hosting** with a Node.js backend for Nodemailer services.

1. Ensure `NEXT_PUBLIC_SUPER_ADMIN_PIN` is set in your deployment environment.
2. Synchronize your Firebase Service Account JSON with the server-side environment variables.

---

Maintaining the transparency and fidelity of **UrbanShopOS** is the top priority.
Developed by **Th3UrBanGuy**
