import React from 'react';
import { Reveal } from '../components/ui.jsx';

const SECTIONS = [
  ['Tickets',
    'Ticket reservations made through this site hold your pass selection without taking payment. Our team confirms pricing and payment separately. Tickets are generally non-refundable except where required by law. If the event is rescheduled, tickets remain valid for the new dates; if cancelled, refunds are processed per the official policy communicated at the time.'],
  ['Exhibitors and sponsors',
    'Booth and sponsorship reservations are confirmed by our partnerships team, who will share pricing, the exhibitor pack and payment terms. Participation is subject to the organiser\u2019s approval and the terms in your booking agreement.'],
  ['Conduct',
    'Trading Expo Africa is a professional event. Attendees, exhibitors and speakers are expected to behave respectfully. The organiser may remove anyone whose behaviour disrupts the event or endangers others, without refund. Promotional activity is limited to booked exhibitor and sponsor spaces.'],
  ['Trading contest',
    'The live trading contest runs under its own published rules, including eligibility, scoring and prize terms. Participation is voluntary. Trading involves risk; contest results do not guarantee future performance.'],
  ['Content and media',
    'The event may be photographed and recorded. By attending, you consent to appearing in event photography and recordings used for Trading Expo Africa marketing, unless you inform our team in writing in advance.'],
  ['Liability',
    'The organiser works to deliver the programme as described, but sessions, speakers and timings may change. To the extent permitted by law, the organiser is not liable for indirect or consequential losses arising from attendance or reliance on event content. Nothing here limits liability that cannot legally be limited.'],
  ['Governing terms',
    'These terms are governed by the applicable laws of the event jurisdiction. Questions: info@profxmedia.com.'],
];

export default function TermsPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal className="eyebrow">Legal</Reveal>
          <Reveal as="h1">Terms &amp; <span className="grad">Conditions.</span></Reveal>
          <Reveal className="section-lead">The rules for tickets, exhibiting, and attending Trading Expo Africa — 19–20 February 2027, Emperors Palace, Johannesburg.</Reveal>
        </div>
      </section>
      <section className="section">
        <div className="container narrow">
          <Reveal as="p" className="fine">Last updated: October 2026</Reveal>
          {SECTIONS.map(([h, p], i) => (
            <Reveal key={i} className="legal-block">
              <h2>{h}</h2>
              <p>{p}</p>
            </Reveal>
          ))}
          <Reveal className="center" style={{ marginTop: 32 }}>
            <a href="contact.html" className="btn btn-ghost">Questions? Contact Us</a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
