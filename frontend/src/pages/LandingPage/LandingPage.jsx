import LandingFooter from "./LandingFooter";
import LandingHeader from "./LandingHeader";
import ShaderBackground from "./ShaderBackground";
import "./LandingPage.css";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowitWorksSection";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import HeroSection from "./HeroSection";

export function LandingPage() {

  useScrollAnimation();

  return (
    <>
      <ShaderBackground/>

      <LandingHeader />

      <main>
        <HeroSection />
        

        <FeaturesSection />

        <HowItWorksSection />
      </main>

      <LandingFooter />
    </>
  );
}
