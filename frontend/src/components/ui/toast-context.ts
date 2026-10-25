import { createContext, useContext, type ReactNode } from 'react';

export type ToastVariant = 'ok' | 'warning' | 'critical' | 'info';

export interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
}

export interface ToastApi {
  toast: (options?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
