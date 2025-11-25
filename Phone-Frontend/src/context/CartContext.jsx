import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user?.id ? `cart_${user.id}` : 'cart_guest';
  const [cart, setCart] = useState([]);
  const [hydratedKey, setHydratedKey] = useState(storageKey);

  useEffect(() => {
    // Reset render state before loading dữ liệu của user mới
    setCart([]);
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setHydratedKey(storageKey);
  }, [storageKey]);

  // Đồng bộ cart hiện tại xuống localStorage theo từng user
  useEffect(() => {
    if (hydratedKey !== storageKey) {
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey, hydratedKey]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(storageKey);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
