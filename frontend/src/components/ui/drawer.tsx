import { forwardRef, type ComponentProps, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '../../lib/utils';

/**
 * vaul-based Drawer: a draggable, physics-y sheet (bottom by default) — the
 * mobile-first counterpart to the side Sheet in sheet.jsx. Uses its own
 * `.vdrawer-*` classes so it never collides with Sheet's `.drawer-*` styles.
 * `shouldScaleBackground` defaults to false (scaling needs a wrapper element
 * with data-vaul-drawer-wrapper, which this app doesn't set up).
 */
export function Drawer({ shouldScaleBackground = false, ...props }: ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
}

export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerPortal = DrawerPrimitive.Portal;
export const DrawerClose = DrawerPrimitive.Close;

export const DrawerContent = forwardRef<
  ComponentRef<typeof DrawerPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(function DrawerContent({ className, children, ...props }, ref) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="dialog-overlay" />
      <DrawerPrimitive.Content ref={ref} className={cn('vdrawer-content', className)} {...props}>
        <div className="vdrawer-handle" aria-hidden />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
});

export function DrawerHeader({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('vdrawer-header', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('vdrawer-footer', className)} {...props} />;
}

export const DrawerTitle = forwardRef<
  ComponentRef<typeof DrawerPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return <DrawerPrimitive.Title ref={ref} className={cn('vdrawer-title', className)} {...props} />;
});

export const DrawerDescription = forwardRef<
  ComponentRef<typeof DrawerPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return <DrawerPrimitive.Description ref={ref} className={cn('vdrawer-desc', className)} {...props} />;
});
