import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { galleryApi } from "@/lib/api";
import { Reveal } from "./Reveal";

export function Gallery() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["gallery-public"],
    queryFn: () => galleryApi.list(false),
    staleTime: 60_000,
  });

  const items = data?.data ?? [];

  return (
    <section id="gallery" className="relative py-24 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-sage/10 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-1/3 h-[300px] w-[300px] rounded-full bg-blush/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="chip">The Feed</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                Fresh from the{" "}
                <span className="font-script text-terra">workshop</span>
              </h2>
            </div>
            <motion.a
              href="https://www.instagram.com/neocrochetstudio/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-semibold text-terra hover:underline"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Instagram size={16} />
              @neocrochetstudio →
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {isLoading ? (
            <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="aspect-square w-full rounded-2xl bg-muted shimmer" />
              ))}
            </div>
          ) : isError || items.length === 0 ? (
            <div className="mt-10 py-16 text-center text-muted-foreground">
              {isError
                ? "Could not load gallery. Please try again later."
                : "No gallery photos yet — check back soon! 🧶"}
            </div>
          ) : (
            <motion.div
              className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {items.map((it, idx) => (
                <motion.div
                  key={it._id}
                  className="group relative aspect-square overflow-hidden rounded-2xl"
                  variants={{
                    hidden: { opacity: 0, scale: 0.92 },
                    show: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
                    },
                  }}
                  whileHover={{ scale: 1.03, zIndex: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img
                    src={it.image?.url}
                    alt={it.title || `Gallery photo ${idx + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cocoa/65 text-cream"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    {it.title && (
                      <span className="text-xs font-semibold line-clamp-1 px-2">{it.title}</span>
                    )}
                    {it.caption && (
                      <span className="text-xs line-clamp-2 px-3 text-center opacity-80">
                        {it.caption}
                      </span>
                    )}
                    <span className="text-lg mt-1">🧶</span>
                  </motion.div>

                  {/* Shimmer on hover */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Reveal>

        {/* Instagram CTA */}
        <Reveal delay={0.15}>
          <div className="mt-10 text-center">
            <motion.a
              href="https://www.instagram.com/neocrochetstudio/"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost inline-flex"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Instagram size={16} />
              See all on Instagram
            </motion.a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
