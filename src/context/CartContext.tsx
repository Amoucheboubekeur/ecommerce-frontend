"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// ✅ Type d'une variante
export interface Variant {
  id: string;
  name: string;
  additionalPrice: number;
}

// ✅ Type d'un article dans le panier
export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variants?: Variant[]; // ← pour afficher les choix possibles
  variantId?: string;
  variantName?: string;
  additionalPrice?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateVariant: (
    id: string,
    variantId: string,
    variantName: string,
    additionalPrice: number
  ) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ Ajouter un article au panier
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) => p.id === item.id && p.variantId === item.variantId
      );

      if (existing) {
        return prev.map((p) =>
          p.id === item.id && p.variantId === item.variantId
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }

      return [...prev, { ...item, quantity: Math.max(1, item.quantity) }];
    });
  };

  // ✅ Modifier la quantité
  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  // ✅ Supprimer un article
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Vider le panier
  const clearCart = () => setCart([]);

  // ✅ Mettre à jour la variante d’un produit
  const updateVariant = (
    id: string,
    variantId: string,
    variantName: string,
    additionalPrice: number
  ) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, variantId, variantName, additionalPrice }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        updateVariant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Hook de confort
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
