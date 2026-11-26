import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-lg text-center text-on-surface">
      <span className="material-symbols-outlined text-6xl text-primary">
        explore_off
      </span>
      <h1 className="mt-md font-display text-display font-bold">
        Page not found
      </h1>
      <p className="mt-sm max-w-[26rem] text-on-surface-variant">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-lg inline-flex min-h-[44px] items-center gap-xs rounded-xl bg-primary px-lg py-sm font-semibold text-on-primary hover:bg-surface-tint"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;

