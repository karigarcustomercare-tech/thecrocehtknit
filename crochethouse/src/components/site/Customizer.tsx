import { motion } from "framer-motion";
import { Instagram, Sparkles, Heart, Star, ArrowRight, Gem, ShoppingBag } from "lucide-react";
import { Reveal } from "./Reveal";

const INSTA = "https://www.instagram.com/_.crochetchronicles/";

const highlights = [
  { icon: Gem,      label: "Custom bead designs" },
  { icon: Heart,    label: "Personalised messages" },
  { icon: Sparkles, label: "Gift wrapping available" },
  { icon: Star,     label: "Made fresh to order" },
];

export function Customizer() {
  return (
    <section id="customize" className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.93 0.038 10 / 0.30) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.94 0.042 355 / 0.35) 0%, transparent 70%)" }} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="chip">Custom Orders</span>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.4rem)] leading-tight">
              Want something{" "}
              <motion.span
                className="font-script text-rose inline-block"
                whileInView={{ scale: [0.9, 1.06, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                unique?
              </motion.span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground text-base leading-relaxed">
              Tell Crochet Chronicles your vision — colours, patterns, occasion — and she'll handcraft it
              exactly the way you dreamed it. 🧶✨
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {highlights.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                whileHover={{ y: -3, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-soft"
              >
                <Icon size={14} className="text-rose" />
                {label}
              </motion.div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 soft-card overflow-hidden">
            {/* Gradient top strip */}
            <div className="h-1.5 w-full animate-gradient"
              style={{ background: "linear-gradient(90deg, var(--blush), var(--rose), var(--mauve), var(--rose), var(--blush))", backgroundSize: "200% 100%" }} />

            <div className="p-8 sm:p-12 text-center">
              <motion.div
                className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full"
                style={{ background: "linear-gradient(135deg, var(--blush), oklch(0.93 0.038 10 / 0.7))" }}
                animate={{
                  boxShadow: [
                    "0 8px 28px -8px oklch(0.55 0.15 0 / 0.18)",
                    "0 12px 40px -8px oklch(0.55 0.15 0 / 0.38)",
                    "0 8px 28px -8px oklch(0.55 0.15 0 / 0.18)",
                  ],
                }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-4xl">🧶</span>
              </motion.div>

              <h3 className="font-display text-2xl sm:text-3xl">
                Let's create your piece together
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-muted-foreground text-sm leading-relaxed">
                Share your ideas — colours, size, occasion, reference photos — and Crochet Chronicles will
                come back with a quote within a few hours.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.a
                  href={INSTA}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-insta w-full sm:w-auto px-8 py-4 text-base"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ShoppingBag size={20} />
                  Order on Instagram
                </motion.a>
                <motion.a
                  href="#catalog"
                  className="btn-ghost w-full sm:w-auto px-6 py-4 text-base"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Browse Collection <ArrowRight size={16} />
                </motion.a>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                DM{" "}
                <a href={INSTA} target="_blank" rel="noreferrer" className="text-rose font-semibold hover:underline">
                  @_.crochetchronicles
                </a>{" "}
                on Instagram · Usually replies within 2–3 hours
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
