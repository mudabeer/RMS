import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section
      className="px-container-margin py-lg flex flex-col md:flex-row gap-lg mt-sm md:mt-lg items-center max-w-7xl mx-auto"
      id="hero"
    >
      <div className="flex flex-col gap-sm md:w-1/2 text-left items-start">
        <span className="text-primary font-label-md text-label-md tracking-wider uppercase fade-in-up-element stagger-1">
          Welcome to RMS
        </span>
        <h1 className="font-headline-lg-mobile md:font-display md:text-display text-headline-lg-mobile text-on-surface fade-in-up-element stagger-2">
          Manage Your Roommates with Ease
        </h1>
        <p className="font-body-md md:font-body-lg md:text-body-lg text-body-md text-on-surface-variant mt-sm fade-in-up-element stagger-3">
          Simplify shared living. Track expenses, organize chores, and manage
          debts effortlessly in one unified space.
        </p>
        <div className="flex flex-col sm:flex-row w-full gap-sm mt-md">
          <button
            className="w-full sm:w-auto px-8 h-[48px] bg-primary text-on-primary rounded-[12px] font-label-md text-label-md btn-press transition-all shadow-level-1 flex items-center justify-center fade-in-up-element stagger-4 tactile-widget"
            onClick={() => {
              navigate("/sendotp");
            }}
          >
            Get Started
          </button>
          <button className="w-full sm:w-auto px-8 h-[48px] bg-secondary-container text-on-secondary-container rounded-[12px] font-label-md text-label-md btn-press transition-all shadow-level-1 flex items-center justify-center fade-in-up-element stagger-5 tactile-widget">
            Contact us
          </button>
        </div>
      </div>
      <div className="relative w-full md:w-1/2 aspect-[4/3] mt-md md:mt-0 rounded-[12px] overflow-hidden shadow-level-1 bg-surface-container-low/50 backdrop-blur-sm flex items-center justify-center fade-in-up-element stagger-5 animate-float border border-outline-variant/20">
        {/*Abstract Representation of UI layers for hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-variant/30 to-surface-container/30 opacity-50"></div>
        <div className="relative w-3/4 h-3/4 bg-surface rounded-[12px] shadow-level-1 border border-outline-variant/20 flex flex-col p-4 transform rotate-2">
          <div className="w-12 h-4 bg-primary-container rounded-[12px] mb-4"></div>
          <div className="w-full h-8 bg-surface-container-low rounded-[12px] mb-2"></div>
          <div className="w-full h-8 bg-surface-container-low rounded-[12px] mb-2"></div>
          <div className="w-2/3 h-8 bg-surface-container-low rounded-[12px]"></div>
        </div>
        <div className="absolute w-2/3 h-1/2 bg-surface rounded-[12px] shadow-level-1 border border-outline-variant/20 top-8 left-4 flex flex-col p-4 transform -rotate-3">
          <div className="flex justify-between items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary-container"></div>
            <div className="w-16 h-4 bg-surface-container-low rounded-full"></div>
          </div>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-primary"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
