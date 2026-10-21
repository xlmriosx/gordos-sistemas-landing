import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ChartFrame, ChartTooltipContent } from './chart-frame';
import { buildSeriesTable } from './chart-table';
import {
  CHART_MARK, axisProps, formatCompact, formatNumber, markWeight, seriesColor,
  usePrefersReducedMotion, useChartPalette, warnOnSeriesCount,
} from './chart-theme';
import type { ChartDatum, ChartSeries, ValueFormatter } from './chart-theme';
import type { ReactNode } from 'react';

/**
 * AreaChartCard — volume over time.
 *
 * Unstacked areas are a wash (12% of the series hue) under a 2px line, so
 * overlapping series stay readable. Stacked areas carry a 2px surface-colored
 * separator between bands — the same gap rule as a stacked bar. Keep stacks to
 * a handful of series; past that a stacked bar or small multiples reads better.
 */
export interface AreaChartCardProps<D extends ChartDatum = ChartDatum> {
  title?: ReactNode;
  caption?: ReactNode;
  data: D[];
  xKey: Extract<keyof D, string>;
  xLabel?: ReactNode;
  series: ChartSeries<D>[];
  stacked?: boolean;
  height?: number;
  valueFormat?: ValueFormatter;
  tickFormat?: ValueFormatter;
  loading?: boolean;
  actions?: ReactNode;
  /** Renders the accessible table twin. Leave on unless there is no tabular form. */
  withTable?: boolean;
  className?: string;
}

export function AreaChartCard<D extends ChartDatum>({
  title,
  caption,
  data,
  xKey,
  xLabel = 'Period',
  series,
  stacked = false,
  height = 260,
  valueFormat = formatNumber,
  tickFormat = formatCompact,
  loading,
  actions,
  withTable = true,
  className,
}: AreaChartCardProps<D>) {
  const palette = useChartPalette();
  const reducedMotion = usePrefersReducedMotion();
  warnOnSeriesCount(series.length, `AreaChartCard · ${title}`);
  const colors = series.map((item, index) => seriesColor(item, index, palette));

  return (
    <ChartFrame
      title={title}
      caption={caption}
      actions={actions}
      className={className}
      loading={loading}
      empty={!data?.length}
      legend={series.map((item, index) => ({ label: item.label, color: colors[index] }))}
      table={
        withTable
          ? buildSeriesTable({ data, xKey, xLabel, series, colors, format: (value) => valueFormat(value as number) })
          : undefined
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={palette.grid} />
          <XAxis dataKey={xKey} {...axisProps(palette)} tickMargin={10} />
          <YAxis {...axisProps(palette)} width={48} tickFormatter={(value: number) => tickFormat(value)} />
          <Tooltip
            cursor={{ stroke: palette.axis, strokeWidth: 1 }}
            content={<ChartTooltipContent formatter={(value) => valueFormat(value)} />}
          />
          {series.map((item, index) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stackId={stacked ? 'stack' : undefined}
              stroke={stacked ? palette.surface : colors[index]}
              strokeWidth={stacked ? CHART_MARK.gap : markWeight(colors[index], palette.surface)}
              fill={colors[index]}
              fillOpacity={stacked ? 0.9 : CHART_MARK.areaOpacity}
              activeDot={{ r: CHART_MARK.dotRadius, strokeWidth: CHART_MARK.gap, stroke: palette.surface }}
              isAnimationActive={!reducedMotion}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
