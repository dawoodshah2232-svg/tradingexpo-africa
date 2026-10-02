import React from 'react';
import BookingFlow from '../components/BookingFlow.jsx';
import { Reveal } from '../components/ui.jsx';
import { useLightbox } from '../components/Gallery.jsx';
import { useAssetBase } from '../lib/theme.jsx';

const OPTIONS = [
  { name: 'Standard 3×3m', price: 0, priceHtml: 'Request pricing',
    desc: 'Shell scheme · fascia branding · 2 badges' },
  { name: 'Corner 3×3m', price: 0, priceHtml: 'Request pricing',
    desc: 'Two open sides · higher visibility · 2 badges' },
  { name: 'Premium 6×3m', price: 0, tag: 'Popular', priceHtml: 'Request pricing',
    desc: 'Larger footprint · upgraded branding · 4 badges' },
  { name: 'Custom / Island', price: 0, priceHtml: 'Request pricing',
    desc: 'Your own build · custom layout' },
];

const FAQS = [
  ['How do I exhibit at Trading Expo Africa?', 'Head to the exhibit page and submit a booth reservation with your company details and preferred booth size. The team will confirm pricing, hold your space and share the exhibitor pack. After confirmation you get exhibitor portal access to manage your profile, team badges, branding uploads and readiness checklist.'],
  ['How many exhibitors will be at the expo?', 'The expo floor hosts exhibitors across trading, fintech, brokerage, payments, technology and education. Exhibitors get sustained footfall and face time with serious buyers over two days. Booth space is limited to keep the floor curated — reserving early gives you the best choice of location.'],
  ['What is included with an exhibitor booth?', 'Every booth package includes your floor space, shell scheme or custom-build options, standard furniture, power supply, Wi-Fi, exhibitor badges for your team and a listing in the official exhibitor directory. Premium packages add branding placements, stage mentions and lead-retrieval options. Full inclusions are detailed in the exhibitor pack after you reserve.'],
  ['Can I choose my booth location on the floor?', 'Yes — booth locations are allocated on a first-come, first-served basis, so early reservations get first pick. You can share your preferences — near the entrance, main stage or networking lounge — when you reserve, and the floor team will do its best to match them. A concept floor plan is available on the exhibit page.'],
  ['What does the exhibitor portal let me do?', 'The exhibitor portal is your mission control: update your company profile and directory listing, manage team members and badges, upload logos and branding assets, track your readiness checklist, download key documents and see event announcements. Everything exhibitor-related lives in one dashboard, accessible before and during the event.'],
  ['When should I book my booth?', 'As early as possible. Exhibitor spots are limited and prime locations sell first. Early booking also gives your team more time for booth design, branding uploads, badge registration and pre-event marketing. Talk to the team now to secure your preferred spot.'],
  ['Do exhibitors get conference access too?', 'Exhibitor badges include access to the exhibition floor and networking areas as standard. Conference sessions, workshops and the awards night may be included depending on your package — premium exhibitor and sponsor packages typically include delegate passes. Confirm exactly what your package covers when you reserve your booth.'],
  ['Who do I contact about exhibiting?', 'Use the exhibit page reservation form or reach out through the contact page — select the exhibiting option and the partnerships team will respond within one business day. They will walk you through booth sizes, pricing, sponsorship add-ons and the booking timeline, and keep supporting you through the exhibitor portal until event day.'],
];

const EXHIBIT_FIELDS = (
  <>
    <label>Company name<input required name="company" type="text" placeholder="Company Ltd." /></label>
    <label>Contact person<input required name="name" type="text" placeholder="Your name" autoComplete="name" /></label>
    <label>Work email<input required name="email" type="email" placeholder="you@company.com" autoComplete="email" /></label>
    <label>Phone<input required name="phone" type="tel" placeholder="+91 ..." /></label>
    <label>Website<input name="website" type="url" placeholder="https://" /></label>
    <label>Category
      <select name="category">
        <option>Broker</option><option>Fintech</option><option>Trading Technology</option>
        <option>Prop Firm</option><option>Media / Affiliate</option><option>Education</option><option>Other</option>
      </select>
    </label>
  </>
);

export default function ExhibitPage() {
  const ab = useAssetBase();
  const { open, view } = useLightbox();
  const fpSrc = ab + 'img/floor-plan-concept.webp';
  return (
    <main>
      <section className="page-hero has-img" style={{ '--ph-img': `url('${ab}img/brand-booth.webp')` }}>
        <div className="container">
          <Reveal className="eyebrow">Exhibit</Reveal>
          <Reveal as="h1">Put your brand in front of<br /><span className="grad">Africa's trading community.</span></Reveal>
          <Reveal className="section-lead">Two days of deal-making at Emperors Palace, Johannesburg. Reserve your booth now — no payment taken today.</Reveal>
          <Reveal className="center">
            <a className="btn btn-primary" href="#reserve" style={{ marginLeft: 10 }}>Reserve Your Booth</a>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="eyebrow">Why exhibit</Reveal>
          <Reveal as="h2" className="section-title">The Africa <span className="grad">opportunity.</span></Reveal>
          <div className="why-grid">
            {[
              ['expo-networking.webp', 'African trading professionals', "Meet Africa's traders face-to-face", "Two days of direct conversations with Africa's growing trading community."],
              ['expo-networking.webp', 'Networking at the expo', 'Build your partner network', 'Meet IBs, affiliates, educators, media and strategic partners.'],
              ['expo-main-stage.webp', 'Main stage', 'Own the stage', 'Speaking slots, panels and product launches put your brand centre stage.'],
            ].map(([img, alt, h, p], i) => (
              <Reveal as="article" className="why-card" delay={i * 80} key={h}>
                <img src={ab + 'img/' + img} alt={alt} loading="lazy" />
                <div><h3>{h}</h3><p>{p}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="booths">
        <div className="container">
          <Reveal className="eyebrow">Booth options</Reveal>
          <Reveal as="h2" className="section-title">Choose your <span className="grad">space.</span></Reveal>
          <div className="ticket-grid">
            {[
              ['Standard 3×3m', 'Shell scheme, fascia branding, table, 2 chairs, 2 badges.', false],
              ['Corner 3×3m', 'High-visibility corner position with two open sides.', false],
              ['Premium 6×3m', 'Larger footprint with upgraded branding and 4 badges.', true],
              ['Custom / Island', 'Your own build — pricing and layout on request.', false],
            ].map(([h, p, featured], i) => (
              <Reveal as="article" className={'ticket' + (featured ? ' ticket-featured' : '')} delay={i * 80} key={h}>
                {featured && <span className="flag">Popular</span>}
                <h3>{h}</h3>
                <p className="ticket-desc">{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="fine center">Final pricing confirmed by our team after reservation. <a href="sponsors.html">Sponsorship tiers →</a></Reveal>
        </div>
      </section>

      <section className="section" id="floorplan">
        <div className="container narrow">
          <Reveal className="eyebrow">Floor plan</Reveal>
          <Reveal as="h2" className="section-title">The expo <span className="grad">floor.</span></Reveal>
          <Reveal className="section-lead">Concept layout — exhibition hall, main stage, lounges, registration and food court. Final layout follows venue confirmation.</Reveal>
          <Reveal as="figure" className="banner">
            <img
              src={fpSrc} alt="Concept floor plan blueprint of Trading Expo Africa"
              loading="lazy" id="floorplanImg" style={{ cursor: 'zoom-in' }}
              onClick={() => open([{ src: fpSrc, alt: 'Concept floor plan blueprint of Trading Expo Africa', caption: 'Concept floor plan — Trading Expo Africa' }], 0)}
            />
            <figcaption>Concept floor plan — tap to view full size</figcaption>
          </Reveal>
        </div>
      </section>

      <section className="section section-alt" id="reserve">
        <div className="container narrow">
          <Reveal className="eyebrow">Reserve</Reveal>
          <Reveal as="h2" className="section-title">Reserve your booth.</Reveal>
          <BookingFlow
            id="exhibitBooking" refPrefix="EXB27" storeKey="tea_exhibit" apiType="exhibitor"
            steps={['Booth type', 'Company details', 'Reserved']}
            options={OPTIONS} showQty={false} fields={EXHIBIT_FIELDS}
            submitLabel="Reserve booth" confirmTitle="Booth reserved!"
            formNote="No payment taken now. Our team confirms pricing and holds your space."
            refLabel="Reservation reference"
            portalNoteTitle="Your exhibitor portal login — keep these safe"
            fineEmailPrefix="Our team will contact you with pricing and next steps. A confirmation email will be sent to"
            fineTail="— and you can log in to the" portalLinkText="Exhibitor Portal"
            fineAfter=" anytime to manage your booking."
            newBookingHref="exhibit.html" newBookingLabel="New reservation"
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container narrow center">
          <Reveal as="h2" className="section-title">Manage everything in the <span className="grad">Exhibitor Portal.</span></Reveal>
          <Reveal className="section-lead">Log in with your booking reference to manage tickets, team badges, booth details and brand uploads.</Reveal>
          <a href="portal.html" className="btn btn-primary btn-lg reveal">Open Exhibitor Portal</a>
        </div>
      </section>

      <section className="aeo-faq" aria-label="Frequently asked questions">
        <div className="container">
          <h2 className="aeo-faq-title">Frequently Asked Questions</h2>
          {FAQS.map(([q, a]) => (
            <details className="aeo-faq-item" key={q}>
              <summary className="aeo-faq-q">{q}</summary>
              <p className="aeo-faq-a">{a}</p>
            </details>
          ))}
        </div>
      </section>
      {view}
    </main>
  );
}
