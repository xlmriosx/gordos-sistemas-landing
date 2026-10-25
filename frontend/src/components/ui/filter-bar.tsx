import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
/* `Select` from `primitives` is `SelectControl`, the one that takes `options`.
   The `Select` exported by `./select` is the Radix root and takes none. */
import { Field, Input, Select } from './primitives';
import { Button } from './button';
import type { SelectOption } from './select';
import { cn } from '../../lib/utils';

/**
 * One row of filters that does not know what is being filtered.
 *
 * The contract is written over the only three things this component can see on
 * its own: how many filters there are, what rank each one has, and how much
 * room there is. It never asks what a filter means — a contract that needed
 * that would not be reusable, and the screens that will use this do not exist
 * yet.
 *
 * **Decided 2026-09-15: the secondary filters fold into a panel under the row,
 * not into a popover.** A popover does not move the list, which sounds like the
 * safer choice, but it covers it while open and its width stacks the folded
 * fields into a column. On a screen someone is investigating on, seeing the
 * filters and the rows at the same time wins over keeping the rows still.
 */

export interface FilterSpec {
  id: string;
  label: string;
  /**
   * Declared by the caller, never guessed here. `primary` rides in the row;
   * `secondary` folds. Who decides this for a generated app is the plugin's
   * job, not the design system's.
   */
  rank?: 'primary' | 'secondary';
  value: string;
  onChange: (value: string) => void;
  /** With options it is a select; without, a text field. */
  options?: SelectOption[];
  placeholder?: string;
  /**
   * What this filter starts at, and what "restablecer" puts back.
   *
   * It is one concept doing two jobs on purpose, and replacing two that were
   * fighting. A filter counts as active when it differs from this, so a screen
   * whose default window is "last 30 days" does not open with a reset button
   * already lit: a control that is always on stops meaning anything.
   */
  defaultValue?: string;
}

export interface FilterBarProps {
  filters: FilterSpec[];
  /**
   * The narrowest a field may get before the row stops adding columns. The row
   * fits what fits: a fixed column count lies in both directions, wasting space
   * with short labels and crushing fields with long ones. Both happen here,
   * because every label ships in two languages.
   */
  minFieldWidth?: number;
}

/* No slot for actions, on purpose. An action on the result (export, say) lives
   in the page header's action slot: two surfaces cannot depend on people
   deducing a button's scope from where it sits. */

function isActive(f: FilterSpec): boolean {
  return f.value !== (f.defaultValue ?? '');
}

/* No `id` and no `aria-label` here: `Field` wires its own `<label htmlFor>` to
   the control it wraps, and that label IS the accessible name. Passing either
   would give the control two names or fight Field for the id. */
function FilterControl({ f }: { f: FilterSpec }) {
  return (
    <Field label={f.label}>
      {f.options ? (
        <Select value={f.value} onValueChange={f.onChange} options={f.options} />
      ) : (
        <Input
          value={f.value}
          placeholder={f.placeholder}
          onChange={(e) => f.onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function FilterBar({ filters, minFieldWidth = 190 }: FilterBarProps) {
  const { t } = useTranslation('ui');
  const [open, setOpen] = useState(false);

  const primary = filters.filter((f) => (f.rank ?? 'primary') === 'primary');
  const secondary = filters.filter((f) => f.rank === 'secondary');
  const activeSecondary = secondary.filter(isActive);
  const anyActive = filters.some(isActive);

  const reset = () => filters.forEach((f) => f.onChange(f.defaultValue ?? ''));

  const moreLabel = t('filters.more', { defaultValue: 'Más filtros' });

  /* The folded controls, shared by both variants: same markup in a panel and in
     a popover, so choosing between them never changes a field. */
  const folded = (
    <div
      className="filter-bar-row"
      style={{ '--filter-min': `${minFieldWidth}px` } as React.CSSProperties}
    >
      {secondary.map((f) => <FilterControl key={f.id} f={f} />)}
    </div>
  );

  const trigger = (
    <Button
      variant="ghost"
      size="sm"
      className={cn('filter-bar-more', open && 'open')}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
    >
      <SlidersHorizontal size={14} strokeWidth={1.5} />
      {moreLabel}
      {/* The count is not decoration: it is what keeps a folded filter from
          filtering invisibly. Without it the list returns three rows and the
          person blames the data. */}
      {activeSecondary.length > 0 && (
        <span className="filter-bar-count">{activeSecondary.length}</span>
      )}
      <ChevronDown size={14} strokeWidth={1.5} />
    </Button>
  );

  return (
    <div className="filter-bar">
      <div
        className="filter-bar-row"
        style={{ '--filter-min': `${minFieldWidth}px` } as React.CSSProperties}
      >
        {primary.map((f) => <FilterControl key={f.id} f={f} />)}
      </div>

      <div className="filter-bar-foot">
        <div className="filter-bar-controls">
          {secondary.length > 0 && trigger}

          {/* Active folded filters come back as removable chips. Same reason as
              the count, and the two together are the only part of this that is
              not optional. */}
          {activeSecondary.map((f) => (
            <button
              key={f.id}
              type="button"
              className="filter-chip"
              onClick={() => f.onChange(f.defaultValue ?? '')}
            >
              <span className="filter-chip-label">{f.label}</span>
              <span className="filter-chip-value">{f.value}</span>
              <X size={12} strokeWidth={2} aria-hidden />
            </button>
          ))}

          {/* No apply button: it applies on selection. So there is no such thing
              as a filter chosen and not applied, and the question of what that
              state would mean does not arise. And this one only exists when
              something actually moved off its default. */}
          {anyActive && (
            <Button variant="ghost" size="sm" onClick={reset}>
              {t('filters.reset', { defaultValue: 'Restablecer' })}
            </Button>
          )}
        </div>
      </div>

      {open && <div className="filter-bar-panel">{folded}</div>}
    </div>
  );
}
