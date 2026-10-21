import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/utils';

/**
 * Radix Label: clicking forwards focus/activation to the associated control.
 * Uppercase mono label matching the brand `.field label` treatment.
 */
export const Label = forwardRef<
  ComponentRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(function Label({ className, ...props }, ref) {
  return <LabelPrimitive.Root ref={ref} className={cn('label', className)} {...props} />;
});
