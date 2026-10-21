import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '../../lib/utils';

/**
 * Radix Toggle: a two-state pressed/unpressed button. Shares the brand
 * `.toggle` class; pressed state is driven by [data-state="on"].
 */
export const Toggle = forwardRef<
  ComponentRef<typeof TogglePrimitive.Root>,
  ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(function Toggle({ className, ...props }, ref) {
  return <TogglePrimitive.Root ref={ref} className={cn('toggle', className)} {...props} />;
});
