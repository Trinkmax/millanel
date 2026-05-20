"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  price: number;
  salePrice?: number | null;
  image?: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAddedId: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAddedId: null,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),
      add: (item, quantity = 1) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
            ),
            lastAddedId: item.id,
            isOpen: true,
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity }],
            lastAddedId: item.id,
            isOpen: true,
          });
        }
      },
      remove: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),
      setQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i,
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "millanel-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartTotals(items: CartItem[]) {
  let count = 0;
  let subtotal = 0;
  for (const item of items) {
    count += item.quantity;
    subtotal += (item.salePrice ?? item.price) * item.quantity;
  }
  return { count, subtotal };
}
