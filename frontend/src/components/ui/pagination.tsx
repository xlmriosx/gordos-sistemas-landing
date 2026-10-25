import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Pagination: plain, controlled page navigation — no Radix dependency. Pass
 * `page`, `pageCount`, and `onPageChange`; renders prev/next plus numbered
 * pages with an ellipsis for long ranges.
 */
type PageSlot = number | 'ellipsis';

function pageRange(page: number, pageCount: number): PageSlot[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: PageSlot[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('ellipsis');
    out.push(p);
    prev = p;
  }
  return out;
}

export interface PaginationProps {
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ page = 1, pageCount = 1, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation('ui');
  const go = (p: number) => {
    if (p >= 1 && p <= pageCount && p !== page) onPageChange?.(p);
  };
  return (
    <nav className={cn('pagination', className)} aria-label={t('pagination.label')}>
      <button
        type="button"
        className="pagination-btn"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label={t('pagination.previousPage')}
      >
        <ChevronLeft size={15} strokeWidth={1.5} />
      </button>
      {pageRange(page, pageCount).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="pagination-ellipsis" aria-hidden>…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={cn('pagination-page', p === page && 'is-active')}
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="pagination-btn"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        aria-label={t('pagination.nextPage')}
      >
        <ChevronRight size={15} strokeWidth={1.5} />
      </button>
    </nav>
  );
}
