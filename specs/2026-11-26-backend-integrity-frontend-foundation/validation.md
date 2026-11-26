# Validation — Backend Integrity & Defense + Frontend Foundation

## Merge Criteria
This branch (`feat/2026-11-26-backend-integrity-frontend-foundation`) can be merged into `main` when **all** of the following hold:
1. All automated test suites pass with zero skipped or relaxed assertions:
   - Backend unit & integration tests (financial math, input validation, rate-limit/security headers, cascade cleanup, HTTP status codes).
   - Frontend component tests (auth pages, `SendOtpForm`, `<OtpInput />`, route guards).
2. Both backend and frontend start/build cleanly with zero errors.
3. Every per-group check below is verified.

## Per-Group Checks

### Group 1 — 2.1 Financial math fix
- [ ] Automated test confirms splitting uneven amounts (e.g., `100` across `3` members) produces integer-cent shares summing to exactly `10000` cents with no floating-point drift.
- [ ] Automated test confirms `settleDebt.js` handles partial and full settlements accurately using `Math.round(val * 100)` comparisons.

### Group 2 — 2.2 Input validation
- [ ] Automated test confirms `createTrans` rejects amounts `<= 0` with `400 Bad Request`.
- [ ] Automated test confirms `createTrans` rejects `custom` splits containing user IDs not in the room.
- [ ] Automated test confirms payloads containing `$gt`, `$ne`, or `$where` operators are sanitized/rejected.

### Group 3 — 2.3 Rate limiting & headers
- [ ] `helmet` headers are present on API responses.
- [ ] Repeated requests to `/auth/login`, `/auth/send-code`, and `/room/gen-vco` trigger `429 Too Many Requests` once the limit is exceeded.
- [ ] CORS origin reads from `process.env.CLIENT_URL`.

### Group 4 — 2.4 Database indexes
- [ ] Mongoose schemas for `Room`, `Transaction`, `RefreshToken`, and `User` define the required indexes (`unique`, compound, and `sparse` where specified).

### Group 5 — 2.5 Cascade cleanup
- [ ] Automated test confirms deleting a room removes its `Transaction`, `Chore`, and `Vco` records.
- [ ] Automated test confirms removing a member with outstanding debts or active creditor transactions is blocked with an error.

### Group 6 — 2.6 HTTP standards compliance
- [ ] `getSingleTrans` returns `200` (not `201`).
- [ ] No `204` endpoint sends a JSON response body.
- [ ] `ForbiddenError` returns `403` and is exported from `backend/errors/index.js`.

### Group 7 — 3.1 Layout architecture
- [ ] Authenticated pages render inside `<ProtectedRoute>` → `<AppLayout>` with a single shared `<SideNavbar />` and `<Outlet />`.
- [ ] No duplicated sidebar/header markup remains in `MyRoomsPage`, `ProfilePage`, or `RoomDetailsPage`.

### Group 8 — 3.2 Mobile navigation
- [ ] At `<768px` viewport width, navigation works via slide-over drawer or `<BottomNav />` with no horizontal overflow.
- [ ] Primary nav items and buttons meet the `44×44px` minimum touch target size.

### Group 9 — 3.3 Auth pages
- [ ] Automated test confirms `LoginPage` / `LoginForm` submits credentials to `POST /auth/login` and handles errors cleanly.
- [ ] "Forgot Password?" flow and `/reset-password/:token` route render and submit properly.
- [ ] Automated test confirms `SendOtpForm` handles validation and API errors without throwing on undefined fields.

### Group 10 — 3.4 Form & input polish
- [ ] Automated test confirms `<OtpInput />` supports typing digits, auto-focusing next input, and pasting a full OTP code.
- [ ] Verified email is passed via router state from `/sendotp` to `/register`.
- [ ] Registration success redirects to `/login` with an informational toast.

### Group 11 — 3.5 Route & asset cleanup
- [ ] `LoginForm.jsx` has valid `w-full` class and `"Sign In"` button text.
- [ ] `/screen.png` loads on nested routes (e.g., `/reset-password/abc`).
- [ ] All routes are lowercase kebab-case and unknown paths render `<NotFoundPage />`.

### Group 12 — Automated tests
- [ ] Backend test suite passes (`cd backend && npm test`).
- [ ] Frontend test suite passes (`cd frontend && npm test`).

## Smoke Test
- [ ] Backend starts without errors (`cd backend && node app.js`)
- [ ] Frontend builds and loads (`cd frontend && npm run build && npm run dev`)
- [ ] No new console errors or warnings in browser

