# Pointer toolbar

Dev-only annotation bar: point at something on screen, write what should change,
copy the note into the conversation with the agent. Nothing is sent anywhere —
the clipboard is the only exit.

This is **not** part of the design system in [`../../frontend/src/`](../../frontend/src/).
It lives here, outside `src/`, on purpose:

- It is tooling for the app-building session, not a block a developer's app is made
  of — it must never show up in the component catalog.
- It changes independently of the design system and is expected to keep growing.
- It must never reach a production bundle, and two independent things keep it
  out. [`Toolbar.tsx`](Toolbar.tsx) no-ops under `NODE_ENV=production`, and
  [`frontend/app/DevToolbar.tsx`](../../frontend/app/DevToolbar.tsx) reaches this
  folder only through a dynamic import behind `import.meta.env.DEV`, so a
  production build resolves nothing here. The platform's Dockerfile copies only
  `frontend/` into its frontend stage, which makes a reintroduced static import an
  image-build failure rather than a silent regression. The grep of the built
  bundle for `app-pointer-toolbar` is the check the contract actually asked
  for; it ran in CI (`frontend-ci.yml`) until the template shipped no workflows,
  and it is a manual check now — see [`../AGENTS.md`](../AGENTS.md).

[`../../frontend/app/DevToolbar.tsx`](../../frontend/app/DevToolbar.tsx) imports
`Toolbar.tsx` by relative path, behind that dev-only dynamic import. **The app
does not mount it by default**: the product page is the product page, and a
developer's annotation bar drawn across it is not what ships. Mounting it again
is one line in [`../../frontend/app/App.tsx`](../../frontend/app/App.tsx). There
is no build step, package, or install recipe that copies these files anywhere —
this is the one and only copy.

The bar speaks Spanish or English by `VITE_DEV_TOOLS_LANGUAGE` (see
[`../AGENTS.md`](../AGENTS.md)). Whatever it says, the copied JSON the agent's
`pointer-toolbar` skill parses is the same in both: only the confirmation toast
is translated, never the payload's keys or values.

See [`test/README.md`](test/README.md) for the executable checks, and
`Toolbar.tsx`'s own header comment for the mount contract and for what
actually keeps it out of production.
