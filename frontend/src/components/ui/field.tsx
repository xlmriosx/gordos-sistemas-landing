import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Compositional form-field set: `FieldSet` → `FieldLegend` → `FieldGroup` →
 * `Field`. You wire `htmlFor` / `id` / `aria-describedby` yourself, which is the
 * trade for being able to lay a field out any way you need.
 *
 * NOTE — there are two `Field`s in this repo, on purpose:
 *   • `primitives.Field`  — shorthand. Takes `label` / `error` props and
 *     auto-wires id + aria-describedby onto its first child. 18 call sites use
 *     it; it stays the default for a plain labelled control.
 *   • this `Field`       — the upstream shadcn composition. Use it for
 *     horizontal/responsive layouts, grouped fieldsets, or a field whose
 *     description and error need to sit somewhere specific.
 * Import whichever you need per file; don't try to make one wrap the other.
 *
 * Validation and disabled state take TWO attributes, by design: `data-invalid` /
 * `data-disabled` on the `Field` styles the label and description, while
 * `aria-invalid` / `disabled` on the control styles the control. Set both.
 */
const fieldVariants = cva('field-row', {
  variants: {
    orientation: {
      vertical: 'field-row--vertical',
      horizontal: 'field-row--horizontal',
      // Vertical until the container is wide enough — container query in CSS.
      responsive: 'field-row--responsive',
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

export interface FieldProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof fieldVariants> {}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { orientation, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation ?? 'vertical'}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
});

/** Semantic <fieldset>. Pair with FieldLegend so the group has an accessible name. */
export const FieldSet = forwardRef<HTMLFieldSetElement, ComponentPropsWithoutRef<'fieldset'>>(
  function FieldSet({ className, ...props }, ref) {
    return <fieldset ref={ref} className={cn('field-set', className)} {...props} />;
  },
);

const legendVariants = cva('field-legend', {
  variants: {
    variant: {
      // Section heading for the fieldset — Sentient, per DESIGN.md
      // ("The kit underneath" > Typography).
      legend: 'field-legend--legend t-app-h3',
      // Same weight as a control label, for a nested or inline group.
      label: 'field-legend--label',
    },
  },
  defaultVariants: { variant: 'legend' },
});

export interface FieldLegendProps
  extends ComponentPropsWithoutRef<'legend'>,
    VariantProps<typeof legendVariants> {}

export const FieldLegend = forwardRef<HTMLLegendElement, FieldLegendProps>(function FieldLegend(
  { variant, className, ...props },
  ref,
) {
  return <legend ref={ref} className={cn(legendVariants({ variant }), className)} {...props} />;
});

/** Stacks several `Field`s with consistent rhythm. */
export const FieldGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function FieldGroup({ className, ...props }, ref) {
    return <div ref={ref} className={cn('field-group', className)} {...props} />;
  },
);

export interface FieldLabelProps extends ComponentPropsWithoutRef<'label'> {
  asChild?: boolean;
}

export const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(function FieldLabel(
  { asChild, className, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'label';
  return (
    <Comp ref={ref} className={cn('field-label', className)} {...props}>
      {children}
    </Comp>
  );
});

/** Groups the control with its description — the column beside a horizontal label. */
export const FieldContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function FieldContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('field-content', className)} {...props} />;
  },
);

export const FieldTitle = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(
  function FieldTitle({ className, ...props }, ref) {
    return <p ref={ref} className={cn('field-title', className)} {...props} />;
  },
);

export const FieldDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(
  function FieldDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cn('field-description', className)} {...props} />;
  },
);

/**
 * Error slot. Pass `errors` (the shape react-hook-form / a resolver produces) to
 * render them, or children for a single message. Renders nothing when empty, so
 * it's safe to leave mounted. `role="alert"` announces the message on change.
 */
export type FieldErrorEntry = string | { message?: string } | undefined;

export interface FieldErrorProps extends ComponentPropsWithoutRef<'div'> {
  /** The shape react-hook-form / a resolver produces. */
  errors?: FieldErrorEntry[];
}

export const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(function FieldError(
  { errors, className, children, ...props },
  ref,
) {
  const messages = (errors ?? [])
    .map((error) => (typeof error === 'string' ? error : error?.message))
    .filter((message): message is string => Boolean(message));

  if (!children && messages.length === 0) return null;

  return (
    <div ref={ref} role="alert" className={cn('field-error', className)} {...props}>
      {children ??
        (messages.length === 1 ? (
          messages[0]
        ) : (
          <ul className="field-error-list">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ))}
    </div>
  );
});

/** Divider between field groups, with optional inline content ("or"). */
export const FieldSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function FieldSeparator({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        data-content={children ? 'true' : undefined}
        className={cn('field-separator', className)}
        {...props}
      >
        {children ? <span className="field-separator-content">{children}</span> : null}
      </div>
    );
  },
);
