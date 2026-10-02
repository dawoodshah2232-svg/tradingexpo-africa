import { useState, useEffect } from 'react';
import { Reveal } from './ui.jsx';
import { getContent, asset } from '../lib/content.js';
import { useAssetBase } from '../lib/theme.jsx';

/* Speakers + sponsors, driven by src/data/content.json (editable from
   Portal → Website Content). Listens for cross-tab draft saves. */

export function useContentList(key) {
  const [items, setItems] = useState(() => getContent()[key] || []);
  useEffect(() => {
    const refresh = () => setItems(getContent()[key] || []);
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [key]);
  return items;
}

export function SpeakersSection() {
  const ab = useAssetBase();
  const speakers = useContentList('speakers');
  if (!speakers.length) return null;
  return (
    <section className="section" id="speakers">
      <div className="container">
        <Reveal as="p" className="eyebrow">Speakers</Reveal>
        <Reveal as="h2" className="section-title">Learn from <span className="grad">the best.</span></Reveal>
        <Reveal as="p" className="section-lead">Traders, founders and market experts from across the ProFX community — live on stage in Johannesburg.</Reveal>
        <div className="speaker-grid">
          {speakers.map((s, i) => (
            <Reveal as="article" className="speaker-card" key={s.id || i} delay={Math.min(i * 0.05, 0.3)}>
              <div className="speaker-photo">
                {s.photo ? <img src={ab + asset(s.photo).replace(/^assets\//, '')} alt={s.name} loading="lazy" /> : <span className="speaker-initial">{(s.name || '?').charAt(0)}</span>}
              </div>
              <h3>{s.name}</h3>
              <p>{[s.title, s.company].filter(Boolean).join(' · ')}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


export function SpeakersTeaser() {
  const ab = useAssetBase();
  const speakers = useContentList('speakers').slice(0, 6);
  if (!speakers.length) return null;
  return (
    <section className="section" id="speakers">
      <div className="container">
        <Reveal as="p" className="eyebrow">Speakers</Reveal>
        <Reveal as="h2" className="section-title">Learn from <span className="grad">the best.</span></Reveal>
        <Reveal as="p" className="section-lead">Traders, founders and market experts from across the ProFX community.</Reveal>
        <div className="speaker-grid">
          {speakers.map((sp, i) => (
            <Reveal as="article" className="speaker-card" key={sp.id || i} delay={Math.min(i * 0.05, 0.3)}>
              <div className="speaker-photo">
                {sp.photo ? <img src={ab + asset(sp.photo).replace(/^assets\//, '')} alt={sp.name} loading="lazy" /> : <span className="speaker-initial">{(sp.name || '?').charAt(0)}</span>}
              </div>
              <h3>{sp.name}</h3>
              <p>{[sp.title, sp.company].filter(Boolean).join(' \u00b7 ')}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="center" style={{ marginTop: '36px' }}><a href="speakers.html" className="btn btn-ghost btn-lg">Meet all speakers</a></Reveal>
      </div>
    </section>
  );
}

const TIER_ORDER = ['Title Sponsor', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Media Partner'];

export function SponsorsWall() {
  const ab = useAssetBase();
  const sponsors = useContentList('sponsors');
  const img = (p) => ab + asset(p).replace(/^assets\//, '');
  return (
    <section className="section section-alt" id="sponsors">
      <div className="container">
        <Reveal as="p" className="eyebrow">Sponsors &amp; partners</Reveal>
        <Reveal as="h2" className="section-title">Your brand, <span className="grad">centre stage.</span></Reveal>
        {sponsors.length ? (
          <>
            <Reveal as="p" className="section-lead">Proudly backed by the brands powering the trading world.</Reveal>
            <div className="logo-wall">
              {[...sponsors]
                .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))
                .map((s, i) => (
                  <Reveal key={s.id || i} className={'logo-tile real' + (s.tier === 'Title Sponsor' ? ' tier-title' : '')} delay={Math.min(i * 0.04, 0.3)}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener sponsored" aria-label={s.brand}><img src={img(s.logo)} alt={s.brand + ' logo'} loading="lazy" /></a>
                    ) : (
                      <img src={img(s.logo)} alt={s.brand + ' logo'} loading="lazy" />
                    )}
                    <em>{s.tier}</em>
                  </Reveal>
                ))}
            </div>
          </>
        ) : (
          <>
            <Reveal as="p" className="section-lead">Partner announcements coming soon — reserve your place early.</Reveal>
            <div className="logo-wall" aria-label="Sponsor placeholders">
              {['Title Sponsor', 'Platinum', 'Gold', 'Silver', 'Media Partner', 'Media Partner'].map((tier, i) => (
                <Reveal key={i} className="logo-tile" delay={i * 0.06}><span>Your Logo</span><em>{tier}</em></Reveal>
              ))}
            </div>
          </>
        )}
        <Reveal className="center"><a href="sponsors.html" className="btn btn-primary btn-lg">Become a Sponsor</a></Reveal>
      </div>
    </section>
  );
}
