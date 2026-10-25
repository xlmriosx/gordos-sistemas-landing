/**
 * The three scenarios SKILL.md tells a human to check, executed instead of trusted:
 *
 *   A. StrictMode dev — one bar, and it stays.
 *   B. Fast Refresh — one bar, and the replaced tree leaves no window listeners.
 *   C. Nub dragged to the right edge, then revealed — the bar stays in the viewport.
 */
const { setup } = require('./env.cjs');
const env = setup();

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react');

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

// Each require() of a distinct file path is an independent module instance — which is
// what a Fast Refresh module swap looks like from the component's point of view: new
// module-scope variables, same DOM underneath.
const loadFreshCopy = (n) => require(`./bundle${n}.cjs`).default;

(async () => {
  const baseline = env.windowListeners();

  // ── A. StrictMode ──────────────────────────────────────────────────────────
  const PointerToolbar = loadFreshCopy(1);
  const root1 = appRoot();
  await act(async () => {
    root1.render(React.createElement(React.StrictMode, null, React.createElement(PointerToolbar)));
  });
  await tick();

  check('A. StrictMode: exactly one host after the double-invoke settles', env.hosts() === 1, `hosts=${env.hosts()}`);
  const barsVisible = document.querySelectorAll('#app-pointer-toolbar').length;
  check('A. the host survives (no self-destruct)', barsVisible === 1 && document.getElementById('app-pointer-toolbar') !== null, `found=${barsVisible}`);

  const afterMount = env.windowListeners();

  // ── B. Fast Refresh ────────────────────────────────────────────────────────
  // The old module keeps rendering; a second, independent copy mounts while the old
  // host is still in the DOM. That is exactly the state the orphan branch handles.
  const Fresh = loadFreshCopy(2);
  const root2 = appRoot();
  await act(async () => {
    root2.render(React.createElement(Fresh));
  });
  await tick();

  check('B. Fast Refresh: still exactly one host', env.hosts() === 1, `hosts=${env.hosts()}`);
  check(
    'B. the orphan warning fired exactly once',
    env.warnings.filter((w) => w.includes('orphaned host')).length === 1,
    `warnings=${JSON.stringify(env.warnings.map((w) => w.slice(0, 60)))}`,
  );
  const afterRefresh = env.windowListeners();

  // A second reload, because the count per reload is what SKILL.md tells a human to
  // judge by. One warning each is what this design produces — the old cleanup defers
  // its removal, the new effect runs synchronously after it and finds the host still
  // there — so "a warning on every reload" is correct behaviour and must not be
  // written up as a symptom. More than one per reload is the real symptom.
  const Third = loadFreshCopy(3);
  const root3 = appRoot();
  await act(async () => { root3.render(React.createElement(Third)); });
  await tick();
  check(
    'B. a second reload warns once more — one per reload, not one ever',
    env.warnings.filter((w) => w.includes('orphaned host')).length === 2,
    `orphan warnings after two reloads=${env.warnings.filter((w) => w.includes('orphaned host')).length}`,
  );
  check('B. and still exactly one host after two reloads', env.hosts() === 1, `hosts=${env.hosts()}`);
  check(
    'B. two reloads do not accumulate window listeners',
    env.windowListeners() <= afterMount,
    `afterMount=${afterMount} now=${env.windowListeners()} -> ${env.listenerDetail().join(', ')}`,
  );
  check(
    'B. the replaced tree left no window listeners behind',
    afterRefresh <= afterMount,
    `baseline=${baseline} afterMount=${afterMount} afterRefresh=${afterRefresh}\n        live: ${env.listenerDetail().join(', ')}`,
  );

  // ── C. clamp across the collapse boundary ──────────────────────────────────
  const host = document.getElementById('app-pointer-toolbar');
  const shadow = host.shadowRoot;
  const q = (sel) => shadow.querySelector(sel);
  const byLabel = (label) => [...shadow.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === label);

  const fire = (el, type, init = {}) => {
    const ev = new window.MouseEvent(type, { bubbles: true, cancelable: true, ...init });
    el.dispatchEvent(ev);
  };

  // Collapse.
  await act(async () => { fire(byLabel('Ocultar la barra'), 'click'); });
  await tick();
  const nub = q('.pt-nub');
  check('C. collapsing yields a nub with a grip inside it', !!nub && !!nub.querySelector('.pt-handle'), nub ? 'nub+grip present' : 'no nub');

  // Drag the nub as far right as it will go.
  await act(async () => {
    fire(nub.querySelector('.pt-handle'), 'pointerdown', { clientX: 100, clientY: 100 });
  });
  await act(async () => {
    const ev = new window.MouseEvent('pointermove', { bubbles: true, clientX: 5000, clientY: 5000 });
    window.dispatchEvent(ev);
  });
  await act(async () => {
    window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true }));
  });
  await tick();

  const nubX = parseFloat(q('.pt-nub').style.left);
  const nubY = parseFloat(q('.pt-nub').style.top);
  check(
    'C. the nub itself clamps to its own width, not the bar\'s',
    nubX > 1280 - 300 && nubX <= 1280 - 50 - 8,
    `nub x=${nubX} (a bar-sized clamp would have stopped at ${1280 - 200}; nub-sized max is ${1280 - 50 - 8})`,
  );

  // Reveal: the surface grows ~250px. This is the regression.
  await act(async () => { fire(byLabel('Mostrar la barra'), 'click'); });
  await tick();

  const bar = q('.pt-bar');
  const barX = parseFloat(bar.style.left);
  const barY = parseFloat(bar.style.top);
  check(
    'C. the revealed bar is fully inside the viewport',
    barX + 300 <= 1280 && barY + 40 <= 800,
    `bar x=${barX} (right edge ${barX + 300} vs viewport 1280), y=${barY} (bottom ${barY + 40} vs 800); came from nub x=${nubX}, y=${nubY}`,
  );

  // ── teardown ───────────────────────────────────────────────────────────────
  await act(async () => { root1.unmount(); root2.unmount(); root3.unmount(); });
  await tick();
  check('D. unmounting removes the host', env.hosts() === 0, `hosts=${env.hosts()}`);
  check(
    'D. unmounting leaves no window listeners',
    env.windowListeners() <= baseline,
    `baseline=${baseline} now=${env.windowListeners()}\n        live: ${env.listenerDetail().join(', ')}`,
  );

  env.restoreWarn();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  env.restoreWarn();
  console.error('harness error:', err);
  process.exit(2);
});
