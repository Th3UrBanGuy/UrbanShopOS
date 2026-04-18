import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { useInventoryStore } from './inventoryStore';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, variant?: { color: string; size: string }) => void;
  updateQuantity: (productId: number, delta: number, variant?: { color: string; size: string }) => void;
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
        const { addHold, sessionId } = useInventoryStore.getState();
        
        set((state) => {
          const existing = state.items.find((i) => 
            i.productId === item.productId && 
            i.selectedVariant?.color === item.selectedVariant?.color &&
            i.selectedVariant?.size === item.selectedVariant?.size
          );
          
          // Trigger hold regardless of if it's new or existing
          addHold(item.productId, item.selectedVariant?.color || '', item.selectedVariant?.size || '', 1, sessionId);

          if (existing) {
            return {
              items: state.items.map((i) =>
                (i.productId === item.productId && 
                 i.selectedVariant?.color === item.selectedVariant?.color &&
                 i.selectedVariant?.size === item.selectedVariant?.size)
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId, variant) => {
        const { removeHold, sessionId } = useInventoryStore.getState();
        removeHold(productId, variant?.color || '', variant?.size || '', sessionId);
        
        set((state) => ({
          items: state.items.filter((i) => 
            !(i.productId === productId && 
              i.selectedVariant?.color === variant?.color &&
              i.selectedVariant?.size === variant?.size)
          ),
        }));
      },

      updateQuantity: (productId, delta, variant) => {
        const { addHold, removeHold, sessionId } = useInventoryStore.getState();
        const item = get().items.find(i => i.productId === productId && i.selectedVariant?.color === variant?.color && i.selectedVariant?.size === variant?.size);
        
        if (item) {
          if (item.quantity === 1 && delta < 0) {
            removeHold(productId, variant?.color || '', variant?.size || '', sessionId);
          } else {
            addHold(productId, variant?.color || '', variant?.size || '', delta, sessionId);
          }
        }

        set((state) => ({
          items: state.items
            .map((i) =>
              (i.productId === productId && 
               i.selectedVariant?.color === variant?.color &&
               i.selectedVariant?.size === variant?.size)
                ? { ...i, quantity: Math.max(0, i.quantity + delta) }
                : i
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      clearCart: () => {
        const { removeHold, sessionId } = useInventoryStore.getState();
        get().items.forEach(item => {
          removeHold(item.productId, item.selectedVariant?.color || '', item.selectedVariant?.size || '', sessionId);
        });
        set({ items: [] });
      },
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
