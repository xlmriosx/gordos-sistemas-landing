import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

/**
 * Three shells, one page region.
 *
 * The invariant that makes them interchangeable, and the only thing here worth
 * defending: all three render the same `<main className="app-main">`, and
 * differ only in what sits OUTSIDE it. A screen never learns which shell it is
 * in, so swapping shells cannot touch a screen — which is what makes the choice
 * reversible the day an app grows from two destinations to seven.
 *
 * `AppShell` (the sidebar one) lives in `app-kit.tsx` and predates these two.
 *
 * ## One deliberate divergence from the prototype
 *
 * Upstream these two import the product's own account chip and overflow menu
 * directly. Here they take both as slots (`account`, `menu`), because a kit
 * cannot depend on a session menu it does not own: what goes in a menu is a
 * product decision (which languages, whether there is a sign-out at all), and a
 * shell that imported one would hand every consumer somebody else's answer.
 * The caller passes what it has; the shell owns where it sits.
 */

export interface ShellNavItem {
  id: string;
  label: string;
  /** Renders the item but blocks navigation — "not available here". */
  disabled?: boolean;
}

interface ShellProps {
  nav?: ShellNavItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  /** Who is signed in. A slot, not a component this kit chooses. */
  account?: ReactNode;
  /** The session/overflow menu. Same reason. */
  menu?: ReactNode;
  /** The product's own name. Text, not a slot for a second nav. */
  workspace?: ReactNode;
  navLabel?: string;
  /** Skips viewport-fixed positioning — used when a shell is nested in a page. */
  embedded?: boolean;
  children?: ReactNode;
}

/**
 * Few destinations, conventional web: brand left, destinations centre, account
 * right. The nav is horizontal, so it stops being able to hold a long list —
 * that limit is the point, and it is why `pickShell` sends 5 or more to the
 * sidebar instead.
 */
export function TopbarShell({
  nav = [],
  activeId,
  onNavigate,
  account,
  menu,
  workspace,
  navLabel,
  embedded = false,
  children,
}: ShellProps) {
  const { t } = useTranslation('ui');
  return (
    <div className={cn('app-shell', 'app-shell--topbar', embedded && 'app-shell--embedded')}>
      <header className="app-topbar">
        {workspace ? <p className="app-topbar-brand">{workspace}</p> : null}
        <nav className="app-topbar-nav" aria-label={navLabel ?? t('shell.navigation')}>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              className={cn(
                'app-topbar-item',
                activeId === item.id && 'active',
                item.disabled && 'disabled',
              )}
              onClick={() => !item.disabled && onNavigate?.(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {account || menu ? (
          <div className="app-topbar-session">
            {account}
            {menu}
          </div>
        ) : null}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

/**
 * One screen, no destinations. It still carries the session slots, because
 * language, theme and sign-out are not navigation: an app with a single screen
 * still has a person using it.
 */
export function PlainShell({ account, menu, workspace, embedded = false, children }: ShellProps) {
  const bare = !workspace && !account && !menu;
  return (
    <div className={cn('app-shell', 'app-shell--plain', embedded && 'app-shell--embedded')}>
      {bare ? null : (
        <header className="app-plainbar">
          {workspace ? <p className="app-topbar-brand">{workspace}</p> : null}
          <div className="app-topbar-session">
            {account}
            {menu}
          </div>
        </header>
      )}
      <main className="app-main">{children}</main>
    </div>
  );
}

export type { ShellKind } from './pick-shell';
