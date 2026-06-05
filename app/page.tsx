import CinematicScene from "./components/CinematicScene";
import Navbar from "./components/Navbar";
import FireChapterSection, {
  SourceChapterSection,
  ResultChapterSection,
} from "./components/NarrativeChapters";
import SignaturePizzasSection from "./components/SignaturePizzasSection";
import ReservationCTA from "./components/ReservationCTA";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";

/**
 * Page structure — three-chapter scroll narrative:
 *
 *   Hero         CinematicScene     Pinned — GSAP pizza image sequence
 *   Chapter I    FireChapter        Pinned — oven
 *   Chapter II   SourceChapter      Pinned — tomato → mozzarella → basil
 *   Chapter III  ResultChapter      Pinned — cut → slice → whole pizza
 *   SignaturePizzasSection · ReservationCTA
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
        <ResultChapterSection />

        <SignaturePizzasSection />

        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
