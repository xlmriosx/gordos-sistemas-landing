import { DayPicker, type DayPickerProps, type ChevronProps } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

function CalendarChevron({ orientation, ...rest }: ChevronProps) {
  return orientation === 'left' ? (
    <ChevronLeft size={16} strokeWidth={1.5} {...rest} />
  ) : (
    <ChevronRight size={16} strokeWidth={1.5} {...rest} />
  );
}

/**
 * react-day-picker (v10) wrapped with brand class names — no external
 * stylesheet import, everything is styled via `.calendar *` in ds-components.css.
 * Supports single / multiple / range selection through the `mode` prop.
 */
export function Calendar({ className, classNames, showOutsideDays = true, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('calendar', className)}
      classNames={{
        months: 'cal-months',
        month: 'cal-month',
        month_caption: 'cal-caption',
        caption_label: 'cal-caption-label',
        nav: 'cal-nav',
        button_previous: 'cal-nav-btn',
        button_next: 'cal-nav-btn',
        month_grid: 'cal-grid',
        weekdays: 'cal-weekdays',
        weekday: 'cal-weekday',
        week: 'cal-week',
        day: 'cal-day',
        day_button: 'cal-day-btn',
        today: 'cal-today',
        selected: 'cal-selected',
        outside: 'cal-outside',
        disabled: 'cal-disabled',
        range_start: 'cal-range-start',
        range_middle: 'cal-range-middle',
        range_end: 'cal-range-end',
        hidden: 'cal-hidden',
        ...classNames,
      }}
      components={{ Chevron: CalendarChevron }}
      {...props}
    />
  );
}
