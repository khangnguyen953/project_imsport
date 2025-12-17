import React, { useEffect, useState } from 'react'
import { imgCategoryCollection1, productImg1, productImg1Hide, productImg2, productImg2Hide, productImg3, productImg3Hide, productImg4, productImg4Hide, productImg5, productImg5Hide, productImg6, productImg6Hide, tagGift } from '../assets/ExportImage'
import ProductCard from './ProductCard'
import ProductAPI from '../service/ProductAPI'
// import { productsData } from '../data/ProductVariation'

import { product2 } from '../data/product2'
import { categories } from '../data/categories'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
const data =
{
    title: 'Đồ Nam',
    data: [
        {
            id: 1,
            image: productImg1,
            imageHide: productImg1Hide,
            name: 'Áo Chạy Địa Hình Nam Raidlight Maillot de trail R-Light - KAKI',
            price: 1850000,
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
            price: 5907500,
            brand: "Nike",
            originalPrice: 6950000,
            isBestSeller: false,
            isDiscount: 15,
            isGift: false,
        },
        {
            id: 3,
            image: productImg3,
            imageHide: productImg3Hide,
            name: 'Bondi 9 Wide | Giày Chạy Bộ Nam Hoka Bondi 9 Wide - BBLC',
            price: 3999000,
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
            price: 2065000,
            brand: "LUNA",
            originalPrice: 2950000,
            isBestSeller: false,
            isDiscount: 30,
            isGift: false,
        },
        {
            id: 5,
            image: productImg5,
            imageHide: productImg5Hide,
            name: 'Light Speed Compression | Quần Bó Cơ Nam 2XU Light Speed Compression Shorts Mens - BLK/BRF',
            price: 1691500,
            brand: "2XU",
            originalPrice: 1990000,
            isBestSeller: true,
            isDiscount: 14,
            isGift: false,
        },
        {
            id: 6,
            image: productImg6,
            imageHide: productImg6Hide,
            name: 'Mono 2.0 (Winged)| Dép Chạy Nam LUNA Sandals Mono 2.0 Winged Ed - Desert Canyon',
            price: 2065000,
            brand: "LUNA",
            originalPrice: 2950000,
            isBestSeller: false,
            isDiscount: 30,
            isGift: false,
        },
    ]
}

const CollectionProduct = () => {
    const [products, setProducts] = useState()
    const { t, i18n } = useTranslation();
    const language = i18n.language;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categories, products] = await Promise.all([
                    ProductAPI.getCategories(),
                    ProductAPI.getProducts()
                ]);
                setProducts(
                    products.filter(item =>
                        categories.some(c => c.categories_type_id === 1 && c.id === item.category_id)
                    ).slice(0, 6)
                );
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    return (
        <>
            <div className='container mx-auto !pt-10'>
                <h3 className='text-[28px] uppercase text-center mb-10'>
                    <Link to='/do-nam' className='text-[#333333] hover:text-[#673AB7] font-semibold'>{t("collection.doNam")}</Link>
                </h3>
                <div className='grid grid-cols-1 min-[1000px]:grid-cols-2'>
                    <div className='col-span-1 px-4'>
                        <a href='/'>
                            <img src={imgCategoryCollection1} alt="collection" className='w-full h-full object-cover' />
                        </a>
                    </div>
                    <div className='col-span-1 px-4'>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-x-1 gap-y-4'>
                            {products?.map((item) => (
                                <ProductCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default CollectionProduct