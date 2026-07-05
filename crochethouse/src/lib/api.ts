/**
 * Sweet Aroma Admin API client
 * All calls go to the Express backend running at VITE_API_URL (default: http://localhost:5000)
 */

const BASE = (import.meta.env?.VITE_API_URL as string | undefined) ?? "http://localhost:5000";

// ── Types mirroring backend models ────────────────────────────────────────

export interface CakeImage {
  url: string;
  publicId: string;
}

export interface Cake {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: CakeImage;
  images: CakeImage[];
  flavors: string[];
  sizes: string[];
  featured: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  caption: string;
  image: CakeImage;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ── Generic helpers ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Request failed: ${res.status}`);
  return json as T;
}

// Multipart/FormData request (for image uploads)
async function apiForm<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST",
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    body: formData,
    // Do NOT set Content-Type — browser sets it with the correct boundary
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Request failed: ${res.status}`);
  return json as T;
}

// ── Admin ─────────────────────────────────────────────────────────────────

export const adminApi = {
  verify: (key: string) =>
    apiFetch<{ success: boolean; message?: string }>("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    }),
};

// ── Cakes ─────────────────────────────────────────────────────────────────

export const cakesApi = {
  list: (params?: { category?: string; sort?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<{ success: boolean; data: Cake[] }>(`/api/cakes${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => apiFetch<{ success: boolean; data: Cake }>(`/api/cakes/${id}`),

  create: (formData: FormData) =>
    apiForm<{ success: boolean; data: Cake }>("/api/cakes", formData, "POST"),

  update: (id: string, formData: FormData) =>
    apiForm<{ success: boolean; data: Cake }>(`/api/cakes/${id}`, formData, "PUT"),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/cakes/${id}`, { method: "DELETE" }),
};

// ── Gallery ───────────────────────────────────────────────────────────────

export const galleryApi = {
  list: (all = true) =>
    apiFetch<{ success: boolean; data: GalleryItem[] }>(`/api/gallery?all=${all}`),

  create: (formData: FormData) =>
    apiForm<{ success: boolean; data: GalleryItem }>("/api/gallery", formData, "POST"),

  update: (id: string, formData: FormData) =>
    apiForm<{ success: boolean; data: GalleryItem }>(`/api/gallery/${id}`, formData, "PUT"),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/gallery/${id}`, { method: "DELETE" }),

  bulkDelete: (ids: string[]) =>
    apiFetch<{ success: boolean; message: string }>("/api/gallery/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }),
};

// ── Categories ────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => apiFetch<{ success: boolean; data: Category[] }>("/api/categories"),

  create: (body: { name: string; description?: string; order?: number }) =>
    apiFetch<{ success: boolean; data: Category }>("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: Partial<{ name: string; description: string; order: number }>) =>
    apiFetch<{ success: boolean; data: Category }>(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/categories/${id}`, {
      method: "DELETE",
    }),
};
