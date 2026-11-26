# Validation — Page Load & Session UX Fixes

## Merge Criteria
- Every fix in `plan.md` is verified manually in the browser (desktop and mobile viewport `< 768px`).
- Existing frontend Vitest test suite (`npm test`) and production build (`npm run build`) pass without errors.
- No new console errors, React warnings, or broken layouts on cold load or route transitions.

## Per-Group Checks

### Group 1 — PageLoader Visual & Layout Fixes
- [ ] On mobile (`< 640px`) and desktop viewports, `<PageLoader />` displays a centered, circular, smoothly spinning teal ring with the center pulse dot.
- [ ] `prefers-reduced-motion: reduce` slows the spin animation as defined in `PageLoader.css`.

### Group 2 — Route Guards & Session Loading UX
- [ ] Navigating directly to `/dashboard` or `/login` during session check shows `<PageLoader />` instead of raw `"Checking session..."` text.
- [ ] Unauthenticated users are redirected from `/dashboard` to `/login`; authenticated users are redirected from `/login` to `/dashboard`.

### Group 3 — Auth Session Restore & Timeout Hardening
- [ ] In React `<StrictMode>` dev mode, `auth/refresh` does not cause a refresh-token rotation race or unexpected logout.
- [ ] With the backend stopped, the app exits the loading state within the configured `refreshAxios` timeout and renders the guest/login view cleanly.

### Group 4 — Suspense Boundary Placement
- [ ] Navigating between `/dashboard`, `/my-rooms`, and `/profile` keeps `AppLayout` (header, sidebar, bottom nav) mounted while lazy page chunks load.

### Group 5 — HTML & Font Loading Optimization
- [ ] `frontend/index.html` has valid HTML (`<div id="app"></div>`) and `preconnect` + stylesheet links for Google Fonts.
- [ ] `frontend/src/index.css` no longer contains external `@import url(...)` font imports; `Inter` and `Material Symbols Outlined` render properly.

## Smoke Test
- [ ] Frontend tests pass (`cd frontend && npm test`)
- [ ] Frontend builds cleanly (`cd frontend && npm run build`)
- [ ] Frontend dev server loads `/` and `/login` with zero console errors (`cd frontend && npm run dev`)

