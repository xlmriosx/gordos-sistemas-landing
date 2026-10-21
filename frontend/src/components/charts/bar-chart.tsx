import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ChartFrame, ChartTooltipContent } from './chart-frame';
import { buildSeriesTable } from './chart-table';
import {
  CHART_MARK, axisProps, formatCompact, formatNumber, seriesColor,
  usePrefersReducedMotion, useChartPalette, warnOnSeriesCount,
} from './chart-theme';
import type { ChartDatum, ChartSeries, ValueFormatter } from './chart-theme';
import type { ReactNode } from 'react';

/**
 * BarChartCard — magnitude across categories.
 *
 * `layout="vertical"` gives horizontal bars, which is the right default when
 * category names are long. Bars cap at 24px so the band keeps its air, the
 * data-end is rounded 4px while the baseline stays square, and touching marks
 * are separated by a 2px gap in the surface color — never by a stroke.
 *
 * One series is one color (slot 1) for every bar: never a value ramp on
 * nominal categories, which would re-encode what bar length already shows.
 */
export interface BarChartCardProps<D extends ChartDatum = ChartDatum> {
  title?: ReactNode;
  caption?: ReactNode;
  data: D[];
  xKey: Extract<keyof D, string>;
  xLabel?: ReactNode;
  series: ChartSeries<D>[];
  /** `'horizontal'` draws columns, `'vertical'` draws bars. */
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
  height?: number;
  valueFormat?: ValueFormatter;
  tickFormat?: ValueFormatter;
  categoryWidth?: number;
  loading?: boolean;
  actions?: ReactNode;
  withTable?: boolean;
  className?: string;
}

export function BarChartCard<D extends ChartDatum>({
  title,
  caption,
  data,
  xKey,
  xLabel = 'Category',
  series,
  layout = 'horizontal', // 'horizontal' = columns, 'vertical' = bars
  stacked = false,
  height = 260,
  valueFormat = formatNumber,
  tickFormat = formatCompact,
  categoryWidth = 120,
  loading,
  actions,
  withTable = true,
  className,
}: BarChartCardProps<D>) {
  const palette = useChartPalette();
  const reducedMotion = usePrefersReducedMotion();
  warnOnSeriesCount(series.length, `BarChartCard · ${title}`);
  const colors = series.map((item, index) => seriesColor(item, index, palette));
  const isBars = layout === 'vertical';
  const keys = series.map((item) => item.key);

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
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barGap={CHART_MARK.gap}
          barCategoryGap="28%"
        >
          <CartesianGrid
            vertical={isBars}
            horizontal={!isBars}
            stroke={palette.grid}
          />
          {isBars ? (
            <>
              <XAxis type="number" {...axisProps(palette)} tickFormatter={(value: number) => tickFormat(value)} />
              <YAxis type="category" dataKey={xKey} {...axisProps(palette)} width={categoryWidth} tickMargin={8} />
            </>
          ) : (
            <>
              <XAxis type="category" dataKey={xKey} {...axisProps(palette)} tickMargin={10} />
              <YAxis type="number" {...axisProps(palette)} width={48} tickFormatter={(value: number) => tickFormat(value)} />
            </>
          )}
          <Tooltip
            cursor={{ fill: palette.grid }}
            content={<ChartTooltipContent formatter={(value) => valueFormat(value)} />}
          />
          {series.map((item, index) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              stackId={stacked ? 'stack' : undefined}
              fill={colors[index]}
              maxBarSize={CHART_MARK.barSize}
              isAnimationActive={!reducedMotion}
              shape={<BarShape isBars={isBars} stacked={stacked} seriesKey={item.key} keys={keys} />}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/**
 * The mark itself: rounded only at the data-end, square at the baseline, and
 * inset by the 2px gap on the side that touches the next segment.
 */
/**
 * Recharts hands `shape` its own internal prop bag; we read the geometry and
 * the datum out of it and add our own four. Typing only what we consume keeps
 * this independent of Recharts' internal shape type.
 */
interface BarGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: ChartDatum;
}

interface BarShapeProps extends BarGeometry {
  isBars: boolean;
  stacked: boolean;
  seriesKey: string;
  keys: string[];
}

function BarShape({ x, y, width, height, fill, payload, isBars, stacked, seriesKey, keys }: BarShapeProps) {
  if (x == null || y == null || !(width != null && width > 0) || !(height != null && height > 0)) {
    return null;
  }
  const gap = CHART_MARK.gap;
  const radius = CHART_MARK.barRadius;

  /* The outermost segment of a stack owns the rounded data-end. */
  const lastVisible = [...keys].reverse().find((key) => Number(payload?.[key]) > 0);
  const isEnd = !stacked || lastVisible === seriesKey;

  let rect = { x, y, width, height };
  if (stacked) {
    if (isBars) rect = { ...rect, width: Math.max(width - gap, 1) };
    else rect = { ...rect, y: y + gap, height: Math.max(height - gap, 1) };
  }

  return <path d={barPath(rect, isBars, isEnd ? radius : 0)} fill={fill} />;
}

/** Rect path with rounded corners on the data-end only. */
function barPath(
  { x, y, width, height }: { x: number; y: number; width: number; height: number },
  isBars: boolean,
  radius: number,
): string {
  const r = Math.max(0, Math.min(radius, isBars ? width / 2 : height / 2, isBars ? height / 2 : width / 2));
  if (!r) return `M${x},${y}h${width}v${height}h${-width}z`;
  if (isBars) {
    // grows left → right: round the right edge
    return `M${x},${y}h${width - r}a${r},${r} 0 0 1 ${r},${r}v${height - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(width - r)}z`;
  }
  // grows bottom → top: round the top edge
  return `M${x},${y + r}a${r},${r} 0 0 1 ${r},${-r}h${width - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${height - r}h${-width}z`;
}
