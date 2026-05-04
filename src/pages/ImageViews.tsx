import React, { useEffect, useState } from "react";
import { Image, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import {
  createImageView,
  deleteImageView,
  getBanners,
  updateImageView,
} from "@/api/banner";

const bgColors = [
  "from-orange-400 to-red-500",
  "from-blue-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-pink-400 to-rose-500",
];

const BASE_URL = import.meta.env.VITE_API_URL;

const ImageViews: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [_, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editImage, setEditImage] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState({ title: "", sub_title: "" });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      setImages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditImage(null);
    setForm({ title: "", sub_title: "" });
    setFile(null);
    setPreview(null);
    setShowModal(true);
  };

  const openEdit = (img: any) => {
    setEditImage(img);
    setForm({ title: img.title, sub_title: img.sub_title });
    setPreview(`${BASE_URL}/uploads/${img.image_url}`);
    setFile(null);
    setShowModal(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    try {
      if (editImage) {
        await updateImageView(editImage.id, form, file || undefined);
      } else {
        if (!file) return alert("Image wajib diisi");
        await createImageView(form, file);
      }

      await fetchData();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    await deleteImageView(deleteId);
    setDeleteId(null);
    fetchData();
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm text-center">
            <p className="text-xl font-bold text-slate-800">{images.length}</p>
            <p className="text-xs text-slate-500">Total Banners</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-orange-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Image View
        </button>
      </div>

      {/* Image Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((img, idx) => {
          const imageUrl = img.image_url
            ? `${BASE_URL}/uploads/${img.image_url}`
            : null;

          return (
            <div
              key={img.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Banner */}
              <div className="h-44 relative overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={img.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${
                      bgColors[idx % bgColors.length]
                    }`}
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                {!imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Image className="w-24 h-24 text-white" />
                  </div>
                )}
                <div className="relative z-10 text-center px-4">
                  <p className="text-white font-bold text-lg drop-shadow-md">
                    {img.title}
                  </p>
                  <p className="text-white/90 text-xs mt-1 drop-shadow-sm">
                    {img.sub_title}
                  </p>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-0.5">
                  <p className="text-white text-xs font-medium">
                    Banner #{idx + 1}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  {img.title}
                </h4>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {img.sub_title}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(img)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(img.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Upload CTA */}
        <button
          onClick={openCreate}
          className="h-auto min-h-[280px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-500 group-hover:text-orange-600 transition-colors">
              Add New Banner
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Upload promotional image
            </p>
          </div>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                {editImage ? "Edit Banner" : "Add Banner"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Redeem Point"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Sub Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Point bisa di tukar"
                  value={form.sub_title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sub_title: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Image File
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  id="upload-image"
                  onChange={handleFile}
                />
                <label
                  htmlFor="upload-image"
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-orange-300 transition-colors cursor-pointer block"
                >
                  {!preview ? (
                    <>
                      <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">
                        Click to upload image
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  ) : (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                          setPreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
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
                {editImage ? "Save Changes" : "Add Banner"}
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
            <h3 className="font-bold text-slate-800 mb-2">Delete Banner?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will remove the banner from the app.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete()}
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

export default ImageViews;
