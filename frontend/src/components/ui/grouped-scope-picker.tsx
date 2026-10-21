import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Checkbox } from './checkbox';
import { Badge } from './primitives';
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
import { cn } from '../../lib/utils';

/**
 * The picker is deliberately blind to any data source: it takes the two
 * levels already resolved. That keeps it usable from any screen that needs a
 * two-level grant picker without an adapter per caller.
 */
export interface ScopeItem {
  id: string;
  name: string;
  /** A short identifier for the item — an endpoint, a tool name, whatever fits the domain. */
  signature: string;
  description?: string;
  /** Rendered as a badge; the caller resolves the label. */
  modeLabel: string;
  modeVariant: 'info' | 'warning' | 'neutral';
  /** Excluded / unclassified items can be shown but not granted. */
  disabled?: boolean;
}

export interface ScopeGroup {
  id: string;
  name: string;
  kindLabel: string;
  items: ScopeItem[];
}

export interface GroupedScopePickerProps {
  groups: ScopeGroup[];
  /** Item ids currently granted. */
  selected: string[];
  onToggle: (itemId: string) => void;
  /** Grants or revokes every grantable item of one group at once. */
  onToggleGroup?: (itemIds: string[], grant: boolean) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * Two-level grant picker: group → its items.
 *
 * The group row is a convenience, never a stored value — the selection this
 * emits is always a flat list of item ids. That is what keeps an item
 * discovered by a later re-sync from being inherited silently.
 */
export function GroupedScopePicker({
  groups,
  selected,
  onToggle,
  onToggleGroup,
  onClear,
  className,
}: GroupedScopePickerProps) {
  const { t } = useTranslation('ui');
  const [query, setQuery] = useState('');
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.signature.toLowerCase().includes(q) ||
            group.name.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return (
    <div className={cn('scope-picker', className)}>
      <div className="scope-picker-toolbar">
        <InputGroup>
          <InputGroupAddon>
            <Search size={15} strokeWidth={1.5} aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('scope.search')}
            aria-label={t('scope.search')}
          />
        </InputGroup>
        {onClear && selected.length > 0 ? (
          <button type="button" className="multi-select-clear" onClick={onClear}>
            {t('scope.clearAll')}
          </button>
        ) : null}
      </div>

      <Accordion type="multiple" className="scope-picker-list">
        {filtered.map((group) => {
          const grantable = group.items.filter((item) => !item.disabled);
          const grantedItems = grantable.filter((item) => selectedSet.has(item.id));
          const all = grantable.length > 0 && grantedItems.length === grantable.length;
          const some = grantedItems.length > 0 && !all;

          return (
            <AccordionItem key={group.id} value={group.id} className="scope-picker-item">
              <div className="scope-picker-head">
                <Checkbox
                  checked={all ? true : some ? 'indeterminate' : false}
                  disabled={grantable.length === 0}
                  onCheckedChange={(checked) =>
                    onToggleGroup?.(
                      grantable.map((item) => item.id),
                      Boolean(checked),
                    )
                  }
                  aria-label={t('scope.toggleGroup', { name: group.name })}
                />
                <AccordionTrigger
                  className="scope-picker-trigger"
                  aria-label={t('scope.expand', { name: group.name })}
                >
                  <span className="scope-picker-name">{group.name}</span>
                  <Badge variant="outline">{group.kindLabel}</Badge>
                  <span className="scope-picker-count">
                    {t('scope.selectedOfTotal', {
                      selected: grantedItems.length,
                      total: grantable.length,
                    })}
                  </span>
                </AccordionTrigger>
              </div>

              <AccordionContent>
                {group.items.length === 0 ? (
                  <p className="t-app-small text-ink-faint">{t('scope.empty')}</p>
                ) : (
                  <ul className="scope-picker-connectors">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <label
                          className={cn('scope-picker-connector', item.disabled && 'is-disabled')}
                        >
                          <Checkbox
                            checked={selectedSet.has(item.id)}
                            disabled={item.disabled}
                            onCheckedChange={() => onToggle(item.id)}
                            aria-label={item.name}
                          />
                          <span className="scope-picker-connector-body">
                            <span className="scope-picker-connector-name">{item.name}</span>
                            <code className="connector-signature">{item.signature}</code>
                          </span>
                          <Badge variant={item.modeVariant}>{item.modeLabel}</Badge>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {filtered.length === 0 ? (
        <p className="t-app-small text-ink-faint">{t('scope.empty')}</p>
      ) : null}
    </div>
  );
}
