import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { product2 as initialProducts } from "../../data/product2";
import ProductAPI from "../../service/ProductAPI";
import CategoryAPI from "../../service/CategoriesAPI";
import { Link } from "react-router-dom";
import UploadAPI from "../../service/UploadAPI";
const IMAGE_EXTENSION = ".jpg";
const CLOUD_FRONT_URL = "https://d1qcfqyg1kloza.cloudfront.net";
const CLOUD_FRONT_URL_THUMBNAIL = "https://d8xkktdpkwrmf.cloudfront.net";
export default function ProductEditor() {
  const [products, setProducts] = useState();
  const [editingId, setEditingId] = useState(null);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [thumbnailFiles, setThumbnailFiles] = useState([]); // Mảng các File object
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]); // Mảng các URL preview
  const [isUploadingThumbnails, setIsUploadingThumbnails] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      const [categoriesResponse, productsResponse] = await Promise.all([
        CategoryAPI.getCategory(),
        ProductAPI.getProducts()
      ])
      setCategories(categoriesResponse.sort((a, b) => a.id - b.id))
      setProducts(productsResponse)
    }
    fetchData()
  }, [])

  const emptyProduct = {
    category_id: categories[0]?.id || 1,
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
    translations: {
      vi: {
        name: "",
        description: "",
        highlights: "",
      },
      en: {
        name: "",
        description: "",
        highlights: "",
      }
    }
  };

  const [formData, setFormData] = useState(emptyProduct);

  const resetForm = () => {
    setFormData(emptyProduct);
    setEditingId(null);
    setFormMode("add");
    setImageFile(null);
    setImagePreview("");
    setThumbnailFiles([]);
    setThumbnailPreviews([]);
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
      translations: {
        vi: {
          name: product.translations.vi.name,
          description: product.translations.vi.description,
          highlights: product.translations.vi.highlights,
        },
        en: {
          name: product.translations.en.name,
          description: product.translations.en.description,
          highlights: product.translations.en.highlights,
        }
      }
    });
    setImageFile(null);
    setImagePreview(product.image || "");
    setThumbnailFiles([]);
    setThumbnailPreviews([]); // Chỉ lưu preview cho file mới, URL cũ sẽ hiển thị từ formData.thumbnail
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Xoá URL cũ để chắc chắn dùng URL mới sau khi upload
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Bạn có chắc muốn xoá sản phẩm này?",
      text: "Bạn sẽ không thể khôi phục lại sau khi xoá!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await ProductAPI.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (editingId === id) resetForm();
      }
      Swal.fire({
        title: "Thành công",
        text: "Sản phẩm đã được xoá",
        icon: "success",
        confirmButtonText: "OK",
      });
    }).catch(err => {
      Swal.fire({
        title: "Lỗi",
        text: "Xoá sản phẩm thất bại",
        icon: "error",
        confirmButtonText: "OK",
      });
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangeVi = (e) => {
    const { name, value } = e.target;
  
    setFormData(prev => ({
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
  
    setFormData(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formData", formData);

    // 1. Nếu người dùng đã chọn file ảnh, gọi Lambda để lấy presigned URL và upload ảnh
    let finalImageUrl = formData.image;
    if (imageFile) {
      try {
        setIsUploadingImage(true);
        // Gửi thông tin file lên Lambda/API để lấy presigned URL
        const { uploadUrl, fileUrl, key } = await UploadAPI.getPresignedUrl(
          imageFile.name,
          imageFile.type
        );
        console.log("uploadUrl", uploadUrl);
        console.log("fileUrl", fileUrl);
        console.log("key", key);
        // Upload file trực tiếp lên S3 bằng presigned URL
        await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": imageFile.type,
          },
          body: imageFile,
        });

        finalImageUrl = CLOUD_FRONT_URL + "/resized-" + key.split(".")[0] + IMAGE_EXTENSION;
        console.log("finalImageUrl", finalImageUrl);
      } catch (error) {
        console.error("Upload image error", error);
        Swal.fire({
          title: "Lỗi",
          text: "Upload ảnh thất bại, vui lòng thử lại",
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    // 2. Upload tất cả thumbnail files nếu có
    let finalImageGridUrls = [];
    let finalThumbnailUrls = formData.thumbnail || [];
    if (thumbnailFiles.length > 0) {
      try {
        setIsUploadingThumbnails(true);
        const uploadPromises = thumbnailFiles.map(async (file) => {
          const { uploadUrl, fileUrl, key } = await UploadAPI.getPresignedUrl(
            file.name,
            file.type
          );
          
          // Upload file trực tiếp lên S3
          await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });
          finalImageGridUrls.push(CLOUD_FRONT_URL_THUMBNAIL + "/{indexSize}x{indexSize}/resized-" + key.split(".")[0] + IMAGE_EXTENSION);

          return CLOUD_FRONT_URL + "/resized-" + key.split(".")[0] + IMAGE_EXTENSION;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Kết hợp với các URL thumbnail cũ (nếu có) và các URL mới
        const existingUrls = finalThumbnailUrls.filter(url => url && url.trim().length > 0);
        finalThumbnailUrls = [...existingUrls, ...uploadedUrls];
        
        console.log("finalThumbnailUrls", finalThumbnailUrls);
      } catch (error) {
        console.error("Upload thumbnails error", error);
        Swal.fire({
          title: "Lỗi",
          text: "Upload thumbnail thất bại, vui lòng thử lại",
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsUploadingThumbnails(false);
        return;
      } finally {
        setIsUploadingThumbnails(false);
      }
    }

    const payload = {
      ...formData,
      image: finalImageUrl,
      // id: Number(formData.id),
      category_id: Number(formData.category_id),
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
      thumbnail: finalThumbnailUrls.filter((t) => t && t.trim().length > 0),
      description: formData.description || "",
      image_grid: finalImageGridUrls,
    };
    console.log("payload", payload);
    if (!payload.image || !payload.price || !payload.translations.vi.name || !payload.translations.en.name) {
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
          image: imagePreview,
          // description: payload.description,
          // translations: {
          //   vi: {
          //     name: formData.name,
          //     description: formData.description || "",
          //   },
          //   en: {
          //     name: formData.name_en || "",
          //     description: formData.description_en || "",
          //   }
          // }
        },
      ]);
      payload.id = Math.max(...products.map(p => p.id)) + 1;
      payload.createdAt = new Date().toISOString();
      payload.updatedAt = new Date().toISOString();
      console.log("createProduct payload", payload);
      const response = await ProductAPI.createProduct(payload);
      console.log("createProduct response", response);
      Swal.fire({
        title: "Thành công",
        text: "Sản phẩm đã được tạo",
        icon: "success",
        confirmButtonText: "OK",
      });
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
                image: imagePreview,
              }
            : p
        )
      );
      payload.updatedAt = new Date().toISOString();
      console.log("updateProduct editingId", editingId);
      console.log("updateProduct payload", payload);
      const response = await ProductAPI.updateProduct(editingId, payload);
      console.log("updateProduct response", response);
      Swal.fire({
        title: "Thành công",
        text: "Sản phẩm đã được cập nhật",
        icon: "success",
        confirmButtonText: "OK",
      });
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

  const handleThumbnailChange = (index, file) => {
    if (!file) return;
    
    const newFiles = [...thumbnailFiles];
    const newPreviews = [...thumbnailPreviews];
    
    // Nếu đang thay thế file tại index này
    if (index < newFiles.length) {
      newFiles[index] = file;
      // Tạo preview mới
      const previewUrl = URL.createObjectURL(file);
      // Revoke URL cũ nếu có
      if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews[index]);
      }
      newPreviews[index] = previewUrl;
    } else {
      // Thêm file mới
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    
    setThumbnailFiles(newFiles);
    setThumbnailPreviews(newPreviews);
    
    // Xoá URL cũ trong formData nếu có
    setFormData((prev) => {
      const next = [...(prev.thumbnail || [])];
      if (index < next.length) {
        next[index] = "";
      } else {
        next.push("");
      }
      return {
        ...prev,
        thumbnail: next,
      };
    });
  };

  const handleAddThumbnail = () => {
    // Tạo một input file ẩn để trigger với multiple
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleMultipleThumbnailsChange(files);
      }
    };
    input.click();
  };

  const handleMultipleThumbnailsChange = (files) => {
    if (!files || files.length === 0) return;
    
    const newFiles = [...thumbnailFiles];
    const newPreviews = [...thumbnailPreviews];
    
    // Thêm tất cả các file mới vào mảng
    files.forEach((file) => {
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });
    
    setThumbnailFiles(newFiles);
    setThumbnailPreviews(newPreviews);
    
    // Cập nhật formData với các placeholder rỗng
    setFormData((prev) => {
      const next = [...(prev.thumbnail || [])];
      files.forEach(() => {
        next.push("");
      });
      return {
        ...prev,
        thumbnail: next,
      };
    });
  };

  const handleRemoveThumbnail = (index) => {
    // Revoke preview URL nếu là blob URL
    if (thumbnailPreviews[index] && thumbnailPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreviews[index]);
    }
    
    // Xoá file và preview
    const newFiles = thumbnailFiles.filter((_, i) => i !== index);
    const newPreviews = thumbnailPreviews.filter((_, i) => i !== index);
    
    setThumbnailFiles(newFiles);
    setThumbnailPreviews(newPreviews);
    
    // Xoá URL trong formData
    setFormData((prev) => ({
      ...prev,
      thumbnail: (prev.thumbnail || []).filter((_, i) => i !== index),
    }));
  };


  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Header */}
        <Link
              to="/admin"
              className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Quay về 
            </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           
          <div className="flex items-center gap-3">
           
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product editor</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Thêm / sửa sản phẩm</h1>
            </div>
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
              {products?.map((product, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center px-6 py-4 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.translations.vi.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-2">{product.translations.vi.name}</p>
                      <p className="text-xs text-slate-400">ID: {product.id}</p>
                    </div>
                  </div>
                  <div className="col-span-3 font-semibold text-slate-900">
                    {formatPrice(product.price)}
                  </div>
                  <div className="col-span-2 text-sm text-slate-500">{categories.find(category => category.id === product.category_id)?.name}</div>
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
              {products?.length === 0 && (
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tên sản phẩm (VI)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.translations.vi.name}
                    onChange={handleChangeVi}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    placeholder="Nhập tên sản phẩm (tiếng Việt)"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Product name (EN)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.translations.en.name}
                    onChange={handleChangeEn}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                    placeholder="Enter product name (English)"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ảnh sản phẩm (upload)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-800 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                  required={formMode === "add"}
                />
                {(imagePreview || formData.image) && (
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="mt-2  w-60 h-60 self-center rounded-2xl object-cover"
                  />
                )}
              </div>

              {/* Thumbnails list (dynamic) */}
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Danh sách thumbnail (upload)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddThumbnail}
                    className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600"
                  >
                    <Plus size={14} />
                    Thêm thumbnail (nhiều file)
                  </button>
                </div>

                {(thumbnailFiles.length === 0 && (!formData.thumbnail || formData.thumbnail.length === 0)) && (
                  <p className="text-xs text-slate-400 mb-3">
                    Chưa có thumbnail nào. Nhấn &quot;Thêm thumbnail&quot; để chọn nhiều file cùng lúc.
                  </p>
                )}

                {/* Input để chọn nhiều file cùng lúc - luôn hiển thị để có thể thêm file mới */}
                <div className="mb-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        handleMultipleThumbnailsChange(files);
                        // Reset input để có thể chọn lại cùng file
                        e.target.value = '';
                      }
                    }}
                    className="block w-full text-sm text-slate-800 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                  />
                </div>

                <div className="space-y-3">
                  {/* Hiển thị các thumbnail đã upload (file mới) */}
                  {thumbnailFiles.map((file, index) => (
                    <div
                      key={`file-${index}`}
                      className="flex items-start gap-2 rounded-2xl bg-white p-3"
                    >
                      <div className="flex-1">
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Thumbnail mới {index + 1} - {file.name}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const newFile = e.target.files?.[0];
                            if (newFile) {
                              handleThumbnailChange(index, newFile);
                            }
                          }}
                          className="block w-full text-sm text-slate-800 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                        />
                        {thumbnailPreviews[index] && (
                          <img
                            src={thumbnailPreviews[index]}
                            alt={`Thumbnail ${index + 1} preview`}
                            className="mt-2 w-32 h-32 rounded-2xl object-cover"
                          />
                        )}
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
                  
                  {/* Hiển thị các thumbnail URL cũ (nếu đang edit và có URL cũ) */}
                  {formData.thumbnail?.map((thumb, index) => {
                    // Chỉ hiển thị URL cũ nếu URL không rỗng
                    if (thumb && thumb.trim().length > 0) {
                      return (
                        <div
                          key={`url-${index}`}
                          className="flex items-start gap-2 rounded-2xl bg-white p-3"
                        >
                          <div className="flex-1">
                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Thumbnail hiện tại {index + 1}
                            </label>
                            <div className="text-xs text-slate-600 mb-2 break-all line-clamp-2">{thumb}</div>
                            <img
                              src={thumb}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-32 h-32 rounded-2xl object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                thumbnail: (prev.thumbnail || []).filter((_, i) => i !== index),
                              }));
                            }}
                            className="mt-5 inline-flex items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 px-2.5 py-2 text-xs text-rose-500 hover:border-rose-200 hover:bg-rose-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
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
                    Đặc điểm nổi bật (VI)
                  </label>
                  <textarea
                    name="highlights"
                    value={formData.translations.vi.highlights}
                    onChange={handleChangeVi}
                    rows={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none font-mono"
                    placeholder=""
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Đặc điểm nổi bật (EN)
                  </label>
                  <textarea
                    name="highlights"
                    value={formData.translations.en.highlights}
                    onChange={handleChangeEn}
                    rows={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none font-mono"
                    placeholder=""
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
              {/* Description (VI / EN) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mô tả (HTML - VI)
                  </label>
                  <textarea
                    name="description"
                    value={formData.translations.vi.description}
                    onChange={handleChangeVi}
                    rows={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none font-mono"
                    placeholder="<div>...</div>"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description (HTML - EN)
                  </label>
                  <textarea
                    name="description"
                    value={formData.translations.en.description}
                    onChange={handleChangeEn}
                    rows={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none font-mono"
                    placeholder="<div>...</div>"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
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