# Plan — Page Load & Session UX Fixes

## Overview
Fix the visual, architectural, and performance issues identified in the frontend page load review so that initial load, session restoration, route transitions, and font rendering are smooth, mobile-friendly, and resilient to slow or unreachable backends.

## Task Groups

### Group 1 — PageLoader Visual & Layout Fixes
1. [ ] Fix the spinner container height in `frontend/src/components/Loaders/PageLoader.jsx` (`h-1` → `h-16`) so the spinner is not squashed on mobile viewports.
2. [ ] Restore the missing classes on the animated spinner `<svg>` in `frontend/src/components/Loaders/PageLoader.jsx` (`absolute inset-0 w-full h-full animate-spin-smooth text-primary`).
3. [ ] Verify `prefers-reduced-motion` behavior in `frontend/src/components/Loaders/PageLoader.css` works with the restored `.animate-spin-smooth` class.

### Group 2 — Route Guards & Session Loading UX
1. [ ] Replace `<p>Checking session..... </p>` in `frontend/src/routes/ProtectedRoute.jsx` with `<PageLoader />`.
2. [ ] Replace `<p>Checking session...</p>` in `frontend/src/routes/GuestRoute.jsx` with `<PageLoader />` (and allow `/` `LandingPage` to render without blocking on `auth/refresh` if appropriate, or ensure consistent loader styling).
3. [ ] Update `frontend/src/tests/auth.test.jsx` if needed to account for `PageLoader` / loading state assertions.

### Group 3 — Auth Session Restore & Timeout Hardening
1. [ ] Add a `timeout` (e.g., `5000` ms) to `refreshAxios` in `frontend/src/api/refreshAxios.js` so an offline/hanging backend fails fast instead of hanging the loader.
2. [ ] Add a cancellation / `AbortController` guard to `restoreSession` in `frontend/src/context/AuthContext.jsx` so React `<StrictMode>` double-invocation in development does not race two concurrent `POST auth/refresh` requests.

### Group 4 — Suspense Boundary Placement
1. [ ] Add a nested `<Suspense fallback={<PageLoader />}>` inside `frontend/src/components/layout/AppLayout.jsx` around `<Outlet />` (or a lighter content-area loader) so navigating between lazy-loaded authenticated pages keeps the sidebar and header mounted.
2. [ ] Keep the top-level `<Suspense fallback={<PageLoader />}>` in `frontend/src/App.jsx` for guest/auth and layout chunks.

### Group 5 — HTML & Font Loading Optimization
1. [ ] Fix `<div id="app" className=""></div>` → `<div id="app"></div>` in `frontend/index.html`.
2. [ ] Add `<link rel="preconnect">` for `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (`crossorigin`) and load `Inter` + `Material Symbols Outlined` via `<link rel="stylesheet">` in `frontend/index.html`.
3. [ ] Remove the render-blocking `@import url(...)` font imports from `frontend/src/index.css`.

