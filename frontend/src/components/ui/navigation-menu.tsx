import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Radix NavigationMenu without the shared Viewport — each item opens its own
 * panel below the trigger. The Viewport pattern measures content width in a
 * loop (offsetWidth ↔ CSS variable) and drifts narrower on every toggle.
 */
export const NavigationMenu = forwardRef<
  ComponentRef<typeof NavigationMenuPrimitive.Root>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(function NavigationMenu({ className, children, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Root ref={ref} className={cn('navmenu', className)} {...props}>
      {children}
    </NavigationMenuPrimitive.Root>
  );
});

export const NavigationMenuList = forwardRef<
  ComponentRef<typeof NavigationMenuPrimitive.List>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(function NavigationMenuList({ className, ...props }, ref) {
  return <NavigationMenuPrimitive.List ref={ref} className={cn('navmenu-list', className)} {...props} />;
});

export const NavigationMenuItem = NavigationMenuPrimitive.Item;
export const NavigationMenuLink = NavigationMenuPrimitive.Link;

export const NavigationMenuTrigger = forwardRef<
  ComponentRef<typeof NavigationMenuPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(function NavigationMenuTrigger({ className, children, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Trigger ref={ref} className={cn('navmenu-trigger', className)} {...props}>
      {children}
      <ChevronDown size={13} strokeWidth={1.5} className="navmenu-chevron" aria-hidden />
    </NavigationMenuPrimitive.Trigger>
  );
});

export const NavigationMenuContent = forwardRef<
  ComponentRef<typeof NavigationMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(function NavigationMenuContent({ className, ...props }, ref) {
  return <NavigationMenuPrimitive.Content ref={ref} className={cn('navmenu-content', className)} {...props} />;
});
