import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft } from "lucide-react";
import CategoryAPI from "../../service/CategoriesAPI";
import CategoryTypeAPI from "../../service/CategoryTypeAPI";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
export default function CategoryTypeManager() {
  const navigate = useNavigate();
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    translations: {
      vi: {
        name: "",
        description: "",
      },
      en: {
        name: "",
        description: "",
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { user } = useCart();
  const language = i18n.language;
 
  useEffect(() => {
      if(!user?.role == 'ROLE_ADMIN') {
        navigate('/')
        return;
      }
    const fetchData = async () => {
      const [typeRes] = await Promise.all([
        CategoryTypeAPI.getCategoryType(),
      ]);
      setCategoryTypes(typeRes);
      console.log("categoryTypes", typeRes);
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setFormMode("add");
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      translations: {
        vi: {
          name: "",
          description: "",
        },
        en: {
          name: "",
          description: "",
        },
      },
    });
  };

  const handleEdit = (category) => {
    setFormMode("edit");
    setEditingId(category.id);
    setFormData({
      name: category.name || category.translations?.vi?.name || "",
      slug: category.slug || "",
      translations: {
        vi: {
          name: category.translations?.vi?.name || category.name || "",
          description: category.translations?.vi?.description || "",
        },
        en: {
          name: category.translations?.en?.name || "",
          description: category.translations?.en?.description || "",
        },
      },
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      Swal.fire({
        title: "Bạn có chắc muốn xoá danh mục này?",
        text: "Bạn sẽ không thể khôi phục lại sau khi xoá!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có",
        cancelButtonText: "Không"
      }).then(async (result) => {
        if (result.isConfirmed) {
          await CategoryTypeAPI.deleteCategoryType(id);
          setCategoryTypes((prev) => prev.filter((c) => c.id !== id));
          if (editingId === id) resetForm();
          Swal.fire({
            title: "Thành công",
            text: "Loại danh mục đã được xoá",
            icon: "success",
            confirmButtonText: "OK",
          });
        }
      });
    } catch (error) {
      console.error("Delete category type error", error);
      Swal.fire({
        title: "Lỗi",
        text: "Xoá loại danh mục thất bại",
        icon: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Đảm bảo name được sync từ translations.vi.name
      const payload = {
        ...formData,
        name: formData.translations.vi.name || formData.name,
        id: Math.max(...categoryTypes.map(c => c.id)) + 1,
      };
      console.log("payload", payload);
      if (formMode === "add") {
        console.log("ADD");
        
        const created = await CategoryTypeAPI.createCategoryType(payload);
        console.log("created", created);
        
        setCategoryTypes((prev) => [...prev, created.item]);
        Swal.fire({
          title: "Thành công",
          text: "Loại danh mục đã được tạo",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        const updated = await CategoryTypeAPI.updateCategoryType(editingId, payload);
        console.log("updated", updated);
        
        setCategoryTypes((prev) =>
          prev.map((c) => (c.id === editingId ? updated.item : c))
        );
        Swal.fire({
          title: "Thành công",
          text: "Loại danh mục đã được cập nhật",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
      resetForm();
    } catch (error) {
      console.error("Save category type error", error);
      alert("Lưu loại danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeVi = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        vi: {
          ...prev.translations.vi,
          [name]: value,
        },
      },
    }));
  };

  const handleChangeEn = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        en: {
          ...prev.translations.en,
          [name]: value,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Header */}
        <Link
              to="/admin"
              className="flex items-center w-fit gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Quay về admin
            </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Category type manager
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Quản lí loại danh mục
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            {formMode === "edit" && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={16} />
                Huỷ chỉnh sửa
              </button>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,.35)] transition hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Tạo loại danh mục mới
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
            <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="col-span-5">Tên loại danh mục</div>
              <div className="col-span-3">Slug</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {categoryTypes.map((categoryType, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center px-6 py-4 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <div className="col-span-5">
                    <p className="font-semibold text-slate-900">
                      {categoryType?.translations?.vi?.name || categoryType?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {categoryType?.translations?.en?.name && (
                        <span className="text-slate-500">{categoryType.translations.en.name} • </span>
                      )}
                      ID: {categoryType?.id}
                    </p>
                  </div>
                  <div className="col-span-3 font-semibold text-slate-900">
                    {categoryType?.slug}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(categoryType)}
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(categoryType?.id)}
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-rose-500 transition hover:border-rose-200 hover:text-rose-600"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {formMode === "add" ? "Thêm mới" : "Chỉnh sửa"}
                </p>
                <h2 className="text-xl font-bold text-slate-900">
                  {formMode === "add" ? "Loại danh mục mới" : `Sửa loại danh mục #${editingId}`}
                </h2>
              </div>
              {formMode === "edit" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={16} />
                  Reset
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Tên loại danh mục (Tiếng Việt)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.translations.vi.name}
                  onChange={handleChangeVi}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                  placeholder="Ví dụ: Giày Chạy Bộ Nam"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Tên loại danh mục (Tiếng Anh)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.translations.en.name}
                  onChange={handleChangeEn}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                  placeholder="Example: Men's Running Shoes"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                  placeholder="giay-chay-bo-nam"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,.35)] transition hover:-translate-y-0.5 disabled:opacity-70"
              >
                <Save size={18} />
                {formMode === "add" ? "Lưu loại danh mục" : "Cập nhật"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} />
                Làm mới
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}