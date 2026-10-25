import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList,
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
 * LineChartCard — change over time.
 *
 * 2px lines, no dot on every point (the crosshair tooltip carries the values),
 * a hairline horizontal grid, and one optional end label per series. Use
 * `emphasis` when the story is one series: the rest recede to neutral instead
 * of competing for six hues.
 */
export interface LineChartCardProps<D extends ChartDatum = ChartDatum> {
  title?: ReactNode;
  caption?: ReactNode;
  data: D[];
  xKey: Extract<keyof D, string>;
  xLabel?: ReactNode;
  series: ChartSeries<D>[];
  height?: number;
  valueFormat?: ValueFormatter;
  tickFormat?: ValueFormatter;
  /** One end-of-line label per series. */
  endLabels?: boolean;
  /** Series key to keep in color; every other series recedes to neutral. */
  emphasis?: string;
  loading?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function LineChartCard<D extends ChartDatum>({
  title,
  caption,
  data,
  xKey,
  xLabel = 'Period',
  series,
  height = 260,
  valueFormat = formatNumber,
  tickFormat = formatCompact,
  endLabels = false,
  emphasis,
  loading,
  actions,
  className,
}: LineChartCardProps<D>) {
  const palette = useChartPalette();
  const reducedMotion = usePrefersReducedMotion();
  warnOnSeriesCount(series.length, `LineChartCard · ${title}`);
  const colors = series.map((item, index) => (
    emphasis && item.key !== emphasis ? palette.recede : seriesColor(item, index, palette)
  ));

  return (
    <ChartFrame
      title={title}
      caption={caption}
      actions={actions}
      className={className}
      loading={loading}
      empty={!data?.length}
      legend={series.map((item, index) => ({ label: item.label, color: colors[index], shape: 'line' }))}
      table={buildSeriesTable({ data, xKey, xLabel, series, colors, format: (value) => valueFormat(value as number) })}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: endLabels ? 56 : 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={palette.grid} />
          <XAxis dataKey={xKey} {...axisProps(palette)} tickMargin={10} />
          <YAxis {...axisProps(palette)} width={48} tickFormatter={(value: number) => tickFormat(value)} />
          <Tooltip
            cursor={{ stroke: palette.axis, strokeWidth: 1 }}
            content={<ChartTooltipContent formatter={(value) => valueFormat(value)} />}
          />
          {series.map((item, index) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={colors[index]}
              strokeWidth={markWeight(colors[index], palette.surface)}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              /* the 2px surface ring keeps the marker legible where lines cross */
              activeDot={{ r: CHART_MARK.dotRadius, strokeWidth: CHART_MARK.gap, stroke: palette.surface }}
              isAnimationActive={!reducedMotion}
            >
              {endLabels ? (
                <LabelList
                  dataKey={item.key}
                  content={<EndLabel data={data} format={valueFormat} fill={palette.label} />}
                />
              ) : null}
            </Line>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/**
 * Direct labels work because they are sparing: only the last point of each
 * series gets one, in ink — never the series color, which is too light to read
 * as text.
 */
/** The geometry Recharts hands a LabelList `content` renderer. */
interface LabelGeometry {
  x?: number;
  y?: number;
  value?: number | string;
  index?: number;
}

interface EndLabelProps extends LabelGeometry {
  data: ChartDatum[];
  format: ValueFormatter;
  fill: string;
}

function EndLabel({ x, y, value, index, data, format, fill }: EndLabelProps) {
  if (index !== data.length - 1 || value == null || x == null || y == null) return null;
  return (
    <text
      x={x + 10}
      y={y}
      dy={4}
      fill={fill}
      style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}
    >
      {format(Number(value))}
    </text>
  );
}
