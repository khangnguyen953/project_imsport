import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { product2 as initialProducts } from "../../data/product2";
import ProductAPI from "../../service/ProductAPI";
import CategoryAPI from "../../service/CategoriesAPI";

export default function ProductEditor() {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState(null);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const [categoriesResponse, productsResponse] = await Promise.all([
        CategoryAPI.getCategory(),
        ProductAPI.getProducts()
      ])
      setCategories(categoriesResponse)
      setProducts(productsResponse)
    }
    fetchData()
  }, [])

  const emptyProduct = {
    category_id: "",
    name: "",
    image: "",
    price: "",
    originalPrice: "",
    brand: "",
    isBestSeller: false,
    isGift: false,
    variations: [],
    thumbnail: [""],
    description: "",
  };

  const [formData, setFormData] = useState(emptyProduct);

  const resetForm = () => {
    setFormData(emptyProduct);
    setEditingId(null);
    setFormMode("add");
  };

  const handleEdit = (product) => {
    setFormMode("edit");
    setEditingId(product.id);
    setFormData({
      // id: product.id,
      category_id: product.category_id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice || "",
      brand: product.brand || "",
      isBestSeller: !!product.isBestSeller,
      isGift: !!product.isGift,
      variations: product.variations || [],
      thumbnail: product.thumbnail && product.thumbnail.length ? product.thumbnail : [""],
      description: product.description || "",
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      // id: Number(formData.id),
      category_id: Number(formData.category_id),
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
      thumbnail: (formData.thumbnail || [])
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      description: formData.description || "",
    };

    if (!payload.name || !payload.image || !payload.price) {
      alert("Vui lòng nhập ít nhất tên, ảnh và giá");
      return;
    }

    if (formMode === "add") {
      setProducts((prev)  => [
        ...prev,
        {
          ...payload,
          variations: (payload.variations || []).map((v) => ({
            ...v,
            price: Number(v.price),
            quantity: Number(v.quantity),
          })),
          thumbnail: payload.thumbnail,
          description: payload.description,
        },
      ]);
      payload.createdAt = new Date().toISOString();
      payload.updatedAt = new Date().toISOString();
      const response = await ProductAPI.createProduct(payload);
      console.log("createProduct response", response);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...payload,
                variations: (payload.variations || []).map((v) => ({
                  ...v,
                  price: Number(v.price),
                  quantity: Number(v.quantity),
                })),
                thumbnail: payload.thumbnail,
                description: payload.description,
              }
            : p
        )
      );
      payload.updatedAt = new Date().toISOString();
      console.log("updateProduct editingId", editingId);
      console.log("updateProduct payload", payload);
      const response = await ProductAPI.updateProduct(editingId, payload);
      console.log("updateProduct response", response);
    }
    resetForm();
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "";
    try {
      return Number(price).toLocaleString("vi-VN") + " VNĐ";
    } catch {
      return price;
    }
  };

  const handleVariationChange = (index, field, value) => {
    setFormData((prev) => {
      const next = [...(prev.variations || [])];
      next[index] = {
        ...next[index],
        [field]: field === "price" || field === "quantity" ? value : value,
      };
      return {
        ...prev,
        variations: next,
      };
    });
  };

  const handleAddVariation = () => {
    setFormData((prev) => {
      const existingVariations = prev.variations || [];
      // Tìm ID lớn nhất trong danh sách variations hiện tại
      const maxId = existingVariations.length > 0
        ? Math.max(...existingVariations.map(v => v.id || 0))
        : 0;
      // Tạo ID mới = maxId + 1 để đảm bảo không trùng
      const newId = maxId + 1;
      
      return {
        ...prev,
        variations: [
          ...existingVariations,
          { variation_id: newId, sku: "", size: "", price: "", quantity: "" },
        ],
      };
    });
  };

  const handleRemoveVariation = (index) => {
    setFormData((prev) => ({
      ...prev,
      variations: (prev.variations || []).filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailChange = (index, value) => {
    setFormData((prev) => {
      const next = [...(prev.thumbnail || [])];
      next[index] = value;
      return {
        ...prev,
        thumbnail: next,
      };
    });
  };

  const handleAddThumbnail = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: [...(prev.thumbnail || []), ""],
    }));
  };

  const handleRemoveThumbnail = (index) => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: (prev.thumbnail || []).filter((_, i) => i !== index),
    }));
  };


  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product editor</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Thêm / sửa sản phẩm</h1>
            <p className="mt-2 text-slate-500">
              Trang nội bộ cho phép bạn chỉnh sửa nhanh thông tin sản phẩm dựa trên dữ liệu trong file
              <span className="font-semibold"> product2.js</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,.35)] transition hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Tạo sản phẩm mới
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1.4fr]">
          {/* Bảng sản phẩm */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
            <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-3">Giá</div>
              <div className="col-span-2">Danh mục</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-12 items-center px-6 py-4 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-2">{product.name}</p>
                      <p className="text-xs text-slate-400">ID: {product.id}</p>
                    </div>
                  </div>
                  <div className="col-span-3 font-semibold text-slate-900">
                    {formatPrice(product.price)}
                  </div>
                  <div className="col-span-2 text-sm text-slate-500">{product.category_id}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-2xl border border-slate-200 bg-white p-2 text-rose-500 transition hover:border-rose-200 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-slate-500">
                  Chưa có sản phẩm nào.
                </div>
              )}
            </div>
          </div>

          {/* Form thêm / sửa */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  {formMode === "add" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {formMode === "add" ? "Tạo sản phẩm mới" : `Đang sửa: ID ${editingId}`}
                </h2>
              </div>
              
              {formMode === "edit" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <X size={14} />
                  Huỷ sửa
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                {/* <div className="hidden">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID sản phẩm
                  </label>
                  <input
                    type="number"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    placeholder="Ví dụ: 20"
                    required
                  />
                </div> */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ID danh mục
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {/* <input
                    type="number"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    placeholder="Ví dụ: 3"
                    required
                  /> */}
                </div>
              </div>

              {/* Variations */}
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Biến thể (variations)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600"
                  >
                    <Plus size={14} />
                    Thêm variation
                  </button>
                </div>

                {(!formData.variations || formData.variations.length === 0) && (
                  <p className="text-xs text-slate-400">
                    Chưa có variation nào. Nhấn \"Thêm variation\" để tạo.
                  </p>
                )}

                <div className="space-y-3">
                  {formData.variations?.map((variation, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1.3fr,1fr,1.1fr,1.1fr,auto] items-end gap-2 rounded-2xl bg-white p-3"
                    >
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={variation.sku}
                          onChange={(e) =>
                            handleVariationChange(index, "sku", e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:outline-none"
                          placeholder="P1-M"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Size
                        </label>
                        <input
                          type="text"
                          value={variation.size}
                          onChange={(e) =>
                            handleVariationChange(index, "size", e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:outline-none"
                          placeholder="M, 41..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Giá
                        </label>
                        <input
                          type="number"
                          value={variation.price}
                          onChange={(e) =>
                            handleVariationChange(index, "price", e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:outline-none"
                          placeholder="1850000"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Tồn kho
                        </label>
                        <input
                          type="number"
                          value={variation.quantity}
                          onChange={(e) =>
                            handleVariationChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:outline-none"
                          placeholder="10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(index)}
                        className="mb-1 inline-flex items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-2.5 py-2 text-xs text-rose-500 hover:border-rose-200 hover:bg-rose-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Link ảnh chính
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                  placeholder="https://..."
                  required
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 h-28 w-full rounded-2xl object-cover"
                  />
                )}
              </div>

              {/* Thumbnails list (dynamic) */}
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Danh sách thumbnail
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddThumbnail}
                    className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600"
                  >
                    <Plus size={14} />
                    Thêm thumbnail
                  </button>
                </div>

                {(!formData.thumbnail || formData.thumbnail.length === 0) && (
                  <p className="text-xs text-slate-400">
                    Chưa có thumbnail nào. Nhấn &quot;Thêm thumbnail&quot; để tạo.
                  </p>
                )}

                <div className="space-y-3">
                  {formData.thumbnail?.map((thumb, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-2xl bg-white p-3"
                    >
                      <div className="flex-1">
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Thumbnail {index + 1}
                        </label>
                        <input
                          type="text"
                          value={thumb}
                          onChange={(e) =>
                            handleThumbnailChange(index, e.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-blue-400 focus:outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveThumbnail(index)}
                        className="mt-5 inline-flex items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-2.5 py-2 text-xs text-rose-500 hover:border-rose-200 hover:bg-rose-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    placeholder="Ví dụ: 1850000"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Giá gốc (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    placeholder="Có thể để trống"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    placeholder="Ví dụ: Raidlight"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Best seller
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name="isGift"
                      checked={formData.isGift}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Quà tặng
                  </label>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mô tả (HTML)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none font-mono"
                  placeholder="<div>...</div>"
                />
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Lưu ý: Trang này chỉ cập nhật dữ liệu trên giao diện. Để lưu vĩnh viễn, bạn cần copy dữ
                  liệu sinh ra và chỉnh lại trong file <span className="font-semibold">product2.js</span>.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                >
                  <Save size={16} />
                  {formMode === "add" ? "Thêm sản phẩm" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
