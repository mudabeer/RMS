# Frontend Documentation

This document explains how the `frontend/` app is put together, for anyone who wants to contribute to it.

## Frontend Overview

- **Framework:** [React 19](https://react.dev/)
- **Build tool:** [Vite](https://vitejs.dev/)
- **Routing:** [react-router-dom](https://reactrouter.com/) v7 (`BrowserRouter` + `<Routes>`)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) via the `@tailwindcss/vite` plugin, plus a handful of custom CSS files per component
- **API communication:** [axios](https://axios-http.com/), called directly inside page components (no shared API client yet)
- **State management:** none yet — only local `useState` inside individual components; there's no global store or auth context

## Frontend Structure

```text
frontend/
├── index.html
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx               # React root, wraps App in BrowserRouter
    ├── App.jsx                # Top-level route definitions
    ├── index.css               # Tailwind import + design tokens (colors, spacing, fonts)
    ├── style.css               # Present in the repo but not currently imported anywhere
    ├── assets/
    │   ├── rms_logo.png        # Not currently referenced in any component
    │   └── screen.png          # A stock/marketing image, not a real app screenshot; not currently referenced in any component
    ├── hooks/
    │   └── useScrollAnimation.js
    ├── components/
    │   └── Auth/                # Shared layout used by auth-style pages (branding + card)
    │       ├── AuthPage.jsx
    │       ├── AuthCard.jsx
    │       └── BrandlingHeadline.jsx
    └── pages/
        ├── LandingPage/         # Marketing landing page
        ├── SendOtpPage/         # Step 1 of registration: request an OTP
        ├── registrationPage/    # Step 2 of registration: fill in details + OTP
        └── LoginPage/           # Present, but currently an empty file
```

## Pages

| Path | Component | What it does |
|---|---|---|
| `/` | `LandingPage` (`src/pages/LandingPage/LandingPage.jsx`) | Marketing page: hero section, features section, "how it works" section, header/footer |
| `/register` | `RegistrationPage` (`src/pages/registrationPage/RegistrationPage.jsx`) | Renders `RegistrationForm` inside the shared `AuthPage` layout; collects name/email/password + the OTP and calls `POST /api/v1/auth/register` |
| `/sendotp` | `SendOtpPage` (`src/pages/SendOtpPage/SendOtpPage.jsx`) | Collects an email and calls `POST /api/v1/auth/send-code`, then navigates to `/register` |

These three routes are the entirety of what's registered in `frontend/src/App.jsx` today. There is no `/login`, `/dashboard`, room, or transaction page/route yet, even though some code already references `/dashboard` (see [Known Frontend Limitations](#known-frontend-limitations)).

## Components

- **`components/Auth/AuthPage.jsx`** — a two-column layout (branding text on one side, a card with a title/description/children on the other) shared by auth-style pages. Currently only used by `RegistrationPage`.
- **`components/Auth/AuthCard.jsx`** — the card wrapper rendered inside `AuthPage`.
- **`components/Auth/BrandlingHeadline.jsx`** — the branding/marketing text block rendered inside `AuthPage`.
- **`pages/LandingPage/*`** — `HeroSection`, `FeaturesSection` (+ `FeatureCard`), `HowItWorksSection` (+ `Steps`), `LandingHeader`, `LandingFooter`, `ShaderBackground` (a decorative animated background).

## API Integration

There is no dedicated API service/helper file yet — `axios` is imported and called directly inside the two pages that talk to the backend:

- `frontend/src/pages/SendOtpPage/SendOtpPage.jsx` → `POST http://localhost:3000/api/v1/auth/send-code`
- `frontend/src/pages/registrationPage/RegistrationForm.jsx` → `POST http://localhost:3000/api/v1/auth/register`

The backend URL is hardcoded in each file rather than read from a shared config or environment variable. Error handling reads `error.response.data.msg` from the backend's standard error shape (`backend/meddlewares/error-handler.js`) and displays it inline.

## Authentication Flow

On the frontend today, "authentication" only covers the first half of registration:

1. `SendOtpPage` collects an email and requests an OTP.
2. `RegistrationForm` collects name/email/password/OTP and submits registration.
3. On success, it calls `navigate('/dashboard')` — but no `/dashboard` route exists yet, so this will currently just render nothing/404 within the router.

There is no login screen, no stored session/token handling, and no logout button anywhere in the frontend yet, even though the backend already supports login/logout/refresh (see [BACKEND.md](./BACKEND.md#authentication)).

## Styling

- Tailwind CSS is configured via the `@tailwindcss/vite` plugin in `frontend/vite.config.js` — there's no separate `tailwind.config.js`; Tailwind v4's `@theme` block in `frontend/src/index.css` defines custom design tokens (colors, spacing, font families) used throughout the app as utility classes (e.g. `bg-primary`, `text-on-surface`, `p-lg`).
- A few components have their own small `.css` files alongside them (e.g. `AuthCard.css`, `AuthPage.css`, `LandingPage.css`, `SendOtpPage.css`) for styles that aren't easily expressed as Tailwind utilities.
- `frontend/src/style.css` exists in the repo but isn't imported anywhere currently.

## Adding a New Feature

A typical flow for adding a new page/feature to the frontend:

```text
Create page/component (frontend/src/pages/...)
        ↓
Register the route in App.jsx
        ↓
Create the API call (axios) for the backend endpoint it needs
        ↓
Connect it to the corresponding backend route
        ↓
Test it manually against a running backend
        ↓
Open a PR
```

Since there's no shared API client yet, consider creating one (e.g. `frontend/src/api/`) as part of any larger feature work, rather than repeating hardcoded URLs.

## Known Frontend Limitations

- **`LoginPage.jsx` is empty.** The file and folder exist (`frontend/src/pages/LoginPage/LoginPage.jsx`), but there is no component, form, or logic in it, and it isn't even registered in `App.jsx`.
- **No `/dashboard` route**, despite `RegistrationForm.jsx` navigating there on success.
- **No UI at all yet** for rooms, joining a room, members, transactions/expenses, splitting, or debts/payments — even though the backend supports all of this. See [FEATURES.md](./FEATURES.md).
- **Inconsistent import casing.** A few imports don't match the actual file name casing on disk, for example:
  - `import AuhtPage from "../../components/Auth/Authpage"` in `RegistrationPage.jsx` vs. the actual file `AuthPage.jsx`
  - `import HowItWorksSection from "./HowitWorksSection"` in `LandingPage.jsx` vs. the actual file `HowItWorksSection.jsx`
  - `import Steps from "./steps"` in `HowItWorksSection.jsx` vs. the actual file `Steps.jsx`

  These currently work on case-insensitive filesystems (Windows, macOS) but will fail to resolve on case-sensitive filesystems (Linux — including most CI pipelines and hosting providers). These should be fixed to match the exact file names.
- **No shared API client/config** — the backend base URL is duplicated as a hardcoded string in each page that calls it.
- **No global auth/session state** — there's no context, store, or persisted session; each page manages its own local state.
- **Unused assets** — `frontend/src/assets/rms_logo.png`, `frontend/src/assets/screen.png`, and `frontend/src/style.css` exist in the repo but aren't referenced by any component yet.
