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
  { name: 'Title Sponsor', price: '$30,000', booth: '5 × 3 m · 15 sqm · space only', badge: ['avail-badge one', '1 available'], cls: 'tier-card premium-tier tier-flagship', p: 'The name above the door. Exclusive Title designation with the highest level of branding across exhibition, conference, media and awards.', li: ['10-minute conference presentation', '2 podcast / video interviews', '6 dedicated social promotions', 'Full A4 ad + 2-page editorial', '8 complimentary gala dinner seats'], btn: 'btn btn-primary btn-sm', mail: 'Title' },
  { name: 'Official Sponsor', price: '$20,000', booth: '5 × 3 m · 15 sqm · space only', badge: ['avail-badge limited', 'Limited'], cls: 'tier-card premium-tier', p: 'Premium visibility for established financial brands — prime placement plus conference exposure and interviews.', li: ['8-minute company / product presentation', '1 podcast / video interview', '4 dedicated social promotions', 'Full A4 ad + editorial feature', '6 complimentary gala dinner seats'], btn: 'btn btn-ghost btn-sm', mail: 'Official' },
  { name: 'Exclusive Sponsor', price: '$15,000', booth: '5 × 3 m · 15 sqm · space only', badge: ['avail-badge limited', 'Limited'], cls: 'tier-card premium-tier', p: 'Premium visibility with recognition within one agreed business category, subject to agreement.', li: ['Exclusive category partner recognition', '1 podcast / video interview', '3 dedicated social promotions', 'Half-page ad + editorial profile', '4 complimentary gala dinner seats'], btn: 'btn btn-ghost btn-sm', mail: 'Exclusive' },
  { name: 'Regional Sponsor', price: '$12,000', booth: '5 × 3 m · 15 sqm · space only', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: 'Built for companies developing partnerships and broker networks across African markets.', li: ['20-minute partner networking roundtable', '1 podcast / video interview', '2 dedicated social promotions', 'Half-page ad + company listing', '4 complimentary gala dinner seats'], btn: 'btn btn-ghost btn-sm', mail: 'Regional' },
  { name: 'Diamond Sponsor', price: '$9,000', booth: '4 × 3 m · 12 sqm · space only', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: 'A platform for fintech innovators, trading platforms and financial technology providers.', li: ['15-minute product demonstration', '1 podcast / video interview', '2 dedicated social promotions', 'Quarter-page ad + company listing', '3 complimentary gala dinner seats'], btn: 'btn btn-ghost btn-sm', mail: 'Diamond' },
  { name: 'Elite Sponsor', price: '$8,000', booth: '4 × 3 m · 12 sqm · space only', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: 'Balanced exhibition presence, professional media exposure and industry networking.', li: ['1 podcast / video interview', '1 dedicated social promotion', 'Enhanced directory profile', 'Company mention in ProFX Magazine', '3 complimentary gala dinner seats'], btn: 'btn btn-ghost btn-sm', mail: 'Elite' },
  { name: 'Gold Sponsor', price: '$6,500', booth: '3 × 3 m · 9 sqm · shell scheme + TV', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: 'A professionally constructed, branded booth with two sides open — focus on demos and trader engagement.', li: ['Shell-scheme booth built by ProFX Media', '1 exhibitor podcast / video interview', 'Shared social promotion', 'Magazine company listing', '2 complimentary gala dinner seats'], btn: 'btn btn-ghost btn-sm', mail: 'Gold' },
  { name: 'Silver Sponsor', price: '$4,000', booth: '3 × 2 m · shell scheme · TV not included', badge: ['avail-badge open', 'Available'], cls: 'tier-card premium-tier', p: 'Accessible visibility for emerging financial companies — a ready-built branded booth.', li: ['Shell-scheme booth built by ProFX Media', '1 on-site podcast / video interview', 'Shared social promotion', 'Magazine listing', '1 complimentary gala dinner seat'], btn: 'btn btn-ghost btn-sm', mail: 'Silver' },
];

const ROWS = [
  ['Title Sponsor', '$30,000', '5 × 3 m · 15 sqm', '8'],
  ['Official Sponsor', '$20,000', '5 × 3 m · 15 sqm', '6'],
  ['Exclusive Sponsor', '$15,000', '5 × 3 m · 15 sqm', '4'],
  ['Regional Sponsor', '$12,000', '5 × 3 m · 15 sqm', '4'],
  ['Diamond Sponsor', '$9,000', '4 × 3 m · 12 sqm', '3'],
  ['Elite Sponsor', '$8,000', '4 × 3 m · 12 sqm', '3'],
  ['Gold Sponsor', '$6,500', '3 × 3 m · 9 sqm · shell scheme', '2'],
  ['Silver Sponsor', '$4,000', '3 × 2 m · shell scheme', '1'],
];

const SPOTS = [
  { icon: '🎤', name: 'Speaker Hall Sponsor', price: '$10,000', p: 'Exclusive naming rights to the Speaker Hall, logo on stage branding and conference screens, branded entrance signage and session graphics, moderator acknowledgement, and four reserved conference seats.' },
  { icon: '🚪', name: 'Entrance Arch Sponsor', price: '$5,000', p: 'Prominent branding on the official entrance arch, logo alongside event branding, visibility in entrance photography and video, and one dedicated social media acknowledgement.' },
  { icon: '🤝', name: 'Networking Lounge Sponsor', price: '$5,000', p: 'Exclusive lounge naming association, branding at the lounge entrance and seating areas, logo on approved networking signage, and reserved meeting access for representatives.' },
  { icon: '🧾', name: 'Registration Area Sponsor', price: '$5,000', p: 'Branding on approved registration counters, logo on check-in and queue signage, opportunity to display approved promotional materials, and official Registration Partner identification.' },
  { icon: '☕', name: 'Café / Coffee Bar Sponsor', price: '$5,000', p: 'Exclusive branding on the café or coffee bar, branding on cups or sleeves subject to approval, and recognition as Official Coffee Bar Partner.' },
  { icon: '🥂', name: 'Cocktail Reception Sponsor', price: '$5,000', p: 'Exclusive reception naming association, branding at the designated reception area, logo on approved menu or service materials, and four reception invitations.' },
  { icon: '🖼️', name: 'LED Wall Roll-up', price: '$5,000', p: 'One professionally produced roll-up banner with company artwork, placed in a designated common area for the contracted exhibition period, including installation and removal.' },
  { icon: '📺', name: 'Advertising Banner', price: '$250 each', p: 'One approved 30-second branded advertisement, scheduled within the event advertising rotation on designated LED screens during agreed operating hours.' },
  { icon: '🚩', name: 'Flag Pole Sponsor', price: '$500 each', p: 'One professionally produced company flag on an approved flag pole or display stand along designated visitor pathways, including production, installation and removal.' },
  { icon: '👜', name: 'Attendee Bag Sponsor', price: '$3,000', p: 'Official Attendee Bag Partner — your logo on the official event bags distributed to attendees, with approved promotional inserts.' },
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
            <Reveal className="eyebrow">Sponsorships · Trading Expo Johannesburg</Reveal>
            <Reveal as="h1">Put your brand at the heart of<br /><span className="grad">Africa's trading movement.</span></Reveal>
            <Reveal className="section-lead">Two days at Emperors Palace, Johannesburg. The stage where Africa's trading industry comes to decide what happens next. Packages from $4,000.</Reveal>
            <Reveal className="spon-hero-ctas">
              <a className="btn btn-light btn-lg" href="contact.html">Talk to the Partnerships Team</a>
              <a className="btn btn-primary btn-lg" href={MAIL + 'Sponsorship%20Enquiry%20' + SUBJ}>Enquire Now</a>
            </Reveal>
            <Reveal className="spon-stats">
              <div className="spon-stat"><strong>4,000+</strong><span>Expected traders</span></div>
              <div className="spon-stat"><strong>8</strong><span>Sponsorship tiers</span></div>
              <div className="spon-stat"><strong>10</strong><span>Branding add-ons</span></div>
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
                <p className="section-lead" style={{ margin: '0 0 16px' }}>Trading Expo Johannesburg gathers Africa\'s trading ecosystem under one roof — brokers, fintech platforms, educators, institutional players and active traders.</p>
                <p className="section-lead" style={{ margin: 0 }}>Sponsors get what money alone can't buy elsewhere: face time with the community that trades every day, on the stage everyone in the industry is watching.</p>
              </Reveal>
              <div className="africa-cards">
                <Reveal className="africa-card"><strong>Business visibility</strong><span>Present your company through exhibition space, official sponsor identification and approved promotional materials.</span></Reveal>
                <Reveal className="africa-card"><strong>Direct engagement</strong><span>Meet prospective customers and partners face to face, introduce solutions and answer commercial or technical questions.</span></Reveal>
                <Reveal className="africa-card"><strong>Product awareness</strong><span>Use product demonstrations, presentations and conversations to explain your company's strengths.</span></Reveal>
                <Reveal className="africa-card"><strong>Content opportunities</strong><span>Extend your presence through interviews, event photography, company profiles and package-specific promotion.</span></Reveal>
                <Reveal className="africa-card"><strong>Relationship development</strong><span>Start new conversations, strengthen existing partnerships and arrange follow-up commercial meetings.</span></Reveal>
                <Reveal className="africa-card"><strong>Brand experience</strong><span>Create a professional environment that communicates your company identity and encourages visitor interaction.</span></Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* Tier cards */}
        <section className="section section-alt">
          <div className="container">
            <Reveal className="eyebrow">Sponsorship tiers</Reveal>
            <Reveal as="h2" className="section-title">Choose your <span className="grad">spotlight.</span></Reveal>
            <Reveal className="section-lead">Eight tiers. One shared stage. Every package is designed to put your brand in front of the right people.</Reveal>
            <div className="tier-grid premium">
              {TIERS.map((t, i) => (
                <Reveal as="article" className={t.cls} key={t.name} delay={i * 0.06}>
                  <span className={t.badge[0]}>{t.badge[1]}</span>
                  <h3>{t.name}</h3>
                  <p className="tier-price"><strong>{t.price}</strong> · {t.booth}</p>
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
                <thead><tr><th>Package</th><th>Investment</th><th>Booth</th><th>Gala seats</th></tr></thead>
                <tbody>
                  {ROWS.map(([tier, price, booth, seats]) => (
                    <tr key={tier}>
                      <td>{tier}</td><td>{price}</td><td>{booth}</td><td>{seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
            <Reveal className="compare-note">Customised booths (Title to Elite) are space only — design, construction, branding and dismantling are the sponsor's responsibility. Gold and Silver are organiser-provided branded shell-scheme booths; Silver TV rental is charged separately. Media, magazine and gala benefits vary by package — see each tier above.</Reveal>
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
                  <span className="spot-tag">{s.price}</span>
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
              <div className="logo-tile"><span>Your Logo</span><em>Official Sponsor</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Exclusive Sponsor</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Regional Sponsor</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Diamond Sponsor</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Elite Sponsor</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Gold Sponsor</em></div>
              <div className="logo-tile"><span>Your Logo</span><em>Silver Sponsor</em></div>
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

        {/* How booking works */}
        <section className="section section-alt">
          <div className="container">
            <Reveal className="eyebrow">Booking &amp; participation</Reveal>
            <Reveal as="h2" className="section-title">How booking <span className="grad">works.</span></Reveal>
            <div className="africa-cards">
              <Reveal className="africa-card"><strong>1 · Choose your package</strong><span>Pick the sponsorship tier or branding add-on that matches your objectives.</span></Reveal>
              <Reveal className="africa-card"><strong>2 · Confirm availability</strong><span>Contact the ProFX team to check available positions and technical details.</span></Reveal>
              <Reveal className="africa-card"><strong>3 · Complete the agreement</strong><span>Sign the sponsorship agreement and confirm your booking with payment.</span></Reveal>
              <Reveal className="africa-card"><strong>4 · Send your artwork</strong><span>Provide your logo, company profile, promotional artwork and required information before the deadlines.</span></Reveal>
            </div>
            <Reveal className="center" style={{ marginTop: '10px' }}>
              <a href={MAIL + 'Sponsorship%20Enquiry%20' + SUBJ} className="btn btn-primary btn-lg">Start the Conversation</a>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section">
          <div className="container narrow center">
            <Reveal as="h2" className="section-title">Ready to own the <span className="grad">spotlight?</span></Reveal>
            <Reveal className="section-lead">Tell us about your goals — our partnerships team will build the right package for your brand.</Reveal>
            <Reveal as="a" href={MAIL + 'Sponsorship%20Enquiry%20' + SUBJ} className="btn btn-primary btn-lg">Start the Conversation</Reveal>
            <Reveal className="section-lead" style={{ marginTop: '18px' }}>Media &amp; sponsorship enquiries: <a href="tel:+971588845033">+971 58 884 5033</a> · <a href="mailto:info@profxmedia.com">info@profxmedia.com</a> · <a href="https://www.profxexpo.com" target="_blank" rel="noopener">profxexpo.com</a></Reveal>
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
