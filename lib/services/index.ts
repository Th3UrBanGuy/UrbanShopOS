import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db, collections } from '../firebase';

export const indexService = {
  async getNextId(collectionName: string): Promise<number> {
    const docRef = doc(db, 'indexes', `next_${collectionName}`);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const currentId = snapshot.data().value as number;
      await setDoc(docRef, { value: currentId + 1, updatedAt: new Date().toISOString() });
      return currentId;
    } else {
      await setDoc(docRef, { value: 2, updatedAt: new Date().toISOString() });
      return 1;
    }
  },

  async initializeCollections() {
    try {
      await runTransaction(db, async (transaction) => {
        const userIndexRef = doc(db, 'indexes', 'next_users');
        const invIndexRef = doc(db, 'indexes', 'next_inventory');
        const couponIndexRef = doc(db, 'indexes', 'next_coupons');
        
        const userIndex = await transaction.get(userIndexRef);
        const invIndex = await transaction.get(invIndexRef);
        const couponIndex = await transaction.get(couponIndexRef);
        
        if (!userIndex.exists()) {
          transaction.set(userIndexRef, { value: 1, updatedAt: new Date().toISOString() });
        }
        if (!invIndex.exists()) {
          transaction.set(invIndexRef, { value: 1, updatedAt: new Date().toISOString() });
        }
        if (!couponIndex.exists()) {
          transaction.set(couponIndexRef, { value: 1, updatedAt: new Date().toISOString() });
        }
      });
    } catch (e) {
      console.log('Index already initialized or error:', e);
    }
  },
};