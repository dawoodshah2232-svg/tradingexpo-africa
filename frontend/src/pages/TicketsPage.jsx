import React from 'react';
import BookingFlow from '../components/BookingFlow.jsx';
import { Reveal, MarketTicker } from '../components/ui.jsx';
import { useAssetBase } from '../lib/theme.jsx';

const OPTIONS = [
  { name: 'Trader Pass', price: 0, priceHtml: 'Free <em>reservation — pay nothing today</em>',
    desc: '2-day exhibition access · booths · demos · networking areas · digital badge' },
  { name: 'Pro Trader Pass', price: 0, tag: 'Most popular', priceHtml: 'Free <em>reservation — pay nothing today</em>',
    desc: 'Everything in Trader, plus full conference access · priority seating · fast-track entry' },
  { name: 'VIP Pass', price: 0, priceHtml: 'Free <em>reservation — pay nothing today</em>',
    desc: 'Everything in Pro, plus VIP lounge · reserved seating · exclusive networking' },
];

const FAQS = [
  ['How do I book a ticket for Trading Expo Africa?', 'Choose your pass — Trader, Pro Trader or VIP — on the tickets page, fill in your name and email, and complete the booking. You will receive a confirmation email with your ticket and a booking reference. You can also re-download your ticket anytime from the ticket holder portal. Reserving now costs nothing — our team confirms pricing with you before any payment.'],
  ['What is the difference between Trader, Pro Trader and VIP passes?', 'The Trader pass gives you full access to the exhibition floor, exhibitor booths and networking areas. Pro Trader adds the two-day conference program, panels and workshops. VIP adds everything in Pro Trader plus the premium lounge, front-row seating, exclusive networking sessions and priority entry. Pick the pass that matches how deep you want to go.'],
  ['How will I receive my ticket after booking?', 'After you complete your booking, your ticket is emailed to you automatically with your booking reference and a downloadable ticket. You can also log in to the ticket holder portal anytime to view, re-download or print your ticket. Keep your booking reference handy — you will need it for entry and support.'],
  ['Can I transfer my ticket to someone else?', 'Yes, tickets can be transferred to another person before the event. Contact the support team or use the ticket holder portal to update the attendee name on your booking. The new attendee will need a valid ID matching the updated name at entry. Transfers are free — just make sure the details are correct.'],
  ['Are group or corporate ticket discounts available?', 'Yes. If you are bringing a team, a trading community or a corporate group, group passes are available at preferential rates. Contact the team through the contact page with your group size, and they will arrange a tailored quote. Group bookings also simplify entry — everyone receives their own ticket under one booking.'],
  ['What is the refund policy for tickets?', 'Tickets are generally non-refundable, except where required by law or stated in the official terms. If the event is rescheduled, your ticket remains valid for the new dates; if it is cancelled, refunds will be processed per the official policy. Check the terms on the tickets page before booking, and contact support with questions.'],
  ['Can I upgrade my ticket pass later?', 'Yes, you can upgrade from Trader to Pro Trader or VIP by paying the price difference, subject to availability. Contact the support team with your booking reference and they will arrange the upgrade. Upgrades are easiest before the event — on-site upgrades depend on remaining capacity, so arrange yours in advance.'],
  ['Do I need to print my ticket?', 'No — a digital ticket on your phone is enough for entry. Your ticket email and the ticket holder portal both let you display or download your ticket. Just make sure your phone is charged and your booking reference is accessible. Printed copies are accepted too, if you prefer a backup.'],
];

export default function TicketsPage() {
  const ab = useAssetBase();
  return (
    <main>
      <section className="page-hero has-img" style={{ '--ph-img': `url('${ab}img/expo-registration.webp')` }}>
        <div className="container">
          <Reveal className="eyebrow">Tickets</Reveal>
          <Reveal as="h1">Book your pass.</Reveal>
          <Reveal className="section-lead">Reserve your pass in under a minute. No payment taken today — our team confirms pricing with you before anything is charged.</Reveal>
        </div>
      </section>

      <MarketTicker />

      <section className="section">
        <div className="container narrow">
          <BookingFlow
            id="ticketBooking" refPrefix="TEA" storeKey="tea_bookings" apiType="ticket"
            options={OPTIONS}
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Reveal className="lucky-strip">
            <div className="lucky-glow" aria-hidden="true"></div>
            <div>
              <strong>Live trading contest — staged by an Official Guinness World Records™ Holder</strong>
              <span>The contest is open to ticket holders — entries open at the expo.</span>
            </div>
          </Reveal>
          <Reveal className="lucky-strip" style={{ marginTop: '16px' }}>
            <div className="lucky-glow" aria-hidden="true"></div>
            <div>
              <strong>Lucky Draw — every ticket is an entry</strong>
              <span>All ticket holders are automatically entered into the Trading Expo lucky draw on Day 2.</span>
            </div>
          </Reveal>
          <Reveal className="group-banner">
            <div>
              <h3>Coming with your community or team?</h3>
              <p>Special group packages for trading communities, colleges &amp; universities, corporate teams, financial academies and affiliate networks.</p>
            </div>
            <a href="contact.html" className="btn btn-ghost">Enquire for Group Tickets</a>
          </Reveal>
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
    </main>
  );
}
