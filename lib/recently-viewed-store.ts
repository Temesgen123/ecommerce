import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  image: string | null;
  category: string | null;
  variants: {
    id: string;
    color: string | null;
    size: string | null;
    price: number | null;
    stock: number;
  }[];
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (item: RecentlyViewedItem) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const filtered = get().items.filter((i) => i.id !== item.id);
        // Keep max 8 items, newest first
        set({ items: [item, ...filtered].slice(0, 8) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'recently-viewed' },
  ),
);
