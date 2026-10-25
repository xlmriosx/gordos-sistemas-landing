import type { ComponentProps, CSSProperties } from 'react';
import { Toaster as SonnerPrimitive } from 'sonner';

/**
 * sonner-based toaster: an opinionated, stacked toast system (alternative to
 * the Radix Toast in toast.jsx). Mount <Toaster /> once near the app root, then
 * call `toast(...)` anywhere. Brand look is applied through sonner's CSS
 * variables so no stylesheet import is needed.
 */
export function Toaster({ position = 'bottom-right', ...props }: ComponentProps<typeof SonnerPrimitive>) {
  return (
    <SonnerPrimitive
      position={position}
      gap={12}
      toastOptions={{
        classNames: {
          toast: 'sonner-toast',
          title: 'sonner-title',
          description: 'sonner-desc',
          actionButton: 'sonner-action',
          cancelButton: 'sonner-cancel',
          closeButton: 'sonner-close',
        },
      }}
      style={{
        // sonner is themed through CSS custom properties; CSSProperties has no
        // index signature for them, so the cast is the documented way in.
        '--normal-bg': 'var(--carbon-black)',
        '--normal-text': 'var(--off-white)',
        '--normal-border': 'var(--carbon-black)',
        '--success-bg': 'var(--status-ok)',
        '--success-text': 'var(--off-white)',
        '--success-border': 'var(--status-ok)',
        '--error-bg': 'var(--status-critical)',
        '--error-text': 'var(--off-white)',
        '--error-border': 'var(--status-critical)',
        '--border-radius': 'var(--radius-md)',
        '--font-family': 'var(--font-sans)',
        '--width': '360px',
      } as CSSProperties}
      {...props}
    />
  );
}
