# Architecture — the design system + the app built on it

This file is for whoever edits code in `frontend/`, human or agent. Read
[`README.md`](README.md) (the full index, §1–7) and [`DESIGN.md`](DESIGN.md)
(the identity at a glance, meant to ground an agent working in `app/`: the
product's own system first, the shared kit's below) — this file does not
restate either.

## The one split that matters

```
frontend/
  src/     the design system. Pure, portable, forkable into any project.
  app/     the real application: routing, views, data, connectors, permissions.
```

`src/` is not this app's UI — it is meant to drop into any project unmodified.
`app/` is exactly the opposite: this app's own product code, and the only
place it may live.

**`src/` has to stay pure, and nothing checks it for you.** A CI job used to fail
the build; this repo ships no CI, so the checks below are yours to run by hand.
The rule has not changed. `src/` is not pure if:
- a `src/views/` or `src/data/` folder reappears,
- anything in `src/` touches `window.location`,
- a component calls `useTranslation` with a namespace other than `ui`.

The job's own checks, from `frontend/`. Each one must print nothing:

```bash
find src -type d \( -name views -o -name data \)
grep -rn "window\.location" src --include=*.ts --include=*.tsx
grep -rlE "useTranslation\(['\"](builder|devops|consumer|designSystem)['\"]\)" src
```

None of those restrictions apply inside `app/` — that folder is exactly where
that kind of code belongs.

## Rules that don't fit in the catalogue

- **Every value comes from a token.** No hex codes, no ad-hoc easing or
  duration, no one-off shadow, no arbitrary radius. If a needed one does not
  exist, that is a gap to name in `colors_and_type.css` / `DESIGN.md`, not to
  invent at the call site.
- **Reach for an existing component before writing one.** The catalogue in
  `src/components/ui/` and `src/components/charts/` runs close to 90
  components — check `README.md` §4 before assuming something is missing.
- **Restyle through a token or a brand class, never at the call site.** That
  is what makes a token change propagate to every instance instead of one.
- **Do not run `npx shadcn add`.** New components are hand-ported to this
  system's pattern (Radix + CVA + brand class + `cn()`) instead.
- **`oxlint` is pinned to an exact version, not a caret range.** Its patch
  releases add *rules*, so a range turns a linter upgrade into an unannounced
  behaviour change. Raise the pin in the same change that brings the fixes the
  new rules ask for, never before.

  The pin sat at 1.78.0 for exactly that reason until 1.80.0's four React rules
  were answered. It is at 1.83.0 now, and this bullet is the procedure rather
  than that one episode.
- **A new token, status, or component lands here in the same change that
  needs it** — never only in `app/`. The rule is about the *shared kit*: a
  product page that carries a brand of its own (the Gordos Sistemas landing in
  `app/landing/`) keeps that theme in `app/`, scoped to its own root, instead of
  re-valuing the tokens ~90 kit components depend on.

## Verify

- `src/`: `npm run typecheck && npm run lint && npm run lint:css && npm test && npm run build`
- `app/`: `npm run build`, `npm run lint` and `npm test`, checked in **both
  light and dark** — dark-theme breakage is the most common regression in this
  system. `npm test` is the only one of the three that sees a blank page:
  `app/App.render.test.tsx` renders the app through `AppProviders`, the same
  tree `main.tsx` mounts, and fails if the first render throws.

## Running the preview on another port

The dev proxy sends `/api/*` to `127.0.0.1:$APP_HANDLER_PORT`, 8000 when unset
(`vite.config.ts`). Whoever starts the two processes sets it on both when 8000 is
taken; see `app/README.md`. It is never written into a file of this repo.
