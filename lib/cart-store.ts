import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addToCart, updateCartItem, removeFromCart } from '@/app/actions/cart';

export interface CartItem {
  id: string; // productId
  variantId: string; // productVariant.id — the actual cart key
  variantLabel: string | null; // e.g. "Blue / Large", null if no options
  name: string;
  slug: string;
  price: number; // cents — effective price (variant override or base)
  image: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Derived
  totalItems: () => number;
  totalPrice: () => number;
}

// Fire-and-forget DB sync helpers.
// Cart is now keyed by variantId, not productId — a customer can
// have the same product twice (different variants) in their cart.
function syncAdd(productId: string, variantId: string) {
  addToCart(productId, 1, variantId).catch((err) =>
    console.error('Cart sync (add) failed:', err),
  );
}

function syncUpdate(variantId: string, quantity: number) {
  updateCartItem(variantId, quantity).catch((err) =>
    console.error('Cart sync (update) failed:', err),
  );
}

function syncRemove(variantId: string) {
  removeFromCart(variantId).catch((err) =>
    console.error('Cart sync (remove) failed:', err),
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        // Cart is keyed by variantId, not productId — so two different
        // color/size combos of the same product are distinct cart lines.
        const existing = get().items.find(
          (i) => i.variantId === newItem.variantId,
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
            isOpen: true,
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...newItem, quantity: 1 }],
            isOpen: true,
          }));
        }
        syncAdd(newItem.id, newItem.variantId);
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
        syncRemove(variantId);
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        }));
        syncUpdate(variantId, quantity);
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
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
