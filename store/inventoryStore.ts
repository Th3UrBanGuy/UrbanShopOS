import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { inventoryService } from '@/lib/services/inventoryService';

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
  loading: boolean;
  initialized: boolean;
  firebaseSynced: boolean;
  initialize: () => Promise<void>;
  setProducts: (products: InventoryProduct[]) => void;
  syncToFirebase: () => Promise<void>;
  updateStock: (id: number, newStock: number) => Promise<void>;
  decrementStock: (id: number, quantity: number) => Promise<void>;
  decrementVariantStock: (productId: number, color: string, size: string, quantity: number) => Promise<void>;
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

      initialize: async () => {
        set({ loading: true });
        try {
          if (!firebaseLoaded) {
            const products = await inventoryService.getAll();
            if (products.length > 0) {
              set({ products, initialized: true, firebaseSynced: true, loading: false });
              firebaseLoaded = true;
              return;
            }
          }
        } catch (e) {
          console.log('Firebase unavailable, using local data');
        }
        set({ initialized: true, loading: false });
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

      decrementVariantStock: async (productId: number, color: string, size: string, quantity: number) => {
        set((state) => ({
          products: state.products.map(p => {
            if (p.id !== productId) return p;
            
            // Update total stock
            const newTotalStock = Math.max(0, p.stock - quantity);
            
            // Update variant stock if variants exist
            const newVariants = p.variants.map(v => {
              if (v.color !== color) return v;
              const newSizes = v.sizes.map(s => {
                if (s.size !== size) return s;
                return { ...s, stock: Math.max(0, s.stock - quantity) };
              });
              return { ...v, sizes: newSizes };
            });

            return { ...p, stock: newTotalStock, variants: newVariants };
          })
        }));

        try {
          // Sync with Firestore (assuming the whole product is synced)
          const product = get().products.find(p => p.id === productId);
          if (product) await inventoryService.update(productId, product);
        } catch (e) {
          console.log('Offline: variant stock decrement queued');
        }
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