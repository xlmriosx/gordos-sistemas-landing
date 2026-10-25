import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Conversational content in a bubble. Sizes to its content up to 80% of the
 * container (see `.bubble` in ds-components.css) so a short reply stays short.
 *
 * Variants are brand surfaces, not chat-app colors: the "user" side is `tinted`
 * (dusty mauve, the selection accent) and the assistant side is `muted`. Keep
 * `destructive` for a failed turn — it's the only one that reads as an alarm.
 */
const bubbleVariants = cva('bubble', {
  variants: {
    variant: {
      default: 'bubble--default',
      secondary: 'bubble--secondary',
      muted: 'bubble--muted',
      tinted: 'bubble--tinted',
      outline: 'bubble--outline',
      ghost: 'bubble--ghost',
      destructive: 'bubble--destructive',
    },
    align: {
      start: 'bubble--start',
      end: 'bubble--end',
    },
  },
  defaultVariants: { variant: 'default', align: 'start' },
});

export interface BubbleProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof bubbleVariants> {}

export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  { variant, align, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-align={align ?? 'start'}
      className={cn(bubbleVariants({ variant, align }), className)}
      {...props}
    />
  );
});

/** The bubble's text. `asChild` lets it be a button/link when the turn is interactive. */
export interface BubbleContentProps extends ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

export const BubbleContent = forwardRef<HTMLDivElement, BubbleContentProps>(
  function BubbleContent({ asChild, className, children, ...props }, ref) {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp ref={ref} className={cn('bubble-content', className)} {...props}>
        {children}
      </Comp>
    );
  },
);

/** Overlapped reaction chips pinned to a bubble edge. */
export interface BubbleReactionsProps extends ComponentPropsWithoutRef<'div'> {
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
}

export const BubbleReactions = forwardRef<HTMLDivElement, BubbleReactionsProps>(
  function BubbleReactions({ side = 'bottom', align = 'start', className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'bubble-reactions',
        `bubble-reactions--${side}`,
        `bubble-reactions--${align}`,
        className,
      )}
        {...props}
      />
    );
  },
);

/** Consecutive bubbles from one sender — tightens the gap and softens inner corners. */
export const BubbleGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function BubbleGroup({ className, ...props }, ref) {
  return <div ref={ref} className={cn('bubble-group', className)} {...props} />;
});
