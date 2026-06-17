import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addToCart, updateCartItem, removeFromCart } from '@/app/actions/cart';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number; // cents
  image: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Derived
  totalItems: () => number;
  totalPrice: () => number;
}

// Fire-and-forget sync to DB — only matters for logged-in customers.
// getCustomer() inside these server actions returns null for guests,
// in which case addToCart/updateCartItem/removeFromCart just no-op
// server-side, so it's always safe to call this for every visitor.
// Errors are swallowed here on purpose: a failed sync should never
// block or disrupt the local cart UX, which is the source of truth
// for what the customer sees.
function syncAdd(productId: string) {
  addToCart(productId, 1).catch((err) =>
    console.error('Cart sync (add) failed:', err),
  );
}

function syncUpdate(productId: string, quantity: number) {
  updateCartItem(productId, quantity).catch((err) =>
    console.error('Cart sync (update) failed:', err),
  );
}

function syncRemove(productId: string) {
  removeFromCart(productId).catch((err) =>
    console.error('Cart sync (remove) failed:', err),
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const existing = get().items.find((i) => i.id === newItem.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
            isOpen: true,
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...newItem, quantity: 1 }],
            isOpen: true,
          }));
        }
        syncAdd(newItem.id);
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
        syncRemove(id);
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
        syncUpdate(id, quantity);
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
