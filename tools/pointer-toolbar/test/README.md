# Executable checks for the toolbar component

```
npm ci && npm test
```

Its own npm package, with its own `package-lock.json`, installed in this folder
and nowhere else; the app's install in `frontend/` does not set it up. esbuild
needs nothing special from the install: its binary comes from the platform
package npm picks from its `optionalDependencies`. Its postinstall only verifies
that binary (it downloads one only when the optional package is missing). npm 10
runs it; npm 11 may block it and say so with an `allow-scripts` notice, and the
suite passes either way, because the binary is already there.

Sits beside the component it tests — `../Toolbar.tsx` and friends — rather than
copying it. This suite is dev tooling for the template; nothing here is copied
into a developer's app.

## Why this exists

Every bug this component has had was a lifecycle bug, and every one of them was
found by a person noticing something odd on screen:

- it mounted and destroyed itself in the same tick under StrictMode, so the bar
  flashed and vanished;
- cancelling that self-destruct left the surviving effect owning nothing, so a real
  unmount left the host in `document.body` swallowing the app's events;
- removing that orphaned host detached its five listeners but not the ones its React
  tree had put on `window`, so every hot reload added another invisible copy handling
  pointer events;
- making the collapsed nub draggable let it sit where the expanded bar does not fit,
  so revealing it pushed most of the bar off-screen.

None of those are visible in a diff, and each was argued about in review — twice,
in one case, against a commit that had already been fixed. Reading is not a good
instrument for this class of bug. Running is.

## What each file is for

| File | What it drives |
|---|---|
| `build.mjs` | Bundles the **real** `../Toolbar.tsx` with esbuild. Never a copy — tests that pass against a rewritten component are worse than none. |
| `env.cjs` | jsdom, plus the three things jsdom lacks that this component depends on: layout (`getBoundingClientRect` is all zeros there — and the bar's width has to grow with its badge, or the quiet clamp bug is invisible), hit testing (`document.elementsFromPoint` does not exist, and the Picker throws on the first click without it), and a census of `window` listeners, which is what turns "the tree leaked" into a number. |
| `lifecycle.cjs` | StrictMode double-invoke, hot-reload replacement (including that the orphan warning fires once *per* reload), the clamp across the collapse boundary, and teardown. |
| `hot-reload-order.cjs` | The real hot-reload ordering — new module mounts *first*, old tree unmounts after — where two module instances both believe they own the same root. |
| `behaviour.cjs` | Product behaviour: two mounted bars must warn; the instruction must retire but never in front of a reader; and annotating end to end must not push a right-edge bar off-screen when the badge widens it. |
| `run-all.mjs` | Builds the bundles and runs each scenario in its own process. |

Bundles of one source at distinct paths are how a scenario holds several independent
module instances at once — fresh module scope, same DOM underneath, which is what a
Fast Refresh swap looks like from the component's side.

Each scenario gets its own process on purpose. The component keeps deliberate
module-scope state and writes `sessionStorage`; sharing a process would let scenarios
contaminate each other and point the blame at the wrong place.

## Adding to it

The bar for a new scenario is that it **fails against the commit that had the bug**.
If you cannot produce a version it fails against, you have written a description of
the current behaviour rather than a test of the intended one.

`prefers-reduced-motion`, `color-mix()` fallbacks and anything else about how it
looks are out of scope here: jsdom does not do layout or cascade.
