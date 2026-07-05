import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi, type Category } from "@/lib/api";

const EMPTY_FORM = { name: "", description: "", order: "0" };

export function CategoriesTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string; order?: number }) =>
      categoriesApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created!");
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Category> }) =>
      categoriesApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated!");
      closeModal();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      setDeleteConfirm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditTarget(null);
    setModal("create");
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, description: cat.description, order: String(cat.order) });
    setEditTarget(cat);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      order: Number(form.order),
    };
    if (modal === "edit" && editTarget) {
      updateMutation.mutate({ id: editTarget._id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const categories = data?.data ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl">Categories</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm gap-1.5">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted shimmer" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-lg font-display">No categories yet</p>
          <p className="text-sm mt-1">Add your first product category (e.g. Crochet Bags, Beaded Jewellery).</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="soft-card flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-full bg-blush flex items-center justify-center shrink-0">
                  <span className="font-display text-lg text-cocoa">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {cat.description || (
                      <span className="italic">No description</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Order: {cat.order}
                </span>
                <span className="chip !text-[10px] !px-2 !py-0.5">/{cat.slug}</span>
                <button
                  onClick={() => openEdit(cat)}
                  className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-blush transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(cat._id)}
                  className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 size={13} />
                </button>
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
              <p className="font-display text-xl">Delete this category?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Existing products in this category will keep the value but it won't appear in filters.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-ghost flex-1 text-sm"
                >
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

      {/* Create / Edit modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-cocoa/50 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ scale: 0.93, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 24 }}
              className="relative z-10 soft-card w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-display text-2xl">
                  {modal === "create" ? "New Category" : "Edit Category"}
                </h3>
                <button
                  onClick={closeModal}
                  className="h-9 w-9 grid place-items-center rounded-full hover:bg-blush transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Birthday"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="btn-ghost flex-1 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="btn-primary flex-1 text-sm">
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : modal === "create" ? (
                      "Create"
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
