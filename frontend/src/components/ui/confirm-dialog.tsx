import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { Modal, Button, Field, Input, Textarea } from './primitives';
import { Callout } from './callout';

/**
 * ConfirmDialog: the "confirm an audited action" modal repeated across the
 * DevOps panel — a Modal + optional body (`children`) + optional warning Callout
 * + optional required reason field + Cancel/Confirm footer (Confirm disabled
 * until the reason is filled). Body first, then consequence, then reason.
 * `onConfirm` receives the trimmed reason string (empty when not required).
 */
export interface ConfirmDialogProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Consequence of the action — rendered in a warning Callout. */
  warning?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Blocks Confirm until a reason is typed; the reason is audited. */
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonMultiline?: boolean;
  /** Receives the trimmed reason — an empty string when not required. */
  onConfirm?: (reason: string) => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  subtitle,
  warning,
  confirmLabel,
  cancelLabel,
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
  reasonMultiline = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation('ui');
  const [reason, setReason] = useState('');

  /* `react(set-state-in-effect)` disabled here on purpose. The rule's advice is
     to reset from the event that caused the change, and that event does not
     always happen: three of these dialogs share one piece of caller state
     (`open={confirm?.type === 'pause'}` and its two siblings in
     `AppDetailDevOps`), so switching from one to another closes the first
     without ever calling its `onClose`. An audited reason left behind would
     then show up prefilled in the next dialog the operator opens, under a
     different title.
     The structural alternative is remounting by `key`, which discards the
     modal's exit animation to buy the same thing. */
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    if (!open) setReason('');
  }, [open]);

  const canConfirm = !requireReason || reason.trim().length > 0;

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm?.(reason.trim());
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      className="modal--confirm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{cancelLabel ?? t('action.cancel')}</Button>
          <Button variant="solid" onClick={handleConfirm} disabled={!canConfirm}>
            {confirmLabel ?? t('action.confirm')}
          </Button>
        </>
      }
    >
      {children}

      {warning ? (
        <Callout variant="warning" icon={<TriangleAlert size={16} strokeWidth={1.5} />} className="mb-4">
          <p className="t-app-small text-ink-muted">{warning}</p>
        </Callout>
      ) : null}

      {requireReason ? (
        <Field label={reasonLabel ?? t('field.reason')}>
          {reasonMultiline ? (
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={reasonPlaceholder} />
          ) : (
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={reasonPlaceholder} />
          )}
        </Field>
      ) : null}
    </Modal>
  );
}
