import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, X, ImagePlus, Loader2,
  ChevronDown, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cakesApi, categoriesApi, type Cake, type CakeImage } from "@/lib/api";

// ── Fallback categories shown when no categories are in DB yet ──────────────
const FALLBACK_CATEGORIES = ["Crochet Bags", "Beaded Jewellery", "Accessories", "Gift Sets"];

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  description: "",
  flavors: "",   // "Options / Colours" on UI
  sizes: "",
  featured: false,
  inStock: true,
};

function getItemImages(item: Cake): CakeImage[] {
  if (item.images && item.images.length > 0) return item.images;
  if (item.image?.url) return [item.image];
  return [];
}

/** Small inline image carousel for the card */
function CardCarousel({ images, name }: { images: CakeImage[]; name: string }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted">
        <ImagePlus size={28} />
      </div>
    );
  }
  return (
    <div className="relative h-full w-full group/cc">
      <img
        src={images[idx].url}
        alt={`${name} ${idx + 1}`}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-cream/80 backdrop-blur flex items-center justify-center opacity-0 group-hover/cc:opacity-100 transition-opacity"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-cream/80 backdrop-blur flex items-center justify-center opacity-0 group-hover/cc:opacity-100 transition-opacity"
          >
            <ChevronRight size={12} />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className={`block h-1 rounded-full transition-all ${i === idx ? "w-3 bg-white" : "w-1 bg-white/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main tab ─────────────────────────────────────────────────────────────────
export function CakesTab() {
  const qc = useQueryClient();
  const [modal, setModal]           = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Cake | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });

  const [newFiles, setNewFiles]           = useState<File[]>([]);
  const [newPreviews, setNewPreviews]     = useState<string[]>([]);
  const [existingImages, setExistingImages]     = useState<CakeImage[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["cakes"],
    queryFn: () => cakesApi.list(),
  });

  // Fetch categories from DB for the dropdown
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 60_000,
  });
  const categoryOptions = catData?.data?.length
    ? catData.data.map((c) => c.name)
    : FALLBACK_CATEGORIES;

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => cakesApi.create(fd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cakes"] }); toast.success("Product created! 🧶"); closeModal(); },
    onError:   (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => cakesApi.update(id, fd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cakes"] }); toast.success("Product updated!"); closeModal(); },
    onError:   (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cakesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cakes"] }); toast.success("Product deleted"); setDeleteConfirm(null); },
    onError:   (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setForm({ ...EMPTY_FORM, category: categoryOptions[0] ?? "" });
    setNewFiles([]); setNewPreviews([]);
    setExistingImages([]); setRemovedPublicIds([]);
    setEditTarget(null);
    setModal("create");
  }

  function openEdit(item: Cake) {
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      description: item.description,
      flavors: item.flavors.join(", "),
      sizes: item.sizes.join(", "),
      featured: item.featured,
      inStock: item.inStock,
    });
    setNewFiles([]); setNewPreviews([]);
    setExistingImages(getItemImages(item));
    setRemovedPublicIds([]);
    setEditTarget(item);
    setModal("edit");
  }

  function closeModal() {
    setModal(null); setEditTarget(null);
    setNewFiles([]); setNewPreviews([]);
    setExistingImages([]); setRemovedPublicIds([]);
    setForm({ ...EMPTY_FORM });
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewFiles((p) => [...p, ...files]);
    setNewPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeNewPreview(idx: number) {
    setNewFiles((p) => p.filter((_, i) => i !== idx));
    setNewPreviews((p) => p.filter((_, i) => i !== idx));
  }

  function removeExistingImage(publicId: string) {
    setExistingImages((p) => p.filter((img) => img.publicId !== publicId));
    setRemovedPublicIds((p) => [...p, publicId]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name",        form.name);
    fd.append("price",       form.price);
    fd.append("category",    form.category);
    fd.append("description", form.description);
    fd.append("flavors",     form.flavors);
    fd.append("sizes",       form.sizes);
    fd.append("featured",    String(form.featured));
    fd.append("inStock",     String(form.inStock));
    newFiles.forEach((f) => fd.append("images", f));

    if (modal === "edit" && editTarget) {
      removedPublicIds.forEach((pid) => fd.append("removeImageIds", pid));
      updateMutation.mutate({ id: editTarget._id, fd });
    } else {
      createMutation.mutate(fd);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const items    = itemsData?.data ?? [];

  const allPreviews = [
    ...existingImages.map((img) => ({ src: img.url,  isExisting: true,  publicId: img.publicId })),
    ...newPreviews.map((src)      => ({ src,           isExisting: false, publicId: "" })),
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl">Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} items</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-1.5">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="soft-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-muted rounded shimmer" />
                <div className="h-3 w-1/3 bg-muted rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <span className="text-4xl mb-3">🧶</span>
          <p className="text-lg font-display">No products yet</p>
          <p className="text-sm mt-1">Click "Add Product" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="soft-card overflow-hidden group"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <CardCarousel images={getItemImages(item)} name={item.name} />
                <span className="chip absolute left-2 top-2 !bg-cream/90 !text-xs">
                  {item.category}
                </span>
                {item.featured && (
                  <span className="absolute right-2 top-2 chip !bg-rose/90 !text-cream !text-xs !border-rose/60">
                    Featured
                  </span>
                )}
                {getItemImages(item).length > 1 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-cocoa/70 text-cream text-[10px] font-semibold px-2 py-0.5 backdrop-blur">
                    {getItemImages(item).length} photos
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg leading-tight">{item.name}</h3>
                    <p className="text-rose font-semibold mt-0.5">₹{item.price}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-blush transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item._id)}
                      className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                {!item.inStock && (
                  <div className="mt-2">
                    <span className="chip !bg-muted !text-muted-foreground !text-[10px]">Out of stock</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="fixed inset-0 z-[100] grid place-items-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-cocoa/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
              className="relative z-10 soft-card p-6 max-w-sm w-full text-center">
              <p className="font-display text-xl">Delete this product?</p>
              <p className="text-sm text-muted-foreground mt-1">
                This will also remove all images from Cloudinary. Cannot be undone.
              </p>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 text-sm">Cancel</button>
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

      {/* Create / Edit modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-cocoa/50 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 24 }}
              className="relative z-10 soft-card w-full max-w-2xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-display text-2xl">
                  {modal === "create" ? "Add New Product" : "Edit Product"}
                </h3>
                <button onClick={closeModal} className="h-9 w-9 grid place-items-center rounded-full hover:bg-blush transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* Image upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Product Images
                    <span className="text-muted-foreground font-normal ml-1">(up to 10)</span>
                  </label>

                  {allPreviews.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                      {allPreviews.map((item, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group/thumb">
                          <img src={item.src} alt={`preview ${i + 1}`} className="h-full w-full object-cover" />
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[9px] font-bold uppercase bg-rose/80 text-white px-1.5 py-0.5 rounded-full">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              item.isExisting
                                ? removeExistingImage(item.publicId)
                                : removeNewPreview(i - existingImages.length)
                            }
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-cocoa/70 text-cream flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {allPreviews.length < 10 && (
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-rose/40 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
                        >
                          <ImagePlus size={18} />
                          <span className="text-[10px]">Add</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="aspect-[16/7] w-full rounded-2xl border-2 border-dashed border-border hover:border-rose/40 cursor-pointer bg-muted/30 flex items-center justify-center transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus size={28} />
                        <span className="text-sm">Click to upload images</span>
                        <span className="text-xs">JPG, PNG, WEBP · max 5 MB each · up to 10</span>
                      </div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                </div>

                {/* Name + Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Product Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Daisy Crochet Bag"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose/25 focus:border-rose transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Price (₹) *</label>
                    <input
                      required
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="499"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose/25 focus:border-rose transition-shadow"
                    />
                  </div>
                </div>

                {/* Category — fetched from DB */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Category *</label>
                  <div className="relative">
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose/25 focus:border-rose transition-shadow pr-8"
                    >
                      <option value="">Select a category…</option>
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Add new categories in the Categories tab first.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description of the product…"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose/25 focus:border-rose transition-shadow resize-none"
                  />
                </div>

                {/* Options/Colours + Sizes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      Options / Colours
                      <span className="text-muted-foreground font-normal ml-1">(comma-separated)</span>
                    </label>
                    <input
                      value={form.flavors}
                      onChange={(e) => setForm({ ...form, flavors: e.target.value })}
                      placeholder="Pink, Blue, Cream"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose/25 focus:border-rose transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      Sizes
                      <span className="text-muted-foreground font-normal ml-1">(comma-separated)</span>
                    </label>
                    <input
                      value={form.sizes}
                      onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                      placeholder="Small, Medium, Large"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose/25 focus:border-rose transition-shadow"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="h-4 w-4 rounded accent-rose"
                    />
                    <span className="text-sm font-medium">Featured / Popular</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                      className="h-4 w-4 rounded accent-rose"
                    />
                    <span className="text-sm font-medium">Available / In Stock</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-ghost flex-1 text-sm">Cancel</button>
                  <button type="submit" disabled={isSaving} className="btn-primary flex-1 text-sm disabled:opacity-60">
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : modal === "create" ? "Add Product" : "Save Changes"}
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
