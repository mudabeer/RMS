# Backend Documentation

This document explains how the `backend/` app is put together, for anyone who wants to contribute to it.

## Backend Overview

The backend is a REST API built with:

- **[Express 5](https://expressjs.com/)** — HTTP server and routing
- **[MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)** — database and schemas
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** — access/refresh token generation and verification
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** — password and OTP hashing
- **[nodemailer](https://www.npmjs.com/package/nodemailer)** — sending verification codes, welcome emails, and password reset links via Gmail
- **[nano-id](https://www.npmjs.com/package/nano-id)** — generating room codes and short verification codes
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)** + **[cors](https://www.npmjs.com/package/cors)** — cookies and cross-origin requests from the frontend

There is no test suite yet — `npm test` is a placeholder script.

## Backend Structure

```text
backend/
├── app.js               # Express app setup, middleware, route mounting, server start
├── config/
│   └── email.js          # nodemailer transporter configuration
├── controllers/
│   ├── auth.js           # register/login/logout/refresh/password reset
│   ├── member.js         # update/delete a room member
│   ├── room.js           # create/list/update/delete rooms, join-room flow
│   ├── settleDebt.js      # record a payment against a transaction debt
│   └── transaction.js    # create/list/update/delete transactions
├── db/
│   └── db.js              # mongoose connection helper
├── errors/                # custom Error subclasses (BadRequest, NotFound, Unauthenticated) + shared index
├── meddlewares/            # Express middleware (this folder name is spelled this way in the repo)
│   ├── authentication.js  # verifies the JWT access token
│   ├── error-handler.js   # centralized error → JSON response mapping
│   ├── loadRoom.js        # loads a Room by :roomId onto req.room
│   ├── loadTransaction.js # loads a Transaction by :transactionId onto req.transaction
│   ├── memberExistsInRoom.js
│   ├── requireCreator.js  # only the room creator may proceed
│   └── requireRoomMember.js
├── models/
│   ├── Otp.js
│   ├── RefreshToken.js
│   ├── Room.js
│   ├── Transaction.js
│   ├── User.js
│   └── Vco.js              # "verification code" documents used for the join-room flow
├── routes/
│   ├── auth.js
│   ├── room.js
│   └── transaction.js
├── services/
│   └── emailService.js     # the actual email templates/sending functions used by controllers
└── utils/
    ├── cookies.js          # helpers to attach access/refresh token cookies to a response
    └── generateOTP.js
```

## Architecture

Requests generally flow like this:

```text
Request
   ↓
Route (backend/routes/*.js)
   ↓
Middleware (auth, loadRoom, loadTransaction, requireCreator, requireRoomMember, ...)
   ↓
Controller (backend/controllers/*.js)
   ↓
Model (backend/models/*.js, via Mongoose)
   ↓
MongoDB
```

Middleware is chained per-route as needed. For example, updating a transaction's payment goes through:

```text
auth → loadRoom → requireRoomMember → loadTransaction → updateDebtPayment
```

(`backend/routes/transaction.js`)

Errors thrown anywhere in this chain (as a `BadRequestError`, `NotFoundError`, `UnauthenticatedError`, or a raw Mongoose error) are caught by Express and formatted by `backend/meddlewares/error-handler.js` into a consistent `{ success: false, msg: "..." }` JSON response.

## Authentication

Authentication is JWT-based, with a short-lived **access token** and a longer-lived **refresh token**:

- `User.createRefreshToken()` and `User.creatAccessToken()` (`backend/models/User.js`) sign the tokens with `JWT_REHRESH_SECRET` / `JWT_ACCESS_SECRET`.
- On login (`backend/controllers/auth.js`), both tokens are generated, and the refresh token's hash is stored in a `RefreshToken` document so it can be revoked (e.g. on logout).
- `backend/utils/cookies.js` attaches both tokens to the response as `httpOnly` cookies (`accessToken`, `refreshToken`).
- `backend/meddlewares/authentication.js` protects routes, but currently reads the access token from an `Authorization: Bearer <token>` header — **not** from the cookie that login actually sets.

> ⚠️ See [Known Backend Limitations](#known-backend-limitations) below — this mismatch means protected routes can't currently be reached the way the login flow is set up.

Protected routes (anything using the `auth` middleware) expect `req.user = { userId, userName }` to be set from the token payload.

## Database

- **Technology:** MongoDB, connected via Mongoose in `backend/db/db.js` using the `MONGO_URI` environment variable.
- **Models:**
  - `User` — account info, hashed password, password-reset fields, and the two JWT-signing methods.
  - `Otp` — a short-lived one-time code tied to an email, used during registration.
  - `RefreshToken` — a hashed refresh token tied to a `User`, used to issue new access tokens and to support logout.
  - `Room` — a shared-living room: name, unique `roomCode`, a `creator` reference, and a `members` array of `{ user, role }`.
  - `Vco` ("verification code for joining") — a short-lived code tied to a `Room` + the joining `User`, used by the join-room flow.
  - `Transaction` — a shared expense: title, amount, category, `roomId`, `paidBy`, and a `splitAmong` array of `{ userId, debtAmount, paidAmount, status }`.

**Relationships:**
- A `Room` references its `creator` and each member's `User` (`Room.members[].user`).
- A `Transaction` references its `Room` (`roomId`) and the paying `User` (`paidBy`), plus every participating `User` inside `splitAmong[].userId`.
- `RefreshToken` and `Vco` both reference a `User`; `Vco` also references a `Room`.

## Models

| Model | File | Purpose |
|---|---|---|
| `User` | `backend/models/User.js` | Account credentials, password hashing (`pre('save')` hook), JWT signing methods |
| `Otp` | `backend/models/Otp.js` | Registration email verification code |
| `RefreshToken` | `backend/models/RefreshToken.js` | Hashed refresh tokens for session renewal/logout |
| `Room` | `backend/models/Room.js` | A shared-living room and its members/roles |
| `Vco` | `backend/models/Vco.js` | Join-room verification code |
| `Transaction` | `backend/models/Transaction.js` | A shared expense and its per-member debt/payment state |

## Routes / API

All routes are mounted under `/api/v1` in `backend/app.js`.

### Auth — `/api/v1/auth` (`backend/routes/auth.js`)

| Method | Path | Auth required | Purpose |
|---|---|---|---|
| POST | `/send-code` | No | Send a registration OTP to an email |
| POST | `/register` | No | Verify the OTP and create the account |
| POST | `/login` | No | Log in, issue access/refresh tokens |
| POST | `/logout` | Yes | Revoke the refresh token |
| POST | `/refresh` | No (uses refresh cookie) | Issue a new access token |
| POST | `/forgot-password` | No | Send a password reset email |
| POST | `/reset-password/:token` | No | Set a new password using the reset token |

### Rooms — `/api/v1/room` (`backend/routes/room.js`)

| Method | Path | Auth / guards | Purpose |
|---|---|---|---|
| GET | `/` | auth | List the current user's rooms |
| POST | `/` | auth | Create a room |
| PATCH | `/join-room` | auth | Complete joining a room using a verification code |
| POST | `/gen-vco` | auth | Request a verification code to join a room by `roomCode` |
| GET | `/:roomId` | auth, must be a member | Get a single room |
| PATCH | `/:roomId` | auth, must be creator | Rename a room |
| DELETE | `/:roomId` | auth, must be creator | Delete a room |
| PATCH | `/:roomId/member/:memberId` | auth, must be creator | Change a member's role |
| DELETE | `/:roomId/member/:memberId` | auth, must be creator | Remove a member |

### Transactions — `/api/v1/transaction` (`backend/routes/transaction.js`)

| Method | Path | Auth / guards | Purpose |
|---|---|---|---|
| POST | `/:roomId/` | auth, must be a room member | Create a transaction |
| GET | `/:roomId/` | auth, must be a room member | List/filter/search transactions |
| GET | `/:roomId/:transactionId` | auth, must be a room member | Get one transaction |
| PATCH | `/:roomId/:transactionId` | auth, must be a room member | Edit title/category only |
| DELETE | `/:roomId/:transactionId` | auth, must be a room member | Delete a transaction (see limitations) |
| PATCH | `/:roomId/:transactionId/payment/:memberId` | auth, must be a room member | Record a debt payment |

## Controllers

| Controller | File | Responsibility |
|---|---|---|
| Auth | `backend/controllers/auth.js` | Registration/OTP, login/logout, token refresh, password reset |
| Room | `backend/controllers/room.js` | Room CRUD, generating and consuming join verification codes |
| Member | `backend/controllers/member.js` | Updating a member's role, removing a member |
| Transaction | `backend/controllers/transaction.js` | Creating, listing/filtering, editing, and deleting transactions |
| Settle Debt | `backend/controllers/settleDebt.js` | Recording a payment toward a specific member's debt |

## Environment Variables

These are the variables the backend code actually reads (there's no `.env.example` committed yet — you'll need to create your own `backend/.env`):

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development

JWT_ACCESS_SECRET=your_access_token_secret
JWT_ACCESS_LIFETIME=15m
JWT_REHRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_LIFETIME=7d

EMAIL=your_gmail_address
PASSWORD=your_gmail_app_password

FRONTEND_URL=http://localhost:5173
```

> **Note:** `JWT_REHRESH_SECRET` is spelled that way (not `JWT_REFRESH_SECRET`) in the actual code (`backend/models/User.js`, `backend/controllers/auth.js`). Your `.env` file must match this exact spelling for refresh tokens to work, until the typo is fixed in the code.

`EMAIL` / `PASSWORD` are used as Gmail SMTP credentials in `backend/config/email.js`. If you use a real Gmail account, you'll need an [App Password](https://support.google.com/accounts/answer/185833), not your normal account password.

## Running the Backend

```bash
cd backend
npm install
node app.js
```

The `package.json` `start` script (`npm start`) runs `nodemon app.js`, but `nodemon` is **not** currently listed as a dependency — either install it yourself (`npm install -g nodemon` or add it as a devDependency) or just run `node app.js` directly for now.

The server listens on `PORT` (defaults to `3000`) and expects a running MongoDB instance reachable at `MONGO_URI`.

## Known Backend Limitations

Documented honestly, based on what's in the code today:

- **Access-token mismatch:** Login/refresh attach `accessToken` and `refreshToken` as `httpOnly` cookies (`backend/utils/cookies.js`), but `backend/meddlewares/authentication.js` only reads the access token from an `Authorization: Bearer <token>` header (the cookie-reading line is present but commented out). As written, a browser-based frontend using the cookies set at login has no way to retrieve the token to send it as a header — this needs to be reconciled before protected routes work end-to-end.
- **Transaction deletion is over-blocked** by a logic bug in `deleteTrans` — see [FEATURES.md](./FEATURES.md#deleting-a-transaction).
- **`JWT_REHRESH_SECRET` is misspelled** consistently throughout the code (see Environment Variables above).
- **Email config typo:** `backend/config/email.js` sets `host: 'stmp.gmail.cpm'` (should be `smtp.gmail.com`), though this particular field is unused in practice because the transporter is created with `service: 'gmail'`, which ignores the `host`/`port` options.
- **`nodemon` isn't declared as a dependency** even though the `start` script depends on it.
- **No automated tests** exist yet.