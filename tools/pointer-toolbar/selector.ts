/**
 * Element anchoring for the pointer toolbar.
 *
 * Produces a selector stable enough that the agent can locate the element in
 * source, not just on screen. Best-effort by design: precedence is
 * id > data-* > class chain with nth-of-type.
 */

export type ElementRef = {
  /** CSS selector, most stable form available. */
  selector: string;
  /** Visible text, collapsed and capped. The human-readable anchor. */
  text: string;
  /** Viewport box: [x, y, width, height], rounded. */
  box: [number, number, number, number];
};

const MAX_TEXT = 80;
const MAX_DEPTH = 6;
const MAX_CLASSES = 2;

/** Generated class names (emotion, styled-components) are not stable anchors. */
const VOLATILE_CLASS = /^(css-|sc-|jsx-|emotion-)/;

function quote(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeIdent(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/([^\w-])/g, '\\$1');
}

function isUnique(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

/** A selector that identifies the element on its own, if one exists. */
function standaloneSelector(el: Element): string | null {
  const id = el.getAttribute('id');
  if (id) {
    const selector = `#${escapeIdent(id)}`;
    if (isUnique(selector)) return selector;
  }

  const tag = el.tagName.toLowerCase();
  for (const attr of Array.from(el.attributes)) {
    if (!attr.name.startsWith('data-') || !attr.value) continue;
    const selector = `${tag}[${attr.name}="${quote(attr.value)}"]`;
    if (isUnique(selector)) return selector;
  }

  return null;
}

/** One path segment: tag, up to two stable classes, positional index if needed. */
function segment(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList)
    .filter((c) => c.length < 40 && !VOLATILE_CLASS.test(c))
    .slice(0, MAX_CLASSES)
    .map((c) => `.${escapeIdent(c)}`)
    .join('');

  const parent = el.parentElement;
  if (!parent) return tag + classes;

  const sameTag = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
  if (sameTag.length === 1) return tag + classes;

  return `${tag}${classes}:nth-of-type(${sameTag.indexOf(el) + 1})`;
}

export function buildSelector(el: Element): string {
  const standalone = standaloneSelector(el);
  if (standalone) return standalone;

  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;

  while (node && node !== document.body && depth < MAX_DEPTH) {
    parts.unshift(segment(node));

    const path = parts.join(' > ');
    if (isUnique(path)) return path;

    // Anchoring to a stable ancestor beats walking all the way to body.
    const parent: Element | null = node.parentElement;
    if (parent && parent !== document.body) {
      const anchor = standaloneSelector(parent);
      if (anchor) {
        const anchored = `${anchor} > ${path}`;
        if (isUnique(anchored)) return anchored;
      }
    }

    node = parent;
    depth += 1;
  }

  return parts.join(' > ');
}

export function describe(el: Element): ElementRef {
  const rect = el.getBoundingClientRect();
  return {
    selector: buildSelector(el),
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT),
    box: [
      Math.round(rect.left),
      Math.round(rect.top),
      Math.round(rect.width),
      Math.round(rect.height),
    ],
  };
}

/**
 * `Node.contains()` does not cross a shadow boundary — it only walks the plain
 * DOM tree, so a shadow host never "contains" its own shadow-root children by
 * that check. The toolbar's host uses `mode: 'open'`, which means
 * `document.elementsFromPoint` pierces straight into it and returns its real
 * buttons, not the host div standing in for them. Without this, a click on the
 * toolbar's own subtree would pass the ignore check and get picked as a target.
 */
function isIgnored(node: Element, el: Element): boolean {
  if (node === el || node.contains(el)) return true;
  const shadow = (node as HTMLElement).shadowRoot;
  return shadow ? shadow.contains(el) : false;
}

/**
 * Topmost meaningful element at a point, skipping the toolbar's own subtree.
 * `ignore` holds the shadow host.
 */
export function elementAtPoint(x: number, y: number, ignore: Element[]): Element | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (el === document.documentElement || el === document.body) continue;
    if (ignore.some((node) => isIgnored(node, el))) continue;
    return el;
  }
  return null;
}
