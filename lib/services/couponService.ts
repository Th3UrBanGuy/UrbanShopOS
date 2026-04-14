import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where, increment } from 'firebase/firestore';
import { db, collections } from '../firebase';
import { Coupon } from '@/store/couponStore';

export const couponService = {
  async getAll(): Promise<Coupon[]> {
    const q = query(collection(db, collections.COUPONS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Coupon);
  },

  async getById(id: number): Promise<Coupon | null> {
    const docRef = doc(db, collections.COUPONS, String(id));
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as Coupon : null;
  },

  async getByCode(code: string): Promise<Coupon | null> {
    const q = query(collection(db, collections.COUPONS), where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Coupon;
  },

  async create(coupon: Omit<Coupon, 'id'>): Promise<Coupon> {
    const allCoupons = await this.getAll();
    const maxId = allCoupons.length > 0 ? Math.max(...allCoupons.map(c => c.id)) : 0;
    const newCoupon: Coupon = {
      ...coupon,
      id: maxId + 1,
    };
    await setDoc(doc(db, collections.COUPONS, String(newCoupon.id)), newCoupon);
    return newCoupon;
  },

  async update(id: number, patch: Partial<Coupon>): Promise<void> {
    const docRef = doc(db, collections.COUPONS, String(id));
    await updateDoc(docRef, patch);
  },

  async burnCoupon(id: number): Promise<void> {
    await deleteDoc(doc(db, collections.COUPONS, String(id)));
  },

  async incrementUses(id: number): Promise<void> {
    const docRef = doc(db, collections.COUPONS, String(id));
    await updateDoc(docRef, { uses: increment(1) });
  },

  async validate(code: string): Promise<Coupon | null> {
    const q = query(
      collection(db, collections.COUPONS),
      where('code', '==', code.toUpperCase()),
      where('status', '==', 'Active')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Coupon;
  },

  async setStatus(id: number, status: 'Active' | 'Inactive'): Promise<void> {
    await this.update(id, { status });
  },
};