import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/utils';

/**
 * Radix Progress: determinate bar (0–100). The indicator width is driven off
 * `value` via a transform. Styled with the brand `.progress-*` classes.
 */
export const Progress = forwardRef<
  ComponentRef<typeof ProgressPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(function Progress({ className, value = 0, 'aria-label': ariaLabel, ...props }, ref) {
  const { t } = useTranslation('ui');
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('progress', className)}
      value={value}
      aria-label={ariaLabel ?? t('status.progress')}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="progress-indicator"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
