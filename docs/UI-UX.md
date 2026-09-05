# UI/UX Contribution Guide

RMS uses **Stitch** as the source of design references for the interface, and GitHub for discussing, tracking, and implementing those designs. This document explains how design and code work together, and how you can contribute even if you don't write React.

## Design Source

```text
Stitch Project:
https://stitch.withgoogle.com/projects/1538833081237994876
```



## UI/UX Workflow

```text
Stitch Design
      ↓
GitHub Issue
      ↓
Discussion / Feedback
      ↓
Approved Design
      ↓
Frontend Implementation
      ↓
Pull Request
      ↓
Review
```

Stitch is where a design idea takes visual shape — mockups, layouts, flows. GitHub is where that idea gets discussed, refined, approved, and eventually turned into a tracked, reviewable change. The actual implementation always lives in the frontend code, following whatever the approved design showed.

## How Designers Can Contribute

You don't need to know React (or any code) to contribute UI/UX ideas to RMS. You can:

- Identify a UI problem — something confusing, inconsistent, or missing in the current interface.
- Propose a design direction for it.
- Create a design in Stitch.
- Attach screenshots or mockups to a GitHub issue.
- Explain your reasoning — what problem this solves and why this approach.
- Participate in the discussion on the issue as it's reviewed.

## How Developers Implement Designs

When picking up a UI/UX issue:

1. Refer to the linked Stitch design for the intended look and behavior.
2. Create or update the relevant frontend component(s) (see [FRONTEND.md](./FRONTEND.md) for where things live).
3. Implement responsive behavior so it works well on both mobile and desktop widths.
4. Test the UI manually against the design before opening a PR.
5. Include before/after screenshots in the PR.
6. Link the GitHub issue you're resolving (e.g. `Closes #12`).

## UI/UX Issue Example

A title like:

```text
[UI/UX] Improve Room Card
```

A good UI/UX issue should include:

- **Problem** — what's wrong or missing today.
- **Proposed solution** — what should change.
- **Screenshot/mockup** — a visual of the current state and/or the proposed one.
- **Stitch reference** — a link to the relevant Stitch design, if one exists.
- **Reason for the change** — why this improves the experience.

## Design vs Implementation

To keep things clear:

- **Stitch** holds the design itself — the visual reference for what something should look like.
- **GitHub** holds the discussion and history — why a design was proposed, how it was debated, and what was decided.
- **The code** holds the actual implementation — what users experience in the running app, which should match the approved design.
