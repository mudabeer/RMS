# Validation — Core Feature UI

## Merge Criteria
1. **Automated tests pass:**
   - All frontend unit/component tests pass via `cd frontend && npm test` (including new tests for Groups 4.1–4.5).
   - All existing backend tests pass via `cd backend && npm test` with zero regressions.
2. **Production build succeeds:**
   - `cd frontend && npm run build` completes with zero errors.
3. **Code & UX conventions met:**
   - All new/modified pages remain functional on mobile widths (<768px) with ≥44×44px touch targets.
   - All API errors are handled safely with optional chaining (`error.response?.data?.msg || error.message`).

## Per-Group Checks

### Group 1 — 4.1 Room management UI
- [ ] `CreateRoomModal` submits `POST /room`, updates the room list, and shows validation/API errors cleanly.
- [ ] `MyRoomsPage` search, sort, and pagination controls work against `GET /room`.
- [ ] `RoomDetailsPage` renders Members and Expenses tabs without layout or console errors.
- [ ] `RoomSettingsModal` lets creators rename (`PATCH /room/:roomId`) and delete (`DELETE /room/:roomId`) a room and hides these actions from non-creators.
- [ ] Automated tests for Group 1 pass.

### Group 2 — 4.2 Room joining UI
- [ ] `JoinRoomModal` accepts room code and VCO and submits `PATCH /room/join-room`.
- [ ] Creators can generate a VCO (`POST /room/gen-vco`) from `RoomDetailsPage` and handle rate-limit/validation errors.
- [ ] Automated tests for Group 2 pass.

### Group 3 — 4.3 Member management UI
- [ ] Creator can change a member's role (`admin` / `member`) via `PATCH /room/:roomId/member/:memberId`.
- [ ] Creator can remove a member via `DELETE /room/:roomId/member/:memberId`; attempting to remove a member with active debts surfaces the backend error message.
- [ ] Automated tests for Group 3 pass.

### Group 4 — 4.4 Expense management UI
- [ ] `AddExpenseModal` creates both equal-split and custom-split transactions via `POST /transaction/:roomId`.
- [ ] Custom split requires selecting at least one roommate via multi-select checkboxes.
- [ ] Expense list search and category/payer/amount filters accurately filter displayed transactions.
- [ ] Single expense detail view loads `GET /transaction/:roomId/:transactionId` and displays per-member split details.
- [ ] Automated tests for Group 4 pass.

### Group 5 — 4.5 Debt & settlement UI
- [ ] `SettleUpModal` displays outstanding dues and submits `PATCH /transaction/:roomId/:transactionId/payment/:memberId` for the creditor.
- [ ] Each member's row displays `Paid`, `Partial`, or `Pending` status tags accurately.
- [ ] Room overview displays an accurate per-member debt summary.
- [ ] Automated tests for Group 5 pass.

## Smoke Test
- [ ] Backend starts without errors (`cd backend && npm start` or `node app.js`)
- [ ] Frontend builds and loads (`cd frontend && npm run dev` and `npm run build`)
- [ ] Automated test suites pass (`cd frontend && npm test` and `cd backend && npm test`)
- [ ] No new console errors or uncaught network errors in browser

