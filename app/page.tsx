import CinematicScene from "./components/CinematicScene";
import Navbar from "./components/Navbar";
import StorySection from "./components/StorySection";
import IngredientsSection from "./components/IngredientsSection";
import SignaturePizzasSection from "./components/SignaturePizzasSection";
import ReservationCTA from "./components/ReservationCTA";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import CinematicAmbient from "./components/CinematicAmbient";
import AtmosphericBridge from "./components/AtmosphericBridge";

export default function Home() {
  return (
    <>
      <GrainOverlay />
      {/* Global ambient flour/smoke particles — appear after hero exits */}
      <CinematicAmbient />
      <Navbar />
      <main>
        <CinematicScene />
        {/* ember sparks carry the fire from the hero into the story */}
        <AtmosphericBridge variant="ember" />
        <StorySection />
        {/* basil leaves transition from philosophy into craft */}
        <AtmosphericBridge variant="basil" />
        <IngredientsSection />
        {/* flour cloud bridges ingredients into the pizza showcase */}
        <AtmosphericBridge variant="flour" />
        <SignaturePizzasSection />
        {/* smoke haze softens the transition into the reservation */}
        <AtmosphericBridge variant="smoke" />
        <ReservationCTA />
      </main>
      <Footer />
    </>
  );
}
