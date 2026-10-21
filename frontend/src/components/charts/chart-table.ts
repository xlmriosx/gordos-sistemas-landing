import type { ReactNode } from 'react';
import type { ChartDatum, ChartSeries } from './chart-theme';
import type { ChartTableSpec } from './chart-frame';

/** Build the table twin from the same data the plot renders. */
export interface BuildSeriesTableArgs<D extends ChartDatum = ChartDatum> {
  data: D[];
  xKey: Extract<keyof D, string>;
  xLabel: ReactNode;
  series: ChartSeries<D>[];
  colors?: string[];
  format?: (value: ChartDatum[string], series: ChartSeries<D>, color?: string) => ReactNode;
}

export function buildSeriesTable<D extends ChartDatum>({
  data,
  xKey,
  xLabel,
  series,
  colors,
  format,
}: BuildSeriesTableArgs<D>): ChartTableSpec {
  return {
    columns: [
      { key: xKey, label: xLabel },
      ...series.map((item) => ({ key: item.key, label: item.label, numeric: true })),
    ],
    rows: data.map((row) => ({
      key: String(row[xKey]),
      cells: {
        [xKey]: row[xKey],
        ...Object.fromEntries(
          series.map((item, index) => [
            item.key,
            format ? format(row[item.key], item, colors?.[index]) : row[item.key],
          ]),
        ),
      },
    })),
  };
}
