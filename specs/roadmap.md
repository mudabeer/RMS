# Roadmap

> Derived from the [Engineering Review & Improvements Roadmap](../improvements.md).
> Each phase is a small, shippable unit of work. Phases are ordered by dependency and severity.

---

## Phase 0 — Critical Bug Fixes (P0)

**Goal:** Make the existing code stop crashing and stop being exploitable. Zero new features.

### 0.1 Backend crash & logic fixes
- [x] Fix static `Date.now()` evaluation in `Vco.js` — use a function getter so TTL is computed per-document.
- [x] Fix `'Paid' || 'Partial'` operator precedence bug in `transaction.js:deleteTrans`.
- [x] Fix `[object Object]` in error handler — map `item.message` in Mongoose `ValidationError` formatting.

### 0.2 Backend authorization fix
- [x] Restrict debt settlement (`settleDebt.js`) to the creditor (`paidBy`) only (BOLA/IDOR fix).
- [x] Add positive-number validation on payment amounts.

### 0.3 Frontend crash fixes
- [x] Wrap lazy-loaded routes in `<Suspense fallback={<PageLoader />}>` in `App.jsx`.
- [x] Fix `tokenStore(null)` → `tokenStore.set(null)` in `axios.js` interceptor.
- [x] Remove `body` flex/center styles from `AuthPage.css`; scope to `.auth-page-container`.

---

## Phase 1 — Auth & Session Hardening

**Goal:** Make authentication reliable and secure for real users.

### 1.1 Token flow reconciliation
- [x] Decide: read access token from cookie or `Authorization` header — reconcile `authentication.js` with `cookies.js`.
- [x] Add `_retry` flag to Axios interceptor to prevent infinite refresh loops.
- [x] Synchronize `tokenStore.set(token)` with `AuthContext` state.

### 1.2 Refresh token rotation
- [x] Replace bcrypt with SHA-256 for refresh token hashing.
- [x] Implement Refresh Token Rotation (RTR) — issue a new refresh token on every `/refresh`, delete the old one.
- [x] Add token-reuse detection: if a deleted token is presented, revoke all sessions for that user.

### 1.3 Session invalidation
- [x] Delete all refresh tokens on password reset (`auth.js`).
- [ ] Delete all refresh tokens on password change (if added later).

### 1.4 OTP hardening
- [x] Replace `Math.random()` with `crypto.randomInt` in `generateOTP.js`.

---

## Phase 2 — Backend Integrity & Defense

**Goal:** Data stays correct and the API is resistant to abuse.

### 2.1 Financial math fix
- [x] Implement integer-cent split calculation with remainder distribution in `transaction.js:createTrans`.
- [x] Update `settleDebt.js` to use `Math.round(val * 100)` comparisons.

### 2.2 Input validation
- [x] Validate that custom-split member IDs belong to the room (`transaction.js`).
- [x] Sanitize request bodies against MongoDB operator injection (`$gt`, `$ne`).
- [x] Validate negative/zero amounts on transaction creation.

### 2.3 Rate limiting & headers
- [x] Mount `express-rate-limit` on `/auth/login`, `/auth/send-code`, `/room/gen-vco`.
- [x] Mount `helmet` for standard security headers.
- [x] Move CORS origin from hardcoded string to `process.env.CLIENT_URL`.

### 2.4 Database indexes
- [x] Add index on `Room.roomCode` (unique).
- [x] Add compound index on `Transaction.roomId` + `createdAt`.
- [x] Add index on `Transaction.splitAmong.userId`.
- [x] Add index on `RefreshToken.user`.
- [x] Add sparse index on `User.passwordResetToken`.

### 2.5 Cascade cleanup
- [x] On room deletion: delete associated `Transaction`, `Chore`, and `Vco` documents.
- [x] On member removal: block if member has outstanding debts or is creditor of active transactions.

### 2.6 HTTP standards compliance
- [x] Fix `getSingleTrans` returning 201 → 200.
- [x] Fix 204 responses that include a JSON body → use 200 or `res.status(204).end()`.
- [x] Add `ForbiddenError` (403) class to `errors/`.

---

## Phase 3 — Frontend Foundation

**Goal:** A usable, navigable app shell that covers auth and room basics.

### 3.1 Layout architecture
- [x] Extract shared `AppLayout.jsx` with `<SideNavbar />` + `<Outlet />`.
- [x] Nest all authenticated routes under `<ProtectedRoute>` → `<AppLayout>`.
- [x] Remove duplicated sidebar/header markup from `MainLayout`, `MyRoomsPage`, `ProfilePage`, `RoomDetailsPage`.

### 3.2 Mobile navigation
- [x] Wire hamburger icon to a slide-over drawer, or add a `<BottomNav />` for mobile.
- [x] Ensure all touch targets meet 44×44px minimum.

### 3.3 Auth pages
- [x] Build a working login page (`LoginPage.jsx`) wired to `POST /auth/login`.
- [x] Add "Forgot Password?" link on login → build password-reset request page.
- [x] Build password-reset-with-token page (`/reset-password/:token`).
- [x] Fix `SendOtpForm.jsx` — `setResponseErrors` typo, missing early return, unguarded error access.

### 3.4 Form & input polish
- [x] Build accessible `<OtpInput />` component with auto-focus, paste support, `inputMode="numeric"`.
- [x] Pass verified email from `/sendotp` → `/register` via router navigation state.
- [x] Redirect successful registration to `/login` with an informational toast.

### 3.5 Route & asset cleanup
- [x] Fix `className="w-fu ll"` typo in `LoginForm.jsx`.
- [x] Fix login button text ("Create Account" → "Sign In").
- [x] Fix `<img src="screen.png">` → `/screen.png` for sub-route compatibility.
- [x] Normalize all routes to lowercase kebab-case.
- [x] Add `<Route path="*" element={<NotFoundPage />} />`.

---

## Phase 4 — Core Feature UI

**Goal:** Users can manage rooms and expenses from the browser — feature parity with the backend.

### 4.1 Room management UI
- [ ] Room creation dialog/page.
- [ ] Room list page (search, sort, pagination).
- [ ] Room detail page — members list, expenses tab.
- [ ] Room settings modal — rename (creator), delete (creator).

### 4.2 Room joining UI
- [ ] "Join Room" flow — enter room code → receive VCO from creator → enter VCO.

### 4.3 Member management UI
- [ ] Role change dropdown (`admin` / `member`) for creators.
- [ ] "Remove Member" action for room admins/creators.

### 4.4 Expense management UI
- [ ] "Add Expense" form — title, amount, category, split type.
- [ ] Roommate multi-select checkboxes for `custom` split type.
- [ ] Expense list with search, category/payer/amount filters.
- [ ] Single expense detail view.

### 4.5 Debt & settlement UI
- [ ] "Settle Up" modal — enter payment amount, see outstanding dues.
- [ ] `Paid` / `Partial` / `Pending` status tags on each member's row.
- [ ] Per-member debt summary on the room overview.

---

## Phase 5 — Code Health

**Goal:** Clean up accumulated tech debt so the codebase is contributor-friendly.

### 5.1 Naming & typo fixes
- [x] Rename `meddlewares/` → `middlewares/`; update all imports.
- [x] Fix `JWT_REHRESH_SECRET` → `JWT_REFRESH_SECRET` in code + docs.
- [x] Fix `creatAccessToken` → `createAccessToken`.
- [x] Fix `childern` → `children` prop in `AuthPage.jsx` / `AuthCard.jsx`.
- [x] Rename `BrandlingHeadline.jsx` → `BrandingHeadline.jsx`.
- [x] Fix `Registrationform` → `RegistrationForm` component name.
- [x] Fix import casing mismatches (`Authpage` → `AuthPage`, etc.) for Linux compatibility.

### 5.2 Dependency cleanup
- [x] Remove unused `redis` from `backend/package.json`.
- [x] Remove duplicate `http-status-code` (keep `http-status-codes`).
- [x] Add `nodemon` as a devDependency or remove it from the `start` script.
- [x] Delete empty/unused files: `MyRooms.jsx`, `style.css`.

### 5.3 Dev experience
- [x] Commit a `backend/.env.example` and `frontend/.env.example`.
- [x] Add `FRONTEND_URL` / `VITE_API_URL` env-based configuration instead of hardcoded URLs.

---

## Phase 6 — Testing & CI

**Goal:** Automated confidence that changes don't break things.

### 6.1 Backend integration tests
- [ ] Set up Vitest + Supertest + `mongodb-memory-server`.
- [ ] Test auth flow: send OTP → register → login → refresh → logout.
- [ ] Test room flow: create → gen-vco → join → list members.
- [ ] Test expense flow: create transaction → verify splits → settle debt → verify status.

### 6.2 Frontend component tests
- [ ] Set up Vitest + `@testing-library/react`.
- [ ] Test route guards (`ProtectedRoute`, `GuestRoute`).
- [ ] Test OTP input component.
- [ ] Test Axios interceptor refresh logic.

### 6.3 CI pipeline
- [ ] Add `.github/workflows/ci.yml`: lint → test → build on every PR.
- [ ] Add ESLint config for backend and frontend.

---

## Phase 7+ — Expansion (Post-MVP)

These align with the broader "shared-living operating system" vision. Each is its own future roadmap.

- [ ] **Chore management** — task creation, rotation schedules, completion tracking.
- [ ] **Shared shopping lists** — supply tracking and restock reminders.
- [ ] **House rules** — shared agreements, quiet hours, guest policies.
- [ ] **In-app notifications** — real-time updates (Socket.io or SSE).
- [ ] **PWA support** — offline access, push notifications, home-screen install.
- [ ] **Multilingual UI** — i18n support starting with Hindi and English.

> [!TIP]
> Each phase above is designed to be completable in roughly 1–3 focused working sessions. Resist the urge to combine phases — ship each one, verify it works, then move on.

