'use client';

import { useEffect } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';

export default function InventoryInitializer() {
  const initialize = useInventoryStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
