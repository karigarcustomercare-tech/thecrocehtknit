import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Instagram, ShoppingBag } from "lucide-react";

const LOGO = "https://res.cloudinary.com/drvug594q/image/upload/v1783331595/lo-removebg-preview_mfexrl.png";

const INSTA = "https://www.instagram.com/_lo_crochet/";

const links = [
  { href: "#home",      label: "Home" },
  { href: "#story",     label: "Story" },
  { href: "#catalog",   label: "Shop" },
  { href: "#gallery",   label: "Gallery" },
  { href: "#contact",   label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const [active,   setActive]   = useState("#home");

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-cream/90 backdrop-blur-2xl shadow-[0_2px_20px_-8px_rgba(80,30,50,0.12)] border-b border-border/40"
            : "bg-transparent"
        }`}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 transition-all duration-300 ${scrolled ? "py-2.5" : "py-4"}`}>

          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <img
                src={LOGO}
                alt="The Lo Crochet"
                className={`object-contain transition-all duration-300 ${scrolled ? "h-20 w-20" : "h-22 w-22"}`}
              />
            </motion.div>
            <div className="leading-tight hidden xs:block">
              <div className="font-display text-xl font-semibold text-foreground group-hover:text-rose transition-colors duration-200">
                The Lo Crochet
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Crochet & Beaded Jewellery
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative px-3 py-2 text-sm font-medium text-foreground/75 hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-blush/40"
              >
                {l.label}
                <motion.span
                  className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-rose"
                  initial={false}
                  animate={{ scaleX: active === l.href ? 1 : 0, opacity: active === l.href ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ originX: "50%" }}
                />
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <motion.a
              href={INSTA}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.1, backgroundColor: "var(--blush)" }}
              whileTap={{ scale: 0.9 }}
              className="grid h-9 w-9 place-items-center rounded-full border border-border/70 text-foreground/60 hover:text-foreground transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={15} />
            </motion.a>
            <motion.a
              href={INSTA}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="btn-insta !py-2 !px-4 !text-sm"
            >
              <ShoppingBag size={14} />
              Order Now
            </motion.a>
          </div>

          {/* Mobile burger */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden relative grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card/80 backdrop-blur"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X size={17} />
                </motion.span>
              ) : (
                <motion.span key="m"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu size={17} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-cocoa/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-cream/97 backdrop-blur-2xl shadow-lift flex flex-col md:hidden border-l border-border/30"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <img src={LOGO} alt="The Lo Crochet" className="h-14 w-14 object-contain" />
                  <div>
                    <span className="font-display text-base font-semibold block">The Lo Crochet</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground">by Lo Crochet</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88, rotate: 90 }}
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-muted hover:bg-blush transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <motion.ul
                  initial="hidden" animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
                  className="space-y-1"
                >
                  {links.map((l) => (
                    <motion.li key={l.href}
                      variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.28 } } }}
                    >
                      <a
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-medium text-base transition-colors ${
                          active === l.href
                            ? "bg-blush text-cocoa"
                            : "text-foreground/80 hover:bg-blush/50 hover:text-foreground"
                        }`}
                      >
                        {active === l.href && (
                          <motion.span layoutId="active-dot" className="h-1.5 w-1.5 rounded-full bg-rose" />
                        )}
                        {l.label}
                      </a>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>

              <div className="p-4 border-t border-border/40 space-y-2.5">
                <motion.a
                  href={INSTA}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  whileTap={{ scale: 0.96 }}
                  className="btn-insta w-full text-sm"
                >
                  <ShoppingBag size={16} />
                  Order on Instagram
                </motion.a>
                <motion.a
                  href={INSTA}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  whileTap={{ scale: 0.96 }}
                  className="btn-ghost w-full text-sm"
                >
                  <Instagram size={16} />
                  Follow @_lo_crochet
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
