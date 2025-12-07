import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductDetailPopup = ({ isOpen, product, onClose }) => {

    if (!isOpen) return null;
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null); 
    const navigate = useNavigate();
    console.log('product', product);
    useEffect(() => {
        if (!product) return;
        setQuantity(1);
    }, [product, isOpen]); // Thêm 'isOpen' để reset mỗi khi mở lại

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '')
            .replace(/\s/g, '')         // xóa toàn bộ khoảng trắng bình thường
            .replace(/\u00A0/g, '') + ' VNĐ';
    }
    const sizeVariations = product?.variations || [];
    // Nếu không có variations, cho phép thêm vào giỏ hàng
    // Nếu có variations, phải chọn size
    const isAddToCartDisabled = sizeVariations.length > 0
        ? (!selectedSize || quantity <= 0)
        : quantity <= 0;

    // Hàm xử lý khi nhấn nút
    const handleAddToCart = (product) => {
        if (isAddToCartDisabled) return;
        
        // Tìm variation được chọn (nếu có)
        const selectedVariation = sizeVariations.length > 0 && selectedSize
            ? sizeVariations.find(v => v.size === selectedSize)
            : null;
        
        const payload = selectedVariation
            ? {
                ...product,
                quantity: quantity,
                selectedSize: selectedSize,
                sku: selectedVariation.sku,
                price: selectedVariation.price ?? product.price,
                image: product.image || product.thumbnail?.[0] || '',
            }
            : {
                ...product,
                quantity: quantity,
                image: product.image || product.thumbnail?.[0] || '',
            };
        
        addToCart(payload);
        navigate('/cart');
        onClose();
    };

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 bg-black/50 z-[200]">
                <div onClick={(e) => e.stopPropagation()} className="bg-white shadow-xl w-[1000px] top-[5%] left-1/2 -translate-x-1/2 relative ">
                    <button
                        onClick={onClose}
                        className="absolute w-5 h-5 flex justify-center items-center font-bold top-3 right-3 text-white bg-[#673AB7] rounded-full text-xl"
                    >
                        &times;
                    </button>
                    <div className='grid grid-cols-1 min-[1000px]:grid-cols-2'>
                        {/* ... (Phần ảnh sản phẩm giữ nguyên) ... */}
                        <div className='col-span-1 px-4'>
                            <Link to={`/product/${product.id}`}>
                                <img src={product.image} alt="collection" className='w-full h-full object-cover' />
                            </Link>
                        </div>

                        {/* ... (Phần thông tin sản phẩm) ... */}
                        <div className='col-span-1 p-4'>
                            <h3>
                                <Link to={`/product/${product.id}`} className='text-[21px] font-normal text-[#333333] hover:text-[#673AB7] mt-4 mb-1 block '>{product.name}</Link>
                            </h3>
                            <div className='flex gap-2 divide-x-[1px] divide-[#898989] py-3'>
                                <p className='text-[#898989] text-sm'><span className='font-semibold'>Mã SP: </span> {product.id}</p>
                                <p className='text-[#898989] text-sm pl-2'><span className='font-semibold'>Thương hiệu: </span> {product.brand}</p>
                            </div>
                            <h3 className='text-[#858688] text-[22px] font-semibold mb-8'>{formatPrice(product.price)}</h3>
                            {sizeVariations.length > 0 && (
                                <div className='border-t border-gray-100 pt-4'>
                                    <p className='text-[#333] font-normal text-sm mb-0'>Size:</p>

                                    <div className='flex flex-wrap gap-2 mt-2'>
                                        {sizeVariations.map(({ sku, size, quantity }) => {
                                            const isOutOfStock = quantity === 0;
                                            return (
                                                <label className={`cursor-pointer ${isOutOfStock ? 'opacity-50' : ''}`} key={sku}>
                                                    <input
                                                        type="radio"
                                                        name={`popup-size-${product.id}`}
                                                        value={size}
                                                        disabled={isOutOfStock}
                                                        className="hidden peer"
                                                        checked={selectedSize === size}
                                                        onChange={() => setSelectedSize(size)}
                                                    />

                                                    <div className={`border shadow-[0_0_0_1px_#B8B8B8] h-[35px] min-w-[50px]
                                                    px-3 text-sm flex justify-center items-center rounded
                                                    peer-checked:shadow-[0_0_2px_2px_#FF7A00]
                                                    transition-all duration-200 ${isOutOfStock ? 'cursor-not-allowed bg-gray-200' : 'hover:shadow-[0_0_2px_2px_#FF7A00]'}`}>
                                                        {size}
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <p className='text-[#333] font-normal text-sm mt-4'>Số lượng: </p>
                            <div className='flex gap-x-2 items-center mt-2'>
                                <div>
                                    <input
                                        className='text-[#333] font-normal text-xs border px-5 w-[130px] py-2.5 text-center rounded-full'
                                        type="number" 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                                        onFocus={(e) => e.target.select()}
                                        onBlur={(e) => {
                                            if (e.target.value === '' || e.target.value <= 0)
                                                setQuantity(1);
                                        }}
                                    />
                                </div>
                                <div>
                                    <button
                                        className='uppercase bg-[#673AB7] p-2.5 rounded-full text-white text-xs font-normal disabled:opacity-50 disabled:cursor-not-allowed'
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isAddToCartDisabled} 
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductDetailPopup
