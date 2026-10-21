import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * Table: a shadcn-style composition over the brand `.data-table` styles already
 * defined in app.css, so tables built here look identical to the existing
 * DataTable. No Radix dependency.
 */
export const Table = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<'table'>>(function Table({ className, ...props }, ref) {
  return (
    <div className="data-table-wrap">
      <table ref={ref} className={cn('data-table', className)} {...props} />
    </div>
  );
});

export function TableHeader({ className, ...props }: ComponentPropsWithoutRef<'thead'>) {
  return <thead className={cn(className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentPropsWithoutRef<'tbody'>) {
  return <tbody className={cn(className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentPropsWithoutRef<'tr'>) {
  return <tr className={cn(className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentPropsWithoutRef<'th'>) {
  return <th className={cn(className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentPropsWithoutRef<'td'>) {
  return <td className={cn(className)} {...props} />;
}

export function TableCaption({ className, ...props }: ComponentPropsWithoutRef<'caption'>) {
  return <caption className={cn('data-table-caption', className)} {...props} />;
}
