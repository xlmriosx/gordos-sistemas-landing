import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  MessageScrollerContext,
  useScrollerContext,
  useMessageScrollerScrollable,
  type ScrollBehaviorOption,
} from './message-scroller-context';

/**
 * Transcript scroller for a conversation: follows a streaming response while the
 * reader is at the live edge, and gets out of the way the moment they scroll up.
 *
 * SCOPE (same as upstream): this owns the scroll viewport and nothing else. It
 * does not own the messages, the composer, transport, persistence or model
 * state. The composer in the demo is built from `InputGroup` — it is not part of
 * this component, and upstream's is not either.
 *
 * Composition: Provider (state) → MessageScroller (frame) → Viewport (scroll
 * container) → Content (live region) → Item (row boundary), plus Button.
 * Hooks: `useMessageScroller`, `useMessageScrollerScrollable`,
 * `useMessageScrollerVisibility`.
 *
 * Two deliberate simplifications vs. upstream:
 *  - Row-position preservation on resize uses the browser's native scroll
 *    anchoring (`overflow-anchor`, set in ds-components.css) instead of manual
 *    measurement. It's what the platform already does well.
 *  - Auto-follow is gated on "is the reader at the end", tracked in a ref, so a
 *    streaming token can't yank the viewport away from someone reading history.
 */
/** One registered row: its element and whether it is a turn boundary. */
interface ItemEntry {
  el: HTMLDivElement | null;
  anchor: boolean;
}

// How close to an edge still counts as "at" it, in px. Absorbs sub-pixel
// rounding and elastic overscroll.
const EDGE_SLACK = 8;

/**
 * Distance from the top of the scrollable content to `el`.
 *
 * Deliberately not `el.offsetTop`: `.message-scroller` is `position: relative`,
 * so offsetTop measures against the frame rather than the scrolled content and
 * lands short by the frame's offset. Rect math is immune to where the offset
 * parent happens to be.
 */
function contentOffsetTop(el: HTMLElement, viewport: HTMLElement): number {
  return el.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
}

export interface MessageScrollerProviderProps {
  /** Follow content growth while the reader sits at the live edge. */
  autoScroll?: boolean;
  defaultScrollPosition?: 'end' | 'last-anchor' | 'start';
  /** Px of the previous turn left visible when scrolling to an anchor. */
  scrollPreviousItemPeek?: number;
  children?: ReactNode;
}

export function MessageScrollerProvider({
  autoScroll = true,
  defaultScrollPosition = 'end',
  scrollPreviousItemPeek = 64,
  children,
}: MessageScrollerProviderProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef(new Map<string, ItemEntry>());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibleRef = useRef(new Set<string>());
  const atEndRef = useRef(true);
  const didInitRef = useRef(false);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [scrollable, setScrollable] = useState(false);
  const [visibleMessageIds, setVisibleMessageIds] = useState<string[]>([]);
  const [currentAnchorId, setCurrentAnchorId] = useState<string | null>(null);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, clientHeight, scrollHeight } = viewport;
    const nextAtEnd = scrollTop + clientHeight >= scrollHeight - EDGE_SLACK;

    atEndRef.current = nextAtEnd;
    setAtStart(scrollTop <= EDGE_SLACK);
    setAtEnd(nextAtEnd);
    setScrollable(scrollHeight - clientHeight > EDGE_SLACK);

    // The anchor whose turn is currently being read: the last one at or above
    // the top of the viewport, falling back to the first anchor below it.
    let anchorId: string | null = null;
    let bestAbove = -Infinity;
    let firstBelow: string | null = null;
    let bestBelow = Infinity;

    for (const [id, entry] of itemsRef.current) {
      if (!entry.anchor || !entry.el) continue;
      const offset = contentOffsetTop(entry.el, viewport) - scrollTop;
      if (offset <= EDGE_SLACK) {
        if (offset > bestAbove) {
          bestAbove = offset;
          anchorId = id;
        }
      } else if (offset < bestBelow) {
        bestBelow = offset;
        firstBelow = id;
      }
    }
    if (anchorId === null) anchorId = firstBelow;
    setCurrentAnchorId((prev) => (prev === anchorId ? prev : anchorId));
  }, []);

  const scrollToEnd = useCallback((behavior: ScrollBehaviorOption = 'smooth') => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
  }, []);

  const scrollToStart = useCallback((behavior: ScrollBehaviorOption = 'smooth') => {
    viewportRef.current?.scrollTo({ top: 0, behavior });
  }, []);

  /** Put a specific message at the top, keeping `scrollPreviousItemPeek` of the previous one. */
  const scrollToMessage = useCallback(
    (messageId: string, behavior: ScrollBehaviorOption = 'smooth') => {
      const viewport = viewportRef.current;
      const entry = itemsRef.current.get(messageId);
      if (!viewport || !entry?.el) return;
      const top = contentOffsetTop(entry.el, viewport) - scrollPreviousItemPeek;
      viewport.scrollTo({ top: Math.max(0, top), behavior });
    },
    [scrollPreviousItemPeek],
  );

  /**
   * Put the last turn boundary at the top, leaving `scrollPreviousItemPeek` px of
   * the previous turn visible — the sliver of context that tells the reader they
   * aren't at the start of the transcript.
   */
  const scrollToLastAnchor = useCallback(
    (behavior: ScrollBehaviorOption = 'smooth') => {
      let lastAnchorId: string | null = null;
      for (const [id, entry] of itemsRef.current) {
        if (entry.anchor && entry.el) lastAnchorId = id;
      }
      if (lastAnchorId === null) {
        scrollToEnd(behavior);
        return;
      }
      scrollToMessage(lastAnchorId, behavior);
    },
    [scrollToEnd, scrollToMessage],
  );

  const publishVisible = useCallback(() => {
    // Document order, not intersection order — callers render this as a list.
    const ids = [...itemsRef.current.keys()].filter((id) => visibleRef.current.has(id));
    setVisibleMessageIds((prev) =>
      prev.length === ids.length && prev.every((id, i) => id === ids[i]) ? prev : ids,
    );
  }, []);

  const registerItem = useCallback(
    (messageId: string, el: HTMLDivElement | null, anchor: boolean) => {
      const previous = itemsRef.current.get(messageId);
      if (!el) {
        if (previous?.el) observerRef.current?.unobserve(previous.el);
        itemsRef.current.delete(messageId);
        visibleRef.current.delete(messageId);
        return;
      }
      if (previous?.el && previous.el !== el) observerRef.current?.unobserve(previous.el);
      itemsRef.current.set(messageId, { el, anchor });
      observerRef.current?.observe(el);
    },
    [],
  );

  // Which items are on screen. Child effects run before ours, so everything
  // registered on the first pass gets picked up here.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.messageId;
          if (!id) continue;
          if (entry.isIntersecting) visibleRef.current.add(id);
          else visibleRef.current.delete(id);
        }
        publishVisible();
      },
      { root: viewport, threshold: 0 },
    );

    observerRef.current = observer;
    for (const { el } of itemsRef.current.values()) if (el) observer.observe(el);

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [publishVisible]);

  // Opening position, applied once without animation.
  useLayoutEffect(() => {
    if (didInitRef.current || !viewportRef.current) return;
    didInitRef.current = true;

    if (defaultScrollPosition === 'end') scrollToEnd('auto');
    else if (defaultScrollPosition === 'last-anchor') scrollToLastAnchor('auto');
    measure();
  }, [defaultScrollPosition, measure, scrollToEnd, scrollToLastAnchor]);

  // Follow content growth only while the reader is already at the live edge.
  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (autoScroll && atEndRef.current) {
        scrollToEnd('auto');
        // Upstream hides the scrollbar while it follows a stream, so a bar
        // doesn't twitch on every token. Cleared shortly after the last growth.
        setAutoScrolling(true);
        clearTimeout(autoScrollTimerRef.current);
        autoScrollTimerRef.current = setTimeout(() => setAutoScrolling(false), 250);
      }
      measure();
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      clearTimeout(autoScrollTimerRef.current);
    };
  }, [autoScroll, measure, scrollToEnd]);

  const value = useMemo(
    () => ({
      viewportRef,
      contentRef,
      registerItem,
      measure,
      scrollToEnd,
      scrollToStart,
      scrollToMessage,
      scrollToLastAnchor,
      atStart,
      atEnd,
      scrollable,
      autoScrolling,
      visibleMessageIds,
      currentAnchorId,
    }),
    [
      registerItem,
      measure,
      scrollToEnd,
      scrollToStart,
      scrollToMessage,
      scrollToLastAnchor,
      atStart,
      atEnd,
      scrollable,
      autoScrolling,
      visibleMessageIds,
      currentAnchorId,
    ],
  );

  return (
    <MessageScrollerContext.Provider value={value}>{children}</MessageScrollerContext.Provider>
  );
}

/** The frame: establishes the positioning context the Button anchors to. */
export const MessageScroller = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function MessageScroller({ className, ...props }, ref) {
    return <div ref={ref} className={cn('message-scroller', className)} {...props} />;
  },
);

export const MessageScrollerViewport = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'>
>(function MessageScrollerViewport({ className, onScroll, ...props }, forwardedRef) {
  const { viewportRef, measure, atEnd, scrollable, autoScrolling } =
    useScrollerContext('MessageScrollerViewport');

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef, viewportRef],
  );

  useEffect(() => {
    measure();
  }, [measure]);

  return (
    <div
      ref={setRef}
      data-slot="message-scroller-viewport"
      // `scroll-fade-b` — bottom edge only, matching upstream. Gated on real
      // scroll state so the fade disappears once you reach the end.
      className={cn('message-scroller-viewport', 'scroll-fade-b', className)}
      data-fade-end={scrollable && !atEnd ? 'true' : undefined}
      // Hides the scrollbar while following a stream, so it doesn't twitch on
      // every token.
      data-autoscrolling={autoScrolling ? 'true' : undefined}
      onScroll={(event) => {
        measure();
        onScroll?.(event);
      }}
      {...props}
    />
  );
});

/**
 * The transcript. `role="log"` + `aria-relevant="additions"` per upstream: a log
 * is announced politely and only for what was added, which is what you want for
 * streamed turns. Pass `aria-busy` while a reply is generating.
 */
export const MessageScrollerContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'>
>(function MessageScrollerContent({ className, ...props }, forwardedRef) {
  const { contentRef } = useScrollerContext('MessageScrollerContent');

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [contentRef, forwardedRef],
  );

  return (
    <div
      ref={setRef}
      data-slot="message-scroller-content"
      role="log"
      aria-relevant="additions"
      className={cn('message-scroller-content', className)}
      {...props}
    />
  );
});

/**
 * A row boundary. `scrollAnchor` marks it as a turn boundary — the target that
 * `last-anchor` and `currentAnchorId` refer to.
 */
export interface MessageScrollerItemProps extends ComponentPropsWithoutRef<'div'> {
  messageId: string;
  /** Marks this row as a turn boundary — the `last-anchor` scroll target. */
  scrollAnchor?: boolean;
}

export const MessageScrollerItem = forwardRef<HTMLDivElement, MessageScrollerItemProps>(
  function MessageScrollerItem({ messageId, scrollAnchor = false, className, ...props }, forwardedRef) {
  const { registerItem } = useScrollerContext('MessageScrollerItem');
  const localRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useEffect(() => {
    registerItem(messageId, localRef.current, scrollAnchor);
    return () => registerItem(messageId, null, scrollAnchor);
  }, [messageId, scrollAnchor, registerItem]);

  return (
    <div
      ref={setRef}
      data-slot="message-scroller-item"
      data-message-id={messageId}
      data-scroll-anchor={scrollAnchor || undefined}
      className={cn('message-scroller-item', className)}
      {...props}
    />
  );
  },
);

/**
 * Jump to an edge of the transcript. Sits centered against that edge, and slides
 * back out of it when there is nothing left to scroll — so it never offers a
 * dead action and never occupies a tab stop it can't use.
 *
 * `data-active` is always present as "true"/"false" (not omitted when false):
 * the enter and exit transitions use different easing curves, which needs both
 * states to be addressable in CSS.
 */
export interface MessageScrollerButtonProps extends ComponentPropsWithoutRef<'button'> {
  direction?: 'start' | 'end';
  /** Screen-reader name; defaults per direction. */
  label?: string;
}

export const MessageScrollerButton = forwardRef<HTMLButtonElement, MessageScrollerButtonProps>(
  function MessageScrollerButton({ direction = 'end', label, className, children, ...props }, ref) {
  const { scrollToEnd, scrollToStart } = useScrollerContext('MessageScrollerButton');
  const scrollableTo = useMessageScrollerScrollable();

  const isEnd = direction === 'end';
  const active = isEnd ? scrollableTo.end : scrollableTo.start;
  const text = label ?? (isEnd ? 'Scroll to end' : 'Scroll to start');

  return (
    <button
      ref={ref}
      type="button"
      data-slot="message-scroller-button"
      disabled={!active}
      data-active={active ? 'true' : 'false'}
      data-direction={direction}
      className={cn('message-scroller-button', className)}
      onClick={() => (isEnd ? scrollToEnd() : scrollToStart())}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDown size={16} strokeWidth={1.5} aria-hidden />
          <span className="sr-only">{text}</span>
        </>
      )}
    </button>
  );
  },
);
