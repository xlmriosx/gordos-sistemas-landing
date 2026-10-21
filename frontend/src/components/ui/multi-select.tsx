import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

/**
 * MultiSelect: a faceted filter — a Popover trigger showing a count summary and
 * a checkable option list with a "clear" footer. Controlled: pass `options`
 * ([{value,label}]), `selected` (value[]), `onToggle(value)` and `onClear()`.
 * Generalized from the Builder's capabilities filter.
 */
export interface MultiSelectOption {
  value: string;
  label: ReactNode;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  /** Noun used in the count summary — "1 option" / "3 options". */
  singular?: string;
  plural?: string;
  clearLabel?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function MultiSelect({
  options,
  selected,
  onToggle,
  onClear,
  placeholder,
  singular,
  plural,
  clearLabel,
  className,
  id,
  'aria-label': ariaLabel,
}: MultiSelectProps) {
  const { t } = useTranslation('ui');
  const [open, setOpen] = useState(false);
  const placeholderText = placeholder ?? t('field.select');
  const singularNoun = singular ?? t('field.optionOne');
  const pluralNoun = plural ?? t('field.optionOther');
  const label =
    selected.length === 0
      ? placeholderText
      : selected.length === 1
        ? `1 ${singularNoun}`
        : `${selected.length} ${pluralNoun}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        className={cn('multi-select-trigger', className)}
        aria-label={ariaLabel ?? placeholderText}
      >
        <span className="multi-select-trigger-label">{label}</span>
        <ChevronDown size={16} strokeWidth={1.5} className={open ? 'multi-select-chevron is-open' : 'multi-select-chevron'} />
      </PopoverTrigger>
      <PopoverContent className="multi-select-menu" align="start" side="bottom">
        <div className="multi-select-options" role="listbox" aria-multiselectable="true" aria-label={ariaLabel}>
          {options.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                className={cn('multi-select-option', active && 'active')}
                onClick={() => onToggle(opt.value)}
              >
                <span className="multi-select-check" aria-hidden>
                  {active ? <Check size={14} strokeWidth={1.5} /> : null}
                </span>
                <span className="multi-select-label">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {selected.length > 0 ? (
          <div className="multi-select-foot">
            <button type="button" className="multi-select-clear" onClick={onClear}>
              {clearLabel ?? t('action.clearSelection')}
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

/**
 * RemovableChip: a token with a trailing remove (×) button — pairs with
 * MultiSelect to show the current selection outside the popover.
 */
export interface RemovableChipProps {
  children?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

export function RemovableChip({
  children,
  onRemove,
  removeLabel,
  className,
}: RemovableChipProps) {
  const { t } = useTranslation('ui');
  return (
    <span className={cn('removable-chip', className)}>
      {children}
      <button
        type="button"
        className="removable-chip-remove"
        onClick={onRemove}
        aria-label={removeLabel ?? t('action.remove')}
      >
        <X size={12} strokeWidth={1.5} />
      </button>
    </span>
  );
}
