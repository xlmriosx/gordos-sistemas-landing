import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Calendar } from './calendar';

/**
 * DatePicker: the canonical Calendar + Popover recipe as one controlled
 * component. Pass `value` (a Date) and `onChange`. `formatDate` overrides the
 * default es-AR display.
 */
/** Formats in the active language rather than a hardcoded locale. */
function formatWithLocale(date: Date | undefined, locale: string): string {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  formatDate?: (date: Date | undefined) => string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  formatDate,
  className,
}: DatePickerProps) {
  const { t, i18n } = useTranslation('ui');
  const [open, setOpen] = useState(false);
  const format = formatDate ?? ((date: Date | undefined) => formatWithLocale(date, i18n.language));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn('select-trigger', 'datepicker-trigger', className)}>
          <CalendarIcon size={15} strokeWidth={1.5} className="datepicker-icon" />
          <span className={cn(!value && 'combobox-placeholder')}>
            {value ? format(value) : (placeholder ?? t('field.pickDate'))}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" style={{ padding: 'var(--space-3)', minWidth: 'auto' }}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange?.(d);
            setOpen(false);
          }}
          // Focusing the selected/current day when the popover opens lets
          // keyboard users navigate immediately, same reasoning as a modal.
          // oxlint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
