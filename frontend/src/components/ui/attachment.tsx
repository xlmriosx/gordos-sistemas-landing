import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Spinner } from './spinner';

/**
 * A file chip: media + name + metadata, with actions and an upload state.
 *
 * `state` drives the visual treatment *and* the busy semantics — `uploading` and
 * `processing` render a Spinner in place of the media and mark the card
 * `aria-busy`, so a screen reader isn't told a file is ready before it is.
 * `error` uses the status tokens, not a one-off red.
 */
const attachmentVariants = cva('attachment', {
  variants: {
    state: {
      idle: '',
      uploading: 'attachment--busy',
      processing: 'attachment--busy',
      error: 'attachment--error',
      done: 'attachment--done',
    },
    size: {
      default: '',
      sm: 'attachment--sm',
      xs: 'attachment--xs',
    },
    orientation: {
      horizontal: 'attachment--horizontal',
      vertical: 'attachment--vertical',
    },
  },
  defaultVariants: { state: 'idle', size: 'default', orientation: 'horizontal' },
});

export interface AttachmentProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof attachmentVariants> {}

export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(function Attachment(
  { state = 'idle', size, orientation, className, ...props },
  ref,
) {
  const busy = state === 'uploading' || state === 'processing';

  return (
    <div
      ref={ref}
      data-state={state}
      aria-busy={busy || undefined}
      className={cn(attachmentVariants({ state, size, orientation }), className)}
      {...props}
    />
  );
});

const mediaVariants = cva('attachment-media', {
  variants: {
    variant: {
      icon: 'attachment-media--icon',
      image: 'attachment-media--image',
    },
  },
  defaultVariants: { variant: 'icon' },
});

/**
 * Media slot. Pass `busy` to swap the glyph for a Spinner — usually wired from
 * the parent's `state` so the two can't disagree.
 */
export interface AttachmentMediaProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof mediaVariants> {
  /** Swaps the glyph for a Spinner. Wire it from the parent's `state`. */
  busy?: boolean;
}

export const AttachmentMedia = forwardRef<HTMLDivElement, AttachmentMediaProps>(
  function AttachmentMedia({ variant, busy, className, children, ...props }, ref) {
    const { t } = useTranslation('ui');
    return (
      <div ref={ref} className={cn(mediaVariants({ variant }), className)} {...props}>
        {busy ? <Spinner size={16} label={t('status.uploading')} /> : children}
      </div>
    );
  },
);

export const AttachmentContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function AttachmentContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('attachment-content', className)} {...props} />;
});

/**
 * The filename. Shimmers while the parent is `uploading` / `processing` — driven
 * off the parent's `data-state` in CSS so the two can't disagree, which is why
 * you don't pass `busy` here the way you do to `AttachmentMedia`.
 */
export const AttachmentTitle = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function AttachmentTitle({ className, ...props }, ref) {
  return <p ref={ref} className={cn('attachment-title', className)} {...props} />;
});

export const AttachmentDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function AttachmentDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn('attachment-description', className)} {...props} />;
});

export const AttachmentActions = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function AttachmentActions({ className, ...props }, ref) {
  return <div ref={ref} className={cn('attachment-actions', className)} {...props} />;
});

/** An icon button inside the chip. Always give it an `aria-label` naming the file. */
export const AttachmentAction = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function AttachmentAction({ className, ...props }, ref) {
  return (
    <button ref={ref} type="button" className={cn('attachment-action', className)} {...props} />
  );
});

/**
 * Full-card overlay trigger (open / preview). Sits above the card but *below*
 * `AttachmentActions` in z-order, so a remove button stays clickable.
 */
export const AttachmentTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function AttachmentTrigger({ className, ...props }, ref) {
  return (
    <button ref={ref} type="button" className={cn('attachment-trigger', className)} {...props} />
  );
});

/** Horizontally scrollable run of attachments. */
export const AttachmentGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function AttachmentGroup({ className, ...props }, ref) {
  return <div ref={ref} className={cn('attachment-group', className)} {...props} />;
});
