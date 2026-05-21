import CinematicScene from "./components/CinematicScene";
import Navbar from "./components/Navbar";
import StorySection from "./components/StorySection";
import IngredientsSection from "./components/IngredientsSection";
import SignaturePizzasSection from "./components/SignaturePizzasSection";
import ReservationCTA from "./components/ReservationCTA";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";

export default function Home() {
  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main>
        <CinematicScene />
        <StorySection />
        <IngredientsSection />
        <SignaturePizzasSection />
        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
