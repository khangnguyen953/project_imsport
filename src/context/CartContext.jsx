import { createContext, useContext, useEffect, useState } from "react";
import CartAPI from "../service/CartAPI";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [userId, setUserId] = useState(JSON.parse(localStorage.getItem('user'))?.id || null);
  const [cartCount, setCartCount] = useState(JSON.parse(localStorage.getItem('cart'))?.length || 0);
  // 🔹 Load dữ liệu giỏ hàng từ localStorage khi app khởi động

  useEffect(() => {
    const fetchCart = async () => {
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

      if (userId) {
        const response = await CartAPI.getCart(userId);
        console.log('response', response);

          setCart(response.productList || []);
          setCartCount(response.productList.length);
      } else {
        setCart(storedCart);
        setCartCount(storedCart.length);
      }
    }
    fetchCart();
  }, [userId]);

  // 🔹 Tự động lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (!userId) {
      localStorage.setItem("cart", JSON.stringify(cart));
      setCartCount(cart.length);
    }
  }, [cart]);

  // 🛒 Thêm sản phẩm
  const addToCart = async (product) => {
    console.log('product', product);
    if (userId) {
      const payload = {
        user_id: userId,
        product_id: product.id,
        quantity: product.quantity,
        variation_id: product.variationId,
      }
      console.log('addToCart API', payload);
      const response = await CartAPI.addToCart(payload);
      console.log('response', response);
      if (response) {
        const responseCart = await CartAPI.getCart(userId);
        setCart(responseCart.productList || []);
        setCartCount(responseCart.productList.length);
      }
    } else {
      console.log('addToCart Local Storage');
      setCart((prevCart) => {
        // Tìm item trùng cả product_id (id) và variation.id (variationId)
        const existing = prevCart.find((item) =>
          item.id === product.id && item.variationId === product.variationId
        );

        if (existing) {
          // Nếu trùng cả product_id và variation.id thì tăng số lượng
          return prevCart.map((item) =>
            item.id === product.id && item.variationId === product.variationId
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          );
        }
        // Ngược lại thì thêm mới
        return [...prevCart, product];
      });
      setCartCount(cart.length);
    }
  };

  // 🔄 Cập nhật số lượng
  const updateQuantity = (id, variationId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id === id && item.variationId === variationId) ? { ...item, quantity: Number(quantity) } : item
      )
    );
  };

  // ❌ Xóa sản phẩm
  const removeFromCart = (id, variationId) => {
    setCart((prevCart) => prevCart.filter((item) => (item.id !== id || item.variationId !== variationId)));
  };

  // 🧮 Tổng số lượng

  // 🧾 Tổng tiền (nếu cần)
  // const totalPrice = cart.reduce(
  //   (sum, item) => sum + item.price * item.quantity,
  //   0
  // );

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, updateQuantity, removeFromCart, cartCount, userId, setUserId, setCartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
