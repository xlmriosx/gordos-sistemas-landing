/**
 * The landing's CSS, checked where jsdom cannot see it.
 *
 * The stitch design defines its own spacing scale in its own Tailwind config
 * (`theme.extend.spacing`): space-xs .25rem, space-sm .5rem, space-md 1rem,
 * space-lg 1.5rem, space-xl 2.5rem, margin 2.5rem — and two column widths,
 * max-w-7xl (80rem) and max-w-5xl (64rem). Every section of that design
 * wraps its content in ONE flex column with a gap, and that gap is what
 * separates a section's header from the content under it. A header sitting
 * flush against the grid below it is what made this page read as cramped.
 *
 * The language switch has no sample to copy — it is this repo's addition to
 * the design — so its contract is the shape itself: the selected square
 * nests inside the frame that wraps it instead of fighting its curve.
 *
 * WHY THIS READS THE STYLESHEETS INSTEAD OF THE DOM
 * --------------------------------------------------
 * Vitest does not put the app's CSS into jsdom (`css` is off in vite.config.ts
 * and there is no computed style to assert on), and jsdom would not resolve
 * `var()` anyway — and this page puts every value behind a token, on purpose.
 * So the check reads the rules and resolves the tokens itself: the assertion
 * is about the DESIGN's numbers, not about a particular way of writing them.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// jsdom's own `URL` is not the one Node's fs accepts, so the path goes
// through Node's own file-URL reader.
const here = path.dirname(fileURLToPath(import.meta.url));

const landingCss = readFileSync(path.join(here, 'landing.css'), 'utf8');
const sectionsCss = readFileSync(path.join(here, 'landing.sections.css'), 'utf8');

/** The design's own scale. These are the numbers the sample renders with. */
const DESIGN = {
  spaceXs: '0.25rem',
  spaceSm: '0.5rem',
  spaceMd: '1rem',
  spaceLg: '1.5rem',
  spaceXl: '2.5rem',
  contentMax: '80rem',
  contentNarrow: '64rem',
} as const;

const TOKENS = readTokens(landingCss);

function readTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();

  for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(name, value.trim());
  }

  return tokens;
}

/** `var(--landing-space-lg)` becomes the token's own value. */
function resolve(value: string): string {
  return value.replace(/var\((--[\w-]+)\)/g, (whole, name: string) => TOKENS.get(name) ?? whole);
}

/** The declarations of the first rule whose selector list holds `selector`. */
function declarationsOf(css: string, selector: string): Record<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const [, selectors, body] of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const list = selectors.split(',').map((part) => part.trim());
    if (!list.includes(selector)) continue;

    const declarations: Record<string, string> = {};
    for (const [, property, value] of body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
      declarations[property] = resolve(value.trim());
    }

    return declarations;
  }

  return {};
}

describe("the landing's rhythm", () => {
  it('separates every section header from the content under it', () => {
    const container = declarationsOf(landingCss, '.landing-container');

    expect(container.display).toBe('flex');
    expect(container['flex-direction']).toBe('column');
    expect(container.gap).toBe(DESIGN.spaceLg);
    expect(container['max-width']).toBe(DESIGN.contentMax);
  });

  it('gives the pillars the widest gap of the three sections', () => {
    const pillars = declarationsOf(sectionsCss, '.landing-pillars .landing-container');

    expect(pillars.gap).toBe(DESIGN.spaceXl);
  });

  it('keeps the manifesto and the community in the narrow column', () => {
    const manifesto = declarationsOf(sectionsCss, '.landing-manifesto .landing-container');
    const community = declarationsOf(sectionsCss, '.landing-community .landing-container');

    expect(manifesto['max-width']).toBe(DESIGN.contentNarrow);
    expect(community['max-width']).toBe(DESIGN.contentNarrow);
  });

  it('separates a pillar marker from the title below it', () => {
    const head = declarationsOf(sectionsCss, '.landing-pillar__head');

    expect(head['margin-bottom']).toBe(DESIGN.spaceMd);
  });

  it('stacks a section header with the design\'s own quarter-rem', () => {
    const header = declarationsOf(sectionsCss, '.landing-section__header');
    const lead = declarationsOf(sectionsCss, '.landing-section__lead');

    expect(header.gap).toBeUndefined();
    expect(lead['margin-top']).toBe(DESIGN.spaceXs);
  });
});

describe('the language switch', () => {
  it('nests the selected square inside the frame that wraps it', () => {
    const frame = declarationsOf(landingCss, '.landing-lang');
    const option = declarationsOf(landingCss, '.landing-lang__option');

    // Same radius on both: the frame is a stadium and the selected segment
    // is a smaller stadium inside it, with the frame's padding as the gap.
    // A sharp square inside a round frame reads as a chip glued to a pill.
    expect(option['border-radius']).toBe(frame['border-radius']);
    expect(option['border-radius']).toBe('0.75rem');
  });

  it('keeps the selected square filled', () => {
    const selected = declarationsOf(landingCss, ".landing-lang__option[aria-pressed='true']");

    expect(selected.background).toBeDefined();
    expect(selected.color).toBeDefined();
  });
});
