import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Detect mobile once at module level — avoids per-render checks
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: isMobile ? 16 : 32 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: isMobile ? 0.45 : 0.7, ease: [0.2, 0.8, 0.2, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: isMobile ? 0.4 : 0.75, ease: "easeOut" },
  },
};

// On mobile, collapse horizontal slides to a simple fade to avoid blank-flash
const slideLeft: Variants = {
  hidden: { opacity: 0, x: isMobile ? 0 : -32 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: isMobile ? 0.45 : 0.7, ease: [0.2, 0.8, 0.2, 1] },
  },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: isMobile ? 0 : 32 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: isMobile ? 0.45 : 0.7, ease: [0.2, 0.8, 0.2, 1] },
  },
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: isMobile ? 0.97 : 0.93 },
  show: {
    opacity: 1, scale: 1,
    transition: { duration: isMobile ? 0.4 : 0.65, ease: [0.2, 0.8, 0.2, 1] },
  },
};

const variantMap = { fadeUp, fadeIn, slideLeft, slideRight, scaleUp };
export type RevealVariant = keyof typeof variantMap;

/**
 * Animate-in wrapper that triggers when scrolled into view.
 * On mobile: uses a generous 0px margin so elements trigger as soon as they
 * enter the viewport — prevents the "blank section" issue on short screens.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  variant = "fadeUp",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      // 0px on mobile so nothing fires too early (or too late); -60px on desktop
      viewport={{ once: true, margin: isMobile ? "0px" : "-60px" }}
      variants={variantMap[variant]}
      transition={{ delay: isMobile ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container — children animate in sequence */
export function RevealStagger({
  children,
  className,
  stagger = 0.09,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  // Reduce stagger on mobile so rows don't lag behind scroll
  const effectiveStagger = isMobile ? Math.min(stagger, 0.05) : stagger;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: isMobile ? "0px" : "-60px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: effectiveStagger,
            delayChildren: isMobile ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Child item for RevealStagger */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: isMobile ? 12 : 24 },
        show: {
          opacity: 1, y: 0,
          transition: { duration: isMobile ? 0.4 : 0.6, ease: [0.2, 0.8, 0.2, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
