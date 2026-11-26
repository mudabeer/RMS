import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navMenu = [
  {
    title: "Dashboard",
    icon: "dashboard",
    path: "/dashboard",
  },
  {
    title: "My Rooms",
    icon: "meeting_room",
    path: "/my-rooms",
  },
  {
    title: "Profile",
    icon: "person",
    path: "/profile",
  },
];

function NavContent({ activeNav, onClose, onLogout }) {
  return (
    <>
      <div className="mb-xl flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/screen.png"
            alt="RMS Roommate Manager Logo"
            className="w-auto object-contain h-[64px]"
          />
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="md:hidden flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
      <ul className="space-y-sm flex-grow">
        {navMenu.map((nav) => (
          <li key={nav.title}>
            <NavLink
              to={nav.path}
              onClick={onClose}
              className={({ isActive }) =>
                "flex min-h-[44px] items-center gap-sm px-md py-sm transition-colors rounded-xl" +
                (isActive || activeNav === nav.title
                  ? " bg-primary text-on-primary shadow-sm"
                  : " text-on-surface-variant hover:text-primary hover:bg-surface-container-low")
              }
            >
              <span className="material-symbols-outlined">{nav.icon}</span>
              <span className="font-label-md text-label-md font-semibold">
                {nav.title}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-xl space-y-sm border-t border-surface-variant">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="w-full min-h-[44px] bg-secondary-container hover:bg-secondary text-on-secondary-container rounded-xl py-sm px-md font-label-md text-label-md font-semibold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined text-lg">add</span>{" "}
          Create Room
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[44px] flex items-center gap-sm text-on-surface-variant hover:text-error px-md py-sm hover:bg-error-container/30 rounded-xl transition-colors text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md font-medium">
            Logout
          </span>
        </button>
      </div>
    </>
  );
}

function SideNavbar({ activeNav, isOpen = false, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav
        aria-label="Sidebar navigation"
        className="hidden md:flex bg-surface-container-lowest docked left-0 h-full w-64 fixed top-0 flex-col p-md z-40 border-r border-surface-variant"
      >
        <NavContent activeNav={activeNav} onLogout={handleLogout} />
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation drawer"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
          />
          <nav className="relative z-10 flex h-full w-72 max-w-[80vw] flex-col bg-surface-container-lowest p-md shadow-xl">
            <NavContent activeNav={activeNav} onClose={onClose} onLogout={handleLogout} />
          </nav>
        </div>
      )}
    </>
  );
}

export default SideNavbar;
