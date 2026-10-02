import React from 'react';
import { Reveal } from '../components/ui.jsx';
import { useAssetBase } from '../lib/theme.jsx';
import { asset } from '../lib/content.js';
import { useContentList } from '../components/Showcase.jsx';

export default function SpeakersPage() {
  const ab = useAssetBase();
  const speakers = useContentList('speakers');
  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <Reveal as="p" className="eyebrow">Speakers</Reveal>
          <Reveal as="h1" className="page-title">Learn from <span className="grad">the best.</span></Reveal>
          <Reveal as="p" className="section-lead">Traders, founders and market experts from across the ProFX community. The 2027 Johannesburg lineup will be announced soon — below are featured speakers from previous ProFX events.</Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="speaker-grid">
            {speakers.map((s, i) => (
              <Reveal as="article" className="speaker-card" key={s.id || i} delay={Math.min(i * 0.04, 0.3)}>
                <div className="speaker-photo">
                  {s.photo ? <img src={ab + asset(s.photo).replace(/^assets\//, '')} alt={s.name} loading="lazy" /> : <span className="speaker-initial">{(s.name || '?').charAt(0)}</span>}
                </div>
                <h3>{s.name}</h3>
                <p>{[s.title, s.company].filter(Boolean).join(' · ')}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="center" style={{ marginTop: '48px' }}>
            <a href="tickets.html" className="btn btn-primary btn-lg">Book Your Ticket</a>
          </Reveal>
          <Reveal as="p" className="fine center" style={{ marginTop: '18px' }}>
            Want to speak at Trading Expo Africa 2027? <a href="contact.html" style={{ textDecoration: 'underline' }}>Get in touch</a>.
          </Reveal>
        </div>
      </section>
    </>
  );
}
