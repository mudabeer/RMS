# Requirements — Core Feature UI

## Source
- Phase: 4 — Core Feature UI from [specs/roadmap.md](../../specs/roadmap.md)
- Branch: `feat/2026-11-26-core-feature-ui`
- Date: 2026-11-26

## Scope
All sub-sections of **Phase 4 — Core Feature UI** are in scope to bring the frontend to feature parity with the existing room, member, transaction, and debt-settlement backend APIs:

### In Scope
1. **4.1 Room management UI**
   - Room creation dialog/page (`POST /room`).
   - Room list page (`MyRoomsPage.jsx`) with search, sort, and pagination (`GET /room`).
   - Room detail page (`RoomDetailsPage.jsx`) with members list and expenses tab (`GET /room/:roomId`, `GET /transaction/:roomId`).
   - Room settings modal for creators to rename (`PATCH /room/:roomId`) or delete (`DELETE /room/:roomId`) a room.
2. **4.2 Room joining UI**
   - "Join Room" flow: enter room code → request/receive VCO from creator (`POST /room/gen-vco`) → enter VCO to join (`PATCH /room/join-room`).
3. **4.3 Member management UI**
   - Role change dropdown (`admin` / `member`) for room creators (`PATCH /room/:roomId/member/:memberId`).
   - "Remove Member" action for room creators (`DELETE /room/:roomId/member/:memberId`).
4. **4.4 Expense management UI**
   - "Add Expense" form with title, amount, category, and split type (`POST /transaction/:roomId`).
   - Roommate multi-select checkboxes when `custom` split type is selected.
   - Expense list with search and category/payer/amount filters (`GET /transaction/:roomId`).
   - Single expense detail view (`GET /transaction/:roomId/:transactionId`).
5. **4.5 Debt & settlement UI**
   - "Settle Up" modal to enter payment amount and view outstanding dues (`PATCH /transaction/:roomId/:transactionId/payment/:memberId`).
   - `Paid` / `Partial` / `Pending` status tags on each member's row.
   - Per-member debt summary on the room overview.
6. **Automated UI & integration tests**
   - Component/page tests in `frontend/` using Vitest + `@testing-library/react` covering the new Phase 4 flows.

### Out of Scope
- Chore management, shared shopping lists, house rules, real-time notifications (Phase 7+).
- Tech-debt renames/cleanup from Phase 5 (e.g., `meddlewares/`, `.env.example`) unless strictly required by a Phase 4 edit.
- New backend features not already exposed by existing `/room` and `/transaction` routes.

## Decisions
- **Grouping & ordering:** One task group per roadmap sub-section (4.1 through 4.5).
- **Merge gate:** Automated tests must pass (written as part of this phase alongside the UI work), and the frontend build and existing backend tests must remain green.
- **Stack discipline:** Use existing React 19, Vite, Tailwind CSS 4, React Router v7, and shared `api` Axios instance (`frontend/src/api/axios.js`) — no new UI libraries or global state managers.

## Context
- **Audience (`specs/mission.md`):** South-Asian / Indian shared-flat market (PG residents, college flatmates, early-career roommates). UI must be **mobile-first** (all touch targets ≥ 44×44px, usable on <768px screens), **low-friction** (fewer taps than sending a text message), and use short, clear copy.
- **Core principles (`specs/mission.md`):** Single source of truth in RMS, fairness by default (transparent splits and debt statuses), minimal overhead, and privacy-respecting (financial data scoped to room members).
- **Tech stack (`specs/tech-stack.md`):** Material Design 3 / Stitch aesthetic with Tailwind CSS 4 `@theme` tokens in `frontend/src/index.css`; lazy-loaded routes wrapped in `<Suspense fallback={<PageLoader />}>` in `frontend/src/App.jsx`; `AuthContext` for auth state and local `useState` for feature state.

