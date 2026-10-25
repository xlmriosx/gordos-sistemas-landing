import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

/**
 * Radix Tabs: roving focus, arrow-key navigation, and correct ARIA wiring.
 * Styled with the brand `.tabs-*` classes; the active trigger uses an
 * underline that reads as a hairline in the brand system.
 */
export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return <TabsPrimitive.List ref={ref} className={cn('tabs-list', className)} {...props} />;
});

export const TabsTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return <TabsPrimitive.Trigger ref={ref} className={cn('tabs-trigger', className)} {...props} />;
});

export const TabsContent = forwardRef<
  ComponentRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return <TabsPrimitive.Content ref={ref} className={cn('tabs-content', className)} {...props} />;
});
