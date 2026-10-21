import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

/**
 * Radix Popover for rich, non-menu overlays (multi-select filters, etc.) where
 * the content holds arbitrary interactive controls rather than a menu list.
 */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent(
  {
    className,
    align = 'start',
    side = 'bottom',
    sideOffset = 6,
    collisionPadding = 16,
    sticky = 'partial',
    children,
    ...props
  },
  ref,
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        sticky={sticky}
        className={cn('popover-content', className)}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
