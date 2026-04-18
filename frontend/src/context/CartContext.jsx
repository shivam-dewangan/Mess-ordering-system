import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartShopId, setCartShopId] = useState(null);

  const addToCart = (item, shopId) => {
    if (cartShopId && cartShopId !== shopId) {
      if (!window.confirm('Your cart has items from another shop. Clear cart and add new item?')) return;
      setCart([]);
      setCartShopId(null);
    }
    setCartShopId(shopId);
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item._id);
      if (existing) return prev.map(i => i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart(prev => {
      const updated = prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
      if (updated.length === 0) setCartShopId(null);
      return updated;
    });
  };

  const deleteFromCart = (menuItemId) => {
    setCart(prev => {
      const updated = prev.filter(i => i.menuItemId !== menuItemId);
      if (updated.length === 0) setCartShopId(null);
      return updated;
    });
  };

  const clearCart = () => { setCart([]); setCartShopId(null); };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartShopId, addToCart, removeFromCart, deleteFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
