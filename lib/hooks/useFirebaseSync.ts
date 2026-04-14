'use client';

import { useEffect, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useUserStore } from '@/store/userStore';
import { useCouponStore } from '@/store/couponStore';
import { useSalesStore } from '@/store/salesStore';
import { useAuthStore } from '@/store/authStore';

export function useFirebaseSync() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inventoryStore = useInventoryStore();
  const userStore = useUserStore();
  const couponStore = useCouponStore();
  const salesStore = useSalesStore();
  const authStore = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        await authStore.initialize();
        
        await Promise.all([
          inventoryStore.initialize(),
          userStore.initialize(),
          couponStore.initialize(),
          salesStore.initialize(),
        ]);

        setInitialized(true);
      } catch (e) {
        console.error('Firebase initialization error:', e);
        setError('Failed to connect to database');
        setInitialized(true);
      }
    };

    if (!initialized) {
      initialize();
    }
  }, []);

  return { initialized, error };
}