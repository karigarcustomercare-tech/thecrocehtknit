import { Instagram, Mail, Heart, ArrowUp, Phone, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const LOGO = "https://res.cloudinary.com/drvug594q/image/upload/v1783329563/neo-removebg-preview_m2mwij.png";
const INSTA = "https://www.instagram.com/neocrochetstudio/";

const colLeft = [
  { href: "#story",     label: "Our Story" },
  { href: "#catalog",   label: "Shop" },
  { href: "#gallery",   label: "Gallery" },
  { href: "#contact",   label: "Contact Us" },
];

const colRight = [
  { href: "#",        label: "Privacy Policy" },
  { href: "#",        label: "Refund Policy" },
  { href: "#contact", label: "FAQs" },
  { href: "#contact", label: "Shipping Info" },
];

const socialLinks = [
  { icon: Instagram, href: INSTA, label: "Instagram" },
];

export function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative border-t border-border/50 overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blush/8 to-blush/18" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-6">

        {/* Logo */}
        <div className="flex flex-col items-center md:items-start mb-8">
          <motion.a
            href="#home"
            className="flex flex-col items-center md:flex-row md:items-center gap-2 group"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={LOGO} alt="The NEO Crochet Studio" className="h-28 w-28 object-contain" />
            <div className="text-center md:text-left leading-tight">
              <div className="font-display text-xl font-semibold group-hover:text-rose transition-colors">
                NEO Crochet Studio
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Crochet & Beaded Jewellery · Pan India 
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                by NEO Crochet Studio 
              </div>
            </div>
          </motion.a>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4 md:gap-8 mb-8">
          <div className="space-y-2.5">
            {colLeft.map((l) => (
              <a key={l.label} href={l.href}
                className="block text-xs sm:text-sm uppercase tracking-wide text-foreground/70 hover:text-rose transition-colors font-medium">
                {l.label}
              </a>
            ))}
          </div>

          <div className="space-y-2.5">
            {colRight.map((l) => (
              <a key={l.label} href={l.href}
                className="block text-xs sm:text-sm uppercase tracking-wide text-foreground/70 hover:text-rose transition-colors font-medium">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop — contact + newsletter */}
          <div className="col-span-2 hidden md:block space-y-4">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="tel:+918779632771" className="flex items-center gap-2 hover:text-rose transition-colors">
                <Phone size={14} /> +91 87796 32721
              </a>
              <a href="mailto:thebeadbaskets@gmail.com" className="flex items-center gap-2 hover:text-rose transition-colors">
                <Mail size={14} />neocrochetstudio@gmail.com
              </a>
            </div>
            <form
              className="flex gap-2 max-w-xs"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Subscribed! Stay tuned for new drops 🧶✨");
                (e.target as HTMLFormElement).reset();
              }}
            >
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 min-w-0 rounded-full border border-border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose/20 focus:border-rose transition-shadow"
              />
              <motion.button
                type="submit"
                className="btn-primary !py-2 !px-4 text-sm shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join
              </motion.button>
            </form>
          </div>
        </div>

        {/* Mobile contact row */}
        <div className="flex flex-col items-center gap-1.5 mb-6 md:hidden text-sm text-muted-foreground">
          <a href="tel:+918779632721" className="flex items-center gap-2 hover:text-rose transition-colors">
            <Phone size={13} /> +91 87796 32721
          </a>
          <a href="mailto:thebeadbaskets@gmail.com" className="flex items-center gap-2 hover:text-rose transition-colors">
            <Mail size={13} /> neocrochetstudio@gmail.com
          </a>
        </div>

        {/* Social icons */}
        <div className="flex justify-center md:justify-start gap-3 mb-6">
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground/60 hover:text-foreground hover:bg-blush hover:border-rose/30 transition-colors"
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Icon size={16} />
            </motion.a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} The NEO Crochet Studio by NEO Crochet Studio. All rights reserved.</div>
          <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.04 }}>
            Made with{" "}
            <motion.span
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart size={11} className="text-rose inline" fill="currentColor" />
            </motion.span>{" "}
            in Amravati, MH 🧶
          </motion.div>
          <motion.button
            onClick={scrollTop}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={11} /> Back to top
          </motion.button>
        </div>
      </div>

      {/* Sticky ORDER bar — mobile only — Instagram gradient */}
      <div className="sticky bottom-0 md:hidden" style={{ background: "linear-gradient(135deg, #f9a8d4, #c084fc, #fb923c)" }}>
        <a
          href={INSTA}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 py-4 text-white font-bold text-sm uppercase tracking-widest"
        >
          <ShoppingBag size={16} />
          Order on Instagram
        </a>
      </div>
    </footer>
  );
}
