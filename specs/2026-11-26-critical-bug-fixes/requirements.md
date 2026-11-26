# Requirements — Critical Bug Fixes (Phase 0)

## Source
- Phase: **0 — Critical Bug Fixes (P0)** from [specs/roadmap.md](../roadmap.md)
- Branch: `feat/2026-11-26-critical-bug-fixes`
- Date: 2026-11-26

## Scope

**All 8 items** across the three sub-sections of Phase 0 are in scope:

| Group | Items | Files touched |
|---|---|---|
| 0.1 Backend crash & logic fixes | 3 | `backend/models/Vco.js`, `backend/controllers/transaction.js`, `backend/meddlewares/error-handler.js` |
| 0.2 Backend authorization fix | 2 | `backend/controllers/settleDebt.js` |
| 0.3 Frontend crash fixes | 3 | `frontend/src/App.jsx`, `frontend/src/api/axios.js`, `frontend/src/components/Auth/AuthPage.css` |

### Explicitly out of scope
- No new features, UI pages, or dependencies.
- No refactoring beyond the minimum needed to fix each bug.
- No renaming (`meddlewares/`, typos) — that's Phase 5.
- No test infrastructure — that's Phase 6.

## Decisions

1. **Fix only, don't redesign.** Each fix should be as small and surgical as possible. The goal is to stop crashes and close security holes, not to rearchitect.
2. **Preserve existing behavior.** If a fix changes user-facing behavior (e.g., the error handler now shows real Mongoose messages), that's acceptable only because the previous behavior was broken (`[object Object]`).
3. **No new dependencies.** Phase 0 must not add packages. `express-rate-limit` and `helmet` are Phase 2.

## Context

From [mission.md](../mission.md):
- **Audience is cost-aware and mobile-first.** Crashes on page load or broken auth flows immediately destroy trust. These P0 fixes are prerequisite to any usability.
- **Fairness by default.** The BOLA vulnerability in `settleDebt.js` lets any roommate mark their own debt as paid — directly undermining the core fairness principle.

From [tech-stack.md](../tech-stack.md):
- **Stack is intentionally stable.** No new tools or frameworks. Fixes use existing Express 5 patterns, Mongoose schema options, and React 19 APIs (`<Suspense>`).
- Fixes reference the `improvements.md` audit's drop-in remediation code as a starting point, but implementations should be verified against the actual current codebase, not blindly copy-pasted.

