import { forwardRef, useContext, type ComponentPropsWithoutRef, type ComponentRef } from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * input-otp wrapped shadcn-style: one-time-code input rendered as discrete
 * slots. Compose <InputOTP maxLength={6}><InputOTPGroup>…slots…</></>.
 */
export const InputOTP = forwardRef<
  ComponentRef<typeof OTPInput>,
  ComponentPropsWithoutRef<typeof OTPInput>
>(function InputOTP({ className, containerClassName, ...props }, ref) {
  return (
    <OTPInput
      ref={ref}
      containerClassName={cn('otp', containerClassName)}
      className={cn('otp-input', className)}
      {...props}
    />
  );
});

export function InputOTPGroup({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('otp-group', className)} {...props} />;
}

export interface InputOTPSlotProps extends ComponentPropsWithoutRef<'div'> {
  /** Position in the code — indexes into the context's slot state. */
  index: number;
}

export const InputOTPSlot = forwardRef<HTMLDivElement, InputOTPSlotProps>(function InputOTPSlot(
  { index, className, ...props },
  ref,
) {
  const ctx = useContext(OTPInputContext);
  const slot = ctx?.slots?.[index];
  return (
    <div ref={ref} className={cn('otp-slot', slot?.isActive && 'is-active', className)} {...props}>
      {slot?.char}
      {slot?.hasFakeCaret ? <span className="otp-caret" /> : null}
    </div>
  );
});

export function InputOTPSeparator(props: ComponentPropsWithoutRef<'div'>) {
  return (
    <div role="separator" className="otp-separator" {...props}>
      <Minus size={14} strokeWidth={1.5} />
    </div>
  );
}
