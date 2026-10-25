import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '../../lib/utils';

/**
 * Radix ToggleGroup: a segmented set of toggles (single or multiple). Renders
 * as a hairline-joined control with the brand `.toggle-group` / `.toggle` look.
 */
export const ToggleGroup = forwardRef<
  ComponentRef<typeof ToggleGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(function ToggleGroup({ className, ...props }, ref) {
  return <ToggleGroupPrimitive.Root ref={ref} className={cn('toggle-group', className)} {...props} />;
});

export const ToggleGroupItem = forwardRef<
  ComponentRef<typeof ToggleGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(function ToggleGroupItem({ className, ...props }, ref) {
  return (
    <ToggleGroupPrimitive.Item ref={ref} className={cn('toggle', 'toggle-group-item', className)} {...props} />
  );
});
