import { useEffect, useState } from 'react';

/**
 * Chart theming: the bridge between the CSS token layer and Recharts, which
 * needs literal color strings (it writes them into SVG attributes, where
 * `var(--chart-1)` would not resolve for gradients, or for canvas export).
 *
 * Everything here READS the tokens in colors_and_type.css — it never defines a
 * color. Flip the theme and the hook re-reads, so charts follow light/dark like
 * the rest of the system.
 */

export const SERIES_SLOTS = 6;

/** Semantic colors a series may name instead of taking a categorical slot. */
export type StatusColor = 'ok' | 'warning' | 'critical' | 'info';

/** Resolved literal colors, read from the CSS token layer. */
export interface ChartPalette {
  series: string[];
  sequential: string[];
  diverging: string[];
  surface: string;
  grid: string;
  axis: string;
  label: string;
  emphasis: string;
  recede: string;
  status: Record<StatusColor, string>;
}

/**
 * One plotted series. `key` indexes the datum, `label` names it in the legend
 * and tooltip, and `slot`/`color` pin its identity — see `seriesColor`.
 */
export interface ChartSeries<D extends ChartDatum = ChartDatum> {
  /** A field of the bound datum. Mistyping it is a compile error. */
  key: Extract<keyof D, string>;
  label: string;
  /** Categorical slot index. Defaults to the series' position in the array. */
  slot?: number;
  /** A status name, `'emphasis'`, `'recede'`, or a literal color. */
  color?: StatusColor | 'emphasis' | 'recede' | (string & {});
}

/** A row of chart data: the x value plus one numeric field per series key. */
export type ChartDatum = Record<string, string | number | null | undefined>;

export interface NumberFormatOptions {
  currency?: string;
  unit?: string;
  decimals?: number;
}

export type ValueFormatter = (value: number | null | undefined) => string;

const TOKEN_NAMES = {
  series: Array.from({ length: SERIES_SLOTS }, (_, i) => `--chart-${i + 1}`),
  sequential: ['--chart-seq-1', '--chart-seq-2', '--chart-seq-3', '--chart-seq-4', '--chart-seq-5'],
  diverging: [
    '--chart-div-1', '--chart-div-2', '--chart-div-3', '--chart-div-4',
    '--chart-div-5', '--chart-div-6', '--chart-div-7',
  ],
  surface: '--chart-surface',
  grid: '--chart-grid',
  axis: '--chart-axis',
  label: '--chart-label',
  emphasis: '--chart-emphasis',
  recede: '--chart-recede',
  /* The mid semantic steps, not the bright `-bar` fills: a neon green beside
     these quiet series would read as an alarm going off. */
  ok: '--semantic-success',
  warning: '--semantic-caution',
  critical: '--semantic-danger',
  info: '--status-info',
};

/* Fallbacks for SSR / first paint before the stylesheet resolves. */
const FALLBACK: ChartPalette = {
  series: ['#B2D4DB', '#82797D', '#C4B8E0', '#BABCAE', '#978E91', '#A7A89A'],
  sequential: ['#B2D4DB', '#8cb4bd', '#6897a0', '#487983', '#305b64'],
  diverging: ['#305b64', '#6897a0', '#B2D4DB', '#D8D8D2', '#C6B6BA', '#977581', '#6b4a57'],
  surface: '#FFFFFF',
  grid: 'rgba(23,23,23,0.14)',
  axis: 'rgba(23,23,23,0.24)',
  label: '#6B6568',
  emphasis: '#171717',
  recede: '#C6C4C0',
  status: {
    ok: '#15803D',
    warning: '#A16207',
    critical: '#B91C1C',
    info: '#356670',
  },
};

function readToken(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const value = styles.getPropertyValue(name).trim();
  return value || fallback;
}

function readPalette(): ChartPalette {
  if (typeof window === 'undefined') return FALLBACK;
  const styles = window.getComputedStyle(document.documentElement);
  return {
    series: TOKEN_NAMES.series.map((n, i) => readToken(styles, n, FALLBACK.series[i])),
    sequential: TOKEN_NAMES.sequential.map((n, i) => readToken(styles, n, FALLBACK.sequential[i])),
    diverging: TOKEN_NAMES.diverging.map((n, i) => readToken(styles, n, FALLBACK.diverging[i])),
    surface: readToken(styles, TOKEN_NAMES.surface, FALLBACK.surface),
    grid: readToken(styles, TOKEN_NAMES.grid, FALLBACK.grid),
    axis: readToken(styles, TOKEN_NAMES.axis, FALLBACK.axis),
    label: readToken(styles, TOKEN_NAMES.label, FALLBACK.label),
    emphasis: readToken(styles, TOKEN_NAMES.emphasis, FALLBACK.emphasis),
    recede: readToken(styles, TOKEN_NAMES.recede, FALLBACK.recede),
    status: {
      ok: readToken(styles, TOKEN_NAMES.ok, FALLBACK.status.ok),
      warning: readToken(styles, TOKEN_NAMES.warning, FALLBACK.status.warning),
      critical: readToken(styles, TOKEN_NAMES.critical, FALLBACK.status.critical),
      info: readToken(styles, TOKEN_NAMES.info, FALLBACK.status.info),
    },
  };
}

/**
 * Live chart palette. Re-reads whenever `data-theme` changes on <html>, so it
 * tracks the shared ThemeToggle without importing it.
 */
export function useChartPalette(): ChartPalette {
  const [palette, setPalette] = useState(readPalette);

  useEffect(() => {
    const update = () => setPalette(readPalette());
    update(); // first paint may precede the stylesheet
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return palette;
}

/** True while the user asks for reduced motion; charts then skip their reveal. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * Resolve a series descriptor to its color.
 *
 * Color follows the ENTITY, not its rank: the slot comes from the series'
 * declared `slot` (or its index in the array), so filtering a series out never
 * repaints the survivors. `color` accepts a status name ('ok' | 'warning' |
 * 'critical' | 'info'), 'emphasis', 'recede', or a literal.
 *
 * Status names are for a series that MEANS good/bad — never as "series 5", and
 * never for three touching states at once: green/amber/red collapse to ΔE 4
 * under protanopia, so a good/warning/bad stack is unreadable for a dichromat
 * reader. One status series against neutral ones is the safe shape; for a
 * three-way split use categorical slots and put the state in the label.
 */
export function seriesColor<D extends ChartDatum>(
  series: ChartSeries<D> | undefined,
  index: number,
  palette: ChartPalette,
): string {
  const named = series?.color;
  if (named) {
    if (named in palette.status) return palette.status[named as StatusColor];
    if (named === 'emphasis') return palette.emphasis;
    if (named === 'recede') return palette.recede;
    return named;
  }
  const declaredSlot = series?.slot;
  const slot = Number.isInteger(declaredSlot) ? (declaredSlot as number) : index;
  return palette.series[slot % SERIES_SLOTS];
}

/* ---- Series-count guard --------------------------------------------------
   The palette is six literal brandbook tokens, and three of them are pastels
   inside a 0.06 lightness band. Up to three series the order keeps the worst
   neighbour pair at 22 ΔE; the fourth necessarily puts two pastels together
   and it drops to 6.7 — the 6–8 floor band, which is legal only alongside the
   legend, direct labels and the table view. Those all ship by default, so
   this is a nudge to check the chart still reads, not an error. */

const warned = new Set();

export function warnOnSeriesCount(count: number, label = 'chart'): void {
  if (!import.meta.env?.DEV || count < 4 || warned.has(label)) return;
  warned.add(label);
  console.warn(
    `[charts] ${label}: ${count} series on the brand palette. Past three, the worst pair `
    + 'drops to 6.7 ΔE (two pastels end up adjacent) — keep the legend, add direct labels, '
    + 'or fold the tail into "Other".',
  );
}

/* ---- Mark weight ---------------------------------------------------------
   The brandbook pastels sit at 1.6–1.9:1 against white — and since the series
   slots are the literal tokens, that is a given, not something to fix in the
   palette. A 2px line at that
   contrast disappears; the same color as a large fill is fine. So the stroke
   weight is computed from the mark's own contrast against the chart surface
   rather than fixed — thin marks get the compensation, fills never need it. */

const RELATIVE_LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722];

function relativeLuminance(hex: string): number {
  const clean = hex.trim().replace(/^#/, '');
  if (clean.length !== 6) return 0;
  return [0, 2, 4]
    .map((i) => parseInt(clean.slice(i, i + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, i) => sum + channel * RELATIVE_LUMINANCE_WEIGHTS[i], 0);
}

/** WCAG contrast ratio between two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Stroke width for a line/marker of this color on this surface. */
export function markWeight(color: string, surface: string): number {
  if (!color?.startsWith?.('#') || !surface?.startsWith?.('#')) return CHART_MARK.lineWidth;
  return contrastRatio(color, surface) < 3 ? CHART_MARK.lineWidthLow : CHART_MARK.lineWidth;
}

/* ---- Number formatting ---------------------------------------------------
   Compact for axis ticks and stat values; full precision in tooltips and the
   table view, so a rounded axis never hides the real number.               */

export function formatCompact(value: number | null | undefined, { currency, unit }: NumberFormatOptions = {}): string {
  if (value == null || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  const scaled =
    abs >= 1_000_000 ? `${trim(value / 1_000_000)}M`
      : abs >= 1_000 ? `${trim(value / 1_000)}K`
        : trim(value);
  return `${currency ?? ''}${scaled}${unit ?? ''}`;
}

export function formatNumber(value: number | null | undefined, { currency, unit, decimals }: NumberFormatOptions = {}): string {
  if (value == null || Number.isNaN(value)) return '—';
  const body = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? (Number.isInteger(value) ? 0 : 1),
  });
  return `${currency ?? ''}${body}${unit ?? ''}`;
}

export function formatPercent(value: number | null | undefined, { decimals = 0 }: NumberFormatOptions = {}): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

function trim(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/* ---- Shared Recharts chrome ---------------------------------------------
   One place for the mark specs the design system fixes: hairline solid grid,
   recessive mono axis labels, no axis line, 2px strokes.                   */

export const AXIS_TICK_STYLE = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.04em',
  fontVariantNumeric: 'tabular-nums',
};

export function axisProps(palette: ChartPalette) {
  return {
    stroke: palette.axis,
    tick: { ...AXIS_TICK_STYLE, fill: palette.label },
    tickLine: false,
    axisLine: false,
  };
}

export const CHART_MARK = {
  lineWidth: 2,
  /** Below 3:1 against the surface a 2px line disappears — see markWeight(). */
  lineWidthLow: 3,
  dotRadius: 4,
  barSize: 24,
  barRadius: 4,
  /** The 2px surface gap that separates touching marks. */
  gap: 2,
  areaOpacity: 0.12,
};
