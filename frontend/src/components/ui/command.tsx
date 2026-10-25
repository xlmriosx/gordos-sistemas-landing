import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type ReactNode } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogTitle } from './dialog';

/**
 * cmdk-based Command menu: fast, filterable command palette. Compose with
 * CommandInput / CommandList / CommandGroup / CommandItem. CommandDialog wraps
 * it in the brand modal for a ⌘K launcher.
 */
export const Command = forwardRef<
  ComponentRef<typeof CommandPrimitive>,
  ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function Command({ className, ...props }, ref) {
  return <CommandPrimitive ref={ref} className={cn('command', className)} {...props} />;
});

export interface CommandDialogProps extends ComponentPropsWithoutRef<typeof Dialog> {
  /** Accessible name for the palette — rendered visually hidden. */
  title?: string;
  children?: ReactNode;
}

export function CommandDialog({ title = 'Command palette', children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="command-dialog" showClose={false}>
        {/* A Dialog must have an accessible name. The palette shows no visible
            heading, so the title is present but hidden. */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Command className="command--dialog">{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = forwardRef<
  ComponentRef<typeof CommandPrimitive.Input>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div className="command-input-wrap">
      <Search size={15} strokeWidth={1.5} className="command-input-icon" aria-hidden />
      <CommandPrimitive.Input ref={ref} className={cn('command-input', className)} {...props} />
    </div>
  );
});

export const CommandList = forwardRef<
  ComponentRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className, ...props }, ref) {
  return <CommandPrimitive.List ref={ref} className={cn('command-list', className)} {...props} />;
});

export const CommandEmpty = forwardRef<
  ComponentRef<typeof CommandPrimitive.Empty>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className, ...props }, ref) {
  return <CommandPrimitive.Empty ref={ref} className={cn('command-empty', className)} {...props} />;
});

export const CommandGroup = forwardRef<
  ComponentRef<typeof CommandPrimitive.Group>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({ className, ...props }, ref) {
  return <CommandPrimitive.Group ref={ref} className={cn('command-group', className)} {...props} />;
});

export const CommandItem = forwardRef<
  ComponentRef<typeof CommandPrimitive.Item>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(function CommandItem({ className, ...props }, ref) {
  return <CommandPrimitive.Item ref={ref} className={cn('command-item', className)} {...props} />;
});

export const CommandSeparator = forwardRef<
  ComponentRef<typeof CommandPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function CommandSeparator({ className, ...props }, ref) {
  return <CommandPrimitive.Separator ref={ref} className={cn('command-separator', className)} {...props} />;
});

export function CommandShortcut({ className, ...props }: ComponentPropsWithoutRef<'span'>) {
  return <span className={cn('command-shortcut', className)} {...props} />;
}
