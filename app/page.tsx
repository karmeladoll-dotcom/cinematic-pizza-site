import CinematicScene from "./components/CinematicScene";
import Navbar from "./components/Navbar";
import FireChapterSection, {
  SourceChapterSection,
  CraftChapterSection,
  ResultChapterSection,
} from "./components/NarrativeChapters";
import SignaturePizzasSection from "./components/SignaturePizzasSection";
import ReserveCtaInline from "@/components/ReserveCtaInline";
import ExclusivitySection from "@/components/ExclusivitySection";
import ReservationCTA from "./components/ReservationCTA";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import CinematicAmbient from "./components/CinematicAmbient";
import AtmosphericBridge from "./components/AtmosphericBridge";

/**
 * Page structure — cinematic five-chapter scroll narrative:
 *
 *   Hero         CinematicScene        Pinned — GSAP pizza image sequence
 *   Chapter I    FireChapter           Pinned — oven → flour → dough
 *   Chapter II   SourceChapter         Pinned — tomato → mozzarella → basil
 *   Chapter III  CraftChapter          Sequential — dough-work → sauce → oil → prep
 *   Chapter IV   ResultChapter         Sequential — cut → slice → whole pizza
 *   ──── AtmosphericBridge (flour) ────────────────────────────────────────
 *   SignaturePizzasSection
 *   ExclusivitySection
 *   ReservationCTA
 */
export default function Home() {
  return (
    <>
      <GrainOverlay />
      <CinematicAmbient />
      <Navbar />
      <main>
        <CinematicScene />
        <FireChapterSection />
        <SourceChapterSection />
        <CraftChapterSection />
        <ResultChapterSection />

        <AtmosphericBridge variant="flour" />

        <SignaturePizzasSection />

        <ReserveCtaInline />

        <AtmosphericBridge variant="smoke" />

        <ExclusivitySection />

        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
