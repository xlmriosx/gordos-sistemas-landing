# Session bar

A full-width strip at the top of the page, during a building session only. It holds the
things that are **not adjustments to the app**: what the app is called, and the controls for
the other session tools.

Right now that is the app's name and a toggle for the [pointer
toolbar](../pointer-toolbar/README.md). The three actions the session bar is planned to carry
— go to the portal, request a capability, share — are not here yet.

## Why this is not in `frontend/src/`

- It is tooling for the building session, not a block a developer's app is made of. It must
  never appear in the component catalogue or its exports.
- It is **not** the app's own top bar. An app that wants one builds it from `AppShell`.

## How it stays out of production

Two independent things, and neither is a promise:

1. `SessionBar.tsx` no-ops under `NODE_ENV=production`.
2. It is reachable only through
   [`frontend/app/DevToolbar.tsx`](../../frontend/app/DevToolbar.tsx)'s dev-only dynamic
   import, behind `import.meta.env.DEV`. That is a compile-time constant, so a production
   build never resolves anything in this folder. And the platform's Dockerfile copies only
   `frontend/` into its frontend stage, so a static import reintroduced anywhere fails the
   image build rather than shipping.

The app does not mount that module by default: the product page is the product page, and a
session bar drawn across it is not what ships. Mounting it again is one line in
[`frontend/app/App.tsx`](../../frontend/app/App.tsx) — and with it, in this app, nothing under
`tools/` is in the import graph at all.

The bundle grep for `app-session-bar` is what the contract asked for, and it catches a
route nobody anticipated. It used to run in CI (`frontend-ci.yml`); the template ships no CI
now, so it is a manual check — see [`../AGENTS.md`](../AGENTS.md).

## It pushes the page down, on purpose

The bar does not float over the app. It sets `--product-topbar-height` on the root element,
which the design system's `AppShell` and `PageHeader` already read, and it also sets padding
on `<body>` for an app that is not built on `AppShell` (the template's own scaffold is not).
Both are reverted on unmount.

**The cost, written down rather than discovered:** the viewport in a building session is
shorter than the one that ships. Any visual review done here sees less vertical space than a
real user will. That was accepted in exchange for never covering a control the developer needs.

The height is measured, not hardcoded: it depends on the brand font, which loads
asynchronously.

## How it talks to the pointer toolbar, without either importing the other

Two tools that import each other trip the package-boundary signal, and that is a
decision of its own. So they share no code at all — only this contract:

| Who | What |
|---|---|
| This bar | sets `data-app-session-bar` on the root element |
| Pointer toolbar | reads it, and renders **no** floating marker while a dock exists |
| Pointer toolbar | reflects `data-app-pointer-toolbar="open" \| "dismissed"` on the root |
| This bar | renders its toggle from that attribute, and renders **nothing** when it is absent |
| This bar | dispatches `app:pointer-toolbar:show` / `:hide` on `window` |

Every part degrades. With no session bar on the page, the pointer toolbar's own marker is the
way back, exactly as before — which is what an app cloned before this folder existed keeps
doing forever. With no pointer toolbar, this bar shows no control for it.

That table is the whole contract. Anything beyond it is a new decision.

## The name

Two names, not one:

- **The registry name** is generated when the app is created, is valid by construction, and
  never changes. Shown here, never editable here.
- **The friendly name** is free, and this is where the developer changes it.

`onAppNameChange` is optional. Without it the field is read-only, because an editable field
that silently fails to save is worse than no field.

**The change is cached, not persisted, and the difference matters.** The app that mounts this
bar keeps the name in `localStorage`
([`frontend/app/DevToolbar.tsx`](../../frontend/app/DevToolbar.tsx)), so the field does not
forget itself while somebody is using it.

**That is not where a name lives.** The requirement is that a name survive across machines and
across people — otherwise it is one person's private note, not the app's name — and
`localStorage` crosses neither. Where it really lives is an open decision between the
platform's own `display_name` record and a file committed to the repo; the platform's copy is
the truer one, because the panel and the deploy pipeline need the name too.

The bar shows `sin guardar` while the field is edited and not yet confirmed, which is exactly
what it means: typed, not committed.

## Mount

Once, at the app root, with both names as required props — this folder never hardcodes the
app's own words:

```tsx
<SessionBar appName={appName} registryName={registryName} onAppNameChange={setAppName} />
```
