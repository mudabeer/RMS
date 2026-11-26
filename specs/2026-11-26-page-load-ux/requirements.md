# Requirements — Page Load & Session UX Fixes

## Source
- Trigger: Frontend page load review
- Reference: [specs/mission.md](../../specs/mission.md), [specs/tech-stack.md](../../specs/tech-stack.md)
- Branch: `feat/2026-11-26-page-load-ux`
- Date: 2026-11-26

## Scope

### In Scope
1. **PageLoader Visual & Layout Fixes**
   - Fix mobile spinner container height (`h-1` → `h-16`) and restore missing classes (`absolute inset-0 w-full h-full animate-spin-smooth text-primary`) on the animated spinner SVG in `frontend/src/components/Loaders/PageLoader.jsx`.
2. **Route Guard Loading States**
   - Replace raw `<p>Checking session...</p>` text in `ProtectedRoute.jsx` and `GuestRoute.jsx` with `<PageLoader />` (or a clean non-blocking landing experience).
   - Evaluate and prevent unnecessary blocking of the public landing page (`/`) behind `auth/refresh` on cold load when no session exists.
3. **Auth Session Restore & Request Hardening**
   - Add an `AbortController` / cancellation guard in `AuthContext.jsx` `restoreSession` effect to prevent duplicate concurrent `auth/refresh` calls under React `<StrictMode>`.
   - Add a sensible request `timeout` to `refreshAxios` (`frontend/src/api/refreshAxios.js`) so an unreachable backend does not leave the UI stuck in `loading` indefinitely.
4. **Suspense Boundary Placement**
   - Keep `AppLayout.jsx` mounted during authenticated sub-page navigation by placing a nested `<Suspense>` boundary around `<Outlet />` (or inside `AppLayout.jsx`) while keeping a top-level `<Suspense fallback={<PageLoader />}>` for top-level routes.
5. **HTML & Font Loading Optimization**
   - Fix invalid `className=""` attribute on `<div id="app">` in `frontend/index.html`.
   - Move Google Fonts (`Inter` and `Material Symbols Outlined`) from render-blocking CSS `@import` statements in `frontend/src/index.css` to `<link rel="preconnect">` + `<link rel="stylesheet">` in `frontend/index.html`.

### Out of Scope
- New backend endpoints or changes to JWT/refresh token rotation logic.
- Phase 4 core feature UI (room/expense/settlement pages).
- Adding new npm dependencies or state management libraries.

## Decisions
- **Grouping:** One task group per sub-section (Loader, Route Guards, Auth Session Restore, Suspense & Layout, Fonts & HTML).
- **Merge Criteria:** Each fix verified manually in the browser + existing Vitest test suite and Vite production build pass.

## Context
- **Audience & Principles (`mission.md`):** RMS targets mobile-first users in shared living arrangements where low friction and fast perceived load times are essential. Unstyled `"Checking session..."` flashes and broken spinners on mobile directly hurt first impressions.
- **Tech Stack (`tech-stack.md`):** React 19, Vite, Tailwind CSS 4 (`@theme` in `index.css`), React Router v7, Axios (`src/api/`), Vitest + `@testing-library/react`. No new dependencies are needed.

