import CinematicScene from "./components/CinematicScene";
import Navbar from "./components/Navbar";
import NarrativeStage from "./components/NarrativeStage";
import SignaturePizzasSection from "./components/SignaturePizzasSection";
import ReservationCTA from "./components/ReservationCTA";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import SmoothScroll from "./components/SmoothScroll";

/**
 * Page structure:
 *
 *   Hero         CinematicScene   Pinned — GSAP pizza image sequence
 *   Stage        NarrativeStage   ONE pin: Chapter I (oven), II (source), III (result)
 *   Menu         SignaturePizzasSection (rises over the stage like a curtain)
 *   ReservationCTA
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <GrainOverlay />
      <Navbar />
      <main style={{ margin: 0, padding: 0, background: "#000" }}>
        <CinematicScene />
        <NarrativeStage />

        <SignaturePizzasSection />

        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
