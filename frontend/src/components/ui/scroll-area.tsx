import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '../../lib/utils';

/**
 * Radix ScrollArea: a custom, cross-browser scrollbar for constrained regions
 * (long lists inside popovers, drawers, etc.). Styled with `.scroll-area-*`.
 */
export const ScrollArea = forwardRef<
  ComponentRef<typeof ScrollAreaPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(function ScrollArea({ className, children, ...props }, ref) {
  return (
    <ScrollAreaPrimitive.Root ref={ref} className={cn('scroll-area', className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="scroll-area-viewport">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar className="scroll-area-scrollbar" orientation="vertical">
        <ScrollAreaPrimitive.Thumb className="scroll-area-thumb" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
