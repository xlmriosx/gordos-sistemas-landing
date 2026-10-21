import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartFrame, ChartLegend, ChartTooltipContent } from './chart-frame';
import type { ReactNode } from 'react';
import {
  CHART_MARK, formatNumber, formatPercent, seriesColor,
  usePrefersReducedMotion, useChartPalette,
} from './chart-theme';
import type { ValueFormatter } from './chart-theme';

/**
 * DonutChartCard — part-to-whole, at a glance only.
 *
 * Six segments is the cap and close values are the wrong job for this form: if
 * the reader has to compare 31% against 28%, use BarChartCard. Segments are
 * separated by the 2px surface gap; the total sits in the hole, where it reads
 * as the headline rather than as a seventh slice.
 */
/** One slice. Extra keys are allowed so `nameKey`/`valueKey` can be renamed. */
export interface DonutSlice {
  [key: string]: unknown;
  /** A status name, `'emphasis'`, `'recede'`, or a literal color. */
  color?: string;
  slot?: number;
}

export interface DonutChartCardProps {
  title?: ReactNode;
  caption?: ReactNode;
  data?: DonutSlice[];
  nameKey?: string;
  valueKey?: string;
  centerLabel?: ReactNode;
  centerValue?: ReactNode;
  height?: number;
  valueFormat?: ValueFormatter;
  loading?: boolean;
  actions?: ReactNode;
  withTable?: boolean;
  className?: string;
}

/** A slice's fields are addressed by configurable keys, so read them narrowly. */
function sliceValue(slice: DonutSlice, key: string): number {
  const raw = slice[key];
  return typeof raw === 'number' ? raw : 0;
}

function sliceLabel(slice: DonutSlice, key: string): string {
  return String(slice[key] ?? '');
}

export function DonutChartCard({
  title,
  caption,
  data,
  nameKey = 'label',
  valueKey = 'value',
  centerLabel,
  centerValue,
  height = 240,
  valueFormat = formatNumber,
  loading,
  actions,
  withTable = true,
  className,
}: DonutChartCardProps) {
  const palette = useChartPalette();
  const reducedMotion = usePrefersReducedMotion();
  const slices = (data ?? []).slice(0, 6);
  const total = slices.reduce((sum, slice) => sum + sliceValue(slice, valueKey), 0);
  const colors = slices.map((slice, index) =>
    seriesColor({ key: sliceLabel(slice, nameKey), label: sliceLabel(slice, nameKey), slot: slice.slot, color: slice.color }, index, palette),
  );

  const legend = slices.map((slice, index) => ({
    label: sliceLabel(slice, nameKey),
    color: colors[index],
    value: `${valueFormat(sliceValue(slice, valueKey))} · ${formatPercent(
      total ? (sliceValue(slice, valueKey) / total) * 100 : 0,
    )}`,
  }));

  return (
    <ChartFrame
      title={title}
      caption={caption}
      actions={actions}
      className={className}
      loading={loading}
      empty={!slices.length}
      table={
        withTable
          ? {
              columns: [
                { key: 'label', label: 'Segment' },
                { key: 'value', label: 'Value', numeric: true },
                { key: 'share', label: 'Share', numeric: true },
              ],
              rows: slices.map((slice, index) => ({
                key: sliceLabel(slice, nameKey),
                color: colors[index],
                cells: {
                  label: sliceLabel(slice, nameKey),
                  value: valueFormat(sliceValue(slice, valueKey)),
                  share: formatPercent(
                    total ? (sliceValue(slice, valueKey) / total) * 100 : 0,
                    { decimals: 1 },
                  ),
                },
              })),
            }
          : undefined
      }
    >
      <div className="chart-donut">
        <div className="chart-donut-plot" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={(
                  <ChartTooltipContent
                    formatter={(value: number) =>
                      `${valueFormat(value)} · ${formatPercent(total ? (value / total) * 100 : 0)}`}
                  />
                )}
              />
              <Pie
                data={slices}
                dataKey={valueKey}
                nameKey={nameKey}
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={CHART_MARK.gap}
                stroke="none"
                isAnimationActive={!reducedMotion}
              >
                {slices.map((slice, index) => (
                  <Cell key={sliceLabel(slice, nameKey)} fill={colors[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-donut-center" aria-hidden="true">
            <span className="chart-figure">{centerValue ?? valueFormat(total)}</span>
            {centerLabel ? <span className="chart-donut-center-label">{centerLabel}</span> : null}
          </div>
        </div>
        <ChartLegend items={legend} className="chart-legend-stack" />
      </div>
    </ChartFrame>
  );
}
