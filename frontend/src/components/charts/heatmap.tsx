import { Fragment, useMemo } from 'react';
import { ChartFrame } from './chart-frame';
import { formatNumber, useChartPalette } from './chart-theme';
import type { ValueFormatter } from './chart-theme';
import type { ReactNode } from 'react';

/**
 * Heatmap — magnitude across two dimensions (hour × day, capability × team).
 *
 * Plain HTML cells, no Recharts: the grid is layout, not geometry. Two scales:
 *
 *  - `scale="sequential"` (default) — one hue, light → dark. How much.
 *  - `scale="diverging"` — two poles around a neutral midpoint. Which side of
 *    a baseline; pass `midpoint` (defaults to 0).
 *
 * Color alone never carries the value: every cell shows its number when it
 * fits, the tooltip repeats it, and the table twin has all of them.
 */
export interface HeatmapColumn {
  key: string;
  label: ReactNode;
}

export interface HeatmapRow {
  label: string;
  /** One entry per column key; a missing key renders an empty cell. */
  values: Record<string, number | undefined>;
}

export interface HeatmapProps {
  title?: ReactNode;
  caption?: ReactNode;
  /** Header for the row-label column in the table twin. */
  rows?: { label?: ReactNode };
  columns: HeatmapColumn[];
  data: HeatmapRow[];
  scale?: 'sequential' | 'diverging';
  /** Neutral centre of the diverging scale. */
  midpoint?: number;
  valueFormat?: ValueFormatter;
  showValues?: boolean;
  loading?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function Heatmap({
  title,
  caption,
  rows,
  columns,
  data,
  scale = 'sequential',
  midpoint = 0,
  valueFormat = formatNumber,
  showValues = true,
  loading,
  actions,
  className,
}: HeatmapProps) {
  const palette = useChartPalette();
  const steps = scale === 'diverging' ? palette.diverging : palette.sequential;

  const { min, max } = useMemo(() => {
    const values = data
      .flatMap((row) => columns.map((column) => row.values[column.key]))
      .filter((value): value is number => typeof value === 'number');
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [data, columns]);

  function stepFor(value: number | undefined): number | null {
    if (typeof value !== 'number') return null;
    if (scale === 'diverging') {
      const reach = Math.max(Math.abs(max - midpoint), Math.abs(midpoint - min)) || 1;
      const t = (value - midpoint) / reach; // -1 … 1
      const index = Math.round((t + 1) / 2 * (steps.length - 1));
      return Math.min(steps.length - 1, Math.max(0, index));
    }
    const span = max - min || 1;
    return Math.min(steps.length - 1, Math.max(0, Math.round(((value - min) / span) * (steps.length - 1))));
  }

  /* Ink or surface inside the cell, whichever clears contrast on that step. */
  function inkFor(index: number | null): string {
    if (index == null) return 'var(--ink-muted)';
    const dark = scale === 'diverging'
      ? index <= 1 || index >= steps.length - 2
      : index >= steps.length - 2;
    return dark ? 'var(--pure-white)' : 'var(--carbon-black)';
  }

  return (
    <ChartFrame
      title={title}
      caption={caption}
      actions={actions}
      className={className}
      loading={loading}
      empty={!data?.length}
      table={{
        columns: [{ key: 'row', label: rows?.label ?? 'Row' },
          ...columns.map((column) => ({ key: column.key, label: column.label, numeric: true }))],
        rows: data.map((row) => ({
          key: row.label,
          cells: {
            row: row.label,
            ...Object.fromEntries(columns.map((column) => [column.key, valueFormat(row.values[column.key])])),
          },
        })),
      }}
    >
      <div className="heatmap">
        <div className="heatmap-grid" style={{ gridTemplateColumns: `minmax(72px, auto) repeat(${columns.length}, minmax(40px, 1fr))` }}>
          <span className="heatmap-corner" />
          {columns.map((column) => (
            <span key={column.key} className="heatmap-col-label">{column.label}</span>
          ))}
          {data.map((row) => (
            <Fragment key={row.label}>
              <span className="heatmap-row-label">{row.label}</span>
              {columns.map((column) => {
                const value = row.values[column.key];
                const index = stepFor(value);
                return (
                  <span
                    key={column.key}
                    className="heatmap-cell"
                    style={{ background: index == null ? 'var(--surface-inset)' : steps[index], color: inkFor(index) }}
                    title={`${row.label} · ${column.label}: ${valueFormat(value)}`}
                  >
                    {showValues ? valueFormat(value) : null}
                  </span>
                );
              })}
            </Fragment>
          ))}
        </div>
        <HeatmapScale steps={steps} min={min} max={max} scale={scale} format={valueFormat} />
      </div>
    </ChartFrame>
  );
}

function HeatmapScale({
  steps,
  min,
  max,
  scale,
  format,
}: {
  steps: string[];
  min: number;
  max: number;
  scale: 'sequential' | 'diverging';
  format: ValueFormatter;
}) {
  return (
    <div className="heatmap-scale">
      <span className="heatmap-scale-end">{format(scale === 'diverging' ? -Math.max(Math.abs(min), Math.abs(max)) : min)}</span>
      <span className="heatmap-scale-ramp" aria-hidden="true">
        {steps.map((step) => <span key={step} style={{ background: step }} />)}
      </span>
      <span className="heatmap-scale-end">{format(max)}</span>
    </div>
  );
}
