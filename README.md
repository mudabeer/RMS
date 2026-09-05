# RMS

**RMS (Shared Living Management)** is an application that helps roommates and other shared-living groups manage the practical side of living together: rooms, room members, shared expenses, expense splitting, and who owes what to whom.

If you've ever had to manually track "who paid for groceries" and "who still owes rent" in a group chat, RMS is meant to replace that with a structured, shared record.

## Project Status

RMS is **in early development**. The backend already implements a working core API (authentication, rooms, room joining, members, expenses, and debt/payment tracking), but the frontend currently only covers the landing page and part of the registration flow — there is no dashboard, room, or expense UI yet. See [docs/FEATURES.md](./docs/FEATURES.md) for the full, verified breakdown of what's implemented, incomplete, or planned.

## Features

Verified against the current codebase:

- Email OTP-based registration, login, logout, and password reset (backend)
- Room creation, with support for a user belonging to multiple rooms
- Room joining via a room code + an email verification step
- Room members with roles (`creator`, `admin`, `member`)
- Shared expenses/transactions with title, amount, category, and payer
- Expense splitting: split evenly across the whole room, or across a custom, user-chosen subset of members (splits are always even — see [docs/FEATURES.md](./docs/FEATURES.md#expense-splitting-by-member-selection-custom-split))
- Debt tracking with support for partial payments and an automatic `Paid` status

**Not yet implemented:** a working login screen, a dashboard, and any UI for rooms/expenses/debts on the frontend; per-member custom dollar amounts within a split; chore management (this appears only as marketing copy on the landing page — see [docs/FEATURES.md](./docs/FEATURES.md#planned)).

## Tech Stack

**Backend**
- Node.js + [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- JWT-based authentication ([jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)) with access + refresh tokens
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) for password/OTP hashing
- [nodemailer](https://www.npmjs.com/package/nodemailer) for transactional email (OTPs, join codes, password reset)

**Frontend**
- [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- [react-router-dom](https://reactrouter.com/) for routing
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [axios](https://axios-http.com/) for API requests

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mudabeer/RMS.git
cd RMS
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `backend/.env` file (there's no `.env.example` committed yet) with:

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

> `JWT_REHRESH_SECRET` is spelled that way in the actual code — see [docs/BACKEND.md](./docs/BACKEND.md#environment-variables) for details.

### 3. Start the backend

```bash
node app.js
```

(The `npm start` script runs `nodemon`, which isn't currently listed as a dependency — either install it yourself or run `node app.js` directly. See [docs/BACKEND.md](./docs/BACKEND.md#running-the-backend).)

### 4. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server (by default at `http://localhost:5173`), which matches the CORS origin configured in `backend/app.js`.

## Project Structure

```text
RMS/
├── backend/     # Express + MongoDB API
├── frontend/    # React + Vite app
├── docs/        # Developer documentation
├── README.md
└── CONTRIBUTING.md
```

## Documentation

- [docs/FEATURES.md](./docs/FEATURES.md) — what's implemented, incomplete, and planned
- [docs/BACKEND.md](./docs/BACKEND.md) — backend architecture, models, API routes, environment variables
- [docs/FRONTEND.md](./docs/FRONTEND.md) — frontend structure, pages, components, styling
- [docs/UI-UX.md](./docs/UI-UX.md) — the Stitch-based design/contribution workflow
- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute

## Contributing

Contributions are welcome, whether that's frontend/backend code, UI/UX design, documentation, or bug reports. Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on setup, branching, and pull requests.

## License

This project currently has **no license file**. Until one is added, all rights are reserved by the project owner, and no usage/distribution permissions are implied.