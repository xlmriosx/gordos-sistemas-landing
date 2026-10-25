import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Radix Checkbox: keyboard + indeterminate support out of the box. Visuals stay
 * on the brand `.checkbox` class (see ds-components.css); the check glyph is a
 * Lucide icon at the brand stroke width.
 */
export const Checkbox = forwardRef<
  ComponentRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root ref={ref} className={cn('checkbox', className)} {...props}>
      <CheckboxPrimitive.Indicator className="checkbox-indicator">
        {props.checked === 'indeterminate' ? (
          <Minus size={13} strokeWidth={2.5} />
        ) : (
          <Check size={13} strokeWidth={2.5} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
