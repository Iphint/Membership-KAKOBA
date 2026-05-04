import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Clock,
  CheckCircle,
  Search,
} from "lucide-react";
import { Event, ImageEvent } from "../types";
import { createEvent, deleteEvent, getEvents, updateEvent } from "@/api/event";

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [_, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "UPCOMING" | "PAST">(
    "ALL"
  );
  const [openDropdown, setOpenDropdown] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState({
    event_name: "",
    event_date: "",
    location: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [oldImages, setOldImages] = useState<ImageEvent[]>([]);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = events.filter((event) => {
    const matchSearch =
      event.event_name.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    const eventDate = new Date(event.event_date);
    const now = new Date();
    const isUpcoming = eventDate > now;

    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "UPCOMING" && isUpcoming) ||
      (filterStatus === "PAST" && !isUpcoming);

    return matchSearch && matchStatus;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selected = Array.from(files).slice(0, 5 - images.length);

    setImages((prev) => [...prev, ...selected]);
    setPreviewImages((prev) => [
      ...prev,
      ...selected.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeOldImage = (id: number) => {
    setOldImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImages((prev) => [...prev, id]);
  };

  const openCreate = () => {
    setEditEvent(null);
    setForm({ event_name: "", event_date: "", location: "", description: "" });
    setImages([]);
    setPreviewImages([]);
    setShowModal(true);
  };

  const openEdit = (e: Event) => {
    setEditEvent(e);

    setForm({
      event_name: e.event_name,
      event_date: e.event_date ? formatDateTimeLocal(e.event_date) : "",
      location: e.location,
      description: e.description,
    });

    setOldImages(e.ImageEvent || []);
    setImages([]);
    setPreviewImages([]);

    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        event_name: form.event_name,
        event_date: new Date(form.event_date).toISOString(),
        location: form.location,
        description: form.description,
      };

      if (editEvent) {
        await updateEvent(editEvent.id, payload, images, deletedImages);
      } else {
        await createEvent(payload, images);
      }

      await fetchEvents();

      setShowModal(false);
      setImages([]);
      setPreviewImages([]);
      setOldImages([]);
      setDeletedImages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const bgGradients = [
    "from-orange-400 to-orange-600",
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-emerald-400 to-emerald-600",
    "from-pink-400 to-pink-600",
  ];

  const statusOptions = [
    { value: "ALL", label: "All Events" },
    { value: "UPCOMING", label: "Upcoming" },
    { value: "PAST", label: "Past Events" },
  ] as const;

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search events or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
            />
          </div>

          {/* Filter Status Dropdown */}
          <div className="relative w-56">
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <span className="text-sm text-slate-700 font-medium">
                {statusOptions.find((opt) => opt.value === filterStatus)?.label}
              </span>

              <svg
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  openDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openDropdown && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilterStatus(opt.value);
                      setOpenDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition ${
                      filterStatus === opt.value
                        ? "bg-orange-50 text-orange-600 font-medium"
                        : "text-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Event Button */}
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-orange-500/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Events",
            value: events.length,
            icon: Calendar,
            color: "bg-slate-100 text-slate-700",
          },
          {
            label: "Upcoming",
            value: events.filter((e) => new Date(e.event_date) > new Date())
              .length,
            icon: Clock,
            color: "bg-blue-100 text-blue-700",
          },
          {
            label: "Past",
            value: events.filter((e) => new Date(e.event_date) <= new Date())
              .length,
            icon: CheckCircle,
            color: "bg-green-100 text-green-700",
          },
          {
            label: "Filtered Results",
            value: filtered.length,
            icon: Search,
            color: "bg-orange-100 text-orange-700",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl px-4 py-4 border border-slate-100 shadow-sm hover:shadow-md transition text-center"
            >
              <div className={`inline-flex p-2 rounded-lg ${s.color} mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((event, idx) => {
          const isPast = new Date(event.event_date || "") <= new Date();
          const grad = bgGradients[idx % bgGradients.length];

          const imageUrl =
            event.ImageEvent && event.ImageEvent.length > 0
              ? `${BASE_URL}/uploads/${event.ImageEvent[0].image_url}`
              : null;

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div
                className={`bg-linear-to-br ${grad} p-5 relative overflow-hidden`}
              >
                {/* IMAGE */}
                <div className="h-40 relative overflow-hidden rounded-xl mb-3">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={event.event_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${grad}`} />
                  )}

                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* DECORATION */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -right-4 w-32 h-32 bg-white/10 rounded-full" />

                {/* TITLE */}
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg leading-tight">
                        {event.event_name}
                      </h3>

                      {isPast ? (
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-white/20 text-white text-xs rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-white/20 text-white text-xs rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600 font-medium">
                    {new Date(event.event_date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">
                    {event.location}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {event.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(event)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(event.id)}
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
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {search || filterStatus !== "ALL"
              ? "No events found matching your filters."
              : "No events yet. Create your first event!"}
          </p>
          {(search || filterStatus !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("ALL");
              }}
              className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="font-bold text-slate-800">
                {editEvent ? "Edit Event" : "Add Event"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  label: "Event Name",
                  key: "event_name",
                  type: "text",
                  placeholder: "Enter event name",
                },
                {
                  label: "Event Date",
                  key: "event_date",
                  type: "datetime-local",
                  placeholder: "",
                },
                {
                  label: "Location",
                  key: "location",
                  type: "text",
                  placeholder: "Enter location",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Event description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Images (max 5)
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm"
                />

                {oldImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {oldImages.map((img) => (
                      <div key={img.id} className="relative">
                        <img
                          src={`${BASE_URL}/uploads/${img.image_url}`}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeOldImage(img.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Preview */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
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
                {editEvent ? "Save Changes" : "Create Event"}
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
            <h3 className="font-bold text-slate-800 mb-2">Delete Event?</h3>
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

export default Events;
