import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";

const reviews = [
  {
    name: "Priya S.",   initial: "P",
    rating: 5,
    text: "The crochet bag I ordered was absolutely stunning. The quality is so premium and it arrived so beautifully packaged!",
  },
  {
    name: "Rahul M.",   initial: "R",
    rating: 5,
    text: "Ordered a custom beaded bracelet set for my sister's birthday. Lo Crochet made it exactly as I imagined — she was thrilled!",
  },
  {
    name: "Aditi K.",   initial: "A",
    rating: 5,
    text: "The attention to detail in every piece is just incredible. You can really feel the love put into every stitch.",
  },
  {
    name: "Ishan V.",   initial: "I",
    rating: 5,
    text: "Fastest delivery and the crochet keychain looks even better in person. Will definitely order again!",
  },
  {
    name: "Neha B.",    initial: "N",
    rating: 5,
    text: "Ordered a beaded necklace set — got so many compliments. Everyone wants to know where I got it from!",
  },
  {
    name: "Kabir T.",   initial: "K",
    rating: 5,
    text: "Lo Crochet is so responsive and the customisation process was seamless. Best handmade jewellery in the city!",
  },
];

const row1 = [...reviews, ...reviews];
const row2 = [...reviews, ...reviews].reverse();

export function Testimonials() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[900px] rounded-full bg-blush/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="chip">Kind Words</span>
            <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.2rem)]">
              Loved by{" "}
              <motion.span
                className="font-script text-rose inline-block"
                whileInView={{ rotate: [-2, 2, -1, 0] }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                happy customers
              </motion.span>
            </h2>
          </div>
        </Reveal>
      </div>

      {/* Row 1 — left scroll */}
      <div className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent_0%,black_10%,black_90%,transparent_100%)]">
        <div className="flex gap-4 w-max animate-marquee-left">
          {row1.map((r, i) => (
            <ReviewCard key={`r1-${i}`} r={r} />
          ))}
        </div>
      </div>

      {/* Row 2 — right scroll */}
      <div className="mt-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent_0%,black_10%,black_90%,transparent_100%)]">
        <div className="flex gap-4 w-max animate-marquee-right">
          {row2.map((r, i) => (
            <ReviewCard key={`r2-${i}`} r={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ r }: { r: (typeof reviews)[number] }) {
  return (
    <motion.article
      className="soft-card w-[280px] sm:w-[320px] shrink-0 p-5 sm:p-6 relative overflow-hidden cursor-default"
      whileHover={{ y: -5, boxShadow: "0 24px 60px -20px rgba(40,50,30,0.18)" }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <Quote
        size={32}
        className="absolute right-3 top-3 text-blush/60 rotate-180"
        fill="currentColor"
        strokeWidth={0}
      />

      <div className="flex items-center gap-3">
        <motion.div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blush to-petal font-display text-xl text-cocoa shadow-soft"
          whileHover={{ scale: 1.1, rotate: 6 }}
        >
          {r.initial}
        </motion.div>
        <div>
          <div className="font-semibold text-sm">{r.name}</div>
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: r.rating }).map((_, k) => (
              <Star key={k} size={11} className="text-gold" fill="currentColor" strokeWidth={0} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3.5 text-sm text-muted-foreground leading-relaxed">"{r.text}"</p>
    </motion.article>
  );
}
