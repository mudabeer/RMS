import './PageLoader.css' 

function PageLoader() {
  return (

      <section className="bg-white overflow-hidden h-full min-h-dvh ">

        <div className=" min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/50 to-white relative ">
          {/* PageLoader Visual Unit */}
          <div className="flex flex-col items-center gap-4 text-center max-w-xs" role="status" aria-live="polite" aria-busy="true">
            {/* Spinner Container with Primary RMS Color & Mint Accent Aura */}
            <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px]">
              {/* Soft background track */}
              <svg className="w-full h-full text-slate-200" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4"></circle>
              </svg>
              {/* Animated SVG Spinner with primary teal */}
              <svg className="absolute inset-0 w-full h-full animate-spin-smooth text-primary" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="80" strokeDashoffset="60"></circle>
              </svg>
              {/* Center pulse dot */}
              <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-[#00f5e6] shadow-[0_0_8px_#00f5e6]"></div>
            </div>

            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-800 tracking-tight">Loading RMS Workspace...</p>
              <p className="text-base text-slate-500">Preparing your rooms, debts & expenses</p>
            </div>
            <span className="sr-only">Loading application content, please wait...</span>
          </div>
        </div>

      </section>

  );
}

export default PageLoader;
