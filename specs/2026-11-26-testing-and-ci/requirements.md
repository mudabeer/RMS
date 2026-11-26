# Requirements — Testing & CI

## Source
- Phase: 6 — Testing & CI from [specs/roadmap.md](../../specs/roadmap.md)
- Branch: `feat/2026-11-26-testing-and-ci`
- Date: 2026-11-26

## Scope
In scope (all sub-sections of Phase 6):
- **6.1 Backend integration tests**: Vitest + Supertest + `mongodb-memory-server` covering:
  - Auth flow: send OTP → register → login → refresh → logout.
  - Room flow: create → generate VCO → join → list members.
  - Expense flow: create transaction → verify splits → settle debt → verify status.
- **6.2 Frontend component tests**: Vitest + `@testing-library/react` covering:
  - Route guards (`ProtectedRoute`, `GuestRoute`).
  - `OtpInput` component.
  - Axios interceptor refresh logic (401 handling, `_retry` guard, `tokenStore` sync, failure fallback).
- **6.3 CI pipeline**:
  - ESLint configuration and `lint` scripts for both `backend/` and `frontend/`.
  - `.github/workflows/ci.yml` running `lint` → `test` → `build` on pull requests and pushes to `main`.

Out of scope:
- New application features (Phase 4 UI or Phase 7+ expansion).
- E2E browser automation (Playwright/Cypress).

## Decisions
- Group work by roadmap sub-sections: 6.1 Backend integration tests, 6.2 Frontend component tests, 6.3 CI pipeline & ESLint.
- Reuse and extend existing Vitest setups in `backend/` and `frontend/` rather than replacing them.
- Keep ESLint rules practical and aligned with the existing codebase (ES modules in frontend, CommonJS in backend) so `npm run lint` passes with zero errors.

## Context
- **Mission ([specs/mission.md](../../specs/mission.md))**: RMS is the single source of truth for shared-living finances and chores; fairness and financial accuracy (integer-cent splits, debt settlement, auth isolation) must remain regression-free.
- **Tech Stack ([specs/tech-stack.md](../../specs/tech-stack.md))**: Backend uses Node.js, Express 5, Mongoose, Vitest, Supertest, and `mongodb-memory-server`. Frontend uses React 19, Vite, Tailwind CSS 4, Axios, Vitest, and `@testing-library/react`. CI target is GitHub Actions (`lint` → `test` → `build`).

