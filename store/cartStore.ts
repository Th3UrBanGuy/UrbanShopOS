import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;

  getTotalItems: () => number;
  getSubtotal: () => number;
  getTaxTotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, delta) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                : i
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      clearCart: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      getSubtotal: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      getTaxTotal: () => get().items.reduce((acc, i) => acc + i.price * i.quantity * (i.tax / 100), 0),
      getTotal: () => get().getSubtotal() + get().getTaxTotal(),
    }),
    {
      name: 'aero-resin-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
