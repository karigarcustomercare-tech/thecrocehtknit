import { createFileRoute } from "@tanstack/react-router";
import { useScroll, useSpring, motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Catalog } from "@/components/site/Catalog";
import { ChallengeStrip } from "@/components/site/ChallengeStrip";
import { Customizer } from "@/components/site/Customizer";
import { Gallery } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

/** Thin scroll-progress bar at the very top of the page */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] origin-left rounded-full bg-gradient-to-r from-sage via-terra to-caramel"
      style={{ scaleX }}
    />
  );
}

const Divider = ({ color = "sage" }: { color?: "sage" | "terra" | "caramel" }) => (
  <div className="mx-auto max-w-5xl px-6">
    <div className={`h-px bg-gradient-to-r from-transparent via-${color}/20 to-transparent`} />
  </div>
);

function Index() {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />

        <Divider color="sage" />

        <About />

        <Divider color="terra" />

        <Catalog />

        <Divider color="sage" />

        {/* 30-Day Challenge — daily product launch */}
        {/* <ChallengeStrip /> */}
    
        <Divider color="terra" />

        <Customizer />

        <Divider color="sage" />

        <Gallery />

        <Divider color="caramel" />

        <Testimonials />

        <Divider color="sage" />

        <Contact />
      </main>
      <Footer />
    </div>
  );
}
