/**
 * The text box that opens where the developer pointed.
 *
 * Natural language in, nothing sent out. Enter confirms, Shift+Enter breaks the
 * line, Escape cancels.
 */

import { useEffect, useRef, useState } from 'react';
import { t } from './strings';

const WIDTH = 268;
const MARGIN = 12;

export function Composer({
  at,
  hint,
  onConfirm,
  onCancel,
}: {
  at: { x: number; y: number };
  hint: string;
  onConfirm: (message: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const left = Math.min(Math.max(MARGIN, at.x), window.innerWidth - WIDTH - MARGIN);
  const top = Math.min(Math.max(MARGIN, at.y + 12), window.innerHeight - 150 - MARGIN);

  const submit = () => {
    const message = value.trim();
    if (message) onConfirm(message);
  };

  return (
    <div className="pt-composer" style={{ left, top, width: WIDTH }} role="dialog" aria-label={t.composerLabel}>
      {hint ? <p className="pt-composer-hint">{hint}</p> : null}
      <textarea
        ref={ref}
        className="pt-composer-input"
        value={value}
        rows={3}
        placeholder={t.composerPlaceholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
          }
        }}
      />
      <div className="pt-composer-actions">
        <button type="button" className="pt-btn pt-btn-quiet" onClick={onCancel}>
          {t.cancel}
        </button>
        <button type="button" className="pt-btn pt-btn-solid" onClick={submit} disabled={!value.trim()}>
          {t.save}
        </button>
      </div>
    </div>
  );
}
