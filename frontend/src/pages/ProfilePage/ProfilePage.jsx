import { useEffect, useState } from "react";
import api from "../../api/axios";
import SideNavbar from "../../components/layout/SideNavbar";
import { useAuth } from "../../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/auth/profile")
      .then((response) => {
        if (active) setProfile(response.data?.data ?? user);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.msg || "Unable to load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const initials = profile?.name?.trim()?.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-on-surface">
      <SideNavbar activeNav="Profile" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden md:ml-64">
        <header className="flex shrink-0 items-center bg-surface px-lg py-md shadow-sm">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Profile</h1>
        </header>
        <div className="flex-1 overflow-y-auto bg-background p-container-margin md:p-xl">
          <section className="mx-auto w-full max-w-[900px] space-y-xl">
            <div>
              <h2 className="font-display text-display font-bold text-on-surface">Your profile</h2>
              <p className="mt-2 text-on-surface-variant">View the account details associated with your RMS account.</p>
            </div>

            {loading && <p className="text-on-surface-variant">Loading your profile…</p>}
            {error && <p role="alert" className="text-error">{error}</p>}
            {!loading && profile && (
              <article className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm">
                <div className="flex flex-col items-center gap-5 border-b border-surface-variant bg-surface-container-low p-8 text-center sm:flex-row sm:text-left">
                  <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-on-primary">{initials}</div>
                  <div className="min-w-0">
                    <h3 className="break-words font-headline-md text-headline-md font-semibold">{profile.name || "RMS user"}</h3>
                    <p className="mt-1 break-all text-on-surface-variant">{profile.email || "Email unavailable"}</p>
                  </div>
                </div>
                <dl className="divide-y divide-surface-variant px-6">
                  <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-on-surface-variant">Full name</dt>
                    <dd className="break-words font-medium">{profile.name || "Not provided"}</dd>
                  </div>
                  <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-on-surface-variant">Email address</dt>
                    <dd className="break-all font-medium">{profile.email || "Not provided"}</dd>
                  </div>
                  <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-on-surface-variant">Account ID</dt>
                    <dd className="break-all font-mono text-sm">{profile.id || profile._id || "Unavailable"}</dd>
                  </div>
                </dl>
              </article>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
