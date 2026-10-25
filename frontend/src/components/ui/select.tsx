import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Radix Select primitives — use SelectControl (exported as Select from primitives)
 * for the common options[] API, or compose these directly for grouped/custom menus.
 */
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
  ComponentRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger(
  { className, children, ...props },
  ref,
) {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cn('select-trigger', className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={15} strokeWidth={1.5} className="select-caret" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export const SelectContent = forwardRef<
  ComponentRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent(
  { className, children, position = 'popper', ...props },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn('menu-content', 'select-content', className)}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="select-scroll-btn">
          <ChevronUp size={14} strokeWidth={1.5} />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="select-viewport">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="select-scroll-btn">
          <ChevronDown size={14} strokeWidth={1.5} />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export const SelectLabel = forwardRef<
  ComponentRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return <SelectPrimitive.Label ref={ref} className={cn('menu-label', className)} {...props} />;
});

export const SelectItem = forwardRef<
  ComponentRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item ref={ref} className={cn('menu-item', 'select-item', className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="select-item-indicator">
        <Check size={14} strokeWidth={2} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

export const SelectSeparator = forwardRef<
  ComponentRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return <SelectPrimitive.Separator ref={ref} className={cn('menu-separator', className)} {...props} />;
});

/**
 * Branded single-select — drop-in for the old native <select> primitive.
 * Pass `options` or compose with SelectItem children for custom menus.
 */
export interface SelectOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectControlProps
  extends Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Native-select shim: called with a synthetic `{ target: { value } }` so the
   * call sites migrated off `<select onChange>` keep working unchanged.
   */
  onChange?: (event: { target: { value: string } }) => void;
  options?: SelectOption[];
  placeholder?: string;
}

export const SelectControl = forwardRef<
  ComponentRef<typeof SelectPrimitive.Trigger>,
  SelectControlProps
>(function SelectControl(
  {
    value,
    defaultValue,
    onValueChange,
    onChange,
    options,
    placeholder = 'Seleccionar…',
    disabled,
    className,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    children,
    ...props
  },
  ref,
) {
  function handleValueChange(next: string) {
    onValueChange?.(next);
    onChange?.({ target: { value: next } });
  }

  const items = options?.length
    ? options.map((opt) => (
        <SelectItem key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
          {opt.label}
        </SelectItem>
      ))
    : children;

  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        ref={ref}
        id={id}
        className={className}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        {...props}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{items}</SelectContent>
    </Select>
  );
});
