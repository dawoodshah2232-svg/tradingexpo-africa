// Traders Expo Johannesburg — portal demo store (Layer 1).
//
// This is the DEMO data layer for the portal. Everything lives in this
// browser's localStorage so every flow is clickable today. It mirrors the
// Laravel 10 + MySQL backend spec in frontend/docs/portal-api-spec.md 1:1 —
// same entities, same field names — so the real backend can replace it
// without redesigning the portal.
//
// Honesty rules baked in:
//  - No real attendee data. Seeded people are fictional ("Demo Attendee One"
//    etc.) on example.com addresses. Real bookings made on the tickets page
//    land in tea_bookings and are picked up by email login automatically.
//  - The 10 sponsor-wall brands are past ProFX partners. Their demo sponsor
//    accounts reuse ONLY their names + the logos already in the repo. No
//    2027 deal, booth, or payment is implied for them — their seeded records
//    carry no booth and no payment.
//  - Tickets are FREE. No payment UI ever appears on a ticket, and no card
//    details are ever captured anywhere in this file.
//  - The floor plan is REAL (organiser-supplied PDF, visually verified).
//    Booth numbers/tiers/sizes come from that plan. Availability states
//    (available/reserved/sold) remain demo data.

const KEY = 'tea_portal_v2';
const READ_PREFIX = 'tea_portal_v2_read_';

const readJSON = (k, fb) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; }
  catch { return fb; }
};
const writeJSON = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch { return false; }
};
const nowISO = () => new Date().toISOString();
const uid = (p) => (p || 'x') + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);

// Brochure facts (sponsorship brochure, Oct 2026). Prices in USD.
export const PACKAGES = [
  { id: 'pkg-title', tier: 'Title', size: '5×3', sqm: 15, scheme: 'Space only', price: 30000, benefits: '15 sqm space-only stand · 10-min presentation · 2 interviews · 6 social posts · full A4 ad + 2-page editorial · 8 gala seats' },
  { id: 'pkg-official', tier: 'Official', size: '5×3', sqm: 15, scheme: 'Space only', price: 20000, benefits: '15 sqm space-only stand · 8-min presentation · 1 interview · 4 social posts · full A4 ad + editorial · 6 gala seats' },
  { id: 'pkg-exclusive', tier: 'Exclusive', size: '5×3', sqm: 15, scheme: 'Space only', price: 15000, benefits: '15 sqm space-only stand · category exclusivity (subject to agreement) · 1 interview · 3 social posts · half-page ad + profile · 4 gala seats' },
  { id: 'pkg-regional', tier: 'Regional', size: '5×3', sqm: 15, scheme: 'Space only', price: 12000, benefits: '15 sqm space-only stand · 20-min networking roundtable · 1 interview · 2 social posts · half-page ad + listing · 4 gala seats' },
  { id: 'pkg-diamond', tier: 'Diamond', size: '4×3', sqm: 12, scheme: 'Space only', price: 9000, benefits: '12 sqm space-only stand · 15-min demo · 1 interview · 2 social posts · quarter-page ad + listing · 3 gala seats' },
  { id: 'pkg-elite', tier: 'Elite', size: '4×3', sqm: 12, scheme: 'Space only', price: 8000, benefits: '12 sqm space-only stand · 1 interview · 1 social post · enhanced directory profile · magazine mention · 3 gala seats' },
  { id: 'pkg-gold', tier: 'Gold', size: '3×3', sqm: 9, scheme: 'Shell scheme', price: 6500, benefits: '9 sqm shell scheme (2 sides open, TV included, organiser-built branding) · 1 interview · shared social · magazine listing · 2 gala seats' },
  { id: 'pkg-silver', tier: 'Silver', size: '3×3', sqm: 9, scheme: 'Shell scheme', price: 4000, benefits: '9 sqm shell scheme (1 side open, TV rentable) · magazine listing · 2 gala seats' },
];
export const ADDONS = [
  { id: 'add-speaker-hall', name: 'Speaker Hall', price: 10000 },
  { id: 'add-entrance-arch', name: 'Entrance Arch', price: 5000 },
  { id: 'add-lounge', name: 'Networking Lounge', price: 5000 },
  { id: 'add-registration', name: 'Registration Area', price: 5000 },
  { id: 'add-cafe', name: 'Café / Coffee Bar', price: 5000 },
  { id: 'add-cocktail', name: 'Cocktail Reception', price: 5000 },
  { id: 'add-led', name: 'LED Wall Roll-up', price: 5000 },
  { id: 'add-banner', name: 'Advertising Banner (30-sec LED rotation)', price: 250 },
  { id: 'add-flag', name: 'Flag Pole', price: 500 },
  { id: 'add-bag', name: 'Attendee Bag Sponsor', price: 3000 },
];

// REAL floor plan — "ProFx Expo Africa 2027 - Jo'Burg", Updated Floor Plan,
// Emperors Palace (drawing dated 11 February 2027; the EVENT is 19–20 Feb
// 2027). Mapping verified visually against the rendered PDF page, including
// the 01–04 column (01 Official, 02 Title, 03 Exclusive, 04 Regional) and the
// top row (17 Gold, 18–22 Silver, 23 Gold). Counts match the plan's own
// summary: 1+1+1+1+8+4+8+14 = 38. Availability is DEMO data only.
const BOOTH_MAP = [
  ['01', 'Official', '5×3', 20000], ['02', 'Title', '5×3', 30000],
  ['03', 'Exclusive', '5×3', 15000], ['04', 'Regional', '5×3', 12000],
  ['05', 'Diamond', '4×3', 9000], ['06', 'Diamond', '4×3', 9000],
  ['07', 'Elite', '4×3', 8000], ['08', 'Elite', '4×3', 8000],
  ['09', 'Diamond', '4×3', 9000], ['10', 'Diamond', '4×3', 9000],
  ['11', 'Diamond', '4×3', 9000], ['12', 'Diamond', '4×3', 9000],
  ['13', 'Elite', '4×3', 8000], ['14', 'Elite', '4×3', 8000],
  ['15', 'Diamond', '4×3', 9000], ['16', 'Diamond', '4×3', 9000],
  ['17', 'Gold', '3×3', 6500], ['18', 'Silver', '3×3', 4000],
  ['19', 'Silver', '3×3', 4000], ['20', 'Silver', '3×3', 4000],
  ['21', 'Silver', '3×3', 4000], ['22', 'Silver', '3×3', 4000],
  ['23', 'Gold', '3×3', 6500], ['24', 'Gold', '3×3', 6500],
  ['25', 'Silver', '3×3', 4000], ['26', 'Silver', '3×3', 4000],
  ['27', 'Gold', '3×3', 6500], ['28', 'Gold', '3×3', 6500],
  ['29', 'Silver', '3×3', 4000], ['30', 'Silver', '3×3', 4000],
  ['31', 'Gold', '3×3', 6500], ['32', 'Gold', '3×3', 6500],
  ['33', 'Silver', '3×3', 4000], ['34', 'Silver', '3×3', 4000],
  ['35', 'Silver', '3×3', 4000], ['36', 'Silver', '3×3', 4000],
  ['37', 'Silver', '3×3', 4000], ['38', 'Gold', '3×3', 6500],
];
function buildBooths() {
  const sold = new Set(['02', '05', '17', '29']);
  const reserved = new Set(['01', '09', '24', '31']); // 24 held by the fictional demo sponsor
  return BOOTH_MAP.map(([id, tier, size, price]) => ({
    id, row: tier, tier, size, price,
    status: sold.has(id) ? 'sold' : reserved.has(id) ? 'reserved' : 'available',
  }));
}

function seedState() {
  const wall = [
    { brand: 'BridgingFX', tier: 'Platinum', logo: 'bridgingfx.png' },
    { brand: 'Swiset', tier: 'Gold', logo: 'swiset.png' },
    { brand: 'Taurex', tier: 'Gold', logo: 'taurex.png' },
    { brand: 'FXKEY', tier: 'Silver', logo: 'fxkey.png' },
    { brand: 'GGCC', tier: 'Silver', logo: 'ggcc.png' },
    { brand: 'JKV', tier: 'Silver', logo: 'jkv.png' },
    { brand: 'Miles Capital', tier: 'Silver', logo: 'milescapital.png' },
    { brand: 'PipsForex', tier: 'Silver', logo: 'pipsforex.png' },
    { brand: 'Profit FX', tier: 'Silver', logo: 'profitfx.png' },
    { brand: 'ZaraFX', tier: 'Silver', logo: 'zarafx.png' },
  ];
  const sponsors = wall.map((w, i) => ({
    id: 'spn-' + (i + 1),
    brand: w.brand, tier: w.tier, logo: w.logo,
    email: 'demo-' + w.brand.toLowerCase().replace(/[^a-z0-9]+/g, '') + '@example.com',
    password: 'demo123', contact: 'Demo Contact', phone: '+27 11 000 00' + (10 + i),
    isWallDemo: true, boothId: null, boothChosenAt: null, packageId: null,
    note: 'Past ProFX partner — demo account for preview only. No 2027 sponsorship deal is implied.',
  }));
  sponsors.push(
    { id: 'spn-demo-1', brand: 'Demo Sponsor One', tier: 'Gold', logo: null, email: 'sponsor1@example.com', password: 'demo123', contact: 'Demo Sponsor One', phone: '+27 11 000 0091', isWallDemo: false, boothId: '24', boothChosenAt: nowISO(), packageId: 'pkg-gold', note: 'Fictional demo sponsor.' },
    { id: 'spn-demo-2', brand: 'Demo Sponsor Two', tier: 'Silver', logo: null, email: 'sponsor2@example.com', password: 'demo123', contact: 'Demo Sponsor Two', phone: '+27 11 000 0092', isWallDemo: false, boothId: null, boothChosenAt: null, packageId: 'pkg-silver', note: 'Fictional demo sponsor.' },
  );
  return {
    version: 2,
    packages: PACKAGES,
    addons: ADDONS,
    booths: buildBooths(),
    sponsors,
    assets: [],
    notifications: [
      { id: 'n-welcome', kind: 'announcement', audience: 'all', title: 'Welcome to the Traders Expo Johannesburg portal', body: 'Ticket holders, sponsors and admins manage everything for 19–20 February 2027 here: tickets, booths, floor plan, payments and announcements.', at: nowISO() },
      { id: 'n-offer', kind: 'offer', audience: 'ticket', title: 'Partner offer: free expo-day trading workshop', body: 'Demo promotion: a free 60-minute trading workshop on Day 1 for all ticket holders. No purchase needed — tickets are free and this offer is free too.', at: nowISO() },
    ],
    packageOffers: [],
    payments: [
      { id: 'pay-demo-1', sponsorId: 'spn-demo-1', sponsor: 'Demo Sponsor One', item: 'Gold package', amount: 6500, currency: 'USD', method: 'Bank transfer', status: 'Confirmed', note: 'Fictional demo payment.', at: nowISO() },
    ],
    deletedTickets: [],
    ticketEvents: {},
  };
}

export function loadStore() {
  const s = readJSON(KEY, null);
  if (!s || s.version !== 2) return null;
  return s;
}
export function saveStore(s) { return writeJSON(KEY, s); }

export function seedPortalV2() {
  // Fictional demo attendees (also seeded as ticket bookings so the
  // existing email-login path and ticket views work unchanged).
  const bookings = readJSON('tea_bookings', []);
  const seeds = [
    { ref: 'TEA-DEMO1', name: 'Demo Attendee One', email: 'attendee1@example.com', phone: '+27 11 000 0011', pass: 'Trader Pass' },
    { ref: 'TEA-DEMO2', name: 'Demo Attendee Two', email: 'attendee2@example.com', phone: '+27 11 000 0012', pass: 'Pro Trader Pass' },
    { ref: 'TEA-DEMO3', name: 'Demo Attendee Three', email: 'attendee3@example.com', phone: '+27 11 000 0013', pass: 'VIP Pass' },
  ];
  let changed = false;
  seeds.forEach((sd) => {
    if (!bookings.find((b) => b.ref === sd.ref)) {
      bookings.push({
        ref: sd.ref, password: 'demo123', qty: 1,
        option: { name: sd.pass, price: 0 },
        fields: { name: sd.name, email: sd.email, phone: sd.phone },
        at: nowISO(), type: 'ticket', demo: true,
      });
      changed = true;
    }
  });
  if (changed) writeJSON('tea_bookings', bookings);
  if (!loadStore()) saveStore(seedState());
  return loadStore();
}

export function getSponsors() { return (loadStore() || seedState()).sponsors; }
export function getSponsor(id) { return getSponsors().find((s) => s.id === id) || null; }
export function sponsorLogin(email, password) {
  const s = getSponsors().find((x) => x.email.toLowerCase() === String(email || '').trim().toLowerCase()
    && x.password === password);
  return s || null;
}
export function updateSponsor(id, patch) {
  const st = loadStore(); if (!st) return null;
  st.sponsors = st.sponsors.map((s) => (s.id === id ? { ...s, ...patch } : s));
  saveStore(st);
  return st.sponsors.find((s) => s.id === id);
}
export function getPackages() { return (loadStore() || seedState()).packages; }
export function addPackage(pkg) {
  const st = loadStore(); if (!st) return null;
  const rec = { ...pkg, id: uid('pkg-'), custom: true };
  st.packages = [...st.packages, rec];
  saveStore(st);
  return rec;
}
export function getBooths() { return (loadStore() || seedState()).booths; }
export function getBooth(id) { return getBooths().find((b) => b.id === id) || null; }
export function chooseBooth(sponsorId, boothId) {
  const st = loadStore(); if (!st) return { ok: false, error: 'Store unavailable.' };
  const booth = st.booths.find((b) => b.id === boothId);
  if (!booth) return { ok: false, error: 'Booth not found.' };
  if (booth.status !== 'available') return { ok: false, error: `Booth ${boothId} is ${booth.status} — pick an available booth.` };
  const sp = st.sponsors.find((s) => s.id === sponsorId);
  if (!sp) return { ok: false, error: 'Sponsor not found.' };
  if (sp.boothId) {
    const prev = st.booths.find((b) => b.id === sp.boothId);
    if (prev && prev.status === 'reserved') prev.status = 'available';
  }
  booth.status = 'reserved';
  sp.boothId = boothId; sp.boothChosenAt = nowISO();
  saveStore(st);
  return { ok: true, booth };
}
export function addAsset(sponsorId, asset) {
  const st = loadStore(); if (!st) return null;
  const rec = { ...asset, id: uid('ast-'), sponsorId, at: nowISO() };
  st.assets = [...st.assets, rec];
  saveStore(st);
  return rec;
}
export function getAssets(sponsorId) {
  const st = loadStore() || seedState();
  return sponsorId ? st.assets.filter((a) => a.sponsorId === sponsorId) : st.assets;
}
export function publishNotification(n) {
  const st = loadStore(); if (!st) return null;
  const rec = { ...n, id: uid('n-'), at: nowISO() };
  st.notifications = [rec, ...st.notifications];
  saveStore(st);
  return rec;
}
export function getNotifications() { return (loadStore() || seedState()).notifications; }
export function notificationsFor({ role, email }) {
  const all = getNotifications();
  return all.filter((n) => {
    if (n.audience === 'all') return true;
    if (role === 'admin') return true;
    if (role === 'ticket') return n.audience === 'ticket' || n.audience === email;
    if (role === 'exhibitor') return n.audience === 'sponsor' || n.audience === email;
    return false;
  });
}
export function offersFor({ role, email, sponsorId }) {
  const notifs = notificationsFor({ role, email }).filter((n) => n.kind === 'offer' || n.kind === 'promotion');
  const st = loadStore() || seedState();
  const mine = (st.packageOffers || []).filter((o) => o.sponsorId === sponsorId);
  return { notifs, packageOffers: mine };
}
export function addPackageOffer({ sponsorId, packageId, discountedPrice, note }) {
  const st = loadStore(); if (!st) return null;
  const sp = st.sponsors.find((s) => s.id === sponsorId);
  const pkg = st.packages.find((p) => p.id === packageId);
  if (!sp || !pkg) return null;
  const rec = {
    id: uid('off-'), sponsorId, sponsor: sp.brand, packageId, package: pkg.tier,
    listPrice: pkg.price, discountedPrice, note: note || '', status: 'offered', at: nowISO(),
  };
  st.packageOffers = [rec, ...(st.packageOffers || [])];
  st.notifications = [{
    id: uid('n-'), kind: 'offer', audience: sp.email,
    title: `Discounted offer: ${pkg.tier} package at $${discountedPrice.toLocaleString()}`,
    body: (note ? note + ' ' : '') + `The ${pkg.tier} package (list $${pkg.price.toLocaleString()}) is offered to ${sp.brand} at $${discountedPrice.toLocaleString()}. View it in your sponsor portal under Offers.`,
    at: nowISO(),
  }, ...st.notifications];
  saveStore(st);
  return rec;
}
export function submitPayment(p) {
  const st = loadStore(); if (!st) return null;
  const rec = { ...p, id: uid('pay-'), status: 'Submitted', at: nowISO() };
  st.payments = [rec, ...(st.payments || [])];
  saveStore(st);
  return rec;
}
export function setPaymentStatus(id, status) {
  const st = loadStore(); if (!st) return false;
  st.payments = (st.payments || []).map((p) => (p.id === id ? { ...p, status } : p));
  saveStore(st);
  return true;
}
export function getPayments(sponsorId) {
  const st = loadStore() || seedState();
  return sponsorId ? (st.payments || []).filter((p) => p.sponsorId === sponsorId) : (st.payments || []);
}
export function getDeletedTickets() { return (loadStore() || seedState()).deletedTickets || []; }
export function recordDeletedTicket(rec) {
  const st = loadStore(); if (!st) return;
  st.deletedTickets = [rec, ...(st.deletedTickets || [])];
  const evs = st.ticketEvents || {};
  evs[rec.ref] = [...(evs[rec.ref] || []), { at: nowISO(), status: 'deleted', note: rec.reason || '' }];
  st.ticketEvents = evs;
  saveStore(st);
}
export function ticketHistory(ref, issuedAt) {
  const st = loadStore() || seedState();
  const evs = [...(st.ticketEvents?.[ref] || [])];
  if (issuedAt && !evs.find((e) => e.status === 'issued')) {
    evs.unshift({ at: issuedAt, status: 'issued', note: 'Ticket issued (free)' });
  }
  return evs.sort((a, b) => String(a.at).localeCompare(String(b.at)));
}
export function markNotifRead(userKey, id) {
  const ids = readJSON(READ_PREFIX + userKey, []);
  if (!ids.includes(id)) writeJSON(READ_PREFIX + userKey, [...ids, id]);
}
export function markAllNotifRead(userKey, ids) { writeJSON(READ_PREFIX + userKey, ids); }
export function readNotifIds(userKey) { return readJSON(READ_PREFIX + userKey, []); }
export function moneyUSD(n) { return '$' + Number(n || 0).toLocaleString('en-US'); }

export const portalStore = {
  loadStore, saveStore, seedPortalV2, getSponsors, getSponsor, sponsorLogin, updateSponsor,
  getPackages, addPackage, getBooths, getBooth, chooseBooth, addAsset, getAssets,
  publishNotification, getNotifications, notificationsFor, offersFor, addPackageOffer,
  submitPayment, setPaymentStatus, getPayments, getDeletedTickets, recordDeletedTicket,
  ticketHistory, markNotifRead, markAllNotifRead, readNotifIds, moneyUSD, PACKAGES, ADDONS,
};
