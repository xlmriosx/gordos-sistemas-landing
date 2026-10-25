/**
 * Pending annotations, and the one action that gets them out: copy.
 *
 * Nothing is sent. The payload goes to the clipboard and the developer pastes it
 * into the conversation when they want to.
 */

import { useEffect, useState } from 'react';
import { confirmationFor, copyText, useToolbar, type Annotation } from './context';
import { t } from './strings';

const HINT_KEY = 'app-pointer-toolbar:hint-seen';
const HINT_MS = 10_000;

/**
 * Same storage choice and the same reasons as the dismissed flag in `Toolbar.tsx`:
 * per tab so it survives the dev server's reloads, never `localStorage` so it does
 * not leak into the next app on the same origin, and wrapped because storage throws
 * in real cases. Every failure degrades to "not seen yet", which just means the
 * instruction is shown again — the safe direction to fail in.
 */
const readHintSeen = () => {
  try {
    return window.sessionStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
};

const writeHintSeen = () => {
  try {
    window.sessionStorage.setItem(HINT_KEY, '1');
  } catch {
    /* best-effort; at worst the developer reads the instruction one more time */
  }
};

export function AnnotationPanel({ onCopied }: { onCopied: (message: string) => void }) {
  const { annotations, remove, clear, payload } = useToolbar();

  /**
   * Read once, at mount, and deliberately never updated while the panel is open.
   *
   * The instruction is onboarding: it teaches the flow once and then stops being
   * furniture in a panel the developer opens all session. But the ten seconds decide
   * *that it has been read*, not *that it goes away now*, and the difference is the
   * whole design. The countdown only runs while the panel is open — a hint burning
   * its timer behind a closed panel would retire unread — which means the only
   * moment it can ever fire is a moment the sentence is on screen. Swapping the text
   * on fire would therefore always take it out from under someone who is looking at
   * it, and the case that triggers it is the worst one: the developer who opened Notas,
   * did not understand what to do, and stayed there reading.
   *
   * So the timer writes the flag and nothing else. The retirement lands on the next
   * time the panel opens, when the developer has already been through the flow and the
   * sentence has become noise. Marking something writes the flag too, and skips the
   * wait: at that point they have demonstrably done what it was asking for.
   */
  const [showHint] = useState(() => !readHintSeen());

  useEffect(() => {
    if (!showHint) return;
    if (annotations.length > 0) {
      writeHintSeen();
      return;
    }
    const timer = setTimeout(writeHintSeen, HINT_MS);
    return () => clearTimeout(timer);
  }, [showHint, annotations.length]);

  if (annotations.length === 0) {
    /**
     * Retiring the instruction must not leave an empty box. An open panel with
     * nothing in it reads as broken — the developer pressed Notas and got a blank
     * rectangle — so the short line stays as the permanent empty state and only the
     * teaching sentence goes away.
     */
    return (
      <div className="pt-panel">
        <p className="pt-panel-empty">
          {showHint ? t.panelOnboarding : t.panelEmpty}
        </p>
      </div>
    );
  }

  const copy = async () => {
    const ok = await copyText(JSON.stringify(payload(), null, 2));
    if (!ok) {
      onCopied(t.copyFailed);
      return;
    }
    onCopied(confirmationFor(annotations));
    clear();
  };

  return (
    <div className="pt-panel">
      <ul className="pt-list">
        {annotations.map((annotation, index) => (
          <li key={index} className="pt-item">
            <div className="pt-item-body">
              <p className="pt-item-message">{annotation.message}</p>
              <p className="pt-item-anchor">{anchorOf(annotation)}</p>
            </div>
            <button
              type="button"
              className="pt-btn pt-btn-icon"
              aria-label={t.removeNote}
              onClick={() => remove(index)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/*
        Copying is only half the flow — the note does nothing until it is pasted
        back into the conversation, and nothing on screen said so. Without this
        line the developer can reasonably believe that copying already sent it.
      */}
      <p className="pt-panel-hint">{t.pasteHint}</p>

      <div className="pt-panel-actions">
        <button type="button" className="pt-btn pt-btn-quiet" onClick={clear}>
          {t.clearAll}
        </button>
        <button type="button" className="pt-btn pt-btn-solid" onClick={copy}>
          {t.copy} {annotations.length > 1 ? `(${annotations.length})` : ''}
        </button>
      </div>
    </div>
  );
}

function anchorOf(annotation: Annotation): string {
  return annotation.target.text || t.anchorFallback;
}
