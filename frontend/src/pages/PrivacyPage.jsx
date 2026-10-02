import React from 'react';
import { Reveal } from '../components/ui.jsx';

const SECTIONS = [
  ['What we collect',
    'When you book a ticket, reserve a booth, or send an enquiry, we collect the details you provide: name, email address, phone number, city, and — for exhibitors — company details. The ticket-holder and exhibitor portals store your booking references so you can manage your participation.'],
  ['How we use it',
    'We use your details to process bookings and reservations, send tickets and confirmations, share event updates you asked for, and operate the portals. We do not sell your personal data. With your consent, we may share relevant exhibitor or sponsor communications related to the event.'],
  ['Cookies and local storage',
    'The site remembers your theme preference and portal sessions in your browser\u2019s local storage. We do not use third-party advertising trackers. Basic, anonymised analytics may be used to improve the site.'],
  ['Data retention',
    'Booking and enquiry records are kept for as long as needed to run the event and meet legal obligations, then removed or anonymised. You can ask us to delete your data at any time.'],
  ['Your rights',
    'You can request a copy of the data we hold about you, ask us to correct it, or ask us to delete it. Contact info@profxmedia.com and we will respond within a reasonable time.'],
  ['Security',
    'We take reasonable technical and organisational measures to protect your information. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.'],
  ['Children',
    'The event and this site are intended for adults. We do not knowingly collect data from children.'],
  ['Changes',
    'We may update this policy as the event approaches. Material changes will be highlighted on this page.'],
];

export default function PrivacyPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <Reveal className="eyebrow">Legal</Reveal>
          <Reveal as="h1">Privacy <span className="grad">Policy.</span></Reveal>
          <Reveal className="section-lead">How Trading Expo Africa collects, uses and protects your information. Organised by ProFX Media FZ-LLC.</Reveal>
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
            <a href="contact.html" className="btn btn-ghost">Contact Us About Privacy</a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
