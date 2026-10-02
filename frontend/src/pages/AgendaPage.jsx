import React from 'react';
import { Reveal } from '../components/ui.jsx';
import { AgendaTabs } from '../components/AgendaTabs.jsx';
import { useAssetBase } from '../lib/theme.jsx';
import { faqItems, faqSchema } from '../data/agenda-faq.js';

const DAY1 = [
  { time: '09:00', title: 'Registration & expo opens', text: 'Badges, welcome coffee and the exhibition floor opens.', tag: 'Exhibition' },
  { time: '10:00', title: "Opening keynote: Africa's trading decade", text: "Where Africa's markets are heading — and who is shaping them.", tag: 'Keynote', tagClass: 'key' },
  { time: '11:00', title: 'Panel: Brokers building for Africa', text: 'How leading brokers design products for African traders.', tag: 'Panel' },
  { time: '12:00', title: 'Trading technology showcase', text: 'Live demos: platforms, APIs, algo & automation.', tag: 'Demo' },
  { time: '13:00', title: 'Networking lunch', text: 'Meet exhibitors, speakers and fellow traders.', tag: 'Network' },
  { time: '14:30', title: 'Workshops: Strategy sessions', text: 'Practical trading workshops across three tracks.', tag: 'Workshop' },
  { time: '16:00', title: 'Panel: The future of retail trading', text: 'AI, mobile and the next wave of market participation.', tag: 'Panel' },
  { time: '17:30', title: 'Day 1 networking reception', text: 'Drinks, conversations and deal-making.', tag: 'Network' },
];

const DAY2 = [
  { time: '09:30', title: 'Expo opens — Day 2', text: 'Floor opens; coffee and exhibitor meetings.', tag: 'Exhibition' },
  { time: '10:30', title: 'Keynote: Technology keynote', text: 'The platforms and data shaping modern trading.', tag: 'Keynote', tagClass: 'key' },
  { time: '11:30', title: 'Panel: Regulation & trust', text: 'Building safe, transparent markets for retail traders.', tag: 'Panel' },
  { time: '13:00', title: 'Networking lunch', text: 'Final day meetings and partnership conversations.', tag: 'Network' },
  { time: '14:30', title: 'Live trading contest', text: 'Trade live on stage — staged by ProFX Media FZ-LLC, an Official Guinness World Records™ Holder for \u2018Most participants in a trading competition\u2019.', tag: 'Live' },
  { time: '16:00', title: 'Closing keynote & lucky draw', text: 'Final insights, then the lucky draw for all ticket holders.', tag: 'Finale', tagClass: 'key' },
  { time: '17:30', title: 'Farewell networking', text: 'Closing reception and goodbyes — until next year.', tag: 'Network' },
];

export default function AgendaPage() {
  const ab = useAssetBase();
  return (
    <>
      <main>
        <section className="page-hero has-img" style={{ '--ph-img': `url('${ab}img/conference-panel.webp')` }}>
          <div className="container">
            <Reveal className="eyebrow">Agenda</Reveal>
            <Reveal as="h1">Two days of<br /><span className="grad">what matters.</span></Reveal>
            <Reveal className="section-lead">Indicative agenda — final speakers and timings will be announced as the event approaches.</Reveal>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <AgendaTabs
              days={[
                { id: '1', label: 'Day 1 — 19 February', rows: DAY1 },
                { id: '2', label: 'Day 2 — 20 February', rows: DAY2 },
              ]}
            />
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="grid-3">
              <Reveal className="info-card"><h3>Main Stage</h3><p>Keynotes and headline panels — full conference access with Pro &amp; VIP passes.</p></Reveal>
              <Reveal className="info-card" delay={0.08}><h3>Workshop Tracks</h3><p>Hands-on sessions on strategy, platforms and risk.</p></Reveal>
              <Reveal className="info-card" delay={0.16}><h3>Expo Floor</h3><p>Live demos and meetings with exhibitors throughout both days.</p></Reveal>
              <Reveal className="info-card" delay={0.24}><h3>Live Trading Contest</h3><p>Trade live across both days — run by ProFX Media FZ-LLC, an Official Guinness World Records™ Holder for \u2018Most participants in a trading competition\u2019.</p></Reveal>
            </div>
            <div className="center" style={{ marginTop: '32px' }}>
              <Reveal as="a" href="tickets.html" className="btn btn-primary btn-lg">Get Conference Access</Reveal>
              <Reveal as="a" href="contact.html" className="btn btn-ghost btn-lg" style={{ marginLeft: '10px' }}>Apply to Speak</Reveal>
            </div>
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
