# Plan — Testing & CI

## Overview
Complete Phase 6 by ensuring full integration test coverage for backend auth, room, and expense flows, full frontend unit/component test coverage for route guards, `OtpInput`, and the Axios refresh interceptor, and a GitHub Actions CI pipeline backed by ESLint configurations for both packages.

## Task Groups

### Group 1 — Backend integration tests (6.1)
1. [x] Verify Vitest + Supertest + `mongodb-memory-server` setup in `backend/package.json` and `backend/tests/`.
2. [x] Verify auth flow coverage (`send-code` → `register` → `login` → `refresh` → `logout`) in `backend/tests/auth.integration.test.js`.
3. [x] Add dedicated room flow integration tests (`create` → `gen-vco` → `join` → `list members`) in `backend/tests/room.integration.test.js`.
4. [x] Verify expense flow coverage (`createTrans` → verify splits → `settleDebt` → verify status) in `backend/tests/integrity.integration.test.js`.

### Group 2 — Frontend component tests (6.2)
1. [x] Verify Vitest + `@testing-library/react` setup in `frontend/vite.config.js` and `frontend/src/tests/setup.js`.
2. [x] Verify `OtpInput` and `ProtectedRoute` tests in `frontend/src/tests/auth.test.jsx` and add `GuestRoute` test coverage.
3. [x] Add Axios interceptor refresh logic tests (`401` retry, `_retry` infinite-loop guard, `tokenStore` update, refresh failure logout) in `frontend/src/tests/axios.test.js`.

### Group 3 — CI pipeline (6.3)
1. [x] Install ESLint and add flat configs (`eslint.config.js`) + `lint` scripts in `backend/` and `frontend/`.
2. [x] Fix any lint errors so `npm run lint` passes with zero errors in both `backend/` and `frontend/`.
3. [x] Add `.github/workflows/ci.yml` running `lint` → `test` → `build` on pull requests and `main` pushes.
