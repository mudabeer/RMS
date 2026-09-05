# Features

This document lists what RMS actually does today, based on reading the code in this repository — not on the marketing copy in the landing page. Features are grouped into three honest categories:

- **Implemented** — the code fully supports it.
- **Incomplete** — some code exists, but it doesn't fully work as intended.
- **Planned** — mentioned in the UI/copy, but no real implementation exists.

---

## Implemented

### Authentication (email OTP based)

Users register with an email + a 6-digit one-time code instead of a plain sign-up form.

- `POST /api/v1/auth/send-code` — sends a 6-digit OTP to the given email (rejected if the email is already registered).
- `POST /api/v1/auth/register` — verifies the OTP and creates the account.
- `POST /api/v1/auth/login` — verifies credentials and issues a JWT access token + refresh token.
- `POST /api/v1/auth/refresh` — issues a new access token from a valid refresh token.
- `POST /api/v1/auth/logout` — revokes the refresh token.
- `POST /api/v1/auth/forgot-password` / `POST /api/v1/auth/reset-password/:token` — email-based password reset.

Relevant backend areas:
- `backend/controllers/auth.js`
- `backend/routes/auth.js`
- `backend/models/User.js`, `backend/models/Otp.js`, `backend/models/RefreshToken.js`
- `backend/services/emailService.js`

**Limitation:** see [Known Backend Limitations](./BACKEND.md#known-backend-limitations) — the way tokens are issued (cookies) and the way they're checked (an `Authorization` header) don't currently match, so protected routes aren't reachable through the intended cookie flow yet. On the frontend, only the "send code" and "register" steps are wired up — there's no working login screen yet either.

### Room management

Any authenticated user can create a room, and a user can belong to multiple rooms.

- `POST /api/v1/room` — create a room (creator becomes a member with role `creator`).
- `GET /api/v1/room` — list the rooms the current user belongs to (search, sort, pagination supported).
- `GET /api/v1/room/:roomId` — get a single room (must be a member).
- `PATCH /api/v1/room/:roomId` — rename a room (creator only).
- `DELETE /api/v1/room/:roomId` — delete a room (creator only).

Relevant backend areas:
- `backend/controllers/room.js`
- `backend/routes/room.js`
- `backend/models/Room.js`

### Joining a room (room-code + verification flow)

Joining isn't just "enter a code and you're in" — it uses a two-step verification flow:

1. The user requests to join with the room's `roomCode` (`POST /api/v1/room/gen-vco`).
2. The backend emails a short verification code (VCO) **to the room's creator**.
3. The user submits that code (`PATCH /api/v1/room/join-room`) to actually be added as a `member`.

Relevant backend areas:
- `backend/controllers/room.js` (`genVco`, `joinRoom`)
- `backend/models/Vco.js`
- `backend/services/emailService.js` (`sendVco`, `sendNewMember`)

The verification code expires, and repeated wrong attempts (5+) invalidate it.

### Room members and roles

Rooms track members with a role: `creator`, `admin`, or `member`.

- `PATCH /api/v1/room/:roomId/member/:memberId` — change a member's role (creator only; the creator's own role can't be changed).
- `DELETE /api/v1/room/:roomId/member/:memberId` — remove a member (creator only; the creator can't remove themselves this way).

Relevant backend areas:
- `backend/controllers/member.js`
- `backend/meddlewares/memberExistsInRoom.js`, `backend/meddlewares/requireCreator.js`

### Shared expenses / transactions

Room members can log a shared expense with a title, amount, category, and the members it should be split across.

- `POST /api/v1/transaction/:roomId/` — create a transaction.
- `GET /api/v1/transaction/:roomId/` — list transactions for a room (search by title, filter by category/payer/amount range/debt status, sort, paginate).
- `GET /api/v1/transaction/:roomId/:transactionId` — get one transaction.
- `PATCH /api/v1/transaction/:roomId/:transactionId` — edit a transaction (title/category only — see Incomplete below).
- `DELETE /api/v1/transaction/:roomId/:transactionId` — delete a transaction (see Incomplete below).

Relevant backend areas:
- `backend/controllers/transaction.js`
- `backend/routes/transaction.js`
- `backend/models/Transaction.js`

### Debt tracking with partial payments

Every transaction stores a `splitAmong` list — one entry per member, each with `debtAmount`, `paidAmount`, and a `status` of `Pending`, `Partial`, or `Paid`.

- `PATCH /api/v1/transaction/:roomId/:transactionId/payment/:memberId` — record a payment toward a member's debt.

This logic is correct and complete:
- A payment can't exceed the remaining due amount.
- `paidAmount` accumulates across multiple partial payments.
- `status` automatically becomes `Paid` once the full amount is paid, and `Partial` otherwise.
- A debt that's already `Paid` can't be paid again.

Relevant backend areas:
- `backend/controllers/settleDebt.js`
- `backend/models/Transaction.js` (`splitAmong` sub-schema)

---

## Incomplete

### Custom expense splitting

The transaction API accepts a `splitType` of either `allRoomMember` (split across every current room member) or `custom` (split across a specific list of member IDs).

**The problem:** even for `splitType: 'custom'`, the amount is still divided equally:

```js
const debtAmount = amount / (members.length)
```

(`backend/controllers/transaction.js`, `createTrans`)

So "custom" splitting today only lets you **choose which members are included** — it does **not** let you assign different amounts to different members. To make this a true custom split, the endpoint would need to accept a per-member amount (or percentage) and validate that they sum to the total.

**Status: Incomplete — do not rely on this for genuinely unequal splits.**

### Deleting a transaction

`deleteTrans` is supposed to block deletion once any member (other than the payer) has already paid or partially paid their share, so debt history isn't lost. The check that's meant to enforce this has a bug:

```js
return m.status === 'Paid' || 'Partial'
```

Because of operator precedence, this is `(m.status === 'Paid') || 'Partial'`, and the string `'Partial'` is always truthy — so this check returns "true" for almost any non-payer member, **regardless of their actual payment status**. In practice this means most multi-member transactions currently can't be deleted at all, even ones where nobody has paid anything yet.

**Status: Incomplete — the safety check needs to be rewritten to actually compare against both statuses**, e.g. `m.status === 'Paid' || m.status === 'Partial'`.

### Frontend coverage

The backend API above exists and works (aside from the two items already noted), but the frontend only implements a small slice of it:

- Landing page — done.
- "Send OTP" step of registration — wired to the backend.
- "Register" step (with OTP entry) — wired to the backend, but it navigates to `/dashboard` on success, and no `/dashboard` route or page exists yet.
- Login page — the file (`frontend/src/pages/LoginPage/LoginPage.jsx`) exists but is currently empty.
- There is no frontend UI at all yet for rooms, joining a room, members, transactions, expense splitting, or debt/payment tracking.

See [FRONTEND.md](./FRONTEND.md#known-frontend-limitations) for details.

---

## Planned

### Chore management

"Chore Management" is advertised on the landing page (`frontend/src/pages/LandingPage/FeaturesSection.jsx`, `HeroSection.jsx`, `HowItWorksSection.jsx`) as one of RMS's features. There is:

- no `Chore` model,
- no chore-related route or controller,
- no chore-related frontend page or component.

This is a planned feature only — nothing behind it has been built yet.
