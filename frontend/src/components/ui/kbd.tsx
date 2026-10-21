import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * A single keyboard key. Geist Mono, uppercase-agnostic (pass the glyph you
 * want — `⌘`, `Ctrl`, `B`), sized to sit inline with body text or inside a
 * button / tooltip / input addon.
 */
export const Kbd = forwardRef<HTMLElement, ComponentPropsWithoutRef<'kbd'>>(function Kbd({ className, children, ...props }, ref) {
  return (
    <kbd ref={ref} className={cn('kbd', className)} {...props}>
      {children}
    </kbd>
  );
});

/**
 * Groups keys of one shortcut (`⌘` + `K`). Renders a plain wrapper so the keys
 * read as one unit and don't wrap mid-chord.
 */
export const KbdGroup = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(function KbdGroup({ className, children, ...props }, ref) {
  return (
    <span ref={ref} className={cn('kbd-group', className)} {...props}>
      {children}
    </span>
  );
});
