// Generates frontend/*.html entry shells from the current static pages.
// Preserves each page's <head> (SEO meta, OG tags, JSON-LD, fonts) verbatim,
// drops the old stylesheet <link>s (Vite injects bundled CSS via JS imports),
// wires the body to the React entry module, and injects a static pre-render
// block inside #root so crawlers / no-JS clients see real content (h1, intro,
// nav). React 18 createRoot replaces #root children on load.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');      // repo root (old static site)
const FRONT = join(__dirname, '..');           // frontend/

const PAGES = [
  ['index.html', 'home'],
  ['tickets.html', 'tickets'],
  ['exhibit.html', 'exhibit'],
  ['agenda.html', 'agenda'],
  ['venue.html', 'venue'],
  ['gallery.html', 'gallery'],
  ['sponsors.html', 'sponsors'],
  ['awards.html', 'awards'],
  ['blog.html', 'blog'],
  ['faq.html', 'faq'],
  ['contact.html', 'contact'],
  ['portal.html', 'portal'],
];

// Human-written pre-render summaries (kept in sync with each page's purpose).
const PRE_RENDER = {
  'index.html': ['Trading Expo Africa',
    'Africa\u2019s premier trading and fintech exhibition comes to Africa on 23\u201324 April 2027 \u2014 two days of live trading technology, 70\u201380 exhibitors, 80+ speakers and 10,000+ visitors under one roof.'],
  'tickets.html': ['Book Tickets',
    'Secure your pass for Trading Expo Africa, 23\u201324 April 2027 in Africa. Early-bird passes from \u20b9249 \u2014 two full days on the expo floor, keynotes, panels and the awards night.'],
  'exhibit.html': ['Exhibit',
    'Put your brand in front of 10,000+ traders, investors and fintech buyers. Book a booth at Trading Expo Africa and demo your platform live on the expo floor, 23\u201324 April 2027.'],
  'agenda.html': ['Agenda',
    'Two days of keynotes, panels and live trading sessions across 23\u201324 April 2027 \u2014 the indicative agenda for Trading Expo Africa. Final speakers and timings will be announced soon.'],
  'venue.html': ['Venue',
    'Trading Expo Africa takes place 23\u201324 April 2027 in Africa. The host city and venue announcement is coming soon \u2014 travel guidance, hotels and logistics will be published here.'],
  'gallery.html': ['Gallery',
    'A visual tour of the Trading Expo Africa experience \u2014 the grand hall, main stage, expo floor, networking lounges and the energy of 10,000+ visitors.'],
  'sponsors.html': ['Sponsorships',
    'Put your brand centre stage at Africa\u2019s premier trading expo. Title, Platinum, Gold, Silver and Bronze tiers plus spotlight branding packages for 23\u201324 April 2027.'],
  'awards.html': ['Trading Expo Africa Awards 2027',
    'Celebrating excellence in trading \u2014 the best brokers, trading platforms, fintech innovators and educators in Africa\u2019s trading industry. Gala night on 23 April 2027; nominations opening soon.'],
  'blog.html': ['Blog',
    'Practical, hype-free guides for African traders \u2014 market explainers, broker and tax guides, expo news and event updates from the Trading Expo Africa editorial team.'],
  'faq.html': ['Frequently Asked Questions',
    'Answers to the most common questions about Trading Expo Africa \u2014 tickets, venue, exhibiting, sponsorships and attending across 23\u201324 April 2027.'],
  'contact.html': ['Contact',
    'Get in touch with the Trading Expo Africa team \u2014 for tickets, exhibiting, sponsorships, speaking slots or press enquiries. Organised by ProFX Media FZ-LLC.'],
  'portal.html': ['Portal',
    'The Trading Expo Africa portal \u2014 dashboards for ticket holders, exhibitors and event admins to manage tickets, booths, badges and announcements in one place.'],
};

const NAV = [
  ['index.html', 'Home'], ['tickets.html', 'Tickets'], ['exhibit.html', 'Exhibit'],
  ['agenda.html', 'Agenda'], ['venue.html', 'Venue'], ['gallery.html', 'Gallery'],
  ['sponsors.html', 'Sponsors'], ['awards.html', 'Awards'], ['blog.html', 'Blog'],
  ['faq.html', 'FAQ'], ['contact.html', 'Contact'], ['portal.html', 'Portal'],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function preRender(file) {
  const [h1, intro] = PRE_RENDER[file] || ['Trading Expo Africa', ''];
  const links = NAV.map(([href, label]) =>
    `<a href="${href}">${label}</a>`).join(' · ');
  let extra = '';
  if (file === 'blog.html') {
    const posts = JSON.parse(readFileSync(join(FRONT, 'public', 'assets', 'blog-index.json'), 'utf8'));
    extra = '<h2>Latest articles</h2><ul>' + posts.map((p) =>
      `<li><a href="blog/${p.slug}.html">${esc(p.title)}</a></li>`).join('') + '</ul>';
  }
  return `<div class="txi-prerender" style="max-width:1120px;margin:0 auto;padding:56px 24px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Helvetica,Arial,sans-serif;color:#e8ecef">`
    + `<p style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#00C853;font-weight:700">Trading Expo Africa · 23\u201324 April 2027 · Africa</p>`
    + `<h1 style="font-size:2rem;line-height:1.25">${esc(h1)}</h1>`
    + `<p style="font-size:1.05rem;line-height:1.8;color:#9aa3ad;max-width:760px">${esc(intro)}</p>`
    + extra
    + `<nav aria-label="Site" style="margin-top:28px;font-size:.95rem">${links}</nav>`
    + `</div>`;
}

const THEME_INIT = `<script>try{var t=localStorage.getItem("tea-theme");document.documentElement.setAttribute("data-theme",t==="light"||t==="dark"?t:"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}</script>`;

for (const [file, entry] of PAGES) {
  const src = readFileSync(join(ROOT, file), 'utf8');

  const headMatch = src.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) throw new Error(`no head in ${file}`);
  let head = headMatch[1]
    // drop old stylesheet links — Vite injects the bundled CSS
    .replace(/<link[^>]*rel="stylesheet"[^>]*href="[^"]*(styles\.css|portal\.css)[^"]*"[^>]*>\s*/gi, '')
    .replace(/<link[^>]*href="[^"]*(styles\.css|portal\.css)[^"]*"[^>]*rel="stylesheet"[^>]*>\s*/gi, '')
    // drop Google Fonts (Apple system font stack is used instead)
    .replace(/<link[^>]*fonts\.googleapis\.com[^>]*>\s*/gi, '')
    .replace(/<link[^>]*fonts\.gstatic\.com[^>]*>\s*/gi, '');

  const bodyAttrs = (src.match(/<body([^>]*)>/i) || [])[1] || '';

  const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
${THEME_INIT}
${head.trim()}
</head>
<body${bodyAttrs}>
<div id="root">${preRender(file)}</div>
<script type="module" src="/src/entries/${entry}.jsx"></script>
</body>
</html>
`;
  writeFileSync(join(FRONT, file), html);
  console.log('wrote', file, '-> entry', entry);
}
