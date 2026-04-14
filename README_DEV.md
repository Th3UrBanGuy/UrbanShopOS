# 📘 AI SmartBook & Aero Resin - Developer Documentation

Welcome to the development workspace. This document provides a high-level overview of the project structure and design philosophy to help you navigate and contribute effectively.

## 🏗️ Architecture

The project is built using a modern **Next.js 15** (App Router) architecture with a heavy focus on interactive performance.

- **Routing**: standard `/app` directory.
- **Components**: Separated into atomic UI elements (`ResinCard`, `LiquidButton`) and feature modules (`dashboard/`, `market/`).
- **State**: Managed via **Zustand** stores in `/store`.
- **Types**: Centralized in `/types/index.ts`.

## 🎨 Design Systems

The project currently supports two distinct "Visual Identities":

1.  **Aero Resin (Modern/Cosmic)**: Used for the landing page. Relies on `framer-motion` for liquid-like interactions and glassmorphism.
2.  **AI SmartBook (Classic/Skeuomorphic)**: Used for the reading experience. Focuses on cream tones, serif typography, and tactile book-like UI.

## 🛠️ Key Components

- **`ResinCard.tsx`**: Uses `useMotionTemplate` for real-time cursor-tracking glare.
- **`BookViewer.tsx`**: Manages the multi-page book reading state and layout.
- **`TextInput.tsx`**: The entry point for "Smart" content processing.

## 🚀 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run development server**:
    ```bash
    npm run dev
    ```
3.  **Static Analysis**:
    ```bash
    npm run lint
    ```

---

*Analysis performed by Antigravity (Advanced Agentic Coding).*
