import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../../lib/utils';

/**
 * Radix Switch: an accessible on/off toggle. Track + thumb are styled with the
 * brand `.switch` / `.switch-thumb` classes and animate via [data-state].
 */
export const Switch = forwardRef<
  ComponentRef<typeof SwitchPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root ref={ref} className={cn('switch', className)} {...props}>
      <SwitchPrimitive.Thumb className="switch-thumb" />
    </SwitchPrimitive.Root>
  );
});
