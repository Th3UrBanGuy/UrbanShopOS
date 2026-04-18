import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, collections } from '../firebase';
import { InventoryProduct } from '@/store/inventoryStore';

export const inventoryService = {
  async getAll(): Promise<InventoryProduct[]> {
    const q = query(collection(db, collections.INVENTORY));
    const snapshot = await getDocs(q);
    const products: InventoryProduct[] = [];
    snapshot.forEach((d) => {
      products.push(d.data() as InventoryProduct);
    });
    return products;
  },

  subscribeToProducts(callback: (products: InventoryProduct[]) => void) {
    const q = query(collection(db, collections.INVENTORY));
    return onSnapshot(q, (snapshot) => {
      const products: InventoryProduct[] = [];
      snapshot.forEach((d) => {
        products.push(d.data() as InventoryProduct);
      });
      callback(products);
    }, (error) => {
      console.error("Inventory subscription error:", error);
    });
  },

  async getById(id: number): Promise<InventoryProduct | null> {
    const docRef = doc(db, collections.INVENTORY, String(id));
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as InventoryProduct;
  },

  async getByCategory(category: string): Promise<InventoryProduct[]> {
    const q = query(collection(db, collections.INVENTORY), where('category', '==', category));
    const snapshot = await getDocs(q);
    const products: InventoryProduct[] = [];
    snapshot.forEach((d) => {
      products.push(d.data() as InventoryProduct);
    });
    return products;
  },

  async getEcommerce(): Promise<InventoryProduct[]> {
    const q = query(collection(db, collections.INVENTORY), where('showInEcom', '==', true));
    const snapshot = await getDocs(q);
    const products: InventoryProduct[] = [];
    snapshot.forEach((d) => {
      products.push(d.data() as InventoryProduct);
    });
    return products;
  },

  async create(product: InventoryProduct): Promise<InventoryProduct> {
    const docRef = doc(collection(db, collections.INVENTORY));
    await setDoc(docRef, product);
    return product;
  },

  async update(id: number, patch: Partial<InventoryProduct>): Promise<void> {
    const cleanPatch: Record<string, unknown> = {};
    Object.entries(patch).forEach(([k, v]) => {
      if (v !== undefined) cleanPatch[k] = v;
    });
    await updateDoc(doc(db, collections.INVENTORY, String(id)), cleanPatch);
  },

  async setStock(id: number, newStock: number): Promise<void> {
    await updateDoc(doc(db, collections.INVENTORY, String(id)), { stock: newStock });
  },

  async decrementStock(id: number, quantity: number): Promise<void> {
    const product = await this.getById(id);
    if (product) {
      const newStock = Math.max(0, product.stock - quantity);
      await this.setStock(id, newStock);
    }
  },

  async delete(id: number): Promise<void> {
    await deleteDoc(doc(db, collections.INVENTORY, String(id)));
  },
};