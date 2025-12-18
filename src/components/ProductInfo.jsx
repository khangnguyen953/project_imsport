import React, { useState, useEffect, useMemo } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";

import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next'


const ProductInfo = ({ product, variations = [], translations = {} }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const navigate = useNavigate();
  console.log(" translations",  translations);
  const sizeVariations = useMemo(() => (
    Array.isArray(variations) ? variations : []
  ), [variations]);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id, sizeVariations]);

  const selectedVariation = sizeVariations.length > 0 
    ? sizeVariations.find((variation) => variation.size === selectedSize)
    : null;
  
  // Nếu không có variations, cho phép thêm vào giỏ hàng
  // Nếu có variations, phải chọn size và size phải còn hàng
  const isAddToCartDisabled = sizeVariations.length > 0
    ? (!selectedVariation || quantity <= 0 || selectedVariation.quantity <= 0)
    : quantity <= 0;

  const handleAddToCart = (product) => {
    if (isAddToCartDisabled) return;

    const payload = {
      ...product,
      selectedSize: selectedVariation.size,
      sku: selectedVariation.sku,
      price: selectedVariation.price ?? product?.price,
      variationId: selectedVariation.variation_id,
    };

    console.log('handleAddToCart ', { ...payload, quantity: quantity })
    addToCart({ ...payload, quantity: quantity });
    navigate('/cart');
  }
  const formatPrice = (price) => {
    return price
      .toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      .replace('₫', '')
      .replace(/\s/g, '')
      .replace(/\u00A0/g, '') + ' VNĐ';
  };
  return (
    <div className="w-full md:w-[90%] text-gray-800">
      {/* Tên sản phẩsm */}
      <h1 className="text-2xl font-semibold mb-3 break-words leading-snug">
        {product?.translations[language].name}
      </h1>

      {/* Thương hiệu + Mã sản phẩm */}
      <p className="text-sm mb-6 border-b border-gray-200 pb-5">
        {t("productInfo.brand")}:{" "}
        <span className="text-[#898989]">{product?.brand}</span> | {t("productInfo.productCode")}:{" "}
        <span className="text-[#898989]">{product?.id}</span>
      </p>

      {/* Giá */}
      <p className=" text-black pb-4 ">
        {t("productInfo.price")}: <span className=" text-2xl">{formatPrice(Number(product?.price ?? selectedVariation?.price ??  0))}</span>
      </p>

      {/* Chọn size */}
      <div className="mb-6">
        <p className="font-medium mb-3">{t("productInfo.selectSize")}:</p>
        <div className="flex flex-wrap gap-2">
          {sizeVariations.map(({ sku, size, quantity }) => {
            const isOutOfStock = quantity == 0;
            return (
              <label className={`cursor-pointer ${isOutOfStock ? 'opacity-50' : ''}`} key={sku}>
                <input
                  type="radio"
                  name={`detail-size-${product?.id}`}
                  value={size}
                  disabled={isOutOfStock}
                  className="hidden peer"
                  checked={selectedSize === size}
                  onChange={() => setSelectedSize(size)}
                />

                <div className={`border shadow-[0_0_0_1px_#B8B8B8] h-[40px] min-w-[56px]
                    px-3 text-sm flex justify-center items-center rounded
                    peer-checked:shadow-[0_0_2px_2px_#FF7A00]
                    transition-all duration-200 ${isOutOfStock ? 'cursor-not-allowed bg-gray-200' : 'hover:shadow-[0_0_2px_2px_#FF7A00]'}`}>
                  {size}
                </div>
              </label>
            );
          })}
          {!sizeVariations.length && (
            <p className="text-sm text-gray-500">{t("productInfo.noSize")}</p>
          )}
        </div>
      </div>

      {/* Số lượng + Nút giỏ hàng */}
      <p className="font-medium mb-4">{t("productInfo.quantity")}:</p>

      <div className="pb-6 border-gray-200 md:mb-6 flex md:flex-nowrap flex-wrap items-center gap-4 md:h-10">
        <div className="w-full sm:w-auto flex items-center">
          {/* --- THAY ĐỔI 3: Cải thiện Input Số lượng --- */}
          <input
            className='text-[#333] font-normal text-xs border px-3 md:w-24 w-full md:mb-0 md:mt-0 mt-2 h-[45px] py-2.5 text-center rounded-full'
            type="number" // Đảm bảo số lượng luôn > 0
            value={quantity} // Dùng 'value' thay vì 'defaultValue'
            // Cập nhật state khi thay đổi, đảm bảo là số và ít nhất là 1
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            onFocus={(e) => e.target.select()}
            onBlur={(e) => {
              if (e.target.value === '' || e.target.value <= 0)
                setQuantity(1);
            }}
          />

        </div>

        <div className="w-full sm:w-auto flex justify-center sm:justify-start gap-4 items-center">
          {/* --- THAY ĐỔI 4: Áp dụng Logic cho Nút --- */}
          <button
            className="bg-[#673AB7] text-white px-8 py-3 rounded-full uppercase font-medium hover:bg-[#7e4fd1] transition-all disabled:opacity-50 disabled:cursor-not-allowed" // Thêm class disabled
            onClick={() => handleAddToCart(product)} // Thêm onClick
            disabled={isAddToCartDisabled} // Thêm trạng thái disabled
          >
            {t("productInfo.addToCart")}
          </button>

          <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center transition-all">
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Đặc điểm nổi bật (Giữ nguyên) */}
      <div className="pt-5 border-t border-gray-200">
        <h3 className="text-red-600 font-semibold mb-3">{t("productInfo.highlight")}</h3>
        <ul className="text-gray-700 space-y-1 mb-4">
          {translations[language]?.highlights?.split("\n").map((item, i) => (
            <li
              key={i}
              className="relative pl-4 before:content-['-'] before:absolute before:left-0 before:"
            >
              {item}
            </li>
          ))}
        </ul>

        <p className="text-gray-600 text-sm">{t("productInfo.moreInfo")}</p>
      </div>
    </div>
  );
};

export default ProductInfo;