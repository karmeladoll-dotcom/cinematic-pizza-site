import CinematicScene from "./components/CinematicScene";
import Navbar from "./components/Navbar";
import StorySection from "./components/StorySection";
import IngredientsSection from "./components/IngredientsSection";
import SignaturePizzasSection from "./components/SignaturePizzasSection";
import ReserveCtaInline from "@/components/ReserveCtaInline";
import ExclusivitySection from "@/components/ExclusivitySection";
import ReservationCTA from "./components/ReservationCTA";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import CinematicAmbient from "./components/CinematicAmbient";
import AtmosphericBridge from "./components/AtmosphericBridge";

/**
 * Page structure — each section is a "chapter" in the film:
 *
 *   Hero         CinematicScene     Pinned ~5500 px — pizza image sequence
 *   Chapter I    StorySection       Pinned ~2500 px — word-by-word manifesto
 *   Chapter II   IngredientsSection Pinned ~3000 px — three ingredient frames
 *   ──── AtmosphericBridge (flour) ────────────────────────────────────────
 *   Chapter III  SignaturePizzasSection   Normal scroll — editorial pizza list
 *   ──── AtmosphericBridge (smoke) ────────────────────────────────────────
 *   Exclusivity  ExclusivitySection Normal scroll — scarcity moment + CTA
 *   Chapter IV   ReservationCTA     Normal scroll — invitation + form
 *
 * No bridges between pinned sections — each carries its own atmospheric
 * entrance (oven glow, smoke haze, gradient bleed from the hero).
 * Bridges appear only between the pinned block and the normal-scroll sections,
 * and between the two normal-scroll sections.
 */
export default function Home() {
  return (
    <>
      <GrainOverlay />
      {/* Global flour + ember ambient particles — emerge as hero exits */}
      <CinematicAmbient />
      <Navbar />
      <main>
        {/* ── Pinned block: hero → philosophy → source ── */}
        <CinematicScene />
        <StorySection />
        <IngredientsSection />

        {/* Flour-cloud bridge: pinned block → cinematic pizza list */}
        <AtmosphericBridge variant="flour" />

        {/* ── Normal-scroll chapters ── */}
        <SignaturePizzasSection />

        <ReserveCtaInline />

        {/* Smoke bridge: pizzas → exclusivity */}
        <AtmosphericBridge variant="smoke" />

        <ExclusivitySection />

        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
