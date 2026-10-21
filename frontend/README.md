# Design System

A kit of building blocks for assembling product UIs: tokens, primitives, and
composite patterns, meant to be copied into other projects as a starting point. Every
piece is driven entirely by props, so it snaps into whatever routing, state, and data
layer the host project already has.

This package was extracted from a product codebase (see git history before this
branch's flatten commit if you need the original product context) and stripped down
to the reusable layer. It will not be merged back — treat it as a base to fork.

**Which copy is this, and how old.** `package.json` carries a `designSystem` block
next to `version`: where this copy was taken from, the exact sha, and the date. This
copy is the **consuming** end of a three-stage route — the kit grows in the product
tree, is canonized on the design-system repository's `agnostic-ui` branch, and lands here when
something stabilizes. The copies are meant to differ, so the point of the stamp is to
make that distance readable instead of a 190-file diff. **`version` bumps on the commit
that promotes**, so a template sitting behind the canonical copy is the system working,
not a problem.

What follows from that: **nothing under `src/` is authored here.** A token or a
component invented in this copy works locally and is lost at the next promotion. It
goes upstream first — see §7 and [`AGENTS.md`](AGENTS.md).

Settled choices and what they cost live in `DECISIONS.md` in the canonical copy — read
it before reusing a token that looks reusable or picking a `z-index`. The values
themselves, and the rules an agent building screens has to follow, are in
[`DESIGN.md`](DESIGN.md).

No component gallery ships with this copy: the components are seen where they are
used — in the app below — and light and dark share the same tokens as the CSS.

The real application — routing, views, data, connectors, permissions — lives in
[`app/`](app/README.md), a sibling to `src/` that consumes these components the way an
external project would. `src/` stays business-logic-free (see §7 and the checks in
[`AGENTS.md`](AGENTS.md)); `app/` is not covered by that rule and is exactly where
product code belongs.

---

## 1. Structure

```
src/
  components/
    ui/                one component (or tightly-related family) per file, flat
    charts/             Recharts-based chart kit, token-driven palette
    ThemeToggle.tsx      light/dark switch over lib/theme.ts
    LanguageToggle.tsx   EN/ES switch over src/i18n
  lib/
    utils.ts             cn() — clsx + tailwind-merge
    theme.ts              useTheme/applyTheme/readStoredTheme (localStorage)
  i18n/                  react-i18next setup, one namespace: `ui`
    locales/{en,es}/ui.json
  styles/
    colors_and_type.css   tokens: color, type, spacing, radius, motion — single source of truth
    primitives.css         CSS for the original primitives
    layout.css              CSS for the AppShell/PageHeader/DataTable/LoginPanel composites (app-kit.tsx)
    ds-components.css       CSS for the ported shadcn-style set
    charts.css               chart-specific CSS
```

No router, no state-management library, no `data/` or `views/` folder, no path
aliases — every import is relative. (`tsconfig.json` does carry `paths`, but only to
point `react` and `react-dom` at this package's own types for the dev toolbar under
`../tools/`; no import of this package's code goes through them.) There's no monorepo
tooling; this is a single npm package with its own `package.json` and
`package-lock.json`.

---

## 2. Architecture

**TypeScript strict** end to end — no `.js` under `src/`. All code (file names,
identifiers, comments) is in English; user-facing copy goes through `react-i18next`
(§6) or arrives as a prop — never hardcoded narrative.

Two layers, most abstract to most concrete:

1. **Tokens** — CSS custom properties (color, type, spacing, radius, motion). Single
   source of truth: [`src/styles/colors_and_type.css`](src/styles/colors_and_type.css).
2. **Component library** — React components in [`src/components/ui/`](src/components/ui/)
   and [`src/components/charts/`](src/components/charts/). Interactive behavior comes
   from Radix primitives (or a focused headless lib); the **look is applied entirely
   through brand CSS classes**, never utility-class spam. Composite patterns
   (`app-kit.tsx`, `wizard-stepper.tsx`, `grouped-scope-picker.tsx`, …) sit on top,
   built from the same primitives.

### Styling model

Every component follows the same pattern:

```
Radix primitive  +  CVA variants (where needed)  +  brand CSS class  +  cn() for overrides
```

- Components attach brand classes (`.btn`, `.card`, `.checkbox`, `.tabs-*`…) rather
  than inline Tailwind utilities, so **tweaking a token or a class restyles every
  instance.**
- `cn()` ([`src/lib/utils.ts`](src/lib/utils.ts)) merges classes (clsx +
  tailwind-merge); brand classes pass through untouched.
- CSS for the ported shadcn set lives in `ds-components.css`; the original primitives
  in `primitives.css`; the `app-kit.tsx` composites in `layout.css`; charts in
  `charts.css`. Import order (`src/index.css`): `colors_and_type.css` →
  `primitives.css` → `layout.css` → `ds-components.css` → `charts.css`.
- We deliberately do **not** run `npx shadcn add`. Upstream components ship
  utility-heavy markup that would look off-brand — each component is hand-ported to
  the pattern above instead.

---

## 3. Tokens

Defined in [`colors_and_type.css`](src/styles/colors_and_type.css).

| Group | Examples |
|---|---|
| Color | `--carbon-black`, `--off-white`, `--sage-*`, `--dusty-mauve*`, `--ice-blue`, `--lavender` |
| Semantic (status) | `--status-ok/warning/critical/info` + `-bg` |
| Surfaces | `--surface-raised/muted/canvas/inset/2` — role tokens, not raw whites |
| Data viz | `--chart-1…6`, `--chart-seq-*`, `--chart-div-*` (see §5) |
| Identity accents | `--identity-1…6` — six colors that tell N things of the *same kind* apart |
| Z-index | `--z-base/raised/docked/nav/sidebar/sticky/affordance/scrim/modal/popover/tooltip/toast/skip-link` |
| Spacing (8pt) | `--space-1…10` |
| Radius | `--radius-xs/sm/md/lg/pill` |
| Motion | `--ease-out`, `--dur-fast/DEFAULT/slow` |

Every group above is also exposed as Tailwind utilities through
[`tailwind.preset.js`](tailwind.preset.js) — `bg-identity-3`, `z-modal`,
`text-app-body`. The CSS variables and the preset are the same tokens through two
doors; add to both or the doors disagree.

Dark theme applies via `data-theme="dark"` on `<html>`; neutrals invert by role.
`src/lib/theme.ts` exports `useTheme`/`applyTheme`/`readStoredTheme`, persisting to
`localStorage` (`app-theme`) — see `ThemeToggle.tsx` for the UI.

Typography: two font families — **Sentient** (display, weight 300) for headings and
**Geist** (body/UI) / **Geist Mono** (labels, tags, numerals) for everything else.
Headings and titles use Sentient whenever possible; Geist stays for body copy, form
labels, table text, dense UI chrome.

`AppShell`/`PageHeader` (and friends in `app-kit.tsx`) read three layout custom
properties with standalone-safe defaults set in `layout.css`:
`--product-topbar-height` (default `0px`), `--content-max` (`1200px`), `--content-pad`
(`var(--space-6)`) — override them at your host app's root if you nest these under an
app-owned topbar.

---

## 4. Component library

All under [`src/components/ui/`](src/components/ui/), one file (or tightly-related
family) per component. Import per file, e.g.
`import { Checkbox } from './components/ui/checkbox'`.

- **Primitives** — [`primitives.tsx`](src/components/ui/primitives.tsx): `Field`,
  `Input`, `Textarea`, `Card`, `Tag`, `Pill`, `Alert`, `EmptyState`, `Skeleton`,
  `LinkArrow`, plus re-exports of `Button`/`IconButton`, `Badge`, `Select`,
  `Modal`/`Dialog…`, `ScrollToTop`, `FloatingToolbar`, `Sheet…`.
- **Forms & selection** — `checkbox`, `radio-group`, `switch`, `slider`, `label`,
  `select`, `combobox` (cmdk + Popover), `input-otp`, `form` (react-hook-form
  wrapper), `input-group`, `field` (the `FieldSet`/`FieldLegend`/`FieldGroup`
  composition — **two `Field`s exist on purpose**: `primitives.Field` is the
  shorthand with `label`/`error` props; `field.tsx`'s `Field` is for horizontal or
  grouped layouts where you wire `htmlFor` yourself).
- **Disclosure & navigation** — `tabs`, `accordion`, `collapsible`, `toggle`,
  `toggle-group`, `breadcrumb`, `pagination`, `menubar`, `navigation-menu`, `command`.
- **Overlays** — `dialog`, `alert-dialog`, `popover`, `hover-card`, `tooltip`,
  `dropdown-menu`, `context-menu`, `sheet`, `drawer` (vaul bottom sheet).
- **Feedback** — `toast` (Radix), `sonner` (stacked toaster), `progress`, `alert`,
  `skeleton`, `spinner`, `empty`.
- **Data & media** — `table`, `avatar`, `separator`, `scroll-area`, `aspect-ratio`,
  `calendar`, `date-picker`, `item` (generic content row), `kbd`.
- **Conversation** — `bubble`, `message`, `marker`, `attachment`, `message-scroller`
  (provider + viewport + hooks; compose with `InputGroup` as the composer — it is not
  part of the component).
- **Layout** — `resizable`, `carousel`.
- **Actions** — `button`, `icon-button`, `button-group` (independent actions in one
  frame — for a single choice use `toggle-group` instead).
- **App kit** — [`app-kit.tsx`](src/components/ui/app-kit.tsx): `AppShell`,
  `PageHeader`, `PageContent`, `PageToolbar`, `PageToolbarSearch`, `PageFilterPanel`,
  `PageBackLink`, `PageBreadcrumbTrail`, `DataTable`, `TableEntity`, `StatCard`,
  `AlertRow`, `Toast`, `LoginPanel`.
  `LoginPanel` takes every string as a required prop (`title`, `intro`,
  `continueLabel`, `redirectingLabel`, …) — it carries no narrative of its own.
- **Extracted patterns** — `callout`, `stat-grid`, `copy-field`, `confirm-dialog`,
  `app-card`, `multi-select`, `choice-cards`, `wizard-stepper`, `key-value-list`,
  `file-drop`, `url-input`, `distribution-field`, `permission-gate` (a generic
  required-permissions checklist before entering a resource), `grouped-scope-picker`
  (two-level grant picker: `ScopeGroup` → its `ScopeItem[]`, deliberately blind to any
  data source — it takes both levels already resolved).

### Charts — [`components/charts/`](src/components/charts/)

`LineChartCard`, `AreaChartCard`, `BarChartCard`, `DonutChartCard`, `Heatmap`,
`Sparkline`, `TrendStat`, `Meter`, plus the shared `ChartFrame`/`ChartTooltipContent`.
Recharts renders the geometry; every color, type step and hairline comes from the
token layer. Import from the barrel: `import { LineChartCard } from './components/charts'`.

**Read this before adding a series color.** Every slot is a literal brand token —
`--chart-1…6` map to `--ice-blue`, `--mauve-deep`, `--lavender`, `--sage-gray`,
`--dusty-mauve`, `--sage-deep` in that order. Slots are fixed, never cycled; a 7th
series folds into "Other" or becomes small multiples. Separation holds cleanly to
three series — beyond that, `warnOnSeriesCount()` logs a dev warning so crossing the
line is a deliberate choice, not an accident. Rules the kit enforces:

- **One axis.** No dual-axis charts.
- **A table twin on every card** (the chart/table switch in `ChartFrame`) — the
  accessible-contrast equivalent, since some pastel slots sit below 3:1 on white.
- **Legend for 2+ series, never for one** (the title already names it).
- **Status colors are for status** (`color: 'ok' | 'warning' | 'critical'`) — never as
  a generic "series 5".
- **Marks:** 2px lines (3px where a color falls below 3:1 on the surface —
  `markWeight()`), bars capped at 24px, 8px markers with a 2px surface ring, area
  washes at 12%. Every chart honors `prefers-reduced-motion`.

---

## 5. Conventions

- **Restyle globally:** change a token in `colors_and_type.css` or a class in
  `ds-components.css` / `primitives.css` / `layout.css`. Every instance updates.
- **Surfaces:** prefer `--surface-muted` / `--surface-raised` for quiet hierarchy;
  reserve `--surface-2` for stronger emphasis.
- **Status UI:** use `Badge` + status tokens — don't invent one-off chip colors.
- **Telling N things apart:** `--identity-1…6`, not the chart tokens. Chart slots
  are tuned for marks the kit compensates for (2–3px strokes, marker rings, a
  table twin); a 7px dot gets none of that. Six is the limit — past six, use a
  label instead of a color.
- **Stacking:** every `z-index` comes from the `--z-*` scale.
  **The kit never exceeds `200`, and `300`+ is the consuming app's** — mount an
  overlay there without reading our CSS. `--z-base/raised/raised-2` are *local*:
  they only order siblings inside one component.
- **Button hierarchy:** one primary (`solid`) per region. Row/card actions use
  `variant="table"` (secondary) so a table doesn't fill with competing CTAs.
- **New component:** follow the pattern in an existing file (Radix + CVA + brand
  class), add its CSS to `ds-components.css`, and keep its usage in `app/` honest.
- **Taking `layout.css` without `app-kit.tsx`:** read the header of that file
  first. Several classes require a specific HTML shape and fail *silently* when
  they don't get it — every block that constrains its markup states the contract
  above it. The three that bite: `.page-header` is a **sibling** of the content,
  not its parent; `.data-table-entity` goes on a `<div>` **inside** the cell,
  never on the `<td>`; and if an ancestor scrolls, the shell must be
  `.app-shell--embedded`.
- **Icons:** Lucide at `strokeWidth={1.5}`.
- **Look:** editorial and quiet — hairlines, square-leaning corners, soft shadows,
  restrained motion.
- **Typography:** titles/headings → Sentient (`--font-display` / `.t-app-h*`); body
  and UI chrome → Geist. Don't fake a heading with `font-weight: 600` on Geist.
- **Verify:** `npm run typecheck && npm run lint && npm run lint:css && npm test &&
  npm run build` after changes.

---

## 6. Language & i18n

Code is English. Copy is not hardcoded — it lives in
[`src/i18n/locales/`](src/i18n/locales/), one namespace: `ui`. `react-i18next` /
`i18next` are **peer dependencies** — the consuming app supplies them.

- **`en` is the source of truth for the key types.**
  [`react-i18next.d.ts`](src/i18n/react-i18next.d.ts) augments `CustomTypeOptions`
  with the EN resources, so a mistyped `t()` key is a compile error.
- **`es` is checked against `en` at compile time** by
  [`parity.ts`](src/i18n/parity.ts): a key present in EN and missing from ES fails
  `npm run typecheck`.
- **Resources are bundled, not fetched** — there is no backend.

### What is copy and what is a prop

1. **Generic UI chrome → i18n.** Buttons, hints, `aria-label`, pagination, empty
   states, toasts, validation — anything that reads the same regardless of which
   product embeds this package.
2. **Anything with product narrative → a required prop, never a default.**
   `LoginPanel`'s `title`/`intro`/`poweredBy`, `PermissionGate`'s `appName` — this
   package has no opinion on your product's voice, company name, or IDP.
3. **Never build a sentence by concatenation** — word order isn't translatable. Use
   interpolation: `t('scope.selectedOfTotal', { selected, total })`.

---

## 7. Keeping the kit portable

Every piece here is meant to drop into any project unmodified. That only holds if
every new component takes its content via props or the `ui` namespace, resolves its
own state, and pins nothing to one product's routing, data, or vocabulary. A tripwire
catches the worst of it (not a full linter). It used to run in CI; the template ships
no CI now, so run it by hand — the commands are in [`AGENTS.md`](AGENTS.md). It fails
if:

- a `src/views/` or `src/data/` folder reappears,
- any file touches `window.location` (navigation is the host app's job),
- a component calls `useTranslation('builder' | 'devops' | 'consumer' | 'designSystem')`
  — namespaces that don't exist in this package.

If a pattern looks reusable but carries domain vocabulary (the way `capability-gate`
and `connector-scope-picker` originally did), generalize its naming and types before
it lands here — see `permission-gate.tsx` and `grouped-scope-picker.tsx` for what that
looked like in practice.
