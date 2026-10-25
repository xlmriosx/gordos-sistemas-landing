/**
 * Point tool: hover highlights an element, click opens the text box.
 *
 * Listens on the window in capture phase so the host app never receives the
 * click, and so the toolbar does not need to sit above the page to intercept it.
 */

import { useEffect, useState } from 'react';
import { Composer } from './Composer';
import { useToolbar } from './context';
import { describe, elementAtPoint, type ElementRef } from './selector';

type Pending = { target: ElementRef; at: { x: number; y: number } };

export function Picker({ ignore }: { ignore: Element[] }) {
  const { add, setTool } = useToolbar();
  const [hover, setHover] = useState<ElementRef | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    if (pending) return;

    const onMove = (event: MouseEvent) => {
      const el = elementAtPoint(event.clientX, event.clientY, ignore);
      setHover(el ? describe(el) : null);
    };

    const onClick = (event: MouseEvent) => {
      const el = elementAtPoint(event.clientX, event.clientY, ignore);
      if (!el) return;
      event.preventDefault();
      event.stopPropagation();
      setPending({ target: describe(el), at: { x: event.clientX, y: event.clientY } });
      setHover(null);
    };

    window.addEventListener('mousemove', onMove, true);
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('mousemove', onMove, true);
      window.removeEventListener('click', onClick, true);
    };
  }, [pending, ignore]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (pending) setPending(null);
      else setTool(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [pending, setTool]);

  const box = pending?.target.box ?? hover?.box;
  const label = pending?.target.text ?? hover?.text;

  return (
    <>
      {box ? (
        <div
          className="pt-highlight"
          style={{ left: box[0], top: box[1], width: box[2], height: box[3] }}
        >
          {label ? <span className="pt-highlight-label">{label}</span> : null}
        </div>
      ) : null}

      {pending ? (
        <Composer
          at={pending.at}
          hint={pending.target.text}
          onConfirm={(message) => {
            add({ message, action: 'point', target: pending.target });
            setPending(null);
          }}
          onCancel={() => setPending(null)}
        />
      ) : null}
    </>
  );
}
