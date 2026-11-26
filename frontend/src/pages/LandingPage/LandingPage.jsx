import LandingFooter from "./LandingFooter";
import LandingHeader from "./LandingHeader";
import ShaderBackground from "./ShaderBackground";
import "./LandingPage.css";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import HeroSection from "./HeroSection";

function LandingPage() {

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

export default LandingPage