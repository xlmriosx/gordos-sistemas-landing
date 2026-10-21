import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Radix Accordion: single or multiple open items (set `type`). Open/close
 * height is animated in CSS via the --radix-accordion-content-height var.
 */
export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return <AccordionPrimitive.Item ref={ref} className={cn('accordion-item', className)} {...props} />;
});

export const AccordionTrigger = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="accordion-header">
      <AccordionPrimitive.Trigger ref={ref} className={cn('accordion-trigger', className)} {...props}>
        {children}
        <ChevronDown size={16} strokeWidth={1.5} className="accordion-chevron" aria-hidden />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const AccordionContent = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content ref={ref} className={cn('accordion-content', className)} {...props}>
      <div className="accordion-content-inner">{children}</div>
    </AccordionPrimitive.Content>
  );
});
