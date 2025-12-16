import React, { useState } from 'react'
import BestSellerBadge from './BestSellerBadge'
import DiscountBadge from './DiscountBadge'
import GiftBadge from './GiftBadge'
import ProductAction from './ProductAction'
import ProductDetailPopup from './ProductDetailPopup'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ProductCard = ({ item, isList = false, isRelated = true }) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [modalOpen, setModalOpen] = useState(false)
  const quickView = (id) => {
    setModalOpen(true)
  }
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '')
    .replace(/\s/g, '')         // xóa toàn bộ khoảng trắng bình thường
    .replace(/\u00A0/g, '')  + ' VNĐ';
  }
  const handleRealAddToCart = (productToAdd) => {
    console.log("Sản phẩm cần thêm vào giỏ hàng:", productToAdd);
    // productToAdd sẽ là: { id: "...", name: "...", price: "...", selectedSize: "M", quantity: 2 }

    // TẠI ĐÂY, bạn sẽ implement logic (Rule 4 và 5):
    // 1. Kiểm tra xem sản phẩm với size này đã có trong giỏ hàng (cart) chưa.
    // 2. Nếu chưa (Rule 4) => Thêm item mới vào cart.
    // 3. Nếu đã có (Rule 5) => Cập nhật (cộng dồn) số lượng cho item đó.
  };
  return (
    <div key={item.id} className='col-span-1 group'>
      <div className='relative overflow-hidden'>
        {item.isBestSeller && <BestSellerBadge />}
        {item.isGift && <GiftBadge />}
        {isRelated && <ProductAction product={item} quickView={quickView} />}
        {item.price < item.originalPrice && <DiscountBadge discount={Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)} />}


        <Link to={`/product/${item.id}`} className=''>
          <img src={item.image} alt="collection" className='w-full h-full object-cover md:group-hover:scale-0 transition-all duration-500' />
          <img src={item?.thumbnail?.[0]} alt="collection" className='w-full h-full object-cover absolute top-0 right-full md:group-hover:right-0 transition-all duration-500' />
        </Link>
      </div>
      <div className='px-4 pb-5 md:text-end text-center'>
        <Link to={`/product/${item.id}`} className='line-clamp-2 font-semibold text-base text-center' title={item.translations[language].name}>{item.translations[language].name}</Link>
        <div className='my-1 text-center md:mr-3 '>
          <p className='text-[15px] font-bold  text-[#ff8c00] '>{formatPrice(Number(item.price))}</p>
          {item.originalPrice != item.price && <p className='text-sm font-normal  text-[#adadad] line-through '>{formatPrice(Number(item.originalPrice))}</p>}
        </div>
        {!isList && (
          <button onClick={() => quickView(item.id)} className='md:block hidden w-full text-sm font-normal text-center text-[#333333] hover:text-[#673AB7] my-1'>Thêm vào giỏ hàng</button>
        )}
      </div>
      {modalOpen &&
        <ProductDetailPopup product={item} isOpen={modalOpen} onClose={() => setModalOpen(false)} onAddToCart={handleRealAddToCart} />
      }
    </div>
  )
}

export default ProductCard