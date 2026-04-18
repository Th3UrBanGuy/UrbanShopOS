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
  getTransactionsByRange: (start: Date, end: Date) => SaleTransaction[];
  getChartData: (range: '1D' | '1W' | '1M' | '1Y') => { label: string; value: number }[];
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

      getTransactionsByRange: (start, end) => {
        return get().transactions.filter(tx => {
          const d = new Date(tx.timestamp);
          return d >= start && d <= end;
        });
      },

      getChartData: (range) => {
        const txs = get().transactions;
        const now = new Date();
        const data: { label: string; value: number }[] = [];

        if (range === '1D') {
          // Last 12 hours
          for (let i = 11; i >= 0; i--) {
            const h = new Date(now);
            h.setHours(now.getHours() - i);
            const label = h.getHours() + ':00';
            const val = txs
              .filter(t => {
                const td = new Date(t.timestamp);
                return td.getHours() === h.getHours() && td.toDateString() === h.toDateString();
              })
              .reduce((s, t) => s + t.total, 0);
            data.push({ label, value: val });
          }
        } else if (range === '1W') {
          // Last 7 days
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const label = d.toLocaleDateString([], { weekday: 'short' });
            const val = txs
              .filter(t => new Date(t.timestamp).toDateString() === d.toDateString())
              .reduce((s, t) => s + t.total, 0);
            data.push({ label, value: val });
          }
        } else if (range === '1M') {
          // Last 4 weeks
          for (let i = 3; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - (i * 7));
            const label = 'Week ' + (4 - i);
            const endWeek = new Date(d);
            const startWeek = new Date(d);
            startWeek.setDate(d.getDate() - 6);
            const val = txs
              .filter(t => {
                const td = new Date(t.timestamp);
                return td >= startWeek && td <= endWeek;
              })
              .reduce((s, t) => s + t.total, 0);
            data.push({ label, value: val });
          }
        } else if (range === '1Y') {
          // Last 12 months
          for (let i = 11; i >= 0; i--) {
            const m = new Date(now);
            m.setMonth(now.getMonth() - i);
            const label = m.toLocaleDateString([], { month: 'short' });
            const val = txs
              .filter(t => {
                const td = new Date(t.timestamp);
                return td.getMonth() === m.getMonth() && td.getFullYear() === m.getFullYear();
              })
              .reduce((s, t) => s + t.total, 0);
            data.push({ label, value: val });
          }
        }
        return data;
      },
    }),
    {
      name: 'aero-resin-sales',
    }
  )
);