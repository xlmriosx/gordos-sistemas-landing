import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export type WizardStepStatus = 'done' | 'current' | 'upcoming';

export interface WizardStepItem {
  id: string;
  label: string;
}

export interface WizardStepperProps {
  steps: ReadonlyArray<WizardStepItem>;
  /** Zero-based index of the active step. */
  current: number;
  /** Jump back to a completed step. Future steps stay disabled. */
  onStepSelect?: (index: number) => void;
  /** Full aria-label for the list; caller usually interpolates current/total. */
  'aria-label': string;
  className?: string;
}

function stepStatus(index: number, current: number): WizardStepStatus {
  if (index < current) return 'done';
  if (index === current) return 'current';
  return 'upcoming';
}

/**
 * WizardStepper: horizontal progress for multi-step modals.
 *
 * Frameless by design — it belongs in `Modal`’s `header` slot, not as a nested
 * card. Completed steps are clickable so the user can jump back; the current
 * and upcoming ones are not.
 */
export function WizardStepper({
  steps,
  current,
  onStepSelect,
  'aria-label': ariaLabel,
  className,
}: WizardStepperProps) {
  const { t } = useTranslation('ui');

  return (
    <div className={cn('wizard-stepper', className)}>
      <ol className="wizard-stepper-steps" aria-label={ariaLabel}>
        {steps.map((step, index) => {
          const status = stepStatus(index, current);
          const canJump = index < current;
          const statusNote =
            status === 'done'
              ? t('wizardStepper.done')
              : status === 'current'
                ? t('wizardStepper.current')
                : '';

          return (
            <li
              key={step.id}
              className={cn('wizard-stepper-step', `wizard-stepper-step--${status}`)}
            >
              <button
                type="button"
                className="wizard-stepper-btn"
                disabled={!canJump}
                aria-current={status === 'current' ? 'step' : undefined}
                aria-label={`${step.label}${statusNote}`}
                onClick={() => canJump && onStepSelect?.(index)}
              >
                <span className="wizard-stepper-marker" aria-hidden>
                  {status === 'done' ? <Check size={12} strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="wizard-stepper-label">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
