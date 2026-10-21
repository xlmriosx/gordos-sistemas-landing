import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from './button';

/**
 * Side sheet built on Radix Dialog (a drawer is a dialog that slides in from an
 * edge). Same accessibility guarantees as Dialog; slide motion via [data-state].
 *
 * Compose it: `SheetHeader` (with `SheetTitle` / `SheetDescription`) then
 * `SheetBody`. The panel itself carries no padding, because the header and body
 * own theirs — but pass raw children and it falls back to a padded box rather
 * than sitting them flush against the edges.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export interface SheetContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right' | 'top' | 'bottom';
  showClose?: boolean;
}

export const SheetContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent({ className, side = 'right', showClose = true, children, ...props }, ref) {
  const { t } = useTranslation('ui');
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn('drawer-panel', `drawer-panel--${side}`, className)}
        {...props}
      >
        {/* Lives here, not in the `Drawer` wrapper: a sheet opened with the parts
            directly had no way to close except Escape. Matches DialogContent. */}
        {showClose ? (
          <DialogPrimitive.Close asChild>
            <IconButton variant="ghost" size="sm" label={t('action.close')} className="overlay-close">
              <X size={18} strokeWidth={1.5} aria-hidden />
            </IconButton>
          </DialogPrimitive.Close>
        ) : null}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export const SheetHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SheetHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('drawer-header', className)} {...props} />;
  },
);

export const SheetTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function SheetTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn('dialog-title', className)} {...props} />;
});

export const SheetDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cn('sub', className)} {...props} />;
});

/** Scrolls when the content is taller than the panel. */
export const SheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SheetBody({ className, ...props }, ref) {
    return <div ref={ref} className={cn('drawer-body', className)} {...props} />;
  },
);

export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

/**
 * Backward-compatible Drawer — preserves the app's existing API
 * ({ open, onClose, title, subtitle, children }).
 */
export function Drawer({ open, onClose, title, subtitle, children }: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => (next ? null : onClose?.())}>
      <SheetContent aria-describedby={subtitle ? undefined : ''}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {subtitle ? <SheetDescription>{subtitle}</SheetDescription> : null}
        </SheetHeader>
        <SheetBody>{children}</SheetBody>
      </SheetContent>
    </Sheet>
  );
}
