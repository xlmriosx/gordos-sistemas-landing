import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Table2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * ChartFrame — the card every chart in this kit renders into.
 *
 * It carries the parts that are not the plot: title, caption, the legend, the
 * chart/table switch, and the empty/loading states. Two rules from the design
 * system live here rather than in each chart:
 *
 *  - a legend is always present for 2+ series, never for a single one (the
 *    title already names it);
 *  - every chart has a table twin, so no value is reachable by hover alone.
 */
export interface ChartLegendItem {
  label: ReactNode;
  color: string;
  /** Rendered after the label — a share, a total. */
  value?: ReactNode;
  shape?: 'line' | 'mark';
}

export interface ChartTableColumn {
  key: string;
  label: ReactNode;
  numeric?: boolean;
}

export interface ChartTableRow {
  key?: string;
  /** Swatch drawn in the first cell, matching the plotted mark. */
  color?: string;
  cells: Record<string, ReactNode>;
}

export interface ChartTableSpec {
  columns: ChartTableColumn[];
  rows: ChartTableRow[];
}

export interface ChartFrameProps {
  title?: ReactNode;
  caption?: ReactNode;
  legend?: ChartLegendItem[];
  actions?: ReactNode;
  /** The accessible twin of the plot. Omit only when there is no tabular form. */
  table?: ChartTableSpec;
  loading?: boolean;
  empty?: boolean;
  emptyLabel?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function ChartFrame({
  title,
  caption,
  legend,
  actions,
  table,
  loading = false,
  empty = false,
  emptyLabel,
  className,
  children,
}: ChartFrameProps) {
  const { t } = useTranslation('ui');
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const titleId = useId();
  const showTable = Boolean(table) && view === 'table';

  return (
    <figure className={cn('chart-card', className)} aria-labelledby={title ? titleId : undefined}>
      {(title || caption || actions || table) && (
        <figcaption className="chart-head">
          <div className="chart-head-text">
            {title ? <h3 id={titleId} className="chart-title">{title}</h3> : null}
            {caption ? <p className="chart-caption">{caption}</p> : null}
          </div>
          <div className="chart-head-actions">
            {actions}
            {table ? (
              <button
                type="button"
                className="chart-view-toggle"
                onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))}
                aria-pressed={showTable}
                title={showTable ? t('chart.showChart') : t('chart.showTable')}
              >
                {showTable
                  ? <BarChart3 size={14} strokeWidth={1.5} />
                  : <Table2 size={14} strokeWidth={1.5} />}
                <span>{showTable ? t('chart.chart') : t('chart.table')}</span>
              </button>
            ) : null}
          </div>
        </figcaption>
      )}

      {legend && legend.length > 1 && !showTable ? <ChartLegend items={legend} /> : null}

      {empty ? (
        <div className="chart-empty">{emptyLabel ?? t('chart.noData')}</div>
      ) : showTable && table ? (
        <ChartTable {...table} />
      ) : (
        /* On refetch the previous render is held at reduced opacity — no
           skeleton flash, no layout jump. */
        <div className={cn('chart-plot', loading && 'is-loading')} aria-busy={loading || undefined}>
          {children}
        </div>
      )}
    </figure>
  );
}

/**
 * The identity channel that does not depend on color perception. Marks carry
 * the series color; the label stays in ink.
 */
export function ChartLegend({ items, className }: { items: ChartLegendItem[]; className?: string }) {
  return (
    <ul className={cn('chart-legend', className)}>
      {items.map((item, index) => (
        <li key={index} className="chart-legend-item">
          <span
            className={cn('chart-legend-mark', item.shape === 'line' && 'is-line')}
            style={{ background: item.color }}
            aria-hidden="true"
          />
          <span className="chart-legend-label">{item.label}</span>
          {item.value != null ? <span className="chart-legend-value">{item.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** The WCAG-clean twin of the plot. Values here are never rounded away. */
export function ChartTable({ columns, rows }: ChartTableSpec) {
  return (
    <div className="chart-table-wrap">
      <table className="data-table chart-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.numeric ? 'is-numeric' : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key ?? index}>
              {columns.map((column, columnIndex) => (
                <td key={column.key} className={column.numeric ? 'is-numeric' : undefined}>
                  {columnIndex === 0 && row.color ? (
                    <span className="chart-table-mark" style={{ background: row.color }} aria-hidden="true" />
                  ) : null}
                  {row.cells[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tooltip body shared by every chart. Recharts hands it the hovered payload;
 * the layout, type and color handling are ours.
 */
/** The subset of Recharts' tooltip payload this body reads. */
export interface ChartTooltipEntry {
  dataKey?: string | number;
  name?: ReactNode;
  value?: number | string | null;
  color?: string;
  payload?: { fill?: string };
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: ReactNode;
  formatter?: (value: never, entry: ChartTooltipEntry) => ReactNode;
  labelFormatter?: (label: never) => ReactNode;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((entry) => entry.value != null);
  if (!rows.length) return null;

  return (
    <div className="chart-tooltip" role="status">
      {label != null ? (
        <p className="chart-tooltip-label">{labelFormatter ? labelFormatter(label as never) : label}</p>
      ) : null}
      <ul className="chart-tooltip-list">
        {rows.map((entry, index) => (
          <li key={entry.dataKey ?? index} className="chart-tooltip-row">
            <span
              className="chart-tooltip-mark"
              style={{ background: entry.color ?? entry.payload?.fill }}
              aria-hidden="true"
            />
            <span className="chart-tooltip-name">{entry.name}</span>
            <span className="chart-tooltip-value">
              {formatter ? formatter(entry.value as never, entry) : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

