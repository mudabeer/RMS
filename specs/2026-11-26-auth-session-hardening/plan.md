# Plan — Auth & Session Hardening

## Overview
Harden authentication and session management across the Express 5 backend and React 19 frontend by reconciling access token transport, preventing Axios refresh loops, implementing SHA-256-hashed Refresh Token Rotation with reuse detection, invalidating sessions on password reset, and switching OTP generation to `crypto.randomInt`, backed by automated integration tests.

## Task Groups

### Group 1 — Token flow reconciliation (1.1)
1. [x] Audit and reconcile access token reading/writing between `backend/meddlewares/authentication.js` and `backend/utils/cookies.js` (standardize on `Authorization: Bearer <token>` header for access tokens while keeping refresh tokens in `httpOnly` cookies).
2. [x] Add a `_retry` flag to the 401 response interceptor in `frontend/src/api/axios.js` so failed refresh attempts cannot trigger an infinite refresh loop.
3. [x] Synchronize `tokenStore.set(token)` with `AuthContext` state in `frontend/src/context/AuthContext.jsx` (including refresh updates and logout/clear paths).

### Group 2 — Refresh token rotation (1.2)
1. [x] Replace `bcryptjs` hashing with deterministic SHA-256 (`crypto.createHash('sha256')`) for refresh tokens in `backend/models/RefreshToken.js` and `backend/controllers/auth.js`.
2. [x] Implement Refresh Token Rotation (RTR) in `backend/controllers/auth.js` (`/refresh` handler): verify the presented refresh token, delete the used `RefreshToken` record, and issue + persist a new refresh token alongside the new access token.
3. [x] Add token-reuse detection in `backend/controllers/auth.js` (and `backend/models/RefreshToken.js` if tracking rotated/revoked tokens or family): when a valid JWT refresh token is presented whose hash is no longer active/already rotated, revoke all `RefreshToken` documents for that user and return `401`.

### Group 3 — Session invalidation (1.3)
1. [x] Delete all `RefreshToken` documents for the user on password reset in `backend/controllers/auth.js`.
2. [x] Document or extract a shared `revokeUserSessions(userId)` helper in `backend/controllers/auth.js` so future password-change endpoints reuse the same invalidation path.

### Group 4 — OTP hardening (1.4)
1. [x] Replace `Math.random()` with `crypto.randomInt` in `backend/utils/generateOTP.js` to ensure cryptographically secure 6-digit OTPs.

### Group 5 — Automated integration tests (Validation)
1. [x] Set up backend integration test runner (Vitest + Supertest + `mongodb-memory-server`) in `backend/` if not already configured.
2. [x] Write integration tests covering: OTP generation, login, authenticated request via `Authorization` header, `/refresh` rotation, refresh-token reuse detection (revoking all sessions), and password-reset session invalidation.

