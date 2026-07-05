import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, ImagePlus, Loader2, Pencil, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { galleryApi, type GalleryItem } from "@/lib/api";

const EMPTY_FORM = { title: "", caption: "", order: "0", visible: true };

export function GalleryTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: () => galleryApi.list(true),
  });

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => galleryApi.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image uploaded!");
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => galleryApi.update(id, fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Updated!");
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Deleted");
      setDeleteConfirm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => galleryApi.bulkDelete(ids),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
      toast.success(res.message);
      setSelected(new Set());
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
    setEditTarget(null);
    setModal("create");
  }

  function openEdit(item: GalleryItem) {
    setForm({
      title: item.title,
      caption: item.caption,
      order: String(item.order),
      visible: item.visible,
    });
    setImageFile(null);
    setImagePreview(item.image?.url ?? null);
    setEditTarget(item);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
    setImageFile(null);
    setImagePreview(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (modal === "create" && !imageFile) {
      toast.error("Please select an image");
      return;
    }
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("caption", form.caption);
    fd.append("order", form.order);
    fd.append("visible", String(form.visible));
    if (imageFile) fd.append("image", imageFile);

    if (modal === "edit" && editTarget) {
      updateMutation.mutate({ id: editTarget._id, fd });
    } else {
      createMutation.mutate(fd);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const items = data?.data ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl">Gallery</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} photos</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => bulkDeleteMutation.mutate(Array.from(selected))}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 text-destructive px-4 py-2 text-sm font-semibold hover:bg-destructive/20 transition-colors"
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete {selected.size} selected
            </button>
          )}
          <button onClick={openCreate} className="btn-primary text-sm gap-1.5">
            <Plus size={15} /> Upload Photo
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted shimmer" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-lg font-display">No photos yet</p>
          <p className="text-sm mt-1">Upload your first gallery photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border-2 transition-colors ${
                selected.has(item._id) ? "border-primary" : "border-transparent"
              }`}
              onClick={() => toggleSelect(item._id)}
            >
              <img
                src={item.image?.url}
                alt={item.title || "gallery"}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Checkbox */}
              <div
                className={`absolute top-2 left-2 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center transition-colors ${
                  selected.has(item._id) ? "bg-primary" : "bg-black/20"
                }`}
              >
                {selected.has(item._id) && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Visibility badge */}
              {!item.visible && (
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center">
                  <EyeOff size={12} className="text-white" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-cocoa/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-3 gap-1.5">
                {item.title && (
                  <p className="text-cream text-xs font-semibold text-center line-clamp-1">
                    {item.title}
                  </p>
                )}
                <div
                  className="flex gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEdit(item)}
                    className="h-7 w-7 grid place-items-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item._id)}
                    className="h-7 w-7 grid place-items-center rounded-full bg-white/20 hover:bg-destructive/80 text-white transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-cocoa/50 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 16 }}
              className="relative z-10 soft-card p-6 max-w-sm w-full text-center"
            >
              <p className="font-display text-xl">Delete this photo?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently removes from Cloudinary. Cannot be undone.
              </p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 text-sm">
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-destructive text-destructive-foreground px-4 py-2 text-sm font-semibold"
                >
                  {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload / Edit modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-cocoa/50 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ scale: 0.93, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 24 }}
              className="relative z-10 soft-card w-full max-w-lg my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-display text-2xl">
                  {modal === "create" ? "Upload Photo" : "Edit Photo"}
                </h3>
                <button
                  onClick={closeModal}
                  className="h-9 w-9 grid place-items-center rounded-full hover:bg-blush transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Image */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Photo {modal === "create" && <span className="text-destructive">*</span>}
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer overflow-hidden bg-muted/30 flex items-center justify-center transition-colors"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus size={28} />
                        <span className="text-sm">Click to upload</span>
                        <span className="text-xs">JPG, PNG, WEBP · max 5 MB</span>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="absolute inset-0 bg-cocoa/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ImagePlus size={24} className="text-cream" />
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Crochet Jewellery"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Caption</label>
                  <input
                    value={form.caption}
                    onChange={(e) => setForm({ ...form, caption: e.target.value })}
                    placeholder="Short caption..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Display Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.visible}
                        onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Eye size={13} /> Visible on site
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-ghost flex-1 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="btn-primary flex-1 text-sm">
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : modal === "create" ? (
                      "Upload"
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
