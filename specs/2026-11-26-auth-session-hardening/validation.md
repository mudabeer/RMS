# Validation — Auth & Session Hardening

## Merge Criteria
- All task groups (`1.1` through `1.4`) are implemented on `feat/2026-11-26-auth-session-hardening`.
- Automated integration tests for the auth & session hardening flows are written and pass in CI/local test run without skipped assertions.
- Backend and frontend start/build cleanly with no regressions.
- `AGENTS.md` and `specs/roadmap.md` are updated if architectural/status changes apply before merge.

## Per-Group Checks

### Group 1 — Token flow reconciliation (1.1)
- [x] Requests with `Authorization: Bearer <accessToken>` authenticate successfully through `backend/meddlewares/authentication.js`.
- [x] `frontend/src/api/axios.js` retries a 401 request at most once (`_retry = true`) and clears auth state without looping when `/refresh` fails.
- [x] `tokenStore` and `AuthContext` remain in sync across login, silent refresh, and logout.

### Group 2 — Refresh token rotation (1.2)
- [x] Refresh tokens are stored as SHA-256 hashes in `RefreshToken` (no bcrypt dependency for refresh tokens).
- [x] Calling `/refresh` invalidates the old refresh token and sets a new `httpOnly` refresh token cookie.
- [x] Reusing a previously rotated refresh token triggers reuse detection: all `RefreshToken` records for that user are deleted and the request is rejected (`401`).

### Group 3 — Session invalidation (1.3)
- [x] Completing a password reset deletes all `RefreshToken` records for that user; subsequent `/refresh` calls with prior cookies fail with `401`.

### Group 4 — OTP hardening (1.4)
- [x] `backend/utils/generateOTP.js` uses `crypto.randomInt` and produces valid, zero-padded 6-digit numeric strings.

## Automated Integration Tests
- [x] Backend test suite (`npm test` in `backend/`) passes:
  - [x] Auth flow: login → access protected route → `/refresh` issues new tokens and invalidates old refresh token.
  - [x] Reuse detection: presenting an already-rotated refresh token revokes all active sessions for that user.
  - [x] Session invalidation: password reset deletes all refresh tokens for the user.
  - [x] OTP generation: `generateOTP()` returns 6-digit strings using `crypto.randomInt`.

## Smoke Test
- [ ] Backend starts without errors (`node app.js` in `backend/`).
- [x] Frontend builds cleanly (`npm run build` in `frontend/`) and loads in dev (`npm run dev`).
- [ ] No new console errors or warnings in browser.

