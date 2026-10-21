import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Loading indicator. Wraps the Lucide loader at the kit's `strokeWidth={1.5}`
 * and exposes it as `role="status"` so assistive tech announces the wait.
 *
 * The rotation lives in `.spinner-icon` (ds-components.css) and is disabled
 * under `prefers-reduced-motion` — don't reach for Tailwind's `animate-spin`.
 */
export interface SpinnerProps extends ComponentPropsWithoutRef<'span'> {
  size?: number;
  /** Accessible name announced while the wait lasts. */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 16, label, className, ...props },
  ref,
) {
  const { t } = useTranslation('ui');
  return (
    <span
      ref={ref}
      role="status"
      aria-label={label ?? t('status.loading')}
      className={cn('spinner', className)}
      {...props}
    >
      <Loader2 className="spinner-icon" size={size} strokeWidth={1.5} aria-hidden />
    </span>
  );
});
