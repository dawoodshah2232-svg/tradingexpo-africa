import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Reveal } from './ui.jsx';

/* Shared lightbox view — same markup as the original #lightbox. */
export function LightboxView({ items, index, onClose, onNav }) {
  const item = items[index] || {};
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNav]);
  return (
    <div
      className="lightbox open"
      id="lightbox"
      aria-hidden="false"
      role="dialog"
      aria-label="Image viewer"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button className="lb-close" aria-label="Close viewer" onClick={onClose}>×</button>
      <button className="lb-prev" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); onNav(-1); }}>←</button>
      <figure>
        <img src={item.src} alt={item.alt || ''} />
        <figcaption>{item.caption || item.alt || ''}</figcaption>
      </figure>
      <button className="lb-next" aria-label="Next image" onClick={(e) => { e.stopPropagation(); onNav(1); }}>→</button>
    </div>
  );
}

/* Hook managing lightbox state for a list of figures. */
export function useLightbox() {
  const [state, setState] = useState({ items: [], index: -1 });
  const open = useCallback((items, index) => setState({ items, index }), []);
  const close = useCallback(() => setState((s) => ({ ...s, index: -1 })), []);
  const nav = useCallback(
    (d) => setState((s) => ({
      ...s,
      index: s.items.length ? (s.index + d + s.items.length) % s.items.length : -1,
    })),
    []
  );
  const view = state.index >= 0 ? (
    <LightboxView items={state.items} index={state.index} onClose={close} onNav={nav} />
  ) : null;
  return { open, close, view, isOpen: state.index >= 0 };
}

/* Home-page horizontal drag-scroll gallery.
   items: [{ src, alt, top, bottom }] -> figcaption <span>top</span><strong>bottom</strong> */
export function GalleryTrack({ items, navClassName = 'g-nav', navExtra = null }) {
  const trackRef = useRef(null);
  const drag = useRef({ down: false, sx: 0, sl: 0 });
  const { open, view } = useLightbox();

  const scrollByCards = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.g-card');
    const w = card ? card.offsetWidth + 18 : 320;
    track.scrollBy({ left: dir * w * 2, behavior: 'smooth' });
  };

  useEffect(() => {
    const onMove = (e) => {
      const d = drag.current;
      if (d.down && trackRef.current) trackRef.current.scrollLeft = d.sl - (e.clientX - d.sx);
    };
    const onUp = () => { drag.current.down = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const lbItems = items.map((f) => ({ src: f.src, alt: f.alt, caption: `${f.top} — ${f.bottom}` }));

  return (
    <>
      <div
        className="gallery"
        id="galleryTrack"
        ref={trackRef}
        onPointerDown={(e) => {
          drag.current = { down: true, sx: e.clientX, sl: trackRef.current.scrollLeft };
        }}
      >
        {items.map((f, i) => (
          <figure className="g-card" key={i} onClick={() => open(lbItems, i)}>
            <img src={f.src} alt={f.alt} loading="lazy" draggable="false" />
            <figcaption><span>{f.top}</span><strong>{f.bottom}</strong></figcaption>
          </figure>
        ))}
      </div>
      <div className={navClassName}>
        <button className="g-btn" id="gPrev" aria-label="Previous images" onClick={() => scrollByCards(-1)}>←</button>
        <button className="g-btn" id="gNext" aria-label="Next images" onClick={() => scrollByCards(1)}>→</button>
        {navExtra}
      </div>
      {view}
    </>
  );
}

const FILTERS = [
  ['all', 'All'], ['exhibition', 'Exhibition'], ['conference', 'Conference'],
  ['networking', 'Networking'], ['venue', 'Johannesburg'], ['profx', 'ProFX Events'], ['brand', 'Brand'],
];

/* Gallery page: filters + grid + lightbox.
   items: [{ src, alt, caption, cat }] */
export function GalleryGrid({ items }) {
  const [filter, setFilter] = useState('all');
  const { open, view } = useLightbox();
  const visible = items.filter((f) => filter === 'all' || f.cat === filter);
  const lbItems = visible.map((f) => ({ src: f.src, alt: f.alt, caption: f.caption }));

  return (
    <>
      <Reveal className="g-filters" role="group" aria-label="Filter gallery">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? 'active' : ''}
            data-filter={key}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </Reveal>
      <div className="gallery-page" id="galleryPage">
        {visible.map((f, i) => (
          <figure className="g-item" data-cat={f.cat} key={f.src} onClick={() => open(lbItems, i)}>
            <img src={f.src} alt={f.alt} loading="lazy" />
            <figcaption>{f.caption}</figcaption>
          </figure>
        ))}
      </div>
      {view}
    </>
  );
}
