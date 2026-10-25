import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Breadcrumb: plain, accessible navigation trail — no Radix dependency needed.
 * Compose <Breadcrumb> > <BreadcrumbList> > <BreadcrumbItem> with links and
 * <BreadcrumbSeparator> between them; mark the current page with isCurrent.
 */
export const Breadcrumb = forwardRef<HTMLElement, ComponentPropsWithoutRef<'nav'>>(
  function Breadcrumb({ className, ...props }, ref) {
    const { t } = useTranslation('ui');
    return (
      <nav
        ref={ref}
        aria-label={t('breadcrumb.label')}
        className={cn('breadcrumb', className)}
        {...props}
      />
    );
  },
);

export function BreadcrumbList({ className, ...props }: ComponentPropsWithoutRef<'ol'>) {
  return <ol className={cn('breadcrumb-list', className)} {...props} />;
}

export function BreadcrumbItem({ className, ...props }: ComponentPropsWithoutRef<'li'>) {
  return <li className={cn('breadcrumb-item', className)} {...props} />;
}

export interface BreadcrumbLinkProps extends ComponentPropsWithoutRef<'a'> {
  /** Renders a non-interactive `aria-current="page"` span instead of a link. */
  isCurrent?: boolean;
}

export function BreadcrumbLink({ className, isCurrent, ...props }: BreadcrumbLinkProps) {
  if (isCurrent) {
    return <span className={cn('breadcrumb-current', className)} aria-current="page">{props.children}</span>;
  }
  // Content always arrives via the `...props` spread, invisible to static analysis.
  // oxlint-disable-next-line jsx-a11y/anchor-has-content
  return <a className={cn('breadcrumb-link', className)} {...props} />;
}

export function BreadcrumbSeparator({ className, ...props }: ComponentPropsWithoutRef<'li'>) {
  return (
    <li role="presentation" aria-hidden className={cn('breadcrumb-separator', className)} {...props}>
      <ChevronRight size={14} strokeWidth={1.5} />
    </li>
  );
}
