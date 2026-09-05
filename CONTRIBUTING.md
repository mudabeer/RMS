# Contributing to RMS

Thanks for considering contributing to RMS! This guide is written for contributors who are new to the project.

## Welcome

There's room to help in several areas:

- Frontend (React/Vite)
- Backend (Express/MongoDB)
- UI/UX design
- Documentation
- Bug fixes
- Testing (there currently isn't any automated test suite — this is a great place to start!)
- New feature development

## Before You Start

1. Read [README.md](./README.md) for a project overview.
2. Read [docs/FEATURES.md](./docs/FEATURES.md) to understand what's actually implemented, incomplete, or planned.
3. Read [docs/BACKEND.md](./docs/BACKEND.md) and/or [docs/FRONTEND.md](./docs/FRONTEND.md) for the part of the codebase you're touching.
4. Check existing GitHub Issues before starting work, so you don't duplicate someone else's effort.

## Development Setup

Setup instructions live in the [README's Getting Started section](./README.md#getting-started) — follow those rather than duplicating them here.

## Branching

Please avoid committing directly to `main`. Use a descriptive branch name:

```text
feature/<name>
fix/<name>
ui/<name>
docs/<name>
refactor/<name>
```

For example: `fix/transaction-delete-check`, `feature/room-invite-link`, `docs/backend-api-table`.

## Issues

Use GitHub Issues to:

- Report a bug — include steps to reproduce and what you expected instead.
- Propose a feature — describe the problem it solves.
- Propose a UI/UX change — see [docs/UI-UX.md](./docs/UI-UX.md).
- Ask a question about the project.

Suggested labels for triage (use whichever already exist in the repo, and feel free to suggest adding ones that don't):

```text
bug
feature
frontend
backend
ui/ux
documentation
good first issue
help wanted
```

## Frontend Contributions

- Prefer reusable components over one-off duplicated markup.
- Keep styling consistent with the existing Tailwind design tokens in `frontend/src/index.css`.
- Make sure new UI is responsive (mobile and desktop).
- Avoid unnecessary duplication of components or logic.
- Manually test your feature against a running backend before opening a PR.
- Double-check that any new import paths match the actual file names exactly (see the casing issues noted in [docs/FRONTEND.md](./docs/FRONTEND.md#known-frontend-limitations) — these currently work locally but can break the build elsewhere).

## Backend Contributions

- Follow the existing request flow: route → middleware → controller → model (see [docs/BACKEND.md](./docs/BACKEND.md#architecture)).
- Validate incoming input in controllers, and use the existing custom error classes (`backend/errors/`) rather than throwing raw errors.
- Protect any new route that needs a logged-in user with the `auth` middleware, and reuse `loadRoom` / `requireRoomMember` / `requireCreator` / `loadTransaction` where they apply.
- Never expose secrets (API keys, DB credentials, JWT secrets) in code, logs, or commit messages.
- Keep controllers, models, and routes organized the way the existing folders are structured.

## UI/UX Contributions

See [docs/UI-UX.md](./docs/UI-UX.md) for the full design workflow (Stitch → GitHub issue → implementation).

## Documentation Contributions

Documentation improvements are always welcome, including:

- Fixing or clarifying the README
- Expanding [docs/BACKEND.md](./docs/BACKEND.md) or [docs/FRONTEND.md](./docs/FRONTEND.md)
- Keeping [docs/FEATURES.md](./docs/FEATURES.md) accurate as features move from Planned → Incomplete → Implemented
- Adding API documentation/examples

## Commit Messages

A simple, readable convention is recommended (this isn't currently enforced by tooling in the repo, but it keeps history easy to follow):

```text
feat: add room member endpoint
fix: correct debt calculation
ui: improve room card
docs: update backend setup
refactor: simplify transaction controller
```

## Pull Requests

A good PR includes:

- A clear title
- A description of what changed and why
- A link to the related issue (e.g. `Closes #12`)
- How you tested the change
- Screenshots, for any UI change
- Any known limitations or follow-up work

## Code Review

This project is under active development, so please expect (and give) constructive feedback rather than just rubber-stamp approvals. PRs should be reviewed before merging.

## Security

- Never commit `.env` files.
- Never commit passwords, API keys, or database credentials.
- Never expose JWT secrets or other credentials in code, comments, or logs.
