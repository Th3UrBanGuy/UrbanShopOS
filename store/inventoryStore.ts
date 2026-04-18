import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { inventoryService } from '@/lib/services/inventoryService';
import { useSettingsStore } from './settingsStore';

export interface StockHold {
  sessionId: string;
  color: string;
  size: string;
  quantity: number;
  expiresAt: number;
}

export interface ColorVariant {
  color: string;
  image?: string;
  sizes: {
    size: string;
    stock: number;
    priceAdjustment: number;
  }[];
  styles: string[];
}

export interface InventoryProduct {
  id: number;
  article: string;
  name: string;
  price: number;
  purchasePrice: number;
  stock: number;
  category: string;
  tag: string;
  rating: number;
  tax: number;
  sales7d: number[];
  showInEcom: boolean;
  image?: string;
  description?: string;
  holds?: StockHold[];
  variants: ColorVariant[];
}

const INITIAL_PRODUCTS: InventoryProduct[] = [
  { 
    id: 1, 
    article: 'AR-X1-W', 
    name: 'Aero X1 Wireless', 
    price: 299, 
    purchasePrice: 180,
    stock: 85, 
    category: 'Audio', 
    tag: 'New Release', 
    rating: 4.9, 
    tax: 12, 
    sales7d: [20, 45, 28, 60, 35, 50, 45],
    showInEcom: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300',
    description: 'High-fidelity wireless audio with adaptive noise cancellation.',
    variants: [
      { color: 'Midnight Black', sizes: [{ size: 'Standard', stock: 50, priceAdjustment: 0 }], styles: ['Matte'] },
      { color: 'Arctic White', sizes: [{ size: 'Standard', stock: 35, priceAdjustment: 0 }], styles: ['Glossy'] }
    ]
  },
  { 
    id: 2, 
    article: 'LT-K-02', 
    name: 'Liquid Touch Keyboard', 
    price: 149, 
    purchasePrice: 85,
    stock: 32, 
    category: 'Accessories', 
    tag: 'Best Seller', 
    rating: 4.8, 
    tax: 8, 
    sales7d: [15, 20, 25, 10, 30, 22, 18],
    showInEcom: true,
    description: 'Ultra-responsive mechanical switches with liquid-clear keycaps.',
    variants: []
  },
  { 
    id: 3, 
    article: 'VP-M-03', 
    name: 'Void Prism Monitor', 
    price: 899, 
    purchasePrice: 620,
    stock: 12, 
    category: 'Displays', 
    tag: 'Premium', 
    rating: 5.0, 
    tax: 15, 
    sales7d: [5, 8, 3, 10, 6, 12, 9],
    showInEcom: false,
    variants: []
  },
  { id: 4, article: 'RC-M-04', name: 'Resin Core Mouse', price: 89, purchasePrice: 45, stock: 120, category: 'Accessories', tag: '', rating: 4.7, tax: 8, sales7d: [40, 35, 50, 45, 60, 55, 70], showInEcom: true, variants: [] },
  { id: 5, article: 'HD-M-05', name: 'Holo Desk Mat', price: 45, purchasePrice: 15, stock: 200, category: 'Workspace', tag: '', rating: 4.6, tax: 5, sales7d: [30, 25, 40, 35, 28, 32, 38], showInEcom: true, variants: [] },
  { id: 6, article: 'SB-B-06', name: 'Sonic Bloom Buds', price: 199, purchasePrice: 110, stock: 64, category: 'Audio', tag: 'Hot', rating: 4.8, tax: 12, sales7d: [22, 30, 18, 42, 28, 35, 40], showInEcom: true, variants: [] },
  { id: 7, article: 'GF-G-07', name: 'Glass Frame Glasses', price: 350, purchasePrice: 220, stock: 18, category: 'Wearables', tag: 'Future', rating: 4.9, tax: 10, sales7d: [8, 12, 6, 15, 10, 14, 11], showInEcom: true, variants: [] },
  { id: 8, article: 'OP-B-08', name: 'Onyx Power Bank', price: 79, purchasePrice: 35, stock: 95, category: 'Accessories', tag: '', rating: 4.5, tax: 8, sales7d: [35, 40, 28, 45, 50, 38, 42], showInEcom: true, variants: [] },
];

let firebaseLoaded = false;

interface InventoryState {
  products: InventoryProduct[];
  initialized: boolean;
  loading: boolean;
  firebaseSynced: boolean;
  sessionId: string;
  
  initialize: () => Promise<void>;
  setProducts: (products: InventoryProduct[]) => void;
  syncToFirebase: () => Promise<void>;
  updateStock: (id: number, newStock: number) => Promise<void>;
  decrementStock: (id: number, quantity: number) => Promise<void>;
  decrementVariantStock: (productId: number, color: string, size: string, quantity: number, sessionId?: string) => Promise<void>;
  addHold: (productId: number, color: string, size: string, quantity: number, sessionId: string) => Promise<void>;
  removeHold: (productId: number, color: string, size: string, sessionId: string) => Promise<void>;
  cleanupHolds: (productId: number) => Promise<void>;
  getAvailableStock: (productId: number, color: string, size: string) => number;
  addProduct: (product: InventoryProduct) => Promise<void>;
  updateProduct: (product: InventoryProduct) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: [],
      loading: false,
      initialized: false,
      firebaseSynced: false,

      sessionId: `sess-${Math.random().toString(36).substr(2, 9)}`,

      initialize: async () => {
        if (get().initialized && get().firebaseSynced) return;
        
        set({ loading: true });
        try {
          // Setup real-time listener
          inventoryService.subscribeToProducts((products) => {
            set({ products, initialized: true, firebaseSynced: true, loading: false });
          });
          firebaseLoaded = true;
        } catch (e) {
          console.error('Firebase subscription failed, attempting fallback:', e);
          const products = await inventoryService.getAll();
          set({ products, initialized: true, loading: false });
        }
      },

      setProducts: (products) => set({ products }),

      syncToFirebase: async () => {
        const { products } = get();
        try {
          for (const product of products) {
            await inventoryService.update(product.id, product);
          }
          set({ firebaseSynced: true });
        } catch (e) {
          console.error('Sync failed:', e);
        }
      },

      updateStock: async (id: number, newStock: number) => {
        set((state) => ({
          products: state.products.map(p => p.id === id ? { ...p, stock: newStock } : p)
        }));
        try {
          await inventoryService.setStock(id, newStock);
        } catch (e) {
          console.log('Offline: stock update queued');
        }
      },

      decrementStock: async (id: number, quantity: number) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === id ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
          )
        }));
        try {
          await inventoryService.decrementStock(id, quantity);
        } catch (e) {
          console.log('Offline: stock decrement queued');
        }
      },

      decrementVariantStock: async (productId: number, color: string, size: string, quantity: number, sessionId?: string) => {
        set((state) => ({
          products: state.products.map(p => {
            if (p.id !== productId) return p;
            
            // Update total stock
            const newTotalStock = Math.max(0, p.stock - quantity);
            
            // Update variant stock
            const newVariants = p.variants.map(v => {
              if (v.color !== color) return v;
              const newSizes = v.sizes.map(s => {
                if (s.size !== size) return s;
                return { ...s, stock: Math.max(0, s.stock - quantity) };
              });
              return { ...v, sizes: newSizes };
            });

            // Also remove any hold for this session
            const newHolds = sessionId 
              ? (p.holds || []).filter(h => !(h.sessionId === sessionId && h.color === color && h.size === size))
              : p.holds;

            return { ...p, stock: newTotalStock, variants: newVariants, holds: newHolds };
          })
        }));

        try {
          const product = get().products.find(p => p.id === productId);
          if (product) await inventoryService.update(productId, product);
        } catch (e) {
          console.log('Stock decrement queued');
        }
      },

      addHold: async (productId: number, color: string, size: string, quantity: number, sessionId: string) => {
        const holdMinutes = useSettingsStore.getState().stockHoldMinutes;
        const expiresAt = Date.now() + (holdMinutes * 60 * 1000);
        
        let updatedHolds: StockHold[] = [];
        
        set((state) => ({
          products: state.products.map(p => {
            if (p.id !== productId) return p;
            const currentHolds = p.holds || [];
            // Handle quantity addition instead of just replacement
            const existingHoldIndex = currentHolds.findIndex(h => h.sessionId === sessionId && h.color === color && h.size === size);
            
            let newHolds;
            if (existingHoldIndex >= 0) {
              newHolds = currentHolds.map((h, i) => i === existingHoldIndex ? { ...h, quantity: h.quantity + quantity, expiresAt } : h);
            } else {
              newHolds = [...currentHolds, { sessionId, color, size, quantity, expiresAt }];
            }
            updatedHolds = newHolds;
            return { ...p, holds: newHolds };
          })
        }));

        try {
          await inventoryService.update(productId, { holds: updatedHolds });
        } catch (e) {
          console.error("Hold persistence failed:", e);
        }
      },

      removeHold: async (productId: number, color: string, size: string, sessionId: string) => {
        let updatedHolds: StockHold[] = [];
        
        set((state) => ({
          products: state.products.map(p => {
            if (p.id !== productId) return p;
            const newHolds = (p.holds || []).filter(h => !(h.sessionId === sessionId && h.color === color && h.size === size));
            updatedHolds = newHolds;
            return { ...p, holds: newHolds };
          })
        }));

        try {
          await inventoryService.update(productId, { holds: updatedHolds });
        } catch (e) {}
      },

      cleanupHolds: async (productId: number) => {
        const now = Date.now();
        let changed = false;
        
        set((state) => ({
          products: state.products.map(p => {
            if (p.id !== productId) return p;
            const validHolds = (p.holds || []).filter(h => h.expiresAt > now);
            if (validHolds.length !== (p.holds || []).length) {
              changed = true;
              return { ...p, holds: validHolds };
            }
            return p;
          })
        }));

        if (changed) {
          try {
            const product = get().products.find(p => p.id === productId);
            if (product) await inventoryService.update(productId, { holds: product.holds });
          } catch (e) {}
        }
      },

      getAvailableStock: (productId: number, color: string, size: string) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) return 0;
        
        const variant = product.variants.find(v => v.color === color);
        const sizeObj = variant?.sizes.find(s => s.size === size);
        if (!sizeObj) return 0;
        
        const now = Date.now();
        const activeHolds = (product.holds || [])
          .filter(h => h.color === color && h.size === size && h.expiresAt > now)
          .reduce((acc, h) => acc + h.quantity, 0);
          
        return Math.max(0, sizeObj.stock - activeHolds);
      },

      addProduct: async (product: InventoryProduct) => {
        set((state) => ({
          products: [...state.products, product]
        }));
        try {
          await inventoryService.create(product);
        } catch (e) {
          console.log('Offline: product creation queued');
        }
      },

      updateProduct: async (updatedProduct: InventoryProduct) => {
        set((state) => ({
          products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        }));
        try {
          await inventoryService.update(updatedProduct.id, updatedProduct);
        } catch (e) {
          console.log('Offline: product update queued');
        }
      },
    }),
    {
      name: 'aero-resin-inventory',
    }
  )
);