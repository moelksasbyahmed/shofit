import React, { createContext, ReactNode, useContext, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (
    id: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (i) =>
          i.id === item.id && i.size === item.size && i.color === item.color,
      );

      if (existingIndex > -1) {
        const newItems = [...currentItems];
        newItems[existingIndex].quantity += item.quantity || 1;
        return newItems;
      }

      return [...currentItems, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(item.id === id && item.size === size && item.color === color),
      ),
    );
  };

  const updateQuantity = (
    id: string,
    size: string,
    color: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
