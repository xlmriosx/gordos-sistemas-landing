/**
 * Session bar — dev-only chrome for the building session.
 *
 * A full-width strip at the top of the page. It is chrome for the session, not
 * part of the app: the things it holds are not adjustments to what the developer
 * is making, they are the session itself.
 *
 * It PUSHES the page down rather than floating over it. That is a decision with
 * a cost, taken deliberately: nothing of the app is ever covered, and
 * in exchange the viewport in a building session is shorter than the one that
 * ships. The push happens two ways, because an app can be laid out either way:
 *   - `--product-topbar-height` on the root, which the design system's AppShell
 *     and PageHeader already read, so an app built on them offsets correctly on
 *     its own.
 *   - padding on <body>, for an app that does not use AppShell (the template's
 *     own scaffold does not).
 * Both are reverted on unmount, so this leaves no trace in a page it is not on.
 *
 * WHY IT IS NOT IN frontend/src/
 *
 * It is tooling for the building session, not a block a developer's app is made
 * of. It must never appear in the component catalogue, and it must never reach a
 * production bundle: the NODE_ENV guard below is one layer, and being reachable
 * only through frontend/app/DevToolbar.tsx's dev-only dynamic import is the
 * other. Grepping the built bundle for the HOST_ID below measures it; that
 * grep used to run in CI and is a manual check now (tools/AGENTS.md).
 *
 * HOW IT TALKS TO THE POINTER TOOLBAR, WITHOUT EITHER IMPORTING THE OTHER
 *
 * Two tools that import each other trip the package-boundary signal,
 * and that is a decision of its own. So they share no code at all: they share a
 * documented DOM contract, and each degrades to working alone.
 *
 *   - This bar sets `data-app-session-bar` on the root element. The pointer
 *     toolbar reads it to know a dock exists, and suppresses its own floating
 *     marker when it does.
 *   - The pointer toolbar reflects its state as
 *     `data-app-pointer-toolbar="open" | "dismissed"` on the root element.
 *     This bar renders its control from that attribute, and renders NO control
 *     at all when the attribute is absent, so it never offers a way into a tool
 *     that is not there.
 *   - This bar dispatches `app:pointer-toolbar:show` on window to reopen it.
 *
 * Read that list as the whole contract. Anything beyond it is a new decision.
 *
 * WHAT THIS BAR DELIBERATELY DOES NOT SHOW
 *
 * The name the app is registered under. It exists, it matters, and it is not a
 * thing anyone should have to look at: an identifier on screen invites someone
 * to try to make it pretty, and it is not the kind of name that can be. The
 * Builder edits the name they can read; the identifier is derived from the
 * first edit and then frozen, out of sight.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { t } from './strings';

const HOST_ID = 'app-session-bar';

/** The pointer toolbar's half of the DOM contract. See the header comment. */
const POINTER_STATE_ATTR = 'data-app-pointer-toolbar';
const POINTER_SHOW_EVENT = 'app:pointer-toolbar:show';
const POINTER_HIDE_EVENT = 'app:pointer-toolbar:hide';

export type SessionBarProps = {
  /**
   * The app's friendly name. Required, with no default on purpose: this file is
   * shared tooling and the app's own words are never hardcoded here.
   */
  appName: string;
  /**
   * The name as the app was primed with it. Optional, and load-bearing when
   * present: while `appName` differs from this, the bar says so, because a local
   * edit is not the app's name until something outside this page agrees.
   */
  primedName?: string;
  /**
   * Called when the developer edits the friendly name. Omit it and the field is
   * read-only: an editable field that silently fails to save would be worse than
   * no field.
   */
  onAppNameChange?: (next: string) => void;
};

export default function SessionBar(props: SessionBarProps) {
  if (process.env.NODE_ENV === 'production') return null;
  return <ShadowMount {...props} />;
}

/**
 * One bar per page. The module-level handle exists for the same reason the
 * pointer toolbar has one: StrictMode double-invokes the mount effect in dev
 * (mount, clean up, mount again in the same tick), and the cleanup cannot call
 * root.unmount() synchronously. Deferring the teardown lets the immediate
 * re-mount cancel it and adopt the host that already exists.
 *
 * Solved independently rather than shared with the pointer toolbar, because a
 * shared helper is a dependency edge between two tools. If a THIRD tool needs
 * this, that is the package-boundary rule, and the answer
 * then is a real package, not a third copy.
 */
let pendingRemoval: ReturnType<typeof setTimeout> | null = null;
let mounted: { host: HTMLElement; root: Root } | null = null;

function ShadowMount(props: SessionBarProps) {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (pendingRemoval !== null) {
      clearTimeout(pendingRemoval);
      pendingRemoval = null;
    }

    if (!mounted) {
      const host = document.createElement('div');
      host.id = HOST_ID;
      const shadow = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = STYLES;
      shadow.appendChild(style);
      const container = document.createElement('div');
      shadow.appendChild(container);
      document.body.appendChild(host);
      mounted = { host, root: createRoot(container) };
    }

    containerRef.current = mounted.host;
    document.documentElement.setAttribute('data-app-session-bar', '');
    setReady(true);

    return () => {
      pendingRemoval = setTimeout(() => {
        pendingRemoval = null;
        if (!mounted) return;
        const { host, root } = mounted;
        mounted = null;
        root.unmount();
        host.remove();
        document.documentElement.removeAttribute('data-app-session-bar');
        document.documentElement.style.removeProperty('--product-topbar-height');
        document.body.style.removeProperty('padding-top');
      }, 0);
    };
  }, []);

  useEffect(() => {
    if (!ready || !mounted) return;
    mounted.root.render(<Bar {...props} />);
  }, [ready, props]);

  return null;
}

function Bar({ appName, primedName, onAppNameChange }: SessionBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [pointerState, setPointerState] = useState(() =>
    document.documentElement.getAttribute(POINTER_STATE_ATTR),
  );

  /**
   * The push. Measured rather than assumed: the bar's height depends on the
   * brand font, which loads asynchronously, so a hardcoded number would be
   * wrong for the first paint on a cold cache.
   */
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const apply = () => {
      const h = `${Math.round(el.getBoundingClientRect().height)}px`;
      document.documentElement.style.setProperty('--product-topbar-height', h);
      document.body.style.paddingTop = h;
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** The pointer toolbar's state, watched through the contract, never imported. */
  useEffect(() => {
    const read = () => setPointerState(document.documentElement.getAttribute(POINTER_STATE_ATTR));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: [POINTER_STATE_ATTR] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="sb-bar" ref={barRef} role="toolbar" aria-label={t.barLabel}>
      <span className="sb-mark" aria-hidden="true" />

      <NameField appName={appName} primedName={primedName} onAppNameChange={onAppNameChange} />

      <span className="sb-spacer" />

      {/*
        A toggle, always present while the pointer toolbar is on the page, in
        both directions. Never rendered when the state attribute is absent: a
        control for a tool that is not there is worse than no control.

        `aria-pressed` rather than a label that changes: the button is one thing
        in two states, and a label that flips between "abrir" and "cerrar" makes
        a screen reader announce a different control each time.
      */}
      {pointerState ? (
        <button
          type="button"
          className="sb-toggle"
          aria-pressed={pointerState === 'open'}
          // Icon-only, so the name has to come from somewhere: aria-label carries
          // it for a screen reader and title for a pointer. Both say the action,
          // not the tool, because the button is one thing in two states.
          aria-label={pointerState === 'open' ? t.hidePointer : t.showPointer}
          title={pointerState === 'open' ? t.hidePointer : t.showPointer}
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent(pointerState === 'open' ? POINTER_HIDE_EVENT : POINTER_SHOW_EVENT),
            )
          }
        >
          <IconPointerClick />
        </button>
      ) : null}
    </div>
  );
}

function NameField({
  appName,
  primedName,
  onAppNameChange,
}: Pick<SessionBarProps, 'appName' | 'primedName' | 'onAppNameChange'>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(appName);
  useEffect(() => setDraft(appName), [appName]);

  if (!onAppNameChange) {
    return <span className="sb-name sb-name-static">{appName}</span>;
  }

  /**
   * One marker, two situations, and they mean the same thing: what is on screen
   * is not the app's name yet.
   *
   *   - Typed and not confirmed.
   *   - Confirmed, but only here. A local edit does not reach the record the
   *     platform holds, so someone else still sees the primed name. Saying so is
   *     the difference between a name and a private note.
   */
  const typedNotCommitted = editing && draft.trim() !== appName && draft.trim().length > 0;
  const localOnly = primedName !== undefined && appName !== primedName;
  const dirty = typedNotCommitted || localOnly;

  /**
   * At rest this is text with a pencil, not a field.
   *
   * The obvious implementation — an input that is always there, styled to look
   * like a title — needs the input to size itself to its content, or the pencil
   * floats somewhere off to the right of an empty box. Every way of doing that
   * is a fight: an <input> carries an intrinsic width, `field-sizing: content`
   * is not everywhere yet, and the hidden-sizer trick collapses inside the
   * nested flex this bar is built on (measured: the sizer resolved to 0 wide
   * while its content was 175).
   *
   * Swapping text for a field on demand has none of those problems, and it is
   * also the more honest reading of the state: at rest this is the app's name,
   * and only while you are changing it is it a form.
   */
  if (!editing) {
    return (
      <button
        type="button"
        className="sb-name-edit"
        title={t.renameTitle}
        onClick={() => setEditing(true)}
      >
        <span className="sb-name sb-name-static">{appName}</span>
        <IconPencil />
        {dirty ? <span className="sb-unsaved">{t.unsaved}</span> : null}
      </button>
    );
  }

  /**
   * Called directly by both paths rather than only by onBlur, so committing
   * never depends on a focus side effect having landed.
   */
  const commit = () => {
    const next = draft.trim();
    // An empty name is not a name. Fall back rather than scold: the field
    // reverts to what it was, which says what happened without a message.
    if (!next) setDraft(appName);
    else if (next !== appName) onAppNameChange(next);
    setEditing(false);
  };

  return (
    <span className="sb-name-wrap">
      <input
        className="sb-name"
        // Focused on mount so the click that opened the field is the same
        // gesture that starts typing, rather than two.
        autoFocus
        size={Math.max(draft.length, 8)}
        value={draft}
        aria-label={t.nameLabel}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          // currentTarget rather than target: an event that crosses a shadow
          // boundary is retargeted to the host, and the host is not focusable.
          if (e.key === 'Enter') {
            commit();
            e.currentTarget.blur();
          }
          if (e.key === 'Escape') {
            setDraft(appName);
            setEditing(false);
          }
        }}
      />
      {dirty ? <span className="sb-unsaved">{t.unsaved}</span> : null}
    </span>
  );
}

function IconPencil() {
  return (
    <svg className="sb-pencil" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

/**
 * Lucide `mouse-pointer-click`, inlined at the brand's 1.5 stroke.
 *
 * Byte-identical to the one in tools/pointer-toolbar/, and deliberately copied
 * rather than shared: the two tools take no dependency on each other, which is
 * the whole point of the DOM contract above. Duplicated icon geometry is the
 * cheap half of that trade. It has to be the SAME drawing though, not a
 * lookalike — this button and that bar are the same tool in two places, and two
 * approximations of one icon read as two different things.
 */
function IconPointerClick() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4.1 12 6" />
      <path d="m5.1 8-2.9-.8" />
      <path d="m6 12-1.9 2" />
      <path d="M7.2 2.2 8 5.1" />
      <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
    </svg>
  );
}

/**
 * Every value is a token with a literal fallback, the same way the pointer
 * toolbar does it: custom properties cross the shadow boundary, so the bar
 * matches the brand when the app's CSS is present, and stays legible on a bare
 * page where it is not.
 */
const STYLES = `
:host {
  all: initial;
}

.sb-bar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 2147483000;

  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-2, 8px) var(--space-4, 16px);

  font-family: var(--font-ui, 'Geist', ui-sans-serif, system-ui, sans-serif);
  font-size: var(--fs-app-label-sm, 12px);
  color: var(--ink, #171717);
  background: var(--surface-raised, #FFFFFF);

  /* Lavender, the same edge the pointer toolbar wears, and for the same reason:
     it is the accent that means "this is session chrome, not your app". It says
     where the tooling stops and the product starts.

     The edge is TWO things, matching that bar exactly: a 1px lavender hairline
     and a 3px halo at an 18% mix. The hairline alone reads as a hard rule across
     the page, which is what it looked like before the halo went in. That bar
     rings all four sides because it floats; this one is flush, so the same
     geometry is clipped to the side that shows.

     The two box-shadow declarations are the fallback, and the order is
     load-bearing, exactly as documented in tools/pointer-toolbar/. An engine
     without color-mix() fails to parse the second and drops it, leaving the
     hairline standing on its own rather than resetting the shadow to none.

     A line only, never text and never a focus ring: lavender on a light surface
     is 1.86:1, which is fine for a boundary and a failure for anything that has
     to be read. Same knowing deviation, same reason. */
  border-bottom: 1px solid var(--lavender, #C4B8E0);
  box-shadow: none;
  box-shadow: 0 3px 0 0 color-mix(in oklab, var(--lavender, #C4B8E0) 18%, transparent);
  box-sizing: border-box;
}

/* The brand symbol as a mask, not an <img>.
   An <img> paints the file's own ink, so the carbon-black symbol stayed black on
   a dark background while every other glyph in the bar inverted. A mask takes
   its colour from background-color, so the symbol follows --ink and flips with
   the theme exactly like the text beside it. One asset, both themes: the
   off-white variant exists but picking between files in CSS is not possible, and
   a second <img> toggled by a media query would miss the [data-theme] override.

   The symbol itself is inline (a data URI) rather than a file in the app's
   public folder. The app's public folder holds the PRODUCT's brand assets, and
   a dev-only bar has no business borrowing them — nor leaving a dangling
   /brand/logos/... URL behind when they are replaced by the product's own. */
.sb-mark {
  --sb-mark: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 246.46 200'%3E%3Cpolygon points='105.15 48.77 177.92 122.33 187.38 91.61 116.56 20.02 37.93 20.02 37.93 48.77 105.15 48.77'/%3E%3Cpolygon points='170.14 0 149.93 19.97 214.11 84.72 202.8 121.58 232.76 121.58 246.46 76.92 170.14 0'/%3E%3Cpolygon points='141.31 151.23 68.54 77.67 59.08 108.39 129.9 179.98 208.53 179.98 208.53 151.23 141.31 151.23'/%3E%3Cpolygon points='76.32 200 96.52 180.03 32.35 115.28 43.66 78.42 13.7 78.42 0 123.08 76.32 200'/%3E%3C/svg%3E");
  height: 16px;
  width: 20px;
  flex: none;
  background-color: var(--ink, #171717);
  -webkit-mask: var(--sb-mark) center / contain no-repeat;
  mask: var(--sb-mark) center / contain no-repeat;
}

.sb-name-wrap { display: inline-flex; align-items: center; gap: var(--space-2, 8px); min-width: 0; }

/* At rest: one target holding the name and its pencil, so the whole title is
   clickable and reachable by keyboard, not just a 12px icon. */
.sb-name-edit {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: 2px var(--space-1, 4px);
  margin: 0;
  font: inherit;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: var(--radius-xs, 4px);
  cursor: text;
  text-align: left;
  min-width: 0;
  transition: background var(--dur-fast, 120ms) var(--ease-in-out, ease);
}
.sb-name-edit:hover { background: var(--surface-muted, #F7F6F5); }
.sb-name-edit:focus-visible { outline: 2px solid var(--accent-select, #978E91); outline-offset: 0; }
.sb-name-edit .sb-name-static { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.sb-name {
  font-family: var(--font-display, 'Sentient', ui-serif, Georgia, serif);
  font-size: var(--fs-app-headline-sm, 18px);
  font-weight: 400;
  color: var(--ink, #171717);
  min-width: 0;
}

/* While editing, and only then. Not a boxed form field: this is a title, and a
   frame around it would read as configuration rather than as the app's name. */
input.sb-name {
  all: unset;
  font-family: var(--font-display, 'Sentient', ui-serif, Georgia, serif);
  font-size: var(--fs-app-headline-sm, 18px);
  color: var(--ink, #171717);
  padding: 2px var(--space-1, 4px);
  border-radius: var(--radius-xs, 4px);
  cursor: text;
  transition: background var(--dur-fast, 120ms) var(--ease-in-out, ease);
}
input.sb-name:hover { background: var(--surface-muted, #F7F6F5); }
input.sb-name:focus {
  background: var(--surface-muted, #F7F6F5);
  outline: 2px solid var(--accent-select, #978E91);
  outline-offset: 0;
}

/* The pencil is the resting affordance, replacing the underline the field used
   to carry: a rule under a title reads as decoration, a pencil reads as "you can
   change this". It goes away on focus, where the caret already says it. */
.sb-pencil {
  flex: none;
  color: var(--ink-faint, var(--ink-muted, #82797D));
  transition: opacity var(--dur-fast, 120ms) var(--ease-in-out, ease);
}
.sb-name-edit:hover .sb-pencil { color: var(--ink, #171717); }

/* The toggle. Off is an outline with a hollow dot, on is filled with a solid
   one: state readable from shape and fill, not from colour alone. */
/* Icon-only and square-ish: the bar holds one control today and will hold the
   rest of the session tools next to it, so they have to line up as a row of
   equal targets rather than a row of differently sized labels. */
.sb-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  font: inherit;
  color: var(--ink, #171717);
  background: transparent;
  border: 1px solid var(--hairline, rgba(23, 23, 23, 0.16));
  border-radius: var(--radius-sm, 8px);
  cursor: pointer;
  transition:
    background var(--dur-fast, 120ms) var(--ease-in-out, ease),
    color var(--dur-fast, 120ms) var(--ease-in-out, ease);
}
.sb-toggle:hover { background: var(--surface-muted, #F7F6F5); }
.sb-toggle:focus-visible { outline: 2px solid var(--accent-select, #978E91); outline-offset: 2px; }

.sb-toggle[aria-pressed='true'] {
  background: var(--carbon-black, #171717);
  border-color: var(--carbon-black, #171717);
  color: var(--off-white, #E5E3E2);
}
.sb-toggle[aria-pressed='true']:hover { background: var(--ink, #171717); }


@media (prefers-reduced-motion: reduce) {
  .sb-toggle, input.sb-name, .sb-pencil, .sb-name-edit { transition: none; }
}

.sb-unsaved {
  font-family: var(--font-mono, 'Geist Mono', ui-monospace, monospace);
  font-size: var(--fs-app-label-mono, 11px);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-faint, var(--ink-muted, #82797D));
}

.sb-spacer { flex: 1 1 auto; }

.sb-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: var(--space-1, 4px) var(--space-2, 8px);
  font: inherit;
  color: var(--ink, #171717);
  background: transparent;
  border: 1px solid var(--hairline, rgba(23, 23, 23, 0.10));
  border-radius: var(--radius-sm, 8px);
  cursor: pointer;
  transition: background var(--dur-fast, 120ms) var(--ease-in-out, ease);
}
.sb-btn:hover { background: var(--surface-muted, #F7F6F5); }

@media (prefers-reduced-motion: reduce) {
  .sb-btn { transition: none; }
}
`;
