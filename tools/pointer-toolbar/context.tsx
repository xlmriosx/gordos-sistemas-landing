/**
 * Pending-annotation state for the pointer toolbar.
 *
 * Annotations accumulate in memory so the developer can mark several things and
 * paste once. Nothing is persisted and nothing is sent anywhere: the only exit
 * is the clipboard.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ElementRef } from './selector';
import { t } from './strings';

/**
 * One tool for now. `action` stays on the annotation even with a single value:
 * it is what the reading side branches on, and what a second tool would extend.
 */
export type Tool = 'point' | null;

export type PointAnnotation = {
  message: string;
  action: 'point';
  target: ElementRef;
};

export type Annotation = PointAnnotation;

export type Payload = {
  annotations: Annotation[];
  view: string;
  viewport: { w: number; h: number };
};

type ToolbarState = {
  tool: Tool;
  setTool: (tool: Tool) => void;
  annotations: Annotation[];
  add: (annotation: Annotation) => void;
  remove: (index: number) => void;
  clear: () => void;
  payload: () => Payload;
};

const ToolbarContext = createContext<ToolbarState | null>(null);

export function ToolbarProvider({ children }: { children: React.ReactNode }) {
  const [tool, setTool] = useState<Tool>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const add = useCallback((annotation: Annotation) => {
    setAnnotations((current) => [...current, annotation]);
  }, []);

  const remove = useCallback((index: number) => {
    setAnnotations((current) => current.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setAnnotations([]), []);

  const payload = useCallback(
    (): Payload => ({
      annotations,
      view: window.location.hash || window.location.pathname,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    }),
    [annotations],
  );

  const value = useMemo(
    () => ({ tool, setTool, annotations, add, remove, clear, payload }),
    [tool, annotations, add, remove, clear, payload],
  );

  return <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>;
}

export function useToolbar(): ToolbarState {
  const value = useContext(ToolbarContext);
  if (!value) throw new Error('useToolbar must be used inside ToolbarProvider');
  return value;
}

/**
 * Short human-readable line shown after copying, so the JSON stays invisible.
 *
 * The echo exists so nobody has to inspect the clipboard to trust the copy, and
 * the tail exists because copying is not the last step — the panel's hint says to
 * paste it, and the panel is cleared by the time this shows, so the instruction
 * has to survive here too.
 *
 * This line is the only part of a copy that follows the bar's language. The
 * developer's own words in `head` are quoted as typed, and the clipboard itself
 * holds the payload above, which never does.
 */
export function confirmationFor(annotations: Annotation[]): string {
  if (annotations.length === 0) return '';
  const first = annotations[0].message.replace(/\s+/g, ' ').trim();
  const head = first.length > 48 ? `${first.slice(0, 48)}…` : first;
  return t.copied(head, annotations.length - 1);
}

/**
 * Clipboard write with a fallback for non-secure contexts, where
 * navigator.clipboard is unavailable.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
