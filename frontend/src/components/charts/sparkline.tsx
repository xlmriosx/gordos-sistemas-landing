import type { ReactNode } from 'react';
import { Area, AreaChart, Line, LineChart, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CHART_MARK, formatCompact, markWeight, useChartPalette, usePrefersReducedMotion } from './chart-theme';
import type { ChartDatum } from './chart-theme';

/**
 * Sparkline — a trend with no chrome. No axes, no tooltip, no legend: it is a
 * shape, not a plot, so it belongs beside a number that carries the value.
 * Pass 8–16 points; more turns into noise at this size.
 */
export interface SparklineProps {
  data?: ChartDatum[];
  valueKey?: string;
  color?: string;
  /** Draws the area wash under the line. */
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  valueKey = 'value',
  color,
  fill = true,
  width = 120,
  height = 36,
  className,
}: SparklineProps) {
  const palette = useChartPalette();
  const reducedMotion = usePrefersReducedMotion();
  const stroke = color ?? palette.series[0];
  const weight = markWeight(stroke, palette.surface);
  const Chart = fill ? AreaChart : LineChart;

  return (
    <div className={cn('sparkline', className)} style={{ width, height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: 3, right: 2, bottom: 3, left: 2 }}>
          {fill ? (
            <Area
              type="monotone"
              dataKey={valueKey}
              stroke={stroke}
              strokeWidth={weight}
              fill={stroke}
              fillOpacity={CHART_MARK.areaOpacity}
              isAnimationActive={!reducedMotion}
              dot={false}
            />
          ) : (
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={stroke}
              strokeWidth={weight}
              strokeLinecap="round"
              isAnimationActive={!reducedMotion}
              dot={false}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * TrendStat — the figure form. When the story is one number, this beats a
 * chart: label, value, a signed delta against a named period, and an optional
 * sparkline for shape.
 *
 * `upIsGood={false}` flips the delta's color for metrics where a rise is bad
 * (latency, error rate, cost). Direction is never color-alone — the arrow and
 * the signed number carry it too.
 */
export interface TrendStatProps {
  label?: ReactNode;
  value?: number | ReactNode;
  /** Signed percentage change. `null` renders no delta row. */
  delta?: number | null;
  deltaLabel?: ReactNode;
  /** Flip for metrics where a rise is bad (latency, error rate, cost). */
  upIsGood?: boolean;
  trend?: ChartDatum[];
  trendKey?: string;
  format?: (value: number) => string;
  className?: string;
}

export function TrendStat({
  label,
  value,
  delta,
  deltaLabel,
  upIsGood = true,
  trend,
  trendKey = 'value',
  format = formatCompact,
  className,
}: TrendStatProps) {
  const palette = useChartPalette();
  const direction = delta == null || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
  const good = direction === 'flat' ? null : (direction === 'up') === upIsGood;
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;
  const trendColor = good === null ? palette.series[0] : good ? palette.status.ok : palette.status.critical;

  return (
    <div className={cn('trend-stat', className)}>
      <p className="trend-stat-label">{label}</p>
      <div className="trend-stat-body">
        <span className="chart-figure trend-stat-value">
          {typeof value === 'number' ? format(value) : value}
        </span>
        {trend?.length ? (
          <Sparkline data={trend} valueKey={trendKey} color={trendColor} width={96} height={32} />
        ) : null}
      </div>
      {delta != null ? (
        <p className={cn('trend-stat-delta', good === null ? 'is-flat' : good ? 'is-good' : 'is-bad')}>
          <Icon size={14} strokeWidth={1.5} />
          <span>{delta > 0 ? '+' : ''}{delta}%</span>
          {deltaLabel ? <span className="trend-stat-delta-label">{deltaLabel}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
