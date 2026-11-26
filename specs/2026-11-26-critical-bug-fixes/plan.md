# Plan — Critical Bug Fixes (Phase 0)

## Overview

Fix 8 critical bugs that cause crashes, block core functionality, or expose security vulnerabilities. Zero new features — just make the existing code stop breaking. Work is organized into 3 groups matching the roadmap sub-sections, ordered backend-first because the frontend fixes can be verified faster once the backend is stable.

## Task Groups

### Group 1 — Backend crash & logic fixes (0.1)

1. [ ] **Fix static TTL in `Vco.js`**
   - File: `backend/models/Vco.js` (line ~25-29)
   - Change `default: Date.now() + 30 * 60 * 1000` → `default: () => new Date(Date.now() + 15 * 60 * 1000)`
   - The current code evaluates `Date.now()` once at module load. After 30 min of server uptime, every new VCO gets an already-expired timestamp and MongoDB's TTL monitor immediately deletes it.

2. [ ] **Fix operator precedence in `deleteTrans`**
   - File: `backend/controllers/transaction.js` (line ~221-233)
   - Replace `m.status === 'Paid' || 'Partial'` with `m.status === 'Paid' || m.status === 'Partial'`
   - Rewrite using `.some()` instead of `.find()` for clarity: the check should return a boolean, not a member object.

3. [ ] **Fix `[object Object]` in error handler**
   - File: `backend/meddlewares/error-handler.js` (line ~12-16)
   - Change `.map((item) => item)` → `.map(item => item.message)` in the `ValidationError` branch.
   - Add `customError.statusCode = StatusCodes.BAD_REQUEST` for Mongoose validation errors.

### Group 2 — Backend authorization fix (0.2)

4. [ ] **Restrict debt settlement to creditor only**
   - File: `backend/controllers/settleDebt.js` (line ~8-51)
   - Add a guard: `if (req.transaction.paidBy.toString() !== req.user.userId.toString())` → throw `ForbiddenError` (or `BadRequestError` until `ForbiddenError` is added in Phase 2).
   - This is a BOLA/IDOR vulnerability — any room member can currently mark their own debt as paid without the creditor's approval.

5. [ ] **Validate payment is a positive number**
   - File: `backend/controllers/settleDebt.js`
   - Add: `const paymentAmount = Number(payment); if (isNaN(paymentAmount) || paymentAmount <= 0)` → throw `BadRequestError`.
   - Prevents negative payments or NaN from corrupting debt records.

### Group 3 — Frontend crash fixes (0.3)

6. [ ] **Wrap lazy routes in `<Suspense>`**
   - File: `frontend/src/App.jsx` (line ~5-31)
   - Import `Suspense` from React and `PageLoader` from `./components/Loaders/PageLoader`.
   - Wrap `<Routes>` in `<Suspense fallback={<PageLoader />}>`.
   - Without this, React 19 throws a runtime error on first navigation to any lazy-loaded route.

7. [ ] **Fix `tokenStore(null)` → `tokenStore.set(null)`**
   - File: `frontend/src/api/axios.js` (line ~54-57)
   - `tokenStore` is `{ get, set }`, not a function. Calling `tokenStore(null)` throws `TypeError` and prevents clean session teardown on refresh failure.

8. [ ] **Scope `AuthPage.css` body styles**
   - File: `frontend/src/components/Auth/AuthPage.css` (line ~1-12)
   - Remove the `body { display: flex; align-items: center; justify-content: center; }` rule.
   - Replace with a scoped `.auth-page-container` class and apply it to the outer `<div>` in `AuthPage.jsx`.
   - The global `body` style squashes every page into a centered box after visiting `/login` or `/register`.

