import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  image: string | null;
  category: string | null;
}

interface CompareState {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (get().items.length >= 3) return; // max 3
        if (!get().hasItem(item.id)) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      hasItem: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'compare-storage' },
  ),
);
