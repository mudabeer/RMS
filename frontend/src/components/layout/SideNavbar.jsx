
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navMenu = [
    {
      "title":"Dashboard",
      "icon":"dashboard",
      "path":"/Dashboard",
    },
    {
      "title":"My Rooms",
      "icon":"meeting_room",
      "path":"/MyRooms",
    },
    {
      "title":"Profile",
      "icon":'person',
      "path":"/Profile",
    }
  ]

function SideNavbar({activeNav}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="hidden md:flex bg-surface-container-lowest docked left-0 h-full w-64 fixed top-0 flex flex-col p-md z-40 border-surface-variant">
      <div className="mb-xl">
        <div className="flex items-center mb-xs">
          <img
            src="screen.png"
            alt="RMS Roommate Manager Logo"
            className="w-auto object-contain h-[72px]"
          />
        </div>
      </div>
      <ul className="space-y-sm flex-grow">
        {navMenu.map((nav) => {
          return (
            <li className="" key={nav.title}>
          <NavLink
            to={nav.path}
            className={({ isActive }) => "flex items-center gap-sm px-md py-sm transition-colors rounded-xl" + (isActive || activeNav === nav.title ? " bg-primary text-on-primary shadow-sm" : " text-on-surface-variant hover:text-primary hover:bg-surface-container-low")}
          >
            <span className="material-symbols-outlined" data-icon="dashboard">
              {nav.icon}
            </span>
            <span className="font-label-md text-label-md font-semibold">
              {nav.title}
            </span>
          </NavLink>
        </li>
          )
        })}
      </ul>
      <div className="mt-auto pt-xl space-y-sm border-t border-surface-variant">
        <Link to="/Dashboard" className="w-full bg-secondary-container hover:bg-secondary text-on-secondary-container rounded-xl py-sm px-md font-label-md text-label-md font-semibold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-xs">
          <span className="material-symbols-outlined text-lg" data-icon="add">
            add
          </span>{" "}
          Create Room
        </Link>
        <button type="button" onClick={handleLogout}
          className="w-full flex items-center gap-sm text-on-surface-variant hover:text-error px-md py-sm hover:bg-error-container/30 rounded-xl transition-colors text-left"
        >
          <span className="material-symbols-outlined" data-icon="logout">
            logout
          </span>
          <span className="font-label-md text-label-md font-medium">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
}

export default SideNavbar
