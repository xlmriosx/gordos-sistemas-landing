import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../lib/utils';

/**
 * Radix RadioGroup: roving focus and arrow-key navigation for free. The dot is
 * drawn with the brand `.radio` / `.radio-indicator` classes.
 */
export const RadioGroup = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return <RadioGroupPrimitive.Root ref={ref} className={cn('radio-group', className)} {...props} />;
});

export const RadioGroupItem = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item ref={ref} className={cn('radio', className)} {...props}>
      <RadioGroupPrimitive.Indicator className="radio-indicator" />
    </RadioGroupPrimitive.Item>
  );
});
