import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 🔹 Load dữ liệu giỏ hàng từ localStorage khi app khởi động
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (storedCart.length > 0) {
      setCart(storedCart);
    }
  }, []);

  // 🔹 Tự động lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🛒 Thêm sản phẩm
  const addToCart = (product) => {
    console.log('Add product to cart ', product);
    setCart((prevCart) => {
      // Tạo unique key dựa trên id + selectedSize + sku để phân biệt các biến thể
      const productKey = `${product.id}-${product.selectedSize || 'no-size'}-${product.sku || 'no-sku'}`;
      
      const existing = prevCart.find((item) => {
        const itemKey = `${item.id}-${item.selectedSize || 'no-size'}-${item.sku || 'no-sku'}`;
        return itemKey === productKey;
      });
      
      if (existing) {
        // Nếu đã có sản phẩm với cùng id, size và sku, cộng dồn số lượng
        return prevCart.map((item) => {
          const itemKey = `${item.id}-${item.selectedSize || 'no-size'}-${item.sku || 'no-sku'}`;
          return itemKey === productKey
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item;
        });
      }
      // Thêm sản phẩm mới vào giỏ hàng
      return [...prevCart, { ...product, quantity: product.quantity || 1 }];
    });
  };

  // 🔄 Cập nhật số lượng
  const updateQuantity = (id, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: Number(quantity) } : item
      )
    );
  };

  // ❌ Xóa sản phẩm
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // 🧮 Tổng số lượng
  const cartCount = cart.length;

  // 🧾 Tổng tiền (nếu cần)
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, cartCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
