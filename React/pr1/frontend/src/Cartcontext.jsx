import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (service) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.service_id === service.service_id);
      if (existing) {
        return prev.map((item) =>
          item.service_id === service.service_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  };

  const decreaseQuantity = (id) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.service_id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.service_id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // Если товар остался один и мы жмем минус — удаляем его из корзины
      return prev.filter((item) => item.service_id !== id);
    });
  };

  // Удалить товар полностью (Кнопка крестика)
  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.service_id !== id));
  };

  // Очистить корзину после заказа
  const clearCart = () => {
    setItems([]);
  };

  // Узнать сколько конкретного товара в корзине
  const getQuantity = (id) => {
    const item = items.find((i) => i.service_id === id);
    return item ? item.quantity : 0;
  };

  // Считаем общее количество товаров для значка в меню
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getQuantity,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}