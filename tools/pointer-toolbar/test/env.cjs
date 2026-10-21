/**
 * jsdom + the two things jsdom does not give us and this component depends on:
 * layout (getBoundingClientRect is all zeros) and a count of window listeners.
 */
const { JSDOM } = require('jsdom');

function setup() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost:5173/',
  });

  const { window } = dom;
  window.innerWidth = 1280;
  window.innerHeight = 800;

  /**
   * Sizes per surface. The bar and the nub have to differ by ~250px or the clamp
   * scenario proves nothing, and the bar has to *grow with its badge* or the quiet
   * version of the same bug — the bar widening without `hidden` changing — is
   * invisible here. Both numbers stand in for real layout, which jsdom does not do.
   */
  const SIZES = { 'pt-bar': [300, 40], 'pt-nub': [50, 30] };
  const BADGE_PX = 20;
  window.Element.prototype.getBoundingClientRect = function () {
    for (const [cls, [baseWidth, height]] of Object.entries(SIZES)) {
      if (this.classList?.contains(cls)) {
        const left = parseFloat(this.style.left) || 0;
        const top = parseFloat(this.style.top) || 0;
        const width = baseWidth + (this.querySelector?.('.pt-badge') ? BADGE_PX : 0);
        return { width, height, left, top, right: left + width, bottom: top + height, x: left, y: top };
      }
    }
    return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0, x: 0, y: 0 };
  };
  window.__BADGE_PX = BADGE_PX;

  /**
   * jsdom has no hit testing either, so `document.elementsFromPoint` is missing
   * outright and the Picker throws on the first click. The stand-in returns the
   * element the scenario nominates plus its ancestors — same shape the real one
   * returns (topmost first), which is what `elementAtPoint` walks to skip the
   * toolbar's own subtree.
   */
  window.document.elementsFromPoint = () => {
    const stack = [];
    for (let el = window.__hit ?? null; el; el = el.parentElement) stack.push(el);
    return stack;
  };

  // Listener census. This is how the orphaned-tree leak becomes measurable instead
  // of arguable: a tree that was unmounted properly leaves zero behind.
  const live = new Map();
  const key = (type, fn, opts) => `${type}|${fn.name || 'anon'}|${JSON.stringify(opts) ?? ''}|${fn.toString().length}`;
  const origAdd = window.addEventListener.bind(window);
  const origRemove = window.removeEventListener.bind(window);
  window.addEventListener = (type, fn, opts) => {
    const k = key(type, fn, opts);
    live.set(k, (live.get(k) ?? 0) + 1);
    return origAdd(type, fn, opts);
  };
  window.removeEventListener = (type, fn, opts) => {
    const k = key(type, fn, opts);
    const n = (live.get(k) ?? 0) - 1;
    if (n <= 0) live.delete(k);
    else live.set(k, n);
    return origRemove(type, fn, opts);
  };

  // MutationObserver and CustomEvent are jsdom's own, added when the toolbar
  // grew its DOM contract with tools/session-bar/: it watches the root element
  // for the dock attribute, and the dock drives it with CustomEvents.
  for (const k of ['window', 'document', 'navigator', 'Element', 'HTMLElement', 'Node', 'Event', 'CustomEvent', 'MouseEvent', 'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
    global[k] = window[k];
  }
  global.IS_REACT_ACT_ENVIRONMENT = true;

  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => { warnings.push(args.join(' ')); };

  return {
    window,
    warnings,
    restoreWarn: () => { console.warn = origWarn; },
    windowListeners: () => [...live.values()].reduce((a, b) => a + b, 0),
    listenerDetail: () => [...live.entries()].map(([k, n]) => `${n}× ${k.split('|')[0]}`),
    hosts: () => window.document.querySelectorAll('#app-pointer-toolbar').length,
  };
}

module.exports = { setup };
