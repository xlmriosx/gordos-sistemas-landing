/**
 * Chart kit — Recharts under the brand's token layer.
 *
 * Import from here (`components/charts`) rather than reaching into a file, so
 * a chart never picks up a color that did not come from colors_and_type.css.
 */
export { ChartFrame, ChartLegend, ChartTable, ChartTooltipContent } from './chart-frame';
export { buildSeriesTable } from './chart-table';
export {
  useChartPalette, usePrefersReducedMotion, seriesColor,
  formatCompact, formatNumber, formatPercent, axisProps, markWeight, contrastRatio, warnOnSeriesCount,
  CHART_MARK, SERIES_SLOTS,
} from './chart-theme';
export { LineChartCard } from './line-chart';
export { AreaChartCard } from './area-chart';
export { BarChartCard } from './bar-chart';
export { DonutChartCard } from './donut-chart';
export { Sparkline, TrendStat } from './sparkline';
export { Heatmap } from './heatmap';
export { Meter } from './meter';
