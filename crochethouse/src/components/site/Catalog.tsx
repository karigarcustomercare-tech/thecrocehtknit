import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { cakesApi, categoriesApi, type Cake, type CakeImage } from "@/lib/api";
import { Reveal } from "./Reveal";

const INSTA = "https://www.instagram.com/Crochet and Knots/";

function orderOnInstagram(item: Cake) {
  // Open Instagram DM — deeplink on mobile, profile page on desktop
  window.open(INSTA, "_blank", "noopener,noreferrer");
}

function getItemImages(item: Cake): CakeImage[] {
  if (item.images && item.images.length > 0) return item.images;
  if (item.image?.url) return [item.image];
  return [];
}

const ALL = "All";

/** Small carousel used inside catalog cards */
function CardCarousel({ images, name }: { images: CakeImage[]; name: string }) {
  const [idx, setIdx] = useState(0);

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="relative h-full w-full group/cc">
      <motion.img
        key={idx}
        src={images[idx].url}
        alt={`${name} ${idx + 1}`}
        loading="lazy"
        width={600}
        height={600}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-cream/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover/cc:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-cream/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover/cc:opacity-100 transition-opacity z-10"
          >
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                aria-label={`Go to image ${i + 1}`}
                className={`block h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Full-size carousel used in the detail modal */
function ModalCarousel({ images, name }: { images: CakeImage[]; name: string }) {
  const [idx, setIdx] = useState(0);

  if (!images.length) return null;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  };

  return (
    <div className="relative overflow-hidden h-full group/mc">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx].url}
          alt={`${name} ${idx + 1}`}
          className="h-56 w-full object-cover sm:h-full"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-cocoa/30 to-transparent sm:bg-gradient-to-r pointer-events-none" />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cream/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover/mc:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-cream/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover/mc:opacity-100 transition-opacity z-10"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                aria-label={`View image ${i + 1}`}
                className={`h-8 w-8 rounded-md overflow-hidden border-2 transition-all ${i === idx ? "border-white scale-110" : "border-white/40 opacity-70"}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Catalog() {
  const [cat,      setCat]      = useState<string>(ALL);
  const [sort,     setSort]     = useState<"featured" | "low" | "high">("featured");
  const [selected, setSelected] = useState<Cake | null>(null);

  const { data: itemsData, isLoading: itemsLoading, isError: itemsError } = useQuery({
    queryKey: ["cakes"],
    queryFn: () => cakesApi.list(),
    staleTime: 60_000,
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 60_000,
  });

  const categoryList = useMemo(() => {
    const names = (catData?.data ?? []).map((c) => c.name);
    return [ALL, ...names];
  }, [catData]);

  const list = useMemo(() => {
    let l = (itemsData?.data ?? []).filter((c) =>
      cat === ALL ? true : c.category === cat
    );
    if (sort === "low")  l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "featured") {
      l = [...l].sort((a, b) => {
        if (a.featured === b.featured) return 0;
        return a.featured ? -1 : 1;
      });
    }
    return l;
  }, [itemsData, cat, sort]);

  return (
    <section id="catalog" className="relative py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] rounded-full bg-blush/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* ── Header ───────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="chip">The Collection</span>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.2rem)]">
                Handcrafted pieces, made to order
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-sm sm:text-base">
                Every item is made fresh — allow 3–5 days for custom orders. 🧶
              </p>
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft">
              <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="bg-transparent focus:outline-none cursor-pointer text-sm pr-1"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low → High</option>
                <option value="high">Price: High → Low</option>
              </select>
            </div>
          </div>
        </Reveal>

        {/* ── Category filters ─── */}
        <Reveal delay={0.08}>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
            {categoryList.map((c) => (
              <motion.button
                key={c}
                onClick={() => setCat(c)}
                whileTap={{ scale: 0.94 }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  cat === c
                    ? "border-transparent bg-primary text-primary-foreground shadow-soft"
                    : "border-border bg-card text-foreground/70 hover:bg-blush/40 hover:text-foreground"
                }`}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </Reveal>

        {/* ── Grid ─────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {itemsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="soft-card overflow-hidden">
                <div className="aspect-square w-full shimmer" />
                <div className="p-3 sm:p-5 space-y-2">
                  <div className="h-4 w-3/4 rounded-full shimmer" />
                  <div className="h-3 w-1/2 rounded-full shimmer" />
                  <div className="h-8 w-full rounded-full shimmer mt-3" />
                </div>
              </div>
            ))
          ) : itemsError ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              <p>Could not load products. Please try again later.</p>
            </div>
          ) : list.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              <p>No products in this category yet — check back soon! 🧶</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {list.map((item, idx) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  idx={idx}
                  onView={() => setSelected(item)}
                  onOrder={() => orderOnInstagram(item)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Detail modal ─────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-cocoa/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-card shadow-lift
                         grid grid-rows-[auto_1fr] sm:grid-rows-none sm:grid-cols-2
                         max-h-[90dvh] overflow-y-auto"
            >
              <ModalCarousel images={getItemImages(selected)} name={selected.name} />

              <div className="p-6 sm:p-8 flex flex-col">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 backdrop-blur hover:bg-blush transition z-10"
                >
                  <X size={15} />
                </button>

                <span className="chip">{selected.category}</span>
                <h3 className="mt-3 font-display text-2xl sm:text-3xl">{selected.name}</h3>
                <div className="mt-1 font-display text-xl sm:text-2xl text-rose">₹{selected.price}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{selected.description}</p>

                {(selected.flavors?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Options / Colours</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.flavors.map((f) => (
                        <span key={f} className="rounded-full border border-border px-3 py-1 text-xs sm:text-sm">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(selected.sizes?.length ?? 0) > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sizes</div>
                    <div className="flex flex-wrap gap-2">
                      {selected.sizes.map((s) => (
                        <span key={s} className="rounded-full border border-border px-3 py-1 text-xs sm:text-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { orderOnInstagram(selected); setSelected(null); }}
                    className="btn-insta flex-1 text-sm"
                  >
                    <ShoppingBag size={15} /> Order on Instagram
                  </motion.button>
                  <a
                    href="#customize"
                    onClick={() => setSelected(null)}
                    className="btn-ghost text-sm"
                  >
                    <Sparkles size={15} /> Customise
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Item card ─────────────────────────────────────────────────── */
function ItemCard({
  item: c, idx, onView, onOrder,
}: {
  item: Cake; idx: number; onView: () => void; onOrder: () => void;
}) {
  const images = getItemImages(c);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.38, delay: Math.min(idx * 0.04, 0.25) }}
      className="soft-card group overflow-hidden cursor-pointer flex flex-col"
      onClick={onView}
    >
      {/* ── Image carousel ───────────────────────────── */}
      <div className="relative aspect-square overflow-hidden">
        <CardCarousel images={images} name={c.name} />

        {c.featured && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-rose px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm z-10">
            <span className="h-1 w-1 rounded-full bg-white/80" />
            Popular
          </span>
        )}
      </div>

      {/* ── Info ────────────────────────── */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 gap-1.5">
        <h3 className="font-display text-center text-sm sm:text-base leading-snug line-clamp-2 text-foreground">
          {c.name}
        </h3>
        <p className="text-center font-semibold text-sm sm:text-base text-foreground/80">
          ₹ {c.price.toLocaleString("en-IN")}
        </p>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onOrder(); }}
          whileTap={{ scale: 0.96 }}
          className="mt-auto w-full rounded-full border border-rose/50 bg-transparent py-2 text-xs sm:text-sm font-semibold text-rose transition-colors hover:bg-rose hover:text-white active:scale-95"
        >
          ORDER NOW
        </motion.button>
      </div>
    </motion.article>
  );
}
