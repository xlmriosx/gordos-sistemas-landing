import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Users2, Globe, UsersRound, UserRound } from 'lucide-react';
import { ChoiceCards } from './choice-cards';
import { MultiSelect, RemovableChip } from './multi-select';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { Checkbox } from './checkbox';
import { ScrollArea } from './scroll-area';
import { cn } from '../../lib/utils';

export type DistributionMode = 'only-me' | 'group' | 'all';

const MODE_ICON = { 'only-me': Lock, group: Users2, all: Globe };

export interface DistributionValue {
  mode: DistributionMode;
  audiences: string[];
}

export interface DistributionModeOption {
  value: DistributionMode;
  label: ReactNode;
  hint?: ReactNode;
}

export interface AudienceOption {
  value: string;
  label: string;
  type: 'group' | 'persona';
}

/**
 * DistributionField: audience picker for an app — three modes (only me / group
 * of users / everyone). The group mode opens a second step with two facets:
 * "Groups" (a contextual MultiSelect popover of teams) and "People" (a
 * checklist of every user). Selection is a single `audiences` array of ids;
 * options carry `type: 'group' | 'persona'` so the field can split them.
 * Controlled and generic: pass `value` ({ mode, audiences }), `onChange`,
 * `modes` and `audienceOptions`.
 *
 * Mode cards are `ChoiceCards` — the shared exclusive-choice pattern.
 */
export interface DistributionFieldProps {
  value?: DistributionValue;
  onChange: (next: DistributionValue) => void;
  modes: DistributionModeOption[];
  audienceOptions: AudienceOption[];
  className?: string;
}

export function DistributionField({
  value,
  onChange,
  modes,
  audienceOptions,
  className,
}: DistributionFieldProps) {
  const { t } = useTranslation('ui');
  const mode = value?.mode ?? modes[0].value;
  const audiences = value?.audiences ?? [];
  const [facet, setFacet] = useState<'groups' | 'people'>('groups');

  const groups = audienceOptions.filter((o) => o.type !== 'persona');
  const people = audienceOptions.filter((o) => o.type === 'persona');
  const groupIds = groups.map((g) => g.value);

  const setMode = (next: DistributionMode) =>
    onChange({ mode: next, audiences: next === 'group' ? audiences : [] });
  const toggle = (v: string) =>
    onChange({
      mode,
      audiences: audiences.includes(v) ? audiences.filter((x) => x !== v) : [...audiences, v],
    });
  const clearGroups = () =>
    onChange({ mode, audiences: audiences.filter((id) => !groupIds.includes(id)) });

  return (
    <div className={cn('distribution-field', className)}>
      <ChoiceCards
        value={mode}
        onValueChange={setMode}
        options={modes.map((m) => {
          const Icon = MODE_ICON[m.value] ?? Globe;
          return {
            value: m.value,
            label: m.label,
            hint: m.hint,
            icon: <Icon size={14} strokeWidth={1.5} aria-hidden />,
          };
        })}
      />

      {mode === 'group' ? (
        <div className="distribution-selection">
          <ToggleGroup
            type="single"
            value={facet}
            onValueChange={(v) => v && setFacet(v as 'groups' | 'people')}
            aria-label={t('distribution.targetKind')}
          >
            <ToggleGroupItem value="groups">
              <UsersRound size={15} strokeWidth={1.5} /> {t('distribution.groups')}
            </ToggleGroupItem>
            <ToggleGroupItem value="people">
              <UserRound size={15} strokeWidth={1.5} /> {t('distribution.people')}
            </ToggleGroupItem>
          </ToggleGroup>

          {facet === 'groups' ? (
            <MultiSelect
              options={groups}
              selected={audiences.filter((id) => groupIds.includes(id))}
              onToggle={toggle}
              onClear={clearGroups}
              placeholder={t('distribution.pickGroups')}
              singular={t('distribution.groupOne')}
              plural={t('distribution.groupOther')}
              aria-label={t('distribution.groups')}
            />
          ) : (
            <ScrollArea className="distribution-people" style={{ maxHeight: 208 }}>
              <div className="distribution-people-list">
                {people.map((p) => (
                  <label key={p.value} className="distribution-person">
                    <Checkbox
                      checked={audiences.includes(p.value)}
                      onCheckedChange={() => toggle(p.value)}
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          )}

          {audiences.length > 0 ? (
            <div className="distribution-chips">
              {audiences.map((v) => (
                <RemovableChip key={v} onRemove={() => toggle(v)}>
                  {audienceOptions.find((o) => o.value === v)?.label ?? v}
                </RemovableChip>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Inline summary of an app's distribution (icon + short label). */
export function DistributionSummary({
  mode = 'only-me',
  label,
  className,
}: {
  mode?: DistributionMode;
  label?: ReactNode;
  className?: string;
}) {
  const Icon = MODE_ICON[mode] ?? Globe;
  return (
    <span className={cn('distribution-summary', className)}>
      <Icon size={13} strokeWidth={1.5} />
      {label}
    </span>
  );
}
