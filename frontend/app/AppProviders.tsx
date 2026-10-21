import type { ReactNode } from 'react';
import { TooltipProvider } from '../src/components/ui/tooltip';

/**
 * Every provider a kit component needs from above it, mounted once.
 *
 * `main.tsx` renders the app inside this, and so does `App.render.test.tsx`, so
 * the test renders exactly the tree the browser does. That is the whole reason it
 * is its own component rather than two lines in `main.tsx`: a generated app
 * rewrites `App.tsx`, and the test has to keep catching what breaks it.
 *
 * `TooltipProvider` is here because `Tip` (inside `PageHeader`, `StatCard` and
 * most of `app-kit`) throws without it, and React then leaves `#root` empty —
 * a blank page. Mounted here, once, so every kit component that needs it
 * gets it from above.
 *
 * `ToastProvider` is not: no kit component calls `useToast` itself, so only an
 * app that raises toasts needs it, and that app mounts it.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
