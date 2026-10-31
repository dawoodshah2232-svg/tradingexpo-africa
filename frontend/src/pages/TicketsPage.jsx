import React from 'react';
import BookingFlow from '../components/BookingFlow.jsx';
import { Reveal, MarketTicker } from '../components/ui.jsx';
import { useAssetBase } from '../lib/theme.jsx';

const OPTIONS = [
  { name: 'Trader Pass', price: 0, priceHtml: 'Free',
    desc: '2-day exhibition access · booths · demos · networking areas · digital badge' },
  { name: 'Pro Trader Pass', price: 0, tag: 'Most popular', priceHtml: 'Free',
    desc: 'Everything in Trader, plus full conference access · priority seating · fast-track entry' },
  { name: 'VIP Pass', price: 0, priceHtml: 'Free',
    desc: 'Everything in Pro, plus VIP lounge · reserved seating · exclusive networking' },
];

const FAQS = [
  ['How do I reserve a free ticket for Traders Expo Johannesburg?', 'Choose your pass — Trader, Pro Trader or VIP — on the tickets page, fill in your name, email and mobile number, and reserve. Your ticket is emailed to you with a ticket reference. Entry is free for both days.'],
  ['What is the difference between Trader, Pro Trader and VIP passes?', 'The Trader pass gives you full access to the exhibition floor, exhibitor booths and networking areas. Pro Trader adds the two-day conference program, panels and workshops. VIP adds everything in Pro Trader plus the premium lounge, front-row seating, exclusive networking sessions and priority entry. All three passes are free — pick the one that matches how deep you want to go.'],
  ['How will I receive my ticket after reserving?', 'After you complete your reservation, your ticket is emailed to you automatically with your ticket reference. You can also log in to the ticket holder portal anytime to view or re-download your ticket. Keep your ticket reference handy — you will need it for entry and support.'],
  ['Can I transfer my ticket to someone else?', 'Yes, tickets can be transferred to another person before the event. Contact the support team or use the ticket holder portal to update the attendee name on your reservation. The new attendee will need a valid ID matching the updated name at entry. Transfers are free — just make sure the details are correct.'],
  ['Are group reservations available?', 'Yes. Every ticket is free, so each member of your team, trading community or corporate group simply reserves their own pass. If you are bringing a large group, contact the team through the contact page and they will help coordinate your visit.'],
  ['What is the refund policy for tickets?', 'There is nothing to refund — entry to Traders Expo Johannesburg is free. If the event is rescheduled, your ticket remains valid for the new dates; if it is cancelled, no payment was taken so nothing is owed.'],
  ['Can I upgrade my ticket pass later?', 'Yes, you can upgrade from Trader to Pro Trader or VIP free of charge, subject to availability. Contact the support team with your ticket reference and they will arrange the upgrade. Upgrades are easiest before the event — on-site upgrades depend on remaining capacity, so arrange yours in advance.'],
  ['Do I need to print my ticket?', 'No — a digital ticket on your phone is enough for entry. Your ticket email and the ticket holder portal both let you display or download your ticket. Just make sure your phone is charged and your ticket reference is accessible. Printed copies are accepted too, if you prefer a backup.'],
];

export default function TicketsPage() {
  const ab = useAssetBase();
  return (
    <main>
      <section className="page-hero has-img" style={{ backgroundImage: `url('${ab}img/profx/profx-16.webp')` }}>
        <div className="container">
          <Reveal className="eyebrow">Tickets</Reveal>
          <Reveal as="h1">Reserve your free pass.</Reveal>
          <Reveal className="section-lead">Free entry to both days. Pick your pass, fill in your name, email and mobile number, and your ticket is emailed to you.</Reveal>
        </div>
      </section>

      <MarketTicker />

      <section className="section">
        <div className="container narrow">
          <BookingFlow
            id="ticketBooking" refPrefix="TEA" storeKey="tea_bookings" apiType="ticket"
            options={OPTIONS}
            showQty={false}
            steps={['Choose pass', 'Your details', 'Ticket sent']}
            fields={<>
              <label>Full name<input required name="name" type="text" placeholder="Your name" autoComplete="name" /></label>
              <label>Email<input required name="email" type="email" placeholder="you@email.com" autoComplete="email" /></label>
              <label>Mobile number<input required name="phone" type="tel" placeholder="+27 ..." autoComplete="tel" /></label>
            </>}
            submitLabel="Reserve My Free Ticket"
            formNote="Free entry. Your ticket will be emailed to you right after you reserve."
            confirmTitle="You're in!"
            refLabel="Ticket reference"
            freeLabel="Free"
            portalNoteTitle="Keep your ticket reference safe"
            fineEmailPrefix="Your free ticket will be emailed to"
            fineTail="Your ticket is free and valid for both days — and you can log in to the"
            portalLinkText="portal"
            fineAfter=" anytime to re-download it."
            newBookingHref="tickets.html"
            newBookingLabel="Reserve another ticket"
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <Reveal className="lucky-strip">
            <div className="lucky-glow" aria-hidden="true"></div>
            <div>
              <strong>Live trading contest — staged by an Official Guinness World Records™ Holder</strong>
              <span>A live trading contest runs across both expo days. Full contest rules, entry details and prizes will be announced closer to the event.</span>
            </div>
          </Reveal>
          <Reveal className="group-banner">
            <div>
              <h3>Coming with your community or team?</h3>
              <p>Every ticket is free — each person reserves their own pass, and groups can arrive together. For large groups, trading communities, colleges &amp; universities, corporate teams and affiliate networks, we can help coordinate your visit.</p>
            </div>
            <a href="contact.html" className="btn btn-ghost">Plan a Group Visit</a>
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
