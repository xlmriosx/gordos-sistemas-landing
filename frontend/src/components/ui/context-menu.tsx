import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Radix ContextMenu: right-click menu. Reuses the shared `.menu-*` surface so
 * it matches DropdownMenu exactly. Supports items, checkbox/radio items,
 * submenus, labels and separators.
 */
export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuSub = ContextMenuPrimitive.Sub;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

export const ContextMenuContent = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(function ContextMenuContent({ className, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content ref={ref} className={cn('menu-content', className)} {...props} />
    </ContextMenuPrimitive.Portal>
  );
});

export const ContextMenuItem = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>
>(function ContextMenuItem({ className, ...props }, ref) {
  return <ContextMenuPrimitive.Item ref={ref} className={cn('menu-item', className)} {...props} />;
});

export const ContextMenuLabel = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.Label>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(function ContextMenuLabel({ className, ...props }, ref) {
  return <ContextMenuPrimitive.Label ref={ref} className={cn('menu-label', className)} {...props} />;
});

export const ContextMenuSeparator = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(function ContextMenuSeparator({ className, ...props }, ref) {
  return <ContextMenuPrimitive.Separator ref={ref} className={cn('menu-separator', className)} {...props} />;
});

export const ContextMenuCheckboxItem = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(function ContextMenuCheckboxItem(
  { className, children, ...props },
  ref,
) {
  return (
    <ContextMenuPrimitive.CheckboxItem ref={ref} className={cn('menu-item', 'menu-item--indented', className)} {...props}>
      <span className="menu-item-indicator">
        <ContextMenuPrimitive.ItemIndicator><Check size={14} strokeWidth={2} /></ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
});

export const ContextMenuRadioItem = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(function ContextMenuRadioItem(
  { className, children, ...props },
  ref,
) {
  return (
    <ContextMenuPrimitive.RadioItem ref={ref} className={cn('menu-item', 'menu-item--indented', className)} {...props}>
      <span className="menu-item-indicator">
        <ContextMenuPrimitive.ItemIndicator><Circle size={7} fill="currentColor" /></ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
});

export const ContextMenuSubTrigger = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>
>(function ContextMenuSubTrigger(
  { className, children, ...props },
  ref,
) {
  return (
    <ContextMenuPrimitive.SubTrigger ref={ref} className={cn('menu-item', className)} {...props}>
      {children}
      <ChevronRight size={14} strokeWidth={1.5} className="menu-item-chevron" />
    </ContextMenuPrimitive.SubTrigger>
  );
});

export const ContextMenuSubContent = forwardRef<
  ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(function ContextMenuSubContent({ className, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent ref={ref} className={cn('menu-content', className)} {...props} />
    </ContextMenuPrimitive.Portal>
  );
});
