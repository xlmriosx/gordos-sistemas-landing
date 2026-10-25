import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * A single row of content: media, title + description, actions. The generic
 * building block behind list rows, settings rows, and pickers — one step below
 * `app-card` (which is opinionated about apps) and one above a bare flex row.
 *
 * Not a list by itself: wrap a run of them in `ItemGroup` so they share
 * hairlines, and use `ItemSeparator` between groups.
 */
const itemVariants = cva('item', {
  variants: {
    variant: {
      default: '',
      outline: 'item--outline',
      muted: 'item--muted',
    },
    size: {
      default: '',
      sm: 'item--sm',
      xs: 'item--xs',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export interface ItemProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof itemVariants> {
  asChild?: boolean;
}

export const Item = forwardRef<HTMLDivElement, ItemProps>(function Item(
  { variant, size, asChild, className, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp ref={ref} className={cn(itemVariants({ variant, size }), className)} {...props}>
      {children}
    </Comp>
  );
});

export const ItemGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ItemGroup({ className, ...props }, ref) {
  return <div ref={ref} role="list" className={cn('item-group', className)} {...props} />;
});

export const ItemSeparator = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(function ItemSeparator({ className, ...props }, ref) {
  return (
    <span ref={ref} role="separator" className={cn('item-separator', className)} {...props} />
  );
});

const itemMediaVariants = cva('item-media', {
  variants: {
    variant: {
      default: '',
      icon: 'item-media--icon',
      image: 'item-media--image',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface ItemMediaProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof itemMediaVariants> {}

export const ItemMedia = forwardRef<HTMLDivElement, ItemMediaProps>(function ItemMedia(
  { variant, className, ...props },
  ref,
) {
  return <div ref={ref} className={cn(itemMediaVariants({ variant }), className)} {...props} />;
});

export const ItemContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ItemContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('item-content', className)} {...props} />;
});

export const ItemTitle = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function ItemTitle({ className, ...props }, ref) {
  return <p ref={ref} className={cn('item-title', className)} {...props} />;
});

export const ItemDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function ItemDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn('item-description', className)} {...props} />;
});

export const ItemActions = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ItemActions({ className, ...props }, ref) {
  return <div ref={ref} className={cn('item-actions', className)} {...props} />;
});

export const ItemHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ItemHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('item-header', className)} {...props} />;
});

export const ItemFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ItemFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cn('item-footer', className)} {...props} />;
});
