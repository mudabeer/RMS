# Requirements — Backend Integrity & Defense + Frontend Foundation

## Source
- Phases: **Phase 2 — Backend Integrity & Defense** and **Phase 3 — Frontend Foundation** from [specs/roadmap.md](../roadmap.md)
- Branch: `feat/2026-11-26-backend-integrity-frontend-foundation`
- Date: 2026-11-26

## Scope

### In Scope
All items from **Phase 2 (2.1–2.6)** and **Phase 3 (3.1–3.5)** of `specs/roadmap.md`:

**Phase 2 — Backend Integrity & Defense**
- **2.1 Financial math fix:** Integer-cent split calculation with remainder distribution in `backend/controllers/transaction.js` (`createTrans`) and `Math.round(val * 100)` comparisons in `backend/controllers/settleDebt.js`.
- **2.2 Input validation:** Validate custom-split member IDs belong to the room (`transaction.js`), sanitize request bodies against MongoDB operator injection (`$gt`, `$ne`, etc.), and reject negative/zero amounts on transaction creation.
- **2.3 Rate limiting & headers:** Mount `express-rate-limit` on `/auth/login`, `/auth/send-code`, and `/room/gen-vco`; mount `helmet` for security headers; move CORS origin from hardcoded string to `process.env.CLIENT_URL`.
- **2.4 Database indexes:** Add indexes for `Room.roomCode` (unique), `Transaction` (`roomId` + `createdAt` compound), `Transaction.splitAmong.userId`, `RefreshToken.user`, and `User.passwordResetToken` (sparse).
- **2.5 Cascade cleanup:** Delete associated `Transaction`, `Chore`, and `Vco` documents on room deletion; block member removal when the member has outstanding debts or is creditor of active transactions.
- **2.6 HTTP standards compliance:** Fix `getSingleTrans` status `201` → `200`, fix `204` responses that return a JSON body (use `200` or `res.status(204).end()`), and add `ForbiddenError` (403) in `backend/errors/`.

**Phase 3 — Frontend Foundation**
- **3.1 Layout architecture:** Extract shared `AppLayout.jsx` (`<SideNavbar />` + `<Outlet />`), nest authenticated routes under `<ProtectedRoute>` → `<AppLayout>`, and remove duplicated sidebar/header markup from `MainLayout`, `MyRoomsPage`, `ProfilePage`, and `RoomDetailsPage`.
- **3.2 Mobile navigation:** Wire hamburger icon to a slide-over drawer or add `<BottomNav />` for mobile (`<768px`), ensuring all touch targets meet `44×44px` minimum.
- **3.3 Auth pages:** Build `LoginPage.jsx` wired to `POST /auth/login`, add "Forgot Password?" link and password-reset request page, build `/reset-password/:token` page, and fix `SendOtpForm.jsx` (`setResponseErrors` typo, missing early return, unguarded error access).
- **3.4 Form & input polish:** Build accessible `<OtpInput />` (auto-focus, paste support, `inputMode="numeric"`), pass verified email from `/sendotp` → `/register` via router navigation state, and redirect successful registration to `/login` with an informational toast.
- **3.5 Route & asset cleanup:** Fix `className="w-fu ll"` typo and button text ("Create Account" → "Sign In") in `LoginForm.jsx`, fix `<img src="screen.png">` → `/screen.png`, normalize routes to lowercase kebab-case, and add `<Route path="*" element={<NotFoundPage />} />`.

**Testing Scope (from validation requirements)**
- Add automated tests covering financial math, input validation, and auth UI flows (using `vitest`, `supertest`, and `@testing-library/react` as listed in `specs/tech-stack.md`).

### Out of Scope
- **Phase 4 (Core Feature UI):** Room creation/list/settings UI, Join Room flow UI, Member management UI, Expense management UI, and Debt & settlement UI.
- **Phase 5 (Code Health):** Renaming `meddlewares/` → `middlewares/`, `JWT_REHRESH_SECRET`, `BrandlingHeadline.jsx`, etc., unless strictly required by a Phase 2/3 edit.
- **Phase 7+ (Expansion):** Chore management, shopping lists, house rules, real-time notifications, PWA, i18n.

## Decisions
1. **Combined Delivery:** Phase 2 and Phase 3 are scoped together on a single feature branch, grouped by roadmap sub-section (`2.1`–`2.6`, then `3.1`–`3.5`).
2. **Automated Verification Required:** Branch merge requires automated tests (unit/integration tests for financial math, input validation, and auth UI) in addition to clean builds and smoke checks.
3. **Approved Incremental Dependencies:** Adding `express-rate-limit` and `helmet` on the backend, and `vitest`, `supertest`, `mongodb-memory-server`, `@testing-library/react` for automated tests aligns with `specs/tech-stack.md`. No other unapproved frameworks (e.g., TypeScript, Socket.io, Redux) will be introduced.

## Context
- **Mission & Audience ([specs/mission.md](../mission.md)):** RMS targets South-Asian / Indian shared-flat and PG residents where small amounts matter (**Fairness by default** — exact integer-cent splits and auditable ledgers), users are **Mobile-first** (`<768px` responsive navigation and `44×44px` touch targets), and overhead must stay **Low friction** (accessible `<OtpInput />`, smooth auth/reset flows).
- **Tech Stack ([specs/tech-stack.md](../tech-stack.md)):** Node.js + Express 5 + MongoDB/Mongoose on the backend; React 19 + Vite + Tailwind CSS 4 + React Router v7 + Axios on the frontend. Keep `CustomAPIError` conventions on the backend and `<Suspense fallback={<PageLoader />}>` + `tokenStore.set()` synchronization on the frontend.

