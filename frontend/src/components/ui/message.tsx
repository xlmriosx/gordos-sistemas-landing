import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * One row of a conversation: avatar + content, aligned to either side.
 *
 * `Message` is only the layout — the visible surface comes from a `Bubble`
 * inside `MessageContent`. Keeping them separate is what lets a turn render as
 * a bubble, a plain block of prose, or a tool-call trace without forking this.
 */
const messageVariants = cva('message', {
  variants: {
    align: {
      start: 'message--start',
      end: 'message--end',
    },
  },
  defaultVariants: { align: 'start' },
});

export interface MessageProps
  extends ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof messageVariants> {}

export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message(
  { align, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-align={align ?? 'start'}
      className={cn(messageVariants({ align }), className)}
      {...props}
    />
  );
});

/** Consecutive turns from one sender — collapses the vertical gap between them. */
export const MessageGroup = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function MessageGroup({ className, ...props }, ref) {
  return <div ref={ref} className={cn('message-group', className)} {...props} />;
});

/**
 * Avatar slot, aligned to the bottom of the row so it tracks the last line of a
 * multi-line turn rather than floating at the top.
 */
export const MessageAvatar = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function MessageAvatar({ className, ...props }, ref) {
  return <div ref={ref} className={cn('message-avatar', className)} {...props} />;
});

export const MessageContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function MessageContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('message-content', className)} {...props} />;
});

/** Above the surface — sender name, timestamp. */
export const MessageHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function MessageHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('message-header', className)} {...props} />;
});

/** Below the surface — delivery status, retry, copy. */
export const MessageFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function MessageFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cn('message-footer', className)} {...props} />;
});
