import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type ReactNode,
} from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { buttonVariants, iconButtonVariants } from './button-variants';

export function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg className="arr" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 13L13 3M13 3H5M13 3V11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Both buttons render an `<a>` when `href` is set and a `<button>` otherwise.
 * The props are declared as button attributes — the superset callers actually
 * use — and the anchor branch re-casts them, because a discriminated union here
 * would force every call site to widen `href` before it could be passed through.
 */
type PolymorphicRef = ForwardedRef<HTMLButtonElement & HTMLAnchorElement>;

export interface ButtonProps
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  /** Renders an `<a>` instead of a `<button>`. */
  href?: string;
  /** Anchor-only, honoured when `href` is set. */
  target?: string;
  rel?: string;
  /** Appends the brand outbound arrow after the label. */
  arrow?: boolean;
}

export interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  /** Anchor-only, honoured when `href` is set. */
  target?: string;
  rel?: string;
  /** An icon has no text, so this becomes the accessible name. Always pass it. */
  label: string;
  children?: ReactNode;
}

/**
 * Icon-only button, round.
 *
 * Same semantics as `Button` on purpose: it reuses `buttonVariants`, so the
 * `variant` vocabulary, hover and focus behaviour are identical, `href` renders
 * an anchor, and forwardRef keeps it valid as a Radix `asChild` trigger. `.btn`
 * is already a pill, so an equal width and height is what makes it a circle.
 */
export const IconButton = forwardRef<HTMLButtonElement & HTMLAnchorElement, IconButtonProps>(
  function IconButton({ variant, size, label, href, className, children, ...props }, ref) {
    const cls = cn(
      buttonVariants({ variant, size: 'md' }),
      iconButtonVariants({ size }),
      className,
    );

    if (href) {
      return (
        <a
          ref={ref as PolymorphicRef}
          className={cls}
          href={href}
          aria-label={label}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} type="button" className={cls} aria-label={label} {...props}>
        {children}
      </button>
    );
  },
);

export const Button = forwardRef<HTMLButtonElement & HTMLAnchorElement, ButtonProps>(
  function Button({ variant, size, arrow, href, className, children, ...props }, ref) {
    const cls = cn(buttonVariants({ variant, size }), className);
    const inner = (
      <>
        {children}
        {arrow ? <Arrow /> : null}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as PolymorphicRef}
          className={cls}
          href={href}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </a>
      );
    }

    return (
      <button ref={ref} type="button" className={cls} {...props}>
        {inner}
      </button>
    );
  },
);
