# Requirements — Auth & Session Hardening

## Source
- Phase: 1 — Auth & Session Hardening from [specs/roadmap.md](../../specs/roadmap.md)
- Branch: `feat/2026-11-26-auth-session-hardening`
- Date: 2026-11-26

## Scope

### In Scope
All sub-sections of Phase 1 from `specs/roadmap.md`:
- **1.1 Token flow reconciliation:** Reconcile access token transport (`Authorization` header vs cookie) between `backend/meddlewares/authentication.js` and `backend/utils/cookies.js`, add `_retry` flag to the Axios response interceptor in `frontend/src/api/axios.js` to prevent infinite refresh loops, and synchronize `tokenStore.set(token)` with `AuthContext` state in `frontend/src/context/AuthContext.jsx`.
- **1.2 Refresh token rotation:** Replace bcrypt with SHA-256 for refresh token hashing, implement Refresh Token Rotation (RTR) on `/refresh` (issue a new refresh token and delete the old one), and add token-reuse detection that revokes all sessions for the user if a previously rotated/deleted token is presented.
- **1.3 Session invalidation:** Delete all refresh tokens for the user on password reset (`backend/controllers/auth.js`), and prepare/apply the same pattern for password change if/when added.
- **1.4 OTP hardening:** Replace `Math.random()` with `crypto.randomInt` in `backend/utils/generateOTP.js`.

### Out of Scope
- Phase 2+ items (financial math fixes, input sanitization, rate limiting, `helmet`, database indexes, cascade cleanup, HTTP status code cleanup).
- New frontend auth UI pages (login, forgot password, reset password, `<OtpInput />`) — those belong to Phase 3 (Frontend Foundation).
- Replacing JWT access/refresh tokens with a different auth mechanism.

## Decisions
- **Phase selection:** Phase 0 (`Critical Bug Fixes`) still has unchecked boxes in `specs/roadmap.md` even though `feat/2026-11-26-critical-bug-fixes` was already merged to `main`; Phase 1 is treated as the active next phase.
- **Grouping:** Work is organized into 4 task groups matching roadmap sub-sections `1.1` through `1.4`.
- **Validation standard:** Automated integration tests must be written and pass as part of Phase 1 (covering token flow, refresh token rotation, reuse detection, session invalidation, and OTP generation) in addition to the existing app running cleanly.
- **Minimal overhead:** Follow `specs/tech-stack.md` — use Node's built-in `crypto` module for SHA-256 hashing and `crypto.randomInt` rather than adding unnecessary runtime dependencies.

## Context
- **Mission alignment (`specs/mission.md`):** RMS serves shared-living groups (primarily mobile-first South-Asian flatmates) where financial records must remain private between room members and sessions must be reliable without forcing frequent re-logins.
- **Stack constraints (`specs/tech-stack.md`):** Backend is Node.js + Express 5 + MongoDB/Mongoose with JWT (15-min access token, 7-day `httpOnly` refresh token cookie). Frontend is React 19 + Vite + Axios (`src/api/`). Access tokens are stored in memory (`tokenStore`) and synchronized with `AuthContext`.

