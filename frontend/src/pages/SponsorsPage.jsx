import React from 'react';
import { Reveal } from '../components/ui.jsx';
import { useAssetBase } from '../lib/theme.jsx';
import { faqItems, faqSchema } from '../data/sponsors-faq.js';

const MAIL = 'mailto:info@profxmedia.com?subject=';
const SUBJ = '—%20Trading%20Expo%20Africa';

function EnquireBtn({ tier, className = 'btn btn-ghost btn-sm' }) {
  return <a href={MAIL + tier.replace(/ /g, '%20') + '%20Sponsor%20Enquiry%20' + SUBJ} className={className}>Enquire</a>;
}

const TIERS = [
  { name: 'Title Sponsor', badge: ['avail-badge one', '1 available'], cls: 'tier-card premium-tier tier-flagship', p: 'The name above the door. Maximum visibility across the venue, stage, app and every campaign.', li: ['Full naming rights & logo lockup', 'Prime booth placement', 'Main-stage keynote slot', 'VIP lounge hospitality'], btn: 'btn btn-primary btn-sm', mail: 'Title' },
  { name: 'Platinum', badge: ['avail-badge limited', 'Limited'], cls: 'tier-card premium-tier', p: 'Headline presence with premium branding and headline visibility across the event.', li: ['Premium booth placement', 'Main-stage branding', 'Speaking session', 'Event app feature'], btn: 'btn btn-ghost btn-sm', mail: 'Platinum' },
  { name: 'Gold', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: 'High-impact on-site presence with stage mentions and branding zones.', li: ['Branded zone presence', 'Stage mentions', 'Digital exposure', 'Networking access'], btn: 'btn btn-ghost btn-sm', mail: 'Gold' },
  { name: 'Silver', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: 'Visible, credible presence across key visitor touchpoints.', li: ['Logo across touchpoints', 'Digital directory listing', 'Social mentions', 'Delegate passes'], btn: 'btn btn-ghost btn-sm', mail: 'Silver' },
  { name: 'Bronze', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: "Targeted entry point into Africa's trading community.", li: ['Logo on sponsor wall', 'Website & brochure listing', 'Social mentions', 'Delegate passes'], btn: 'btn btn-ghost btn-sm', mail: 'Bronze' },
];

const ROWS = [
  ['Naming rights & logo on all branding', ['yes', 'no', 'no', 'no', 'no']],
  ['Prime / premium booth placement', ['yes', 'yes', 'yes', 'no', 'no']],
  ['Main-stage branding', ['yes', 'yes', 'yes', 'no', 'no']],
  ['Speaking / keynote slot', ['yes', 'yes', 'no', 'no', 'no']],
  ['VIP lounge hospitality', ['yes', 'yes', 'no', 'no', 'no']],
  ['Event app feature & push', ['yes', 'yes', 'yes', 'no', 'no']],
  ['Social media & PR mentions', ['yes', 'yes', 'yes', 'yes', 'yes']],
  ['Logo on sponsor wall & website', ['yes', 'yes', 'yes', 'yes', 'yes']],
  ['Delegate passes', ['yes', 'yes', 'yes', 'yes', 'yes']],
];

const SPOTS = [
  { icon: '🎗️', name: 'Lanyard Partner', p: "Your logo on every attendee's lanyard — visible in every photo, panel and conversation across both days." },
  { icon: '🎤', name: 'Stage Branding', p: 'Own the main stage backdrop where speakers address the crowd — broadcast in photos and videos everywhere.' },
  { icon: '🧾', name: 'Registration Area', p: 'Brand the first thing visitors see — counters, backdrops and welcome screens at registration.' },
  { icon: '📱', name: 'Mobile App', mail: 'Mobile App Partner', p: 'Splash screen, push notifications and in-app banners on the official event app every attendee uses.' },
  { icon: '📶', name: 'Wi-Fi Sponsor', p: 'Your branded login page and SSID connect thousands of visitors — with your message on every reconnect.' },
  { icon: '🏆', name: 'Gala Dinner', p: 'Presenting rights at the awards gala night — stage time, table branding and a room full of industry leaders.' },
];

export default function SponsorsPage() {
  const ab = useAssetBase();
  return (
    <>
      <main>
        {/* Cinematic hero */}
        <section className="spon-hero">
          <div className="spon-hero-bg" aria-hidden="true"></div>
          <div className="spon-hero-shade" aria-hidden="true"></div>
          <div className="container">
            <Reveal className="eyebrow">Sponsorships · Trading Expo Africa</Reveal>
            <Reveal as="h1">Put your brand at the heart of<br /><span className="grad">Africa's trading movement.</span></Reveal>
            <Reveal className="section-lead">Two days at Emperors Palace, Johannesburg. The stage where Africa's trading industry comes to decide what happens next.</Reveal>
            <Reveal className="spon-hero-ctas">
              <a className="btn btn-light btn-lg" href="contact.html">Talk to the Partnerships Team</a>
              <a className="btn btn-primary btn-lg" href={MAIL + 'Sponsorship%20Enquiry%20' + SUBJ}>Enquire Now</a>
            </Reveal>
            <Reveal className="spon-stats">
              <div className="spon-stat"><strong>TBA</strong><span>Expected visitors</span></div>
              <div className="spon-stat"><strong>TBA</strong><span>Exhibitors</span></div>
              <div className="spon-stat"><strong>TBA</strong><span>Speakers</span></div>
              <div className="spon-stat"><strong>2 days</strong><span>19–20 February 2027</span></div>
            </Reveal>
          </div>
        </section>

        {/* Why sponsor */}
        <section className="section">
          <div className="container">
            <Reveal className="eyebrow">Why sponsor</Reveal>
            <Reveal as="h2" className="section-title">Be seen where <span className="grad">decisions get made.</span></Reveal>
            <div className="split">
              <Reveal>
                <p className="section-lead" style={{ margin: '0 0 16px' }}>Trading Expo Africa gathers Africa\'s trading ecosystem under one roof — brokers, fintech platforms, educators, institutional players and active traders.</p>
                <p className="section-lead" style={{ margin: 0 }}>Sponsors get what money alone can't buy elsewhere: face time with the community that trades every day, on the stage everyone in the industry is watching.</p>
              </Reveal>
              <div className="africa-cards">
                <Reveal className="africa-card"><strong>Reach Africa's trading community</strong><span>Engaged visitors actively interested in forex, crypto, equities and fintech.</span></Reveal>
                <Reveal className="africa-card"><strong>Brand authority at scale</strong><span>Main-stage presence, media coverage and digital exposure before, during and after the event.</span></Reveal>
                <Reveal className="africa-card"><strong>High-value networking</strong><span>Connect with exhibitors, partners and speakers — the relationships that move the industry.</span></Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* Tier cards */}
        <section className="section section-alt">
          <div className="container">
            <Reveal className="eyebrow">Sponsorship tiers</Reveal>
            <Reveal as="h2" className="section-title">Choose your <span className="grad">spotlight.</span></Reveal>
            <Reveal className="section-lead">Five tiers. One shared stage. Every package is designed to put your brand in front of the right people.</Reveal>
            <div className="tier-grid premium">
              {TIERS.map((t, i) => (
                <Reveal as="article" className={t.cls} key={t.name} delay={i * 0.06}>
                  <span className={t.badge[0]}>{t.badge[1]}</span>
                  <h3>{t.name}</h3>
                  <p>{t.p}</p>
                  <ul>{t.li.map((x) => <li key={x}>{x}</li>)}</ul>
                  <EnquireBtn tier={t.mail} className={t.btn} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="section">
          <div className="container">
            <Reveal className="eyebrow">Compare packages</Reveal>
            <Reveal as="h2" className="section-title">What each tier <span className="grad">includes.</span></Reveal>
            <Reveal className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Benefit</th><th>Title</th><th>Platinum</th><th>Gold</th><th>Silver</th><th>Bronze</th></tr></thead>
                <tbody>
                  {ROWS.map(([benefit, cells]) => (
                    <tr key={benefit}>
                      <td>{benefit}</td>
                      {cells.map((c, i) => <td className={c} key={i}>{c === 'yes' ? '✓' : '✕'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
            <Reveal className="compare-note">Exact deliverables are finalised with our partnerships team per tier. Swipe sideways on mobile to compare.</Reveal>
          </div>
        </section>

        {/* Spotlight showcase */}
        <section className="section section-alt">
          <div className="container">
            <Reveal className="eyebrow">Spotlight packages</Reveal>
            <Reveal as="h2" className="section-title">Own a moment, <span className="grad">not just a logo.</span></Reveal>
            <Reveal className="section-lead">Branding packages built around the moments every visitor remembers — from the badge around their neck to the gala dinner stage.</Reveal>
            <div className="spot-grid">
              {SPOTS.map((s, i) => (
                <Reveal as="article" className="spot-card" key={s.name} delay={i * 0.06}>
                  <span className="spot-tag">Available</span>
                  <div className="spot-icon" aria-hidden="true">{s.icon}</div>
                  <h3>{s.name}</h3>
                  <p>{s.p}</p>
                  <a href={MAIL + (s.mail || s.name).replace(/ /g, '%20') + '%20Enquiry%20' + SUBJ} className="btn btn-ghost btn-sm">Enquire</a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Coming soon logo wall */}
        <section className="section">
          <div className="container">
            <Reveal className="eyebrow">Our sponsors</Reveal>
            <Reveal as="h2" className="section-title">Partner <span className="grad">announcements</span> coming soon.</Reveal>
            <Reveal className="section-lead">We're in conversation with leading brokers, fintech brands and trading platforms. Your logo could be here.</Reveal>
            <Reveal className="logo-wall">
              <div className="logo-tile"><span>Your Logo</span><em>Title Sponsor</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Platinum</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Gold</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Gold</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Silver</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Bronze</em></div>
            </Reveal>
          </div>
        </section>

        {/* Media partners */}
        <section className="section section-alt">
          <div className="container">
            <Reveal className="eyebrow">Media partners</Reveal>
            <Reveal as="h2" className="section-title">Amplified by the <span className="grad">media.</span></Reveal>
            <Reveal className="section-lead">Financial media, trading publications and content creators covering the expo to millions.</Reveal>
            <Reveal className="logo-wall">
              <div className="logo-tile"><span>Your Logo</span><em>Media Partner</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Media Partner</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Media Partner</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Community Partner</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Community Partner</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Community Partner</em></div>
            </Reveal>
            <Reveal className="center" style={{ marginTop: '10px' }}>
              <a href={MAIL + 'Media%20Partnership%20Enquiry%20' + SUBJ} className="btn btn-primary btn-lg">Become a Media Partner</a>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section">
          <div className="container narrow center">
            <Reveal as="h2" className="section-title">Ready to own the <span className="grad">spotlight?</span></Reveal>
            <Reveal className="section-lead">Tell us about your goals — our partnerships team will build the right package for your brand.</Reveal>
            <Reveal as="a" href={MAIL + 'Sponsorship%20Enquiry%20' + SUBJ} className="btn btn-primary btn-lg">Start the Conversation</Reveal>
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
    </>
  );
}
