import { useId, useState, type DragEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from './attachment';

export type FileDropState = 'idle' | 'uploading' | 'processing' | 'error' | 'done';

export interface FileDropProps {
  /** `accept` attribute of the hidden input, e.g. `.yaml,.yml,.json`. */
  accept?: string;
  /** Human-readable hint under the label — usually the same extensions in prose. */
  hint?: ReactNode;
  label: ReactNode;
  /** Name of the file already picked; renders the chip instead of the zone. */
  fileName?: string | null;
  /** Sub-line of the chip: size, version, error reason… */
  fileMeta?: ReactNode;
  state?: FileDropState;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * A file picker: click-or-drop zone that collapses into an `Attachment` chip
 * once a file is chosen.
 *
 * The real `<input type="file">` stays in the DOM (visually hidden, not
 * `display:none`) so keyboard and assistive tech reach it the normal way; the
 * zone is a `<label>` for it rather than a button that fakes a click. Drag
 * state is local because the browser gives no `:drop-target` to style against.
 */
export function FileDrop({
  accept,
  hint,
  label,
  fileName,
  fileMeta,
  state = 'idle',
  disabled,
  onSelect,
  onClear,
  className,
}: FileDropProps) {
  const { t } = useTranslation('ui');
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onSelect(file);
  }

  if (fileName) {
    return (
      <Attachment state={state} className={cn('file-drop-chip', className)} orientation="horizontal">
        <AttachmentMedia busy={state === 'uploading' || state === 'processing'}>
          <FileUp size={16} strokeWidth={1.5} aria-hidden />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{fileName}</AttachmentTitle>
          {fileMeta ? <AttachmentDescription>{fileMeta}</AttachmentDescription> : null}
        </AttachmentContent>
        {onClear ? (
          <AttachmentActions>
            <AttachmentAction aria-label={t('action.remove')} onClick={onClear}>
              <X size={14} strokeWidth={1.5} aria-hidden />
            </AttachmentAction>
          </AttachmentActions>
        ) : null}
      </Attachment>
    );
  }

  return (
    // Drag handlers are a mouse-only affordance; the file input inside stays
    // independently reachable and operable by keyboard as the accessible path.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <label
      htmlFor={inputId}
      className={cn(
        'file-drop',
        dragging && 'file-drop--dragging',
        disabled && 'file-drop--disabled',
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <span className="file-drop-icon" aria-hidden>
        <FileUp size={20} strokeWidth={1.5} />
      </span>
      <span className="file-drop-body">
        <span className="file-drop-label">{label}</span>
        {hint ? <span className="file-drop-hint">{hint}</span> : null}
      </span>
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="file-drop-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          // Let the same file be picked twice in a row (retry after an error).
          e.target.value = '';
        }}
      />
    </label>
  );
}
