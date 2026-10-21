import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Status chip. Mono uppercase by default so it reads as metadata beside a title,
 * not as a heading.
 *
 * Two axes, kept separate on purpose:
 *  - `variant` is meaning. The four status variants map to the `--status-*`
 *    tokens and are the reason this component exists — never invent a one-off
 *    chip colour. `neutral` and `outline` are for a label that carries no state
 *    (a category, a count), which previously had no variant at all: a bare
 *    `<Badge>` rendered a transparent box with no fill.
 *  - `shape="pill"` is tone. Softer, sentence-case, sans — for a summary count
 *    like "8 live". The default square-ish shape stays for table and row status.
 *
 * Lived in primitives.tsx until it got its own file; primitives still re-exports
 * it so the existing call sites keep working.
 */
const badgeVariants = cva('badge', {
  variants: {
    variant: {
      neutral: 'badge-neutral',
      outline: 'badge-outline',
      ok: 'badge-ok',
      warning: 'badge-warning',
      critical: 'badge-critical',
      info: 'badge-info',
    },
    shape: {
      default: '',
      pill: 'badge-pill',
    },
  },
  defaultVariants: { variant: 'neutral', shape: 'default' },
});

/**
 * Exported so data modules can hold a variant name instead of a JSX element.
 * `NonNullable` because CVA widens every variant with `| null`.
 */
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export interface BadgeProps
  extends ComponentPropsWithoutRef<'span'>,
    VariantProps<typeof badgeVariants> {
  /** Render into the single child element instead of a `<span>` wrapper. */
  asChild?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant, shape, asChild, className, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp ref={ref} className={cn(badgeVariants({ variant, shape }), className)} {...props}>
      {children}
    </Comp>
  );
});
