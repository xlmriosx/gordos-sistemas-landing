import type { ReactNode } from 'react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { cn } from '../../lib/utils';

/**
 * One exclusive choice among a short set (2–7). Visual language matches the
 * mode cards used by DistributionField — label, optional hint, optional icon —
 * without locking the value type to audience modes.
 */
export interface ChoiceCardOption<T extends string = string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}

export interface ChoiceCardsProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<ChoiceCardOption<T>>;
  className?: string;
  'aria-label'?: string;
}

/**
 * ChoiceCards: branded radio cards for mutually exclusive options.
 *
 * Prefer this over a bare `RadioGroup` of pills when the choice needs a short
 * explanation under the label. For a single pressed state among icon tools,
 * use `ToggleGroup` instead.
 */
export function ChoiceCards<T extends string>({
  value,
  onValueChange,
  options,
  className,
  'aria-label': ariaLabel,
}: ChoiceCardsProps<T>) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn('choice-cards', className)}
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn('choice-card', value === option.value && 'is-active')}
        >
          <RadioGroupItem value={option.value} />
          <span className="choice-card-body">
            <span className="choice-card-label">
              {option.label}
              {option.icon ? (
                <span className="choice-card-icon" aria-hidden>
                  {option.icon}
                </span>
              ) : null}
            </span>
            {option.hint ? <span className="choice-card-hint">{option.hint}</span> : null}
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
