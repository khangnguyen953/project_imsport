import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import DiscountBadge from "./DiscountBadge";
import { product2 } from "../data/product2";
import ProductAPI from "../service/ProductAPI";
import { useTranslation } from "react-i18next";





const ProductSlider = ({ title, items, language }) => (
  <div className="w-full flex flex-col items-center py-10 overflow-hidden">
    <h3 className="text-2xl uppercase font-semibold text-center mt-10 mb-10">{title}</h3>

    {/* --- Mobile grid --- */}
    <div className="grid grid-cols-2 gap-4 px-4 md:hidden">
      {items.map((item) => (
        <div key={item.id} className="group relative overflow-hidden">
          {item.price < item.originalPrice && <DiscountBadge discount={Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)} />}
          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-auto object-cover group-hover:scale-0 transition-all duration-500"
            />
            <img
              src={item?.thumbnail?.[0]}
              alt={item.translations[language].name}
              className="w-full h-auto object-cover absolute top-0 right-full group-hover:right-0 transition-all duration-500"
            />
          </div>
          <div className="px-2 pb-4 mt-2 text-center">
            <a href={`/product/${item.id}`} className="line-clamp-2 font-semibold text-sm">
              {item.translations[language].name}
            </a>
            {item.isDiscount !== 0 && item.originalPrice && (
              <p className="text-sm text-[#adadad] line-through">{item.originalPrice}</p>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* --- Desktop Swiper carousel --- */}
    {/* --- Desktop Swiper carousel --- */}
<div className="relative w-[95%] max-w-[2000px] hidden md:block">

  {/* 👉 Nếu ít hoặc bằng 6 sản phẩm thì hiển thị canh giữa, không dùng Swiper */}
  {items.length <= 6 && (
    <div className="flex justify-center gap-6 flex-wrap">
      {items.map((item) => (
        <div key={item.id} className="group relative w-[200px] overflow-hidden">
          {item.price < item.originalPrice && <DiscountBadge discount={Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)} />}
          <a href={`/product/${item.id}`} className="block relative overflow-hidden">
            <div className="relative w-full aspect-[1/1.1] overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto object-cover group-hover:scale-0 transition-all duration-500"
              />
              <img  
                src={item?.thumbnail?.[0]}
                alt={item.translations[language].name}
                className="w-full h-auto object-cover absolute top-0 right-full group-hover:right-0 transition-all duration-500"
              />
            </div>
          </a>
          <div className="px-1 pb-2 mt-2 text-center">
            <a
              href={`/product/${item.id}`}
              className="line-clamp-2 font-medium text-sm"
              title={item.translations[language].name}
            >
              {item.translations[language].name}
            </a>
            {item.isDiscount !== 0 && item.originalPrice && (
              <p className="text-xs text-[#adadad] line-through mt-1">
                {item.originalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '')}VND
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )}

  {/* 👉 Nếu nhiều hơn 6 sản phẩm thì hiển thị Swiper đầy đủ + vùng mờ + nút chuyển */}
  {items.length > 6 && (
    <>
      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={6}
        spaceBetween={10}
        loop={true}
        navigation={{ nextEl: ".next-btn", prevEl: ".prev-btn" }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={300}
        className="mySwiper"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="group relative overflow-hidden">
            {item.price < item.originalPrice && <DiscountBadge discount={Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)} />}
            <a href={`/product/${item.id}`} className="block relative overflow-hidden">
                <div className="relative w-full aspect-[1/1.1] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.translations[language].name}
                    className="w-full h-auto object-cover group-hover:scale-0 transition-all duration-500"
                  />
                  <img
                    src={item.thumbnail[0]}
                    alt={item.translations[language].name}
                    className="w-full h-auto object-cover absolute top-0 right-full group-hover:right-0 transition-all duration-500"
                  />
                </div>
              </a>
              <div className="px-1 pb-2 mt-2 text-center">
                <a
                  href={`/product/${item.id}`}
                  className="line-clamp-2 font-medium text-sm"
                  title={item.translations[language].name}
                >
                  {item.translations[language].name}
                </a>
                {item.isDiscount !== 0 &&(
                  <p className="text-xs text-[#adadad] line-through mt-1">
                    {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '')}VND
                  </p>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ✅ Giữ vùng mờ và nút điều hướng */}
      <button className="prev-btn absolute left-[17%] top-1/3 -translate-y-1/2 bg-[#ff6a00] hover:bg-[#ff8533] text-white w-8 h-8 rounded-full shadow-md z-10">
        {"<"}
      </button>
      <button className="next-btn absolute right-[17%] top-1/3 -translate-y-1/2 bg-[#ff6a00] hover:bg-[#ff8533] text-white w-8 h-8 rounded-full shadow-md z-10">
        {">"}
      </button>

      <div className="pointer-events-none absolute top-0 left-0 h-full w-[16%] bg-white/80 z-10"></div>
      <div className="pointer-events-none absolute top-0 right-0 h-full w-[16%] bg-white/80 z-10"></div>
    </>
  )}
</div>

  </div>
);

const ProductsSection = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  useEffect(() => {
    const fetchNewProducts = async () => {
      const response = await ProductAPI.getProducts();
      console.log('response', response);
      setNewProducts(response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7));
      setSaleProducts(response.filter(p => p.price < p.originalPrice));
    }
   
    fetchNewProducts();
  }, []);
  return (
    <>
      <ProductSlider title={t("products.newProducts")} items={newProducts} language={language} />
      <ProductSlider title={t("products.saleProducts")} items={saleProducts} language={language} />
    </>
  );
};

export default ProductsSection;
