import { create } from 'zustand';

export type DashboardTab = 'Hub' | 'Stats' | 'Inventory' | 'Coupons' | 'PoS' | 'Khorochkhata' | 'Parties' | 'Settings' | 'Management';

interface DashboardState {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'Hub',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
