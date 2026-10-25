import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * An inline status or system note inside a conversation: "Explored 4 files",
 * "Thinking", a labeled divider between turns.
 *
 * This is the non-turn content of a transcript. It is not a `Message`: it has no
 * sender and no bubble, which is exactly why it reads as machine narration
 * rather than as something someone said.
 *
 * Variants are layout, not tone:
 *  - `default`   inline row, no frame
 *  - `border`    framed row, for a note that needs separating from the turns
 *  - `separator` centered label with a rule running out to both sides
 */
const markerVariants = cva('marker', {
  variants: {
    variant: {
      default: 'marker--default',
      border: 'marker--border',
      separator: 'marker--separator',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface MarkerProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof markerVariants> {
  asChild?: boolean;
}

export const Marker = forwardRef<HTMLDivElement, MarkerProps>(function Marker(
  { variant, asChild, className, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      className={cn(markerVariants({ variant }), className)}
      data-variant={variant ?? 'default'}
      {...props}
    >
      {children}
    </Comp>
  );
});

/** Decorative by contract — the text in `MarkerContent` carries the meaning. */
export const MarkerIcon = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(function MarkerIcon({ className, ...props }, ref) {
  return <span ref={ref} aria-hidden className={cn('marker-icon', className)} {...props} />;
});

export const MarkerContent = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(function MarkerContent({ className, ...props }, ref) {
  return <span ref={ref} className={cn('marker-content', className)} {...props} />;
});
