import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string | null;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().hasItem(item.id)) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      hasItem: (id) => get().items.some((i) => i.id === id),

      toggle: (item) => {
        if (get().hasItem(item.id)) {
          get().removeItem(item.id);
        } else {
          get().addItem(item);
        }
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    },
  ),
);
