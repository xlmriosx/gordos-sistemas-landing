/**
 * Product behaviour, as opposed to lifecycle:
 *   E. two <PointerToolbar /> in one tree must warn rather than fight silently.
 *   F. the empty-panel instruction must retire — but never in front of the person
 *      who is reading it.
 *   G. annotating end to end, and the bar re-clamping when its badge widens it.
 */
const { setup } = require('./env.cjs');
const env = setup();

// Long timers compressed so a ten-second product decision is testable in ms. Only
// the hint uses a delay this long; the lifecycle timers are all 0ms.
const realSetTimeout = global.setTimeout;
global.setTimeout = (fn, ms, ...rest) => realSetTimeout(fn, ms >= 1000 ? 15 : ms, ...rest);

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react');

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
};
const tick = async (ms = 40) => { await act(async () => { await new Promise((r) => realSetTimeout(r, ms)); }); };
const appRoot = () => { const el = document.createElement('div'); document.body.appendChild(el); return createRoot(el); };
const fire = (el, type, init = {}) => el.dispatchEvent(new window.MouseEvent(type, { bubbles: true, cancelable: true, ...init }));

(async () => {
  const PointerToolbar = require('./bundle1.cjs').default;

  // ── E. two instances ───────────────────────────────────────────────────────
  const rootE = appRoot();
  await act(async () => {
    rootE.render(React.createElement('div', null, React.createElement(PointerToolbar), React.createElement(PointerToolbar)));
  });
  await tick();

  const second = env.warnings.filter((w) => w.includes('a second bar is mounted'));
  check('E. mounting two bars warns instead of failing silently', second.length === 1, `matching warnings=${second.length}`);
  check('E. and there is still only one host', env.hosts() === 1, `hosts=${env.hosts()}`);

  await act(async () => { rootE.unmount(); });
  await tick();
  env.warnings.length = 0;

  // ── F. the hint retires, but not mid-read ──────────────────────────────────
  const rootF = appRoot();
  await act(async () => { rootF.render(React.createElement(PointerToolbar)); });
  await tick();

  let shadow = document.getElementById('app-pointer-toolbar').shadowRoot;
  const notas = () => [...shadow.querySelectorAll('button')].find((b) => b.textContent.includes('Notas'));
  const emptyText = () => shadow.querySelector('.pt-panel-empty')?.textContent?.trim() ?? '';

  await act(async () => { fire(notas(), 'click'); });
  check('F. the instruction is there on first open', emptyText().startsWith('Toca Señalar'), `text="${emptyText().slice(0, 44)}"`);

  await tick(60); // well past the (compressed) ten seconds
  check(
    'F. it does NOT swap while the panel is open — nothing is taken from a reader',
    emptyText().startsWith('Toca Señalar'),
    `text="${emptyText().slice(0, 44)}"`,
  );

  await act(async () => { fire(notas(), 'click'); });   // close
  await act(async () => { fire(notas(), 'click'); });   // reopen
  await tick();
  check('F. it is retired on the next open', emptyText() === 'Todavía no marcaste nada.', `text="${emptyText()}"`);
  check('F. and the panel is never left blank', emptyText().length > 0, `text="${emptyText()}"`);

  await act(async () => { fire(notas(), 'click'); });
  await tick();

  // ── G. annotate end to end, then check the badge re-clamps the bar ─────────
  // Park the bar at the right edge first, where the extra badge width is fatal.
  const bar = () => shadow.querySelector('.pt-bar');
  await act(async () => { fire(bar().querySelector('.pt-handle'), 'pointerdown', { clientX: 100, clientY: 100 }); });
  await act(async () => { window.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientX: 5000, clientY: 400 })); });
  await act(async () => { window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true })); });
  await tick();

  const xBefore = parseFloat(bar().style.left);
  const widthBefore = bar().getBoundingClientRect().width;
  check(
    'G. the bar parks flush against the right edge',
    Math.abs(xBefore + widthBefore - (1280 - 8)) < 1,
    `x=${xBefore} width=${widthBefore} right=${xBefore + widthBefore} (target ${1280 - 8})`,
  );

  // Señalar → click a target in the app → Composer → save.
  const senalar = [...shadow.querySelectorAll('button')].find((b) => b.textContent.includes('Señalar'));
  await act(async () => { fire(senalar, 'click'); });

  const target = document.createElement('button');
  target.textContent = 'Guardar cambios';
  document.body.appendChild(target);
  window.__hit = target; // what the stubbed hit test should report under the cursor
  await act(async () => { fire(target, 'click', { clientX: 400, clientY: 300 }); });
  await tick();

  const textarea = shadow.querySelector('textarea');
  check('G. picking a target opens the composer', !!textarea, textarea ? 'textarea present' : 'no composer');

  if (textarea) {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, 'Este botón tendría que decir Publicar');
      textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    const save = [...shadow.querySelectorAll('button')].find((b) => b.classList.contains('pt-btn-solid'));
    await act(async () => { fire(save, 'click'); });
    await tick();
  }

  const badge = shadow.querySelector('.pt-bar .pt-badge');
  check('G. the annotation lands and the bar grows a badge', !!badge, badge ? `badge="${badge.textContent}"` : 'no badge');

  const xAfter = parseFloat(bar().style.left);
  const widthAfter = bar().getBoundingClientRect().width;
  check(
    'G. widening for the badge re-clamps instead of overflowing',
    xAfter + widthAfter <= 1280,
    `width ${widthBefore}->${widthAfter}, x ${xBefore}->${xAfter}, right edge ${xAfter + widthAfter} vs viewport 1280`,
  );

  await act(async () => { rootF.unmount(); });
  await tick();

  env.restoreWarn();
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => { env.restoreWarn(); console.error('harness error:', err); process.exit(2); });
