import { create } from 'zustand';

export type DashboardTab = 'Hub' | 'Stats' | 'Inventory' | 'Coupons' | 'PoS' | 'Khorochkhata' | 'Parties' | 'Settings' | 'Management' | 'Users';

interface DashboardState {
  activeTab: DashboardTab;
  isOverlayOpen: boolean;
  setActiveTab: (tab: DashboardTab) => void;
  setOverlayOpen: (open: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'Hub',
  isOverlayOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setOverlayOpen: (open) => set({ isOverlayOpen: open }),
}));
