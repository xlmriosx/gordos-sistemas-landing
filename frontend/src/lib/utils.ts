import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names the shadcn way: clsx for conditionals, tailwind-merge to
 * resolve conflicting utilities. Brand classes (.btn, .badge, …) pass through
 * untouched — twMerge only dedupes recognized Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
