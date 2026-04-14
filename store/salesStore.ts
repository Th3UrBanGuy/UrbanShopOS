import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SaleTransaction } from '@/types';
import { salesService } from '@/lib/services/salesService';

interface SalesState {
  transactions: SaleTransaction[];
  loading: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  addTransaction: (tx: SaleTransaction) => Promise<void>;
  clearTransactions: () => void;
  getTodayRevenue: () => number;
  getTodayCount: () => number;
  getWeekRevenue: () => number;
  getRecentTransactions: (count: number) => SaleTransaction[];
  updateStatus: (id: string, status: SaleTransaction['status']) => Promise<void>;
  syncFromFirebase: () => Promise<void>;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      initialized: false,

      initialize: async () => {
        set({ loading: true });
        try {
          const transactions = await salesService.getRecent(100);
          if (transactions.length > 0) {
            set({ transactions, initialized: true, loading: false });
            return;
          }
        } catch (e) {
          console.log('Firebase unavailable, using local data');
        }
        set({ initialized: true, loading: false });
      },

      syncFromFirebase: async () => {
        try {
          const transactions = await salesService.getRecent(100);
          set({ transactions });
        } catch (e) {
          console.log('Firebase sync failed');
        }
      },

      addTransaction: async (tx) => {
        set((s) => ({ transactions: [tx, ...s.transactions] }));
        try {
          await salesService.create(tx);
        } catch (e) {
          console.log('Offline: transaction saved locally');
        }
      },

      clearTransactions: () => set({ transactions: [] }),

      getTodayRevenue: () => {
        const today = new Date().toDateString();
        return get().transactions
          .filter(tx => new Date(tx.timestamp).toDateString() === today)
          .reduce((acc, tx) => acc + tx.total, 0);
      },

      getTodayCount: () => {
        const today = new Date().toDateString();
        return get().transactions
          .filter(tx => new Date(tx.timestamp).toDateString() === today)
          .length;
      },

      getWeekRevenue: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return get().transactions
          .filter(tx => new Date(tx.timestamp) >= weekAgo)
          .reduce((acc, tx) => acc + tx.total, 0);
      },

      getRecentTransactions: (count) => {
        return get().transactions.slice(0, count);
      },

      updateStatus: async (id, status) => {
        set((s) => ({
          transactions: s.transactions.map(tx =>
            tx.id === id ? { ...tx, status } : tx
          ),
        }));
        try {
          await salesService.updateStatus(id, status);
        } catch (e) {
          console.log('Offline: status update queued');
        }
      },
    }),
    {
      name: 'aero-resin-sales',
    }
  )
);