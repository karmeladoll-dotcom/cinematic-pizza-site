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

/**
 * Page structure — cinematic five-chapter scroll narrative:
 *
 *   Hero         CinematicScene     Pinned — GSAP pizza image sequence
 *   Chapter I    FireChapter        Pinned — oven → flour
 *   Chapter II   SourceChapter      Pinned — tomato → mozzarella → basil
 *   Chapter III  CraftChapter       Sequential — dough-work (defining shot)
 *   Chapter IV   ResultChapter      Sequential — cut → slice → whole pizza
 *   SignaturePizzasSection · ExclusivitySection · ReservationCTA
 */
export default function Home() {
  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main style={{ margin: 0, padding: 0, background: "#000" }}>
        <CinematicScene />
        <FireChapterSection />
        <SourceChapterSection />
        <CraftChapterSection />
        <ResultChapterSection />

        <SignaturePizzasSection />

        <ReserveCtaInline />

        <ExclusivitySection />

        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
