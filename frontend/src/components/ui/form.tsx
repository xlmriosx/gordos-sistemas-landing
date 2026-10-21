import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  cloneElement,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { cn } from '../../lib/utils';
import { Label } from './label';

/**
 * react-hook-form wrapper (shadcn pattern) that wires accessible ids and error
 * messaging automatically. Usage:
 *   const form = useForm()
 *   <Form {...form}><form onSubmit={form.handleSubmit(...)}>
 *     <FormField name="email" control={form.control} render={({field}) => (
 *       <FormItem><FormLabel>Email</FormLabel>
 *       <FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
 *     )} />
 *   </form></Form>
 * FormControl injects aria attributes onto its single child via cloneElement,
 * so no Slot dependency is needed.
 */
export const Form = FormProvider;

const FormFieldContext = createContext<{ name: string } | null>(null);
const FormItemContext = createContext<{ id: string } | null>(null);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldCtx = useContext(FormFieldContext);
  const itemCtx = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  if (!fieldCtx) throw new Error('useFormField must be used within <FormField>');
  const state = getFieldState(fieldCtx.name, formState);
  const id = itemCtx?.id;
  return {
    name: fieldCtx.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...state,
  };
}

export const FormItem = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function FormItem({ className, ...props }, ref) {
    const id = useId();
    const value = useMemo(() => ({ id }), [id]);
    return (
      <FormItemContext.Provider value={value}>
        <div ref={ref} className={cn('field', 'form-item', className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);

export const FormLabel = forwardRef<
  HTMLLabelElement,
  ComponentPropsWithoutRef<typeof Label>
>(function FormLabel({ className, ...props }, ref) {
  const { formItemId, error } = useFormField();
  return <Label ref={ref} htmlFor={formItemId} className={cn(error && 'has-error', className)} {...props} />;
});

/**
 * Injects the accessible ids onto its single child. The child is a stranger
 * element, so its props are `unknown` under React 19 — narrowing to an open
 * record is what lets `cloneElement` accept the merge back.
 */
export function FormControl({ children }: { children: ReactNode }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  if (!isValidElement<Record<string, unknown>>(children)) return null;
  return cloneElement(children, {
    id: formItemId,
    'aria-describedby': error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
    'aria-invalid': !!error,
  });
}

export function FormDescription({ className, ...props }: ComponentPropsWithoutRef<'p'>) {
  const { formDescriptionId } = useFormField();
  return <p id={formDescriptionId} className={cn('form-description', className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;
  if (!body) return null;
  return (
    <p id={formMessageId} className={cn('field-error', 'form-message', className)} {...props}>
      {body}
    </p>
  );
}
