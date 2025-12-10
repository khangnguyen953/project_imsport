import React, { useEffect, useState } from 'react'
import Breadcrumb from '../components/Filter/Breadcrumb'
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeftIcon } from 'lucide-react';
import Tooltip from '../components/Tooltip';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [show, setShow] = useState(false);
    console.log('cart', cart);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleMouseMove = (e) => {
        setPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    };
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '')
        .replace(/\s/g, '')         // xóa toàn bộ khoảng trắng bình thường
        .replace(/\u00A0/g, '')  + ' VNĐ';
    }
    const handleQuantityChange = (id, value) => {
        updateQuantity(id, value);
    }
    const handleDelete = (id, variationId) => {
        removeFromCart(id, variationId);
    }
    return (
        <>
            <Breadcrumb otherSlugName="Giỏ hàng" />
            <div className="container">
                <div className="w-full">
                    <div className="col-span-1">
                        <h1 className='text-2xl font-semibold text-[#363636] md:my-7 my-5 uppercase '>Giỏ hàng</h1>
                        <div className='flex justify-between items-center'>
                            <h3 className='block md:hidden text-base font-normal text-[#363636] mb-3 uppercase  '>Giỏ hàng của bạn</h3>
                            {cart.length === 0 &&
                                <Link to='/' className='block md:hidden text-center text-sm text-[#673AB7]'>Cửa hàng</Link>
                            }
                        </div>
                        {cart.length === 0 ? (
                            <div>
                                <div className='block md:hidden text-start text-xs text-[#858688] pt-5'>Chưa có sản phẩm nào, Nhấn vào cửa hàng để mua</div>
                                <div className='hidden md:block text-start text-xs text-[#858688] '>Giỏ hàng trống</div>
                                <Link to='/' className='hidden md:flex items-center text-sm  text-[#363636] font-lighter mt-5'>
                                    <ChevronLeftIcon strokeWidth={3} className="h-5 w-5 text-black font-black" />

                                    Trang chủ</Link>
                            </div>
                        ) : (


                            <div className="w-full">
                                <div className="col-span-1">
                                    <div className='w-full'>
                                        <div className='border-b-[1px] border-[#ebebeb] md:flex hidden '>
                                            <div className='text-center p-2 font-bold text-[#363636] w-[15%]'>Hình ảnh</div>
                                            <div className='text-center p-2 font-bold text-[#363636] w-[35%]'>Tên sản phẩm</div>
                                            <div className='text-center p-2 font-bold text-[#363636] w-[15%]'>Đơn giá</div>
                                            <div className='text-center p-2 font-bold text-[#363636] w-[10%]'>Số lượng</div>
                                            <div className='text-center p-2 font-bold text-[#363636] w-[15%]'>Thành tiền</div>
                                            <div className='text-center p-2 font-bold text-[#363636] w-[10%]'>Xóa</div>

                                        </div>
                                        <div className=''>
                                            {cart && cart.length > 0 && cart.map((item, index) => (
                                                <div key={index} className='border-y-[1px] border-[#ebebeb] py-4 flex gap-x-2'>
                                                    <div className='text-center md:w-[15%] w-[25%]'><Link to={`/product/${item.id}`}><img src={item.image} alt={item.name} className='w-full object-cover' /></Link></div>
                                                    <div className='md:flex md:w-[50%] w-[55%] items-center'>
                                                        <div className='text-left md:w-[70%] w-full px-1'><Link to={`/product/${item.id}`} className='hover:text-[#673AB7] text-[#333333] md:font-normal font-semibold md:uppercase normal-case text-sm'>{item.name} - {item.variations.find(variation => variation.variation_id === item.variationId)?.size}</Link></div>
                                                        <div className='md:text-center text-start md md:w-[30%] px-1 w-full md:text-[#858688] text-[#673AB7] md:font-semibold font-normal text-sm '><span className='md:hidden inline-block text-[#898989]'>Giá:</span> {formatPrice(Number(item.price))}</div>
                                                    </div>
                                                    <div className='md:flex md:w-[35%] w-[20%] items-center'>
                                                        <div className='text-center md:w-[30%] w-full'>
                                                            <input type="number" min="1" className='md:w-20 md:h-10 w-12 h-7 px-2 border-[1px] border-[#ddd] md:rounded-full  text-[#363636] text-center outline-none' onFocus={(e) => e.target.select()} defaultValue={1} value={item.quantity === 0 ? '' : item.quantity}
                                                                onBlur={(e) => {
                                                                    if (e.target.value === '' || e.target.value <= 0)
                                                                        handleQuantityChange(item.id, 1);
                                                                }}
                                                                onChange={(e) => handleQuantityChange(item.id, e.target.value === '' || Number(e.target.value) <= 0 ? 0 : Number(e.target.value))} />
                                                        </div>
                                                        <div className='text-center w-[40%] text-[#858688] font-semibold text-sm md:block hidden'>{formatPrice(Number(item.price) * (Number(item.quantity) || 1))}</div>
                                                        <div className='text-center  md:w-[30%] w-full text-sm'><button onClick={() => handleDelete(item.id, item.variationId)} className='text-[#363636] hover:text-[#673AB7] md:mt-0 mt-4'>Xóa</button></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className=''>
                                        <div className='flex gap-x-2 md:justify-end justify-between items-center mt-8  text-[#673AB7] md:font-semibold font-normal md:text-lg text-base'><span className='text-[#1c1c1c] mr-2 uppercase md:normal-case'>Tổng tiền:</span> {formatPrice(Number(cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0)))}</div>
                                        <div className='flex md:flex-row flex-col-reverse gap-x-4 gap-y-2 justify-end mt-2'>
                                            <div
                                                className="relative inline-block"
                                                onMouseMove={handleMouseMove}
                                                onMouseEnter={() => {setShow(true)}}
                                                onMouseLeave={() => setShow(false)}>
                                                <Link to='/' className='block text-center text-sm bg-[#f1f1f1] py-3 px-10 rounded-full text-black  font-lighter uppercase md:normal-case'>Tiếp tục mua hàng</Link>
                                                {show && (
                                                    <span
                                                        className="absolute bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity duration-100"
                                                        style={{
                                                            left: `${position.x + 10}px`,
                                                            top: `${position.y + 20}px`,
                                                        }}
                                                    >
                                                       Tiến tục mua hàng
                                                    </span>
                                                )}
                                            </div>
                                            <Link to='/' className='block md:hidden text-center text-sm bg-[#673AB7] py-2.5 px-10 mt-3 rounded-full text-white font-light uppercase'>Tiến hành thanh toán</Link>
                                            <div className='relative group/icon hidden md:block'>
                                                <Tooltip className to="/" label="Đặt hàng" tooltip="Tiến hành thanh toán" />
                                                {/* <Link to='/' className='hidden md:block text-center text-sm bg-[#673AB7] py-2.5 px-10 rounded-full text-white font-light  md:normal-case'>Đặt hàng</Link> */}
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Cart