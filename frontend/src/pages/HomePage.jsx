import React from 'react';
import { Reveal, CountUp, Countdown, ParallaxLayer } from '../components/ui.jsx';
import { SpeakerMarquee, SpeakersTeaser, SponsorsWall, MediaPartners } from '../components/Showcase.jsx';
import { useAssetBase } from '../lib/theme.jsx';

const STATS = [
  { end: 2, suffix: '', label: 'Days — 19–20 Feb 2027', icon: 'calendar' },
  { end: 4000, suffix: '+', label: 'Expected traders — Johannesburg 2027', icon: 'people' },
  { end: 18, suffix: '', label: 'Featured ProFX Speakers', icon: 'mic' },
  { text: 'GWR', label: 'World Records™ Title Holder', icon: 'award' },
];

/* Line-style stat icons — 24×24, 2px stroke, brand green, drawn to match the
   topbar phone/mail line icons. Same green reads on light and dark cards. */
const STAT_ICONS = {
  calendar: (<svg viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01" /></svg>),
  people: (<svg viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.3c2.7.4 4.8 2.2 4.8 4.7" /></svg>),
  mic: (<svg viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>),
  award: (<svg viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5" /><path d="M12 7.2l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6L9.7 8.9l1.6-.2z" /><path d="M8.6 13.4 7 21l5-2.6L17 21l-1.6-7.6" /></svg>),
};

const EXP = [
  { img: 'img/profx/profx-21.webp', alt: 'Exhibition floor from above', h: 'Exhibitors', p: 'Brokers, fintech and trading tech — live on the floor.' },
  { img: 'img/profx/profx-07.webp', alt: 'Main stage keynote', h: 'Speakers', p: 'Keynotes, panels and fireside chats across two days.' },
  { img: 'img/profx/profx-19.webp', alt: 'Networking lounge', h: 'Networking', p: "Meet Africa's traders, IBs, affiliates and industry leaders." },
];

const TICKETS = [
  { h: 'Trader Pass', amount: 'Free', was: 'No payment · ticket emailed to you', desc: '2-day exhibition access, booths, demos & networking areas.', featured: false },
  { h: 'Pro Trader Pass', amount: 'Free', was: 'No payment · ticket emailed to you', desc: 'Full 2-day conference access, priority seating & fast-track entry.', featured: true },
  { h: 'VIP Pass', amount: 'Free', was: 'No payment · ticket emailed to you', desc: 'VIP lounge, reserved seating & exclusive networking sessions.', featured: false },
];

const AEO_FAQ = [
  { q: 'When is Traders Expo Johannesburg?', a: 'Traders Expo Johannesburg takes place on 19–20 February 2027 — two full days of exhibitions, conferences and networking. Doors open in the morning and the program runs through the evening on both days, ending with the awards night.' },
  { q: 'Where is Traders Expo Johannesburg held?', a: 'The expo takes place at Emperors Palace, Centre Court, 64 Jones Road, Kempton Park, Johannesburg, South Africa. The venue page carries travel guidance — how to reach the venue, where to stay nearby and what to expect on arrival.' },
  { q: 'What is Traders Expo Johannesburg?', a: "It is Africa's premier exhibition and conference for online trading, fintech and financial markets. Over two days, traders, brokers, investors, fintech companies and educators come together for exhibitions, keynotes, panels, workshops and deal-making — all under one roof." },
  { q: 'Who should attend Traders Expo Johannesburg?', a: 'Retail and professional traders, investors, brokers, IBs, fintech founders, payment providers, educators, analysts and anyone curious about financial markets. Whether you trade forex, crypto, equities or derivatives — or you build products for people who do — the expo is built for you.' },
  { q: 'How much do Traders Expo Johannesburg tickets cost?', a: 'Tickets are free. Reserve your pass on the tickets page with your name, email and mobile number, and your ticket is emailed to you. The Trader pass covers the exhibition floor, Pro Trader adds conference access and workshops, and VIP adds the premium lounge, front-row seating and exclusive networking.' },
  { q: 'Who is organizing Traders Expo Johannesburg?', a: 'The expo is organized by ProFX Media FZ-LLC, an events and media company focused on the trading and fintech industry. The team runs the full program — exhibitions, conferences, sponsorships and the awards night — and supports exhibitors, sponsors and attendees from booking through the event days.' },
  { q: 'How big is Traders Expo Johannesburg?', a: 'It is a two-day expo at Emperors Palace, Johannesburg — a full exhibition floor with brokers and fintech brands, a two-day conference program with featured ProFX speakers, a live trading contest and an awards night.' },
  { q: 'Will there be a live trading contest?', a: 'Yes. A live trading contest runs across both days of Traders Expo Johannesburg — 19–20 February 2027. It is staged by ProFX Media FZ-LLC, an Official Guinness World Records™ Holder for \'Most participants in a trading competition\'. Full contest rules, entry details and prizes will be announced closer to the event.' },
  { q: 'Will there be an awards ceremony at the expo?', a: 'Yes. Traders Expo Johannesburg includes a dedicated awards night celebrating outstanding performers across the trading and fintech ecosystem. Award categories, the nomination process and judging criteria will be announced closer to the event. It is one of the highlights of the two-day program — plan to stay for the evening.' },
];

const AEO_SCHEMA = '{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "When is Traders Expo Johannesburg?", "acceptedAnswer": {"@type": "Answer", "text": "Traders Expo Johannesburg takes place on 19–20 February 2027 — two full days of exhibitions, conferences and networking at Emperors Palace, Johannesburg, South Africa."}}, {"@type": "Question", "name": "Where is Traders Expo Johannesburg held?", "acceptedAnswer": {"@type": "Answer", "text": "The expo takes place at Emperors Palace, Centre Court, 64 Jones Road, Kempton Park, Johannesburg, South Africa."}}, {"@type": "Question", "name": "What is Traders Expo Johannesburg?", "acceptedAnswer": {"@type": "Answer", "text": "It is Africa&#x27;s premier exhibition and conference for online trading, fintech and financial markets — two days of exhibitions, keynotes, panels, workshops and deal-making under one roof."}}, {"@type": "Question", "name": "Who should attend Traders Expo Johannesburg?", "acceptedAnswer": {"@type": "Answer", "text": "Retail and professional traders, investors, brokers, IBs, fintech founders, payment providers, educators, analysts and anyone curious about financial markets."}}, {"@type": "Question", "name": "How much do Traders Expo Johannesburg tickets cost?", "acceptedAnswer": {"@type": "Answer", "text": "Tickets are free. Reserve your pass with your name, email and mobile number, and your ticket is emailed to you."}}, {"@type": "Question", "name": "Who is organizing Traders Expo Johannesburg?", "acceptedAnswer": {"@type": "Answer", "text": "The expo is organized by ProFX Media FZ-LLC, an events and media company focused on the trading and fintech industry."}}, {"@type": "Question", "name": "How big is Traders Expo Johannesburg?", "acceptedAnswer": {"@type": "Answer", "text": "It is a two-day expo at Emperors Palace, Johannesburg, with an exhibition floor, conference program, live trading contest and awards night."}}, {"@type": "Question", "name": "Will there be a live trading contest?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. A live trading contest runs across both days of Traders Expo Johannesburg, 19-20 February 2027, staged by ProFX Media FZ-LLC, an Official Guinness World Records title holder for Most participants in a trading competition. Full contest rules, entry details and prizes will be announced closer to the event."}}, {"@type": "Question", "name": "Will there be an awards ceremony at the expo?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Traders Expo Johannesburg includes a dedicated awards night celebrating outstanding performers across the trading and fintech ecosystem."}}]}';

export default function HomePage() {
  const ab = useAssetBase();
  return (
    <>
      <main>
        {/* ============ HERO ============ */}
        <section className="hero" id="top">
          <ParallaxLayer speed={0.25} className="hero-bg" data-parallax="0.25" aria-hidden="true" />
          <div className="hero-shade" aria-hidden="true"></div>
          <div className="hero-inner">
            <div className="hero-badge" data-hero>
              <span className="pulse-dot"></span>
              19–20 February 2027 &nbsp;·&nbsp; Johannesburg
            </div>
            <h1 className="hero-title">
              <img className="hero-logo" src={ab + 'logo-jhb-dark.png'} alt="Traders Expo Johannesburg — official logo" data-hero />
              <span className="ht-line ht-sub" data-hero><span className="africa-tag">JOHANNESBURG&nbsp;2027</span></span>
            </h1>
            <p className="hero-tagline" data-hero>Africa's Premier Online Trading, Fintech &amp; Financial Markets Exhibition</p>
            <p className="hero-sub" data-hero>Two powerful days where <strong>Traders. Brokers. Technology.</strong> come together — at Emperors Palace, Johannesburg.</p>
            <div className="hero-ctas" data-hero>
              <a href="tickets.html" className="btn btn-primary btn-lg">Reserve Your Free Ticket</a>
              <a href="exhibit.html" className="btn btn-glass btn-lg">Become an Exhibitor</a>
            </div>
            <p className="fine center" data-hero style={{ marginTop: '14px' }}>
              <a href="traders-expo-johannesburg.ics" download style={{ color: '#9aa3ad', textDecoration: 'underline' }}>Add to calendar (.ics)</a>
            </p>
          </div>
          <a className="scroll-cue" href="#experience" aria-label="Scroll down"><span></span></a>
        </section>

        <Countdown />

        <SpeakerMarquee />

        {/* ============ STATS ============ */}
        <section className="stats-band">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((s, i) => (
                <Reveal key={i} className="stat" delay={i * 0.08}>
                  <span className="stat-icon">{STAT_ICONS[s.icon]}</span>
                  {s.text
                    ? <strong className="stat-tba">{s.text}</strong>
                    : <CountUp as="strong" end={s.end} suffix={s.suffix} />}
                  <span>{s.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ EXPERIENCE ============ */}
        <section className="section section-alt" id="experience">
          <div className="container">
            <Reveal as="p" className="eyebrow">The experience</Reveal>
            <Reveal as="h2" className="section-title">What you will <span className="grad">experience.</span></Reveal>
            <div className="exp-grid">
              {EXP.map((c, i) => (
                <Reveal as="article" key={i} className="exp-card" delay={i * 0.08}>
                  <img src={ab + c.img} alt={c.alt} loading="lazy" />
                  <div><h3>{c.h}</h3><p>{c.p}</p></div>
                </Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="agenda.html" className="btn btn-ghost btn-lg">Explore the Agenda</a></Reveal>
          </div>
        </section>
        {/* ============ TRADING CONTEST ============ */}
        <section className="section contest-band" id="contest">
          <div className="container narrow">
            <Reveal className="center"><span className="gwr-badge">Official Guinness World Records&trade; Holder</span></Reveal>
            <Reveal as="h2" className="section-title">The Trading <span className="grad">Contest.</span></Reveal>
            <Reveal as="p" className="section-lead">A live trading contest across both expo days &mdash; 19&ndash;20 February 2027. Real traders compete live on stage while ProFX Media FZ-LLC, the Official Guinness World Records&trade; Holder for &ldquo;Most participants in a trading competition&rdquo;, brings the competition to Africa.</Reveal>
            <Reveal as="figure" className="banner">
              <img src={ab + 'img/profx/profx-02.webp'} alt="Traders competing live in the ProFX League contest arena at ProFX Expo Dubai 2025" loading="lazy" />
              <figcaption>The ProFX League arena &mdash; ProFX Expo Dubai 2025</figcaption>
            </Reveal>
            <Reveal className="center" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tickets.html" className="btn btn-primary btn-lg">Join the contest</a>
              <a href="agenda.html#contest" className="btn btn-glass btn-lg">How it works</a>
            </Reveal>
            <Reveal className="center" style={{ marginTop: '18px' }}>
              <a href="http://www.guinnessworldrecords.com/world-records/774828-most-participants-in-a-trading-competition" target="_blank" rel="noopener" className="fine" style={{ color: 'var(--muted)' }}>Verified on Guinness World Records&trade; &#8599;</a>
            </Reveal>
          </div>
        </section>

        {/* ============ TICKETS TEASER ============ */}
        <section className="section" id="tickets">
          <div className="container">
            <Reveal as="p" className="eyebrow">Tickets</Reveal>
            <Reveal as="h2" className="section-title">Choose your <span className="grad">experience.</span></Reveal>
            <div className="ticket-grid mini">
              {TICKETS.map((t, i) => (
                <Reveal as="article" key={i} className={'ticket' + (t.featured ? ' ticket-featured' : '')} delay={i * 0.08}>
                  {t.featured && <span className="flag">Most Popular</span>}
                  <h3>{t.h}</h3>
                  <div className="price"><span className="amount">{t.amount}</span><span className="per">Reservation</span></div>
                  <p className="ticket-note">{t.was}</p>
                  <p className="ticket-desc">{t.desc}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="tickets.html" className="btn btn-primary btn-lg">Reserve Your Free Ticket</a></Reveal>
          </div>
        </section>
        {/* ============ FROM CAPE TOWN TO JOHANNESBURG ============ */}
        <section className="section" id="journey">
          <div className="container">
            <Reveal as="p" className="eyebrow">From Cape Town to Johannesburg</Reveal>
            <Reveal as="h2" className="section-title">Building on <span className="grad">Cape Town 2026.</span></Reveal>
            <Reveal as="p" className="section-lead">ProFX Expo Africa came to Cape Town on 20–21 August 2026 at CTICC 2, Exhibition Hall 5 — exhibition, conference, sponsor participation, trading-community engagement and industry recognition. Participating companies included GTCFX and Leverage Markets. Johannesburg is the next destination.</Reveal>
            <Reveal className="center"><a href="sponsors.html" className="btn btn-ghost btn-lg">Sponsor Johannesburg 2027</a></Reveal>
          </div>
        </section>

        {/* ============ VENUE TEASER ============ */}
        <section className="section" id="venue">
          <div className="container">
            <Reveal as="p" className="eyebrow">The venue</Reveal>
            <Reveal as="h2" className="section-title">Emperors Palace, <span className="grad">Johannesburg.</span></Reveal>
            <Reveal as="figure" className="banner">
              <img src={ab + 'img/venue/venue-1.webp'} alt="Emperors Palace — Centre Court, Johannesburg" loading="lazy" />
              <figcaption>Centre Court &mdash; 19&ndash;20 February 2027</figcaption>
            </Reveal>
            <Reveal className="center"><a href="venue.html" className="btn btn-ghost btn-lg">Venue &amp; Floor Plan</a></Reveal>
          </div>
        </section>


        {/* ============ BLUEPRINT ============ */}
        <section className="section" id="blueprint" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal className="blueprint">
              <p className="eyebrow center">Event timeline</p>
              <h2 className="section-title center">Four days, <span className="grad">one timeline.</span></h2>
              <p className="bp-sub">Centre Court, 64 Jones Road, Kempton Park, Johannesburg — setup, expo days and breakdown.</p>
              <div className="bp-grid">
                <div className="bp-cell"><span className="bp-date">18 FEB</span><span className="bp-label">Setup day</span></div>
                <div className="bp-cell bp-expo"><span className="bp-date">19–20 FEB</span><span className="bp-label">Expo days</span></div>
                <div className="bp-cell"><span className="bp-date">21 FEB</span><span className="bp-label">Breakdown</span></div>
              </div>
              <div className="center"><a href="venue.html" className="btn btn-glass btn-lg">Explore the Venue</a></div>
            </Reveal>
          </div>
        </section>

        {/* ============ SPEAKERS TEASER ============ */}
        <SpeakersTeaser />

        {/* ============ SPONSORS STRIP ============ */}
        <SponsorsWall />

        {/* ============ MEDIA PARTNERS ============ */}
        <MediaPartners />

        {/* ============ FINAL CTA ============ */}
        <section className="final-cta" id="contact">
          <ParallaxLayer speed={0.15} className="final-bg" data-parallax="0.15" aria-hidden="true" />
          <div className="final-shade" aria-hidden="true"></div>
          <div className="container narrow">
            <Reveal as="p" className="eyebrow light">Final call</Reveal>
            <Reveal as="h2" className="final-title">Africa's trading community.<br /><span className="grad">One destination.</span></Reveal>
            <Reveal className="final-numbers">
              <span><strong>2</strong> days</span><span><strong>18</strong> featured speakers</span><span><strong>4,000+</strong> expected traders</span><span><strong>1</strong> world record</span>
            </Reveal>
            <Reveal as="p" className="final-date">19–20 February 2027 · Emperors Palace, Johannesburg</Reveal>
            <Reveal className="final-actions">
              <a href="tickets.html" className="btn btn-primary btn-lg">Reserve Free Ticket</a>
              <a href="exhibit.html" className="btn btn-glass btn-lg">Exhibit</a>
              <a href="sponsors.html" className="btn btn-glass btn-lg">Sponsor</a>
              <a href="portal.html" className="btn btn-glass btn-lg">Exhibitor Portal</a>
            </Reveal>
            <Reveal as="p" className="final-note">thetradersexpo.com · Organized by ProFX Media FZ-LLC</Reveal>
          </div>
        </section>
      </main>

      {/* ============ AEO QUICK ANSWERS ============ */}
      <section className="aeo-quick-answers" aria-label="Quick answers">
        <div className="container">
          <h2 className="aeo-qa-title">Quick Answers</h2>
          <div className="aeo-qa-grid">
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">When is Traders Expo Johannesburg?</h3>
              <p className="aeo-qa-a">19–20 February 2027 — two full days of exhibitions, conferences and networking in Johannesburg.</p>
            </div>
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">Where is it held?</h3>
              <p className="aeo-qa-a">At Emperors Palace, Johannesburg, South Africa — check the venue page for travel guidance.</p>
            </div>
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">How much are tickets?</h3>
              <p className="aeo-qa-a">Tickets are free. Reserve your pass with your name, email and mobile number, and your ticket is emailed to you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AEO FAQ ============ */}
      <section className="aeo-faq" aria-label="Frequently asked questions">
        <div className="container">
          <h2 className="aeo-faq-title">Frequently Asked Questions</h2>
          {AEO_FAQ.map((f, i) => (
            <details className="aeo-faq-item" key={i}>
              <summary className="aeo-faq-q">{f.q}</summary>
              <p className="aeo-faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: AEO_SCHEMA }} />
    </>
  );
}
