import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Variants map to the brand button classes in primitives.css so the visual
 * language stays pixel-identical. CVA centralizes the variant→class logic and
 * cn() lets callers layer overrides. forwardRef makes the button a valid
 * `asChild` target for Radix triggers (DropdownMenu, Popover, Tooltip).
 */
export const buttonVariants = cva('btn', {
  variants: {
    variant: {
      solid: 'btn-solid',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      table: 'btn-table',
      danger: 'btn-danger',
    },
    size: {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    },
  },
  defaultVariants: { variant: 'solid', size: 'md' },
});

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;

export const iconButtonVariants = cva('icon-btn', {
  variants: {
    size: {
      sm: 'icon-btn--sm',
      md: '',
      lg: 'icon-btn--lg',
    },
  },
  defaultVariants: { size: 'md' },
});
