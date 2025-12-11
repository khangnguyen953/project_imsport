import React, { useEffect, useState } from 'react'
import { imgCategoryCollection1, productImg1, productImg1Hide, productImg2, productImg2Hide, productImg3, productImg3Hide, productImg4, productImg4Hide, productImg5, productImg5Hide, productImg6, productImg6Hide, tagGift } from '../assets/ExportImage'
import ProductCard from './ProductCard'
import ProductDetailPopup from './ProductDetailPopup'
import Pagination from './Pagination'
import { useSearchParams } from 'react-router-dom'
const data =
{
    title: 'Đồ Nam',
    data: [
        {
            id: 1,
            image: productImg1,
            imageHide: productImg1Hide,
            name: 'Áo Chạy Địa Hình Nam Raidlight Maillot de trail R-Light - KAKI',
            price: '1,850,000 VNĐ',
            brand: "Adidas",
            originalPrice: 0,
            isBestSeller: false,
            isDiscount: 0,
            isGift: false,
        },
        {
            id: 2,
            image: productImg2,
            imageHide: productImg2Hide,
            name: 'Norda 001 | Giày Chạy Địa Hình Nam Norda 001 - Glitch',
            price: "5,907,500 VNĐ",
            brand: "Nike",
            originalPrice: "6,950,000 VNĐ",
            isBestSeller: false,
            isDiscount: 15,
            isGift: false,
        },
        {
            id: 3,
            image: productImg3,
            imageHide: productImg3Hide,
            name: 'Bondi 9 Wide | Giày Chạy Bộ Nam Hoka Bondi 9 Wide - BBLC',
            price: "3,999,000 VNĐ",
            brand: "Hoka",
            originalPrice: 0,
            isBestSeller: false,
            isDiscount: 0,
            isGift: true,
        },
        {
            id: 4,
            image: productImg4,
            imageHide: productImg4Hide,
            name: 'Oso Flaco (Winged)| Dép Chạy Nam LUNA Sandals Oso Flaco Winged Ed. Mountain Crystal',
            price: "2,065,000 VNĐ",
            brand: "LUNA",
            originalPrice: "2,950,000 VNĐ",
            isBestSeller: false,
            isDiscount: 30,
            isGift: false,
        },
        {
            id: 5,
            image: productImg5,
            imageHide: productImg5Hide,
            name: 'Light Speed Compression | Quần Bó Cơ Nam 2XU Light Speed Compression Shorts Mens - BLK/BRF',
            price: "1,691,500 VNĐ",
            brand: "2XU",
            originalPrice: "1,990,000 VNĐ",
            isBestSeller: true,
            isDiscount: 14,
            isGift: false,
        },
        {
            id: 6,
            image: productImg6,
            imageHide: productImg6Hide,
            name: 'Mono 2.0 (Winged)| Dép Chạy Nam LUNA Sandals Mono 2.0 Winged Ed - Desert Canyon',
            price: "2,065,000 VNĐ",
            brand: "LUNA",
            originalPrice: "2,950,000 VNĐ",
            isBestSeller: false,
            isDiscount: 30,
            isGift: false,
        },
        {
            id: 7,
            image: productImg3,
            imageHide: productImg3Hide,
            name: 'Bondi 9 Wide | Giày Chạy Bộ Nam Hoka Bondi 9 Wide - BBLC',
            price: "3,999,000 VNĐ",
            brand: "Hoka",
            originalPrice: 0,
            isBestSeller: false,
            isDiscount: 0,
            isGift: true,
        },
        {
            id: 8,
            image: productImg4,
            imageHide: productImg4Hide,
            name: 'Oso Flaco (Winged)| Dép Chạy Nam LUNA Sandals Oso Flaco Winged Ed. Mountain Crystal',
            price: "2,065,000 VNĐ",
            brand: "LUNA",
            originalPrice: "2,950,000 VNĐ",
            isBestSeller: false,
            isDiscount: 30,
            isGift: false,
        },
        {
            id: 9,
            image: productImg5,
            imageHide: productImg5Hide,
            name: 'Light Speed Compression | Quần Bó Cơ Nam 2XU Light Speed Compression Shorts Mens - BLK/BRF',
            price: "1,691,500 VNĐ",
            brand: "2XU",
            originalPrice: "1,990,000 VNĐ",
            isBestSeller: true,
            isDiscount: 14,
            isGift: false,
        },
    ]
}
const ProductList = ({ products }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [modalOpen, setModalOpen] = useState(false)
    const [product, setProduct] = useState(null)
    const [currentPage, setCurrentPage] = useState(searchParams.get("page") ?? 1)
    // const page = parseInt(searchParams.get("page")) || 1;
    const productPerPage = 10;
    const indexOfLastProduct = currentPage * productPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPage = Math.ceil(products.length / productPerPage);
    
    useEffect(() => {
        setCurrentPage(searchParams.get("page") ?? 1)
    }, [searchParams]);
    
    const handlePage = (page) => {
        if (page < 1 || page > products.length) return
        setCurrentPage(page)
        setSearchParams({ page }); // Gắn ?page=pageNumber lên URL
    }
  return (
    <div>
        <div className='container mx-auto'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 '>
                {currentProducts.map((item) => (
                    <ProductCard key={item.id} item={item} isList={true} />
                ))}
            </div>
            {totalPage > 1 && <Pagination currentPage={currentPage} handlePage={handlePage} totalPage={totalPage} />}
        </div>
        {/* {modalOpen && <ProductDetailPopup product={product} isOpen={modalOpen} onClose={() => setModalOpen(false)} />} */}
    </div>
  )
}

export default ProductList