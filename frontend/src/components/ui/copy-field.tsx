import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CopyFieldProps {
  value: string;
  className?: string;
  copyLabel?: string;
  copiedLabel?: string;
}

/**
 * CopyField: a monospaced value in a bordered chip with a copy-to-clipboard
 * button that flips to a confirmation for ~1.6s. Promoted from the DevOps
 * "Entra group" chip so it can be reused for IDs, tokens, URLs, etc.
 */
export function CopyField({ value, className, copyLabel, copiedLabel }: CopyFieldProps) {
  const { t } = useTranslation('ui');
  const [copied, setCopied] = useState(false);
  const copyText = copyLabel ?? t('action.copy');
  const copiedText = copiedLabel ?? t('action.copied');

  function copy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={cn('copy-field', className)}>
      <code className="copy-field-value t-app-mono">{value}</code>
      <button
        type="button"
        onClick={copy}
        className="copy-field-btn t-app-small"
        aria-label={copied ? copiedText : `${copyText}: ${value}`}
      >
        {copied ? <Check size={13} strokeWidth={1.5} aria-hidden /> : <Copy size={13} strokeWidth={1.5} aria-hidden />}
        <span aria-hidden>{copied ? copiedText : copyText}</span>
      </button>
    </div>
  );
}
