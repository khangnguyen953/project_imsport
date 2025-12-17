import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft } from "lucide-react";
import CategoryAPI from "../../service/CategoriesAPI";
import CategoryTypeAPI from "../../service/CategoryTypeAPI";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categories_type_id: "",
    translations: {
      vi: {
        name: "",
      },
      en: {
        name: "",
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const categoryTypeMap = useMemo(() => {
    const map = {};
    categoryTypes.forEach((t) => {
      map[t.id] = t.translations.vi?.name;
    });
    return map;
  }, [categoryTypes]);
  useEffect(() => {
    const fetchData = async () => {
      const [categoryRes, typeRes] = await Promise.all([
        CategoryAPI.getCategory(),
        CategoryTypeAPI.getCategoryType(),
      ]);
      setCategories(categoryRes);
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
      categories_type_id: categoryTypes[0]?.id || "",
      translations: {
        vi: {
          name: "",
        },
        en: {
          name: "",
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
      categories_type_id: category.categories_type_id || "",
      translations: {
        vi: {
          name: category.translations?.vi?.name || category.name || "",
        },
        en: {
          name: category.translations?.en?.name || "",
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
          await CategoryAPI.deleteCategory(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
          if (editingId === id) resetForm();
          Swal.fire({
            title: "Thành công",
            text: "Danh mục đã được xoá",
            icon: "success",
            confirmButtonText: "OK",
          });
        }
      });
    } catch (error) {
      console.error("Delete category error", error);
      Swal.fire({
        title: "Lỗi",
        text: "Xoá danh mục thất bại",
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
        id: Math.max(...categories.map(c => c.id)) + 1,
      };
      console.log("payload", payload);
      if (formMode === "add") {
        console.log("ADD");
        
        const created = await CategoryAPI.createCategory(payload);
        setCategories((prev) => [...prev, created]);
        Swal.fire({
          title: "Thành công",
          text: "Danh mục đã được tạo",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        const updated = await CategoryAPI.updateCategory(editingId, payload);
        console.log("updated", updated);
        
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? updated.item : c))
        );
        Swal.fire({
          title: "Thành công",
          text: "Danh mục đã được cập nhật",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
      resetForm();
    } catch (error) {
      console.error("Save category error", error);
      alert("Lưu danh mục thất bại");
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
                Category manager
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Quản lí danh mục
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
              Tạo danh mục mới
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
            <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="col-span-5">Tên danh mục</div>
              <div className="col-span-3">Slug</div>
              <div className="col-span-2">Loại</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center px-6 py-4 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <div className="col-span-5">
                    <p className="font-semibold text-slate-900">
                      {category.translations?.vi?.name || category.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {category.translations?.en?.name && (
                        <span className="text-slate-500">{category.translations.en.name} • </span>
                      )}
                      ID: {category.id}
                    </p>
                  </div>
                  <div className="col-span-3 font-semibold text-slate-900">
                    {category.slug}
                  </div>
                  <div className="col-span-2 text-sm text-slate-500">
                    {categoryTypeMap[category.categories_type_id] || category.categories_type_id}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category.id)}
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
                  {formMode === "add" ? "Danh mục mới" : `Sửa danh mục #${editingId}`}
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
                  Tên danh mục (Tiếng Việt)
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
                  Tên danh mục (Tiếng Anh)
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

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Loại danh mục
                </label>
                <select
                  name="categories_type_id"
                  value={formData.categories_type_id}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                  required
                >
                  {categoryTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.translations.vi?.name || type.name || type.type || `Loại ${type.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,.35)] transition hover:-translate-y-0.5 disabled:opacity-70"
              >
                <Save size={18} />
                {formMode === "add" ? "Lưu danh mục" : "Cập nhật"}
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