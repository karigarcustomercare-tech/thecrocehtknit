import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Flame, ChevronLeft, ChevronRight, Lock, ShoppingBag } from "lucide-react";
import { Reveal } from "./Reveal";

const INSTA = "https://www.instagram.com/civcivgurumi/";

// ── Challenge config ─────────────────────────────────────────────────────────
// Day 1 = July 3, 2026 (today = Day 3 per user)
const CHALLENGE_START = new Date("2026-07-03T00:00:00");
const TOTAL_DAYS = 30;

// ── Hardcoded Day 1–3 products (replace images with real ones when available)
// All order CTAs go to Instagram DM.
const DAY_PRODUCTS: Record<number, {
  name: string;
  price: string;
  category: string;
  description: string;
  image: string;
  instaPost?: string; // optional direct post link
}> = {
  1: {
    name: "Pipe Cleaner Bouquet",
    price: "₹ 599",
    category: "Bouquets",
    description: "Blooms that bend, twist, and last a lifetime — handcrafted just for you.",
    image: "https://res.cloudinary.com/drvug594q/image/upload/v1783201510/Screenshot_2026-07-05_at_3.14.00_AM_txgdc9.png",
  },
  2: {
    name: "Crochet Charger Cover",
    price: "₹ 299",
    category: "Beaded Accessories",
    description: "A little crochet hug for your charger, made stitch by stitch.",
    image: "https://res.cloudinary.com/drvug594q/image/upload/v1783201573/Screenshot_2026-07-05_at_3.16.04_AM_ebzba8.png",
  },
  3: {
    name: "Crochet Juda Bun Stick",
    price: "₹ 299",
    category: "Crochet Jewellery",
    description: "A little crochet charm for your everyday bun, made one stitch at a time.",
    image: "https://res.cloudinary.com/drvug594q/image/upload/v1783201732/Screenshot_2026-07-05_at_3.18.19_AM_eghe5s.png",
  },
};

function getDayNumber(): number {
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - CHALLENGE_START.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.min(Math.max(diff + 1, 1), TOTAL_DAYS);
}

function getTimeUntilMidnight(): { h: number; m: number; s: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    h: Math.floor(diff / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

// ── Countdown timer ──────────────────────────────────────────────────────────
function Countdown() {
  const [time, setTime] = useState(getTimeUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-rose">
      <Flame size={14} className="text-rose animate-pulse" />
      <span className="text-muted-foreground font-sans font-medium">Next drop in</span>
      <span className="tabular-nums">{pad(time.h)}:{pad(time.m)}:{pad(time.s)}</span>
    </div>
  );
}

// ── Day pill ─────────────────────────────────────────────────────────────────
function DayPill({
  day, isSelected, isPast, isToday, onClick,
}: {
  day: number; isSelected: boolean; isPast: boolean; isToday: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      data-day={day}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      whileHover={isPast && !isSelected ? { y: -2 } : {}}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all
        ${isToday
          ? "bg-rose text-white shadow-[0_4px_16px_-4px_rgba(180,60,90,0.45)] scale-110 z-10"
          : isSelected && isPast
          ? "bg-blush border-2 border-rose text-rose"
          : isPast
          ? "bg-mauve/80 text-white"
          : "bg-muted text-muted-foreground opacity-45 cursor-not-allowed"
        }`}
    >
      {!isPast && <Lock size={9} className="absolute top-1.5" />}
      <span className={!isPast ? "mt-2.5" : ""}>{day}</span>
      {isToday && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-70" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose" />
        </span>
      )}
    </motion.button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ChallengeStrip() {
  const currentDay = getDayNumber();
  const [viewDay, setViewDay] = useState(currentDay);
  const [stripRef, setStripRef] = useState<HTMLDivElement | null>(null);

  // Scroll selected pill into view within the strip only (avoid affecting page scroll)
  useEffect(() => {
    if (!stripRef) return;
    const pill = stripRef.querySelector(`[data-day="${viewDay}"]`) as HTMLElement | null;
    if (!pill) return;
    const stripRect = stripRef.getBoundingClientRect();
    const pillRect  = pill.getBoundingClientRect();
    const offset    = pillRect.left - stripRect.left - stripRect.width / 2 + pillRect.width / 2;
    stripRef.scrollLeft += offset;
  }, [viewDay, stripRef]);

  const prevDay = useCallback(() => setViewDay((d) => Math.max(d - 1, 1)), []);
  const nextDay = useCallback(() => setViewDay((d) => Math.min(d + 1, currentDay)), [currentDay]);

  const product = DAY_PRODUCTS[viewDay] ?? null;
  const progress = Math.round((currentDay / TOTAL_DAYS) * 100);

  return (
    <section id="challenge" className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -left-32 top-16 h-[450px] w-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.93 0.038 10 / 0.50) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[350px] w-[350px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.60 0.12 340 / 0.12) 0%, transparent 70%)" }} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">

        {/* ── Header ──────────────────────────────────────── */}
        <Reveal>
          <div className="text-center">
            <span className="chip !bg-rose/12 !border-rose/25 !text-rose">
              <Flame size={11} />
              30-Day Challenge
            </span>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.4rem)] leading-tight text-foreground">
              1 New Drop,{" "}
              <motion.span
                className="font-script text-rose inline-block"
                whileInView={{ scale: [0.9, 1.06, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                Every Day
              </motion.span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground text-sm sm:text-base leading-relaxed">
              civcivgurumi is launching one handcrafted piece every single day for 30 days.
              Don't miss your favourite! 🧶✨
            </p>
          </div>
        </Reveal>

        {/* ── Progress card ───────────────────────────────── */}
        <Reveal delay={0.08}>
          <div className="mt-8 soft-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-foreground">Day {currentDay}</span>
                <span className="text-muted-foreground text-sm">of {TOTAL_DAYS}</span>
              </div>
              <Countdown />
            </div>
            {/* Progress bar */}
            <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, var(--blush) 0%, var(--rose) 50%, var(--mauve) 100%)" }}
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
              />
              {/* Shimmer on progress bar */}
              <motion.div
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-right">
              {TOTAL_DAYS - currentDay} days remaining ✨
            </div>
          </div>
        </Reveal>

        {/* ── Day pill strip ──────────────────────────────── */}
        <Reveal delay={0.1}>
          <div
            ref={setStripRef}
            className="mt-5 flex gap-2 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => (
              <DayPill
                key={day}
                day={day}
                isSelected={day === viewDay}
                isPast={day <= currentDay}
                isToday={day === currentDay}
                onClick={() => day <= currentDay && setViewDay(day)}
              />
            ))}
          </div>
        </Reveal>

        {/* ── Featured drop card ──────────────────────────── */}
        <Reveal delay={0.14}>
          <div className="mt-5 soft-card overflow-hidden">
            {/* Gradient top strip */}
            <div className="h-1.5 w-full animate-gradient"
              style={{ background: "linear-gradient(90deg, var(--blush), var(--rose), var(--mauve), var(--rose), var(--blush))", backgroundSize: "200% 100%" }}
            />

            <div className="grid sm:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square sm:aspect-auto sm:min-h-[340px] overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  {product ? (
                    <motion.img
                      key={viewDay}
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      style={{ background: "radial-gradient(circle, oklch(0.93 0.038 10 / 0.25) 0%, transparent 70%)" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      <motion.span
                        className="text-6xl"
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        🧶
                      </motion.span>
                      <p className="text-sm text-muted-foreground font-medium px-6 text-center">
                        Day {viewDay} drop hasn't launched yet — follow{" "}
                        <a href={INSTA} target="_blank" rel="noreferrer" className="text-rose font-bold hover:underline">
                          @civcivgurumi
                        </a>{" "}
                        to be the first to know!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gradient overlay on image */}
                {product && (
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa/40 via-transparent to-transparent pointer-events-none" />
                )}

                {/* Day badge */}
                <div className="absolute left-3 top-3">
                  <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shadow-soft"
                    style={{ background: "linear-gradient(135deg, var(--rose), var(--mauve))" }}>
                    <Flame size={10} />
                    Day {viewDay}{viewDay === currentDay ? " • Today" : ""}
                  </span>
                </div>

                {/* Prev / Next */}
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  <motion.button
                    onClick={prevDay}
                    disabled={viewDay <= 1}
                    whileTap={{ scale: 0.88 }}
                    className="grid h-8 w-8 place-items-center rounded-full bg-cream/90 shadow disabled:opacity-30 transition-opacity"
                  >
                    <ChevronLeft size={14} />
                  </motion.button>
                  <motion.button
                    onClick={nextDay}
                    disabled={viewDay >= currentDay}
                    whileTap={{ scale: 0.88 }}
                    className="grid h-8 w-8 place-items-center rounded-full bg-cream/90 shadow disabled:opacity-30 transition-opacity"
                  >
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {product ? (
                    <motion.div
                      key={viewDay}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <span className="chip">{product.category}</span>
                      <h3 className="mt-3 font-display text-2xl sm:text-3xl leading-tight text-foreground">
                        {product.name}
                      </h3>
                      <div className="mt-2 font-display text-xl text-rose">{product.price}</div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>

                      <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                        <motion.a
                          href={INSTA}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-insta flex-1 text-sm"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <ShoppingBag size={15} />
                          Order Day {viewDay} Drop
                        </motion.a>
                        <motion.a
                          href={INSTA}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-sm"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Instagram size={15} />
                          View on Insta
                        </motion.a>
                      </div>

                      <p className="mt-4 text-xs text-muted-foreground">
                        DM{" "}
                        <a href={INSTA} target="_blank" rel="noreferrer"
                          className="text-rose font-semibold hover:underline">
                          @civcivgurumi
                        </a>{" "}
                        on Instagram to place your order 🧶
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <span className="text-5xl mb-4 block">🔒</span>
                      <p className="font-display text-xl text-muted-foreground">
                        Day {viewDay} is locked
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Follow{" "}
                        <a href={INSTA} target="_blank" rel="noreferrer"
                          className="text-rose font-bold hover:underline">
                          @civcivgurumi
                        </a>{" "}
                        to catch every drop 🧶
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Today's drop shortcut (shown when browsing past days) ── */}
        {viewDay !== currentDay && DAY_PRODUCTS[currentDay] && (
          <Reveal delay={0.18}>
            <motion.button
              onClick={() => setViewDay(currentDay)}
              className="mt-4 w-full soft-card p-4 flex items-center gap-4 text-left border border-rose/15 hover:border-rose/30 transition-colors"
              whileHover={{ y: -2 }}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{ background: "linear-gradient(135deg, var(--blush), oklch(0.93 0.038 10 / 0.6))" }}>
                <Flame size={18} className="text-rose" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose mb-0.5">Today's Drop 🔥</div>
                <div className="font-display text-base truncate">{DAY_PRODUCTS[currentDay].name}</div>
                <div className="text-xs text-muted-foreground">{DAY_PRODUCTS[currentDay].price}</div>
              </div>
              <span className="text-sm font-bold text-rose shrink-0">View →</span>
            </motion.button>
          </Reveal>
        )}
      </div>
    </section>
  );
}
