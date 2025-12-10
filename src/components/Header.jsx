import { useEffect, useState, useRef } from "react";
import "../styles/components/Header.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Assets
import logo from "../assets/images/logo.png";
import vnFlag from "../assets/images/vn.png";
import ukFlag from "../assets/images/eng.png";

// Heroicons
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import CategoryAPI from "../service/CategoriesAPI";
import CategoryTypeAPI from "../service/CategoryTypeAPI";
import { useTranslation } from "react-i18next";
import i18n from "../i18next/i18next";
import ProductAPI from "../service/ProductAPI";
import { LogOutIcon } from "lucide-react";

export default function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { cartCount, setUserId} = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const location = useLocation();
  const hideMenu = ["/men", "/women", "/watch"].includes(location.pathname);
  const [categories, setCategories] = useState([]);
  const [categoriesType, setCategoriesType] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      const [response, responseType, productResponse] = await Promise.all([
        CategoryAPI.getCategory(),
        CategoryTypeAPI.getCategoryType(),
        ProductAPI.getProducts()
      ]);
      setCategories(response);
      setCategoriesType(responseType.sort((a, b) => a.id - b.id));
      setProducts(productResponse);
    };
    fetchCategories();
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchResults && searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveSubmenu(null);
  };

  const openSubmenu = (menu) => {
    setActiveSubmenu(menu);
  };

  const closeSubmenu = () => {
    setActiveSubmenu(null);
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    window.localStorage.setItem("language", language);
  };

  // Hàm loại bỏ dấu tiếng Việt
  const removeVietnameseDiacritics = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProducts([]);
      setShowSearchResults(false);
    } else {
      const normalizedQuery = removeVietnameseDiacritics(query.toLowerCase());
      const filtered = products.filter((product) => {
        const normalizedProductName = removeVietnameseDiacritics(product.name.toLowerCase());
        return normalizedProductName.includes(normalizedQuery);
      });
      setFilteredProducts(filtered);
      setShowSearchResults(filtered.length > 0);
      console.log("filteredProducts", filteredProducts);
      console.log("showSearchResults", showSearchResults);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      .replace('₫', '')
      .replace(/\s/g, '')
      .replace(/\u00A0/g, '') + ' VNĐ';
  };

  const handleProductClick = (productId) => {
    setSearchQuery("");
    setFilteredProducts([]);
    setShowSearchResults(false);
    navigate(`/product/${productId}`);
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUserId(null);
    navigate('/');
  };


  return (
    <header className="w-full shadow-sm border-b bg-white">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        {/* Mobile menu toggle */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <div className="items-center justify-between relative">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between relative">
          <ul className="flex items-center justify-between gap-4 w-full">
            {/* Search */}
            <li ref={searchRef} className="flex items-center md:border relative">
              <div className="hidden md:flex flex-1 relative">
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => {
                    if (filteredProducts.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  type="text"
                  placeholder={t("header.searchPlaceholder")}
                  className="px-4 py-1 outline-none w-full"
                />
                {/* Search Results Dropdown */}
                {showSearchResults && filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 md:w-[300px] bg-white border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto mt-1">
                    {filteredProducts.slice(0, 10).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm font-semibold text-orange-500 mt-1">
                            {formatPrice(Number(product.price))}
                          </p>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length > 10 && (
                      <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-200">
                        Và {filteredProducts.length - 10} sản phẩm khác...
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button className="hidden md:flex p-2 text-gray-500 hover:text-orange-500 outline-none">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 text-gray-500 hover:text-orange-500"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </li>

            {/* User */}
            <li className="hidden md:flex items-center">
              <Link to="/login" className="hover:text-orange-500">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </Link>
            </li>

            {/* Cart */}
            <li className="relative flex items-center">
              <Link to="/cart" className="hover:text-orange-500 relative flex">
                <ShoppingBagIcon className="h-5 w-5 text-gray-600 hidden md:flex" />
                <ShoppingCartIcon className="h-5 w-5 text-gray-600 md:hidden" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            </li>

            {/* Language */}
            <li className="flex items-center gap-2">
              <img
                src={vnFlag}
                alt="Vietnamese"
                className="h-5 w-5 cursor-pointer"
                onClick={() => handleLanguageChange("vi")}
              />
              <span className="h-5 border-l border-gray-400"></span>
              <img
                src={ukFlag}
                alt="English"
                className="h-5 w-5 cursor-pointer"
                onClick={() => handleLanguageChange("en")}
              />
            </li>
            {localStorage.getItem('user') && (
              <li className="flex items-center">
                <button onClick={handleLogout} className="hover:text-orange-500">
                  <LogOutIcon className="h-5 w-5 text-gray-600" />
                </button>
              </li>
            )}
          </ul>
        </div>

      </div>
      <nav className="main-navigation container">
        <Link to="/about" className="nav-link">
          {t("header.about")}
        </Link>
        {categoriesType.map((categoryType) => {
            const categoriesSub = (categories.filter((category) => category.categories_type_id === categoryType.id))
            return (
            <div key={categoryType.id} className="nav-dropdown">
              <Link to={`/${categoryType.slug}`} className="nav-link">{categoryType.translations[i18n.language].name} <span className="caret"><ChevronDownIcon className="h-4 w-4 ml-1 text-gray-500" />
              </span></Link>
              <ul className="dropdown-menu">
                {categoriesSub.map((category) => (
                  <li key={category.id}><Link to={`/${categoryType.slug}/${category.translations[i18n.language].slug}`} className="dropdown-item">{category.translations[i18n.language].name}</Link></li>
                ))}
              </ul>
            </div>
          )
        })}

        <Link to="/sale" className="nav-link sale-link">
          {t("header.sale")}
        </Link>
      </nav>

      {/* Navigation mobile */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="mobile-nav-header">
            <p>{t("header.menu")}</p>
          </div>

        <nav className="mobile-nav">
          <div className="mobile-nav-item">
            <Link to="/about" className="mobile-nav-link" onClick={toggleMenu}>
              {t("header.about")}
            </Link>
          </div>

          {/* Men có submenu */}
          <div className="mobile-nav-item">
            <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>
              <span className="label">{t("header.men")}</span>
              <span
                className="arrow-icon"
                onClick={(e) => {
                  e.preventDefault(); // chặn nhảy về "/"
                  e.stopPropagation(); // chặn bubble để không gọi toggleMenu
                  openSubmenu("men");
                }}
              >
                ›
              </span>
            </Link>
          </div>

          <div className="mobile-nav-item">
            <Link to="/women" className="mobile-nav-link" onClick={toggleMenu}>
              <span className="label">{t("header.women")}</span>
              <span
                className="arrow-icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openSubmenu("women");
                }}
              >
                ›
              </span>
            </Link>
          </div>

          {/* Women có submenu */}
          <div className="mobile-nav-item">
            <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>
              <span className="label">{t("header.women")}</span>
              <span
                className="arrow-icon"
                onClick={(e) => {
                  e.preventDefault(); // chặn nhảy về "/"
                  e.stopPropagation(); // chặn bubble để không gọi toggleMenu
                  openSubmenu("women");
                }}
              >
                ›
              </span>
            </Link>
          </div>

          {/* GPS Watch có submenu */}
          <div className="mobile-nav-item">
            <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>
              <span className="label">{t("header.gps")}</span>
              <div
                className="arrow-icon"
                onClick={(e) => {
                  e.preventDefault(); // chặn nhảy về "/"
                  e.stopPropagation(); // chặn bubble để không gọi toggleMenu
                  openSubmenu("gps");
                }}
              >
                <div>›</div>
              </div>
            </Link>
          </div>

          <div className="mobile-nav-item">
            <Link to="/" className="mobile-nav-link" onClick={toggleMenu}>
              {t("header.sale")}
            </Link>
          </div>
        </nav>
        {/* Submenu cho mobile */}
        {activeSubmenu === "men" && (
          <>
            <div className="mobile-submenu">
              <div className="mobile-nav-header">
                <button className="back-btn" onClick={closeSubmenu}>‹</button>
                <span>{t("header.men")}</span>
              </div>
              <nav>
                <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                  {t("header.menRoad")}
                </Link>
                <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                  {t("header.menTrail")}
                </Link>
                <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                  {t("header.menSandals")}
                </Link>
                <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                  {t("header.menHiking")}
                </Link>
              </nav>
            </div>
            <nav>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                {t("header.menRoad")}
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                {t("header.menTrail")}
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                {t("header.menSandals")}
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                {t("header.menHiking")}
              </Link>
            </nav>
          </>
        )}

        {activeSubmenu === "women" && (
          <div className="mobile-submenu">
            <div className="mobile-nav-header">
              <button className="back-btn" onClick={closeSubmenu}>
                ‹
              </button>
              <span>{t("header.women")}</span>
            </div>
            <nav>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                Road Running Shoes
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                Trail Running Shoes
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                Sandals
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                Hiking Shoes
              </Link>
            </nav>
          </div>
        )}

        {activeSubmenu === "gps" && (
          <div className="mobile-submenu">
            <div className="mobile-nav-header">
              <button className="back-btn" onClick={closeSubmenu}>
                ‹
              </button>
              <span>GPS Watch</span>
            </div>
            <nav>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                Garmin
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                Coros
              </Link>
              <Link to="/" className="mobile-nav-link-child" onClick={toggleMenu}>
                Suunto
              </Link>
            </nav>
          </div>
        )}
      </div>



      {
        isMenuOpen &&

        <div className="overlay" onClick={toggleMenu}>
          123123

        </div>
      }

      {/* Mobile search */}
      <div
        className={`md:hidden absolute top-16 right-0 w-2/3 bg-gray-100 border border-gray-300 flex items-center p-2 rounded-l-md shadow-md z-50 overflow-hidden transition-all duration-500 ease-linear ${
          showMobileSearch ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <input
          type="text"
          placeholder={t("header.searchMobilePlaceholder")}
          className="flex-1 outline-none rounded-md px-3 py-2 bg-white text-gray-700"
        />
        <button className="ml-2 text-gray-600 hover:text-orange-500">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>





    </header >
  );
}
