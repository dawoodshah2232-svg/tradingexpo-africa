import React from 'react';
import { Reveal } from '../components/ui.jsx';
import { useAssetBase } from '../lib/theme.jsx';

/* Enquiry form — same mailto flow as the original: opens the visitor's email
   app with the enquiry pre-written to the organiser. */
function onEnquirySubmit(e) {
  e.preventDefault();
  const d = new FormData(e.target);
  const subject = encodeURIComponent('Trading Expo Africa enquiry — ' + d.get('interest'));
  const body = encodeURIComponent(
    'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') +
    '\nInterested in: ' + d.get('interest') +
    '\n\nMessage:\n' + (d.get('message') || '—')
  );
  window.location.href = 'mailto:info@profxmedia.com?subject=' + subject + '&body=' + body;
}

const INTERESTS = [
  'Exhibiting', 'Sponsoring', 'Speaking', 'Group tickets',
  'Media partnership', 'Venue updates', 'Something else',
];

export default function ContactPage() {
  const ab = useAssetBase();
  return (
    <main>
      <section className="page-hero has-img" style={{ '--ph-img': `url('${ab}img/expo-networking.webp')` }}>
        <div className="container">
          <Reveal as="p" className="eyebrow">Contact</Reveal>
          <Reveal as="h1">Talk to the <span className="grad">team.</span></Reveal>
          <Reveal as="p" className="section-lead">Exhibiting, sponsoring, speaking, group tickets or media — we reply within one business day.</Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <Reveal className="contact-card">
                <h3>Email us</h3>
                <p><a href="mailto:info@profxmedia.com">info@profxmedia.com</a><br />
                  <span className="muted">General enquiries, tickets &amp; support</span></p>
              </Reveal>
              <Reveal className="contact-card">
                <h3>Exhibit &amp; sponsor</h3>
                <p><a href="mailto:info@profxmedia.com?subject=Exhibiting%20at%20Trading%20Expo%20Africa">info@profxmedia.com</a><br />
                  <span className="muted">Booths, sponsorships &amp; partnerships</span></p>
              </Reveal>
              <Reveal className="contact-card">
                <h3>Organiser</h3>
                <p>ProFX Media FZ-LLC<br />
                  <span className="muted">TradingExpo.com</span></p>
              </Reveal>
              <Reveal className="contact-card">
                <h3>Event</h3>
                <p>19–20 February 2027<br />
                  <span className="muted">Emperors Palace, Johannesburg, South Africa</span></p>
              </Reveal>
            </div>

            <Reveal className="contact-card">
              <h3>Send an enquiry</h3>
              <p className="muted" style={{ marginBottom: '20px' }}>Fill this in — it opens your email app with everything pre-written to our team.</p>
              <form id="enquiryForm" className="portal-form" onSubmit={onEnquirySubmit}>
                <label>Your name<input name="name" type="text" placeholder="Your name" required autoComplete="name" /></label>
                <label>Your email<input name="email" type="email" placeholder="you@email.com" required autoComplete="email" /></label>
                <label>I&apos;m interested in
                  <select name="interest">
                    {INTERESTS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
                <label>Message<input name="message" type="text" placeholder="Tell us briefly what you need" /></label>
                <button className="btn btn-primary btn-lg btn-block" type="submit">Send Enquiry</button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container narrow center">
          <Reveal as="h2" className="section-title">Prefer to explore <span className="grad">first?</span></Reveal>
          <Reveal style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
            <a href="tickets.html" className="btn btn-primary">Book Tickets</a>
            <a href="exhibit.html" className="btn btn-ghost">Exhibit</a>
            <a href="sponsors.html" className="btn btn-ghost">Sponsor</a>
            <a href="faq.html" className="btn btn-ghost">FAQ</a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
