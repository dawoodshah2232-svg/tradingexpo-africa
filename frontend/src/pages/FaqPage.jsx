import React, { useRef } from 'react';
import { Reveal } from '../components/ui.jsx';
import { useAssetBase } from '../lib/theme.jsx';

/* FAQ accordion with exact original DOM (<details class="faq-item"> with <p>
   directly inside) + the original one-open-at-a-time behaviour. */
function FaqGroup({ items }) {
  const detailsRefs = useRef([]);
  const onSummaryClick = (idx) => () => {
    detailsRefs.current.forEach((d, i) => {
      if (d && i !== idx && d.open) d.open = false;
    });
  };
  return (
    <div className="faq">
      {items.map((it, i) => (
        <Reveal
          as="details"
          key={i}
          className="faq-item"
          open={it.open || undefined}
          ref={(el) => { detailsRefs.current[i] = el; }}
        >
          <summary onClick={onSummaryClick(i)}>{it.q}</summary>
          <p>{it.a}</p>
        </Reveal>
      ))}
    </div>
  );
}

const GENERAL = [
  {
    q: 'When and where is Trading Expo Africa?',
    a: <>19–20 February 2027, at Emperors Palace, Johannesburg, South Africa. <a href="venue.html">See the venue →</a>.</>,
    open: true,
  },
  {
    q: 'Who organises the event?',
    a: 'Trading Expo Africa is organised by ProFX Media FZ-LLC.',
  },
  {
    q: 'Who should attend?',
    a: 'Retail and professional traders, investors, brokers, fintech companies, IBs, affiliates, educators, media and anyone interested in financial markets.',
  },
];

const TICKETS = [
  {
    q: 'How much are tickets?',
    a: <>Ticket pricing is yet to be announced. <a href="tickets.html">Reserve your pass →</a></>,
  },
  {
    q: "What's the difference between the passes?",
    a: 'Trader covers the 2-day exhibition. Pro Trader adds full conference access, priority seating and fast-track entry. VIP adds the VIP lounge, reserved seating and exclusive networking.',
  },
  {
    q: 'How do I receive my ticket?',
    a: <>Your ticket is emailed to you automatically after booking, and you can download or print it anytime from the <a href="portal.html">portal</a> using your booking reference and password.</>,
  },
  {
    q: 'Are tickets refundable?',
    a: 'Tickets are generally non-refundable except where required by law or stated in the official terms. If the event is cancelled, ticket holders will be refunded.',
  },
  {
    q: 'Is there a lucky draw?',
    a: 'Yes — every ticket is automatically entered into the Trading Expo lucky draw held on Day 2 (24 April).',
  },
  {
    q: 'Do you offer group tickets?',
    a: <>Yes — special packages for trading communities, colleges, corporate teams and affiliate networks. <a href="contact.html">Enquire here →</a></>,
  },
];

const EXHIBITORS = [
  {
    q: 'How do I book a booth?',
    a: <>Choose your booth type on the <a href="exhibit.html">Exhibit page</a> and reserve — no payment is taken at reservation. Our team confirms pricing and holds your space.</>,
  },
  {
    q: 'What booth sizes are available?',
    a: <>Standard 3×3m, Corner 3×3m, Premium 6×3m and Custom/Island builds. <a href="exhibit.html#booths">See options →</a></>,
  },
  {
    q: 'What sponsorship tiers exist?',
    a: <>Title, Presenting, Platinum, Gold, Silver and 10 specialty packages (Registration, Main Stage, Lounges, Lanyard, Badge, App, Wi-Fi, Trading Challenge, Media Wall). <a href="sponsors.html">See tiers →</a></>,
  },
  {
    q: 'How does the exhibitor portal work?',
    a: <>After reserving, log in at the <a href="portal.html">portal</a> with your booking reference and password (shown at booking and emailed to you). Manage your company profile, booth requirements, team badges, brand uploads and checklist.</>,
  },
];

const VENUE = [
  {
    q: 'Where exactly is the venue?',
    a: <>The venue city will be announced soon. <a href="venue.html">See the venue page →</a></>,
  },
  {
    q: 'Will there be partner hotels?',
    a: 'Yes — partner hotel rates and booking links will be published with the venue announcement.',
  },
  {
    q: "I'm travelling from outside Africa — do I need a visa?",
    a: "International visitors should check Africa's e-Visa requirements well in advance of travel.",
  },
];

const PAYMENTS = [
  {
    q: 'When do I pay for my booking?',
    a: 'No payment is taken when you reserve. Our team emails your payment link — your early-bird price is locked for 48 hours.',
  },
  {
    q: 'Which payment methods are accepted?',
    a: 'Payment options will be confirmed on your payment link (cards and bank transfer).',
  },
];

export default function FaqPage() {
  const ab = useAssetBase();
  return (
    <main>
      <section className="page-hero has-img" style={{ '--ph-img': `url('${ab}img/trading-tech.webp')` }}>
        <div className="container">
          <Reveal as="p" className="eyebrow">FAQ</Reveal>
          <Reveal as="h1">Questions,<br /><span className="grad">answered.</span></Reveal>
          <Reveal as="p" className="section-lead">Still stuck? <a href="contact.html" style={{ color: 'var(--logo-green)', fontWeight: 700 }}>Contact the team →</a></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <Reveal as="p" className="eyebrow">General</Reveal>
          <FaqGroup items={GENERAL} />

          <Reveal as="p" className="eyebrow" style={{ marginTop: '56px' }}>Tickets</Reveal>
          <FaqGroup items={TICKETS} />

          <Reveal as="p" className="eyebrow" style={{ marginTop: '56px' }}>Exhibitors &amp; sponsors</Reveal>
          <FaqGroup items={EXHIBITORS} />

          <Reveal as="p" className="eyebrow" style={{ marginTop: '56px' }}>Venue &amp; travel</Reveal>
          <FaqGroup items={VENUE} />

          <Reveal as="p" className="eyebrow" style={{ marginTop: '56px' }}>Payments</Reveal>
          <FaqGroup items={PAYMENTS} />
        </div>
      </section>
    </main>
  );
}
