/**
 * The ordering a real Fast Refresh produces, which neither review exercised:
 * the NEW module mounts first, and the OLD tree unmounts afterwards.
 *
 * The old module's cleanup still holds its own { host, root } and schedules a
 * deferred removal for it. By then the new module has already taken that host over
 * (or replaced it). Two independent module instances now both believe they are
 * responsible for tearing down the same root.
 */
const { setup } = require('./env.cjs');
const env = setup();

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react');

const errors = [];
const origError = console.error;
console.error = (...args) => { errors.push(args.join(' ')); };

const tick = async (ms = 20) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };
const appRoot = () => { const el = document.createElement('div'); document.body.appendChild(el); return createRoot(el); };

(async () => {
  const A = require('./bundle1.cjs').default;
  const B = require('./bundle2.cjs').default;

  const rootA = appRoot();
  await act(async () => { rootA.render(React.createElement(A)); });
  await tick();
  const hostAfterA = document.getElementById('app-pointer-toolbar');
  const listenersAfterA = env.windowListeners();

  // New module mounts while the old tree is still up — the real hot-reload order.
  const rootB = appRoot();
  await act(async () => { rootB.render(React.createElement(B)); });
  // ...and only then does the old tree go away. No tick in between: both the old
  // cleanup and the new mount land before timers flush, which is the race.
  await act(async () => { rootA.unmount(); });
  await tick(50);

  const hosts = document.querySelectorAll('#app-pointer-toolbar').length;
  const hostNow = document.getElementById('app-pointer-toolbar');

  console.log(`hosts after the swap: ${hosts}`);
  console.log(`the surviving host is the new one: ${hostNow !== null && hostNow !== hostAfterA}`);
  console.log(`window listeners: afterA=${listenersAfterA} now=${env.windowListeners()} -> ${env.listenerDetail().join(', ') || 'none'}`);
  console.log(`React errors logged: ${errors.length}`);
  for (const e of errors) console.log(`   ! ${e.slice(0, 160)}`);

  // The bar the developer is left looking at must still be alive: a surviving host
  // whose root was unmounted underneath it is an empty shell, which is the worst
  // outcome — it looks installed and does nothing.
  const shadowHasUI = !!hostNow?.shadowRoot?.querySelector('.pt-bar, .pt-nub');
  console.log(`the surviving host still renders its UI: ${shadowHasUI}`);

  console.error = origError;
  const ok = hosts === 1 && shadowHasUI && errors.length === 0;
  console.log(`\n${ok ? 'PASS' : 'FAIL'} — hot-reload ordering`);
  process.exit(ok ? 0 : 1);
})().catch((err) => { console.error = origError; console.error('harness error:', err); process.exit(2); });
