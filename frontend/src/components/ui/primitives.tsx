import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';

// Interactive components live in their own shadcn-style files; re-exported here
// so existing `from '.../ui/primitives'` imports keep working.
export { Arrow, Button, IconButton } from './button';
export { Badge } from './badge';
export { Indicator, IndicatorAnchor } from './indicator';
export { Modal, ModalHeader, ModalBody, ModalFooter, Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription } from './dialog';
export type { ModalSize, ModalProps, DialogContentProps } from './dialog';
export { ScrollToTop } from './scroll-to-top';
export type { ScrollToTopProps } from './scroll-to-top';
export { FloatingToolbar } from './floating-toolbar';
export type { FloatingToolbarProps } from './floating-toolbar';
export {
  Drawer,
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from './sheet';

export function LinkArrow({ href, children, className, ...props }: ComponentPropsWithoutRef<'a'>) {
  return (
    <a className={cn('link-arrow', className)} href={href} {...props}>
      <span>{children}</span>
      <ArrowGlyph />
    </a>
  );
}

function ArrowGlyph() {
  return (
    <svg className="arr" width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
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

export interface FieldProps {
  label?: ReactNode;
  error?: ReactNode;
  /** Quiet supporting line under the control — not a second label. */
  hint?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Associates label ↔ control and wires error/hint text via aria-describedby.
 *
 * CONTRACT: the labelling props (`id`, `aria-invalid`, `aria-describedby`) go to
 * the FIRST child, and `<label htmlFor>` is built from that id. A child that is
 * a **wrapper** rather than a control must forward them down to the real control
 * — otherwise the label points at a non-labelable element and clicking it
 * focuses nothing. `SelectControl`, `MultiSelect` and `InputGroup` all honor
 * this; copy `InputGroup`'s `assignToFirstControl` if you add another wrapper.
 *
 * For layouts this can't express (horizontal, grouped fieldsets), use the
 * compositional set in [`field.tsx`](./field.tsx) and wire `htmlFor` yourself.
 *
 * On the types: the child is a stranger element, so its props are `unknown`
 * under React 19 — narrowing to an open record is what lets us both read the
 * caller's ARIA props and clone extra ones in.
 */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const autoId = useId();
  const errorId = `${autoId}-error`;
  const hintId = `${autoId}-hint`;

  /* Read the control's id BEFORE mapping instead of assigning it inside the
     map. Same value, and the label's `htmlFor` no longer depends on a variable
     that the map writes on the way past: only the first valid child was ever
     allowed to set it, so finding that child up front says so directly. */
  const firstControl = Children.toArray(children).find((child) =>
    isValidElement<Record<string, unknown>>(child),
  );
  const firstControlId =
    isValidElement<Record<string, unknown>>(firstControl) && typeof firstControl.props.id === 'string'
      ? firstControl.props.id
      : null;
  const controlId = firstControlId ?? autoId;

  const controls = Children.map(children, (child, index) => {
    if (!isValidElement<Record<string, unknown>>(child) || index > 0) return child;
    const describedBy =
      [
        child.props['aria-describedby'],
        hint ? hintId : null,
        error ? errorId : null,
      ]
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
        .join(' ') || undefined;
    return cloneElement(child, {
      id: controlId,
      'aria-invalid': error ? true : child.props['aria-invalid'],
      'aria-describedby': describedBy,
    });
  });

  return (
    <div className={cn('field', className)}>
      {label ? (
        <label className="field-label" htmlFor={controlId}>
          {label}
        </label>
      ) : null}
      {controls}
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentPropsWithoutRef<'input'>) {
  return <input className={cn('input', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentPropsWithoutRef<'textarea'>) {
  return <textarea className={cn('textarea', className)} {...props} />;
}

export { SelectControl as Select } from './select';

export function Card({
  title,
  children,
  className = '',
}: {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('card', className)}>
      {title ? <h4>{title}</h4> : null}
      {children}
    </div>
  );
}

export function Tag({ className, children }: { className?: string; children?: ReactNode }) {
  return <span className={cn('tag', className)}>{children}</span>;
}

export function Pill({
  fill,
  className,
  children,
}: {
  fill?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return <span className={cn('pill', fill && 'pill-fill', className)}>{children}</span>;
}

export type AlertVariant = 'ok' | 'warning' | 'critical' | 'info';

export function Alert({
  variant,
  className,
  children,
  role,
}: {
  variant?: AlertVariant;
  className?: string;
  children?: ReactNode;
  role?: string;
}) {
  const resolvedRole = role ?? (variant === 'critical' ? 'alert' : 'status');
  return (
    <div
      className={cn('alert', variant && `alert-${variant}`, className)}
      role={resolvedRole}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Skeleton({
  height = 16,
  width = '100%',
  className,
}: {
  height?: number | string;
  width?: number | string;
  className?: string;
}) {
  return <div className={cn('skeleton', className)} style={{ height, width }} aria-hidden />;
}
