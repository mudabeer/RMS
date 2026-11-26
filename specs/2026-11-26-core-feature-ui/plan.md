# Plan — Core Feature UI

## Overview
Deliver full browser-based parity with the RMS backend for rooms, joining via VCO, member roles/removal, shared expenses, and debt settlement. Each sub-section of Phase 4 is organized as its own task group, including component/flow tests using Vitest and `@testing-library/react`.

## Task Groups

### Group 1 — 4.1 Room management UI
1. [ ] Build a room creation dialog/form component (e.g., `frontend/src/components/Rooms/CreateRoomModal.jsx`) wired to `POST /room` with validation and loading/error states.
2. [ ] Enhance `frontend/src/pages/MyRoomsPage/MyRoomsPage.jsx` with search, sort, and pagination controls backed by `GET /room`, plus a trigger for the room creation modal.
3. [ ] Organize `frontend/src/pages/RoomDetailsPage/RoomDetailsPage.jsx` with clear Members list and Expenses tab views fed by `GET /room/:roomId` and `GET /transaction/:roomId`.
4. [ ] Build a Room Settings modal (`frontend/src/components/Rooms/RoomSettingsModal.jsx`) restricted to room creators for renaming (`PATCH /room/:roomId`) and deleting (`DELETE /room/:roomId`, redirecting back to `/my-rooms`).
5. [ ] Add Vitest + `@testing-library/react` tests covering room creation, room list search/sort/pagination, and creator-only room rename/delete flows.

### Group 2 — 4.2 Room joining UI
1. [ ] Build a "Join Room" modal/flow (`frontend/src/components/Rooms/JoinRoomModal.jsx`) accessible from `MyRoomsPage.jsx` supporting the two-step flow: enter room code → prompt/request VCO from creator (`POST /room/gen-vco` on creator side / VCO display in `RoomDetailsPage.jsx`) → submit room code + VCO (`PATCH /room/join-room`).
2. [ ] Surface VCO generation and copy/share controls for room creators/members inside `RoomDetailsPage.jsx` with clear expiry/rate-limit error handling.
3. [ ] Add Vitest + `@testing-library/react` tests for the Join Room form validation, VCO submission, and error states.

### Group 3 — 4.3 Member management UI
1. [ ] Add a role change dropdown (`admin` / `member`) on member rows in `RoomDetailsPage.jsx` visible to room creators and wired to `PATCH /room/:roomId/member/:memberId`.
2. [ ] Add a "Remove Member" action with confirmation on member rows in `RoomDetailsPage.jsx` wired to `DELETE /room/:roomId/member/:memberId`, displaying backend errors cleanly when removal is blocked by active debts/transactions.
3. [ ] Add Vitest + `@testing-library/react` tests verifying creator-only visibility, role updates, and blocked-removal error handling.

### Group 4 — 4.4 Expense management UI
1. [ ] Build an "Add Expense" form/modal (`frontend/src/components/Expenses/AddExpenseModal.jsx`) wired to `POST /transaction/:roomId` with title, amount, category, and split type (`equal` / `custom`).
2. [ ] Add roommate multi-select checkboxes in `AddExpenseModal.jsx` when `custom` split type is chosen, validating that at least one member is selected.
3. [ ] Add search and category/payer/amount filters to the Expenses tab in `RoomDetailsPage.jsx` (and wire to `GET /transaction/:roomId` query params or client/server filtering matching backend support).
4. [ ] Build a single expense detail view (modal or nested route under `App.jsx` + `RoomDetailsPage.jsx`) wired to `GET /transaction/:roomId/:transactionId` showing split breakdown and edit/delete actions where permitted.
5. [ ] Add Vitest + `@testing-library/react` tests for adding equal/custom-split expenses, filtering the expense list, and viewing single expense details.

### Group 5 — 4.5 Debt & settlement UI
1. [ ] Build a "Settle Up" modal (`frontend/src/components/Expenses/SettleUpModal.jsx`) displaying outstanding dues and allowing the creditor (`paidBy`) to record a payment amount via `PATCH /transaction/:roomId/:transactionId/payment/:memberId`.
2. [ ] Render `Paid` / `Partial` / `Pending` status tags on each member's split row in the expense detail view and expense list.
3. [ ] Add a per-member debt summary card/section on the `RoomDetailsPage.jsx` overview showing who owes whom and net balances.
4. [ ] Add Vitest + `@testing-library/react` tests covering `Paid` / `Partial` / `Pending` status rendering, creditor-only settle-up actions, and positive-amount validation.

