  function LandingFooter() {
    return (
      <footer className="bg-surface-container-low/80 dark:bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant/20 w-full rounded-t-[12px] flex flex-col md:flex-row items-center justify-between gap-md px-container-margin py-lg  mt-auto">
        <span className="font-headline-md text-headline-md text-primary">RMS</span>
        <div className="flex flex-col md:flex-row items-center gap-sm md:gap-lg font-body-md text-body-md">
          <a
            className="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
            href="#"
          >
            Contact Support
          </a>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant text-center mt-sm md:mt-0 text-sm">
          © 2024 Roommate Management System. All rights reserved.
        </p>
      </footer>
    );
  }

  export default LandingFooter;
