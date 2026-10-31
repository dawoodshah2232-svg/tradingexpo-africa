// Traders Expo Johannesburg — portal interim store (Layer 1).
//
// This is the INTERIM browser store for the portal. Everything lives in this
// browser's localStorage until the real backend lands. It mirrors the
// Laravel 10 + MySQL backend spec in frontend/docs/portal-api-spec.md 1:1 —
// same entities, same field names — so the real backend can replace it
// without redesigning the portal.
//
// Rules baked in (Oct 2026 no-demo order):
//  - NO demo data. Lists start empty. Accounts exist only when the admin
//    creates them, when someone signs up (email OTP), or when someone books
//    on the tickets / exhibit pages. The single exception is the temporary
//    TEST account (see ensureTestAccount), ordered by the owner for now and
//    marked for deletion before production.
//  - Tickets are FREE. No payment UI ever appears on a ticket, and no card
//    details are ever captured anywhere in this file.
//  - The floor plan is REAL (organiser-supplied PDF, visually verified).
//    Booth numbers/tiers/sizes come from that plan. Availability reflects
//    reservations made in this portal; nothing is pre-filled.
//  - Passwords are never rendered in any UI. This interim layer stores them
//    as entered (same as booking passwords); production uses bcrypt and
//    never stores them in readable form.

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
  // Every booth starts available. A booth becomes reserved only when a
  // sponsor picks it in this portal (or the admin assigns it); sold only
  // when the admin marks it sold. No pre-filled availability.
  return BOOTH_MAP.map(([id, tier, size, price]) => ({
    id, row: tier, tier, size, price, status: 'available',
  }));
}

function seedState() {
  // Empty by design (Oct 2026 no-demo order): no seeded people, tickets,
  // sponsors, notifications, offers or payments. Lists start empty; the
  // only account created here is the temporary test account (see
  // ensureTestAccount), plus real accounts the admin creates or users
  // sign up for. Dashboard counts read from these rows, so they start 0.
  return {
    version: 3,
    packages: PACKAGES,
    addons: ADDONS,
    booths: buildBooths(),
    sponsors: [],
    assets: [],
    notifications: [],
    packageOffers: [],
    payments: [],
    deletedTickets: [],
    ticketEvents: {},
    speakerApplications: [],
  };
}

export function loadStore() {
  const s = readJSON(KEY, null);
  if (!s || s.version !== 3) return null;
  return s;
}
export function saveStore(s) { return writeJSON(KEY, s); }

// Temporary TEST account (owner-ordered, delete before production).
// Works on both the Ticket Holder login (as a ticket booking) and the
// Sponsor login (as a sponsor record). The password is never rendered
// in any UI; it is listed here only because the owner ordered this
// exact test account seeded for now.
const TEST_EMAIL = 'test@abc.com';
const TEST_PASSWORD = 'test@1234';

function isDemoBooking(b) {
  const ref = String(b.ref || '').toUpperCase();
  const email = String((b.fields && b.fields.email) || '').toLowerCase();
  if (b.demo === true) return true;
  if (/^TEA-DEMO/i.test(ref) || /^EXB27-DEMO/i.test(ref)) return true;
  if (email === 'demo@tradingexpo.com') return true;
  if (/^(attendee[123]|sponsor[12])@example\.com$/.test(email)) return true;
  if (/^demo-[a-z0-9]+@example\.com$/.test(email)) return true;
  return false;
}

export function ensureTestAccount() {
  const bookings = readJSON('tea_bookings', []);
  if (!bookings.find((b) => String((b.fields && b.fields.email) || '').toLowerCase() === TEST_EMAIL)) {
    bookings.push({
      ref: 'TEA-TEST01', password: TEST_PASSWORD, qty: 1,
      option: { name: 'Trader Pass', price: 0 },
      fields: { name: 'Test Account', email: TEST_EMAIL, phone: '' },
      at: nowISO(), type: 'ticket', test: true,
    });
    writeJSON('tea_bookings', bookings);
  }
  const st = loadStore();
  if (st && !st.sponsors.find((s) => s.email.toLowerCase() === TEST_EMAIL)) {
    st.sponsors.push({
      id: 'spn-test', brand: 'Test Account', tier: 'Unassigned', logo: null,
      email: TEST_EMAIL, password: TEST_PASSWORD, contact: 'Test Account', phone: '',
      boothId: null, boothChosenAt: null, packageId: null,
      note: 'Temporary test account — delete before production.', test: true,
    });
    saveStore(st);
  }
}

export function seedPortalV2() {
  // Purge any demo bookings left from earlier versions; keep real bookings.
  ['tea_bookings', 'tea_exhibit'].forEach((k) => {
    const all = readJSON(k, []);
    const kept = all.filter((b) => !isDemoBooking(b));
    if (kept.length !== all.length) writeJSON(k, kept);
  });
  // Migrate the portal store to the empty v3 state (old v2 data was
  // demo-only, so it is replaced, not carried over).
  const st0 = loadStore();
  if (!st0) saveStore(seedState());
  else if (!Array.isArray(st0.speakerApplications)) { st0.speakerApplications = []; saveStore(st0); }
  ensureTestAccount();
  return loadStore();
}

export function createSponsor(rec) {
  const st = loadStore(); if (!st) return { ok: false, error: 'Store unavailable.' };
  const email = String(rec.email || '').trim().toLowerCase();
  if (!email) return { ok: false, error: 'Email is required.' };
  if (st.sponsors.find((s) => s.email.toLowerCase() === email)) return { ok: false, error: 'An account with this email already exists.' };
  const sp = {
    id: uid('spn-'), brand: rec.brand || rec.contact || email, tier: rec.tier || 'Unassigned',
    logo: null, email, password: rec.password || '', contact: rec.contact || '',
    phone: rec.phone || '', boothId: null, boothChosenAt: null,
    packageId: rec.packageId || null, note: rec.note || '',
    interestedPackageId: rec.interestedPackageId || null,
    interestedPackage: rec.interestedPackage || '',
  };
  st.sponsors = [...st.sponsors, sp];
  saveStore(st);
  return { ok: true, sponsor: sp };
}

const ADMIN_KEY = 'tea_admins';
export function getAdminUsers() { return readJSON(ADMIN_KEY, []); }
export function addAdminUser({ user, name, password }) {
  const u = String(user || '').trim();
  if (!u || !password) return { ok: false, error: 'Username and password are required.' };
  if (u.toLowerCase() === 'admin') return { ok: false, error: 'That username is already taken.' };
  const all = getAdminUsers();
  if (all.find((a) => a.user.toLowerCase() === u.toLowerCase())) return { ok: false, error: 'That username is already taken.' };
  all.push({ user: u, name: name || u, password });
  writeJSON(ADMIN_KEY, all);
  return { ok: true };
}
export function adminUserLogin(user, password) {
  const hit = getAdminUsers().find((a) => a.user.toLowerCase() === String(user || '').trim().toLowerCase() && a.password === password);
  return hit || null;
}

/* ---------- email OTP (signup verification, interim browser layer) ----------
   The code lives ONLY in the short-lived pending record below (with expiry
   and attempt count). It is never logged, never rendered, and never sent
   anywhere except inside the FormSubmit autoresponse to the user's own
   inbox. Production replaces this with server-side codes + Laravel mail. */
const OTP_KEY = 'tea_otp_pending';
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_MS = 60 * 1000;
function otpCode() {
  if (!window.crypto || !window.crypto.getRandomValues) return null;
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return String(100000 + (buf[0] % 900000));
}
export function createOtp(email, form) {
  const code = otpCode();
  if (!code) return { ok: false, error: 'Secure code generation is unavailable in this browser. Please ask the admin to create your account.' };
  const rec = { email: String(email).trim().toLowerCase(), code, form, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0, lastSentAt: Date.now() };
  writeJSON(OTP_KEY, rec);
  return { ok: true, code, expiresAt: rec.expiresAt };
}
export function getOtpRecord() { return readJSON(OTP_KEY, null); }
export function clearOtp() { try { localStorage.removeItem(OTP_KEY); } catch {} }
export function resendOtp() {
  const rec = getOtpRecord();
  if (!rec) return { ok: false, error: 'No signup in progress. Please start again.' };
  const wait = rec.lastSentAt + OTP_RESEND_MS - Date.now();
  if (wait > 0) return { ok: false, error: `Please wait ${Math.ceil(wait / 1000)}s before resending.`, waitSec: Math.ceil(wait / 1000) };
  const code = otpCode();
  if (!code) return { ok: false, error: 'Secure code generation is unavailable in this browser.' };
  rec.code = code; rec.attempts = 0; rec.expiresAt = Date.now() + OTP_TTL_MS; rec.lastSentAt = Date.now();
  writeJSON(OTP_KEY, rec);
  return { ok: true, code, expiresAt: rec.expiresAt };
}
export function verifyOtp(email, code) {
  const rec = getOtpRecord();
  if (!rec || rec.email !== String(email || '').trim().toLowerCase()) return { ok: false, error: 'No code request found for this email. Please sign up again.' };
  if (Date.now() > rec.expiresAt) { clearOtp(); return { ok: false, error: 'That code has expired. Please request a new code.', expired: true }; }
  if (String(code || '').trim() !== rec.code) {
    rec.attempts += 1;
    if (rec.attempts >= OTP_MAX_ATTEMPTS) { clearOtp(); return { ok: false, error: 'Too many wrong attempts. Please request a new code.', locked: true }; }
    writeJSON(OTP_KEY, rec);
    return { ok: false, error: `Wrong code. ${OTP_MAX_ATTEMPTS - rec.attempts} attempt(s) left.`, attemptsLeft: OTP_MAX_ATTEMPTS - rec.attempts };
  }
  const form = rec.form;
  clearOtp();
  return { ok: true, form };
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

export function getSpeakerApplications() {
  const st = loadStore();
  return st ? (st.speakerApplications || []) : [];
}
export function addSpeakerApplication(rec) {
  const st = loadStore(); if (!st) return null;
  const row = {
    id: uid('spk-'), name: rec.name || '', email: rec.email || '', phone: rec.phone || '',
    topic: rec.topic || '', bio: rec.bio || '', status: 'pending', at: nowISO(),
  };
  st.speakerApplications = [...(st.speakerApplications || []), row];
  saveStore(st);
  return row;
}
export function setSpeakerApplicationStatus(id, status) {
  const st = loadStore(); if (!st) return false;
  st.speakerApplications = (st.speakerApplications || []).map((a) => (a.id === id ? { ...a, status } : a));
  saveStore(st);
  return true;
}

export const portalStore = {
  loadStore, saveStore, seedPortalV2, ensureTestAccount, createSponsor,
  getAdminUsers, addAdminUser, adminUserLogin,
  createOtp, getOtpRecord, clearOtp, resendOtp, verifyOtp,
  getSpeakerApplications, addSpeakerApplication, setSpeakerApplicationStatus,
  getSponsors, getSponsor, sponsorLogin, updateSponsor,
  getPackages, addPackage, getBooths, getBooth, chooseBooth, addAsset, getAssets,
  publishNotification, getNotifications, notificationsFor, offersFor, addPackageOffer,
  submitPayment, setPaymentStatus, getPayments, getDeletedTickets, recordDeletedTicket,
  ticketHistory, markNotifRead, markAllNotifRead, readNotifIds, moneyUSD, PACKAGES, ADDONS,
};
