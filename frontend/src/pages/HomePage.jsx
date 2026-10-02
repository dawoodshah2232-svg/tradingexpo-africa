import React from 'react';
import { Reveal, CountUp, Countdown, MarketTicker, ParallaxImg, ParallaxLayer } from '../components/ui.jsx';
import { GalleryTrack } from '../components/Gallery.jsx';
import { useAssetBase } from '../lib/theme.jsx';

const GALLERY = [
  { img: 'img/expo-grand-hall.webp', alt: 'Grand exhibition hall', top: 'The Grand Hall', bottom: 'Traders and brands under one roof' },
  { img: 'img/expo-main-stage.webp', alt: 'Main stage keynote', top: 'Main Stage', bottom: 'Keynotes that set the agenda' },
  { img: 'img/expo-floor-aerial.webp', alt: 'Exhibition floor aerial view', top: 'The Floor', bottom: 'Brands, live and hands-on' },
  { img: 'img/expo-registration.webp', alt: 'Registration area', top: 'Welcome', bottom: 'Fast-track entry for pass holders' },
  { img: 'img/expo-networking.webp', alt: 'Networking lounge', top: 'The Lounge', bottom: 'Where deals get started' },
  { img: 'img/expo-vip-lounge.webp', alt: 'VIP lounge', top: 'VIP', bottom: 'An experience above it all' },
  { img: 'img/johannesburg-night.webp', alt: 'Johannesburg skyline at sunset with the Hillbrow Tower', top: 'Host City', bottom: 'Johannesburg, South Africa' },
  { img: 'img/brand-lockup.webp', alt: 'Trading Expo official brand identity', top: 'The Identity', bottom: 'Traders · Brokers · Technology' },
];

const STATS = [
  { tba: true, label: 'Expected Visitors' },
  { tba: true, label: 'Exhibitors & Brands' },
  { tba: true, label: 'Industry Speakers' },
  { end: 2, suffix: '', label: 'Powerful Days' },
];

const EXP = [
  { img: 'img/expo-floor-aerial.webp', alt: 'Exhibition floor from above', h: 'Exhibitors', p: 'Brokers, fintech and trading tech — live on the floor.' },
  { img: 'img/expo-main-stage.webp', alt: 'Main stage keynote', h: 'Speakers', p: 'Keynotes, panels and fireside chats across two days.' },
  { img: 'img/expo-networking.webp', alt: 'Networking lounge', h: 'Networking', p: "Meet Africa's traders, IBs, affiliates and industry leaders." },
];

const TICKETS = [
  { h: 'Trader Pass', amount: 'TBA', was: 'Pricing to be announced', desc: '2-day exhibition access, booths, demos & networking areas.', featured: false },
  { h: 'Pro Trader Pass', amount: 'TBA', was: 'Pricing to be announced', desc: 'Full 2-day conference access, priority seating & fast-track entry.', featured: true },
  { h: 'VIP Pass', amount: 'TBA', was: 'Pricing to be announced', desc: 'VIP lounge, reserved seating & exclusive networking sessions.', featured: false },
];

const FAQ_TEASER = [
  { q: 'When is Trading Expo Africa?', a: '19 and 20 February 2027, at Emperors Palace in Johannesburg, South Africa.', open: true },
  { q: 'How much are tickets?', a: 'Ticket pricing is yet to be announced. Check back soon or follow our announcements — early-bird passes will be limited.' },
  { q: 'Can my company exhibit?', a: 'Yes — booths and sponsorships are available to approved companies. Reserve your space on the Exhibit page.' },
  { q: 'Is there an exhibitor portal?', a: 'Yes. After reserving, log in to the Exhibitor Portal with your booking reference to manage tickets, team badges and branding uploads.' },
  { q: 'Are tickets refundable?', a: 'Tickets are generally non-refundable except where required by law or stated in the official terms.' },
];

const AEO_FAQ = [
  { q: 'When is Trading Expo Africa?', a: 'Trading Expo Africa takes place on 19–20 February 2027 — two full days of exhibitions, conferences and networking. Doors open in the morning and the program runs through the evening on both days, ending with the awards night. Mark your calendar early, because early-bird ticket prices are only available for a limited time.' },
  { q: 'Where is Trading Expo Africa held?', a: 'The expo takes place at Emperors Palace, Centre Court, 64 Jones Road, Kempton Park, Johannesburg, South Africa. The venue page carries travel guidance — how to reach the venue, where to stay nearby and what to expect on arrival.' },
  { q: 'What is Trading Expo Africa?', a: "It is Africa's premier exhibition and conference for online trading, fintech and financial markets. Over two days, traders, brokers, investors, fintech companies and educators come together for exhibitions, keynotes, panels, workshops and deal-making — all under one roof." },
  { q: 'Who should attend Trading Expo Africa?', a: 'Retail and professional traders, investors, brokers, IBs, fintech founders, payment providers, educators, analysts and anyone curious about financial markets. Whether you trade forex, crypto, equities or derivatives — or you build products for people who do — the expo is built for you.' },
  { q: 'How much do Trading Expo Africa tickets cost?', a: 'Ticket pricing is yet to be announced. The Trader pass will cover the exhibition floor, Pro Trader adds conference access and workshops, and VIP adds premium lounge access, front-row seating and exclusive networking. Check the tickets page for updates.' },
  { q: 'Who is organizing Trading Expo Africa?', a: 'The expo is organized by ProFX Media FZ-LLC, an events and media company focused on the trading and fintech industry. The team runs the full program — exhibitions, conferences, sponsorships and the awards night — and supports exhibitors, sponsors and attendees from booking through the event days.' },
  { q: 'How big is Trading Expo Africa?', a: 'Visitor, exhibitor and speaker numbers are yet to be announced. Expect a full exhibition floor, a two-day conference program and an awards night, all designed for maximum networking and deal-making.' },
  { q: 'Will there be a live trading contest?', a: 'Yes. A live trading contest runs across both days of Trading Expo Africa — 19–20 February 2027. It is staged by ProFX Media FZ-LLC, an Official Guinness World Records™ Holder for \'Most participants in a trading competition\'. Entries are open to expo attendees; full contest rules, entry details and prizes will be announced closer to the event.' },
  { q: 'Will there be an awards ceremony at the expo?', a: 'Yes. Trading Expo Africa includes a dedicated awards night celebrating outstanding performers across the trading and fintech ecosystem. Award categories, the nomination process and judging criteria will be announced closer to the event. It is one of the highlights of the two-day program — plan to stay for the evening.' },
];

const AEO_SCHEMA = '{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "When is Trading Expo Africa?", "acceptedAnswer": {"@type": "Answer", "text": "Trading Expo Africa takes place on 19–20 February 2027 — two full days of exhibitions, conferences and networking at Emperors Palace, Johannesburg, South Africa."}}, {"@type": "Question", "name": "Where is Trading Expo Africa held?", "acceptedAnswer": {"@type": "Answer", "text": "The expo takes place at Emperors Palace, Centre Court, 64 Jones Road, Kempton Park, Johannesburg, South Africa."}}, {"@type": "Question", "name": "What is Trading Expo Africa?", "acceptedAnswer": {"@type": "Answer", "text": "It is Africa&#x27;s premier exhibition and conference for online trading, fintech and financial markets — two days of exhibitions, keynotes, panels, workshops and deal-making under one roof."}}, {"@type": "Question", "name": "Who should attend Trading Expo Africa?", "acceptedAnswer": {"@type": "Answer", "text": "Retail and professional traders, investors, brokers, IBs, fintech founders, payment providers, educators, analysts and anyone curious about financial markets."}}, {"@type": "Question", "name": "How much do Trading Expo Africa tickets cost?", "acceptedAnswer": {"@type": "Answer", "text": "Ticket pricing is yet to be announced. Check the tickets page for updates."}}, {"@type": "Question", "name": "Who is organizing Trading Expo Africa?", "acceptedAnswer": {"@type": "Answer", "text": "The expo is organized by ProFX Media FZ-LLC, an events and media company focused on the trading and fintech industry."}}, {"@type": "Question", "name": "How big is Trading Expo Africa?", "acceptedAnswer": {"@type": "Answer", "text": "Visitor, exhibitor and speaker numbers are yet to be announced."}}, {"@type": "Question", "name": "Will there be a live trading contest?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. A live trading contest runs across both days of Trading Expo Africa, 19-20 February 2027, staged by ProFX Media FZ-LLC, an Official Guinness World Records title holder for Most participants in a trading competition. Full rules to be announced."}}, {"@type": "Question", "name": "Will there be an awards ceremony at the expo?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Trading Expo Africa includes a dedicated awards night celebrating outstanding performers across the trading and fintech ecosystem."}}]}';

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
              <img className="hero-logo" src={ab + 'logo-dark.png'} alt="Trading Expo — official logo" data-hero />
              <span className="ht-line ht-sub" data-hero><span className="africa-tag">AFRICA&nbsp;2027</span></span>
            </h1>
            <p className="hero-tagline" data-hero>Africa's Premier Online Trading, Fintech &amp; Financial Markets Exhibition</p>
            <p className="hero-sub" data-hero>Two powerful days where <strong>Traders. Brokers. Technology.</strong> come together — at Emperors Palace, Johannesburg.</p>
            <div className="hero-ctas" data-hero>
              <a href="tickets.html" className="btn btn-primary btn-lg">Book Your Ticket</a>
              <a href="exhibit.html" className="btn btn-glass btn-lg">Become an Exhibitor</a>
            </div>
            <Countdown />
          </div>
          <a className="scroll-cue" href="#manifesto" aria-label="Scroll down"><span></span></a>
        </section>

        {/* ============ MARKET TICKER (sample snapshot) ============ */}
        <MarketTicker />

        {/* ============ MARQUEE ============ */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>Traders</span><span>Brokers</span><span>Technology</span><span>Forex</span><span>Crypto</span><span>Fintech</span><span>Stocks</span><span>Derivatives</span><span>AI Trading</span><span>Networking</span>
            <span>Traders</span><span>Brokers</span><span>Technology</span><span>Forex</span><span>Crypto</span><span>Fintech</span><span>Stocks</span><span>Derivatives</span><span>AI Trading</span><span>Networking</span>
          </div>
        </div>

        {/* ============ MANIFESTO ============ */}
        <section className="manifesto" id="manifesto">
          <div className="container narrow">
            <Reveal as="p" className="eyebrow">The gathering</Reveal>
            <Reveal as="p" className="manifesto-text">Africa's trading community is rising — and this is where it meets. Two days of exhibitions, conferences and deal-making at Emperors Palace, Johannesburg.</Reveal>
            <Reveal className="center"><a href="venue.html" className="btn btn-ghost">Why Johannesburg</a></Reveal>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="stats-band">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((s, i) => (
                <Reveal key={i} className="stat" delay={i * 0.08}>
                  {s.tba
                    ? <strong className="stat-tba">TBA</strong>
                    : <CountUp as="strong" end={s.end} suffix={s.suffix} />}
                  <span>{s.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ ABOUT SNAPSHOT ============ */}
        <section className="section" id="about">
          <div className="container">
            <div className="split-head">
              <div>
                <Reveal as="p" className="eyebrow">About the event</Reveal>
                <Reveal as="h2" className="section-title">Where Africa's Traders<br />Meet the <span className="grad">World.</span></Reveal>
              </div>
              <Reveal as="p" className="split-lead">A two-day exhibition and conference connecting Africa's trading community with global brokers, fintech innovators and trading technology.</Reveal>
            </div>
            <Reveal as="figure" className="banner">
              <ParallaxImg src={ab + 'img/expo-grand-hall.webp'} alt="Grand exhibition hall at Trading Expo Africa" loading="lazy" data-parallax-img />
              <figcaption>The exhibition floor — live demos, real conversations</figcaption>
            </Reveal>
            <Reveal className="center"><a href="exhibit.html" className="btn btn-primary btn-lg">Exhibit With Us</a></Reveal>
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
          <div className="container">
            <Reveal className="center"><span className="gwr-badge">Official Guinness World Records™ Holder</span></Reveal>
            <Reveal as="h2" className="section-title">The Trading <span className="grad">Contest.</span></Reveal>
            <Reveal as="p" className="section-lead">A live trading contest across both expo days — 19–20 February 2027. Real traders compete live on stage while ProFX Media FZ-LLC, the Official Guinness World Records™ Holder for "Most participants in a trading competition", brings the competition to Africa.</Reveal>
            <Reveal as="figure" className="banner">
              <img src={ab + 'img/profx/profx-02.webp'} alt="Traders competing live in the ProFX League contest arena at ProFX Expo Dubai 2025" loading="lazy" />
              <figcaption>The ProFX League arena — ProFX Expo Dubai 2025</figcaption>
            </Reveal>
            <Reveal className="africa-cards">
              <div className="africa-card"><strong>Live on stage</strong><span>Real traders, real markets, real-time leaderboards</span></div>
              <div className="africa-card"><strong>Both days</strong><span>Qualifiers and finals across 19–20 February</span></div>
              <div className="africa-card"><strong>Open to attendees</strong><span>Full contest rules and entry details to be announced</span></div>
            </Reveal>
            <Reveal className="center" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tickets.html" className="btn btn-primary btn-lg">Join the contest</a>
              <a href="#contest-rules" className="btn btn-glass btn-lg">How it works</a>
            </Reveal>
            <Reveal className="center" style={{ marginTop: '18px' }}>
              <a href="http://www.guinnessworldrecords.com/world-records/774828-most-participants-in-a-trading-competition" target="_blank" rel="noopener" className="fine" style={{ color: '#9aa3ad' }}>Verified on Guinness World Records™ ↗</a>
            </Reveal>
          </div>
        </section>

        {/* ============ CONTEST RULES TEASER ============ */}
        <section className="section" id="contest-rules">
          <div className="container narrow">
            <Reveal as="p" className="eyebrow">Contest rules</Reveal>
            <Reveal as="h2" className="section-title">How it <span className="grad">works.</span></Reveal>
            <Reveal className="africa-cards">
              <div className="africa-card"><strong>Entries open to attendees</strong><span>Expo ticket holders can enter the live trading contest</span></div>
              <div className="africa-card"><strong>Live leaderboard</strong><span>Follow every trade in real time on the big screens</span></div>
              <div className="africa-card"><strong>Winners crowned on stage</strong><span>Finalists trade live; winners announced at the expo</span></div>
            </Reveal>
            <Reveal as="p" className="fine center">Full contest rules, entry details and prizes to be announced.</Reveal>
          </div>
        </section>

        {/* ============ MORE THAN AN EXPO ============ */}
        <section className="section section-alt" id="activities">
          <div className="container">
            <Reveal as="p" className="eyebrow">Activities</Reveal>
            <Reveal as="h2" className="section-title">More than an <span className="grad">expo.</span></Reveal>
            <Reveal className="africa-cards">
              <div className="africa-card"><strong>Exhibitors</strong><span>Brokers, fintech companies and trading platforms demoing live</span></div>
              <div className="africa-card"><strong>Live trading</strong><span>Watch real strategies play out on real markets</span></div>
              <div className="africa-card"><strong>Meetups</strong><span>Trader meetups and community sessions across both days</span></div>
              <div className="africa-card"><strong>Influencers</strong><span>Meet the educators and creators shaping African trading</span></div>
              <div className="africa-card"><strong>And more</strong><span>Workshops, networking lounges and the awards night</span></div>
            </Reveal>
          </div>
        </section>

        {/* ============ CAPE TOWN STRIP ============ */}
        <section className="section capetown-strip">
          <div className="container">
            <Reveal as="p" className="section-lead center" style={{ margin: 0 }}>Fresh off our Cape Town edition — trading contest champions were crowned. <strong>Johannesburg goes bigger.</strong></Reveal>
            <Reveal className="center" style={{ marginTop: '18px' }}><a href="agenda.html" className="btn btn-ghost btn-lg">See what's coming</a></Reveal>
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
                  <div className="price"><span className="amount">{t.amount}</span><span className="per">Early Bird</span></div>
                  <p className="was">{t.was}</p>
                  <p className="ticket-desc">{t.desc}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="tickets.html" className="btn btn-primary btn-lg">Book Your Ticket</a></Reveal>
            <Reveal className="lucky-strip">
              <div className="lucky-glow" aria-hidden="true"></div>
              <div>
                <strong>Lucky Draw — every ticket is an entry</strong>
                <span>All ticket holders are automatically entered into the lucky draw on Day 2.</span>
              </div>
              <a href="tickets.html" className="btn btn-primary">Enter with a Ticket</a>
            </Reveal>
          </div>
        </section>

        {/* ============ GALLERY PREVIEW ============ */}
        <section className="gallery-sec" id="gallery">
          <div className="container">
            <Reveal as="p" className="eyebrow">Inside the expo</Reveal>
            <Reveal as="h2" className="section-title">A glimpse of the <span className="grad">experience.</span></Reveal>
            <Reveal as="p" className="section-lead">Concept imagery — the world we're building for February 2027.</Reveal>
          </div>
          <GalleryTrack
            items={GALLERY.map((g) => ({ src: ab + g.img, alt: g.alt, top: g.top, bottom: g.bottom }))}
            navClassName="container gallery-nav"
            navExtra={<a href="gallery.html" className="btn btn-ghost" style={{ marginLeft: 12 }}>Open Full Gallery</a>}
          />
        </section>

        {/* ============ JOHANNESBURG SPOTLIGHT ============ */}
        <section className="section" id="johannesburg">
          <div className="container">
            <Reveal as="p" className="eyebrow">Why Johannesburg</Reveal>
            <Reveal as="h2" className="section-title">Africa's financial<br />gateway <span className="grad">city.</span></Reveal>
            <Reveal as="figure" className="banner">
              <ParallaxImg src={ab + 'img/johannesburg-skyline.webp'} alt="Johannesburg skyline — Africa's financial gateway city" loading="lazy" data-parallax-img />
              <figcaption>Johannesburg — Africa's financial gateway city</figcaption>
            </Reveal>
            <Reveal className="africa-cards">
              <div className="africa-card"><strong>Financial hub</strong><span>Johannesburg anchors the continent's deepest capital markets</span></div>
              <div className="africa-card"><strong>High-growth</strong><span>Rapidly expanding retail trading participation</span></div>
              <div className="africa-card"><strong>Connected</strong><span>Direct access to traders across Africa and beyond</span></div>
            </Reveal>
            <Reveal className="center"><a href="venue.html" className="btn btn-ghost btn-lg">Venue &amp; Floor Plan</a></Reveal>
          </div>
        </section>

        {/* ============ SPONSORS STRIP ============ */}
        <section className="section section-alt" id="sponsors">
          <div className="container">
            <Reveal as="p" className="eyebrow">Sponsors &amp; partners</Reveal>
            <Reveal as="h2" className="section-title">Your brand, <span className="grad">centre stage.</span></Reveal>
            <Reveal as="p" className="section-lead">Partner announcements coming soon — reserve your place early.</Reveal>
            <div className="logo-wall" aria-label="Sponsor placeholders">
              {['Title Sponsor', 'Platinum', 'Gold', 'Silver', 'Media Partner', 'Media Partner'].map((tier, i) => (
                <Reveal key={i} className="logo-tile" delay={i * 0.06}><span>Your Logo</span><em>{tier}</em></Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="sponsors.html" className="btn btn-primary btn-lg">Become a Sponsor</a></Reveal>
          </div>
        </section>

        {/* ============ FAQ TEASER ============ */}
        <section className="section" id="faq">
          <div className="container narrow">
            <Reveal as="p" className="eyebrow">FAQ</Reveal>
            <Reveal as="h2" className="section-title">Questions, answered.</Reveal>
            <div className="faq">
              {FAQ_TEASER.map((f, i) => (
                <Reveal as="details" key={i} className="faq-item" open={f.open || undefined}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="center"><a href="faq.html" className="btn btn-ghost">All FAQs</a></Reveal>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="final-cta" id="contact">
          <ParallaxLayer speed={0.15} className="final-bg" data-parallax="0.15" aria-hidden="true" />
          <div className="final-shade" aria-hidden="true"></div>
          <div className="container narrow">
            <Reveal as="p" className="eyebrow light">Final call</Reveal>
            <Reveal as="h2" className="final-title">Africa's trading community.<br /><span className="grad">One destination.</span></Reveal>
            <Reveal className="final-numbers">
              <span><strong>2</strong> days</span><span><strong>TBA</strong> visitors</span><span><strong>TBA</strong> exhibitors</span><span><strong>TBA</strong> speakers</span>
            </Reveal>
            <Reveal as="p" className="final-date">19–20 February 2027 · Emperors Palace, Johannesburg</Reveal>
            <Reveal className="final-actions">
              <a href="tickets.html" className="btn btn-primary btn-lg">Book Tickets</a>
              <a href="exhibit.html" className="btn btn-glass btn-lg">Exhibit</a>
              <a href="sponsors.html" className="btn btn-glass btn-lg">Sponsor</a>
              <a href="portal.html" className="btn btn-glass btn-lg">Exhibitor Portal</a>
            </Reveal>
            <Reveal as="p" className="final-note">TradingExpo.com · Organized by ProFX Media FZ-LLC</Reveal>
          </div>
        </section>
      </main>

      {/* ============ AEO QUICK ANSWERS ============ */}
      <section className="aeo-quick-answers" aria-label="Quick answers">
        <div className="container">
          <h2 className="aeo-qa-title">Quick Answers</h2>
          <div className="aeo-qa-grid">
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">When is Trading Expo Africa?</h3>
              <p className="aeo-qa-a">19–20 February 2027 — two full days of exhibitions, conferences and networking in Johannesburg.</p>
            </div>
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">Where is it held?</h3>
              <p className="aeo-qa-a">At Emperors Palace, Johannesburg, South Africa — check the venue page for travel guidance.</p>
            </div>
            <div className="aeo-qa-card">
              <h3 className="aeo-qa-q">How much are tickets?</h3>
              <p className="aeo-qa-a">Ticket pricing is yet to be announced. Book on the tickets page.</p>
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
