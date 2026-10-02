import React, { useRef } from 'react';
import { Reveal } from '../components/ui.jsx';

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

const NOMINATE_MAILTO = 'mailto:info@profxmedia.com?subject=Awards%20Nomination%20—%20Trading%20Expo%20Africa%20Awards';
const GALA_MAILTO = 'mailto:info@profxmedia.com?subject=Gala%20Night%20Tickets%20—%20Trading%20Expo%20Africa%20Awards';

const CATEGORIES = [
  { num: 'Category 01', title: 'Best Forex Broker — Africa', text: 'For the broker delivering the best overall experience to African forex traders — pricing, execution, support and trust.' },
  { num: 'Category 02', title: 'Best Crypto Exchange', text: 'For the exchange leading Africa in crypto trading — security, liquidity, product depth and user experience.' },
  { num: 'Category 03', title: 'Best Trading Platform', text: 'For the platform traders love to use — technology, charting, speed, reliability and mobile experience.' },
  { num: 'Category 04', title: 'Best Fintech Innovation', text: 'For the product or service bringing genuine innovation to trading and investing in Africa.' },
  { num: 'Category 05', title: 'Best Trading Educator', text: 'For the educator or academy making the biggest positive impact on trader knowledge and outcomes in Africa.' },
  { num: 'Category 06', title: 'Rising Star Broker of the Year', text: 'For the newcomer broker making the fastest, strongest impact on the African trading market.' },
];

const CRITERIA = [
  { n: '1', title: 'Innovation', text: 'Original products, features or approaches that move trading in Africa forward.' },
  { n: '2', title: 'Client experience', text: 'Quality of service, support, education and trust delivered to African traders.' },
  { n: '3', title: 'Market impact', text: "Measurable contribution to the growth and maturity of Africa's trading industry." },
  { n: '4', title: 'Community contribution', text: 'Investment in the trading community — education, transparency and responsible practices.' },
];

const FAQS = [
  {
    q: 'When are the Trading Expo Africa Awards held?',
    a: 'The awards gala night takes place on the evening of Day 1 — 19 February 2027 — at Emperors Palace, Johannesburg, alongside Trading Expo Africa.',
  },
  {
    q: 'How can my company be nominated?',
    a: <>Nominations are opening soon. When nominations open, companies can submit entries online for the categories they qualify for. To be notified the moment they open, email <a href={NOMINATE_MAILTO}>info@profxmedia.com</a> with the subject &quot;Awards Nomination&quot;.</>,
  },
  {
    q: 'Is there a fee to nominate or attend the awards?',
    a: 'Entry fees and gala ticket details will be published when nominations open. Expo sponsors and exhibitors receive priority access to gala night tickets.',
  },
  {
    q: 'How are the award winners decided?',
    a: "Winners are chosen by an independent judging panel against published criteria: innovation, client experience, market impact and contribution to Africa's trading community.",
  },
  {
    q: 'Can international companies win?',
    a: 'Yes — categories recognise companies serving African traders and investors, whether headquartered in Africa or internationally, as long as they meet the category criteria.',
  },
];

export default function AwardsPage() {
  return (
    <main>
      {/* Cinematic hero */}
      <section className="award-hero">
        <div className="award-hero-bg" aria-hidden="true"></div>
        <div className="award-hero-shade" aria-hidden="true"></div>
        <div className="container">
          <Reveal className="trophy" aria-hidden="true">🏆</Reveal>
          <Reveal as="p" className="eyebrow">Awards · Trading Expo Africa</Reveal>
          <Reveal as="h1">The night Africa&apos;s trading<br /><span className="grad">industry takes the stage.</span></Reveal>
          <Reveal as="p" className="section-lead">The Trading Expo Africa Awards celebrate the brokers, platforms, innovators and educators raising the bar for millions of African traders.</Reveal>
          <Reveal className="spon-hero-ctas">
            <a className="btn btn-primary btn-lg" href={NOMINATE_MAILTO}>Register Interest to Nominate</a>
            <a className="btn btn-light btn-lg" href="#categories">View Categories</a>
          </Reveal>
        </div>
      </section>

      {/* About the awards */}
      <section className="section">
        <div className="container">
          <Reveal as="p" className="eyebrow">About the awards</Reveal>
          <Reveal as="h2" className="section-title">Recognising the best of <span className="grad">African trading.</span></Reveal>
          <div className="split">
            <Reveal>
              <p className="section-lead" style={{ margin: '0 0 16px' }}>Africa&apos;s trading community is exploding — millions of new traders entering forex, crypto, equities and derivatives every year. The Trading Expo Africa Awards exist to honour the companies and people building that future.</p>
              <p className="section-lead" style={{ margin: 0 }}>An independent panel of industry experts judges every entry against published criteria. No pay-to-win, no popularity contest — just excellence, recognised.</p>
            </Reveal>
            <div className="africa-cards">
              <Reveal className="africa-card"><strong>Independent judging</strong><span>A panel of industry experts scores every entry against transparent, published criteria.</span></Reveal>
              <Reveal className="africa-card"><strong>Industry-wide recognition</strong><span>Winners announced live on stage at the gala night, in front of the industry&apos;s leaders.</span></Reveal>
              <Reveal className="africa-card"><strong>Year-round visibility</strong><span>Winners and finalists featured across Trading Expo Africa&apos;s media channels and partner coverage.</span></Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section section-alt" id="categories">
        <div className="container">
          <Reveal as="p" className="eyebrow">Award categories</Reveal>
          <Reveal as="h2" className="section-title">The 2027 <span className="grad">categories.</span></Reveal>
          <Reveal as="p" className="section-lead">Six categories covering the full spectrum of Africa&apos;s trading industry. Nominations open soon — no winners have been announced yet.</Reveal>
          <div className="award-grid">
            {CATEGORIES.map((c, i) => (
              <Reveal as="article" className="award-card" key={c.num} delay={i * 0.06}>
                <span className="cat-num">{c.num}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span className="nom-badge">Nominations open soon</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Judging criteria */}
      <section className="section">
        <div className="container">
          <Reveal as="p" className="eyebrow">How winners are chosen</Reveal>
          <Reveal as="h2" className="section-title">Judged on <span className="grad">merit.</span></Reveal>
          <div className="criteria-grid">
            {CRITERIA.map((c, i) => (
              <Reveal className="criteria-card" key={c.n} delay={i * 0.06}>
                <h3><span className="n">{c.n}</span>{c.title}</h3>
                <p>{c.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gala night */}
      <section className="section section-alt">
        <div className="container">
          <Reveal as="p" className="eyebrow">Gala night</Reveal>
          <Reveal as="h2" className="section-title">An evening <span className="grad">to remember.</span></Reveal>
          <Reveal className="gala-banner">
            <div>
              <h3>Awards Gala Night — Day 1</h3>
              <p>The industry&apos;s leaders gather for an evening of celebration: the live awards ceremony, gala dinner, entertainment and the networking that only happens when the whole industry is in one room.</p>
              <div className="gala-meta">
                <span className="gala-chip">📅 Evening of 19 February 2027</span>
                <span className="gala-chip">📍 Emperors Palace, Johannesburg</span>
                <span className="gala-chip">🎟️ Tickets announced soon</span>
              </div>
            </div>
            <a className="btn btn-primary btn-lg" href={GALA_MAILTO}>Register Interest</a>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container narrow">
          <Reveal as="p" className="eyebrow">Questions</Reveal>
          <Reveal as="h2" className="section-title">Awards <span className="grad">FAQ.</span></Reveal>
          <FaqGroup items={FAQS} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="section section-alt">
        <div className="container narrow center">
          <Reveal as="h2" className="section-title">Think you deserve the <span className="grad">stage?</span></Reveal>
          <Reveal as="p" className="section-lead">Nominations open soon. Register your interest now and be first in line.</Reveal>
          <Reveal as="a" href={NOMINATE_MAILTO} className="btn btn-primary btn-lg">Register Interest to Nominate</Reveal>
        </div>
      </section>
    </main>
  );
}
