import React, { useEffect, useState, useMemo } from 'react';
import { imgCategoryCollection1 } from '../assets/ExportImage';
import ProductCard from './ProductCard';
import ProductAPI from '../service/ProductAPI';
import CategoryTypeAPI from '../service/CategoryTypeAPI';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CollectionProduct = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productRes, categoryTypeRes] = await Promise.all([
          ProductAPI.getCategories(),
          ProductAPI.getProducts(),
          CategoryTypeAPI.getCategoryType()
        ]);

        setCategories(categoryRes || []);
        setProducts(productRes || []);
        setCategoryTypes(categoryTypeRes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // ================= PREPARE DATA (OPTIMIZED) =================
  const categoryTypeMap = useMemo(() => {
    const map = {};

    categories.forEach(c => {
      const typeId = String(c.categories_type_id);
      const categoryId = String(c.id);

      if (!map[typeId]) {
        map[typeId] = new Set();
      }
      map[typeId].add(categoryId);
    });

    return map;
  }, [categories]);

  const sortedCategoryTypes = useMemo(() => {
    return [...categoryTypes].sort(
      (a, b) => Number(a.id) - Number(b.id)
    );
  }, [categoryTypes]);

  // ================= RENDER =================
  return (
    <>
      {sortedCategoryTypes.map((categoryType) => {
        const validCategoryIds = categoryTypeMap[String(categoryType.id)];
        if (!validCategoryIds) return null;

        const productsData = products
          .filter(p => validCategoryIds.has(String(p.category_id)))
          .slice(0, 6);

        if (productsData.length === 0) return null;

        return (
          <div
            key={categoryType.id}
            className="container mx-auto !pt-10"
          >
            <h3 className="text-[28px] uppercase text-center mb-10">
              <Link
                to={`/${categoryType.slug}`}
                className="text-[#333333] hover:text-[#673AB7] font-semibold"
              >
                {categoryType.translations?.[language]?.name}
              </Link>
            </h3>

            <div className="grid grid-cols-1 min-[1000px]:grid-cols-2">
              <div className="col-span-1 px-4">
                <a href="/">
                  <img
                    src={imgCategoryCollection1}
                    alt="collection"
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>

              <div className="col-span-1 px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-1 gap-y-4">
                  {productsData.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default CollectionProduct;
