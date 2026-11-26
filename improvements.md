# RMS Engineering Review & Improvements Roadmap

> **Comprehensive Multi-Agent Audit Report**  
> **Date:** November 2026  
> **Scope:** Full-stack review of RMS (Frontend UI/UX, Backend Architecture & Database, Session Architecture & Security).  
> **Review Agents:**  
> 1. Frontend Architecture & UI/UX Reviewer  
> 2. Backend & API Architecture Reviewer  
> 3. Auth, Session & Security Reviewer  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [P0 Critical Systemic Blockers (Fix Immediately)](#2-p0-critical-systemic-blockers)
3. [Frontend UI/UX & Client Architecture](#3-frontend-uiux--client-architecture)
4. [Backend Architecture, Database & Business Logic](#4-backend-architecture-database--business-logic)
5. [Session Architecture, Authentication & Security](#5-session-architecture-authentication--security)
6. [Feature Parity & Product Roadmap Gaps](#6-feature-parity--product-roadmap-gaps)
7. [Code Health, Conventions & Directory Structure](#7-code-health-conventions--directory-structure)
8. [Testing, CI/CD & DevOps](#8-testing-cicd--devops)
9. [Prioritized Remediation Matrix](#9-prioritized-remediation-matrix)

---

## 1. Executive Summary

RMS (Roommate Management System) is an application designed to manage shared living arrangements, room creation and membership, expense splitting, and debt settlements. The project was built from scratch using a modern tech stack:
- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router v7, Axios.
- **Backend:** Node.js, Express 5, MongoDB / Mongoose, JWT (Access + Refresh tokens), Nodemailer, Bcryptjs.

While the core conceptual architecture and design language (Material Design 3 / Stitch aesthetic) provide a solid foundation, this multi-agent audit uncovered several **critical bugs, architectural vulnerabilities, and structural misalignments**:
- **Critical Production Blockers:** A static TTL bug permanently destroys verification codes after 30 minutes of server uptime; a JavaScript operator precedence bug blocks all transaction deletions; unhandled lazy routing triggers React render crashes; and an object-as-function bug in Axios crashes the client on token refresh.
- **Session & Security Vulnerabilities:** Missing refresh token rotation (RTR), multi-device refresh token lockout bugs, extreme bcrypt CPU overhead on refresh, broken object-level authorization (BOLA/IDOR) allowing roommates to settle any debt or wipe out transactions, and lack of rate limiting on authentication and email endpoints.
- **UX & Responsiveness Gaps:** Mobile viewports completely lock users out of navigation; global CSS rules on `body` squash protected page layouts; and critical features (debt payment UI, custom expense member selection, member management) remain unimplemented on the frontend despite backend support.

This document compiles all findings and provides concrete, drop-in remediation code.

---

## 2. P0 Critical Systemic Blockers

These issues must be resolved before deploying or testing in production.

### 2.1 Statically Evaluated TTL Expiration on `Vco` Schema
- **File:** `backend/models/Vco.js:25-29`
- **Severity:** **CRITICAL (Showstopper)**
- **Problem:**
  ```javascript
  expiresAt: {
      type: Date,
      default: Date.now() + 30 * 60 * 1000,
      expires: 0
  }
  ```
  `Date.now() + 30 * 60 * 1000` is evaluated **once** when the Node.js process starts and imports the file. After the server has been running for 30 minutes, every newly generated verification code (VCO) receives a static timestamp in the past. MongoDB's TTL background monitor immediately purges new codes, permanently breaking the room join verification flow for all users.
- **Fix:** Pass a function getter to `default`:
  ```javascript
  expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
      expires: 0
  }
  ```

---

### 2.2 Operator Precedence Bug in `deleteTrans`
- **File:** `backend/controllers/transaction.js:221-233`
- **Severity:** **CRITICAL (Logic Trap)**
- **Problem:**
  ```javascript
  const check = req.transaction.splitAmong.find(
      m => {
          if (m.userId.toString() !== req.transaction.paidBy.toString()) {
              return m.status === 'Paid' || 'Partial';
          }
      }
  );
  if (check) {
      throw new BadRequestError('if any one\'s debt amount paid or partial can delete transaction');
  }
  ```
  In JavaScript, `'Partial'` is a truthy non-empty string. Due to operator precedence, `(m.status === 'Paid') || 'Partial'` evaluates to `'Partial'` (truthy) for *any* non-payer member, regardless of whether their status is `'Pending'`. Consequently, **no transaction with more than one member can ever be deleted**, even if zero payments have been made.
- **Fix:**
  ```javascript
  const hasPayments = req.transaction.splitAmong.some(
      m => m.userId.toString() !== req.transaction.paidBy.toString() &&
           (m.status === 'Paid' || m.status === 'Partial')
  );
  if (hasPayments) {
      throw new BadRequestError('Cannot delete a transaction after payments have been recorded against it.');
  }
  ```

---

### 2.3 Broken Object Level Authorization (BOLA) in Debt Settlement
- **File:** `backend/controllers/settleDebt.js:8-51`, `backend/routes/transaction.js:27`
- **Severity:** **CRITICAL (Security / Financial Data Tampering)**
- **Problem:**
  Any room member can invoke `PATCH /api/v1/transaction/:roomId/:transactionId/payment/:memberId`. The endpoint never verifies whether the requester is the person who actually paid for the expense (`req.transaction.paidBy`). Any roommate can submit `{ payment: debtAmount }` for themselves and mark their debt as `"Paid"` without transferring any money. Additionally, negative values (`payment < 0`) are not checked.
- **Fix:**
  ```javascript
  const updateDebtPayment = async (req, res) => {
      const { payment } = req.body;
      const { memberId } = req.params;

      // 1. Enforce that only the creditor can acknowledge payment
      if (req.transaction.paidBy.toString() !== req.user.userId.toString()) {
          throw new CustomError.ForbiddenError('Only the member who paid for this expense can record or verify debt payments.');
      }

      // 2. Strict numerical validation
      const paymentAmount = Number(payment);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
          throw new CustomError.BadRequestError('Payment must be a positive number.');
      }

      const member = req.transaction.splitAmong.find(m => m.userId.toString() === memberId);
      if (!member) throw new CustomError.NotFoundError('Member not found in this transaction split.');

      const dueAmount = member.debtAmount - member.paidAmount;
      if (paymentAmount > dueAmount) {
          throw new CustomError.BadRequestError('Payment amount cannot exceed the remaining due amount.');
      }

      member.paidAmount = Number((member.paidAmount + paymentAmount).toFixed(2));
      member.status = member.paidAmount >= member.debtAmount ? 'Paid' : 'Partial';

      await req.transaction.save();
      res.status(StatusCodes.OK).json({ success: true, transaction: req.transaction });
  };
  ```

---

### 2.4 Missing `<Suspense>` Boundary on Lazy Routes (Client Crash)
- **File:** `frontend/src/App.jsx:5-31`
- **Severity:** **CRITICAL (Frontend Runtime Failure)**
- **Problem:**
  Pages are imported using `React.lazy(() => import(...))`. However, `<Routes>` is not wrapped in `<Suspense fallback={...}>`. In React 19, rendering a suspended lazy chunk without a boundary throws an unhandled runtime error:
  `Error: A component suspended while rendering, but no fallback was specified. Add a <Suspense fallback=...> component higher in the tree.`
- **Fix:** Wrap lazy routes in `<Suspense>` using the existing `PageLoader`:
  ```jsx
  import { Suspense, lazy } from 'react';
  import PageLoader from './components/Loaders/PageLoader';

  export default function App() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* route definitions */}
        </Routes>
      </Suspense>
    );
  }
  ```

---

### 2.5 Fatal Interceptor Crash: `tokenStore(null)`
- **File:** `frontend/src/api/axios.js:54-57`
- **Severity:** **CRITICAL (Session Crash)**
- **Problem:**
  ```javascript
  } catch (refreshError) {
      tokenStore(null); // CRASH! tokenStore is { get, set }, NOT a function!
      return Promise.reject(refreshError);
  }
  ```
  `tokenStore` is exported as an object `{ get, set }`. Calling `tokenStore(null)` throws `TypeError: tokenStore is not a function`, preventing clean session invalidation and leaving the application in a broken state.
- **Fix:** Change to `tokenStore.set(null);`.

---

### 2.6 Global CSS Pollution Squashing Authenticated Pages
- **File:** `frontend/src/components/Auth/AuthPage.css:1-12`
- **Severity:** **CRITICAL (Visual / Layout Breakage)**
- **Problem:**
  ```css
  body {
    background-color: #f0f3ff;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  ```
  Because CSS imported in SPA bundles affects the global document, loading `/login` applies `display: flex; align-items: center; justify-content: center` to the root `<body>`. When the user navigates to `/dashboard` or `/rooms/:roomId`, the entire application layout becomes squashed into a small centered box in the middle of the screen.
- **Fix:** Remove `body` declarations from `AuthPage.css` and use a scoped class `.auth-page-container` applied to the outer div in `AuthPage.jsx`.

---

## 3. Frontend UI/UX & Client Architecture

### 3.1 Layout Architecture & Redundant Shell Duplication
- **Current State:** `MainLayout.jsx` is a 450-line monolithic component containing dashboard queries, bento metrics, room cards, and dialogs. Meanwhile, `MyRoomsPage`, `ProfilePage`, and `RoomDetailsPage` duplicate `<SideNavbar />` and header markup.
- **Recommendation:**
  Create a unified `AppLayout.jsx` with `<SideNavbar />`, shared `<Header />`, and `<Outlet />`.
  ```jsx
  // frontend/src/components/layout/AppLayout.jsx
  import { Outlet } from 'react-router-dom';
  import SideNavbar from './SideNavbar';

  export default function AppLayout() {
    return (
      <div className="flex h-dvh overflow-hidden bg-background text-on-surface">
        <SideNavbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden md:ml-64">
          <Outlet />
        </main>
      </div>
    );
  }
  ```
  Nest authenticated routes in `App.jsx`:
  ```jsx
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/my-rooms" element={<MyRoomsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />
    </Route>
  </Route>
  ```

---

### 3.2 Mobile Navigation Lockout
- **Problem:** `SideNavbar.jsx` has `hidden md:flex`. The hamburger icon on mobile headers is an inert `<span>` with no click listener. Users on mobile devices cannot switch tabs, view their rooms, or log out.
- **Fix:**
  1. Add a mobile slide-over drawer triggered by the hamburger icon or implement a mobile bottom navigation bar (`<BottomNav />`) with icons for Dashboard, My Rooms, Profile, and Logout.
  2. Ensure all touch targets meet minimum accessibility guidelines (44x44px).

---

### 3.3 Form Robustness & Accessible OTP Inputs
- **Issues Found:**
  - `SendOtpForm.jsx` has typo `setResponseErrors` (line 22) throwing `ReferenceError: setResponseErrors is not defined`.
  - `SendOtpForm.jsx` does not return after email validation fails (line 35), sending invalid emails to the API.
  - Forms access `error.response.data.msg` without optional chaining, crashing when network disconnects occur (`error.response` undefined).
  - OTP inputs in `RegistrationForm.jsx` omit the `value` prop (uncontrolled), lack clipboard `onPaste` support, and lack mobile attributes (`inputMode="numeric"`, `autoComplete="one-time-code"`).
- **Remediation:**
  - Create a dedicated `<OtpInput length={6} value={otp} onChange={setOtp} />` component that handles auto-focus, paste parsing, and backspace navigation.
  - Guard all API catches: `const message = error.response?.data?.msg || error.message || 'An unexpected error occurred';`.
  - Pass the verified email from `/sendotp` to `/register` via router navigation state (`navigate('/register', { state: { email } })`).
  - Redirect successful registration to `/login` with an informational toast rather than `/dashboard` (which causes an immediate bounce).

---

### 3.4 UI Polish & Route Consistency
- **Login Button Bug:** In `LoginForm.jsx:131`, `className="w-fu ll h-[48px]"` has a space in `w-fu ll`, breaking full-width button styling. The button text also says `"Create Account"` instead of `"Sign In"`.
- **Image Asset Path:** In `SideNavbar.jsx:37`, `<img src="screen.png" />` uses a relative path. In subroutes like `/rooms/123`, it 404s. Change to `/screen.png`.
- **Route Casing:** Normalize all route declarations to lowercase kebab-case (`/dashboard`, `/my-rooms`, `/profile`, `/rooms/:roomId`).
- **404 Catch-All:** Add `<Route path="*" element={<NotFoundPage />} />` in `App.jsx`.

---

## 4. Backend Architecture, Database & Business Logic

### 4.1 Missing Database Indexes
- **Problem:** Several critical lookup fields lack MongoDB indexes, causing collection scans ($O(N)$):
  - `Room.roomCode`: Looked up on every room join.
  - `Transaction.roomId`: Looked up on every room details query.
  - `RefreshToken.user`: Searched on token refresh and logout.
  - `User.passwordResetToken`: Searched during password reset.
  - `Vco.userId`: Searched during room join verification.
- **Fix:** Add schema indexes:
  ```javascript
  // models/Room.js
  roomSchema.index({ roomCode: 1 }, { unique: true });

  // models/Transaction.js
  transactionSchema.index({ roomId: 1, createdAt: -1 });
  transactionSchema.index({ 'splitAmong.userId': 1 });

  // models/RefreshToken.js
  refreshTokenSchema.index({ user: 1 });

  // models/User.js
  userSchema.index({ passwordResetToken: 1 }, { sparse: true });
  ```

---

### 4.2 Floating-Point Cent Rounding & Debt Lockup
- **Problem:** Expense splitting uses standard IEEE 754 division:
  ```javascript
  const debtAmount = amount / (members.length); // e.g. 100 / 3 = 33.333333333333336
  ```
  When a member pays `33.33`, a remainder of `0.0033333333...` remains. Because `payment > dueAmount` prevents paying `33.34`, the debt can **never reach 'Paid' status**.
- **Fix:** Calculate splits using integer cents and distribute remainder cents evenly:
  ```javascript
  const totalCents = Math.round(amount * 100);
  const numMembers = members.length;
  const baseShare = Math.floor(totalCents / numMembers);
  let remainderCents = totalCents % numMembers;

  const splitAmong = members.map(memberId => {
      let shareCents = baseShare;
      if (remainderCents > 0) {
          shareCents += 1;
          remainderCents -= 1;
      }
      const isPayer = memberId === req.user.userId.toString();
      return {
          userId: memberId,
          debtAmount: Number((shareCents / 100).toFixed(2)),
          paidAmount: isPayer ? Number((shareCents / 100).toFixed(2)) : 0,
          status: isPayer ? 'Paid' : 'Pending'
      };
  });
  ```

---

### 4.3 Validation of Custom Split Members
- **Problem:** In `transaction.js:28-35`, when `splitType === 'custom'`, `req.body.members` is accepted without verifying that the provided IDs belong to `req.room.members`. Arbitrary user IDs can be injected into the room's transactions.
- **Fix:** Validate that all IDs in `members` exist in `req.room.members`:
  ```javascript
  const roomMemberIds = new Set(req.room.members.map(m => m.user.toString()));
  const allValid = members.every(id => roomMemberIds.has(id.toString()));
  if (!allValid) {
      throw new BadRequestError('All custom split members must belong to the room.');
  }
  ```

---

### 4.4 Cascade Cleanup on Room & Member Deletion
- **Room Deletion:** `Room.deleteOne({ _id: roomId })` leaves orphaned `Transaction`, `Chore`, and `Vco` records. Add pre-delete hooks or service logic:
  ```javascript
  await Promise.all([
      Transaction.deleteMany({ roomId }),
      Chore.deleteMany({ roomId }),
      Vco.deleteMany({ roomId })
  ]);
  ```
- **Member Removal:** Prevent removing a member if their outstanding debt is non-zero or if they are the creditor (`paidBy`) of active transactions with outstanding balances.

---

### 4.5 Centralized Error Handler `[object Object]` Masking
- **File:** `backend/meddlewares/error-handler.js:12-16`
- **Problem:**
  ```javascript
  if (err.name === 'ValidationError') {
      customError.msg = Object.values(err.errors).map((item) => item).join(',');
  }
  ```
  `err.errors` contains Mongoose `ValidatorError` objects. Joining objects directly yields `"[object Object]"`, completely concealing schema validation errors from the frontend.
- **Fix:** Map `item.message`:
  ```javascript
  if (err.name === 'ValidationError') {
      customError.msg = Object.values(err.errors).map(item => item.message).join(', ');
      customError.statusCode = StatusCodes.BAD_REQUEST;
  }
  ```

---

### 4.6 HTTP Status Code & Verb Standards
- `transaction.js:68`: `getSingleTrans` returns `StatusCodes.CREATED` (201) for a `GET` request. Change to `StatusCodes.OK` (200).
- `room.js:218`, `member.js:41`, `transaction.js:241`: Returns `StatusCodes.NO_CONTENT` (204) with a JSON body. RFC 9110 specifies 204 MUST NOT contain a body. Change to `StatusCodes.OK` (200) or `res.status(204).end()`.
- Add a dedicated `ForbiddenError` (403) in `errors/` instead of throwing `BadRequestError` (400) on unauthorized operations.

---

## 5. Session Architecture, Authentication & Security

### 5.1 Refresh Token Rotation (RTR) & Fast SHA-256 Hashing
- **Problems:**
  1. **No Rotation:** Refresh tokens remain static for 7 days. If intercepted, an attacker can continuously mint access tokens without detection.
  2. **Multi-Device Lockout:** `RefreshToken.findOne({ user: payload.userId })` returns only the first document. Logging in on a second device causes `bcrypt.compare` to fail on the other device.
  3. **Bcrypt Overhead:** Running `bcrypt.hash(salt 10)` on a high-entropy 256-bit token during frequent refreshes consumes high CPU.
- **Fix:**
  - Include a unique `jti` (UUID) or use direct deterministic SHA-256 token hashing:
  ```javascript
  // Store hashed refresh token in database
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  await RefreshToken.create({ user: user._id, tokenHash, expiresAt: ... });
  ```
  - Rotate on every `/refresh`: delete the old token and issue a fresh pair.
  - If an already-used or deleted refresh token is presented, detect token reuse and immediately revoke all sessions for that user.

---

### 5.2 Cryptographically Secure OTP Generation
- **File:** `backend/utils/generateOTP.js:1-5`
- **Problem:** `Math.floor(100000 + Math.random() * 900000)` uses `Math.random()`, which is a predictable pseudo-random generator vulnerable to seed prediction.
- **Fix:** Use Node.js built-in `crypto.randomInt`:
  ```javascript
  const crypto = require('crypto');
  const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
  module.exports = generateOtp;
  ```

---

### 5.3 Complete Session Invalidation on Password Reset
- **File:** `backend/controllers/auth.js:163-168`
- **Problem:** When a user resets their password, existing refresh tokens in `RefreshToken` are **not deleted**. A compromised session remains active even after the password is changed.
- **Fix:** Invalidate all active refresh tokens upon password reset:
  ```javascript
  await RefreshToken.deleteMany({ user: user._id });
  ```

---

### 5.4 Rate Limiting & Network Defenses
- **Problem:** Zero rate limiting across sensitive endpoints:
  - `POST /auth/login` (brute-force credentials)
  - `POST /auth/send-code` (email bombing & SMTP resource exhaustion)
  - `POST /room/gen-vco` (harassment of room creators)
- **Fix:** Mount `express-rate-limit`:
  ```javascript
  const rateLimit = require('express-rate-limit');

  const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: { success: false, msg: 'Too many attempts. Please try again after 15 minutes.' }
  });

  const otpLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 3,
      message: { success: false, msg: 'Too many OTP requests. Please try again in an hour.' }
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/send-code', otpLimiter);
  ```

---

### 5.5 Security Headers & CORS Environment Configuration
- Install and mount `helmet`:
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```
- Remove hardcoded CORS `http://localhost:5173` and read from `process.env.CLIENT_URL`.

---

## 6. Feature Parity & Product Roadmap Gaps

| Feature Area | Backend API Status | Frontend UI Status | Gap to Close |
|---|---|---|---|
| **Debt Settlement** | `PATCH /transaction/:roomId/:transId/payment/:memberId` implemented | Only shows balance number in Overview tab | Build a "Settle Up" modal allowing users to enter a payment amount, view outstanding dues, and see `Paid` / `Partial` status tags. |
| **Custom Split** | `splitType: 'custom'` supported with `members: []` | Hardcodes `splitType: 'allRoomMember'` in `RoomDetailsPage.jsx` | Add multi-select checkboxes for roommates in the "Add Expense" form. |
| **Room Management** | Rename (`PATCH /room/:id`), Delete (`DELETE /room/:id`) implemented | None | Add a Room Settings modal with rename and delete options for the creator. |
| **Member Roles & Removal** | `PATCH /room/:id/member/:id`, `DELETE /room/:id/member/:id` implemented | Read-only member list | Add role change dropdown (`admin` / `member`) and a "Remove Member" action for room admins/creators. |
| **Password Reset** | `POST /auth/forgot-password`, `POST /auth/reset-password/:token` | None | Add "Forgot Password?" link on login page and build a dedicated reset password page. |

---

## 7. Code Health, Conventions & Directory Structure

1. **Rename Misspelled Directory:** Rename `backend/meddlewares/` to `backend/middlewares/` and update references across `app.js`, `routes/`, and `controllers/`.
2. **Environment Variable Typos:**
   - Standardize `JWT_REHRESH_SECRET` (with typo 'H') to `JWT_REFRESH_SECRET`.
   - Correct `userSchema.methods.creatAccessToken` (missing 'e') to `createAccessToken`.
3. **Frontend Component Typos:**
   - In `AuthPage.jsx` and `AuthCard.jsx`, fix prop typo `childern` to `children`.
   - Rename `BrandlingHeadline.jsx` to `BrandingHeadline.jsx`.
   - Fix component name `Registrationform` to `RegistrationForm`.
4. **Remove Dead Dependencies:**
   - Prune unused `redis` and duplicate `http-status-code` from `backend/package.json`.
   - Delete empty files `frontend/src/pages/MyRoomsPage/MyRooms.jsx` and `frontend/src/style.css`.

---

## 8. Testing, CI/CD & DevOps

1. **Backend Integration Testing:**
   - Current test script: `"test": "echo \"Error: no test specified\" && exit 1"`.
   - Set up **Vitest** or **Jest** with `supertest` and `mongodb-memory-server` to test:
     - Auth OTP registration and login.
     - Room creation, join with VCO verification.
     - Expense creation, split math verification, and debt settlement.
2. **Frontend Component & Hook Testing:**
   - Set up `@testing-library/react` and Vitest for testing:
     - Form validation and OTP inputs.
     - Route guards (`ProtectedRoute` / `GuestRoute`).
     - Axios interceptor refresh logic.
3. **CI/CD Pipeline:**
   - Add a GitHub Actions workflow (`.github/workflows/ci.yml`) running linting (`eslint`), type checks, and automated tests on every pull request.

---

## 9. Prioritized Remediation Matrix

| Priority | Task | Affected Area | Target Files |
|:---|:---|:---|:---|
| **P0** | Fix static `Date.now()` TTL bug in VCO model | Backend Model | `backend/models/Vco.js` |
| **P0** | Fix truthy `'Partial'` operator precedence bug in `deleteTrans` | Backend Logic | `backend/controllers/transaction.js` |
| **P0** | Restrict debt settlement to creditor (`paidBy`) & validate numbers (BOLA fix) | Backend Authz | `backend/controllers/settleDebt.js` |
| **P0** | Wrap lazy-loaded routes in `<Suspense fallback={<PageLoader />}>` | Frontend Routing | `frontend/src/App.jsx` |
| **P0** | Fix `tokenStore.set(null)` in axios interceptor and add `_retry = true` | Frontend Auth | `frontend/src/api/axios.js` |
| **P0** | Remove `body` styles from `AuthPage.css` to prevent layout centering | Frontend CSS | `frontend/src/components/Auth/AuthPage.css` |
| **P1** | Add database indexes (`Room.roomCode`, `Transaction.roomId`, `RefreshToken.user`) | Database | `backend/models/*.js` |
| **P1** | Implement integer cent split math to eliminate fractional cent traps | Backend Logic | `backend/controllers/transaction.js`, `settleDebt.js` |
| **P1** | Replace `Math.random()` with `crypto.randomInt` for OTP generation | Backend Security | `backend/utils/generateOTP.js` |
| **P1** | Implement Refresh Token Rotation (RTR) and SHA-256 token hashing | Session Arch | `backend/controllers/auth.js`, `models/RefreshToken.js` |
| **P1** | Synchronize `tokenStore.set(token)` inside `AuthContext.jsx:login()` | Frontend Session | `frontend/src/context/AuthContext.jsx` |
| **P1** | Add mobile navigation drawer/bottom bar to fix mobile lockout | Frontend UI/UX | `frontend/src/components/layout/SideNavbar.jsx` |
| **P1** | Mount `express-rate-limit` on login, OTP, and join-room endpoints | Backend Security | `backend/app.js`, `routes/auth.js` |
| **P1** | Invalidate all refresh tokens on password reset | Backend Security | `backend/controllers/auth.js` |
| **P2** | Extract shared `AppLayout` with `<Outlet />` to remove layout duplication | Frontend Arch | `frontend/src/components/layout/AppLayout.jsx` |
| **P2** | Add Settle Up / Debt Payment modal on `RoomDetailsPage` | Frontend Feature | `frontend/src/pages/RoomDetailsPage/` |
| **P2** | Add roommate selection checkboxes for custom splits in Add Expense form | Frontend Feature | `frontend/src/pages/RoomDetailsPage/` |
| **P2** | Map `err.errors` message in centralized error handler to avoid `[object Object]` | Backend Error | `backend/meddlewares/error-handler.js` |
| **P2** | Sanitize request inputs against NoSQL operator injection and ReDoS | Backend Security | `backend/app.js` |
| **P2** | Mount `helmet` and configure CORS via `process.env.CLIENT_URL` | Backend Security | `backend/app.js` |
| **P2** | Build accessible controlled `<OtpInput />` with clipboard paste support | Frontend Forms | `frontend/src/pages/registrationPage/` |
| **P3** | Rename `meddlewares/` to `middlewares/` and fix typo `JWT_REHRESH_SECRET` | Code Health | Repository-wide |
| **P3** | Correct `childern` prop typos and rename `BrandlingHeadline.jsx` | Code Health | `frontend/src/components/Auth/` |
| **P3** | Prune unused packages (`redis`, duplicate `http-status-code`) | Dependencies | `backend/package.json` |
| **P3** | Build Password Reset request & token verification pages | Frontend Feature | `frontend/src/pages/` |
| **P3** | Set up Vitest + Supertest integration test suite | Testing | `backend/`, `frontend/` |

