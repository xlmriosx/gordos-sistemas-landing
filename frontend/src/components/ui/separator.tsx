import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../../lib/utils';

/**
 * Radix Separator: a hairline divider, horizontal or vertical. Decorative by
 * default (aria-hidden); pass `decorative={false}` for a semantic separator.
 */
export const Separator = forwardRef<
  ComponentRef<typeof SeparatorPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(function Separator({ className, orientation = 'horizontal', decorative = true, ...props }, ref) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      className={cn('separator', `separator--${orientation}`, className)}
      {...props}
    />
  );
});
