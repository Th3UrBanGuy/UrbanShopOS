import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Party, DealEntry } from '@/types';

interface PartyState {
  parties: Party[];
  addParty: (name: string, owner: string) => void;
  removeParty: (id: string) => void;
  addEntry: (partyId: string, entry: Omit<DealEntry, 'id' | 'date'>) => void;
  removeEntry: (partyId: string, entryId: string) => void;
  getBalance: (partyId: string) => { totalDeals: number; totalPaid: number; remaining: number };
}

export const usePartyStore = create<PartyState>()(
  persist(
    (set, get) => ({
      parties: [],

      addParty: (name, owner) => {
        const newParty: Party = {
          id: crypto.randomUUID(),
          name,
          owner,
          entries: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ parties: [newParty, ...s.parties] }));
      },

      removeParty: (id) => {
        set((s) => ({ parties: s.parties.filter(p => p.id !== id) }));
      },

      addEntry: (partyId, entry) => {
        const newEntry: DealEntry = {
          ...entry,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
        };
        set((s) => ({
          parties: s.parties.map(p => 
            p.id === partyId 
              ? { ...p, entries: [newEntry, ...p.entries] } 
              : p
          )
        }));
      },

      removeEntry: (partyId, entryId) => {
        set((s) => ({
          parties: s.parties.map(p => 
            p.id === partyId 
              ? { ...p, entries: p.entries.filter(e => e.id !== entryId) } 
              : p
          )
        }));
      },

      getBalance: (partyId) => {
        const party = get().parties.find(p => p.id === partyId);
        if (!party) return { totalDeals: 0, totalPaid: 0, remaining: 0 };

        const totalDeals = party.entries.reduce((acc, e) => acc + e.dealAmount, 0);
        const totalPaid = party.entries.reduce((acc, e) => acc + e.paidAmount, 0);
        return {
          totalDeals,
          totalPaid,
          remaining: totalDeals - totalPaid
        };
      },
    }),
    {
      name: 'aero-resin-parties',
    }
  )
);
