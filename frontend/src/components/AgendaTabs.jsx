import React, { useState } from 'react';
import { Reveal } from './ui.jsx';

/* Agenda day tabs.
   days: [{ id: '1', label: 'Day 1 — 23 April', rows: [{ time, title, text, tag, tagClass }] }] */
export function AgendaTabs({ days }) {
  const [active, setActive] = useState(days[0] ? days[0].id : '1');
  return (
    <>
      <div className="agenda-tabs" role="tablist">
        {days.map((d) => (
          <button
            key={d.id}
            className={'tab' + (active === d.id ? ' active' : '')}
            data-day={d.id}
            role="tab"
            onClick={() => setActive(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>
      {days.map((d) => (
        <div key={d.id} className={'agenda-day' + (active === d.id ? ' active' : '')} data-day={d.id}>
          {d.rows.map((r, i) => (
            <Reveal as="article" className="arow" key={i}>
              <time>{r.time}</time>
              <div><h3>{r.title}</h3><p>{r.text}</p></div>
              <span className={'atag' + (r.tagClass ? ' ' + r.tagClass : '')}>{r.tag}</span>
            </Reveal>
          ))}
        </div>
      ))}
    </>
  );
}
