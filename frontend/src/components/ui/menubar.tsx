import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Radix Menubar: a horizontal application menu bar (File / Edit / View …).
 * Triggers use a compact button treatment; the panels reuse `.menu-content`.
 */
export const Menubar = forwardRef<
  ComponentRef<typeof MenubarPrimitive.Root>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(function Menubar({ className, ...props }, ref) {
  return <MenubarPrimitive.Root ref={ref} className={cn('menubar', className)} {...props} />;
});

export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarSub = MenubarPrimitive.Sub;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

export const MenubarTrigger = forwardRef<
  ComponentRef<typeof MenubarPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(function MenubarTrigger({ className, ...props }, ref) {
  return <MenubarPrimitive.Trigger ref={ref} className={cn('menubar-trigger', className)} {...props} />;
});

export const MenubarContent = forwardRef<
  ComponentRef<typeof MenubarPrimitive.Content>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(function MenubarContent(
  { className, align = 'start', sideOffset = 6, ...props },
  ref,
) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn('menu-content', className)} {...props} />
    </MenubarPrimitive.Portal>
  );
});

export const MenubarItem = forwardRef<
  ComponentRef<typeof MenubarPrimitive.Item>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.Item>
>(function MenubarItem({ className, ...props }, ref) {
  return <MenubarPrimitive.Item ref={ref} className={cn('menu-item', className)} {...props} />;
});

export const MenubarLabel = forwardRef<
  ComponentRef<typeof MenubarPrimitive.Label>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.Label>
>(function MenubarLabel({ className, ...props }, ref) {
  return <MenubarPrimitive.Label ref={ref} className={cn('menu-label', className)} {...props} />;
});

export const MenubarSeparator = forwardRef<
  ComponentRef<typeof MenubarPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(function MenubarSeparator({ className, ...props }, ref) {
  return <MenubarPrimitive.Separator ref={ref} className={cn('menu-separator', className)} {...props} />;
});

export const MenubarCheckboxItem = forwardRef<
  ComponentRef<typeof MenubarPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(function MenubarCheckboxItem({ className, children, ...props }, ref) {
  return (
    <MenubarPrimitive.CheckboxItem ref={ref} className={cn('menu-item', 'menu-item--indented', className)} {...props}>
      <span className="menu-item-indicator">
        <MenubarPrimitive.ItemIndicator><Check size={14} strokeWidth={2} /></MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
});

export const MenubarRadioItem = forwardRef<
  ComponentRef<typeof MenubarPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(function MenubarRadioItem({ className, children, ...props }, ref) {
  return (
    <MenubarPrimitive.RadioItem ref={ref} className={cn('menu-item', 'menu-item--indented', className)} {...props}>
      <span className="menu-item-indicator">
        <MenubarPrimitive.ItemIndicator><Circle size={7} fill="currentColor" /></MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
});

export const MenubarSubTrigger = forwardRef<
  ComponentRef<typeof MenubarPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger>
>(function MenubarSubTrigger({ className, children, ...props }, ref) {
  return (
    <MenubarPrimitive.SubTrigger ref={ref} className={cn('menu-item', className)} {...props}>
      {children}
      <ChevronRight size={14} strokeWidth={1.5} className="menu-item-chevron" />
    </MenubarPrimitive.SubTrigger>
  );
});

export const MenubarSubContent = forwardRef<
  ComponentRef<typeof MenubarPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(function MenubarSubContent({ className, ...props }, ref) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent ref={ref} className={cn('menu-content', className)} {...props} />
    </MenubarPrimitive.Portal>
  );
});
