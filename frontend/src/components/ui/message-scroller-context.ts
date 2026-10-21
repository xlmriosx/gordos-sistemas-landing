import { createContext, useContext, useMemo, type RefObject } from 'react';

export type ScrollBehaviorOption = ScrollBehavior;

export interface MessageScrollerContextValue {
  viewportRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  registerItem: (messageId: string, el: HTMLDivElement | null, anchor: boolean) => void;
  measure: () => void;
  scrollToEnd: (behavior?: ScrollBehaviorOption) => void;
  scrollToStart: (behavior?: ScrollBehaviorOption) => void;
  scrollToMessage: (messageId: string, behavior?: ScrollBehaviorOption) => void;
  scrollToLastAnchor: (behavior?: ScrollBehaviorOption) => void;
  atStart: boolean;
  atEnd: boolean;
  scrollable: boolean;
  autoScrolling: boolean;
  visibleMessageIds: string[];
  currentAnchorId: string | null;
}

export const MessageScrollerContext = createContext<MessageScrollerContextValue | null>(null);

export function useScrollerContext(component: string): MessageScrollerContextValue {
  const context = useContext(MessageScrollerContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <MessageScrollerProvider>.`);
  }
  return context;
}

/** Imperative scroll control for a surface that owns the transcript. */
export function useMessageScroller() {
  const { scrollToMessage, scrollToEnd, scrollToStart } = useScrollerContext('useMessageScroller');
  return useMemo(
    () => ({ scrollToMessage, scrollToEnd, scrollToStart }),
    [scrollToMessage, scrollToEnd, scrollToStart],
  );
}

/** `{ start, end }` — whether there is anywhere left to scroll in each direction. */
export function useMessageScrollerScrollable() {
  const { atStart, atEnd, scrollable } = useScrollerContext('useMessageScrollerScrollable');
  return useMemo(
    () => ({ start: scrollable && !atStart, end: scrollable && !atEnd }),
    [scrollable, atStart, atEnd],
  );
}

/** `{ currentAnchorId, visibleMessageIds }` — what the reader is actually looking at. */
export function useMessageScrollerVisibility() {
  const { currentAnchorId, visibleMessageIds } = useScrollerContext(
    'useMessageScrollerVisibility',
  );
  return useMemo(
    () => ({ currentAnchorId, visibleMessageIds }),
    [currentAnchorId, visibleMessageIds],
  );
}
