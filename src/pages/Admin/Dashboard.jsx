import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Filter,
  LayoutDashboard,
  FolderTree,
} from "lucide-react";
import ProductAPI from "../../service/ProductAPI";
import CategoryAPI from "../../service/CategoriesAPI";
import { Link, useLocation } from "react-router-dom";


const summaryCards = [
  {
    label: "Tổng sản phẩm",
    value: "248",
    change: "+12% so với tháng trước",
    icon: Package,
    accent: "from-blue-500/10 to-blue-500/5 border-blue-200",
  },
  {
    label: "Sản phẩm sắp hết",
    value: "18",
    change: "Cần nhập kho",
    icon: AlertTriangle,
    accent: "from-amber-500/10 to-amber-500/5 border-amber-200",
  },
  {
    label: "Doanh thu tháng",
    value: "1.24 tỷ ₫",
    change: "+8.4% tăng trưởng",
    icon: TrendingUp,
    accent: "from-emerald-500/10 to-emerald-500/5 border-emerald-200",
  },
  {
    label: "Sản phẩm chờ duyệt",
    value: "6",
    change: "Cần kiểm tra nội dung",
    icon: Sparkles,
    accent: "from-purple-500/10 to-purple-500/5 border-purple-200",
  },
];



export default function Dashboard() {
    const location = useLocation();
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    useEffect(() => {
        const fetchProducts = async () => {
            const response = await ProductAPI.getProducts()
            setProducts(response)
            const categoriesResponse = await CategoryAPI.getCategory()
            setCategories(categoriesResponse)
        }
        fetchProducts()
    }, [])
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', '')
        .replace(/\s/g, '')         // xóa toàn bộ khoảng trắng bình thường
        .replace(/\u00A0/g, '')  + ' VNĐ';
    }
    const handleDelete = async (id) => {
      Swal.fire({
        title: "Bạn có chắc muốn xoá sản phẩm này?",
        text: "Bạn sẽ không thể khôi phục lại sau khi xoá!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có",
        cancelButtonText: "Không"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await ProductAPI.deleteProduct(id)
          console.log("response", response)
          if (response) {
            setProducts(products.filter(product => product.id !== id))
            Swal.fire({
              title: "Đã xoá!",
              text: "Sản phẩm đã được xoá.",
              icon: "success"
            });
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Không thể xoá sản phẩm.",
              icon: "error"
            });
          }
        }
      });
    }
  const menuItems = [
    {
      label: "Tổng quan",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Quản lí sản phẩm",
      path: "/admin/products",
      icon: Package,
    },
    {
      label: "Quản lí category",
      path: "/admin/categories",
      icon: FolderTree,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white shadow-lg">
          <div className="flex h-full flex-col">
            {/* Logo/Header */}
            <div className="border-b border-slate-200 p-6">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 p-2">
                  <LayoutDashboard size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Admin Panel</h2>
                  <p className="text-xs text-slate-500">Quản trị hệ thống</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                <span>← Quay về trang chủ</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="ml-64 flex-1 px-6 py-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Control center</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Quản lí sản phẩm</h1>
            
          </div>

          
        </div>

        {/* Summary Cards */}
        

        {/* Filter + Search */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, SKU..."
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none">
                <option>Tất cả danh mục</option>
                <option>Áo</option>
                <option>Quần</option>
                <option>Giày</option>
                <option>Phụ kiện</option>
              </select>
              <Link to="/admin/products" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,.35)] transition hover:-translate-y-0.5">
                <Plus size={18} />
                Quản lí sản phẩm
            </Link>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
          <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <div className="col-span-4">Sản phẩm</div>
            <div className="col-span-2">Danh mục</div>
            <div className="col-span-2">Giá</div>
            <div className="col-span-2">Tồn kho</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>
          <div className="divide-y divide-slate-100">
            {products.map((product) => {

                return(
              <div
                key={product.id}
                className="grid grid-cols-12 items-center px-6 py-5 text-sm text-slate-600 transition hover:bg-slate-50"
              >
                <div className="col-span-4 px-2 flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                  </div>
                </div>
                <div className="col-span-2 font-medium text-slate-600">{categories.find(category => category.id === product.category_id)?.name}</div>
                <div className="col-span-2 font-semibold text-slate-900">{formatPrice(product.price)}</div>
                <div className="col-span-2 text-slate-500">
                  <ul className="text-sm font-bold text-slate-900">
                    {product.variations.map(variation => (
                      <li key={variation.id}>{variation.size} : {variation.quantity}</li>
                    ))}
                    </ul>
                  
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  {/* <Link to={`/admin/products/${product.id}`} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600">
                    <Pencil size={16} />
                  </Link> */}
                  <button onClick={() => handleDelete(product.id)} className="rounded-2xl border border-slate-200 bg-white p-2 text-rose-500 transition hover:border-rose-200 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}