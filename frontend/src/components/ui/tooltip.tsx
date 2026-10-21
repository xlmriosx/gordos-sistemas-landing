import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

/**
 * Radix Tooltip. Wrap the app once in <TooltipProvider>. Individual tooltips
 * use the <Tip> convenience wrapper for the common label-on-hover case (e.g.
 * icon-only buttons, the collapsed sidebar rail).
 */
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 6, children, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn('tooltip-content', className)}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="tooltip-arrow" width={10} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

export interface TipProps
  extends Omit<ComponentPropsWithoutRef<typeof TooltipContent>, 'children'> {
  label?: ReactNode;
  /** A single element — it becomes the trigger via `asChild`. */
  children: ReactElement;
}

export function Tip({ label, side = 'right', children, ...props }: TipProps) {
  if (!label) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} {...props}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
