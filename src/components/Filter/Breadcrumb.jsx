import { useLocation, Link } from "react-router-dom";
import breadcrumbBG from "../../assets/images/breadcrumb-bg.png"
import { categoriesType } from "../../data/categoriesType";
import { categories } from "../../data/categories";
import { useTranslation } from "react-i18next";
import i18n from "../../i18next/i18next";
import CategoryTypeAPI from "../../service/CategoryTypeAPI";
import CategoryAPI from "../../service/CategoriesAPI";
import { useEffect, useState } from "react";
const Breadcrumb = ({ category, subcategory, otherSlugName = null }) => {
  const [categoriesType, setCategoriesType] = useState([]);
  const [categories, setCategories] = useState([]);
  // const [otherSlugName, setOtherSlugName] = useState(null);
  const { t } = useTranslation();
  const location = useLocation();
  const currentSlug = location.pathname.replace("/", ""); // ví dụ "/giay" → "giay"

  let breadcrumbItems = [{ name: t("breadcrumb.home"), slug: "/" }];
  
  useEffect(() => {
    const loadInitData = async () => {
      const [categoriesType, categories] = await Promise.all([
        CategoryTypeAPI.getCategoryType(),
        CategoryAPI.getCategory(),
      ]);
      setCategoriesType(categoriesType.sort((a, b) => a.id - b.id) || []);
      setCategories(categories.sort((a, b) => a.id - b.id) || []);
    }
    loadInitData();
  }, [i18n.language]);

  const categoryType = categoriesType.find(item => item.slug === category);
  if (categoryType) {
    breadcrumbItems.push({
      name: categoryType.translations[i18n.language].name,
      slug: `/${categoryType.slug}`,
    });
  }

  if (subcategory) {
    const categoryData = categories.find(item => item.slug === subcategory);
    if (categoryData) {
      breadcrumbItems.push({
        name: categoryData.translations[i18n.language].name,
        slug: `/${categoryData.slug}`,
      });
    }
  }
  if (otherSlugName) {
    breadcrumbItems.push({
      name: otherSlugName,
      slug: `/${otherSlugName.slug}`,
    });
  }
  // const parent = data.find(item => item.slug === currentSlug);

  // if (parent) {
  //   // Trường hợp đang ở cấp cha
  //   breadcrumbItems.push({
  //     name: parent.categoriesType,
  //     slug: `/${parent.slug}`,
  //   });
  // } else {
  //   // Trường hợp là slug con (ví dụ "giay")
  //   data.forEach(item => {
  //     const child = item.categories?.find(c => c.slug === currentSlug);
  //     if (child) {
  //       breadcrumbItems.push({
  //         name: item.categoriesType,
  //         slug: `/${item.slug}`,
  //       });
  //       breadcrumbItems.push({
  //         name: child.name,
  //         slug: `/${child.slug}`,
  //       });
  //     }
  //   });
  // }

  return (
    <div
      className="w-full py-3 bg-cover bg-top"
      style={{ backgroundImage: `url(${breadcrumbBG})` }}
    >


      <div className="container py-3  "  >
        <nav className="text-sm text-gray-600 md:p-10 p-5">
          {breadcrumbItems.map((item, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-2"> / </span>}

              {index < breadcrumbItems.length - 1 ? (
                // Link cho các mục cha (ĐÃ BỎ hover:underline)
                <Link
                  to={item.slug}
                  className="text-blue-500 no-underline hover:text-blue-800"
                >
                  {item.name}
                </Link>
              ) : (
                // Link cho mục hiện tại (ĐÃ CHUYỂN TỪ <span> SANG <Link>)
                <Link
                  to={item.slug}
                  className="text-gray-800 font-medium no-underline hover:text-blue-800"
                >
                  {item.name}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;