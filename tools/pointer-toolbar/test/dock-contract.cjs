/**
 * The DOM contract with tools/session-bar/, executed instead of trusted.
 *
 * The two bars share no code on purpose: importing each other would trip the
 * package-boundary signal. What they share is attributes on the root element and
 * two events on `window`. That kind of contract is exactly the kind nothing
 * catches when it breaks: rename an attribute on one side and the other still
 * compiles, still lints, still typechecks, and silently does nothing. The first
 * person to notice is a developer who closed the bar and cannot get it back.
 *
 * So these scenarios never import the session bar. They play its half by hand,
 * which is also the check that the contract really is all this component depends
 * on:
 *
 *   A. No dock — the closed bar draws its own marker, which is the only way back.
 *      This is the case for every app cloned before the session bar existed.
 *   B. Dock present — the closed bar draws NO marker. Two controls for one action,
 *      one of them over the app, is worse than the one in the dock.
 *   C. The dock's events drive both directions, and `:hide` drops the active tool.
 *   D. The state attribute reflects both values and is REMOVED on unmount. Left
 *      behind it advertises a bar that is not there, and a dock would draw a
 *      control pointing at nothing.
 */
const { setup } = require('./env.cjs');
const env = setup();

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react');

const STATE_ATTR = 'data-app-pointer-toolbar';
const DOCK_ATTR = 'data-app-session-bar';
const SHOW_EVENT = 'app:pointer-toolbar:show';
const HIDE_EVENT = 'app:pointer-toolbar:hide';

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};

const tick = async (ms = 20) => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
};

const appRoot = () => {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return createRoot(el);
};

const loadFreshCopy = (n) => require(`./bundle${n}.cjs`).default;

const shadow = () => {
  const host = document.getElementById('app-pointer-toolbar');
  return host && host.shadowRoot;
};
const has = (selector) => {
  const root = shadow();
  return !!(root && root.querySelector(selector));
};

/**
 * The session bar's half, played by hand. Never imported.
 *
 * Wrapped in act() because the component watches the dock attribute with a
 * MutationObserver, so touching it schedules a state update: outside act() React
 * warns, and the warning would be the harness's noise rather than a finding.
 */
const mountDock = async () => {
  await act(async () => {
    document.documentElement.setAttribute(DOCK_ATTR, '');
  });
};
const removeDock = () => document.documentElement.removeAttribute(DOCK_ATTR);
const dockSays = async (event) => {
  await act(async () => {
    window.dispatchEvent(new window.CustomEvent(event, { bubbles: true }));
  });
};

/** A real click on a real control, inside act() so the state update it causes is
 *  the harness's business and not React's complaint. */
const clickInBar = async (selector) => {
  await act(async () => {
    shadow().querySelector(selector).dispatchEvent(
      new window.MouseEvent('click', { bubbles: true }),
    );
  });
  await tick();
};

const hide = () => clickInBar('.pt-btn-hide');

(async () => {
  // ── A. No dock: the marker is the way back ─────────────────────────────────
  removeDock();
  const PointerToolbar = loadFreshCopy(1);
  const root = appRoot();
  await act(async () => {
    root.render(React.createElement(PointerToolbar));
  });
  await tick();

  check('A. open, and the state attribute says so',
    document.documentElement.getAttribute(STATE_ATTR) === 'open',
    `attr=${document.documentElement.getAttribute(STATE_ATTR)}`);

  await hide();
  check('A. closed with no dock, the marker is drawn', has('.pt-nub'));
  check('A. and the attribute reflects it',
    document.documentElement.getAttribute(STATE_ATTR) === 'dismissed',
    `attr=${document.documentElement.getAttribute(STATE_ATTR)}`);

  // ── B. Dock appears: the marker goes away ──────────────────────────────────
  // Watched rather than read once, so this has to take effect without a remount.
  await mountDock();
  await tick();
  check('B. a dock appearing removes the floating marker', !has('.pt-nub'));
  check('B. and the bar is still closed, not reopened by accident', !has('.pt-bar'));

  // ── C. The dock drives both directions ─────────────────────────────────────
  await dockSays(SHOW_EVENT);
  await tick();
  check('C. the dock reopens it', has('.pt-bar'));
  check('C. and the attribute follows',
    document.documentElement.getAttribute(STATE_ATTR) === 'open');

  // arm a tool, so the next close has something to drop
  await clickInBar('.pt-btn-tool');
  const armed = shadow().querySelector('.pt-btn-tool').getAttribute('aria-pressed') === 'true';
  check('C. a tool can be armed first', armed);

  await dockSays(HIDE_EVENT);
  await tick();
  check('C. the dock closes it', !has('.pt-bar'));
  check('C. and no marker appears, because the dock owns the way back', !has('.pt-nub'));

  await dockSays(SHOW_EVENT);
  await tick();
  const stillArmed =
    shadow().querySelector('.pt-btn-tool').getAttribute('aria-pressed') === 'true';
  check('C. closing from the dock dropped the active tool',
    !stillArmed,
    'a picker left armed under a closed bar would take clicks nobody can see');

  // ── D. Unmount leaves nothing behind ───────────────────────────────────────
  await act(async () => {
    root.unmount();
  });
  await tick(40);
  check('D. the state attribute is removed on unmount',
    !document.documentElement.hasAttribute(STATE_ATTR),
    `attr=${document.documentElement.getAttribute(STATE_ATTR)}`);

  removeDock();

  env.restoreWarn();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
