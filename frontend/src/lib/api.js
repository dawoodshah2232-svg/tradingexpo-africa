// API client for the Trading Expo Africa Laravel backend.
//
// Behaviour contract:
//  - When the Laravel API is reachable (cPanel production, or local dev with
//    VITE_API_BASE=http://localhost:8000), every call goes to the real DB.
//  - When it is NOT reachable (e.g. the static GitHub Pages preview), the
//    client transparently falls back to the original localStorage demo store,
//    so the site behaves exactly like the previous static version.
//  - A response is only treated as "real" when it is valid JSON. A thrown
//    network error, a timeout, or a non-JSON payload (GitHub's 404 page)
//    all mean "no backend here" -> demo fallback.

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const TIMEOUT_MS = 12000;
const TOKEN_KEY = 'tea_admin_token';

function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; }
  catch { return ''; }
}
function setToken(t) {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

function makeRef(prefix) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix}-${s}`;
}
function makePass() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

async function apiFetch(path, { method = 'GET', body } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (data === null || typeof data !== 'object') return { __demo: true };
    return data;
  } catch {
    return { __demo: true };
  } finally {
    clearTimeout(timer);
  }
}

function readStore(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}
function writeStore(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/* ---------------- Health ---------------- */

export async function apiHealth() {
  const r = await apiFetch('/api/health');
  return !(r && r.__demo);
}

/* ---------------- Bookings (tickets + exhibitor booths) ---------------- */

export async function createBooking(payload) {
  // payload: { type: 'ticket'|'exhibitor', pass_name, qty, total, name,
  //            company, email, phone, extra }
  const res = await apiFetch('/api/bookings', { method: 'POST', body: payload });
  if (!res.__demo) return { ...res, demo: false };

  // Demo fallback — identical to the original static site behaviour.
  const prefix = payload.type === 'exhibitor' ? 'EXB27' : 'TEA';
  const rec = {
    ref: makeRef(prefix),
    password: makePass(),
    option: { name: payload.pass_name, price: payload.total, note: '' },
    qty: payload.qty || 1,
    fields: {
      name: payload.name || '', company: payload.company || '',
      email: payload.email || '', phone: payload.phone || '',
      ...(payload.extra || {}),
    },
    at: new Date().toISOString(),
    type: payload.type,
    demo: true,
  };
  const key = payload.type === 'exhibitor' ? 'tea_exhibit' : 'tea_bookings';
  const all = readStore(key);
  all.push(rec);
  writeStore(key, all);
  return { ok: true, ref: rec.ref, password: rec.password, demo: true };
}

/* ---------------- Portal auth ---------------- */

const DEMO_LOGINS = [
  { role: 'admin', ref: 'admin', password: 'expo2027' },
  { role: 'exhibitor', ref: 'EXB27-DEMO', password: 'demo123' },
  { role: 'ticket', ref: 'TEA-DEMO', password: 'demo123' },
];

export async function portalLogin(role, ref, password) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST', body: { role, ref, password },
  });
  if (!res.__demo) return { ...res, demo: false };

  const hit = DEMO_LOGINS.find(
    (d) => d.role === role && d.ref === ref.trim() && d.password === password
  );
  if (!hit) return { ok: false, error: 'Invalid reference or password.', demo: true };
  return { ok: true, role, ref: hit.ref, demo: true };
}

/* ---------------- Announcements ---------------- */

export async function getAnnouncements() {
  const res = await apiFetch('/api/announcements');
  if (!res.__demo && Array.isArray(res.data)) return res.data;
  return readStore('tea_announcements');
}

export async function saveAnnouncement(item) {
  const res = await apiFetch('/api/announcements', { method: 'POST', body: item });
  if (!res.__demo) return res;
  const all = readStore('tea_announcements');
  all.unshift({ ...item, id: Date.now(), created_at: new Date().toISOString() });
  writeStore('tea_announcements', all);
  return { ok: true, demo: true };
}

export async function deleteAnnouncement(id) {
  const res = await apiFetch('/api/announcements/' + encodeURIComponent(id), { method: 'DELETE' });
  if (!res.__demo) return res;
  const all = readStore('tea_announcements');
  writeStore('tea_announcements', all.filter((a) => a.id !== id));
  return { ok: true, demo: true };
}

/* ---------------- Admin: bookings ---------------- */

export async function getAllBookings() {
  const res = await apiFetch('/api/admin/bookings');
  if (!res.__demo && Array.isArray(res.data)) return res.data;
  return [...readStore('tea_bookings'), ...readStore('tea_exhibit')];
}

/* ---------------- Contact + newsletter ---------------- */

export async function submitContact(data) {
  const res = await apiFetch('/api/contact', { method: 'POST', body: data });
  if (!res.__demo) return res;
  // Demo fallback: keep the original mailto behaviour (handled by caller).
  return { ok: false, demo: true };
}

export async function subscribeNewsletter(email) {
  const res = await apiFetch('/api/newsletter', { method: 'POST', body: { email } });
  if (!res.__demo) return res;
  return { ok: true, demo: true };
}

export function money(n) {
  return Number(n || 0).toLocaleString('en-ZA');
}

/* ---------------- Bookings: unified submit (BookingFlow) ---------------- */

export async function submitBooking(type, data) {
  // data: { name, email, phone, city, company, website, category,
  //         package, price, qty, storeKey, refPrefix }
  const res = await createBooking({
    type,
    pass_name: data.package,
    qty: data.qty || 1,
    total: (data.price || 0) * (data.qty || 1),
    name: data.name || '',
    company: data.company || '',
    email: data.email || '',
    phone: data.phone || '',
    extra: { city: data.city || '', website: data.website || '', category: data.category || '' },
  });
  return res;
}

/* ---------------- Portal: booking login (ref + password) ---------------- */

export async function bookingLogin(ref, password) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST', body: { ref, password },
  });
  if (!res.__demo) return res;

  const clean = String(ref || '').trim().toUpperCase();
  const all = [
    ...readStore('tea_bookings').map((b) => ({ ...b, _kind: 'ticket' })),
    ...readStore('tea_exhibit').map((b) => ({ ...b, _kind: 'exhibitor' })),
  ];
  const b = all.find(
    (x) => x.ref === clean && String(x.password || '') === String(password || '')
  );
  if (!b) {
    return { ok: false, error: 'No booking matches that reference and password. Check your booking confirmation.', demo: true };
  }
  return { ok: true, role: b._kind, ref: b.ref, booking: b, demo: true };
}

export async function adminLogin(user, password) {
  const res = await apiFetch('/api/auth/admin', {
    method: 'POST', body: { user, password },
  });
  if (!res.__demo) {
    if (res.ok && res.token) setToken(res.token);
    return { ...res, demo: false };
  }
  // Demo preview only — production uses the Laravel backend.
  if (String(user || '').trim() === 'admin' && password === 'expo2027') {
    return { ok: true, role: 'admin', ref: 'ADMIN', demo: true };
  }
  return { ok: false, error: 'Invalid admin username or password.', demo: true };
}

export async function adminLogout() {
  try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
  setToken('');
  return { ok: true };
}

/* ---------------- Portal session ---------------- */

const SESSION_KEY = 'tea_portal_session';
export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}
export function setSession(s) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}
export function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

/* ---------------- Portal per-ref key/value state ---------------- */

const pkey = (k, ref) => `tea_portal_${k}_${ref}`;
export function readKey(k, ref, fb) {
  try {
    const v = localStorage.getItem(pkey(k, ref));
    return v === null ? fb : JSON.parse(v);
  } catch { return fb; }
}
export function writeKey(k, ref, val) {
  try { localStorage.setItem(pkey(k, ref), JSON.stringify(val)); } catch {}
}

/* ---------------- Demo seed (mirrors the original static portal) ---------------- */

export function seedDemoIfEmpty() {
  if (!localStorage.getItem('tea_bookings')) {
    writeStore('tea_bookings', [{
      ref: 'TEA-DEMO', password: 'demo123', qty: 1,
      option: { name: 'Pro Trader Pass', price: 999 },
      fields: { name: 'Demo Trader', email: 'demo@tradingexpo.com', phone: '+27 11 000 0000', city: 'Johannesburg' },
      at: new Date().toISOString(),
    }]);
  }
  if (!localStorage.getItem('tea_exhibit')) {
    writeStore('tea_exhibit', [{
      ref: 'EXB27-DEMO', password: 'demo123', qty: 1,
      option: { name: 'Premium 6×3m', price: 0 },
      fields: {
        company: 'Demo Fintech Pvt Ltd', name: 'Demo Exhibitor', email: 'demo@tradingexpo.com',
        phone: '+27 11 000 0001', website: 'https://example.com', category: 'Fintech',
      },
      at: new Date().toISOString(),
    }]);
  }
  if (!localStorage.getItem('tea_announcements')) {
    const now = new Date().toISOString();
    writeStore('tea_announcements', [
      { id: 'a1', title: 'Ticket pricing coming soon', audience: 'all', at: now,
        body: 'Ticket pricing will be announced soon. Reserve your pass now — no payment taken today. Share the expo with your trading community.' },
      { id: 'a2', title: 'Exhibitor manual & booth allocation', audience: 'exhibitor', at: now,
        body: 'The exhibitor manual with setup timings, freight and branding guidelines will be published here. Complete your company profile and team details so we can prepare your badges.' },
      { id: 'a3', title: 'Lucky draw on Day 2', audience: 'ticket', at: now,
        body: 'Every ticket is automatically entered into the Trading Expo lucky draw on Day 2. Be in the hall to win.' },
    ]);
  }
}

/* ---------------- Announcements (portal shape) ---------------- */

export async function announcements(audience) {
  const all = await getAnnouncements();
  if (!audience || audience === 'all') return all;
  return all.filter((a) => a.audience === 'all' || a.audience === audience);
}

export async function publishAnnouncement(item) {
  return saveAnnouncement(item);
}

/* ---------------- Admin bookings (portal shape) ---------------- */

export async function adminBookings() {
  const all = await getAllBookings();
  return all
    .map((b) => ({ ...b, _kind: b._kind || (b.type === 'exhibitor' ? 'exhibitor' : 'ticket') }))
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
}

/* ---------------- CSV export ---------------- */

export function exportCSV(filename, rows) {
  const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(q).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ---------------- Small utilities (mirroring the original portal) ---------------- */

export function uid(p) {
  return (p || 'x') + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
}
export function dstr(iso) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}
export function dtime(iso) {
  try { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
  catch { return ''; }
}
export function daysToEvent() {
  return Math.max(0, Math.ceil((new Date('2027-04-23T09:00:00+05:30') - Date.now()) / 86400000));
}
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------------- Namespace (used by BookingFlow + PortalPage) ---------------- */

export const api = {
  apiHealth,
  createBooking, submitBooking,
  portalLogin, bookingLogin, adminLogin, adminLogout,
  getSession, setSession, clearSession,
  readKey, writeKey,
  seedDemoIfEmpty,
  getAnnouncements, announcements, saveAnnouncement, publishAnnouncement, deleteAnnouncement,
  getAllBookings, adminBookings,
  submitContact, subscribeNewsletter,
  exportCSV,
  money, uid, dstr, dtime, daysToEvent, esc,
};
