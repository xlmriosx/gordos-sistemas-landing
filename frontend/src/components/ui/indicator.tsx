import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Count / presence indicator — not a status `Badge`.
 *
 * Shape (automatic from content):
 *  - `dot`           presence only
 *  - short number    circle
 *  - longer / max+   pill that grows with the digits
 *
 * Tone (`variant`) mirrors `Badge` — same names, same `--status-*` tokens:
 *  - `neutral` | `outline`  no state (default count beside a title / tab)
 *  - `ok` | `warning` | `critical` | `info`  the count itself is a signal
 *
 * Fill only — no border — except `outline`, which is the border-defined tone.
 * Prefer this over `Badge shape="pill"` for bare numbers, and over `.num-badge`.
 * Overlay on an icon with `IndicatorAnchor`.
 */
const indicatorVariants = cva('indicator', {
  variants: {
    variant: {
      neutral: 'indicator--neutral',
      outline: 'indicator--outline',
      ok: 'indicator--ok',
      warning: 'indicator--warning',
      critical: 'indicator--critical',
      info: 'indicator--info',
    },
    kind: {
      dot: 'indicator--dot',
      count: 'indicator--count',
    },
  },
  defaultVariants: { variant: 'neutral', kind: 'count' },
});

function formatCount(value: number | string | undefined, max: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const floored = Math.floor(n);
  if (floored > max) return `${max}+`;
  return String(floored);
}

export interface IndicatorProps
  extends ComponentPropsWithoutRef<'span'>,
    Omit<VariantProps<typeof indicatorVariants>, 'kind'> {
  /** Omit (or pass `dot`) for a presence dot instead of a count. */
  value?: number | string;
  max?: number;
  dot?: boolean;
  /** Render a `0` instead of hiding the indicator. */
  showZero?: boolean;
  /** Noun appended to the count in the accessible name. */
  label?: string;
}

export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(function Indicator(
  {
    value,
    max = 99,
    dot = false,
    showZero = false,
    label,
    variant = 'neutral',
    className,
    ...props
  },
  ref,
) {
  const isDot = Boolean(dot) || value == null;
  const numeric = Number(value);
  const isEmptyCount =
    !isDot && Number.isFinite(numeric) && numeric <= 0 && !showZero;

  if (isEmptyCount) return null;

  // `undefined`, not null: it feeds `aria-label`, which must not be null.
  const display = isDot ? undefined : formatCount(value, max);
  const ariaLabel =
    props['aria-label'] ??
    (isDot
      ? label ?? 'Indicador'
      : label
        ? `${display} ${label}`
        : display);

  return (
    <span
      ref={ref}
      className={cn(
        indicatorVariants({
          variant,
          kind: isDot ? 'dot' : 'count',
        }),
        className,
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {isDot ? null : display}
    </span>
  );
});

/**
 * Positions an `Indicator` on the top-end corner of its child (icon, avatar…).
 * Put the host content and the Indicator as children.
 */
export const IndicatorAnchor = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(
  function IndicatorAnchor({ className, children, ...props }, ref) {
    return (
      <span ref={ref} className={cn('indicator-anchor', className)} {...props}>
        {children}
      </span>
    );
  },
);
