/**
 * Product page layout zones:
 * A — PageHeader: title + optional Indicator count + hint | primary actions
 *     Nav: optional back link + breadcrumb trail (parent wired to onBack).
 *     Optional `filters` slot embeds PageFilterPanel (or toolbar controls)
 *     inside the sticky header band when the page is a browsable store.
 * B — PageToolbar: left contextual slot | right search (when applicable)
 * C — PageFilterPanel: standalone in content, or nested via PageHeader.filters
 * D — PageContent: the content column, sibling of the header. Table, grid,
 *     or stacked cards go inside it.
 */
import { Fragment, useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogOut, Check, PanelLeftClose, PanelLeft, Search, CircleHelp } from 'lucide-react';
import { Badge, Button, Field } from './primitives';
import { Indicator } from './indicator';
import { ScrollToTop } from './scroll-to-top';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './breadcrumb';
import { Tip } from './tooltip';
import { cn } from '../../lib/utils';

const SIDEBAR_STORAGE_KEY = 'app-sidebar-collapsed';

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Renders the item but blocks navigation — "not in this prototype". */
  disabled?: boolean;
}

export interface AppShellProps {
  workspace?: ReactNode;
  workspaceHint?: ReactNode;
  navLabel?: string;
  nav: NavItem[];
  activeId?: string;
  onNavigate: (id: string) => void;
  onLogout?: () => void;
  /** Skips the collapse preference — used when the shell is nested in a page. */
  embedded?: boolean;
  children?: ReactNode;
}

export function AppShell({
  workspace,
  workspaceHint,
  navLabel,
  nav,
  activeId,
  onNavigate,
  onLogout,
  embedded = false,
  children,
}: AppShellProps) {
  const { t } = useTranslation('ui');
  const [collapsed, setCollapsed] = useState(() => (embedded ? false : readCollapsedPreference()));
  const [mainEl, setMainEl] = useState<HTMLElement | null>(null);
  const navigationLabel = navLabel ?? t('shell.navigation');

  useEffect(() => {
    if (embedded) return;
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
      /* storage unavailable */
    }
  }, [collapsed, embedded]);

  return (
    <div
      className={cn(
        'app-shell',
        collapsed && 'sidebar-collapsed',
        embedded && 'app-shell--embedded',
      )}
    >
      <aside className="app-sidebar">
        <div className="app-sidebar-head">
          <div className="app-sidebar-workspace">
            {workspace ? <p className="app-sidebar-workspace-title">{workspace}</p> : null}
            {workspaceHint ? <p className="app-sidebar-workspace-hint">{workspaceHint}</p> : null}
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t('shell.expandSidebar') : t('shell.collapseSidebar')}
            title={collapsed ? t('shell.expandMenu') : t('shell.collapseMenu')}
          >
            {collapsed ? <PanelLeft size={16} strokeWidth={1.5} /> : <PanelLeftClose size={16} strokeWidth={1.5} />}
          </button>
        </div>
        <nav className="app-nav" aria-label={navigationLabel}>
          <span className="app-nav-label">{navigationLabel}</span>
          {nav.map((item) => {
            const button = (
              <button
                type="button"
                disabled={item.disabled}
                title={!collapsed && item.disabled ? t('shell.comingSoon') : undefined}
                aria-label={item.label}
                className={cn(
                  'app-nav-item',
                  activeId === item.id && 'active',
                  item.disabled && 'disabled',
                )}
                onClick={() => !item.disabled && onNavigate(item.id)}
              >
                {item.icon}
                <span className="app-nav-item-label">{item.label}</span>
              </button>
            );
            return collapsed ? (
              <Tip key={item.id} label={item.label} side="right">
                {button}
              </Tip>
            ) : (
              <span key={item.id} className="contents">
                {button}
              </span>
            );
          })}
        </nav>
        <div className="app-sidebar-foot">
          <button
            type="button"
            className="app-nav-item app-nav-item-logout"
            onClick={onLogout}
            title={collapsed ? t('shell.logout') : undefined}
            aria-label={t('shell.logout')}
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span className="app-nav-item-label">{t('shell.logout')}</span>
          </button>
        </div>
      </aside>
      <main ref={setMainEl} className="app-main">
        {children}
      </main>
      {embedded ? (mainEl ? <ScrollToTop target={mainEl} /> : null) : <ScrollToTop />}
    </div>
  );
}

export function PageToolbar({
  left,
  right,
  className,
}: {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  if (!left && !right) return null;

  return (
    <div className={['page-toolbar', className].filter(Boolean).join(' ')}>
      {left ? <div className="page-toolbar-left">{left}</div> : null}
      {right ? <div className="page-toolbar-right">{right}</div> : null}
    </div>
  );
}

export interface PageToolbarSearchProps {
  label?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
}

export function PageToolbarSearch({
  label,
  placeholder,
  value,
  onChange,
  'aria-label': ariaLabel,
}: PageToolbarSearchProps) {
  const { t } = useTranslation('ui');
  return (
    <Field label={label ?? t('field.search')}>
      <InputGroup>
        <InputGroupAddon>
          <Search size={16} strokeWidth={1.5} aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={ariaLabel}
        />
      </InputGroup>
    </Field>
  );
}

export function PageFilterPanel({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={['page-filter-panel', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function PageBackLink({
  label,
  onClick,
  className,
}: {
  label?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={['page-header-back', className].filter(Boolean).join(' ')} onClick={onClick}>
      <ArrowLeft size={14} strokeWidth={1.5} aria-hidden />
      {label}
    </button>
  );
}

export interface BreadcrumbTrailItem {
  label: ReactNode;
  /** The last non-current entry gets `onBack` wired in automatically. */
  onClick?: () => void;
  href?: string;
  isCurrent?: boolean;
}

export function PageBreadcrumbTrail({
  items,
  className,
}: {
  items?: BreadcrumbTrailItem[] | null;
  className?: string;
}) {
  if (!items?.length) return null;

  return (
    <Breadcrumb className={['page-header-breadcrumb-trail', className].filter(Boolean).join(' ')}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? <BreadcrumbSeparator /> : null}
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbLink isCurrent>{item.label}</BreadcrumbLink>
              ) : item.onClick ? (
                <button type="button" className="breadcrumb-link breadcrumb-link-btn" onClick={item.onClick}>
                  {item.label}
                </button>
              ) : item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <span className="breadcrumb-ancestor">{item.label}</span>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function findParentBreadcrumbIndex(items?: BreadcrumbTrailItem[] | null): number {
  if (!items?.length) return -1;
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index].isCurrent) return index;
  }
  return -1;
}

function wireBackIntoTrail(
  items: BreadcrumbTrailItem[] | null,
  onBack?: () => void,
): BreadcrumbTrailItem[] | null {
  if (!items?.length || !onBack) return items;

  const parentIndex = findParentBreadcrumbIndex(items);
  if (parentIndex < 0) return items;

  return items.map((item, index) => {
    if (index !== parentIndex || item.onClick || item.href) return item;
    return { ...item, onClick: onBack };
  });
}

function resolveBackLabel(
  backLabel: ReactNode,
  breadcrumb: ReactNode,
  items: BreadcrumbTrailItem[] | null,
): ReactNode {
  if (backLabel) return backLabel;
  if (breadcrumb) return breadcrumb;
  const parentIndex = findParentBreadcrumbIndex(items);
  if (parentIndex < 0) return null;
  return items?.[parentIndex]?.label ?? null;
}

export interface PageHeaderProps {
  backLabel?: ReactNode;
  onBack?: () => void;
  /** Legacy single-crumb API. Prefer `breadcrumbs`. */
  breadcrumb?: ReactNode;
  breadcrumbs?: BreadcrumbTrailItem[];
  onBreadcrumbClick?: () => void;
  title?: ReactNode;
  count?: number | string;
  countLabel?: string;
  description?: ReactNode;
  /** Shown in a help tooltip beside the title. */
  hint?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
}

export function PageHeader({
  backLabel,
  onBack,
  breadcrumb,
  breadcrumbs,
  onBreadcrumbClick,
  title,
  count,
  countLabel,
  description,
  hint,
  meta,
  actions,
  filters,
}: PageHeaderProps) {
  const { t } = useTranslation('ui');
  const backHandler = onBack ?? onBreadcrumbClick;
  const rawTrail =
    breadcrumbs ??
    (breadcrumb
      ? [{ label: breadcrumb, onClick: backHandler, isCurrent: !backHandler }]
      : null);
  const trail = wireBackIntoTrail(rawTrail, backHandler);
  const resolvedBackLabel = resolveBackLabel(backLabel, breadcrumb, trail);
  const legacyBackOnly = !breadcrumbs && Boolean(breadcrumb && backHandler);
  const showBack = Boolean(backHandler && resolvedBackLabel);
  const showTrail = Boolean(trail && !legacyBackOnly);
  const showCount = count != null && count !== '';

  return (
    <header className={cn('page-header', filters && 'page-header--with-filters')}>
      <div className="page-header-main">
        {showBack || showTrail ? (
          <div className="page-header-nav">
            {showBack ? (
              <PageBackLink label={resolvedBackLabel} onClick={backHandler} />
            ) : null}
            {showTrail ? <PageBreadcrumbTrail items={trail} /> : null}
          </div>
        ) : null}
        <div className="page-header-title-row">
          <div className="page-header-heading">
            <h1>{title}</h1>
            {showCount ? (
              <Indicator
                value={count}
                label={countLabel}
                className="page-header-count"
                showZero
              />
            ) : null}
            {hint ? (
              <Tip label={hint} side="top">
                <button
                  type="button"
                  className="page-header-hint"
                  aria-label={t('shell.aboutSection', {
                    section: typeof title === 'string' ? title : t('shell.thisSection'),
                  })}
                >
                  <CircleHelp size={18} strokeWidth={1.5} aria-hidden />
                </button>
              </Tip>
            ) : null}
          </div>
          {actions ? <div className="page-header-actions">{actions}</div> : null}
        </div>
        {description ? (
          <div className="page-header-description">{description}</div>
        ) : null}
        {meta ? <div className="page-header-meta">{meta}</div> : null}
        {filters ? <div className="page-header-filters">{filters}</div> : null}
      </div>
    </header>
  );
}

/**
 * The content column — a sibling of PageHeader inside AppShell, never its
 * parent. Caps at --content-max and centers itself, so it needs no second
 * width wrapper around it.
 */
export function PageContent({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div className={cn('app-content', className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  icon,
  variant,
}: {
  label?: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  variant?: 'critical' | 'warning';
}) {
  const cls = ['stat-card', variant === 'critical' ? 'stat-card-critical' : '', variant === 'warning' ? 'stat-card-warning' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <div className="stat-card-label">
        {label}
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}

export interface AlertRecord {
  severity: 'critical' | 'warning';
  title: ReactNode;
  institution: ReactNode;
  date: ReactNode;
}

export function AlertRow({ alert, icon }: { alert: AlertRecord; icon?: ReactNode }) {
  const { t } = useTranslation('ui');
  return (
    <article className="alert-row">
      <div className={cn('alert-row-icon', alert.severity)}>{icon}</div>
      <div className="alert-row-body">
        <h3 className="alert-row-title">{alert.title}</h3>
        <div className="alert-row-meta">
          <span>{alert.institution}</span>
          <span>{alert.date}</span>
        </div>
      </div>
      <Badge variant={alert.severity === 'critical' ? 'critical' : 'warning'}>
        {alert.severity === 'critical' ? t('alert.critical') : t('alert.notice')}
      </Badge>
    </article>
  );
}

export interface DataTableProps {
  columns: string[];
  /** One array of cells per row — index-aligned with `columns`. */
  rows: ReactNode[][];
  className?: string;
  onRowClick?: (row: ReactNode[], index: number) => void;
  getRowAriaLabel?: (row: ReactNode[], index: number) => string;
}

export function DataTable({
  columns,
  rows,
  className,
  onRowClick,
  getRowAriaLabel,
}: DataTableProps) {
  return (
    <div className={cn('data-table-wrap', className)}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const clickable = Boolean(onRowClick);
            return (
              <tr
                key={i}
                className={clickable ? 'data-table-row-clickable' : undefined}
                onClick={clickable ? () => onRowClick?.(row, i) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick?.(row, i);
                        }
                      }
                    : undefined
                }
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable && getRowAriaLabel ? getRowAriaLabel(row, i) : undefined}
              >
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The stack that goes INSIDE a DataTable cell — a name with its description
 * and/or a line of meta. It exists because `.data-table-entity` is
 * `display: flex`, and putting that class on the `<td>` drops the cell out of
 * the table's column algorithm and collapses the layout, silently. Rendering
 * the div for you is the whole point; pass this as a cell and it cannot go
 * wrong.
 */
export function TableEntity({
  name,
  description,
  meta,
  children,
  className,
}: {
  name?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('data-table-entity', className)}>
      {name ? <span className="data-table-name">{name}</span> : null}
      {description ? <span className="data-table-desc">{description}</span> : null}
      {meta ? <span className="data-table-meta">{meta}</span> : null}
      {children}
    </div>
  );
}

export function Toast({ message }: { message?: ReactNode }) {
  return (
    <div className={cn('app-toast', message && 'visible')} role="status" aria-live="polite">
      {message ? (
        <p>
          <Check size={14} strokeWidth={1.5} />
          {message}
        </p>
      ) : null}
    </div>
  );
}

export interface LoginPanelProps {
  logo?: ReactNode;
  productName?: ReactNode;
  tagline?: ReactNode;
  /** Sign-in card heading. This component carries no narrative of its own — every string is a prop. */
  title: ReactNode;
  intro?: ReactNode;
  /** Label for the primary action, e.g. "Continue with Okta". */
  continueLabel: ReactNode;
  /** Label shown on the same button while `onSubmit` is pending. */
  redirectingLabel: ReactNode;
  /** Shown under the button while redirecting. */
  verifyingLabel?: ReactNode;
  footnote?: ReactNode;
  poweredBy?: ReactNode;
  onSubmit: () => void;
}

export function LoginPanel({
  logo,
  productName,
  tagline,
  title,
  intro,
  continueLabel,
  redirectingLabel,
  verifyingLabel,
  footnote,
  poweredBy,
  onSubmit,
}: LoginPanelProps) {
  const [redirecting, setRedirecting] = useState(false);

  function handleContinue() {
    setRedirecting(true);
    setTimeout(() => onSubmit(), 700);
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          {logo}
          <h1>{productName}</h1>
          <p>{tagline}</p>
        </div>
        <div className="login-card">
          <h2>{title}</h2>
          {intro ? <p className="t-app-body mb-5 text-ink-muted">{intro}</p> : null}
          <div className="login-actions">
            <Button variant="solid" onClick={handleContinue} disabled={redirecting}>
              {redirecting ? redirectingLabel : continueLabel}
            </Button>
          </div>
          {redirecting && verifyingLabel ? (
            <p className="t-app-small mt-3 text-center text-ink-faint">{verifyingLabel}</p>
          ) : null}
          {footnote ? <p className="login-foot">{footnote}</p> : null}
        </div>
      </div>
      {poweredBy ? <p className="login-powered">{poweredBy}</p> : null}
    </div>
  );
}
