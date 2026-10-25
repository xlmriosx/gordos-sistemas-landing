import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * `note` is the default and has no modifier class — the base `.callout` is the
 * neutral surface. The other three map to `.callout--*` in ds-components.css.
 */
export type CalloutVariant = 'note' | 'info' | 'warning' | 'critical';

export interface CalloutProps {
  /** Any Lucide glyph — rendered decorative, so it must not carry meaning alone. */
  icon?: ReactNode;
  variant?: CalloutVariant;
  className?: string;
  children?: ReactNode;
}

/**
 * Callout: a quiet, inline note box (icon + text) on a subtle surface — softer
 * than Alert, for "why this appears" / audit reminders. Variants tint the box.
 */
export function Callout({ icon, variant = 'note', className, children }: CalloutProps) {
  return (
    <div
      className={cn('callout', `callout--${variant}`, className)}
      role={variant === 'warning' ? 'status' : undefined}
    >
      {icon ? <span className="callout-icon" aria-hidden>{icon}</span> : null}
      <div className="callout-body">{children}</div>
    </div>
  );
}
