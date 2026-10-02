import React, { useRef, useEffect, useState } from 'react';
import { useAssetBase } from '../lib/theme.jsx';

/* Scroll reveal with stagger — mirrors the original .reveal behaviour.
   Pass delay manually (e.g. index * 0.08) inside mapped grids. */
export const Reveal = React.forwardRef(function Reveal(
  { as: Tag = 'div', className = '', delay, children, ...rest },
  forwardedRef
) {
  const innerRef = useRef(null);
  const setRef = (el) => {
    innerRef.current = el;
    if (typeof forwardedRef === 'function') forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  };
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.classList.add('reveal');
    if (delay != null) el.style.setProperty('--rd', `${delay}s`);
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('in');
          io.unobserve(en.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={setRef} className={className} {...rest}>{children}</Tag>;
});

/* Animated counter — mirrors [data-count] + [data-suffix]. Counts up the
   first time it scrolls into view. */
export function CountUp({ end = 0, suffix = '', className = '', as: Tag = 'span', ...rest }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (n) => n.toLocaleString('en-IN');
    const run = () => {
      if (done.current) return;
      done.current = true;
      const dur = 1600;
      let start = null;
      const frame = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if (!('IntersectionObserver' in window)) { setVal(end); done.current = true; return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { run(); io.disconnect(); }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end]);
  return <Tag ref={ref} className={className} {...rest}>{val.toLocaleString('en-IN')}{suffix}</Tag>;
}

/* Countdown to 19 Feb 2027, 09:00 SAST (Africa/Johannesburg). */
const TARGET = new Date('2027-02-19T09:00:00+02:00').getTime();
const pad = (n) => (n < 10 ? '0' : '') + n;

export function Countdown() {
  const [t, setT] = useState(() => TARGET - Date.now());
  useEffect(() => {
    const iv = setInterval(() => setT(TARGET - Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const diff = Math.max(t, 0);
  const d = Math.floor(diff / 864e5);
  const h = pad(Math.floor(diff / 36e5) % 24);
  const m = pad(Math.floor(diff / 6e4) % 60);
  const s = pad(Math.floor(diff / 1e3) % 60);
  return (
    <div className="countdown" data-hero role="timer" aria-label="Countdown to Trading Expo Africa">
      <div className="cd-cell"><span className="cd-num">{diff <= 0 ? '00' : d}</span><span className="cd-label">Days</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-cell"><span className="cd-num">{h}</span><span className="cd-label">Hours</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-cell"><span className="cd-num">{m}</span><span className="cd-label">Minutes</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-cell"><span className="cd-num">{s}</span><span className="cd-label">Seconds</span></div>
    </div>
  );
}

/* Sample market snapshot ticker (illustrative data, not live). */
const MKT = [
  ['EUR/USD', '1.0924', '+0.12%', 'up'], ['GBP/USD', '1.2741', '-0.08%', 'dn'],
  ['USD/JPY', '151.32', '+0.21%', 'up'], ['USD/ZAR', '18.42', '-0.05%', 'dn'],
  ['BTC/USD', '97,450', '+1.84%', 'up'], ['ETH/USD', '3,620', '+2.15%', 'up'],
  ['XAU/USD', '2,912.40', '+0.34%', 'up'], ['USD/NGN', '1,542.10', '+0.42%', 'up'],
];

export function MarketTicker() {
  const items = [...MKT, ...MKT]; // duplicated for a seamless CSS loop
  return (
    <div className="mkt-ticker" role="region" aria-label="Sample market snapshot — illustrative data, not live">
      <span className="mkt-tag">Sample market snapshot</span>
      <div className="mkt-viewport">
        <div className="mkt-track">
          {items.map(([sym, px, mv, dir], i) => (
            <span className="mkt-item" key={i}>
              <span className="sym">{sym}</span>
              <span className="px">{px}</span>
              <span className={`mv ${dir}`}>{dir === 'up' ? '▲' : '▼'} {mv}</span>
            </span>
          ))}
        </div>
      </div>
      <noscript><p style={{ padding: '10px 22px', fontSize: 12, color: '#9fb3c8' }}>EUR/USD 1.0924 · GBP/USD 1.2741 · USD/JPY 151.32 · USD/ZAR 18.42 · BTC/USD 97,450 · ETH/USD 3,620 · Gold 2,912 · USD/NGN 1,542 — illustrative sample only, not live data.</p></noscript>
    </div>
  );
}

/* Home-page preloader with progress. */
export function Preloader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const ab = useAssetBase();
  useEffect(() => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      document.body.classList.add('loaded');
      document.body.classList.remove('pre-loading');
      setTimeout(() => setDone(true), 1250);
    };
    const imgs = Array.prototype.slice.call(document.images);
    let loaded = 0;
    const total = imgs.length;
    const tick = () => {
      loaded++;
      setPct(Math.max(0, Math.min(100, Math.round(10 + (loaded / Math.max(total, 1)) * 80))));
      if (loaded >= total) finish();
    };
    if (total === 0) finish();
    imgs.forEach((im) => {
      if (im.complete) tick();
      else { im.addEventListener('load', tick); im.addEventListener('error', tick); }
    });
    let creep = 10;
    const iv = setInterval(() => {
      if (finished) { clearInterval(iv); return; }
      creep = Math.min(creep + 5, 90);
      setPct((p) => (creep > p ? creep : p));
    }, 240);
    const safety = setTimeout(finish, 6000);
    return () => { clearInterval(iv); clearTimeout(safety); finished = true; };
  }, []);
  if (done) return null;
  return (
    <div className={'preloader' + (pct >= 100 ? ' done' : '')} id="preloader" aria-hidden="true">
      <img className="pre-logo-img" src={ab + 'logo-dark.png'} alt="Trading Expo Africa" />
      <div className="pre-count"><span>{pct < 10 ? '0' : ''}{pct}</span>%</div>
      <div className="pre-bar"><i style={{ width: pct + '%' }}></i></div>
    </div>
  );
}

/* Parallax image — mirrors [data-parallax-img]. */
export function ParallaxImg({ className = '', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = img.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -80 || r.top > vh + 80) return;
      const p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      img.style.transform = `translateY(${(p * 12).toFixed(2)}%) scale(1.12)`;
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);
  return <img ref={ref} className={className} {...rest} />;
}

/* Parallax layer — mirrors [data-parallax] with a speed factor. */
export function ParallaxLayer({ speed = 0.2, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      const off = (r.top + r.height / 2 - vh / 2) * -speed * 0.6;
      el.style.transform = `translateY(${off.toFixed(1)}px)`;
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [speed]);
  return <div ref={ref} className={className} {...rest}>{children}</div>;
}
