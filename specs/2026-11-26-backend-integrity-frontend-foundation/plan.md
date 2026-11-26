# Plan — Backend Integrity & Defense + Frontend Foundation

## Overview
This plan covers **Phase 2 (Backend Integrity & Defense)** and **Phase 3 (Frontend Foundation)** from [specs/roadmap.md](../roadmap.md), along with automated tests for financial math, input validation, and auth UI. Work is organized sequentially by roadmap sub-section (`2.1`–`2.6` for backend hardening, followed by `3.1`–`3.5` for the frontend shell and auth flows, plus `T.1` for automated test coverage).

## Task Groups

### Group 1 — 2.1 Financial math fix
1. [x] Implement integer-cent split calculation with deterministic remainder distribution in `backend/controllers/transaction.js` (`createTrans`).
2. [x] Update `backend/controllers/settleDebt.js` to perform all balance and payment comparisons using `Math.round(val * 100)` integer cents.

### Group 2 — 2.2 Input validation
1. [x] Validate that all `custom` split member IDs belong to the target room in `backend/controllers/transaction.js`.
2. [x] Add request body sanitization middleware/utility to strip or reject MongoDB operator injection keys (`$gt`, `$ne`, keys starting with `$` or containing `.`) across routes in `backend/app.js`.
3. [x] Reject negative or zero (`<= 0`) amounts on transaction creation in `backend/controllers/transaction.js`.

### Group 3 — 2.3 Rate limiting & headers
1. [x] Install `express-rate-limit` and mount rate limiters on `/auth/login`, `/auth/send-code`, and `/room/gen-vco` in `backend/routes/`.
2. [x] Install and mount `helmet` in `backend/app.js` for standard HTTP security headers.
3. [x] Replace hardcoded CORS origin in `backend/app.js` with `process.env.CLIENT_URL` (with safe local dev fallback if unset).

### Group 4 — 2.4 Database indexes
1. [x] Add unique index on `roomCode` in `backend/models/Room.js`.
2. [x] Add compound index on `{ roomId: 1, createdAt: -1 }` and index on `splitAmong.userId` in `backend/models/Transaction.js`.
3. [x] Add index on `user` in `backend/models/RefreshToken.js`.
4. [x] Add sparse index on `passwordResetToken` in `backend/models/User.js`.

### Group 5 — 2.5 Cascade cleanup
1. [x] Update room deletion in `backend/controllers/room.js` to cascade-delete associated `Transaction`, `Chore`, and `Vco` documents.
2. [x] Update member removal in `backend/controllers/member.js` to block removal when the member has outstanding debts or is the creditor (`paidBy`) of active/unsettled transactions.

### Group 6 — 2.6 HTTP standards compliance
1. [x] Fix `getSingleTrans` in `backend/controllers/transaction.js` to return HTTP `200` instead of `201`.
2. [x] Audit all `204` responses across `backend/controllers/` and update any that include a JSON body to either return `200` or `res.status(204).end()`.
3. [x] Create `ForbiddenError` (`403`) in `backend/errors/forbidden.js`, export it from `backend/errors/index.js`, and use it for authorization failures where appropriate.

### Group 7 — 3.1 Layout architecture
1. [x] Extract shared `AppLayout.jsx` (rendering `<SideNavbar />` + `<Outlet />`) under `frontend/src/components/Layout/`.
2. [x] Nest all authenticated routes under `<ProtectedRoute>` → `<AppLayout>` in `frontend/src/App.jsx`.
3. [x] Remove duplicated sidebar/header markup from `MainLayout`, `MyRoomsPage`, `ProfilePage`, and `RoomDetailsPage`.

### Group 8 — 3.2 Mobile navigation
1. [x] Wire the mobile hamburger icon to a slide-over drawer or implement a `<BottomNav />` for viewports `<768px`.
2. [x] Audit and adjust interactive navigation and form controls so all touch targets meet the `44×44px` minimum.

### Group 9 — 3.3 Auth pages
1. [x] Build `LoginPage.jsx` under `frontend/src/pages/LoginPage/` wired to `POST /auth/login` and synchronized with `AuthContext` + `tokenStore`.
2. [x] Add a "Forgot Password?" link on `LoginPage.jsx` leading to a password-reset request page.
3. [x] Build a password-reset-with-token page (`/reset-password/:token`) wired to the backend reset endpoint.
4. [x] Fix `SendOtpForm.jsx`: resolve the `setResponseErrors` typo, add missing early return on validation failure, and guard error property access.

### Group 10 — 3.4 Form & input polish
1. [x] Build an accessible `<OtpInput />` component with auto-focus advance, backspace navigation, paste support, and `inputMode="numeric"`.
2. [x] Pass verified email from `/sendotp` → `/register` via React Router navigation `state`.
3. [x] Redirect successful registration to `/login` with an informational toast/banner.

### Group 11 — 3.5 Route & asset cleanup
1. [x] Fix `className="w-fu ll"` typo and change button label from `"Create Account"` to `"Sign In"` in `LoginForm.jsx`.
2. [x] Update `<img src="screen.png">` to `<img src="/screen.png">` so assets resolve on nested routes.
3. [x] Normalize all routes in `frontend/src/App.jsx` to lowercase kebab-case.
4. [x] Add a catch-all `<Route path="*" element={<NotFoundPage />} />` in `frontend/src/App.jsx`.

### Group 12 — Automated tests (Math, Validation & Auth UI)
1. [x] Set up `vitest` + `supertest` (and `mongodb-memory-server` if needed) in `backend/` and write tests for integer-cent split math, remainder distribution, settlement comparisons, input validation (negative/zero amounts, non-room split members, MongoDB operator injection), and HTTP status codes.
2. [x] Set up `vitest` + `@testing-library/react` in `frontend/` and write component tests for `LoginPage` / `LoginForm`, `SendOtpForm`, `<OtpInput />`, and route guards (`ProtectedRoute`).

