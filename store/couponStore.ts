import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { couponService } from '@/lib/services/couponService';

export interface Coupon {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxUses: number; // 0 = unlimited
  uses: number;
  status: 'Active' | 'Inactive';
  color: string;
  expiresAt?: string | null; // ISO date string, optional
  applicableProductId?: number | null;
  minQuantity?: number | null;
}

interface CouponState {
  coupons: Coupon[];
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'uses'>) => Promise<void>;
  editCoupon: (coupon: Coupon) => Promise<void>;
  burnCoupon: (id: number) => Promise<void>;
  toggleStatus: (id: number) => void;
  incrementUses: (id: number) => Promise<void>;
  validateCoupon: (code: string, cartItems?: { productId: number; quantity: number }[]) => {
    valid: boolean;
    coupon?: Coupon;
    error?: string;
  };
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: [
        { id: 1, code: 'RESIN25', type: 'percent', value: 25, maxUses: 0, uses: 142, status: 'Active', color: 'indigo' },
        { id: 2, code: 'LIQUID50', type: 'fixed', value: 50, maxUses: 200, uses: 89, status: 'Active', color: 'cyan' },
        { id: 3, code: 'GLOSS10', type: 'percent', value: 10, maxUses: 0, uses: 542, status: 'Active', color: 'purple' },
      ],
      loading: false,
      initialized: false,

      initialize: async () => {
        set({ loading: true });
        try {
          const coupons = await couponService.getAll();
          if (coupons.length > 0) {
            set({ coupons, initialized: true, loading: false });
            return;
          }
        } catch (e) {
          console.log('Firebase unavailable, using local data');
        }
        set({ initialized: true, loading: false });
      },

      addCoupon: async (coupon) => {
        const newCoupon: Coupon = {
          ...coupon,
          id: Date.now(),
          uses: 0,
        };
        set((s) => ({ coupons: [newCoupon, ...s.coupons] }));
        try {
          await couponService.create(newCoupon as never);
        } catch (e) {
          console.log('Offline: coupon saved locally');
        }
      },

      editCoupon: async (coupon) => {
        set((s) => ({
          coupons: s.coupons.map(c => c.id === coupon.id ? coupon : c)
        }));
        try {
          // If a backend route exists, you can call couponService.update(coupon);
        } catch (e) {
          console.log('Offline: coupon updated locally');
        }
      },

      burnCoupon: async (id) => {
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }));
        try {
          await couponService.burnCoupon(id);
        } catch (e) {
          console.log('Offline: coupon burn queued');
        }
      },

      toggleStatus: (id) => {
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
          ),
        }));
      },

      incrementUses: async (id) => {
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.id === id ? { ...c, uses: c.uses + 1 } : c
          ),
        }));
        try {
          await couponService.incrementUses(id);
        } catch (e) {
          console.log('Offline: uses increment queued');
        }
      },

      validateCoupon: (code, cartItems = []) => {
        const now = new Date();
        const coupon = get().coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
        
        if (!coupon) return { valid: false, error: 'Invalid coupon code.' };
        if (coupon.status !== 'Active') return { valid: false, error: 'This coupon is inactive.' };
        if (coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) return { valid: false, error: 'Coupon usage limit reached.' };
        if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return { valid: false, error: 'This coupon has expired.' };

        // Product specific validation
        if (coupon.applicableProductId) {
           const targetItem = cartItems.find(i => i.productId === coupon.applicableProductId);
           if (!targetItem) {
              return { valid: false, error: 'Cart must contain the required product for this coupon.' };
           }
           if (coupon.minQuantity && typeof coupon.minQuantity === 'number' && targetItem.quantity < coupon.minQuantity) {
              return { valid: false, error: `Must purchase at least ${coupon.minQuantity} of the required item.` };
           }
        } else if (coupon.minQuantity && typeof coupon.minQuantity === 'number') {
           // General Cart Total Quantity Check
           const totalCartQty = cartItems.reduce((acc, i) => acc + i.quantity, 0);
           if (totalCartQty < coupon.minQuantity) {
              return { valid: false, error: `Must have at least ${coupon.minQuantity} items in cart.` };
           }
        }

        return { valid: true, coupon };
      },
    }),
    {
      name: 'aero-resin-coupons',
    }
  )
);