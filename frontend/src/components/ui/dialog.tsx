import {
  Children,
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CircleHelp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from './button';
import { Tip } from './tooltip';

/**
 * Radix Dialog: focus trap, ESC, scroll lock, portal. Brand surface is `.modal`.
 *
 * Compose like Sheet: `ModalHeader` → `ModalBody` (scrolls) → `ModalFooter`
 * (actions stay pinned). The convenience `Modal` wrapper builds that anatomy.
 *
 * Width is a first-class contract via `size` — do not override with page-only
 * max-width when the content needs more room; pick `lg` / `xl` instead.
 *
 * Header slots:
 * - `hint` — help tip next to the title (not a second headline).
 * - `subtitle` — visible context line under the title.
 * - `header` — pinned addon under the title row (e.g. `WizardStepper`).
 *
 * An empty body is omitted — title/subtitle-only confirms stay compact.
 * Two actions default to `modal-footer--split` (50/50).
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

/** Modal surface widths. Default `md` matches the historical 520px dialog. */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const MODAL_SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'modal--sm',
  md: 'modal--md',
  lg: 'modal--lg',
  xl: 'modal--xl',
};

function hasBodyContent(children: ReactNode): boolean {
  // Children.toArray already drops null / undefined / booleans.
  return Children.toArray(children).some((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return String(child).trim().length > 0;
    }
    return true;
  });
}

export interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showClose?: boolean;
  /** Surface width. Defaults to `md`. */
  size?: ModalSize;
}

export const DialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent({ className, children, showClose = true, size = 'md', ...props }, ref) {
  const { t } = useTranslation('ui');
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn('modal', MODAL_SIZE_CLASS[size], className)}
        {...props}
      >
        {showClose ? (
          <DialogPrimitive.Close asChild>
            <IconButton
              variant="ghost"
              size="sm"
              label={t('action.close')}
              className="overlay-close"
            >
              <X size={18} strokeWidth={1.5} aria-hidden />
            </IconButton>
          </DialogPrimitive.Close>
        ) : null}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ModalHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('modal-header', className)} {...props} />;
  },
);

/** Scrolls when content is taller than the dialog; header/footer stay put. */
export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ModalBody({ className, ...props }, ref) {
    return <div ref={ref} className={cn('modal-body', className)} {...props} />;
  },
);

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ModalFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn('modal-footer', className)} {...props} />;
  },
);

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  /**
   * Help copy for the modal — rendered as a tip icon beside the title.
   * Prefer this over a long `subtitle` for “what this flow is”.
   */
  hint?: ReactNode;
  /** Visible context under the title (e.g. capability name). Keep short. */
  subtitle?: ReactNode;
  /**
   * Pinned under the title row inside the header — wizard steppers belong here,
   * not in the scrolling body.
   */
  header?: ReactNode;
  children?: ReactNode;
  /** Pinned action row — Cancel/Next, Confirm, etc. */
  footer?: ReactNode;
  /**
   * Footer layout. Defaults to `modal-footer--split` (two actions at 50/50).
   * Pass `modal-footer--end` only for a single action or a non-pair cluster.
   */
  footerClassName?: string;
  /** Surface width. Defaults to `md` (520). Use `lg`/`xl` for wizards and tables. */
  size?: ModalSize;
  /** Extra surface modifiers (e.g. `modal--confirm`). Prefer `size` for width. */
  className?: string;
}

/**
 * Convenience Modal — sticky header/footer, scrolling body, optional hint tip
 * and header addon (stepper). Titles are always centered.
 */
export function Modal({
  open,
  onClose,
  title,
  hint,
  subtitle,
  header,
  children,
  footer,
  footerClassName = 'modal-footer--split',
  size = 'md',
  className,
}: ModalProps) {
  const { t } = useTranslation('ui');
  const description = subtitle ?? (typeof hint === 'string' ? hint : undefined);
  const showBody = hasBodyContent(children);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose?.())}>
      <DialogContent
        size={size}
        className={className}
        aria-describedby={description ? undefined : ''}
      >
        <ModalHeader>
          <div className="modal-header-title-row">
            <DialogTitle className="dialog-title">{title}</DialogTitle>
            {hint ? (
              <Tip label={hint} side="bottom">
                <button
                  type="button"
                  className="modal-header-hint"
                  aria-label={t('action.help')}
                >
                  <CircleHelp size={16} strokeWidth={1.5} aria-hidden />
                </button>
              </Tip>
            ) : null}
          </div>
          {subtitle ? <DialogDescription className="sub">{subtitle}</DialogDescription> : null}
          {!subtitle && typeof hint === 'string' ? (
            <DialogDescription className="sr-only">{hint}</DialogDescription>
          ) : null}
          {header ? <div className="modal-header-addon">{header}</div> : null}
        </ModalHeader>
        {showBody ? <ModalBody>{children}</ModalBody> : null}
        {footer ? <ModalFooter className={footerClassName}>{footer}</ModalFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
