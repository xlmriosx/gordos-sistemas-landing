import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '../../lib/utils';

/**
 * Radix HoverCard: a rich preview shown on hover/focus (unlike Tooltip, which
 * is text-only). Reuses the popover surface treatment.
 */
export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const HoverCardContent = forwardRef<
  ComponentRef<typeof HoverCardPrimitive.Content>,
  ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(function HoverCardContent({ className, align = 'center', sideOffset = 6, ...props }, ref) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn('popover-content', 'hover-card-content', className)}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
});
