import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ToastContext, type ToastOptions } from './toast-context';

/**
 * Radix Toast wrapped in a small imperative API (shadcn-style): mount <Toaster>
 * once near the app root, then call `toast(...)` from the `useToast()` hook.
 * Visuals use the brand `.toast-*` classes.
 */
interface ToastRecord extends ToastOptions {
  id: number;
}

export function ToastProvider({
  children,
  duration = 5000,
}: {
  children?: ReactNode;
  duration?: number;
}) {
  const { t } = useTranslation('ui');
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(({ title, description, variant }: ToastOptions = {}) => {
    const id = ++idRef.current;
    setToasts((list) => [...list, { id, title, description, variant }]);
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider duration={duration} swipeDirection="right">
        {children}
        {toasts.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            className={cn('toast', item.variant && `toast--${item.variant}`)}
            onOpenChange={(open) => (open ? null : dismiss(item.id))}
          >
            <div className="toast-body">
              {item.title ? (
                <ToastPrimitive.Title className="toast-title">{item.title}</ToastPrimitive.Title>
              ) : null}
              {item.description ? (
                <ToastPrimitive.Description className="toast-desc">
                  {item.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close className="toast-close" aria-label={t('action.close')}>
              <X size={15} strokeWidth={1.5} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="toast-viewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
