import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop";
import ProductCategoryPage from "./pages/ProductCategoryPage";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';
import FilterContainer from './components/Filter/FilterContainer';
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutPreview from "./pages/CheckoutPreview";
import ChatbotPage from "./pages/ChatBotDemo";
import Dashboard from "./pages/Admin/Dashboard";
import ProductEditor from "./pages/Admin/ProductEditor";
import CategoryManager from "./pages/Admin/CategoryManager";
import "./i18next/i18next";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18next/i18next";
import Error from "./pages/Error";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderHistory from "./components/OrderHistory";
import GeminiChat from "./pages/GeminiChatWidget";
import CategoryTypeManager from "./pages/Admin/CategoryTypeManager";

import OrderAdmin from "./components/AdminOrderModal";
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <ScrollToTop />
        <GeminiChat/>
        <Routes>
          {/* 🔹 Dùng layout chính */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            {/* <Route path='filter' element={<FilterContainer />} /> */}
            <Route path="/:category" element={<ProductCategoryPage />} />
            <Route
              path="/:category/:subcategory"
              element={<ProductCategoryPage />}
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/404" element={<Error />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-preview" element={<CheckoutPreview />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/order" element={<OrderHistory />} />
          
    
          </Route>
          <Route path="/admin">
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductEditor />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="category-types" element={<CategoryTypeManager />} />
            <Route path="orderadmin" element={<OrderAdmin />} />
          </Route>
        </Routes>
      </Router>
    </I18nextProvider>
  );
}

export default App;
