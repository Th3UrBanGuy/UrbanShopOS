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

export interface InventoryState {
  products: InventoryProduct[];
  loading: boolean;
  initialized: boolean;
  firebaseSynced: boolean;
  initialize: () => Promise<void>;
  setProducts: (products: InventoryProduct[]) => void;
  syncToFirebase: () => Promise<void>;
  updateStock: (id: number, newStock: number) => Promise<void>;
  decrementStock: (id: number, quantity: number) => Promise<void>;
  addProduct: (product: InventoryProduct) => Promise<void>;
  updateProduct: (product: InventoryProduct) => Promise<void>;
}