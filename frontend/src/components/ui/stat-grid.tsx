import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * StatGrid: the responsive wrapper for a row of StatCards (2-up on small,
 * 4-up on wider screens). Replaces the repeated grid markup across dashboards.
 * Pass StatCards as children.
 */
export function StatGrid({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={cn('stat-grid', className)}>{children}</div>;
}
