import profile from '../../assets/profile.jpg'
function Header() {
  return (
    <header className="bg-surface shadow-sm top-0 flex justify-between items-center w-full px-lg py-md z-30 flex-shrink-0">
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
              <span className="material-symbols-outlined" data-icon="notifications">
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
                src={profile}
              />
            </div>
          </div>
        </header>
  );
}

export default Header