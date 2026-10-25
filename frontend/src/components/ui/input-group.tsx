import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type AriaAttributes,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const INTRINSIC_CONTROLS = new Set(['input', 'textarea', 'select']);

/** Props we forward down to the real control. Values only ever come from us. */
type ControlProps = {
  id?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  'aria-describedby'?: string;
};

function isControl(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  if (typeof node.type === 'string') return INTRINSIC_CONTROLS.has(node.type);
  return node.type === InputGroupInput || node.type === InputGroupTextarea;
}

/**
 * Depth-first: hand `controlProps` to the first real control in the tree.
 * Returns `[children, assigned]` so the caller can tell whether it landed.
 */
function assignToFirstControl(
  children: ReactNode,
  controlProps: ControlProps,
): [ReactNode, boolean] {
  let assigned = false;

  function walk(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (node) => {
      // Stranger elements have `unknown` props under React 19; an open record
      // is what `cloneElement` accepts back.
      if (assigned || !isValidElement<Record<string, unknown>>(node)) return node;

      if (isControl(node)) {
        assigned = true;
        const describedBy =
          [node.props['aria-describedby'], controlProps['aria-describedby']]
            .filter((v): v is string => typeof v === 'string' && v.length > 0)
            .join(' ') || undefined;

        return cloneElement(node, {
          ...controlProps,
          // An explicit id on the control wins — but then the label can't find
          // it, so put the id on <InputGroup> instead. See the note below.
          id: node.props.id ?? controlProps.id,
          'aria-describedby': describedBy,
        });
      }

      if (node.props.children) {
        return cloneElement(node, { children: walk(node.props.children as ReactNode) });
      }
      return node;
    });
  }

  const next = walk(children);
  return [next, assigned];
}

/**
 * Input with addons — icons, text, or buttons docked inside the field frame.
 * The group owns the border and focus ring; `InputGroupInput` is borderless so
 * the whole thing reads as one control. Supersedes the ad-hoc
 * `.input-with-icon` wrapper that `PageToolbarSearch` used to hand-roll.
 *
 * Focus lives on the group via :focus-within (ds-components.css), so tabbing to
 * the input highlights the frame rather than an inner box.
 *
 * LABELLING — `primitives.Field` hands `id` / `aria-invalid` /
 * `aria-describedby` to its first child and builds `<label htmlFor>` from the
 * id. We're a wrapper, not a control, so we forward those down to the real
 * input: left on this `<div>` the label would point at a non-labelable element,
 * and clicking it would focus nothing. Set an explicit id on `<InputGroup>`
 * rather than on the inner control — an id the wrapper never sees can't reach
 * the label.
 */
export type InputGroupProps = ComponentPropsWithoutRef<'div'>;

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  {
    id,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    className,
    children,
    ...props
  },
  ref,
) {
  // Only forward what was actually passed — cloneElement treats an explicit
  // `undefined` as an override and would wipe the control's own value.
  const controlProps: ControlProps = {};
  if (id !== undefined) controlProps.id = id;
  if (ariaInvalid !== undefined) controlProps['aria-invalid'] = ariaInvalid;
  if (ariaDescribedBy !== undefined) controlProps['aria-describedby'] = ariaDescribedBy;

  const hasControlProps = Object.keys(controlProps).length > 0;
  const [content, assigned] = hasControlProps
    ? assignToFirstControl(children, controlProps)
    : [children, false];

  return (
    <div
      ref={ref}
      role="group"
      data-slot="input-group"
      className={cn('input-group', className)}
      // If there was no control to take them, keep them here rather than drop
      // them silently — a wrong target beats a missing one.
      {...(hasControlProps && !assigned ? controlProps : null)}
      {...props}
    >
      {content}
    </div>
  );
});

const addonVariants = cva('input-group-addon', {
  variants: {
    align: {
      'inline-start': 'input-group-addon--inline-start',
      'inline-end': 'input-group-addon--inline-end',
      'block-start': 'input-group-addon--block-start',
      'block-end': 'input-group-addon--block-end',
    },
  },
  defaultVariants: { align: 'inline-start' },
});

/**
 * A docked slot. `inline-*` sits beside the control, `block-*` spans the full
 * width above or below it (a toolbar inside the field).
 *
 * `block-end` draws **no** divider by default — the point is one integrated
 * surface, not two stacked boxes. Add `className="border-t"` if a given layout
 * genuinely needs the rule.
 *
 * Clicking dead space in the addon focuses the control, the way clicking the
 * padding of a real text field does. Clicks on a button are left alone.
 */
export interface InputGroupAddonProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof addonVariants> {}

export const InputGroupAddon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  function InputGroupAddon({ align = 'inline-start', className, onClick, ...props }, ref) {
  return (
    // Mouse-only convenience mirroring a native <label>: the control itself
    // stays reachable by Tab, so there's no keyboard-only action being gated.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={ref}
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(addonVariants({ align }), className)}
        onClick={(event: MouseEvent<HTMLDivElement>) => {
          if (!(event.target as Element).closest('button')) {
            event.currentTarget.parentElement
              ?.querySelector<HTMLElement>('[data-slot="input-group-control"]')
              ?.focus();
          }
          onClick?.(event);
        }}
        {...props}
      />
    );
  },
);

export const InputGroupInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function InputGroupInput({ className, ...props }, ref) {
  return (
      <input
        ref={ref}
        data-slot="input-group-control"
        className={cn('input', 'input-group-control', className)}
        {...props}
      />
    );
  },
);

export const InputGroupTextarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<'textarea'>
>(function InputGroupTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="input-group-control"
      className={cn('textarea', 'input-group-control', 'input-group-textarea', className)}
      {...props}
    />
  );
});

export const InputGroupText = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(
  function InputGroupText({ className, ...props }, ref) {
    return <span ref={ref} className={cn('input-group-text', className)} {...props} />;
  },
);

/**
 * A button sized to fit *inside* the field.
 *
 * Deliberately not built on `buttonVariants`: `.btn` is a pill with 20px of
 * horizontal padding, which inside a composer reads as a big capsule crammed
 * into a text field. Upstream's sizes are compact (`xs` is 24px tall) with a
 * radius tighter than the group's, so it reads as a control *within* the field.
 */
const inputGroupButtonVariants = cva('input-group-button', {
  variants: {
    variant: {
      ghost: 'input-group-button--ghost',
      outline: 'input-group-button--outline',
      solid: 'input-group-button--solid',
    },
    size: {
      xs: 'input-group-button--xs',
      sm: 'input-group-button--sm',
      'icon-xs': 'input-group-button--icon-xs',
      'icon-sm': 'input-group-button--icon-sm',
    },
  },
  defaultVariants: { variant: 'ghost', size: 'xs' },
});

export interface InputGroupButtonProps
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof inputGroupButtonVariants> {}

export const InputGroupButton = forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  function InputGroupButton({ variant, size, type = 'button', className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        data-size={size ?? 'xs'}
        className={cn(inputGroupButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
