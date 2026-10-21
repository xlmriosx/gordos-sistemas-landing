import { useEffect, useState, type HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from './button';

const DEFAULT_THRESHOLD = 120;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readScrollTop(root: HTMLElement | Window): number {
  if (root instanceof Window) return root.scrollY || document.documentElement.scrollTop;
  return root.scrollTop;
}

function scrollRootToTop(root: HTMLElement | Window) {
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (root instanceof Window) {
    root.scrollTo({ top: 0, behavior });
    return;
  }
  root.scrollTo({ top: 0, behavior });
}

export interface ScrollToTopProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Scroll container to watch. Omit (or pass `null`) for the window —
   * use an element for pane scrollers like embedded `.app-main`.
   */
  target?: HTMLElement | null;
  /** Pixels away from the top before the control appears. */
  threshold?: number;
}

/**
 * Floating chevron (bottom-right) that appears once the scroll root leaves
 * the top, and scrolls back up on press. Disappears again at the top.
 */
export function ScrollToTop({
  target = null,
  threshold = DEFAULT_THRESHOLD,
  className,
  ...props
}: ScrollToTopProps) {
  const { t } = useTranslation('ui');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root: HTMLElement | Window = target ?? window;

    const measure = () => {
      setVisible(readScrollTop(root) > threshold);
    };

    measure();
    root.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      root.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [target, threshold]);

  return (
    <div
      className={cn('scroll-to-top', className)}
      data-visible={visible ? '' : undefined}
      {...props}
    >
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        label={t('action.scrollToTop')}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        onClick={() => scrollRootToTop(target ?? window)}
      >
        <ChevronUp size={16} strokeWidth={1.5} aria-hidden />
      </IconButton>
    </div>
  );
}
