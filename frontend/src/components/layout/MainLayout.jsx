import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function MainLayout() {
  const navigate = useNavigate();
  const { accessToken, user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [joinStep, setJoinStep] = useState("room");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const loadRooms = async () => {
    const response = await api.get("/room");
    setRooms(response.data?.data?.rooms ?? []);
  };

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
        await loadRooms();
      } catch (error) {
        setRoomsError(error.response?.data?.msg || "Unable to load your rooms.");
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchData();
  }, [accessToken, authLoading]);

  const openDialog = (mode) => {
    setDialog(mode);
    setSelectedRoom(null);
    setActionError("");
    setActionMessage("");
    setJoinStep("room");
    setRoomName("");
    setRoomCode("");
    setVerificationCode("");
  };

  const closeDialog = () => {
    setDialog(null);
    setSelectedRoom(null);
    setActionError("");
    setActionMessage("");
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setActionError("");
    try {
      await api.post("/room", { roomName: roomName.trim() });
      await loadRooms();
      closeDialog();
    } catch (error) {
      setActionError(error.response?.data?.msg || "Unable to create the room.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestInvite = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setActionError("");
    try {
      const response = await api.post("/room/gen-vco", { roomCode: roomCode.trim() });
      setActionMessage(response.data?.msg || "A verification code was sent to the room creator.");
      setJoinStep("verification");
    } catch (error) {
      setActionError(error.response?.data?.msg || "Unable to request a verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinRoom = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setActionError("");
    try {
      await api.patch("/room/join-room", { vco: verificationCode.trim() });
      await loadRooms();
      closeDialog();
    } catch (error) {
      setActionError(error.response?.data?.msg || "Unable to join the room.");
    } finally {
      setSubmitting(false);
    }
  };

  const openRoom = async (room) => {
    setActionError("");
    try {
      const response = await api.get(`/room/${room._id}`);
      setSelectedRoom(response.data?.data ?? room);
      setDialog("details");
    } catch (error) {
      setActionError(error.response?.data?.msg || "Unable to load room details.");
      setSelectedRoom(room);
      setDialog("details");
    }
  };

  return (
    <div className="p-container-margin md:p-xl space-y-xl bg-background">
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
        <section className="w-full max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          <button onClick={() => openDialog("create")} className="w-full min-w-0 bg-primary hover:bg-surface-tint text-on-primary rounded-xl p-lg shadow-sm flex flex-col items-start justify-between h-32 transition-all active:scale-95 group">
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
          <button onClick={() => openDialog("join")} className="w-full min-w-0 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col items-start justify-between h-32 transition-all active:scale-95 text-on-surface group">
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
          <button onClick={() => document.getElementById("my-rooms")?.scrollIntoView({ behavior: "smooth" })} className="w-full min-w-0 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col items-start justify-between h-32 transition-all active:scale-95 text-on-surface group">
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
          <div id="my-rooms" className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-xl pb-xl">
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
                  <button onClick={() => openDialog("create")} className="w-full sm:w-auto bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md font-semibold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                    <span
                      className="material-symbols-outlined text-xl"
                      data-icon="add"
                    >
                      add
                    </span>
                    Create a Room
                  </button>
                  <button onClick={() => openDialog("join")} className="w-full sm:w-auto bg-surface-container-lowest hover:bg-surface-container-low text-primary border border-outline-variant font-label-md text-label-md font-semibold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95">
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
            <div id="my-rooms" className="lg:col-span-3 space-y-md">
              <div className="flex justify-between items-end mb-md">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  My Rooms
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
                  {rooms.length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                {rooms.map((room) => <button type="button" onClick={() => navigate(`/rooms/${room._id}`)} key={room._id} className="w-full bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-variant flex flex-col h-full text-left hover:shadow-md transition-shadow">
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
                  <div className="mt-auto w-full pt-md border-t border-surface-variant">
                    <span className="w-full text-center text-primary font-label-md text-label-md hover:bg-surface-container-low py-sm rounded-lg transition-colors flex items-center justify-center gap-xs">
                      Open{" "}
                      <span
                        className="material-symbols-outlined text-sm"
                        data-icon="arrow_forward"
                      >
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </button>)}
              </div>
            </div>
            {/* Recent Activity Column*/}
            <div className="space-y-md"></div>
          </div>
        )}
        {dialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !submitting) closeDialog();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="room-dialog-title"
              className="w-full max-w-[32rem] rounded-2xl bg-surface-container-lowest p-6 shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 id="room-dialog-title" className="font-headline-md text-headline-md font-semibold text-on-surface">
                  {dialog === "create" ? "Create a room" : dialog === "join" ? "Join a room" : selectedRoom?.name || "Room details"}
                </h2>
                <button type="button" onClick={closeDialog} disabled={submitting} aria-label="Close dialog" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container disabled:opacity-50">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {dialog === "create" && (
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <label className="block text-sm font-medium text-on-surface" htmlFor="room-name">Room name</label>
                  <input id="room-name" autoFocus required maxLength={80} value={roomName} onChange={(event) => setRoomName(event.target.value)} placeholder="e.g. Greenview Flat" className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary" />
                  {actionError && <p role="alert" className="text-sm text-error">{actionError}</p>}
                  <button disabled={submitting} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-on-primary hover:bg-surface-tint disabled:opacity-60">
                    {submitting ? "Creating…" : "Create room"}
                  </button>
                </form>
              )}

              {dialog === "join" && (joinStep === "room" ? (
                <form onSubmit={handleRequestInvite} className="space-y-4">
                  <p className="text-sm text-on-surface-variant">Enter the room invite code. The room creator will receive a verification code to approve your request.</p>
                  <label className="block text-sm font-medium text-on-surface" htmlFor="room-code">Room invite code</label>
                  <input id="room-code" autoFocus required value={roomCode} onChange={(event) => setRoomCode(event.target.value)} placeholder="Enter invite code" className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary" />
                  {actionError && <p role="alert" className="text-sm text-error">{actionError}</p>}
                  <button disabled={submitting} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-on-primary hover:bg-surface-tint disabled:opacity-60">
                    {submitting ? "Requesting…" : "Request to join"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <p className="text-sm text-on-surface-variant">{actionMessage} Enter the verification code when you receive it.</p>
                  <label className="block text-sm font-medium text-on-surface" htmlFor="verification-code">Verification code</label>
                  <input id="verification-code" autoFocus required value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} placeholder="Enter verification code" className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary" />
                  {actionError && <p role="alert" className="text-sm text-error">{actionError}</p>}
                  <button disabled={submitting} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-on-primary hover:bg-surface-tint disabled:opacity-60">
                    {submitting ? "Joining…" : "Join room"}
                  </button>
                </form>
              ))}

              {dialog === "details" && selectedRoom && (
                <div className="space-y-4">
                  <p className="text-on-surface-variant">{selectedRoom.members?.length ?? 0} members</p>
                  <div className="rounded-lg bg-surface-container p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Invite code</p>
                    <p className="mt-1 break-all font-mono text-lg text-on-surface">{selectedRoom.roomCode}</p>
                  </div>
                  {actionError && <p role="alert" className="text-sm text-error">{actionError}</p>}
                  <button type="button" onClick={() => navigator.clipboard?.writeText(selectedRoom.roomCode)} className="w-full rounded-lg border border-outline-variant px-4 py-3 font-semibold text-primary hover:bg-surface-container">
                    Copy invite code
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
  );
}

export default MainLayout;
