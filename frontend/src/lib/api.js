// API client for the Traders Expo Johannesburg Laravel backend.
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

/* Free-ticket email for the static site (no Laravel backend on GitHub Pages).
   Sends the reservation to the organiser inbox and a plain-text ticket to the
   attendee via FormSubmit autoresponse. Never throws — a failed send only
   flips emailSent so the confirmation can say so honestly. */
async function sendFreeTicketEmail(rec) {
  const ticketText = [
    'Your free ticket — Traders Expo Johannesburg',
    '',
    `Name: ${rec.fields.name}`,
    `Ticket reference: ${rec.ref}`,
    `Pass: ${rec.option.name}`,
    'Dates: 19–20 February 2027',
    'Venue: Emperors Palace, Centre Court, 64 Jones Road, Kempton Park, Johannesburg',
    '',
    'Show this email or your ticket reference at entry. Your ticket is free and valid for both days.',
    '',
    'Organised by ProFX Media FZ-LLC · info@profxmedia.com · +971 58 884 5033',
  ].join('\n');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch('https://formsubmit.co/ajax/info@profxmedia.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: rec.fields.name, email: rec.fields.email, phone: rec.fields.phone,
        pass: rec.option.name, reference: rec.ref,
        _subject: `Your free Traders Expo Johannesburg ticket — ${rec.ref}`,
        _template: 'table', _captcha: 'false', _autoresponse: ticketText,
      }),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) return false;
    if ('success' in data) return data.success === true || data.success === 'true';
    return true;
  } catch { return false; } finally { clearTimeout(timer); }
}

/* Interim email path for portal accounts (same FormSubmit mechanism as the
   ticket email). The code / credentials travel ONLY inside _autoresponse
   to the user's own inbox. Never throws — returns false on any failure so
   the UI can say so honestly instead of pretending an email was sent. */
async function formSubmitPost(fields) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch('https://formsubmit.co/ajax/info@profxmedia.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _template: 'table', _captcha: 'false', ...fields }),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data) return false;
    if ('success' in data) return data.success === true || data.success === 'true';
    return true;
  } catch { return false; } finally { clearTimeout(timer); }
}

export async function sendOtpEmail({ email, name, code }) {
  return formSubmitPost({
    name: name || '', email,
    _subject: 'Your Traders Expo Johannesburg portal signup code',
    _autoresponse: [
      'Your Traders Expo Johannesburg signup code',
      '',
      `Hi ${name || ''},`,
      '',
      `Your verification code is: ${code}`,
      '',
      'Enter this code in the portal within 10 minutes to finish signing up. If you did not request this, ignore this email.',
      '',
      'Traders Expo Johannesburg · 19–20 February 2027 · Emperors Palace, Johannesburg',
    ].join('\n'),
  });
}

export async function sendAccountCredentialsEmail({ email, name, password, role }) {
  const roleLabel = role === 'sponsor' ? 'Sponsor' : role === 'exhibitor' ? 'Exhibitor' : role === 'admin' ? 'Admin' : 'Ticket Holder';
  return formSubmitPost({
    name: name || '', email,
    _subject: `Your Traders Expo Johannesburg portal login (${roleLabel})`,
    _autoresponse: [
      'Your Traders Expo Johannesburg portal login',
      '',
      `Hi ${name || ''},`,
      '',
      'An account has been created for you on the Traders Expo Johannesburg portal:',
      '',
      `Login email: ${email}`,
      `Password: ${password}`,
      `Role: ${roleLabel}`,
      '',
      'Log in on the event portal with the email and password above. You can change your password after logging in.',
      '',
      'Traders Expo Johannesburg · 19–20 February 2027 · Emperors Palace, Johannesburg',
    ].join('\n'),
  });
}

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
  let emailSent;
  if (payload.type === 'ticket') emailSent = await sendFreeTicketEmail(rec);
  return { ok: true, ref: rec.ref, password: rec.password, demo: true, emailSent };
}

/* ---------------- Portal auth ---------------- */

const DEMO_LOGINS = [
  { role: 'admin', ref: 'admin', password: 'expo2027' },
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
  getAnnouncements, announcements, saveAnnouncement, publishAnnouncement, deleteAnnouncement,
  getAllBookings, adminBookings,
  submitContact, subscribeNewsletter,
  exportCSV,
  money, uid, dstr, dtime, daysToEvent, esc,
};
