
import Header from "../../components/layout/Header"

function MainLayout(){
    return (
        <main className="flex-1 md:ml-64 h-full flex flex-col overflow-hidden">
        {/* TopAppBar */}
        <Header />
        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-container-margin md:p-xl space-y-xl bg-background">
          {/* Greeting Section */}
          <section className="max-w-[1200px] mx-auto">
            <h1 className="font-display text-display text-on-surface md:font-display md:text-display font-headline-lg-mobile text-headline-lg-mobile">
              Good Evening, John
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-base">
              Here's what's happening in your shared spaces.
            </p>
          </section>
          {/* Quick Actions (Bento Style) */}
          <section className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-md">
            <button className="bg-primary hover:bg-surface-tint text-on-primary rounded-xl p-lg shadow-sm flex flex-col items-start justify-between h-32 transition-all active:scale-95 group">
              <div className="bg-on-primary/20 p-xs rounded-lg group-hover:bg-on-primary/30 transition-colors">
                <span
                  className="material-symbols-outlined text-on-primary"
                  data-icon="add_circle"
                >
                  add_circle
                </span>
              </div>
              <span className="font-headline-md text-headline-md font-semibold">
                + Create Room
              </span>
            </button>
            <button className="bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col items-start justify-between h-32 transition-all active:scale-95 text-on-surface group">
              <div className="bg-surface-variant p-xs rounded-lg group-hover:bg-surface-container-high transition-colors">
                <span
                  className="material-symbols-outlined text-primary"
                  data-icon="login"
                >
                  login
                </span>
              </div>
              <span className="font-headline-md text-headline-md font-semibold">
                Join Room
              </span>
            </button>
            <button className="bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col items-start justify-between h-32 transition-all active:scale-95 text-on-surface group">
              <div className="bg-surface-variant p-xs rounded-lg group-hover:bg-surface-container-high transition-colors">
                <span
                  className="material-symbols-outlined text-primary"
                  data-icon="visibility"
                >
                  visibility
                </span>
              </div>
              <span className="font-headline-md text-headline-md font-semibold">
                View My Rooms
              </span>
            </button>
          </section>
          {/* Main Layout Grid */}
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-xl pb-xl">
            {/* My Rooms Column (Spans 2 on large screens) */}
            <div className="lg:col-span-2 space-y-md">
              <div className="flex justify-between items-end mb-md">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  My Rooms
                </h2>
                <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-base">
                  + Create Room
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {/* Room Card 1 */}
                <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-primary text-2xl"
                        data-icon="home_work"
                      >
                        home_work
                      </span>
                    </div>
                    <span className="bg-primary-container/10 text-primary font-label-sm text-label-sm px-sm py-base rounded-full">
                      Active
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Flat 302
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs mt-base mb-lg">
                    <span
                      className="material-symbols-outlined text-lg"
                      data-icon="group"
                    >
                      group
                    </span>{" "}
                    4 Members
                  </p>
                  <div className="mt-auto pt-md border-t border-surface-variant">
                    <button className="w-full text-center text-primary font-label-md text-label-md hover:bg-surface-container-low py-sm rounded-lg transition-colors flex items-center justify-center gap-xs">
                      Open{" "}
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="arrow_forward"
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
                {/* Room Card 2 */}
                <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-primary text-2xl"
                        data-icon="apartment"
                      >
                        apartment
                      </span>
                    </div>
                    <span className="bg-primary-container/10 text-primary font-label-sm text-label-sm px-sm py-base rounded-full">
                      Active
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Hostel A
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs mt-base mb-lg">
                    <span
                      className="material-symbols-outlined text-lg"
                      data-icon="group"
                    >
                      group
                    </span>{" "}
                    3 Members
                  </p>
                  <div className="mt-auto pt-md border-t border-surface-variant">
                    <button className="w-full text-center text-primary font-label-md text-label-md hover:bg-surface-container-low py-sm rounded-lg transition-colors flex items-center justify-center gap-xs">
                      Open{" "}
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="arrow_forward"
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Activity Column */}
            <div className="space-y-md"></div>
          </div>
        </div>
      </main>
    )
}

export default MainLayout