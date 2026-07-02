import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (meal) => {
    setCart(prev => {
      const existing = prev.find(item => item.idMeal === meal.idMeal);
      if (existing) {
        return prev.map(item => item.idMeal === meal.idMeal ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...meal, qty: 1, price: Number(meal.price || 0) }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.idMeal === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.idMeal !== id));
  const clearCart = () => setCart([]);
  const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}
