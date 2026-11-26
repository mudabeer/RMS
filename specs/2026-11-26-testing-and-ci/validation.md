# Validation — Testing & CI

## Merge Criteria
- All backend Vitest integration test suites pass (`cd backend && npm test`).
- All frontend Vitest component/unit test suites pass (`cd frontend && npm test`).
- ESLint passes with zero errors in both `backend` and `frontend` (`npm run lint`).
- Frontend production build succeeds (`cd frontend && npm run build`).
- `.github/workflows/ci.yml` is valid and configured to run `lint` → `test` → `build` on PRs.

## Per-Group Checks

### Group 1 — Backend integration tests (6.1)
- [x] `cd backend && npm test` passes all suites (`auth.integration.test.js`, `room.integration.test.js`, `integrity.integration.test.js`) using `mongodb-memory-server`.
- [x] Auth flow tests verify send OTP, register, login, refresh token rotation, and logout.
- [x] Room flow tests verify room creation, VCO generation, joining via VCO, and listing room members.
- [x] Expense flow tests verify transaction creation, integer-cent split distribution, debt settlement, and status transitions.

### Group 2 — Frontend component tests (6.2)
- [x] `cd frontend && npm test` passes all suites (`auth.test.jsx`, `axios.test.js`).
- [x] `ProtectedRoute` and `GuestRoute` tests verify guest/authenticated redirects.
- [x] `OtpInput` test verifies numeric input, auto-focus advance, and paste support.
- [x] Axios interceptor tests verify 401 refresh + retry, `_retry` loop prevention, `tokenStore` synchronization, and fallback on refresh failure.

### Group 3 — CI pipeline (6.3)
- [x] `cd backend && npm run lint` exits with code 0.
- [x] `cd frontend && npm run lint` exits with code 0.
- [x] `cd frontend && npm run build` exits with code 0.
- [x] `.github/workflows/ci.yml` defines jobs/steps for `lint`, `test`, and `build` triggered on `pull_request` (and `push` to `main`).

## Smoke Test
- [x] Backend tests run in isolation without requiring an external MongoDB instance.
- [x] Frontend build produces `frontend/dist/` cleanly with no Vite errors.
