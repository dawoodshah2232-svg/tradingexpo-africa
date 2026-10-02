import React from 'react';
import { Reveal, ParallaxImg } from '../components/ui.jsx';
import { useLightbox } from '../components/Gallery.jsx';
import { useAssetBase } from '../lib/theme.jsx';
import { faqItems, faqSchema } from '../data/venue-faq.js';

export default function VenuePage() {
  const ab = useAssetBase();
  const { open, view } = useLightbox();
  const floorplanSrc = ab + 'img/floor-plan-concept.webp';

  return (
    <>
      <main>
        <section className="page-hero has-img" style={{ '--ph-img': `url('${ab}img/emperors-palace-entrance.webp')` }}>
          <div className="container">
            <Reveal className="eyebrow">Venue</Reveal>
            <Reveal as="h1">Emperors Palace.<br /><span className="grad">Johannesburg.</span></Reveal>
            <Reveal className="section-lead">19–20 February 2027 · Centre Court, Emperors Palace, 64 Jones Road, Kempton Park, Johannesburg, 1620, South Africa.</Reveal>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <Reveal className="venue-tba">
              <div className="venue-tba-inner">
                <p className="eyebrow light">The venue</p>
                <h2>Emperors Palace</h2>
                <p>Centre Court, 64 Jones Road, Kempton Park, Johannesburg, 1620, South Africa — next to O.R. Tambo International Airport, with Gautrain rapid-rail and shuttle access. Two days of exhibitions, conferences and networking in one of Africa's premier event destinations.</p>
                <div className="final-numbers">
                  <span><strong>2,698 m²</strong> Centre Court</span><span><strong>29</strong> conferencing venues</span><span><strong>4</strong> on-site hotels</span><span><strong>3,000</strong> cinema capacity</span>
                </div>
                <div className="center" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="tickets.html" className="btn btn-primary">Book Your Ticket</a>
                  <a href="https://emperorspalace.com/" target="_blank" rel="noopener" className="btn btn-glass">Visit the venue website</a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container narrow">
            <Reveal className="eyebrow">Find us</Reveal>
            <Reveal as="h2" className="section-title">Getting <span className="grad">there.</span></Reveal>
            <Reveal as="figure" className="banner">
              <iframe title="Emperors Palace map" src="https://www.google.com/maps?q=Emperors+Palace,+64+Jones+Road,+Kempton+Park,+Johannesburg&output=embed" loading="lazy" style={{ border: 0, width: '100%', height: '380px', borderRadius: '12px' }} allowFullScreen referrerPolicy="no-referrer-when-downgrade"></iframe>
              <figcaption>Emperors Palace, 64 Jones Road, Kempton Park, Johannesburg — next to O.R. Tambo International Airport</figcaption>
            </Reveal>
            <Reveal className="center">
              <a href="https://www.google.com/maps/dir/?api=1&destination=Emperors+Palace,+64+Jones+Road,+Kempton+Park,+Johannesburg" target="_blank" rel="noopener" className="btn btn-ghost">Get directions</a>
            </Reveal>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container narrow">
            <Reveal className="eyebrow">Why Johannesburg</Reveal>
            <Reveal as="h2" className="section-title">A market on the <span className="grad">move.</span></Reveal>
            <Reveal as="figure" className="banner">
              <ParallaxImg src={ab + 'img/johannesburg-skyline.webp'} alt="Johannesburg skyline, South Africa" loading="lazy" />
              <figcaption>Johannesburg — one of the world's most dynamic trading markets</figcaption>
            </Reveal>
            <Reveal className="africa-cards">
              <div className="africa-card"><strong>Financial hub</strong><span>Home to the continent's deepest capital markets</span></div>
              <div className="africa-card"><strong>High-growth</strong><span>Rapidly expanding retail trading participation</span></div>
              <div className="africa-card"><strong>Fintech-ready</strong><span>Deep digital-payments &amp; platform adoption</span></div>
              <div className="africa-card"><strong>Global gateway</strong><span>Connected to world markets &amp; capital flows</span></div>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <Reveal className="eyebrow">Floor plan</Reveal>
            <Reveal as="h2" className="section-title">Explore the <span className="grad">layout.</span></Reveal>
            <Reveal className="section-lead">Concept layout — exhibition hall, main stage, lounges, registration and food court.</Reveal>
            <Reveal as="figure" className="banner">
              <img
                src={floorplanSrc}
                alt="Concept floor plan blueprint"
                loading="lazy"
                id="floorplanImg"
                style={{ cursor: 'zoom-in' }}
                onClick={() => open([{ src: floorplanSrc, alt: 'Concept floor plan blueprint', caption: 'Concept floor plan — tap to view full size' }], 0)}
              />
              <figcaption>Concept floor plan — tap to view full size</figcaption>
            </Reveal>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <Reveal className="eyebrow">Plan your visit</Reveal>
            <Reveal as="h2" className="section-title">Travel &amp; stay.</Reveal>
            <Reveal className="section-lead">Everything you need for a smooth trip to Emperors Palace, Johannesburg.</Reveal>
            <div className="travel-grid">
              <Reveal as="article" className="travel-card">
                <span className="travel-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5c1.5 1.5 2.5 3.6 2.5 5.9 0 0-.4 3.4-4.2 5.8z" /><path d="M12 12.5 4.2 9.6c-1-2 0-3.4 1-3.9s3.4 0 4.8 1L14.4 11 12 12.5z" /><path d="M12 12.5 9.5 18.6c-.4 1.4.6 2.4 1.6 2.4s2-1 1.6-2.4l-.7-2.1z" /><circle cx="12" cy="12.5" r="1.2" fill="currentColor" stroke="none" /></svg></span>
                <h3>Fly in</h3>
                <p>O.R. Tambo International Airport serves Johannesburg with direct connections from cities worldwide, minutes from Emperors Palace.</p>
              </Reveal>
              <Reveal as="article" className="travel-card" delay={0.08}>
                <span className="travel-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 11h14" /><path d="M8 21l1.5-4M16 21l-1.5-4" /><circle cx="9" cy="14.5" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="14.5" r="1" fill="currentColor" stroke="none" /></svg></span>
                <h3>Rail connections</h3>
                <p>The Gautrain rapid rail links the airport, Johannesburg and Pretoria — fast and comfortable for regional travellers.</p>
              </Reveal>
              <Reveal as="article" className="travel-card" delay={0.16}>
                <span className="travel-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V10l9-6 9 6v11" /><path d="M9 21v-6h6v6" /><path d="M3 21h18" /><path d="M12 4v3" /></svg></span>
                <h3>Where to stay</h3>
                <p>Emperors Palace offers on-site hotels, with more options across Kempton Park and Johannesburg. Partner hotel rates will be published closer to the event.</p>
              </Reveal>
              <Reveal as="article" className="travel-card" delay={0.24}>
                <span className="travel-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" /><rect x="3" y="13" width="18" height="6" rx="2" /><circle cx="7.5" cy="19" r="1.6" /><circle cx="16.5" cy="19" r="1.6" /></svg></span>
                <h3>Getting around</h3>
                <p>Ride-hailing, hotel shuttles and the Gautrain make local travel simple. A full visitor guide will be shared with all ticket holders.</p>
              </Reveal>
            </div>
            <Reveal className="fine" style={{ marginTop: '26px', textAlign: 'center' }}>International visitors: check South Africa's visa requirements well in advance of travel.</Reveal>
            <div className="center" style={{ marginTop: '32px' }}>
              <Reveal as="a" href="tickets.html" className="btn btn-primary btn-lg">Book Your Ticket</Reveal>
              <Reveal as="a" href="faq.html" className="btn btn-ghost btn-lg" style={{ marginLeft: '10px' }}>Visitor FAQs</Reveal>
            </div>
          </div>
        </section>
      </main>

      <section className="aeo-faq" aria-label="Frequently asked questions">
        <div className="container">
          <h2 className="aeo-faq-title">Frequently Asked Questions</h2>
          {faqItems.map((it, i) => (
            <details className="aeo-faq-item" key={i}>
              <summary className="aeo-faq-q">{it.q}</summary>
              <p className="aeo-faq-a" dangerouslySetInnerHTML={{ __html: it.a }} />
            </details>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

      {view}
    </>
  );
}
