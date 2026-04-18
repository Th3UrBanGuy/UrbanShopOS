import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExpenseCategory = 'Stock' | 'Utility' | 'Staff' | 'Rent' | 'Marketing' | 'Food' | 'Other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  removeExpense: (id: string) => void;
  clearExpenses: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (expense) => set((state) => ({
        expenses: [
          {
            ...expense,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
          },
          ...state.expenses,
        ],
      })),
      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      })),
      clearExpenses: () => set({ expenses: [] }),
    }),
    {
      name: 'aero-resin-expenses',
    }
  )
);
