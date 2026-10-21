import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from './command';

/**
 * Combobox: shadcn's canonical Popover + Command recipe, packaged as a single
 * controlled component. Pass `options` ([{value, label}]), `value`, and
 * `onChange`. Filtering and keyboard nav come from cmdk.
 *
 * When `creatable` is true and the search has no exact match, offers
 * "Create «query»" so the typed value can be committed as a new option.
 */
export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options?: ComboboxOption[];
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Offers "create «query»" when the search has no exact match. */
  creatable?: boolean;
  createLabel?: (query: string) => string;
  className?: string;
}

export function Combobox({
  options = [],
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  creatable = false,
  createLabel,
  className,
}: ComboboxProps) {
  const { t } = useTranslation('ui');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const displayText = selected?.label ?? (value || null);
  const trimmed = query.trim();
  const exactMatch = options.some(
    (o) =>
      o.label.toLowerCase() === trimmed.toLowerCase() ||
      String(o.value).toLowerCase() === trimmed.toLowerCase(),
  );
  const showCreate = creatable && trimmed.length > 0 && !exactMatch;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setQuery('');
  }

  function commit(nextValue: string | undefined) {
    onChange?.(nextValue);
    setOpen(false);
    setQuery('');
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={cn('select-trigger', 'combobox-trigger', className)} aria-expanded={open}>
          <span className={cn(!displayText && 'combobox-placeholder')}>
            {displayText || placeholder || t('field.selectEllipsis')}
          </span>
          <ChevronsUpDown size={15} strokeWidth={1.5} className="select-caret" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="combobox-content" align="start" style={{ padding: 0 }}>
        <Command>
          <CommandInput
            placeholder={searchPlaceholder ?? t('field.searchEllipsis')}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {!showCreate && <CommandEmpty>{emptyText ?? t('field.noResults')}</CommandEmpty>}
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => {
                    commit(o.value === value ? undefined : o.value);
                  }}
                >
                  <Check size={14} strokeWidth={2} className={cn('combobox-check', o.value !== value && 'is-hidden')} />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreate && (
              <CommandGroup>
                <CommandItem value={trimmed} onSelect={() => commit(trimmed)}>
                  {createLabel ? createLabel(trimmed) : t('field.create', { query: trimmed })}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
