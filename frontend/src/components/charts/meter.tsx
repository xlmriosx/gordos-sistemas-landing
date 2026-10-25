import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatNumber } from './chart-theme';

export type MeterTone = 'ok' | 'caution' | 'danger';

export interface MeterThresholds {
  /** Values on the same scale as `value` — not percentages. */
  caution?: number;
  danger?: number;
}

const TONE_ICON: Record<MeterTone, typeof CheckCircle2> = {
  ok: CheckCircle2,
  caution: AlertTriangle,
  danger: CircleAlert,
};
const TONE_LABEL: Record<MeterTone, string> = {
  ok: 'In tolerance',
  caution: 'Near tolerance',
  danger: 'Out of tolerance',
};

/**
 * Meter — one value against a budget or a tolerance band.
 *
 * The fill carries severity and the track is a lighter step of the same ramp,
 * so state reads across the whole bar. Thresholds are values on the same
 * scale (`caution` / `danger`); pass `tone` directly to override. Severity is
 * never color-alone: it always ships with an icon and a label.
 *
 * This is the figure form, not a chart — use it for utilization, quota, SLA
 * headroom. For a value over time, use LineChartCard.
 */
export interface MeterProps {
  label?: ReactNode;
  value: number;
  max?: number;
  thresholds?: MeterThresholds;
  /** Overrides the tone derived from `thresholds`. */
  tone?: MeterTone;
  unit?: string;
  hint?: ReactNode;
  format?: (value: number) => string;
  className?: string;
}

export function Meter({
  label,
  value,
  max = 100,
  thresholds,
  tone,
  unit = '%',
  hint,
  format = (v) => `${formatNumber(v)}${unit}`,
  className,
}: MeterProps) {
  const ratio = max ? Math.min(1, Math.max(0, value / max)) : 0;
  const resolved = tone ?? resolveTone(value, thresholds);
  const Icon = TONE_ICON[resolved];

  return (
    <div className={cn('meter', `meter-${resolved}`, className)}>
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="chart-figure meter-value">{format(value)}</span>
      </div>
      <div
        className="meter-track"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label} — ${TONE_LABEL[resolved]}`}
      >
        <span className="meter-fill" style={{ width: `${ratio * 100}%` }} />
        {thresholds?.danger != null && thresholds.danger < max ? (
          <span className="meter-threshold" style={{ left: `${(thresholds.danger / max) * 100}%` }} aria-hidden="true" />
        ) : null}
      </div>
      <p className="meter-foot">
        <Icon size={14} strokeWidth={1.5} />
        <span>{TONE_LABEL[resolved]}</span>
        {hint ? <span className="meter-hint">{hint}</span> : null}
      </p>
    </div>
  );
}

function resolveTone(value: number, thresholds?: MeterThresholds): MeterTone {
  if (!thresholds) return 'ok';
  if (thresholds.danger != null && value >= thresholds.danger) return 'danger';
  if (thresholds.caution != null && value >= thresholds.caution) return 'caution';
  return 'ok';
}
