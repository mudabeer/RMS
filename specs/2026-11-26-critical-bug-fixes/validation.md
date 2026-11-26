# Validation — Critical Bug Fixes (Phase 0)

## Merge Criteria

All of the following must be true before this branch can be merged:

1. All 8 fixes are implemented and individually verified (see per-group checks below).
2. The backend starts without errors (`node app.js` connects to MongoDB and listens on PORT).
3. The frontend builds and loads without console errors (`npm run dev` → open `http://localhost:5173`).
4. No regressions: existing working flows (registration OTP, room creation via API) still function.

## Per-Group Checks

### Group 1 — Backend crash & logic fixes

- [ ] **Vco TTL fix:** Create a VCO document via `POST /api/v1/room/gen-vco`, wait a few seconds, query the `vcos` collection — the document should still exist (not immediately TTL-deleted). Verify the `expiresAt` field is ~15 minutes in the future from creation time, not from server start time.
- [ ] **deleteTrans fix:** Create a transaction with 2+ members where no one has paid anything (all statuses `Pending`). Call `DELETE /api/v1/transaction/:roomId/:transactionId` — it should succeed (200). Then create another transaction, record a partial payment on one member, and attempt deletion — it should be blocked with a `BadRequestError`.
- [ ] **Error handler fix:** Trigger a Mongoose `ValidationError` (e.g., submit a room creation request with a missing required field). The response body `msg` should contain a human-readable validation message, not `[object Object]`.

### Group 2 — Backend authorization fix

- [ ] **Creditor-only settlement:** Log in as User A (the creditor / `paidBy`), create a transaction. Log in as User B (a debtor in the split). Call `PATCH .../payment/:userBId` as User B — it should be rejected (403 or 400 with a clear message). Call the same endpoint as User A — it should succeed.
- [ ] **Positive payment validation:** Call the payment endpoint with `{ payment: -50 }` — rejected. With `{ payment: 0 }` — rejected. With `{ payment: "abc" }` — rejected. With `{ payment: 10 }` (valid positive number within remaining due) — accepted.

### Group 3 — Frontend crash fixes

- [ ] **Suspense boundary:** Open `http://localhost:5173` in a browser. Navigate to any lazy-loaded route (e.g., `/register`). The page should show a loading spinner briefly, then render the page — no "A component suspended while rendering" error in the console.
- [ ] **tokenStore fix:** In `frontend/src/api/axios.js`, confirm `tokenStore.set(null)` is used (not `tokenStore(null)`). Simulate a failed refresh (e.g., expired refresh token) — the app should gracefully clear the token and redirect to login, not throw `TypeError: tokenStore is not a function`.
- [ ] **AuthPage CSS scoping:** Visit `/register` or `/sendotp`, then navigate to a protected page (once login exists) or back to `/`. The page layout should not be squashed into a centered box. Inspect `<body>` in DevTools — it should have no `display: flex` or `align-items: center` from `AuthPage.css`.

## Smoke Test

After all fixes are applied:

- [ ] `cd backend && node app.js` — server starts, connects to MongoDB, prints listening message.
- [ ] `cd frontend && npm run dev` — Vite dev server starts, no build errors.
- [ ] Open `http://localhost:5173` — landing page loads, no console errors.
- [ ] Navigate to `/sendotp` — page renders (Suspense spinner → form), no crashes.
- [ ] Navigate to `/register` — page renders, no layout squashing.
- [ ] Send a registration OTP via the form — backend processes it, no server crash.

