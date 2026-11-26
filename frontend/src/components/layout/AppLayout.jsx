import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import SideNavbar from "./SideNavbar";
import BottomNav from "./BottomNav";
import PageLoader from "../Loaders/PageLoader";

function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-on-surface font-body-md">
      <SideNavbar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:ml-64">
        <header className="flex shrink-0 items-center justify-between bg-surface px-lg py-md shadow-sm z-30">
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              RMS
            </h1>
          </div>
          <div className="flex items-center gap-xs">
            <button
              type="button"
              aria-label="Notifications"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

export default AppLayout;

