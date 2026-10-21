import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

/**
 * Joins related buttons into one segmented control: shared hairlines, only the
 * outer corners rounded. `role="group"` with plain Tab navigation — this is for
 * a set of independent actions.
 *
 * For a *single* choice out of several (a selected state), use `ToggleGroup`
 * instead: it carries the roving-focus and pressed semantics this doesn't.
 */
export interface ButtonGroupProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = 'horizontal', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation}
      className={cn('button-group', `button-group--${orientation}`, className)}
      {...props}
    />
  );
});

export interface ButtonGroupSeparatorProps extends ComponentPropsWithoutRef<'span'> {
  orientation?: 'horizontal' | 'vertical';
}

export const ButtonGroupSeparator = forwardRef<HTMLSpanElement, ButtonGroupSeparatorProps>(
  function ButtonGroupSeparator({ orientation = 'vertical', className, ...props }, ref) {
  return (
    <span
      ref={ref}
      role="separator"
      aria-orientation={orientation}
        className={cn('button-group-separator', `button-group-separator--${orientation}`, className)}
        {...props}
      />
    );
  },
);

/** A static label segment (a unit, a prefix) that isn't clickable. */
export interface ButtonGroupTextProps extends ComponentPropsWithoutRef<'span'> {
  asChild?: boolean;
}

export const ButtonGroupText = forwardRef<HTMLSpanElement, ButtonGroupTextProps>(
  function ButtonGroupText({ asChild, className, children, ...props }, ref) {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp ref={ref} className={cn('button-group-text', className)} {...props}>
        {children}
      </Comp>
    );
  },
);
