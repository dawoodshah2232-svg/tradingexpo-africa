import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme, useAssetBase, AssetBaseProvider } from '../lib/theme.jsx';

const NAV_LINKS = [
  ['index.html', 'home', 'Home'],
  ['tickets.html', 'tickets', 'Tickets'],
  ['exhibit.html', 'exhibit', 'Exhibit'],
  ['agenda.html', 'agenda', 'Agenda'],
  ['venue.html', 'venue', 'Venue'],
  ['gallery.html', 'gallery', 'Gallery'],
  ['sponsors.html', 'sponsors', 'Sponsors'],
  ['awards.html', 'awards', 'Awards'],
  ['blog.html', 'blog', 'Blog'],
  ['faq.html', 'faq', 'FAQ'],
  ['contact.html', 'contact', 'Contact'],
];

function SunIcon() {
  return (
    <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function Header({ page, linkBase }) {
  const { theme, toggle } = useTheme();
  const ab = useAssetBase();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logo = theme === 'dark' ? 'logo-dark-compact.png' : 'logo-light-compact.png';

  return (
    <header className={'nav' + (scrolled ? ' scrolled' : '')} id="nav">
      <div className="nav-inner">
        <a className="logo" href={linkBase + "index.html"} aria-label="Trading Expo Africa — home">
          <img className="nav-logo theme-logo" src={ab + logo} alt="Trading Expo Africa" />
        </a>
        <nav className={'nav-links' + (menuOpen ? ' mobile-open' : '')} id="navLinks" aria-label="Primary">
          {NAV_LINKS.map(([href, key, label]) => (
            <a
              key={key}
              href={linkBase + href}
              className={key === page ? 'active' : ''}
              aria-current={key === page ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a href={linkBase + "portal.html"} className="nav-portal">Portal</a>
          <a href={linkBase + "tickets.html"} className="btn btn-primary btn-sm nav-cta">Book Tickets</a>
          <button className="theme-toggle" id="themeToggle" aria-label="Toggle light mode" onClick={toggle}>
            <SunIcon /><MoonIcon />
          </button>
          <button
            className={'menu-btn' + (menuOpen ? ' open' : '')}
            id="menuBtn"
            aria-label="Open menu"
            aria-expanded={menuOpen ? 'true' : 'false'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer({ linkBase }) {
  const { theme, toggle } = useTheme();
  const ab = useAssetBase();
  const logo = theme === 'dark' ? 'logo-dark.png' : 'logo-light.png';

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="logo" href={linkBase + "index.html"} aria-label="Trading Expo Africa — home">
              <img className="footer-logo theme-logo" src={ab + logo} alt="Trading Expo Africa" />
            </a>
            <p>Africa's premier online trading, fintech &amp; financial markets exhibition.<br />19–20 February 2027.</p>
          </div>
          <nav className="footer-col" aria-label="Event">
            <h4>Event</h4>
            <a href={linkBase + "index.html"}>Home</a><a href={linkBase + "agenda.html"}>Agenda</a><a href={linkBase + "venue.html"}>Venue</a>
            <a href={linkBase + "gallery.html"}>Gallery</a><a href={linkBase + "awards.html"}>Awards</a><a href={linkBase + "tickets.html"}>Tickets</a>
            <a href={linkBase + "faq.html"}>FAQ</a><a href={linkBase + "blog.html"}>Blog</a>
          </nav>
          <nav className="footer-col" aria-label="Participate">
            <h4>Participate</h4>
            <a href={linkBase + "exhibit.html"}>Exhibit</a><a href={linkBase + "sponsors.html"}>Sponsor</a><a href={linkBase + "contact.html"}>Speak</a>
            <a href={linkBase + "sponsors.html"}>Partners</a><a href={linkBase + "portal.html"}>Exhibitor Portal</a>
          </nav>
          <div className="footer-col">
            <h4>Event Info</h4>
            <p className="footer-meta">19–20 February 2027 · Emperors Palace, Johannesburg<br />TradingExpo.com<br />Organizer: ProFX Media FZ-LLC</p>
            <button className="theme-toggle theme-toggle-footer" id="themeToggleFooter" aria-label="Toggle light mode" onClick={toggle}>
              <SunIcon /><MoonIcon />
              <span id="themeLabel">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2027 Trading Expo Africa. All rights reserved.</span>
          <span>Organizer: ProFX Media FZ-LLC</span>
          <span className="footer-legal">
            <a href={linkBase + "privacy.html"}>Privacy Policy</a>
            <span aria-hidden="true"> · </span>
            <a href={linkBase + "terms.html"}>Terms &amp; Conditions</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* Sticky bottom ticket bar — mobile only (desktop keeps the nav CTA). */
function StickyCta({ linkBase }) {
  return (
    <div className="sticky-cta" role="complementary" aria-label="Book tickets">
      <a href={linkBase + 'tickets.html'} className="btn btn-primary">Book Tickets · 19–20 Feb 2027</a>
    </div>
  );
}

function ScrollProgress() {  useEffect(() => {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
      ticking = false;
      const st = window.scrollY || window.pageYOffset;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(Math.max(st / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    };
  }, []);
  return null;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={'to-top' + (show ? ' show' : '')}
      id="toTop"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}

// anchor offset for the fixed nav (was done via JS scrollMarginTop)
function AnchorOffset() {
  useEffect(() => {
    document.querySelectorAll('section[id], footer[id]').forEach((s) => {
      s.style.scrollMarginTop = '76px';
    });
  }, []);
  return null;
}

export default function Layout({ page, assetBase = 'assets/', linkBase = '', managedPreloader = false, children }) {
  // Every page needs body.loaded for hero animations; the home preloader
  // adds it when it finishes, all other pages add it on mount.
  useEffect(() => {
    if (!managedPreloader) document.body.classList.add('loaded');
  }, [managedPreloader]);
  return (
    <ThemeProvider>
      <AssetBaseProvider base={assetBase}>
        <div id="siteHeader"><Header page={page} linkBase={linkBase} /></div>
        {children}
        <div id="siteFooter"><Footer linkBase={linkBase} /></div>
        <StickyCta linkBase={linkBase} />
        <ScrollProgress />
        <BackToTop />
        <AnchorOffset />
      </AssetBaseProvider>
    </ThemeProvider>
  );
}
