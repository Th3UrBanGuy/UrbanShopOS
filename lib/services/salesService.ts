import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db, collections } from '../firebase';
import { SaleTransaction } from '@/types';

export const salesService = {
  async getAll(): Promise<SaleTransaction[]> {
    const q = query(collection(db, collections.SALES), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as SaleTransaction);
  },

  async getById(id: string): Promise<SaleTransaction | null> {
    const docRef = doc(db, collections.SALES, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as SaleTransaction : null;
  },

  async getRecent(count: number): Promise<SaleTransaction[]> {
    const q = query(collection(db, collections.SALES), orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as SaleTransaction);
  },

  async getToday(): Promise<SaleTransaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    const q = query(
      collection(db, collections.SALES),
      where('timestamp', '>=', todayStr),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as SaleTransaction);
  },

  async create(transaction: Omit<SaleTransaction, 'id' | 'timestamp'>): Promise<SaleTransaction> {
    const id = crypto.randomUUID();
    const newTransaction: SaleTransaction = {
      ...transaction,
      id,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, collections.SALES, id), newTransaction);
    return newTransaction;
  },

  async updateStatus(id: string, status: SaleTransaction['status']): Promise<void> {
    const docRef = doc(db, collections.SALES, id);
    await updateDoc(docRef, { status });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, collections.SALES, id));
  },

  async getTodayRevenue(): Promise<number> {
    const today = await this.getToday();
    return today.reduce((acc, tx) => acc + tx.total, 0);
  },

  async getTodayCount(): Promise<number> {
    const today = await this.getToday();
    return today.length;
  },

  async getWeekRevenue(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString();
    
    const q = query(
      collection(db, collections.SALES),
      where('timestamp', '>=', weekStr)
    );
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => doc.data() as SaleTransaction);
    return transactions.reduce((acc, tx) => acc + tx.total, 0);
  },

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();
    
    const q = query(
      collection(db, collections.SALES),
      where('timestamp', '>=', startStr),
      where('timestamp', '<=', endStr)
    );
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => doc.data() as SaleTransaction);
    return transactions.reduce((acc, tx) => acc + tx.total, 0);
  },
};