import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Image, Tag, LayoutDashboard, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { CakesTab } from "@/components/admin/CakesTab";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { CategoriesTab } from "@/components/admin/CategoriesTab";
import { adminApi } from "@/lib/api";

const LOGO = "https://res.cloudinary.com/drvug594q/image/upload/v1783336116/502414269_17890545075269777_2375812623676817253_n-removebg-preview_hggmix.png";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

const TABS = [
  { id: "cakes",      label: "Products",   icon: Package },
  { id: "gallery",    label: "Gallery",    icon: Image   },
  { id: "categories", label: "Categories", icon: Tag     },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Key gate ──────────────────────────────────────────────────────────────
function KeyGate({ onUnlock }: { onUnlock: () => void }) {
  const [key, setKey]         = useState("");
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.verify(key.trim());
      if (res.success) {
        sessionStorage.setItem("admin_unlocked", "1");
        onUnlock();
      } else {
        setError("Invalid key. Please try again.");
      }
    } catch {
      setError("Invalid key. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4"
      style={{ backgroundImage: "radial-gradient(ellipse 90% 60% at 50% 0%, oklch(0.93 0.038 10 / 0.35), transparent 70%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="soft-card w-full max-w-sm p-8 text-center"
      >
        {/* Logo */}
        <img src={LOGO} alt="The Crochet Chronicles" className="h-20 w-20 object-contain mx-auto mb-2" />
        <div className="font-display text-2xl font-semibold">The Crochet Chronicles</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">
          Admin Panel
        </div>

        <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-rose/10 flex items-center justify-center">
          <Lock size={22} className="text-rose" />
        </div>

        <h1 className="font-display text-xl">Admin Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter the admin key to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Admin Key</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(""); }}
                placeholder="Enter secret key…"
                autoFocus
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={show ? "Hide key" : "Show key"}
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-destructive font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="btn-primary w-full text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Unlock Dashboard"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LayoutDashboard size={12} /> Back to site
        </Link>
      </motion.div>
    </div>
  );
}

// ── Main admin page ────────────────────────────────────────────────────────
function AdminPage() {
  // const [unlocked, setUnlocked] = useState(
  //   () => typeof window !== "undefined" && sessionStorage.getItem("admin_unlocked") === "1"
  // );
  const [active, setActive] = useState<TabId>("cakes");

  // if (!unlocked) {
  //   return <KeyGate onUnlock={() => setUnlocked(true)} />;
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-cream/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="The Crochet Chronicles" className="h-11 w-11 object-contain" />
            <div>
              <p className="font-display text-base leading-tight font-semibold">The Crochet Chronicles</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Admin Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Lock button disabled while key gate is commented out */}
            {/* <button
              onClick={() => {
                sessionStorage.removeItem("admin_unlocked");
                setUnlocked(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Lock size={13} /> Lock
            </button> */}
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard size={14} /> View site
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-4xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products, gallery and categories.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 w-fit mb-8 border border-border/60">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl bg-card shadow-soft border border-border/60"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon size={15} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {active === "cakes"      && <CakesTab />}
            {active === "gallery"    && <GalleryTab />}
            {active === "categories" && <CategoriesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
