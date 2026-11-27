# AGENTS.md - RMS Project Guide & Documentation

This file serves as the living project guide for AI agents and human contributors working on the **RMS (Roommate Management System)** repository.

---

## 1. Project Overview & Tech Stack

RMS is a full-stack web application designed for shared living arrangements to manage rooms, roommates, shared expenses, debt settlements, and chores.

### Technology Stack
- **Backend:** Node.js, Express 5, MongoDB / Mongoose, JWT (Access + Refresh tokens), Gmail API via OAuth2, Bcryptjs, Nano-id.
- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router v7, Axios.
- **Design System:** Material Design 3 / Stitch aesthetic with token-based color variables.

---

## 2. Repository Structure

```text
RMS/
├── backend/
│   ├── app.js               # Express application entry point & middleware mounting
│   ├── config/              # API and service configurations
│   ├── controllers/         # Request handling & domain controllers
│   ├── db/                  # Mongoose connection helpers
│   ├── errors/              # Custom HTTP error classes (CustomAPI, BadRequest, NotFound, etc.)
│   ├── middlewares/         # Express middlewares (auth, room loader, error handler)
│   ├── models/              # Mongoose schemas (User, Room, Transaction, RefreshToken, Otp, Vco, Chore)
│   ├── routes/              # Express API route declarations
│   ├── services/            # Background & external services (Email)
│   └── utils/               # Helper utilities (cookies, OTP generator)
├── docs/                    # Technical specifications & feature breakdown
│   ├── BACKEND.md           # Backend documentation & endpoint schemas
│   ├── FEATURES.md          # Comprehensive feature inventory & completion status
│   ├── FRONTEND.md          # Frontend architecture guide
│   └── UI-UX.md             # Design tokens, typography, and component styling rules
├── specs/                   # Project constitution — mission, stack, and roadmap
│   ├── mission.md           # Vision, target audience, core principles, scope pillars
│   ├── tech-stack.md        # Current stack inventory and direction
│   └── roadmap.md           # Phased implementation order derived from improvements.md
├── frontend/
│   ├── index.html           # Single page application entry HTML
│   ├── vite.config.js       # Vite configuration
│   └── src/
│       ├── api/             # Axios instances and token store
│       ├── components/      # UI components (Auth, Layout, Loaders)
│       ├── context/         # React Contexts (AuthContext)
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Routed page components
│       └── routes/          # Protected and Guest route guards
├── improvements.md          # Comprehensive full-stack engineering review & remediation roadmap
└── README.md                # General project overview & setup instructions
```

---

## 3. Key Conventions & Best Practices

### Backend Conventions
1. **Error Handling:** Always throw subclasses of `CustomAPIError` (e.g., `BadRequestError`, `NotFoundError`, `UnauthenticatedError`, `ForbiddenError`). Express 5 automatically forwards rejected promises to the centralized `error-handler.js`.
2. **Database Integrity:** Use integer cents (or `Math.round(val * 100)`) for financial calculations to prevent floating point division remainder traps.
3. **Session & Security:**
   - Store access tokens in memory on the client; transmit refresh tokens in `httpOnly`, `secure`, `SameSite` cookies.
   - Use `crypto.randomInt` for OTP and verification code generation.
   - Always verify that the acting user is authorized (check `paidBy` for transactions and debt settlements; check `creator`/`admin` for room mutations).
4. **Validation:** Sanitize request inputs against MongoDB operator injection (`$gt`, `$ne`).

### Frontend Conventions
1. **Component Design:** Keep layout containers (`AppLayout.jsx`) separate from page views (`DashboardPage.jsx`).
2. **Lazy Loading:** All lazy-loaded components (`lazy(() => import(...))`) must be nested under a `<Suspense fallback={<PageLoader />}>` boundary.
3. **Responsive Design:** Every page must remain functional and accessible on mobile screen widths (<768px), either via a responsive drawer or bottom navigation bar.
4. **Token Management:** Always synchronize `tokenStore.set(token)` with `AuthContext` state. Never invoke `tokenStore` as a function.
5. **API Calls:** Use the shared `api` axios instance. Always use optional chaining on error responses: `error.response?.data?.msg || error.message`.

---

## 4. Active Architectural & Review Roadmap

For full details on prioritized fixes and architectural enhancements, refer to [improvements.md](./improvements.md).

### P0 Critical Priorities
- [x] Fix static `Date.now()` evaluation bug in `backend/models/Vco.js`.
- [x] Fix truthy string operator precedence bug in `backend/controllers/transaction.js:deleteTrans`.
- [x] Enforce creditor authorization (BOLA defense) in `backend/controllers/settleDebt.js`.
- [x] Wrap lazy-loaded routes in `<Suspense>` in `frontend/src/App.jsx`.
- [x] Fix `tokenStore.set(null)` in `frontend/src/api/axios.js`.
- [x] Remove `body` flex styling from `frontend/src/components/Auth/AuthPage.css`.

