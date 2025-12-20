import React, { useEffect, useMemo, useState } from "react";
import ProductGridPage from "../components/ProductGridPage";
import { useParams } from "react-router-dom";
import Breadcrumb from "../components/Filter/Breadcrumb";
import FilterContainer from "../components/Filter/FilterContainer";
import CategoryTypeAPI from "../service/CategoryTypeAPI.js";
import CategoriesAPI from "../service/CategoriesAPI.js";
import ProductAPI from "../service/ProductAPI.js";
import { useTranslation } from "react-i18next";
import i18n from "../i18next/i18next";
const PRICE_MIN = 0;
const PRICE_MAX = 20_000_000;

const ProductCategoryPage = () => {
  const { category, subcategory } = useParams();
  const [productOrigin, setProductOrigin] = useState([]);
  const [products, setProducts] = useState([]);          // dữ liệu gốc
  const [filteredData, setFilteredData] = useState([]);  // dữ liệu sau filter
  const [categoryTitle, setCategoryTitle] = useState(null);
  const [categoryDescription, setCategoryDescription] = useState(null);
  const [language, setLanguage] = useState(i18n.language);
  const { t } = useTranslation();
  const [categoriesType, setCategoriesType] = useState([]); // ⬅️ THÊM
  const [categories, setCategories] = useState([]);         // ⬅️ THÊM
  const [filters, setFilters] = useState({
    sizes: [],
    brands: [],
    price: null,
  });


  
  const isFiltering =
    filters.sizes.length > 0 ||
    filters.brands.length > 0 ||
    (filters.price &&
      (filters.price.min > PRICE_MIN || filters.price.max < PRICE_MAX));

  // // ==== Gom dữ liệu categories type & categories ====
  // const dataNew = useMemo(() => {

  //   // 1. Gom categories theo từng typeId (1 vòng)
  //   const group = {};
  //   for (const cat of categories) {
  //     if (!group[cat.categories_type_id]) {
  //       group[cat.categories_type_id] = [];
  //     }
  //     const productList = products.filter((p) => p.category_id === cat.id)

  //     group[cat.categories_type_id].push({
  //       id: cat.id,
  //       name: cat.translations[i18n.language].name,
  //       slug: cat.slug,
  //       products: productList
  //     });
  //   }
  //   // 2. Tạo danh sách category type (1 vòng)
  //   return categoriesType.map((type) => ({
  //     id: type.id,
  //     categoriesType: type.translations[i18n.language].name,
  //     slug: type.slug,
  //     description: type.translations[i18n.language].description,
  //     categories: group[type.id] || [],
  //   }));
  // }, [categoriesType, categories, products, i18n.language]);
  
const dataNew = useMemo(() => {
    // Duyệt qua từng Type
    return categoriesType.map((type) => {
      
      // Với mỗi Type, lọc ngay danh sách categories con của nó
      const catsInType = categories
        .filter((cat) => cat.categories_type_id === type.id)
        .map((cat) => ({
          id: cat.id,
          name: cat.translations?.[i18n.language]?.name || cat.name,
          slug: cat.slug,
          // Với mỗi Category, lọc ngay danh sách sản phẩm của nó
          products: products.filter((p) => p.category_id === cat.id) 
        }));

      return {
        id: type.id,
        categoriesType: type.translations?.[i18n.language]?.name || type.name,
        slug: type.slug,
        description: type.translations?.[i18n.language]?.description || '',
        categories: catsInType,
      };
    });
  }, [categoriesType, categories, products, i18n.language]);

  // lấy data API 1 lần 
  useEffect(() => {
    const loadInitData = async () => {
      try {
        const [typeRes, catRes, productRes] = await Promise.all([
          CategoryTypeAPI.getCategoryType(),
          CategoriesAPI.getCategory(),
          ProductAPI.getProducts(),
        ]);
        setCategoriesType(typeRes.sort((a, b) => a.id - b.id) || []);
        setCategories(catRes.sort((a, b) => a.id - b.id) || []);
        setProductOrigin(productRes || []);
      } catch (err) {
        console.error("Init load error:", err);
      }
    };   
    loadInitData();
  }, []);  // ⬅️ chạy đúng 1 lần duy nhất

  
  // ==== Load sản phẩm theo category/subcategory ====


  useEffect(() => {
    if (!categories.length || !categoriesType.length || !productOrigin.length) return;

    let list = [];
    let categoryTitle = "";
    let categoryDescription = "";

    const currentType = categoriesType.find(t => t.slug === category);
    if (!currentType) return;

    categoryDescription = currentType.translations[i18n.language].description;

    if (subcategory) {
      const currentCategory = categories.find(c => c.slug === subcategory);
      if (!currentCategory) return;

      list = productOrigin.filter(p => p.category_id === currentCategory.id);
      categoryTitle = currentCategory.translations[i18n.language].name;
    } else {
      const categoryChildren = categories.filter(
        c => c.categories_type_id === currentType.id
      );

      list = productOrigin.filter(p =>
        categoryChildren.some(child => p.category_id === child.id)
      );

      categoryTitle = currentType.translations[i18n.language].name;
    }

    setProducts(list);
    setFilteredData(list);
    setCategoryTitle(categoryTitle);
    setCategoryDescription(categoryDescription);

  }, [category, subcategory, productOrigin, i18n.language]);



  const handleFilterChange = (newFilter) => {
    setFilters((prev) => ({ ...prev, ...newFilter }));
  };

  const normalizedSelectedBrands = useMemo(
    () =>
      filters.brands.map((brand) => brand?.trim().toLowerCase()).filter(Boolean),
    [filters.brands]
  );

  // ==== Xử lý filter ====
  useEffect(() => {
    if (!isFiltering) {
      if (filteredData !== products) {      // tránh setState dư thừa
        setFilteredData(products);
      }
      return;
    }

    const result = products.filter((product) => {
      // --- SIZE ---
      const directSizes = product.size
        ? product.size.split(",").map((s) => s.trim())
        : [];

      const variationSizes =
        product.variations?.map((v) => v.size?.trim()).filter(Boolean) || [];

      const productSizes = Array.from(new Set([...directSizes, ...variationSizes]));

      const matchSize =
        filters.sizes.length === 0 ||
        productSizes.some((size) => filters.sizes.includes(size));

      // --- BRAND ---
      const productBrand = product.brand?.trim().toLowerCase();

      const matchBrand =
        normalizedSelectedBrands.length === 0 ||
        (productBrand && normalizedSelectedBrands.includes(productBrand));

      // --- PRICE ---
      const priceToCompare =
        typeof product.price === "number"
          ? product.price
          : Number(product.price) || 0;

      const minPrice = filters.price?.min ?? PRICE_MIN;
      const maxPrice = filters.price?.max ?? PRICE_MAX;

      const matchPrice =
        !filters.price ||
        (priceToCompare >= minPrice && priceToCompare <= maxPrice);

      return matchSize && matchBrand && matchPrice;
    });



    setFilteredData(result);
  }, [filters, products, normalizedSelectedBrands]);
  console.log("new Data:", dataNew);
  return (
    <>
      <Breadcrumb category={category} subcategory={subcategory} />

      <div className="container flex ">
        <div className="md:flex inline-block w-auto bg-white h-full border-2 border-solid ">
          <FilterContainer
            data={dataNew}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="flex-1">
          <ProductGridPage
            title={categoryTitle}
            category={category}
            description={categoryDescription || ""}
            productData={filteredData}  // luôn lấy filteredData
          />
        </div>
      </div>
    </>
  );
};

export default ProductCategoryPage;
