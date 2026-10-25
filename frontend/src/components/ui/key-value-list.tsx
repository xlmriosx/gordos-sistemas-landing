import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
}

export interface KeyValueListProps {
  items: ReadonlyArray<KeyValueItem>;
  className?: string;
}

/**
 * KeyValueList: a definition list for review / settings meta.
 *
 * Labels are mono uppercase (Geist Mono) so they read as field keys; values
 * stay body weight. Prefer this over a hand-rolled `<dl>` whenever a sheet or
 * wizard summary needs the same rails.
 */
export function KeyValueList({ items, className }: KeyValueListProps) {
  if (items.length === 0) return null;

  return (
    <dl className={cn('key-value-list', className)}>
      {items.map((item, index) => (
        <div
          key={typeof item.label === 'string' || typeof item.label === 'number' ? String(item.label) : index}
          className="key-value-row"
        >
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
