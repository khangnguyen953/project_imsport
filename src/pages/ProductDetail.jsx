import React, { useEffect, useState } from "react";
// ẢNH SẢN PHẨM CHÍNH (MAFATE 5)
import { useNavigate, useParams } from "react-router-dom";
import ProductGallery from "../components/ProductGallery";
import ProductInfo from "../components/ProductInfo";
import ProductDescriptionTabs from "../components/ProductDescriptionTabs";
import RelatedProducts from "../components/RelatedProducts";
import bg from "../assets/images/breadcrumb-bg.png";
import { product2 } from "../data/product2";
import ProductAPI from "../service/ProductAPI";
import { categories } from "../data/categories";
import { categoriesType } from "../data/categoriesType";
import Breadcrumb from "../components/Filter/Breadcrumb";
import CategoryAPI from "../service/CategoriesAPI";
import CategoryTypeAPI from "../service/CategoryTypeAPI";


const ProductDetailPage = () => {
  const [product, setProduct] = useState();
  const { id } = useParams();
  const [category, setCategory] = useState();
  const [subcategory, setSubcategory] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      const response = await ProductAPI.getProductDetail(id)
      console.log("response ProductDetail", response?.translations);
      
      if (!response) {
        navigate("/404");
      }
      const categoryRes = await CategoryAPI.getCategory()
      const cateogryTypeRes = await CategoryTypeAPI.getCategoryType()
      const subCategory = categoryRes.find(c => c.id === response.category_id)
      const categoryType = cateogryTypeRes.find(c => c.id === subCategory.categories_type_id)
      setCategory(categoryType.slug)
      setSubcategory(subCategory.slug)
      setProduct(response)
    }
    fetchProduct()
    // setProduct(product2.find(p => p.id == id))
  }, [id]);

const handleRealAddToCart = (productData) => {
    console.log("Sản phẩm cần thêm vào giỏ hàng:", productData);
 
};

  const highlights = [
    "Đế Vibram® Megagrip 5mm",
    "Đệm hai lớp siêu êm (PEBA Foam)",
    "Công nghệ MetaRocker™ mới",
    "Upper dệt Warp knit chống rách",
    "Hỗ trợ gắn gaiter bảo vệ cổ chân",
     "Drop: 8mm",
    "Trọng lượng: 286g (Nữ), 332g (Nam)",
  ];

  return (
    <div className="">
      {/* Breadcrumb (giữ nguyên) */}
      <div
        style={{ backgroundImage: `url(${bg})` }}
        className="h-24 md:h-30 text-sm text-gray-700 mb-8 p-4 rounded-lg shadow-sm flex items-center"
      >
        <div className="container mx-auto">
          <Breadcrumb category={category} subcategory={subcategory} />

        </div>

      </div>

      {/* Nội dung chính */}
      <div className="container">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2">
            <ProductGallery images={product?.thumbnail || []} />
          </div>

          <div className="md:w-3/5 flex-1 h-full">
            <ProductInfo
              product={product}
              variations={product?.variations || []}
              highlights={highlights}
              onAddToCart={handleRealAddToCart}
            />
          </div>
        </div>
        <ProductDescriptionTabs translations={product?.translations || {}} />

        {/* Props (giữ nguyên) */}
        <RelatedProducts
          currentProductId={id}
          categoryId={product?.category_id}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;