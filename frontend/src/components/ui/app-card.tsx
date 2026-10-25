import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import { Badge } from './primitives';
import type { BadgeVariant } from './badge';
import { Tip } from './tooltip';
import { cn } from '../../lib/utils';

export interface AppCardStatus {
  variant: BadgeVariant;
  label: ReactNode;
}

export type AppCardDensity = 'default' | 'compact';

export type AppCardSignalTone = 'neutral' | 'info' | 'warning' | 'critical';

export interface AppCardProps {
  tag?: ReactNode;
  /** Mutually exclusive with `owner` — the head shows one or the other. */
  status?: AppCardStatus;
  owner?: ReactNode;
  title: ReactNode;
  /**
   * Compact signal beside the title (icon + tip). Use for soft warnings that
   * should not replace the primary `status` badge — e.g. an expiring key while
   * the capability is still Active.
   */
  titleAddon?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  /** Store / board density — denser rhythm, container queries for signals. */
  density?: AppCardDensity;
  /** Makes the whole card the hit target, keyboard included. */
  onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent) => void;
  children?: ReactNode;
  className?: string;
}

/**
 * AppCard: the shared card for an app in a grid/list — unifies the "my apps"
 * and "available apps" cards. Head shows a tag on the left and either
 * a status Badge or an owner label on the right; footer shows meta text + an
 * optional action. Extra content (e.g. capability chips) goes in `children`.
 *
 * Composition helpers (same file on purpose — one card system):
 *  - `AppCardSignals` / `AppCardSignal` — label chips under the title (icon optional)
 *  - `AppCardMeta` / `AppCardMetaItem` — foot stats as readable text (icon optional)
 *  - `AppCardTitleNotice` — soft warning icon with tip beside the title
 */
export function AppCard({
  tag,
  status,
  owner,
  title,
  titleAddon,
  description,
  meta,
  action,
  density = 'default',
  onClick,
  children,
  className,
}: AppCardProps) {
  const interactive = typeof onClick === 'function';

  return (
    // role, tabIndex and the Enter/Space handler below are all gated by the
    // same `interactive` flag, so they're always in sync — the linter can't
    // trace that across the three conditionals.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article
      className={cn(
        'app-card',
        density === 'compact' && 'app-card--compact',
        interactive && 'app-card--interactive',
        className,
      )}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e.nativeEvent);
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className="app-card-head">
        {tag ? <span className="tag">{tag}</span> : <span />}
        {status ? (
          <Badge variant={status.variant}>{status.label}</Badge>
        ) : owner ? (
          <span className="t-app-mono text-ink-faint">{owner}</span>
        ) : null}
      </div>
      <div className="app-card-title-row">
        <h3 className="app-card-title">{title}</h3>
        {titleAddon}
      </div>
      {description ? <p className="app-card-desc">{description}</p> : null}
      {children}
      {(meta || action) ? (
        <div className="app-card-foot">
          {meta ? <span className="t-app-mono text-ink-faint">{meta}</span> : <span />}
          {action}
        </div>
      ) : null}
    </article>
  );
}

export function AppCardSignals({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('app-card-signals', className)} {...props} />;
}

export function AppCardSignal({
  icon,
  label,
  tone = 'neutral',
  title,
  className,
}: {
  /** Optional — prefer a visible label; icons alone are not self-explanatory. */
  icon?: ReactNode;
  label: ReactNode;
  tone?: AppCardSignalTone;
  /** Longer name for native title when the visible label is abbreviated. */
  title?: string;
  className?: string;
}) {
  return (
    <span
      className={cn('app-card-signal', className)}
      data-tone={tone === 'neutral' ? undefined : tone}
      title={title}
    >
      {icon ? <span className="app-card-signal__icon" aria-hidden>{icon}</span> : null}
      <span className="app-card-signal__label">{label}</span>
    </span>
  );
}

export function AppCardMeta({
  className,
  ...props
}: ComponentPropsWithoutRef<'span'>) {
  return <span className={cn('app-card-meta', className)} {...props} />;
}

export function AppCardMetaItem({
  icon,
  children,
  label,
  tone = 'neutral',
  className,
}: {
  /** Optional — prefer readable text in `children`. */
  icon?: ReactNode;
  children: ReactNode;
  /** Accessible name when `children` is abbreviated; also native title. */
  label?: string;
  tone?: Extract<AppCardSignalTone, 'neutral' | 'warning' | 'critical'>;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'app-card-meta-item',
        tone !== 'neutral' && `app-card-meta-item--${tone}`,
        className,
      )}
      aria-label={label}
      title={label}
    >
      {icon ? <span className="app-card-meta-item__icon" aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}

/**
 * Soft notice beside the title. Stops propagation so it works inside an
 * interactive `AppCard` without stealing the card click.
 */
export function AppCardTitleNotice({
  label,
  tone = 'warning',
  children,
}: {
  label: ReactNode;
  tone?: Extract<AppCardSignalTone, 'warning' | 'critical'>;
  children: ReactNode;
}) {
  return (
    <Tip label={label} side="top">
      <button
        type="button"
        className="app-card-title-notice"
        data-tone={tone}
        aria-label={typeof label === 'string' ? label : undefined}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {children}
      </button>
    </Tip>
  );
}
