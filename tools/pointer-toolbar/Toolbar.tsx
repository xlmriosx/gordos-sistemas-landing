/**
 * Pointer toolbar — dev-only annotation bar.
 *
 * Lets someone point at the screen and say "esto aquí" without needing
 * vocabulary. Notes go to the clipboard and nowhere else: no server, no
 * network, and nothing about them is ever stored.
 *
 * One tool: Señalar. The bar is a registry with a single entry on purpose — a
 * tool is a product decision, not a drive-by addition.
 *
 * It is on as soon as the app comes up — nobody has to ask for it. That is only
 * acceptable because dismissing it sticks: the hide control collapses it to a
 * small marker, and that choice is remembered, so a reload or a hot update does
 * not pop the bar back open. Anything that appears on its own and returns after
 * being closed is worse than not appearing at all.
 *
 * The one thing kept across reloads is that single flag. Annotations are not
 * stored, which is why the marker also restores it on click: it is the only way
 * back, and it belongs to the person looking at the screen. Nothing outside this
 * component can un-hide it.
 *
 * This file lives in tools/pointer-toolbar/, outside frontend/'s design-system
 * catalog, and frontend/app/ imports it directly by relative path — it is never
 * something a developer's app is built from. What keeps it out of a production
 * bundle is the guard below: bundlers replace process.env.NODE_ENV at build
 * time, so in a production build this component never renders and its body
 * becomes dead code the bundler can drop.
 *
 * The second layer is frontend/app/DevToolbar.tsx, which reaches this file
 * through a dynamic import behind `import.meta.env.DEV`. Since that is a
 * compile-time constant, a production build never resolves anything under
 * tools/ at all — the platform's Dockerfile copies only frontend/ into its
 * frontend stage, so a static import reintroduced anywhere fails the build
 * instead of shipping quietly.
 *
 * That layer is younger than this comment used to admit, and it was worth
 * building: while App.tsx imported this file unconditionally, tree-shaking did
 * drop this component's body, but NOT the react/react-dom that this folder
 * pins at a different major than frontend/. Every production bundle carried a
 * second copy of React, 139 kB of it, and the bundle grep never saw it because
 * a grep for HOST_ID only ever finds this file, never what it drags in.
 *
 * The grep stays anyway: the build failing is the guarantee, and measuring the
 * bundle is what catches the route nobody anticipated. It ran in CI
 * (frontend-ci.yml) until the template shipped no workflows; it is a manual
 * check now, in tools/AGENTS.md.
 *
 * Mount once, at the app root:  <PointerToolbar />
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AnnotationPanel } from './AnnotationPanel';
import { Picker } from './Picker';
import { ToolbarProvider, useToolbar } from './context';
import { t } from './strings';

const HOST_ID = 'app-pointer-toolbar';
const TOAST_MS = 2600;
const DISMISSED_KEY = 'app-pointer-toolbar:dismissed';

/**
 * The half of the DOM contract this tool owns, shared with tools/session-bar/
 * WITHOUT either importing the other. Two tools that import each other trip the
 * package-boundary signal, and that is a decision of its own.
 *
 *   - This file reflects its state on the root element as
 *     `data-app-pointer-toolbar="open" | "dismissed"`, for a dock to read.
 *   - It listens for `app:pointer-toolbar:show` and `:hide`. A dock owns a
 *     toggle, so it has to be able to drive both directions, not just the way
 *     back.
 *   - It reads `data-app-session-bar` to know a dock exists, and when one
 *     does it renders NO floating marker: the way back lives in the dock.
 *
 * Every part degrades. With no dock on the page, the marker is the way back
 * exactly as before, which is what an app cloned before the session bar existed
 * keeps doing forever.
 */
const STATE_ATTR = 'data-app-pointer-toolbar';
const SHOW_EVENT = 'app:pointer-toolbar:show';
const HIDE_EVENT = 'app:pointer-toolbar:hide';
const DOCK_ATTR = 'data-app-session-bar';

/**
 * `sessionStorage`, deliberately, and not `localStorage`.
 *
 * What has to survive is a reload or a hot update: the developer closes the bar,
 * the dev server refreshes the page a second later, and the bar must not pop back
 * open. sessionStorage covers that — it is per tab and outlives a reload.
 *
 * What must NOT survive is the app itself. Every preview runs on the same origin
 * (localhost:5173), so a `localStorage` flag would leak across apps: dismiss the
 * bar once and the first version of the *next* app would come up with no bar on
 * screen, which is the one thing it is supposed to guarantee.
 *
 * Wrapped because storage throws rather than returning null in real cases —
 * Safari private browsing, a cookie policy, a sandboxed frame. A toolbar that
 * crashes the developer's app over a preference is not a trade worth making, so
 * every failure degrades to "not dismissed".
 */
const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
};

const writeDismissed = (dismissed: boolean) => {
  try {
    if (dismissed) window.sessionStorage.setItem(DISMISSED_KEY, '1');
    else window.sessionStorage.removeItem(DISMISSED_KEY);
  } catch {
    /* preference is best-effort; the bar still works for this page load */
  }
};

export default function PointerToolbar() {
  if (process.env.NODE_ENV === 'production') return null;
  return <ShadowMount />;
}

/**
 * The host lives outside the component because it has to outlive a single run of
 * the effect below.
 *
 * StrictMode double-invokes that effect in dev: mount, cleanup, mount again in the
 * same tick. The cleanup cannot call root.unmount() synchronously — React forbids
 * it from inside cleanup — so it defers the DOM removal with setTimeout, and the
 * immediate re-mount runs first. Keeping the pending timer here lets that re-mount
 * cancel the removal, and keeping the instance here lets it take ownership of the
 * host that already exists. Cancelling without re-adopting is not enough: the
 * surviving effect would own nothing, so a real unmount later would run a cleanup
 * with nothing to tear down and leave the host in document.body with its five
 * isolation listeners still swallowing the app's events — a worse bug than the
 * flash it fixes, and invisible.
 *
 * Module scope assumes one bar per page, which the mount contract guarantees
 * ("mount once, at the app root"). Two <PointerToolbar /> instances would fight
 * over this timer — the second adopts the first's host and its cleanup takes the
 * host out from under it — so that case gets its own warning below, told apart
 * from the StrictMode re-mount by whether a removal was pending: the re-mount
 * always arrives right after a cleanup scheduled one, a second instance never does.
 */
let pendingRemoval: ReturnType<typeof setTimeout> | null = null;
let mountedInstance: { host: HTMLElement; root: Root } | null = null;

/**
 * The React root is parked on the host element, not only in the module variable
 * above, so that a *re-evaluated* module can still reach it. Fast Refresh replaces
 * this module's bindings while the old host stays in the DOM, and the tree inside
 * that host registered listeners on window — pointermove/pointerup for the drag,
 * and the Picker's capture-phase ones. Removing the host detaches the five
 * isolation listeners it owns and nothing else: without the root, the orphaned tree
 * keeps handling window events forever, one more set per hot reload, with nothing
 * on screen to explain it. Reaching the root is what makes that unmountable.
 */
type ToolbarHost = HTMLElement & { __ptRoot?: Root };

/**
 * The UI lives in a shadow root so it neither inherits the app's CSS nor leaks
 * into it. A nested React root is created inside the shadow root rather than
 * portaling from the app's tree, so React attaches its listeners inside the
 * shadow boundary and events behave normally.
 *
 * CSS custom properties do cross a shadow boundary, which is how the bar stays
 * on brand: it reads the app's role tokens and only falls back to literals. The
 * role tokens are also what makes dark theme free — they invert with
 * data-theme="dark" on <html> without this component knowing about themes.
 */
function ShadowMount() {
  useEffect(() => {
    // Only a StrictMode re-mount arrives with a removal still pending, which is
    // what separates "adopt what I just tore down" from "someone mounted a second
    // bar" further down.
    const adopting = pendingRemoval !== null;
    if (pendingRemoval) {
      clearTimeout(pendingRemoval);
      pendingRemoval = null;
    }

    const teardown = () => {
      const current = mountedInstance;
      if (!current) return;
      // React refuses to unmount a root synchronously from inside cleanup.
      if (pendingRemoval) clearTimeout(pendingRemoval);
      pendingRemoval = setTimeout(() => {
        pendingRemoval = null;
        mountedInstance = null;
        current.root.unmount();
        current.host.remove();
      }, 0);
    };

    // The StrictMode re-mount lands here: the host is already built and rendering,
    // so adopt it and keep the cleanup rather than bailing out without one.
    if (mountedInstance) {
      if (!adopting) {
        console.warn('[pointer-toolbar] a second bar is mounted — mount once, at the app root. This one is adopting the first one\'s host, and whichever unmounts first takes it away from the other.');
      }
      return teardown;
    }

    /**
     * A host in the DOM with no instance behind it means this module was
     * re-evaluated while the old host survived — Fast Refresh, normally. Removing
     * the element takes its five isolation listeners with it, but the tree inside
     * still holds window listeners, so the root has to be unmounted too or every
     * hot reload leaves another invisible copy handling pointer events.
     *
     * Unmounting is deferred for the same reason the cleanup above defers: this
     * runs inside an effect, and React may have flushed that effect from within a
     * render it is driving. Detaching the host is what has to be immediate — after
     * that the old tree is off-screen, and one tick later it is gone.
     */
    const stale = document.getElementById(HOST_ID) as ToolbarHost | null;
    if (stale) {
      console.warn('[pointer-toolbar] replacing an orphaned host — expected after a hot reload, a bug if it repeats without one.');
      const staleRoot = stale.__ptRoot;
      stale.remove();
      if (staleRoot) setTimeout(() => staleRoot.unmount(), 0);
    }

    const host: ToolbarHost = document.createElement('div');
    host.id = HOST_ID;
    host.setAttribute('data-pointer-toolbar', '');
    document.body.appendChild(host);

    /**
     * Events that cross a shadow boundary are retargeted to the host, so an app
     * asking "did a click land outside me?" sees a click on this div, decides the
     * answer is yes, and dismisses itself. Radix's dismissable layer does exactly
     * that on `pointerdown` and `focusin` — which is why using the bar used to
     * close whatever dialog, popover or select was open behind it.
     *
     * Stopping them at the host in the bubble phase means the app never learns
     * they happened. React's own handlers are attached inside the shadow root and
     * have already run by the time the event gets here, so the bar keeps working.
     *
     * `pointermove`, `pointerup` and `mouseup` are deliberately left alone: the
     * drag handle ends a drag on window-level pointermove/pointerup, and
     * swallowing those would leave the bar glued to the cursor. The Picker is
     * unaffected either way — it listens on window in the capture phase, which
     * runs before an event ever reaches this host.
     */
    const isolate = (event: Event) => event.stopPropagation();
    for (const type of ['pointerdown', 'mousedown', 'click', 'touchstart', 'focusin']) {
      host.addEventListener(type, isolate);
    }

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = STYLES;
    shadow.appendChild(style);

    const container = document.createElement('div');
    shadow.appendChild(container);

    const root = createRoot(container);
    root.render(
      <ToolbarProvider>
        <ToolbarUI host={host} />
      </ToolbarProvider>,
    );

    host.__ptRoot = root;
    mountedInstance = { host, root };

    return teardown;
  }, []);

  return null;
}

function ToolbarUI({ host }: { host: HTMLElement }) {
  const { tool, setTool, annotations } = useToolbar();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(readDismissed);
  const [toast, setToast] = useState('');
  const [pos, setPos] = useState(() => ({ x: 20, y: Math.max(20, window.innerHeight - 84) }));
  const dragFrom = useRef<{ x: number; y: number; ox: number; oy: number; w: number; h: number } | null>(null);

  /** The toolbar's own subtree must never be pickable. */
  const ignore = useMemo(() => [host], [host]);

  /** Reflect state for a dock to read. Cleared on unmount: an attribute left
   *  behind would advertise a toolbar that is no longer on the page. */
  useEffect(() => {
    document.documentElement.setAttribute(STATE_ATTR, hidden ? 'dismissed' : 'open');
    return () => document.documentElement.removeAttribute(STATE_ATTR);
  }, [hidden]);

  /**
   * Both directions, when a dock owns the toggle. `:hide` does exactly what the
   * bar's own hide control does, dropping the active tool as well: leaving a
   * picker armed under a closed bar would let a click land on a tool nobody can
   * see running.
   */
  useEffect(() => {
    const onShow = () => {
      setHidden(false);
      writeDismissed(false);
    };
    const onHide = () => {
      setTool(null);
      setHidden(true);
      writeDismissed(true);
    };
    window.addEventListener(SHOW_EVENT, onShow);
    window.addEventListener(HIDE_EVENT, onHide);
    return () => {
      window.removeEventListener(SHOW_EVENT, onShow);
      window.removeEventListener(HIDE_EVENT, onHide);
    };
  }, [setTool]);

  /** Watched, not read once: the dock mounts on its own schedule, and on a hot
   *  update either tool can come back first. */
  const [docked, setDocked] = useState(() => document.documentElement.hasAttribute(DOCK_ATTR));
  useEffect(() => {
    const read = () => setDocked(document.documentElement.hasAttribute(DOCK_ATTR));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: [DOCK_ATTR] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  /**
   * Both states drag from a grip that is a direct child of the surface being
   * moved, so the surface is the grip's parent and its size is measured at
   * pointerdown rather than assumed. The open bar and the collapsed nub differ by
   * a couple of hundred pixels: one fixed margin cannot serve both, and the old
   * constant was the bar's — which is why the nub, now that it drags too, would
   * otherwise stop well short of the right edge.
   */
  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    // No parent means the grip was moved out of the surface it is supposed to move.
    // Refusing to drag makes that visible; falling back to a guessed size would
    // clamp against the wrong box and only misbehave near the edges.
    if (!rect) return;
    dragFrom.current = {
      x: event.clientX,
      y: event.clientY,
      ox: pos.x,
      oy: pos.y,
      w: rect.width,
      h: rect.height,
    };
  };

  /**
   * The clamp lives in the drag, so anything that resizes the surface without a drag
   * can leave it out of bounds. Collapsing and revealing is the loud version: drag
   * the ~50px nub to the right edge, reveal, and the ~300px bar renders at the same x
   * with most of itself off-screen. Re-clamping after layout — when the new surface
   * can actually be measured — covers that, plus the window resize that was never
   * handled at all.
   *
   * `annotations.length` is in the deps for the quiet version of the same bug: the
   * bar grows when the Notas badge appears, and again when the count reaches two
   * digits. Those ~20px are enough to push a right-edge bar off-screen until the next
   * drag, and nothing else would notice. Anything else that changes the bar's width
   * has to be added here too.
   */
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos((current) => {
        const x = clamp(current.x, 8, window.innerWidth - rect.width - 8);
        const y = clamp(current.y, topInset(), window.innerHeight - rect.height - 8);
        // Same object, not an equal one: resize fires often and an already-legal
        // position must not cost a render per event.
        return x === current.x && y === current.y ? current : { x, y };
      });
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [hidden, annotations.length]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const from = dragFrom.current;
      if (!from) return;
      setPos({
        x: clamp(from.ox + (event.clientX - from.x), 8, window.innerWidth - from.w - 8),
        y: clamp(from.oy + (event.clientY - from.y), topInset(), window.innerHeight - from.h - 8),
      });
    };
    const onUp = () => {
      dragFrom.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  /**
   * Hiding turns the active tool off as well. A hidden bar with a live tool
   * would leave the app swallowing clicks with nothing on screen to explain why
   * — the one state this component must never be able to reach.
   */
  const hide = () => {
    setTool(null);
    setHidden(true);
    writeDismissed(true);
  };

  const show = () => {
    setHidden(false);
    writeDismissed(false);
  };

  if (hidden) {
    // A dock owns the way back, so drawing a second one here would be two
    // controls for one action, in two places, one of which covers the app.
    if (docked) return toast ? <div className="pt-toast" role="status">{toast}</div> : null;

    return (
      <>
        {/*
          A container, not a button, and that is what makes the grip possible: a
          drag handle nested inside a button would end every reposition by firing
          the button's click and reopening the bar. Grip and reveal are two targets
          in the same shell, laid out like the open bar so collapsing reads as the
          same object shrinking rather than a different control appearing.
        */}
        <div className="pt-nub" ref={surfaceRef} style={{ left: pos.x, top: pos.y }}>
          <span className="pt-handle" aria-hidden="true" onPointerDown={startDrag}>
            <IconGrip />
          </span>

          <button
            type="button"
            className="pt-btn pt-btn-nub"
            title={t.showBar}
            aria-label={t.showBar}
            onClick={show}
          >
            <IconPointerClick />
            {annotations.length > 0 ? <span className="pt-badge">{annotations.length}</span> : null}
          </button>
        </div>

        {toast ? <div className="pt-toast" role="status">{toast}</div> : null}
      </>
    );
  }

  return (
    <>
      {tool === 'point' ? <Picker ignore={ignore} /> : null}

      <div
        className="pt-bar"
        ref={surfaceRef}
        style={{ left: pos.x, top: pos.y }}
        role="toolbar"
        aria-label={t.toolbarLabel}
      >
        <span className="pt-handle" aria-hidden="true" onPointerDown={startDrag}>
          <IconGrip />
        </span>

        {/*
          The tool's own icon, not the brand mark.
          The mark used to sit here as the one thing that said what this bar was.
          It moved to tools/session-bar/, which is the session's chrome and the
          right place for the brand; repeating it here would say the same thing
          twice on one screen. What identifies this bar now is what it does.
        */}
        <span className="pt-mark">
          <IconPointerClick />
        </span>

        <span className="pt-divider" aria-hidden="true" />

        <button
          type="button"
          className="pt-btn pt-btn-tool"
          aria-pressed={tool === 'point'}
          title={t.pointToolTitle}
          onClick={() => setTool(tool === 'point' ? null : 'point')}
        >
          {t.pointTool}
        </button>

        <span className="pt-divider" aria-hidden="true" />

        <button
          type="button"
          className="pt-btn pt-btn-notes"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {t.notes}
          {annotations.length > 0 ? <span className="pt-badge">{annotations.length}</span> : null}
        </button>

        <span className="pt-divider" aria-hidden="true" />

        <button
          type="button"
          className="pt-btn pt-btn-hide"
          title={t.hideBar}
          aria-label={t.hideBar}
          onClick={hide}
        >
          <IconX />
        </button>

        {open ? <AnnotationPanel onCopied={setToast} /> : null}
      </div>

      {toast ? <div className="pt-toast" role="status">{toast}</div> : null}
    </>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * The top of the area this bar may occupy.
 *
 * `--product-topbar-height` is a design-system token, not a private arrangement
 * with any one tool: an app built on AppShell sets it for its own top bar, and
 * tools/session-bar/ sets it for the session strip. Either way it means "the
 * page already owns these pixels", and a bar that parks on top of them covers a
 * control someone needs. Reading it is not a dependency on whoever set it.
 *
 * Defaults to the plain 8px inset when nothing claims the top.
 */
function topInset(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--product-topbar-height')
    .trim();
  const px = Number.parseFloat(raw);
  return Number.isFinite(px) && px > 0 ? px + 8 : 8;
}

/** Lucide `grip-vertical` — the drag affordance, at the brand's 1.5 stroke. */
function IconGrip() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}


/**
 * Lucide `mouse-pointer-click`, inlined at the brand's 1.5 stroke — the set is a
 * dependency this component does not take.
 *
 * The Señalar tool, and the collapsed nub as well. A pointer mid-click reads as
 * "click on something" in a way a crosshair does not, and one icon across both
 * states is what makes collapsing read as this bar shrinking rather than some other
 * control taking its place. The crosshair it replaced said "the bar is here" — a
 * job the nub's grip now does better, because it also says the thing moves.
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
 * Lucide `x`, on the right end of the bar. The glyph says close; the behaviour is
 * hide — the bar collapses to the nub and comes back from it. The aria-label
 * carries the honest version, so assistive tech announces "ocultar" rather than
 * promising something permanent.
 */
function IconX() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Every dimension here resolves to a brand token, with a literal only as the
 * fallback for an app that has not declared it. Sizes come off the app type
 * scale (.t-app-small 12, .t-app-mono 11), spacing off the 8pt base, radius off
 * the square-leaning scale. Nothing in this file invents a visual value.
 *
 * Elevation follows the one-shadow-per-region rule: the bar floats, so it takes
 * --shadow-md; the notes panel is attached to it and drops to --shadow-sm rather
 * than competing; the composer opens in its own region and takes --shadow-md.
 *
 * Colour: --lavender is the annotation accent — the bar's and nub's edge and ring,
 * the selector's 2px edge, its tint, its label, and the primary action all carry
 * it, so the whole point → write → save chain reads as one colour, including the
 * bar it starts from — and **text on any accent is --carbon-black**, never white.
 *
 *   - White on an accent fails AA at this text size. --dusty-mauve + --pure-white
 *     is 3.18:1 against a 4.5 requirement, which is what the highlight label used
 *     to be. --lavender + --carbon-black is 9.63:1.
 *   - The one knowing deviation: --lavender as a line is 1.86:1 on a light surface,
 *     under the 3.0 for non-text UI, and WCAG 1.4.11 does not relax that for
 *     thickness. It is accepted so the selector reads as a single colour, with the
 *     2px width and the 18% tint carrying the perceptibility. On the bar and nub
 *     the same swap is close to contrast-neutral — it replaced --hairline, which is
 *     1.93:1 on white — and what actually separates them from the page is
 *     --shadow-md, not the border.
 *   - Where the deviation is refused: anything whose whole job is contrast.
 *     --dusty-mauve is the only accent that clears 3.0 on both canvases
 *     (3.18 / 4.51), so the composer's border — an edge against unknown app
 *     content — and every :focus-visible ring keep --focus-ring / --dusty-mauve.
 *     Painting a focus ring lavender would take a passing 3.18:1 down to 1.86:1,
 *     which is a regression dressed as branding. A deeper lavender would resolve
 *     the tension and the palette does not have one; that is a gap for the design
 *     system, not a literal to invent here.
 *
 * --carbon-black, not --ink, is deliberate on the accent pairs. --lavender is a
 * palette token and does not invert; --ink does. Pairing them would give
 * light-on-light in dark theme. The pair is fixed on purpose, like the paper
 * tokens: both halves stay put, so the contrast holds in either theme.
 *
 * Radius runs one step of the scale apart, outer to inner: the floating surfaces
 * (bar, nub, panel, composer, toast) take --radius-sm and everything nested
 * inside them takes --radius-xs. That is not decoration — with 4px of padding, an
 * 8px outer corner and a 4px inner corner are concentric, and matching them would
 * make the inner corners read too tight. Move the outer value and the inner one
 * has to move with it.
 */
const STYLES = `
:host {
  position: fixed;
  inset: 0;
  z-index: 2147483645;
  pointer-events: none;
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  color: var(--ink, #171717);
}
* { box-sizing: border-box; }

/* The bar's edge is the accent rather than a neutral hairline. It floats over app
   content nobody controls, and reading as "the annotation layer" at a glance is
   what makes it findable at all. The ring is defined once for bar and nub below. */
.pt-bar {
  position: fixed;
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: var(--space-1, 4px);
  pointer-events: auto;
  background: var(--surface-raised, #FFFFFF);
  border: 1px solid var(--lavender, #C4B8E0);
  border-radius: var(--radius-sm, 8px);
}

/* The bar and the nub are the same tool in two states, so their halo is declared
   once here rather than copied into each block — the 18% mix is also the
   selector's, which is what ties point → write → save together visually.
   The ring shares the box-shadow list with --shadow-md rather than adding a layer:
   a spread-only ring is not elevation, so one-shadow-per-region still holds. It
   costs nothing in hit area either, because shadows never take pointer events.

   The two box-shadow declarations are the fallback, and the order is load-bearing. An
   engine without color-mix() (Safari <16.2, Firefox <113, old WebViews) fails to
   *parse* the second declaration and drops it, so the first one stands and the
   elevation survives without the halo. That matters more than the halo: the
   shadow is what separates these surfaces from the page, and the argument that a
   lavender border is contrast-neutral rests on it.

   Do not fold the ring into a custom property to shorten this. A var() that
   resolves to something unparseable is invalid at computed-value time, which
   resets box-shadow to none instead of falling back to the previous declaration —
   the failure mode gets worse and stops being visible in review. */
.pt-bar,
.pt-nub {
  box-shadow: var(--shadow-md, 0 4px 16px rgba(23, 23, 23, 0.12));
  box-shadow:
    0 0 0 3px color-mix(in oklab, var(--lavender, #C4B8E0) 18%, transparent),
    var(--shadow-md, 0 4px 16px rgba(23, 23, 23, 0.12));
}

/* Stays full height via align-self, so the whole left strip is a grab target and
   not just the 14px icon. touch-action keeps the browser from claiming the
   gesture for scrolling before pointermove sees it. */
.pt-handle {
  display: flex;
  align-items: center;
  align-self: stretch;
  cursor: grab;
  touch-action: none;
  color: var(--ink-faint, var(--ink-muted, #82797D));
}
.pt-handle:active { cursor: grabbing; }
.pt-handle svg { display: block; }

/* The mark takes the full ink role rather than a faint one: it is an identity,
   not a label, and it is small enough not to compete with the controls. The svg
   carries its own height and derives its width from the viewBox — display:block
   only removes the inline baseline gap. */
.pt-mark {
  display: flex;
  align-items: center;
  padding: 0 var(--space-1, 4px);
  color: var(--ink, #171717);
}
.pt-mark svg { display: block; }

.pt-divider {
  width: 1px;
  align-self: stretch;
  margin: var(--space-1, 4px) 0;
  background: var(--hairline, #BABCAE);
}

.pt-btn {
  font: inherit;
  color: var(--ink, #171717);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-xs, 4px);
  padding: var(--space-1, 4px) var(--space-2, 8px);
  cursor: pointer;
  transition:
    background var(--dur-fast, 140ms) var(--ease-out, cubic-bezier(0.2, 0, 0, 1)),
    border-color var(--dur-fast, 140ms) var(--ease-out, cubic-bezier(0.2, 0, 0, 1)),
    color var(--dur-fast, 140ms) var(--ease-out, cubic-bezier(0.2, 0, 0, 1));
}
.pt-btn:hover { background: var(--surface-muted, #F3F2F1); }
.pt-btn:focus-visible {
  outline: 2px solid var(--focus-ring, var(--dusty-mauve, #978E91));
  outline-offset: 1px;
}
.pt-btn[disabled] { opacity: 0.45; cursor: default; }

.pt-btn-tool { display: inline-flex; align-items: center; gap: var(--space-1, 4px); }
.pt-btn-tool[aria-pressed='true'] {
  background: var(--accent-select, var(--dusty-mauve-light, #E9E5E6));
  border-color: var(--dusty-mauve, #978E91);
  color: var(--ink-label, #171717);
}

.pt-btn-notes { display: inline-flex; align-items: center; gap: var(--space-1, 4px); }

/* The two icon-only buttons — hide, on the bar, and reveal, on the nub. Both
   inherit .pt-btn, so hover background, focus ring, radius and timing are the
   bar's and cannot drift; what they add is the tighter padding and the quieter
   ink, declared once for both. They part ways only on layout: hide centres a lone
   glyph, reveal has to sit the badge next to one. */
.pt-btn-hide,
.pt-btn-nub {
  padding: var(--space-1, 4px);
  color: var(--ink-muted, #82797D);
}
.pt-btn-hide:hover,
.pt-btn-nub:hover { color: var(--ink, #171717); }
.pt-btn-hide { display: grid; place-items: center; }
.pt-btn-nub { display: inline-flex; align-items: center; gap: var(--space-1, 4px); }

/* What the bar collapses to. It takes the bar's --shadow-md (declared with the
   bar's, above) because it becomes the only floating thing in the region, and it
   carries the pending count so hiding never buries notes the developer still has to
   copy. It takes the bar's lavender edge and ring for the same reason: collapsed is
   exactly when the developer has to find it again, so this is the worst place to go
   neutral. */
.pt-nub {
  position: fixed;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: var(--space-1, 4px);
  pointer-events: auto;
  color: var(--ink-muted, #82797D);
  background: var(--surface-raised, #FFFFFF);
  border: 1px solid var(--lavender, #C4B8E0);
  border-radius: var(--radius-sm, 8px);
}

.pt-btn-solid {
  background: var(--lavender, #C4B8E0);
  color: var(--carbon-black, #171717);
}
.pt-btn-solid:hover { background: var(--lavender, #C4B8E0); opacity: 0.88; }
.pt-btn-quiet { color: var(--ink-muted, #82797D); }
.pt-btn-icon {
  padding: 0 var(--space-1, 4px);
  font-size: 14px;
  line-height: 1;
  color: var(--ink-muted, #82797D);
}

.pt-badge {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px;
  min-width: var(--space-4, 16px);
  padding: 0 var(--space-1, 4px);
  text-align: center;
  border-radius: var(--radius-pill, 999px);
  background: var(--ink, #171717);
  color: var(--surface-raised, #FFFFFF);
}

.pt-panel {
  position: absolute;
  bottom: calc(100% + var(--space-1, 4px));
  left: 0;
  width: 300px;
  max-height: 320px;
  overflow-y: auto;
  padding: var(--space-2, 8px);
  background: var(--surface-raised, #FFFFFF);
  border: 1px solid var(--hairline, #BABCAE);
  border-radius: var(--radius-sm, 8px);
  box-shadow: var(--shadow-sm, 0 1px 4px rgba(23, 23, 23, 0.08));
}
.pt-panel-empty { margin: 0; line-height: 1.5; color: var(--ink-muted, #82797D); }
/* Sits above the actions and below a hairline: it explains what Copiar leads to,
   so it reads as part of the action rather than as another note in the list. */
.pt-panel-hint {
  margin: var(--space-2, 8px) 0 0;
  padding-top: var(--space-2, 8px);
  border-top: 1px solid var(--hairline, #BABCAE);
  line-height: 1.5;
  color: var(--ink-muted, #82797D);
}
.pt-panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1, 4px);
  margin-top: var(--space-2, 8px);
}

/* minmax(0, 1fr), not the bare auto an implicit column defaults to: auto sizes
   the track to its content's max-content width, and a nowrap anchor's
   max-content width is its full unclamped length — nothing would then stop the
   track from growing past the panel's 300px, which is what actually overflowed
   it. This is the grid equivalent of min-width: 0 on a flex item, and it is what
   lets the overflow/ellipsis further down the tree do anything at all. */
.pt-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-1, 4px); }
.pt-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-1, 4px);
  padding: var(--space-2, 8px);
  background: var(--surface-muted, #F3F2F1);
  border-radius: var(--radius-xs, 4px);
}
.pt-item-body { flex: 1; min-width: 0; }
.pt-item-message { margin: 0; line-height: 1.45; }
.pt-item-anchor {
  margin: var(--space-1, 4px) 0 0;
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted, #82797D);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* One colour for the whole selector: the 2px edge, the tint, and the label tab all
   read as the same mark rather than three decisions. */
.pt-highlight {
  position: fixed;
  pointer-events: none;
  border: 2px solid var(--lavender, #C4B8E0);
  background: color-mix(in oklab, var(--lavender, #C4B8E0) 18%, transparent);
  border-radius: var(--radius-xs, 4px);
}
/* Sits flush on the highlight like a tab: one token for the height, the same
   token negated for the offset. */
.pt-highlight-label {
  position: absolute;
  top: calc(-1 * var(--space-4, 16px));
  left: -2px;
  max-width: 260px;
  padding: 0 var(--space-1, 4px);
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px;
  line-height: var(--space-4, 16px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: var(--radius-xs, 4px) var(--radius-xs, 4px) 0 0;
  background: var(--lavender, #C4B8E0);
  color: var(--carbon-black, #171717);
}

.pt-composer {
  position: fixed;
  pointer-events: auto;
  padding: var(--space-2, 8px);
  background: var(--surface-raised, #FFFFFF);
  border: 1px solid var(--dusty-mauve, #978E91);
  border-radius: var(--radius-sm, 8px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(23, 23, 23, 0.12));
}
.pt-composer-hint {
  margin: 0 0 var(--space-1, 4px);
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-muted, #82797D);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pt-composer-input {
  width: 100%;
  font: inherit;
  line-height: 1.45;
  color: var(--ink, #171717);
  padding: var(--space-1, 4px) var(--space-2, 8px);
  resize: vertical;
  background: var(--surface-inset, #E5E3E2);
  border: 1px solid var(--hairline, #BABCAE);
  border-radius: var(--radius-xs, 4px);
}
.pt-composer-input:focus-visible {
  outline: 2px solid var(--focus-ring, var(--dusty-mauve, #978E91));
  outline-offset: 1px;
}
.pt-composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1, 4px);
  margin-top: var(--space-2, 8px);
}

.pt-toast {
  position: fixed;
  left: 50%;
  bottom: var(--space-5, 24px);
  transform: translateX(-50%);
  pointer-events: none;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  background: var(--ink, #171717);
  color: var(--surface-raised, #FFFFFF);
  border-radius: var(--radius-sm, 8px);
}

/* The two surfaces that enter from a trigger — the only motion here that carries
   information about where something came from. Everything else stays still. */
@keyframes pt-rise {
  from { opacity: 0; transform: translateY(var(--space-1, 4px)); }
  to { opacity: 1; transform: none; }
}
.pt-panel,
.pt-composer {
  animation: pt-rise var(--dur, 280ms) var(--ease-out, cubic-bezier(0.2, 0, 0, 1));
}

@media (prefers-reduced-motion: reduce) {
  .pt-btn { transition: none; }
  .pt-panel,
  .pt-composer { animation: none; }
}
`;
