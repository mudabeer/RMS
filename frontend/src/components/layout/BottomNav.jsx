import { NavLink } from "react-router-dom";

const navItems = [
  { title: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { title: "My Rooms", icon: "meeting_room", path: "/my-rooms" },
  { title: "Profile", icon: "person", path: "/profile" },
];

function BottomNav() {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-40 flex md:hidden items-center justify-around border-t border-surface-variant bg-surface-container-lowest px-sm py-xs shadow-lg"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-sm py-xs text-xs font-semibold transition-colors ${
              isActive
                ? "text-primary bg-primary/10"
                : "text-on-surface-variant hover:text-primary"
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;

