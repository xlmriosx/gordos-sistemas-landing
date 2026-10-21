import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Compositional empty state: media + title + description, then actions.
 *
 * The `EmptyState` in primitives.jsx is the shorthand (`title` / `description` /
 * `action` props) and stays the right call for a one-line "nothing here". Reach
 * for this one when the empty state needs more than that — a form, several
 * actions, custom media.
 */
export const Empty = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function Empty({ className, ...props }, ref) {
  return <div ref={ref} className={cn('empty', className)} {...props} />;
});

export const EmptyHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function EmptyHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('empty-header', className)} {...props} />;
});

const emptyMediaVariants = cva('empty-media', {
  variants: {
    variant: {
      default: '',
      // Framed tile — for a Lucide glyph that would otherwise float unanchored.
      icon: 'empty-media--icon',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface EmptyMediaProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof emptyMediaVariants> {}

export const EmptyMedia = forwardRef<HTMLDivElement, EmptyMediaProps>(function EmptyMedia(
  { variant, className, ...props },
  ref,
) {
  return (
    <div ref={ref} aria-hidden className={cn(emptyMediaVariants({ variant }), className)} {...props} />
  );
});

export const EmptyTitle = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function EmptyTitle({ className, ...props }, ref) {
  // Sentient via .t-app-h3 — headings carry the brand voice (DESIGN.md,
  // "The kit underneath" > Typography).
  return <p ref={ref} className={cn('empty-title', 't-app-h3', className)} {...props} />;
});

export const EmptyDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function EmptyDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn('empty-description', className)} {...props} />;
});

export const EmptyContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function EmptyContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('empty-content', className)} {...props} />;
});
