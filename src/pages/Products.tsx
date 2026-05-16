import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Tag,
  Star,
  X,
  Check,
} from "lucide-react";
import { Product } from "../types";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "@/api/product";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 9;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

const categoryColors: Record<string, string> = {
  Food: "bg-green-50 text-green-600",
  Lifestyle: "bg-blue-50 text-blue-600",
  Beauty: "bg-pink-50 text-pink-600",
  Default: "bg-slate-50 text-slate-600",
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [_, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);

  const [open, setOpen] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    product_name: "",
    price_normal: "",
    discount: "",
    product_category: "Food",
    start_date: "",
    end_date: "",
    stock: "",
    point: "",
    product_description: "",
    is_available: true,
    is_featured: false,
  });

  const fetchProducts = async (page = pagination.currentPage) => {
    try {
      setLoading(true);
      const result = await getProducts(page, PAGE_SIZE);
      setProducts(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts(1);
  }, []);

  const categories = [
    "ALL",
    ...Array.from(new Set(products.map((p) => p.product_category))),
  ];

  const filtered = products.filter(
    (p) =>
      (filterCat === "ALL" || p.product_category === filterCat) &&
      p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm({
      product_name: "",
      price_normal: "",
      discount: "",
      product_category: "Food",
      start_date: "",
      end_date: "",
      point: "",
      stock: "",
      is_available: true,
      is_featured: false,
      product_description: "",
    });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);

    setExistingImages(p.ImagePromo || []);
    setDeletedImages([]);
    setImages([]);

    setForm({
      product_name: p.product_name,
      price_normal: String(p.price_normal),
      discount: String(p.discount),
      product_category: p.product_category,
      start_date: p.start_date,
      end_date: p.end_date,
      stock: String(p.stock),
      is_available: p.is_available,
      is_featured: p.is_featured,
      product_description: p.product_description,
      point: String(p.point),
    });

    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        product_name: form.product_name,
        price_normal: form.price_normal,
        discount: form.discount,
        product_category: form.product_category,
        product_description: form.product_description,
        point: form.point,
        start_date: form.start_date,
        end_date: form.end_date,
        stock: form.stock,
        is_available: form.is_available,
        is_featured: form.is_featured,
      };

      if (editProduct) {
        await updateProduct(editProduct.id, payload, images, deletedImages);
      } else {
        await createProduct(payload, images);
      }

      await fetchProducts(editProduct ? pagination.currentPage : 1);
      setShowModal(false);
      setImages([]);
      setExistingImages([]);
      setDeletedImages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      await fetchProducts(
        products.length === 1
          ? Math.max(pagination.currentPage - 1, 1)
          : pagination.currentPage
      );
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const discountedPrice = (p: Product) =>
    p.price_normal * (1 - p.discount / 100);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
            />
          </div>
          <div className="relative w-56">
            {/* Dropdown Button */}
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <span className="text-sm text-slate-700 font-medium">
                {filterCat || "All Categories"}
              </span>

              <svg
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {/* List categories */}
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCat(cat);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition ${
                      filterCat === cat
                        ? "bg-orange-50 text-orange-600 font-medium"
                        : "text-slate-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-orange-500/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: pagination.totalItems },
          {
            label: "Available",
            value: products.filter((p) => p.is_available).length,
          },
          {
            label: "Featured",
            value: products.filter((p) => p.is_featured).length,
          },
          {
            label: "Out of Stock",
            value: products.filter((p) => p.stock === 0).length,
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center"
          >
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image placeholder */}
            <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              {p.ImagePromo && p.ImagePromo.length > 0 ? (
                <img
                  src={`${BASE_URL}/uploads/${p.ImagePromo[0].image_url}`}
                  alt={p.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-14 h-14 text-slate-300" />
              )}

              {/* Badge Featured */}
              {p.is_featured && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3 h-3" />
                  Featured
                </div>
              )}

              {/* Out of stock */}
              {!p.is_available && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                  Out of Stock
                </div>
              )}

              {/* Discount */}
              {p.discount > 0 && (
                <div className="absolute bottom-3 right-3 bg-orange-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                  -{p.discount}%
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-800 text-sm leading-tight">
                  {p.product_name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    categoryColors[p.product_category] || categoryColors.Default
                  }`}
                >
                  {p.product_category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                {p.product_description}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-orange-600">
                  {formatCurrency(discountedPrice(p))}
                </span>
                {p.discount > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(p.price_normal)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Stock:{" "}
                  <span className="font-semibold text-slate-700">
                    {p.stock}
                  </span>
                </div>
                <span>
                  {formatDate(p.start_date)} → {formatDate(p.end_date)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No products found</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Pagination
          meta={pagination}
          itemLabel="products"
          onPageChange={fetchProducts}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800">
                {editProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Product Name", key: "product_name", col: 2 },
                  { label: "Normal Price", key: "price_normal", col: 1 },
                  { label: "Discount (%)", key: "discount", col: 1 },
                  { label: "Stock", key: "stock", col: 1 },
                  { label: "Category", key: "product_category", col: 1 },
                  { label: "Start Date", key: "start_date", col: 1 },
                  { label: "End Date", key: "end_date", col: 1 },
                ].map((f) => (
                  <div key={f.key} className={f.col === 2 ? "col-span-2" : ""}>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      {f.label}
                    </label>
                    <input
                      type={
                        ["price_normal", "discount", "stock"].includes(f.key)
                          ? "number"
                          : ["start_date", "end_date"].includes(f.key)
                          ? "date"
                          : "text"
                      }
                      value={(form as any)[f.key]}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Point
                </label>
                <input
                  type="number"
                  value={form.point}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, point: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                />
              </div>
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Current Images</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={`${BASE_URL}/uploads/${img.image_url}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setDeletedImages((prev) => [...prev, img.id]);
                            setExistingImages((prev) =>
                              prev.filter((i) => i.id !== img.id)
                            );
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Product Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setImages(Array.from(e.target.files));
                    }
                  }}
                  className="w-full text-sm"
                />
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(img)}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.product_description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      product_description: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 resize-none"
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_available: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-slate-700">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_featured: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-slate-700">Featured</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
