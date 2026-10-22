
  const navMenu = [
    {
      "title":"Dashboard",
      "icon":"dashboard",
    },
    {
      "title":"My Rooms",
      "icon":"meeting_room"
    },
    {
      "title":"Profile",
      "icon":'person'
    }
  ]

function SideNavbar({activeNav}) {
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
          <a
            className={"flex items-center gap-sm px-md py-sm transition-colors  rounded-xl" + (activeNav === nav.title?" bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low")}
            href={nav.title.replace(" ","")}
          >
            <span className="material-symbols-outlined" data-icon="dashboard">
              {nav.icon}
            </span>
            <span className="font-label-md text-label-md font-semibold">
              {nav.title}
            </span>
          </a>
        </li>
          )
        })}
      </ul>
      <div className="mt-auto pt-xl space-y-sm border-t border-surface-variant">
        <button className="w-full bg-secondary-container hover:bg-secondary text-on-secondary-container rounded-xl py-sm px-md font-label-md text-label-md font-semibold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-xs">
          <span className="material-symbols-outlined text-lg" data-icon="add">
            add
          </span>{" "}
          Create Room
        </button>
        <a
          className="flex items-center gap-sm text-on-surface-variant hover:text-error px-md py-sm hover:bg-error-container/30 rounded-xl transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined" data-icon="logout">
            logout
          </span>
          <span className="font-label-md text-label-md font-medium">
            Logout
          </span>
        </a>
      </div>
    </nav>
  );
}

export default SideNavbar