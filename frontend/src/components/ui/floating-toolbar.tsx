import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Separator } from './separator';

export interface FloatingToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Selection / context chip on the left (count, label). */
  leading?: ReactNode;
  /** Primary actions in the middle. */
  children?: ReactNode;
  /** Secondary control after primary (e.g. Publish Switch). */
  trailing?: ReactNode;
  /** Dismiss / clear on the far right — always separated from trailing. */
  dismiss?: ReactNode;
  /** Accessible name for the toolbar. */
  label: string;
}

/**
 * Contextual action bar that floats over a scrolling surface (selection bulk
 * actions, multi-select chrome).
 *
 * Compose `leading` · primary `children` · `trailing` · `dismiss`.
 * Primary action should reuse the same control as the surface (e.g. ToggleGroup).
 * Trailing / dismiss use quiet hit targets — not prose-link ghost underlines.
 */
export function FloatingToolbar({
  leading,
  children,
  trailing,
  dismiss,
  label,
  className,
  ...props
}: FloatingToolbarProps) {
  const beforeTrailing = Boolean(leading || children);
  const beforeDismiss = Boolean(leading || children || trailing);

  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('floating-toolbar', className)}
      {...props}
    >
      {leading ? <div className="floating-toolbar-leading">{leading}</div> : null}
      {leading && children ? (
        <Separator orientation="vertical" className="floating-toolbar-sep" />
      ) : null}
      {children ? <div className="floating-toolbar-actions">{children}</div> : null}
      {trailing ? (
        <>
          {beforeTrailing ? (
            <Separator orientation="vertical" className="floating-toolbar-sep" />
          ) : null}
          <div className="floating-toolbar-trailing">{trailing}</div>
        </>
      ) : null}
      {dismiss ? (
        <>
          {beforeDismiss ? (
            <Separator orientation="vertical" className="floating-toolbar-sep" />
          ) : null}
          <div className="floating-toolbar-dismiss">{dismiss}</div>
        </>
      ) : null}
    </div>
  );
}
