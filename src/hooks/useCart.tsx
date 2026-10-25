"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  strap?: string;
  sku?: string;
  skuCode?: string;
  inventory?: number;
  quantity: number;
};

export type AddItemPayload = {
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  strap?: string;
  sku?: string;
  skuCode?: string;
  inventory?: number;
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (payload: AddItemPayload) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const MAX_QUANTITY = 10;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((payload: AddItemPayload) => {
    const quantity = payload.quantity ?? 1;
    const lineId = `${payload.productId}__${payload.sku ?? payload.color}__${payload.strap ?? ""}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      const maxAvailable = Math.min(MAX_QUANTITY, payload.inventory ?? MAX_QUANTITY);
      if (maxAvailable < 1) return prev;
      if (existing) {
        return prev.map((item) =>
          item.id === lineId
            ? { ...item, quantity: Math.min(maxAvailable, item.quantity + quantity) }
            : item,
        );
      }
      return [...prev, { ...payload, id: lineId, quantity: Math.min(maxAvailable, quantity) }];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, Math.min(MAX_QUANTITY, item.inventory ?? MAX_QUANTITY, quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, count, subtotal, isOpen, openCart, closeCart, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
