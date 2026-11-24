import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function MainLayout() {
  const { accessToken, user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      setRooms([]);
      setRoomsLoading(false);
      return;
    }

    const fetchData = async () => {
      setRoomsLoading(true);
      setRoomsError("");
      try {
        const response = await api.get("/room");
        setRooms(response.data?.data?.rooms ?? []);
      } catch (error) {
        setRoomsError(error.response?.data?.msg || "Unable to load your rooms.");
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchData();
  }, [accessToken, authLoading]);

  return (
    <main className="flex-1 md:ml-64 h-full flex flex-col overflow-hidden">
      {/* TopAppBar */}
      <header className="bg-surface shadow-sm docked full-width top-0 flex justify-between items-center w-full px-lg py-md z-30 flex-shrink-0">
        <div className="md:hidden flex items-center gap-md">
          <span
            className="material-symbols-outlined text-primary text-2xl"
            data-icon="menu"
          >
            menu
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            RMS Dashboard
          </h1>
        </div>
        <div className="hidden md:block">
          <h2 className="font-headline-md text-headline-md font-bold text-primary">
            RMS Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-md">
          <button className="text-on-surface-variant hover:bg-surface-container-high p-xs rounded-full transition-colors active:scale-95">
            <span
              className="material-symbols-outlined"
              data-icon="notifications"
            >
              notifications
            </span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-high p-xs rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined" data-icon="help">
              help
            </span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant cursor-pointer">
            <img
              alt="User profile avatar"
              className="w-full h-full object-cover"
              data-alt="A small circular avatar placeholder image showing a subtle, soft grey silhouette of a person against a slightly lighter grey background. The style is minimalist and clean, suitable for a professional dashboard UI."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGakbCBgCuGAa78XvVu79dWU3NY3deK67V-WeLG77sx5k-5fhW7pW7xssjqI_m7KqNu9RD5RlKUpT9_e4vkk23fQo8FclvZp5djzpCZ86W0e7oMPtVtTzVvnnoJS2BC8x0ASRYzAlRZJnQZKv6MKiUbqBXy5JNKvKddIdFodOCiCsMHUTQRBEg7N3FT_vPcUCI8Xk5HtRnubh4HzKti-om31aGDRm4LmwihNp7R_yGxqRdME2sNyVx"
            />
          </div>
        </div>
      </header>
      {/* Scrollable Canvas*/}
      <div className="flex-1 overflow-y-auto p-container-margin md:p-xl space-y-xl bg-background">
        {/* Greeting Section*/}
        <section className="max-w-[1200px] mx-auto">
          <h1 className="font-display text-display text-on-surface md:font-display md:text-display font-headline-lg-mobile text-headline-lg-mobile">
            Good Evening{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-base">
            Here's what's happening in your shared spaces.
          </p>
        </section>
        {/* Quick Actions (Bento Style)*/}
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
        {/* Main Layout Grid*/}
        {roomsLoading ? (
          <p className="max-w-[1200px] mx-auto text-on-surface-variant">Loading your rooms…</p>
        ) : roomsError ? (
          <p role="alert" className="max-w-[1200px] mx-auto text-error">{roomsError}</p>
        ) : rooms.length === 0 ? (
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-xl pb-xl">
            <div className="lg:col-span-3 space-y-md">
              <div className="flex justify-between items-end mb-md">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    My Rooms
                  </h2>
                  <p className="text-on-surface-variant text-sm mt-0.5">
                    Manage your current flats and hostel spaces
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
                  0 Active
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/70 p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-primary/50">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-8 ring-primary/5">
                    <span
                      className="material-symbols-outlined text-4xl"
                      data-icon="holiday_village"
                    >
                      holiday_village
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
                    <span
                      className="material-symbols-outlined text-base font-bold"
                      data-icon="add"
                    >
                      add
                    </span>
                  </div>
                </div>

                <h3 className="font-headline-md text-headline-md font-bold text-on-surface ">
                  You haven't joined any rooms yet
                </h3>
                <p
                  className="self-stretch mx-auto font-body-md text-body-md text-on-surface-variant mt-2 mb-8 leading-relaxed"
                  style={{ width: "min(100%, 28rem)" }}
                >
                  Create your own shared living space or enter an invite code to
                  join your roommates and start splitting expenses and chores.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md font-semibold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                    <span
                      className="material-symbols-outlined text-xl"
                      data-icon="add"
                    >
                      add
                    </span>
                    Create a Room
                  </button>
                  <button className="w-full sm:w-auto bg-surface-container-lowest hover:bg-surface-container-low text-primary border border-outline-variant font-label-md text-label-md font-semibold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                    <span
                      className="material-symbols-outlined text-xl"
                      data-icon="key"
                    >
                      key
                    </span>
                    Join with Code
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-surface-variant/60 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                  <span
                    className="material-symbols-outlined text-sm text-primary"
                    data-icon="lightbulb"
                  >
                    lightbulb
                  </span>
                  <span>
                    Need help? Check out our{" "}
                    <a
                      className="text-primary font-medium underline hover:text-surface-tint"
                      href="#"
                    >
                      quick start guide
                    </a>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-md"></div>
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-xl pb-xl">
            {/* My Rooms Column (Spans 2 on large screens)*/}
            <div className="lg:col-span-3 space-y-md">
              <div className="flex justify-between items-end mb-md">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  My Rooms
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
                  {rooms.length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                {rooms.map((room) => <div key={room._id} className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col h-full hover:shadow-md transition-shadow">
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
                    {room.name}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs mt-base mb-lg">
                    <span
                      className="material-symbols-outlined text-lg"
                      data-icon="group"
                    >
                      group
                    </span>{" "}
                    {room.members?.length ?? 0} Members
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
                </div>)}
              </div>
            </div>
            {/* Recent Activity Column*/}
            <div className="space-y-md"></div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MainLayout;
