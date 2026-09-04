function LandingHeader() {
  return (
    <header  className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md shadow-sm flex justify-between items-center px-container-margin h-16 border-b border-outline-variant/10">
      <div className="flex items-center gap-sm">
        <span
          className="material-symbols-outlined text-primary dark:text-primary-fixed-dim"
          data-icon="home_work"
        >
          home_work
        </span>
        <span className="font-display text-display text-primary dark:text-primary-fixed-dim">
          RMS
        </span>
      </div>
      <button className="active:scale-95 transition-transform duration-200 block md:hidden tactile-widget btn-press">
        <span
          className="material-symbols-outlined text-primary dark:text-primary-fixed-dim hover:bg-surface-variant/50 dark:hover:bg-surface-container-highest/50 p-2 rounded-full"
          data-icon="menu"
        >
          menu
        </span>
      </button>
      <nav className="hidden md:flex gap-lg items-center">
        <a
          className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
          href="#features"
        >
          Features
        </a>
        <a
          className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
          href="#how-it-works"
        >
          How it Works
        </a>
        <button className="h-10 px-6 bg-primary text-on-primary rounded-[12px] font-label-md text-label-md btn-press transition-all shadow-level-1 tactile-widget">
          Get Started
        </button>
      </nav>
    </header>
  );
}

export default LandingHeader;
