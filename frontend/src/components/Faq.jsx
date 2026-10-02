import React, { useRef } from 'react';
import { Reveal } from './ui.jsx';

/* FAQ accordion — one open at a time, mirrors .faq-item behaviour.
   items: [{ q: string, a: ReactNode, open?: bool }] */
export function FaqList({ items, className = '' }) {
  const detailsRefs = useRef([]);
  const onSummaryClick = (idx) => () => {
    detailsRefs.current.forEach((d, i) => {
      if (d && i !== idx && d.open) d.open = false;
    });
  };
  return (
    <div className={className}>
      {items.map((it, i) => (
        <Reveal
          as="details"
          key={i}
          className="faq-item"
          open={it.open || undefined}
          ref={(el) => { detailsRefs.current[i] = el; }}
        >
          <summary onClick={onSummaryClick(i)}>{it.q}</summary>
          <div className="faq-a">{it.a}</div>
        </Reveal>
      ))}
    </div>
  );
}
