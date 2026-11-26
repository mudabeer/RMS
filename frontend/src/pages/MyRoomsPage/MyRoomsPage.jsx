import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function MyRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [copiedRoomId, setCopiedRoomId] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/room", { params: { limit: 100 } })
      .then((response) => {
        if (active) setRooms(response.data?.data?.rooms ?? []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.msg || "Unable to load your rooms.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const visibleRooms = useMemo(() => {
    const filtered = rooms.filter((room) => room.name?.toLowerCase().includes(search.trim().toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (sort === "name") return (a.name || "").localeCompare(b.name || "");
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [rooms, search, sort]);

  const copyInviteCode = async (room) => {
    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopiedRoomId(room._id);
      window.setTimeout(() => setCopiedRoomId(null), 1800);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
    }
  };

  return (
    <div className="bg-background p-container-margin md:p-xl">
      <section className="mx-auto w-full max-w-[1200px] space-y-xl">
            <div>
              <h2 className="font-display text-display font-bold text-on-surface">Your shared spaces</h2>
              <p className="mt-2 text-on-surface-variant">Browse your rooms, find an invite code, or create a new space.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="room-search">Search rooms</label>
              <input id="room-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search rooms" className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary" />
              <label className="sr-only" htmlFor="room-sort">Sort rooms</label>
              <select id="room-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary">
                <option value="latest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>

            {loading ? <p className="text-on-surface-variant">Loading your rooms…</p> : null}
            {error ? <p role="alert" className="text-error">{error}</p> : null}
            {!loading && !error && visibleRooms.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest px-6 py-14 text-center">
                <span className="material-symbols-outlined text-4xl text-primary">holiday_village</span>
                <h3 className="mt-3 font-headline-md text-headline-md font-semibold">{search ? "No matching rooms" : "You haven't joined any rooms yet"}</h3>
                <p className="mx-auto mt-2 max-w-[28rem] text-on-surface-variant">Create a shared space or join one with an invite code to get started.</p>
                {!search && <Link to="/dashboard" className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary hover:bg-surface-tint">Go to dashboard</Link>}
              </div>
            )}

            {!loading && visibleRooms.length > 0 && (
              <>
                <p className="text-sm text-on-surface-variant">Showing {visibleRooms.length} of {rooms.length} rooms</p>
                <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-3">
                  {visibleRooms.map((room) => (
                    <article key={room._id} className="flex min-w-0 flex-col rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-lg shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <span className="material-symbols-outlined">apartment</span>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Active</span>
                      </div>
                      <h3 className="mt-4 truncate font-headline-md text-headline-md font-semibold">{room.name}</h3>
                      <p className="mt-2 text-sm text-on-surface-variant">{room.members?.length ?? 0} members</p>
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-surface-variant pt-4">
                        <span className="min-w-0 truncate font-mono text-sm text-on-surface-variant">Code: {room.roomCode}</span>
                        <button type="button" onClick={() => copyInviteCode(room)} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container">
                          {copiedRoomId === room._id ? "Copied" : "Copy code"}
                        </button>
                      </div>
                      <Link to={`/rooms/${room._id}`} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-on-primary hover:bg-surface-tint">Open room <span className="material-symbols-outlined text-lg">arrow_forward</span></Link>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
    </div>
  );
}

export default MyRoomsPage;
