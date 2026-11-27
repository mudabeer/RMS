# Tech Stack

## Current Stack

### Backend

| Layer | Technology | Version / Notes |
|---|---|---|
| Runtime | Node.js | LTS |
| Framework | Express | 5 |
| Database | MongoDB | via Mongoose ODM |
| Auth | JWT (jsonwebtoken) | Access token (15 min) + Refresh token (7 days) |
| Password hashing | bcryptjs | Salt rounds: 10 |
| Email | Gmail API (`googleapis`) | OAuth2 refresh token; `gmail.send` scope |
| ID generation | nano-id | Room codes, verification codes |
| Cookies | cookie-parser | httpOnly refresh token cookies |
| CORS | cors | Currently hardcoded to `localhost:5173` |

### Frontend

| Layer | Technology | Version / Notes |
|---|---|---|
| UI Library | React | 19 |
| Build tool | Vite | With `@tailwindcss/vite` plugin |
| Routing | react-router-dom | v7 (BrowserRouter + `<Routes>`) |
| Styling | Tailwind CSS | 4 — token-based `@theme` block in `index.css` |
| HTTP client | Axios | Shared instance with interceptors in `src/api/` |
| State | React Context | AuthContext only; local `useState` elsewhere |

### Design System

- **Foundation:** Material Design 3 / Stitch aesthetic.
- **Tokens:** Color, spacing, and font variables defined in `frontend/src/index.css` via Tailwind's `@theme`.
- **Design source:** [Stitch project](https://stitch.withgoogle.com/projects/1538833081237994876).

## Stack Direction

The current stack is **intentionally stable** — no major additions or migrations are planned. The focus is on building features with the existing tools, not introducing new ones.

### What stays

- Node / Express / MongoDB on the backend — simple, well-understood, matches the team's skills.
- React / Vite / Tailwind on the frontend — fast iteration, modern DX, no build complexity.
- JWT access + refresh tokens — the auth flow is being hardened (see roadmap), not replaced.

### What may be added incrementally

These are **not committed**, but are natural next steps as the product matures:

| Addition | When it makes sense | Current status |
|---|---|---|
| `express-rate-limit` | Immediately — required to protect auth/email endpoints | In improvements.md (P1) |
| `helmet` | Immediately — standard security headers | In improvements.md (P2) |
| Vitest + Supertest | After P0/P1 bug fixes stabilize the core | In improvements.md (P3) |
| `@testing-library/react` | Alongside backend test setup | In improvements.md (P3) |
| Socket.io / SSE | Only if real-time notifications become a user need | Not planned yet |
| TypeScript | Only if the codebase grows large enough to need it | Not planned |
| PWA / React Native | Only if mobile-app distribution becomes essential | Not planned |

> [!IMPORTANT]
> Any new dependency must justify itself against the principle of **minimal overhead**. If it adds complexity without solving a user-facing problem, it doesn't go in.

## Infrastructure

| Concern | Current state | Target |
|---|---|---|
| Hosting | None (local dev only) | TBD |
| CI/CD | None | GitHub Actions (`lint` → `test` → `build`) |
| Monitoring | None | TBD |
| Env management | Manual `.env` files, no `.env.example` committed | Add `.env.example` for backend and frontend |

