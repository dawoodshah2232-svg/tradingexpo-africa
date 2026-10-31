import { useState, useEffect, useRef } from 'react';
import {
  portalLogin, getAnnouncements, saveAnnouncement, deleteAnnouncement, getAllBookings,
  money, exportCSV, uid, dstr, dtime, daysToEvent, apiHealth,
  sendOtpEmail, sendAccountCredentialsEmail,
} from '../lib/api.js';
import {
  seedPortalV2, getSponsors, getSponsor, sponsorLogin, updateSponsor, createSponsor,
  getAdminUsers, addAdminUser, adminUserLogin,
  createOtp, getOtpRecord, clearOtp, resendOtp, verifyOtp,
  getSpeakerApplications, addSpeakerApplication, setSpeakerApplicationStatus,
  getPackages, addPackage, getBooths, getBooth, chooseBooth, addAsset, getAssets,
  publishNotification, notificationsFor, offersFor, addPackageOffer,
  submitPayment, setPaymentStatus, getPayments, getDeletedTickets, recordDeletedTicket,
  ticketHistory, markNotifRead, markAllNotifRead, readNotifIds as portalReadIds, moneyUSD,
} from '../lib/portalStore.js';
import { useAssetBase } from '../lib/theme.jsx';
import ContentAdmin from '../components/ContentAdmin.jsx';

const SESSION_KEY = 'tea_portal_session';

/* ---------- local storage helpers ---------- */
const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const pkey = (k, ref) => 'tea_portal_' + k + '_' + ref;
const matchQ = (q) => (s) => String(s || '').toLowerCase().indexOf(q) >= 0;

/* Random reference / password helpers (crypto-first; refs are not security codes). */
const randChars = (len, chars) => {
  let out = '';
  if (window.crypto && window.crypto.getRandomValues) {
    const buf = new Uint32Array(len);
    window.crypto.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
    return out;
  }
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};
const genPortalRef = (prefix) => prefix + '-' + randChars(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789');
const genStrongPassword = () => randChars(12, 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%');
const emailTaken = (email) => {
  const e = String(email || '').trim().toLowerCase();
  if (!e || e === 'admin') return true;
  if (read('tea_bookings', []).find((b) => String((b.fields && b.fields.email) || '').toLowerCase() === e)) return true;
  if (read('tea_exhibit', []).find((b) => String((b.fields && b.fields.email) || '').toLowerCase() === e)) return true;
  if (getSponsors().find((s) => s.email.toLowerCase() === e)) return true;
  if (getAdminUsers().find((a) => a.user.toLowerCase() === e)) return true;
  return false;
};

/* ---------- booking lookup (local store) ---------- */
const findBookingByRef = (ref) => {
  const clean = String(ref || '').trim().toUpperCase();
  const t = read('tea_bookings', []).find((b) => String(b.ref || '').toUpperCase() === clean);
  if (t) return { ...t, _kind: 'ticket' };
  const e = read('tea_exhibit', []).find((b) => String(b.ref || '').toUpperCase() === clean);
  if (e) return { ...e, _kind: 'exhibitor' };
  return null;
};
const findBooking = (ref, pass) => {
  const b = findBookingByRef(ref);
  if (b && String(b.password || '') === String(pass || '')) return b;
  return null;
};

/* ---------- constants ---------- */
const NAV = {
  admin: [
    ['dashboard', 'Dashboard', '📊'],
    ['bookings', 'Tickets Register', '🎫'],
    ['accounts', 'Accounts', '👥'],
    ['deleted', 'Deleted Leads', '🗑️'],
    ['sponsors', 'Sponsors', '🤝'],
    ['speaker-apps', 'Speaker Applications', '🎤'],
    ['packages', 'Packages & Offers', '📦'],
    ['payments', 'Payments', '💳'],
    ['floorplan', 'Floor Plan', '🗺️'],
    ['reports', 'Reports', '📈'],
    ['announcements', 'Announcements', '📣'],
    ['content', 'Website Content', '🖼️'],
    ['settings', 'Settings', '⚙️'],
  ],
  exhibitor: [
    ['dashboard', 'Dashboard', '📊'],
    ['company', 'Company Profile', '🏢'],
    ['booth', 'Booth Details', '🏗️'],
    ['floorplan', 'Floor Plan', '🗺️'],
    ['assets', 'Brand Assets', '🎨'],
    ['payments', 'Payments', '💳'],
    ['offers', 'My Offers', '🏷️'],
    ['team', 'Team & Badges', '👥'],
    ['leads', 'Lead Capture', '🧲'],
    ['docs', 'Documents', '📁'],
    ['announcements', 'Announcements', '📣'],
  ],
  ticket: [
    ['dashboard', 'Dashboard', '📊'],
    ['tickets', 'My Tickets', '🎫'],
    ['notifications', 'Notifications', '🔔'],
    ['offers', 'Offers', '🎁'],
    ['account', 'My Account', '👤'],
    ['event', 'Event Info', 'ℹ️'],
    ['promos', 'Promotions', '🎁'],
  ],
};
const ROLE_LABEL = { admin: 'Admin Portal', exhibitor: 'Exhibitor Portal', ticket: 'Ticket Holder Portal' };
const VIEW_TITLE = {
  dashboard: ['Dashboard', 'Your event overview at a glance.'],
  bookings: ['Bookings', 'All ticket and exhibitor reservations.'],
  accounts: ['Accounts', 'Every portal account — created by the admin or by signup. Passwords are never shown.'],
  deleted: ['Deleted Leads', 'Cancelled tickets kept as callable leads — nothing is silently erased.'],
  sponsors: ['Sponsors', 'Every sponsor, their package, booth, uploads and payments.'],
  'speaker-apps': ['Speaker Applications', 'Speaker signups awaiting review — applications only, never featured listings.'],
  packages: ['Packages & Offers', 'Brochure packages, new packages, and discounted offers to sponsors.'],
  payments: ['Payments', 'Sponsorship payment records. Tickets are free and never appear here.'],
  floorplan: ['Floor Plan', 'Emperors Palace Centre Court — real plan, 38 booths, pick yours.'],
  assets: ['Brand Assets', 'Logo, booth designs and roll-up artwork for the operations team.'],
  notifications: ['Notifications', 'Announcements, promotions and ticket updates, newest first.'],
  offers: ['Offers', 'Current promotions and package offers for you.'],
  account: ['My Account', 'Your contact details and portal password.'],
  reports: ['Reports', 'Bookings, revenue and trends.'],
  announcements: ['Announcements', 'Publish updates to portal users.'],
  content: ['Website Content', 'Speakers, sponsors, photos and site text — publish straight to the live site.'],
  settings: ['Settings', 'Portal configuration and data tools.'],
  company: ['Company Profile', 'Your exhibitor directory listing.'],
  booth: ['Booth Details', 'Requirements for the operations team.'],
  team: ['Team & Badges', 'Booth staff and badge list.'],
  leads: ['Lead Capture', 'Log booth visitor conversations.'],
  docs: ['Documents', 'Readiness checklist and downloads.'],
  offers: ['My Offers', 'Promotions visitors can redeem.'],
  tickets: ['My Tickets', 'Your passes for the expo.'],
  event: ['Event Info', 'Dates, venue, travel and agenda.'],
  promos: ['Promotions', 'Offers and updates for you.'],
};
const AGENDA_PICKS = [
  ['Day 1 · 10:00', 'Opening keynote: the state of trading in Africa'],
  ['Day 1 · 12:00', 'Panel: brokers, prop firms and the future of retail FX'],
  ['Day 2 · 11:00', 'Live trading sessions with professional traders'],
  ['Day 2 · 15:00', 'Awards ceremony & live trading contest finale'],
];

/* ---------- printable ticket ---------- */
function printTicket(b) {
  const f = b.fields || {};
  const w = window.open('', '_blank', 'width=760,height=940');
  if (!w) return false;
  const escH = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Ticket ' + escH(b.ref) + ' — Traders Expo Johannesburg</title>' +
    '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:#f2f4f7;margin:0;padding:32px}' +
    '.t{max-width:640px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.12)}' +
    '.th{background:#0b1f3a;color:#fff;padding:28px 30px}.th h1{margin:0 0 6px;font-size:22px;letter-spacing:1px}.th p{margin:0;color:#b9c9dd;font-size:14px}' +
    '.tb{padding:28px 30px}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eef1f5;font-size:15px}' +
    '.row span{color:#6b7a90}.row strong{font-weight:700}.qr{margin:24px auto 8px;width:150px;height:150px;border:2px dashed #0b1f3a;border-radius:12px;' +
    'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;letter-spacing:1px}' +
    '.note{text-align:center;color:#6b7a90;font-size:13px;margin:6px 0 0}' +
    '@media print{body{background:#fff;padding:0}.t{box-shadow:none}}</style></head><body>' +
    '<div class="t"><div class="th"><h1>TRADERS EXPO JOHANNESBURG</h1><p>19–20 February 2027 · Emperors Palace, Johannesburg · Organised by ProFX Media FZ-LLC</p></div>' +
    '<div class="tb">' +
    '<div class="row"><span>Pass</span><strong>' + escH(b.option ? b.option.name : '—') + '</strong></div>' +
    '<div class="row"><span>Name</span><strong>' + escH(f.name || f.company || '—') + '</strong></div>' +
    (f.company ? '<div class="row"><span>Company</span><strong>' + escH(f.company) + '</strong></div>' : '') +
    '<div class="row"><span>Booking reference</span><strong>' + escH(b.ref) + '</strong></div>' +
    '<div class="row"><span>Quantity</span><strong>' + escH(b.qty || 1) + '</strong></div>' +
    (f.email ? '<div class="row"><span>Email</span><strong>' + escH(f.email) + '</strong></div>' : '') +
    '<div class="qr">' + escH(b.ref) + '</div>' +
    '<p class="note">Show this reference at registration to collect your badge. Gates open 9:00 AM.</p>' +
    '</div></div>' +
    '<script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script></body></html>');
  w.document.close();
  w.focus();
  return true;
}

/* ================= SHARED UI ================= */
function Kpi({ label, value, sub, cls }) {
  return (
    <div className={'kpi ' + (cls || '')}>
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function BarChart({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="bar-chart">
      {rows.map((r, i) => (
        <div className="bar-col" key={i}>
          <span className="bar-val">{r[1]}</span>
          <div className={'bar ' + (r[2] || '')} style={{ height: Math.max(4, Math.round((r[1] / max) * 100)) + '%' }}></div>
          <span className="bar-lbl">{r[0]}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ rows }) {
  const total = rows.reduce((s, r) => s + r[1], 0) || 1;
  const p1 = Math.round((rows[0][1] / total) * 100);
  return (
    <div className="donut-wrap">
      <div className="donut" data-label={total} style={{ '--p1': p1 + '%', '--p2': '100%' }}></div>
      <div className="legend">
        {rows.map((r, i) => (
          <span key={i}><i className={'lg-' + (r[2] === 'navy' ? 'navy' : r[2] === 'green' ? 'green' : 'gray')}></i>{r[0]} — <strong>{r[1]}</strong></span>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon, children }) {
  return (
    <div className="empty-state">
      <span className="big">{icon || '📭'}</span>
      <p>{children}</p>
    </div>
  );
}

function PromoList({ anns, aud }) {
  const list = (anns || [])
    .filter((a) => a.audience === 'all' || a.audience === aud)
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  if (!list.length) return <EmptyState icon="📣">No announcements yet — check back soon.</EmptyState>;
  return (
    <div>
      {list.map((a) => (
        <div className="promo-card" key={a.id}>
          <span className="promo-date">{dstr(a.at)}</span>
          <h4>{a.title}</h4>
          <p>{a.body}</p>
        </div>
      ))}
    </div>
  );
}

function TicketCard({ b, compact }) {
  const f = b.fields || {};
  return (
    <div className="pticket">
      <div className="pticket-top">
        <div>
          <strong>TRADERS EXPO JOHANNESBURG</strong>
          <span>19–20 February 2027 · Africa · ProFX Media FZ-LLC</span>
        </div>
        <div className="pticket-qr">{b.ref}</div>
      </div>
      <div className="pticket-grid">
        <div><span>Pass</span><strong>{b.option ? b.option.name : '—'}</strong></div>
        <div><span>Name</span><strong>{f.name || f.company || '—'}</strong></div>
        <div><span>Reference</span><strong className="mono">{b.ref}</strong></div>
        <div><span>Quantity</span><strong>{b.qty || 1}</strong></div>
        {!compact && (
          <>
            <div><span>Email</span><strong>{f.email || '—'}</strong></div>
            <div><span>Booked</span><strong>{dstr(b.at)}</strong></div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= ADMIN VIEWS ================= */
function AdminDashboard({ ctx }) {
  const { bookings, anns } = ctx;
  const tickets = bookings.filter((b) => b._kind === 'ticket');
  const exhibs = bookings.filter((b) => b._kind === 'exhibitor');
  const revenue = bookings.reduce((s, b) => s + (b.option && b.option.price ? b.option.price * (b.qty || 1) : 0), 0);
  const teamCount = exhibs.reduce((s, b) => s + read(pkey('team', b.ref), []).length, 0);
  const leadCount = exhibs.reduce((s, b) => s + read(pkey('leads', b.ref), []).length, 0);

  const byType = {};
  bookings.forEach((b) => {
    const k = b.option ? b.option.name : 'Other';
    byType[k] = (byType[k] || 0) + 1;
  });
  const topTypes = Object.keys(byType).sort((a, b2) => byType[b2] - byType[a]).slice(0, 6)
    .map((k, i) => [k.length > 14 ? k.slice(0, 13) + '…' : k, byType[k], i === 0 ? 'navy' : i === 1 ? 'amber' : '']);
  const feed = [...bookings].slice(0, 6);
  /* Reconciled register counts — computed from the same rows the register
     shows, so the numbers can never drift from the lists. */
  const activeTickets = tickets;
  const attendeeEmails = new Set(activeTickets.map((b) => String((b.fields && b.fields.email) || '').toLowerCase()).filter(Boolean));
  const byPass = {};
  activeTickets.forEach((b) => { const k = b.option ? b.option.name : 'Other'; byPass[k] = (byPass[k] || 0) + 1; });
  const deletedCount = getDeletedTickets().length;
  const sponsorCount = getSponsors().length;
  const paymentsConfirmed = getPayments().filter((p) => p.status === 'Confirmed')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <>
      <div className="card">
        <h3>Tickets register — reconciled counts</h3>
        <p className="card-sub">Every number below is counted from the register rows themselves.</p>
        <div className="kpi-grid">
          <Kpi label="Tickets issued (active)" value={activeTickets.length} sub="excludes deleted tickets" />
          <Kpi label="Attendees" value={attendeeEmails.size} sub="unique ticket emails" cls="navy" />
          <Kpi label="Deleted / cancelled" value={deletedCount} sub="kept as callable leads" cls="amber" />
          <Kpi label="Sponsors" value={sponsorCount} sub="portal sponsor accounts" />
          <Kpi label="Payments confirmed" value={moneyUSD(paymentsConfirmed)} sub="sponsorship only — tickets are free" />
        </div>
        <p className="fine">By pass: {Object.keys(byPass).length ? Object.keys(byPass).map((k) => `${k} ×${byPass[k]}`).join(' · ') : 'none yet.'}</p>
        <div className="bnav">
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('bookings')}>Tickets register →</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('deleted')}>Deleted leads →</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('sponsors')}>Sponsors →</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('payments')}>Payments →</button>
        </div>
      </div>
      <div className="kpi-grid">
        <Kpi label="Total bookings" value={bookings.length} sub={`${tickets.length} tickets · ${exhibs.length} exhibitors`} />
        <Kpi label="Gross revenue" value={money(revenue)} sub="booking values (tickets are free)" cls="navy" />
        <Kpi label="Team badges" value={teamCount} sub="registered across exhibitors" cls="amber" />
        <Kpi label="Leads captured" value={leadCount} sub="by exhibitors at booths" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Bookings by pass / booth</h3>
          <p className="card-sub">Most popular selections.</p>
          {topTypes.length ? <BarChart rows={topTypes} /> : <EmptyState>No bookings yet.</EmptyState>}
        </div>
        <div className="card">
          <h3>Ticket vs exhibitor</h3>
          <p className="card-sub">Booking mix.</p>
          <Donut rows={[['Tickets', tickets.length, 'navy'], ['Exhibitors', exhibs.length, 'green']]} />
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Latest bookings</h3>
          <p className="card-sub">Click a row for details.</p>
          <div className="feed">
            {feed.length ? feed.map((b) => (
              <button type="button" className="feed-item feed-btn" key={b.ref} onClick={() => ctx.openDrawer(b.ref)}>
                <span className="feed-dot"></span>
                <div>
                  <strong>{b.ref} — {b.option ? b.option.name : ''}</strong>
                  <p>{(b.fields && (b.fields.company || b.fields.name)) || ''}</p>
                  <span>{dtime(b.at)}</span>
                </div>
              </button>
            )) : <EmptyState>No bookings yet.</EmptyState>}
          </div>
          <div className="bnav"><button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('bookings')}>View all →</button></div>
        </div>
        <div className="card">
          <h3>Announcements</h3>
          <p className="card-sub">Latest published.</p>
          <PromoList anns={anns} aud="all" />
          <div className="bnav"><button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('announcements')}>Manage →</button></div>
        </div>
      </div>
    </>
  );
}

function AdminBookings({ ctx }) {
  const { bookings, search } = ctx;
  const [bq, setBq] = useState('');
  const [kindF, setKindF] = useState('all');
  const [sortK, setSortK] = useState('at');
  const [sortD, setSortD] = useState(-1);
  const [deleting, setDeleting] = useState(null);
  const [reason, setReason] = useState('');

  const q = (bq || search || '').toLowerCase();
  let filtered = bookings.filter((b) => {
    if (kindF !== 'all' && b._kind !== kindF) return false;
    if (!q) return true;
    const f = b.fields || {};
    const mq = matchQ(q);
    return mq(b.ref) || mq(b.option && b.option.name) || mq(f.name) || mq(f.company) || mq(f.email) || mq(f.phone);
  });
  filtered = [...filtered].sort((a, b) => {
    let r = 0;
    if (sortK === 'ref') r = String(a.ref).localeCompare(String(b.ref));
    else if (sortK === 'name') r = String((a.fields || {}).name || (a.fields || {}).company || '').localeCompare(String((b.fields || {}).name || (b.fields || {}).company || ''));
    else if (sortK === 'total') r = ((a.option && a.option.price || 0) * (a.qty || 1)) - ((b.option && b.option.price || 0) * (b.qty || 1));
    else r = String(a.at || '').localeCompare(String(b.at || ''));
    return r * sortD;
  });

  const doExport = () => {
    exportCSV('bookings-export.csv',
      [['Ref', 'Kind', 'Pass/Booth', 'Qty', 'Total', 'Name', 'Company', 'Email', 'Phone', 'Status', 'Booked at']]
        .concat(filtered.map((b) => {
          const f = b.fields || {};
          return [b.ref, b._kind, b.option ? b.option.name : '', b.qty || 1,
            b.option && b.option.price ? b.option.price * (b.qty || 1) : 0,
            f.name || '', f.company || '', f.email || '', f.phone || '', 'Active', b.at || ''];
        })));
    ctx.toast(`Exported ${filtered.length} bookings.`);
  };
  const doDelete = () => {
    if (!deleting || !reason.trim()) { ctx.toast('Please give a reason for deleting this ticket.'); return; }
    const f = deleting.fields || {};
    recordDeletedTicket({
      ref: deleting.ref, pass: deleting.option ? deleting.option.name : '',
      name: f.name || '', email: f.email || '', phone: f.phone || '',
      reason: reason.trim(), deletedAt: new Date().toISOString(), deletedBy: 'Admin',
    });
    write('tea_bookings', read('tea_bookings', []).filter((b) => b.ref !== deleting.ref));
    const ref = deleting.ref;
    setDeleting(null); setReason('');
    ctx.toast(`Ticket ${ref} deleted — kept in Deleted Leads with the reason.`);
    ctx.reloadBookings();
    ctx.refresh();
  };
  useEffect(() => {
    ctx.setActions(<button className="btn btn-ghost btn-sm" type="button" onClick={doExport}>⬇ Export CSV</button>);
    return () => ctx.setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, kindF, q]);

  const th = (label, key) => (
    <th key={key}>
      <button type="button" className="th-sort" onClick={() => {
        if (sortK === key) setSortD((d) => -d);
        else { setSortK(key); setSortD(-1); }
      }}>
        {label} {sortK === key ? (sortD === -1 ? '▼' : '▲') : ''}
      </button>
    </th>
  );

  return (
    <div className="card">
      <h3>Tickets register ({filtered.length})</h3>
      <p className="card-sub">Every ticket with attendee name, mobile, email, pass, reference, issue date and status. Click a row for details. Deleting a ticket always asks for a reason and keeps the record in Deleted Leads.</p>
      <div className="table-tools">
        <input type="search" placeholder="Search ref, name, company, email…" value={bq}
          onChange={(e) => { setBq(e.target.value); ctx.setSearch(''); }} />
        <select value={kindF} onChange={(e) => setKindF(e.target.value)} aria-label="Filter by kind">
          <option value="all">All kinds</option>
          <option value="ticket">Tickets</option>
          <option value="exhibitor">Exhibitors</option>
        </select>
      </div>
      {deleting ? (
        <div className="delete-dialog" role="dialog" aria-label="Delete ticket">
          <h4>Delete ticket {deleting.ref}?</h4>
          <p>{(deleting.fields && (deleting.fields.name || deleting.fields.company)) || ''} · {(deleting.fields && deleting.fields.email) || ''}</p>
          <label>Why are you deleting it? What is the reason?
            <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate booking — attendee re-registered with a new email" />
          </label>
          <p className="fine">The ticket is cancelled, but the person, their contact details and this reason stay in Deleted Leads so the team can call them back.</p>
          <div className="bnav">
            <button className="btn btn-danger" type="button" onClick={doDelete}>Delete ticket</button>
            <button className="btn btn-ghost" type="button" onClick={() => { setDeleting(null); setReason(''); }}>Cancel</button>
          </div>
        </div>
      ) : null}
      {filtered.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              {th('Reference', 'ref')}{th('Name / Company', 'name')}
              <th className="no-sort">Kind</th><th className="no-sort">Pass / Booth</th>
              <th className="no-sort">Email</th><th className="no-sort">Mobile</th>
              <th className="no-sort">Status</th>
              {th('Total', 'total')}{th('Booked', 'at')}
              <th className="no-sort">Action</th>
            </tr></thead>
            <tbody>
              {filtered.map((b) => {
                const f = b.fields || {};
                const total = b.option && b.option.price ? b.option.price * (b.qty || 1) : 0;
                return (
                  <tr key={b.ref} className="row-click" onClick={() => ctx.openDrawer(b.ref)}>
                    <td><strong className="mono">{b.ref}</strong></td>
                    <td>{f.company || f.name || '—'}</td>
                    <td><span className={'pill ' + (b._kind === 'ticket' ? 'pill-ticket' : 'pill-exhibitor')}>{b._kind === 'ticket' ? 'Ticket' : 'Exhibitor'}</span></td>
                    <td>{b.option ? b.option.name : '—'}{b.qty > 1 ? ' ×' + b.qty : ''}</td>
                    <td>{f.email || '—'}</td>
                    <td>{f.phone || '—'}</td>
                    <td><span className="pill">Active</span></td>
                    <td>{total ? money(total) : '—'}</td>
                    <td>{dstr(b.at)}</td>
                    <td>{b._kind === 'ticket' ? (
                      <button type="button" className="mini-btn danger" onClick={(e) => { e.stopPropagation(); setDeleting(b); setReason(''); }}>Delete</button>
                    ) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon="🎫">{bookings.length ? 'No bookings match your filters.' : 'No tickets yet — tickets appear here when the admin creates an account or someone signs up.'}</EmptyState>}
    </div>
  );
}

function SpeakerApplications({ ctx }) {
  const [apps, setApps] = useState(getSpeakerApplications());
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('all');
  const refresh = () => setApps(getSpeakerApplications());
  const shown = apps.filter((a) => {
    if (statusF !== 'all' && a.status !== statusF) return false;
    if (!q) return true;
    const mq = matchQ(q.toLowerCase());
    return mq(a.name) || mq(a.email) || mq(a.topic) || mq(a.bio);
  });
  const setStatus = (id, status) => {
    setSpeakerApplicationStatus(id, status); refresh();
    ctx.toast(status === 'approved' ? 'Application marked approved.' : 'Application marked declined.');
  };
  return (
    <div className="card">
      <h3>Speaker applications ({shown.length})</h3>
      <p className="card-sub">Applications only, awaiting review. Approving marks an application approved — featured speaker listings are curated separately and are not changed here.</p>
      <div className="table-tools">
        <input type="search" placeholder="Search applications…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </div>
      {shown.length ? (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Name</th><th>Topic</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{shown.map((a) => (
            <tr key={a.id}>
              <td><strong>{a.name}</strong><br /><span className="muted">{a.bio}</span></td>
              <td>{a.topic}</td>
              <td>{a.email}<br /><span className="muted">{a.phone}</span></td>
              <td><span className="pill">{a.status}</span></td>
              <td>
                {a.status === 'pending' && (<>
                  <button className="mini-btn" type="button" onClick={() => setStatus(a.id, 'approved')}>Approve</button>{' '}
                  <button className="mini-btn danger" type="button" onClick={() => setStatus(a.id, 'declined')}>Decline</button>
                </>)}
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <EmptyState icon="🎤">No speaker applications yet — applications appear here when someone signs up as a speaker.</EmptyState>}
    </div>
  );
}

function AdminAccounts({ ctx }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('ticket');
  const [pkgId, setPkgId] = useState('');
  const [boothId, setBoothId] = useState('');
  const [msg, setMsg] = useState(null);
  const [creds, setCreds] = useState(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const pkgs = getPackages();
  const booths = getBooths();
  const rows = [
    { kind: 'Admin', name: 'Event Admin', email: 'admin', detail: 'Bootstrap admin', at: '', test: false },
    ...getAdminUsers().map((a) => ({ kind: 'Admin', name: a.name, email: a.user, detail: 'Admin login', at: '', test: false })),
    ...read('tea_bookings', []).map((b) => ({ kind: 'Ticket Holder', name: (b.fields && b.fields.name) || '—', email: (b.fields && b.fields.email) || '—', detail: ((b.option && b.option.name) || 'Ticket') + ' · ' + b.ref, at: b.at || '', test: !!b.test })),
    ...read('tea_exhibit', []).map((b) => ({ kind: 'Exhibitor', name: (b.fields && (b.fields.company || b.fields.name)) || '—', email: (b.fields && b.fields.email) || '—', detail: ((b.option && b.option.name) || 'Booth') + ' · ' + b.ref, at: b.at || '', test: !!b.test })),
    ...getSponsors().map((s) => ({ kind: 'Sponsor', name: s.brand, email: s.email, detail: (s.tier || 'Unassigned') + (s.boothId ? ' · Booth ' + s.boothId : ''), at: s.boothChosenAt || '', test: !!s.test })),
  ];
  const shown = rows.filter((r) => {
    if (roleFilter !== 'all' && r.kind !== roleFilter) return false;
    if (!q) return true;
    const mq = matchQ(q.toLowerCase());
    return mq(r.name) || mq(r.email) || mq(r.kind) || mq(r.detail);
  });
  const submit = async (e) => {
    e.preventDefault();
    setMsg(null); setCreds(null);
    const em = email.trim().toLowerCase();
    if (!name.trim()) { setMsg({ t: 'error', text: 'Full name is required.' }); return; }
    if (!/^\S+@\S+\.\S+$/.test(em)) { setMsg({ t: 'error', text: 'Enter a valid email address.' }); return; }
    if (!mobile.trim()) { setMsg({ t: 'error', text: 'Mobile number is required.' }); return; }
    if (!password || password.length < 8) { setMsg({ t: 'error', text: 'Password must be at least 8 characters.' }); return; }
    if (emailTaken(em)) { setMsg({ t: 'error', text: 'An account with this email already exists.' }); return; }
    let booth = null;
    if (role === 'sponsor' && boothId) {
      booth = getBooth(boothId);
      if (!booth || booth.status !== 'available') { setMsg({ t: 'error', text: `Booth ${boothId} is not available — pick an available booth.` }); return; }
    }
    const pkg = pkgs.find((p) => p.id === pkgId) || null;
    setBusy(true);
    try {
      let boothNote = '';
      if (role === 'ticket') {
        const all = read('tea_bookings', []);
        all.push({ ref: genPortalRef('TEA'), password, qty: 1, option: { name: 'Trader Pass', price: 0 }, fields: { name: name.trim(), email: em, phone: mobile.trim() }, at: new Date().toISOString(), type: 'ticket', createdBy: 'admin' });
        write('tea_bookings', all);
      } else if (role === 'exhibitor') {
        const all = read('tea_exhibit', []);
        all.push({ ref: genPortalRef('EXB27'), password, qty: 1, option: { name: 'Exhibitor', price: 0 }, fields: { company: name.trim(), name: name.trim(), email: em, phone: mobile.trim() }, at: new Date().toISOString(), type: 'exhibitor', createdBy: 'admin' });
        write('tea_exhibit', all);
      } else if (role === 'sponsor') {
        const r = createSponsor({ brand: name.trim(), contact: name.trim(), email: em, phone: mobile.trim(), password, tier: pkg ? pkg.tier : 'Unassigned', packageId: pkg ? pkg.id : null });
        if (!r.ok) { setMsg({ t: 'error', text: r.error }); return; }
        if (booth) {
          const cr = chooseBooth(r.sponsor.id, booth.id);
          if (!cr.ok) boothNote = ' Booth assignment failed: ' + cr.error;
        }
      } else {
        const r = addAdminUser({ user: em, name: name.trim(), password });
        if (!r.ok) { setMsg({ t: 'error', text: r.error }); return; }
      }
      const sent = await sendAccountCredentialsEmail({ email: em, name: name.trim(), password, role });
      if (sent) {
        setMsg({ t: 'ok', text: `Account created and login details emailed to ${em}.${boothNote}` });
      } else {
        setCreds({ email: em, password, role });
        setMsg({ t: 'warn', text: 'Account created, but the email could not be sent (email delivery is still being set up) — share these login details manually.' + boothNote });
      }
      setName(''); setEmail(''); setMobile(''); setPassword(''); setPkgId(''); setBoothId('');
      ctx.reloadBookings(); ctx.refresh();
    } finally { setBusy(false); }
  };
  return (
    <>
      <div className="card">
        <h3>Create account</h3>
        <p className="card-sub">The admin can create any account. It works for login immediately, and appears below and in the tickets register or sponsors list.</p>
        <form className="portal-form" onSubmit={submit}>
          <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="off" required /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="off" required /></label>
          <label>Mobile number<input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+971 …" autoComplete="off" required /></label>
          <label>Password
            <div style={{ display: 'flex', gap: 8 }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" required style={{ marginTop: 0 }} />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowPass((s) => !s)}>{showPass ? 'Hide' : 'Show'}</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPassword(genStrongPassword())}>Generate</button>
            </div>
          </label>
          <label>Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="ticket">Ticket Holder</option>
              <option value="sponsor">Sponsor</option>
              <option value="exhibitor">Exhibitor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {role === 'sponsor' && (
            <>
              <label>Package (optional)
                <select value={pkgId} onChange={(e) => setPkgId(e.target.value)}>
                  <option value="">Unassigned — set later</option>
                  {pkgs.map((p) => (<option key={p.id} value={p.id}>{p.tier} · {p.size} · ${p.price.toLocaleString()}</option>))}
                </select>
              </label>
              <label>Booth (optional)
                <select value={boothId} onChange={(e) => setBoothId(e.target.value)}>
                  <option value="">No booth yet</option>
                  {booths.filter((b) => b.status === 'available').map((b) => (<option key={b.id} value={b.id}>Booth {b.id} · {b.tier} · {b.size}</option>))}
                </select>
              </label>
            </>
          )}
          {role === 'admin' && <p className="fine">Admins log in with their email as the username.</p>}
          {msg && <p className={msg.t === 'error' ? 'portal-error' : 'fine'}>{msg.text}</p>}
          {creds && (
            <div className="card" style={{ marginTop: 12 }}>
              <h3 className="panel-title">Share these login details manually</h3>
              <div className="d-row"><span>Email</span><strong>{creds.email}</strong></div>
              <div className="d-row"><span>Password</span><strong>{creds.password}</strong></div>
              <div className="d-row"><span>Role</span><strong>{creds.role}</strong></div>
              <div className="bnav"><button className="btn btn-ghost btn-sm" type="button" onClick={() => setCreds(null)}>Dismiss</button></div>
            </div>
          )}
          <div className="bnav"><button className="btn btn-primary btn-lg" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button></div>
        </form>
      </div>
      <div className="card">
        <h3>Accounts ({shown.length})</h3>
        <p className="card-sub">Passwords are never shown here.</p>
        <div className="table-tools">
          <input type="search" placeholder="Search accounts…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
            <option value="all">All roles</option>
            <option value="Admin">Admin</option>
            <option value="Ticket Holder">Ticket Holder</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Exhibitor">Exhibitor</option>
          </select>
        </div>
        {shown.length ? (
          <div className="table-wrap"><table className="data-table">
            <thead><tr><th>Name</th><th>Email / username</th><th>Role</th><th>Detail</th><th>Created</th></tr></thead>
            <tbody>{shown.map((r, i) => (
              <tr key={r.kind + '-' + r.email + '-' + i}>
                <td><strong>{r.name}</strong>{r.test ? <span className="pill">Test</span> : null}</td>
                <td>{r.email}</td>
                <td>{r.kind}</td>
                <td>{r.detail}</td>
                <td>{r.at ? dstr(r.at) : '—'}</td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <EmptyState icon="👥">No accounts yet — create one above or share the signup link.</EmptyState>}
      </div>
    </>
  );
}

function AdminReports({ ctx }) {
  const { bookings, search } = ctx;
  const [repQ, setRepQ] = useState('');
  const [range, setRange] = useState('all');
  const q = (repQ || search || '').toLowerCase();
  const rowRef = useRef(null);

  const filtered = bookings.filter((b) => {
    if (range !== 'all') {
      const at = new Date(b.at).getTime();
      const cut = Date.now() - (range === '7d' ? 7 : 30) * 864e5;
      if (!(at >= cut)) return false;
    }
    if (!q) return true;
    const f = b.fields || {};
    const mq = matchQ(q);
    return mq(b.ref) || mq(f.name) || mq(f.company) || mq(f.email);
  });
  const revenue = filtered.reduce((s, b) => s + (b.option && b.option.price ? b.option.price * (b.qty || 1) : 0), 0);
  const tix = filtered.filter((b) => b._kind === 'ticket').length;
  const exh = filtered.filter((b) => b._kind === 'exhibitor').length;

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.getFullYear() + '-' + d.getMonth();
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    const n = filtered.filter((b) => {
      const bd = new Date(b.at);
      return bd.getFullYear() + '-' + bd.getMonth() === key;
    }).length;
    months.push([label, n, i === 0 ? 'navy' : i === 1 ? 'amber' : '']);
  }

  const doExport = () => {
    exportCSV('reports-' + range + '.csv',
      [['Ref', 'Kind', 'Pass/Booth', 'Qty', 'Total (INR)', 'Name', 'Company', 'Email', 'Booked at']]
        .concat(filtered.map((b) => {
          const f = b.fields || {};
          return [b.ref, b._kind, b.option ? b.option.name : '', b.qty || 1,
            b.option && b.option.price ? b.option.price * (b.qty || 1) : 0,
            f.name || '', f.company || '', f.email || '', b.at || ''];
        })));
    ctx.toast('Report exported.');
  };
  useEffect(() => {
    ctx.setActions(<button className="btn btn-ghost btn-sm" type="button" onClick={doExport}>⬇ Export CSV</button>);
    return () => ctx.setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, range, q]);

  return (
    <>
      <div className="kpi-grid">
        <Kpi label="Bookings in view" value={filtered.length} sub={range === 'all' ? 'all time' : 'last ' + range} />
        <Kpi label="Revenue in view" value={money(revenue)} sub="booking values" cls="navy" />
        <Kpi label="Avg. booking value" value={filtered.length ? money(Math.round(revenue / filtered.length)) : money(0)} sub="per booking" cls="amber" />
        <Kpi label="Mix" value={tix + ' / ' + exh} sub="tickets / exhibitors" />
      </div>
      <div className="card">
        <h3>Filters</h3>
        <div className="table-tools">
          <input type="search" placeholder="Search bookings…" value={repQ}
            onChange={(e) => { setRepQ(e.target.value); ctx.setSearch(''); }} ref={rowRef} />
          <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Bookings — last 6 months</h3>
          <BarChart rows={months} />
        </div>
        <div className="card">
          <h3>Ticket vs exhibitor</h3>
          <Donut rows={[['Tickets', tix, 'navy'], ['Exhibitors', exh, 'green']]} />
          <p className="fine">Records in this browser; the real backend will hold the master copy.</p>
        </div>
      </div>
    </>
  );
}

function AdminAnns({ ctx }) {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [aud, setAud] = useState('all');
  const [kind, setKind] = useState('announcement');

  const reload = async () => {
    const items = await getAnnouncements();
    setList((items || []).map((a) => ({ ...a, at: a.at || a.created_at })));
  };
  useEffect(() => { reload(); }, []);

  const publish = async () => {
    if (!title.trim() || !body.trim()) { ctx.toast('Add a title and message first.'); return; }
    const item = { id: uid('a'), title: title.trim(), body: body.trim(), audience: aud, at: new Date().toISOString() };
    await saveAnnouncement(item);
    const cur = read('tea_announcements', []);
    if (!cur.find((a) => a.id === item.id)) write('tea_announcements', [item, ...cur]);
    /* Fan out to the portal notification feed too, so every attendee and
       sponsor sees it in Notifications with read/unread state. */
    publishNotification({
      kind, audience: aud === 'exhibitor' ? 'sponsor' : aud,
      title: title.trim(), body: body.trim(),
    });
    setTitle(''); setBody(''); setAud('all'); setKind('announcement');
    await reload();
    ctx.reloadAnns();
    ctx.toast('Published — it is now in every matching notification feed and offers section.');
    ctx.refresh();
  };
  const remove = async (id) => {
    await deleteAnnouncement(id);
    reload();
    ctx.reloadAnns();
    ctx.toast('Announcement deleted.');
    ctx.refresh();
  };

  return (
    <>
      <div className="card">
        <h3>Publish announcement, promotion or offer</h3>
        <p className="card-sub">Shown to portal users in the chosen audience, plus the notification bell and their Notifications feed. Offers also appear in the Offers section.</p>
        <div className="form-grid">
          <label className="full">Title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Venue announced" /></label>
          <label className="full">Message<textarea rows="3" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the update…"></textarea></label>
          <label>Type
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="announcement">Announcement</option>
              <option value="promotion">Promotion</option>
              <option value="offer">Offer</option>
            </select>
          </label>
          <label>Audience
            <select value={aud} onChange={(e) => setAud(e.target.value)}>
              <option value="all">Everyone</option>
              <option value="ticket">Ticket holders</option>
              <option value="exhibitor">Sponsors / exhibitors</option>
            </select>
          </label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={publish}>📣 Publish</button></div>
      </div>
      <div className="card">
        <h3>Published ({list.length})</h3>
        {list.length ? (
          <div className="ann-list">
            {list.map((a) => (
              <div className="ann-row" key={a.id}>
                <div>
                  <strong>{a.title}</strong>
                  <span className="ann-aud">{a.audience === 'all' ? 'Everyone' : a.audience === 'ticket' ? 'Ticket holders' : 'Exhibitors'} · {dstr(a.at)}</span>
                  <p>{a.body}</p>
                </div>
                <button type="button" className="mini-btn danger" onClick={() => remove(a.id)}>Delete</button>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="📣">Nothing published yet.</EmptyState>}
      </div>
    </>
  );
}

function AdminSettings({ ctx }) {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const healthy = await apiHealth();
        if (!cancelled) setOk(!!healthy);
      } catch { if (!cancelled) setOk(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const exportAll = async () => {
    const all = await getAllBookings();
    exportCSV('all-bookings.csv',
      [['Ref', 'Kind', 'Pass/Booth', 'Qty', 'Total (INR)', 'Name', 'Company', 'Email', 'Phone', 'Booked at']]
        .concat((all || []).map((b) => {
          const f = b.fields || {};
          return [b.ref, b._kind || b.type || '', b.option ? b.option.name : '', b.qty || 1,
            b.option && b.option.price ? b.option.price * (b.qty || 1) : 0,
            f.name || '', f.company || '', f.email || '', f.phone || '', b.at || ''];
        })));
    ctx.toast('All bookings exported.');
  };
  const wipePortal = () => {
    if (!window.confirm('Delete all portal bookings and portal data in this browser?')) return;
    ['tea_bookings', 'tea_exhibit', 'tea_announcements', 'tea_notif_read'].forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
    Object.keys(localStorage).filter((k) => k.indexOf('tea_portal_') === 0).forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
    ctx.toast('Portal data cleared. Reloading…');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <>
      <div className="card">
        <h3>System status</h3>
        <p className="card-sub">How this portal is currently wired.</p>
        <div className="d-row"><span>Backend</span><strong>{ok === null ? 'Checking…' : ok ? 'Connected ✓' : 'Browser storage (interim)'}</strong></div>
        <div className="d-row"><span>Bookings API</span><strong className="mono">/api/bookings</strong></div>
        <div className="d-row"><span>Health endpoint</span><strong className="mono">/api/health</strong></div>
        <div className="d-row"><span>Storage</span><strong>{ok ? 'MySQL (Laravel 10 API)' : 'localStorage (this browser)'}</strong></div>
        <p className="fine">In production these point at the Laravel 10 API + MySQL backend on the event server. This preview runs entirely in the browser so the flow can be reviewed.</p>
      </div>
      <div className="card">
        <h3>Data tools</h3>
        <p className="card-sub">Exports and data tools.</p>
        <div className="bnav">
          <button className="btn btn-ghost" type="button" onClick={exportAll}>⬇ Export all bookings (CSV)</button>
          <button className="btn btn-danger" type="button" onClick={wipePortal}>🗑 Clear portal data</button>
        </div>
      </div>
      <div className="card">
        <h3>Admin access</h3>
        <p className="card-sub">Signed in as <strong>{(ctx.session && ctx.session.ref) || 'ADMIN'}</strong> · ProFX Media FZ-LLC</p>
        <div className="bnav">
          <button className="btn btn-ghost" type="button" onClick={() => { try { sessionStorage.removeItem(SESSION_KEY); } catch {} window.location.reload(); }}>Log out</button>
        </div>
        <p className="fine">Production uses the secure admin login on the Laravel backend.</p>
      </div>
    </>
  );
}

/* ================= EXHIBITOR VIEWS ================= */
function exReadiness(ref) {
  const info = read(pkey('info', ref), {}), booth = read(pkey('booth', ref), {}),
    team = read(pkey('team', ref), []), files = read(pkey('files', ref), []),
    offers = read(pkey('offers', ref), []);
  return [
    ['Reservation confirmed', true, 'Your booth is reserved.'],
    ['Company profile completed', !!(info.pcCompany && info.pcCompany.trim()), 'Add it under Company Profile.'],
    ['Booth requirements submitted', !!booth.pbLoc, 'Tell us about power, internet and AV.'],
    ['Team & badges submitted', team.length > 0, 'Add your booth staff.'],
    ['Logo / brand files uploaded', files.length > 0, 'Upload your logo and posters.'],
    ['Offer published', offers.length > 0, 'Add a visitor offer under My Offers.'],
    ['Payment completed', false, 'Our team will send your payment link.'],
  ];
}

function ExDashboard({ ctx }) {
  const { booking: b, ref } = ctx.session;
  const team = read(pkey('team', ref), []);
  const leads = read(pkey('leads', ref), []);
  const items = exReadiness(ref);
  const done = items.filter((c) => c[1]).length;
  const pct = Math.round((done / items.length) * 100);
  const byInterest = {};
  leads.forEach((l) => { const k = l.interest || 'General'; byInterest[k] = (byInterest[k] || 0) + 1; });
  const intRows = Object.keys(byInterest).map((k) => [k, byInterest[k], 'navy']);
  const feed = [...leads].slice(-5).reverse();

  return (
    <>
      <div className="kpi-grid">
        <Kpi label="Your booth" value={b.option ? b.option.name : '—'} sub={'Ref ' + ref} />
        <Kpi label="Team badges" value={team.length + ' registered'} sub={team.length ? 'ready to print' : 'add your booth staff'} cls="navy" />
        <Kpi label="Leads captured" value={leads.length} sub={leads.length ? 'keep the conversations coming' : 'log booth visitors'} cls="amber" />
        <Kpi label="Readiness" value={pct + '%'} sub={`${done} of ${items.length} steps complete`} />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Readiness checklist</h3>
          <p className="card-sub">Complete these before 23 April 2027.</p>
          <div className="progress"><i style={{ width: pct + '%' }}></i></div>
          <p className="fine">{done} of {items.length} complete</p>
          <div className="bnav"><button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('docs')}>Open Documents →</button></div>
        </div>
        <div className="card">
          <h3>Leads by interest</h3>
          <p className="card-sub">What booth visitors asked about.</p>
          {intRows.length ? <BarChart rows={intRows} /> : <EmptyState icon="🧲">No leads logged yet — add them under Lead Capture.</EmptyState>}
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Recent leads</h3>
          <p className="card-sub">Latest visitor conversations.</p>
          <div className="feed">
            {feed.length ? feed.map((l) => (
              <div className="feed-item" key={l.id}>
                <span className="feed-dot"></span>
                <div>
                  <strong>{l.name}{l.company ? ' · ' + l.company : ''}</strong>
                  <p>{l.interest || 'General enquiry'}</p>
                  <span>{dtime(l.at)}</span>
                </div>
              </div>
            )) : <EmptyState>No leads yet.</EmptyState>}
          </div>
        </div>
        <div className="card">
          <h3>Latest announcements</h3>
          <p className="card-sub">From the organisers.</p>
          <PromoList anns={ctx.anns} aud="exhibitor" />
        </div>
      </div>
    </>
  );
}

function ExCompany({ ctx }) {
  const { ref, booking } = ctx.session;
  const f = booking.fields || {};
  const info = read(pkey('info', ref), {});
  const [v, setV] = useState({
    pcCompany: info.pcCompany || f.company || '',
    pcContact: info.pcContact || f.name || '',
    pcEmail: info.pcEmail || f.email || '',
    pcPhone: info.pcPhone || f.phone || '',
    pcWebsite: info.pcWebsite || f.website || '',
    pcCategory: info.pcCategory || f.category || 'Broker',
    pcAbout: info.pcAbout || '',
  });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const save = () => {
    if (!v.pcCompany.trim()) { ctx.toast("Please enter your company name."); return; }
    write(pkey('info', ref), v) ? ctx.toast('Company profile saved.') : ctx.toast('Could not save — storage is full.');
    ctx.refresh();
  };
  return (
    <div className="card">
      <h3>Company profile</h3>
      <p className="card-sub">This appears in the exhibitor directory and on your fascia branding.</p>
      <div className="form-grid">
        <label>Company name<input value={v.pcCompany} onChange={set('pcCompany')} /></label>
        <label>Contact person<input value={v.pcContact} onChange={set('pcContact')} /></label>
        <label>Work email<input type="email" value={v.pcEmail} onChange={set('pcEmail')} /></label>
        <label>Phone<input value={v.pcPhone} onChange={set('pcPhone')} /></label>
        <label>Website<input value={v.pcWebsite} onChange={set('pcWebsite')} /></label>
        <label>Category
          <select value={v.pcCategory} onChange={set('pcCategory')}>
            {['Broker', 'Fintech', 'Trading Technology', 'Prop Firm', 'Media / Affiliate', 'Education', 'Other'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="full">Company description (50 words for the directory)<textarea rows="3" value={v.pcAbout} onChange={set('pcAbout')}></textarea></label>
      </div>
      <div className="bnav"><button className="btn btn-primary" type="button" onClick={save}>Save Company Profile</button></div>
    </div>
  );
}

function ExBooth({ ctx }) {
  const { ref, booking: b } = ctx.session;
  const booth = read(pkey('booth', ref), {});
  const [v, setV] = useState({
    pbLoc: booth.pbLoc || 'No preference',
    pbPower: booth.pbPower || 'Standard (1 socket)',
    pbNet: booth.pbNet || 'Shared Wi-Fi is fine',
    pbAV: !!booth.pbAV,
    pbStore: !!booth.pbStore,
    pbNotes: booth.pbNotes || '',
  });
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = () => {
    write(pkey('booth', ref), v) ? ctx.toast('Booth requirements saved.') : ctx.toast('Could not save — storage is full.');
    ctx.refresh();
  };
  return (
    <div className="card">
      <h3>Booth details &amp; requirements</h3>
      <p className="card-sub">Our operations team works from these details.</p>
      <div className="form-grid">
        <label>Reserved booth<input value={b.option ? b.option.name : ''} disabled /></label>
        <label>Location preference
          <select value={v.pbLoc} onChange={set('pbLoc')}>
            {['No preference', 'Near entrance', 'Near main stage', 'Near networking lounge', 'Near food court'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Power requirement
          <select value={v.pbPower} onChange={set('pbPower')}>
            {['Standard (1 socket)', 'Extra power', 'Three-phase'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Internet
          <select value={v.pbNet} onChange={set('pbNet')}>
            {['Shared Wi-Fi is fine', 'Dedicated wired line', 'No internet needed'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="check"><input type="checkbox" checked={v.pbAV} onChange={set('pbAV')} /> AV / LED screen needed</label>
        <label className="check"><input type="checkbox" checked={v.pbStore} onChange={set('pbStore')} /> Lockable storage needed</label>
        <label className="full">Extra furniture / special requirements<textarea rows="3" value={v.pbNotes} onChange={set('pbNotes')}></textarea></label>
      </div>
      <div className="bnav"><button className="btn btn-primary" type="button" onClick={save}>Save Booth Requirements</button></div>
    </div>
  );
}

function ExTeam({ ctx }) {
  const { ref } = ctx.session;
  const [teamQ, setTeamQ] = useState('');
  const [nm, setNm] = useState('');
  const [role, setRole] = useState('');
  const [meal, setMeal] = useState('');
  const [size, setSize] = useState('');
  const team = read(pkey('team', ref), []);
  const q = (teamQ || ctx.search || '').toLowerCase();
  const shown = team.filter((m) => {
    if (!q) return true;
    const mq = matchQ(q);
    return mq(m.name) || mq(m.role);
  });
  const add = () => {
    if (!nm.trim()) { ctx.toast("Enter the team member's name."); return; }
    const cur = read(pkey('team', ref), []);
    cur.push({ name: nm.trim(), role: role.trim(), meal, size });
    write(pkey('team', ref), cur) ? ctx.toast(`Team member added (${cur.length} badges).`) : ctx.toast('Could not save — storage is full.');
    setNm(''); setRole(''); setMeal(''); setSize('');
    ctx.refresh();
  };
  const del = (idx) => {
    const cur = read(pkey('team', ref), []);
    cur.splice(idx, 1);
    write(pkey('team', ref), cur);
    ctx.toast('Team member removed.');
    ctx.refresh();
  };
  return (
    <>
      <div className="card">
        <h3>Team &amp; badges ({team.length})</h3>
        <p className="card-sub">Badges are printed from this list — names must match ID.</p>
        <div className="table-tools">
          <input type="search" placeholder="Search team…" value={teamQ} onChange={(e) => { setTeamQ(e.target.value); ctx.setSearch(''); }} />
        </div>
        {shown.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th className="no-sort">Name</th><th className="no-sort">Role / Title</th><th className="no-sort">Meal</th><th className="no-sort">T-shirt</th><th className="no-sort"></th></tr></thead>
              <tbody>
                {shown.map((m) => (
                  <tr key={team.indexOf(m)}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.role || '—'}</td>
                    <td>{m.meal || '—'}</td>
                    <td>{m.size || '—'}</td>
                    <td><div className="row-actions"><button type="button" className="mini-btn danger" onClick={() => del(team.indexOf(m))}>Remove</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon="👥">No team members yet — add your booth staff below.</EmptyState>}
      </div>
      <div className="card">
        <h3>Add team member</h3>
        <div className="form-grid">
          <label>Full name<input placeholder="As on ID" value={nm} onChange={(e) => setNm(e.target.value)} /></label>
          <label>Role / title<input placeholder="e.g. Sales Head" value={role} onChange={(e) => setRole(e.target.value)} /></label>
          <label>Meal preference
            <select value={meal} onChange={(e) => setMeal(e.target.value)}>
              <option value="">Select…</option><option>Veg</option><option>Non-veg</option>
            </select>
          </label>
          <label>T-shirt size
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Select…</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
            </select>
          </label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={add}>+ Add to Team</button></div>
      </div>
    </>
  );
}

const LEAD_INTERESTS = ['General enquiry', 'Platform demo', 'Partnership', 'IB / Affiliate', 'Pricing', 'API / Technology'];

function ExLeads({ ctx }) {
  const { ref } = ctx.session;
  const [leadQ, setLeadQ] = useState('');
  const [f, setF] = useState({ name: '', company: '', email: '', phone: '', interest: LEAD_INTERESTS[0], notes: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const leads = read(pkey('leads', ref), []);
  const q = (leadQ || ctx.search || '').toLowerCase();
  const shown = leads.filter((l) => {
    if (!q) return true;
    const mq = matchQ(q);
    return mq(l.name) || mq(l.company) || mq(l.email) || mq(l.interest);
  }).slice().reverse();
  const weekCount = leads.filter((l) => Date.now() - new Date(l.at).getTime() < 7 * 864e5).length;

  const doExport = () => {
    exportCSV('booth-leads-' + ref + '.csv',
      [['Name', 'Company', 'Email', 'Phone', 'Interest', 'Notes', 'Captured']]
        .concat(leads.map((l) => [l.name, l.company, l.email, l.phone, l.interest, l.notes, l.at])));
    ctx.toast(`Leads exported (${leads.length}).`);
  };
  useEffect(() => {
    ctx.setActions(<button className="btn btn-ghost btn-sm" type="button" onClick={doExport}>⬇ Export CSV</button>);
    return () => ctx.setActions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads.length]);

  const add = () => {
    if (!f.name.trim()) { ctx.toast("Enter the visitor's name."); return; }
    const cur = read(pkey('leads', ref), []);
    cur.push({ id: uid('l'), name: f.name.trim(), company: f.company.trim(), email: f.email.trim(), phone: f.phone.trim(), interest: f.interest, notes: f.notes.trim(), at: new Date().toISOString() });
    write(pkey('leads', ref), cur) ? ctx.toast(`Lead saved (${cur.length} total).`) : ctx.toast('Could not save — storage is full.');
    setF({ name: '', company: '', email: '', phone: '', interest: LEAD_INTERESTS[0], notes: '' });
    ctx.refresh();
  };
  const del = (idx) => {
    const cur = read(pkey('leads', ref), []);
    cur.splice(idx, 1);
    write(pkey('leads', ref), cur);
    ctx.toast('Lead deleted.');
    ctx.refresh();
  };

  return (
    <>
      <div className="kpi-grid">
        <Kpi label="Total leads" value={leads.length} sub="captured at your booth" />
        <Kpi label="This week" value={weekCount + ' new'} sub="last 7 days" cls="navy" />
      </div>
      <div className="card">
        <h3>Capture a lead</h3>
        <p className="card-sub">Log every visitor conversation — scan or type, it takes 20 seconds.</p>
        <div className="form-grid">
          <label>Full name<input placeholder="Visitor name" value={f.name} onChange={set('name')} /></label>
          <label>Company<input placeholder="Company" value={f.company} onChange={set('company')} /></label>
          <label>Email<input type="email" placeholder="name@company.com" value={f.email} onChange={set('email')} /></label>
          <label>Phone<input placeholder="+91 …" value={f.phone} onChange={set('phone')} /></label>
          <label>Interest
            <select value={f.interest} onChange={set('interest')}>
              {LEAD_INTERESTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label>Notes<textarea rows="2" placeholder="What did they want? Follow-up?" value={f.notes} onChange={set('notes')}></textarea></label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={add}>+ Save Lead</button></div>
      </div>
      <div className="card">
        <h3>Lead list ({shown.length})</h3>
        <div className="table-tools">
          <input type="search" placeholder="Search leads…" value={leadQ} onChange={(e) => { setLeadQ(e.target.value); ctx.setSearch(''); }} />
        </div>
        {shown.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th className="no-sort">Name</th><th className="no-sort">Company</th><th className="no-sort">Contact</th><th className="no-sort">Interest</th><th className="no-sort">Captured</th><th className="no-sort"></th></tr></thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.company || '—'}</td>
                    <td>{l.email || l.phone || '—'}</td>
                    <td><span className="pill pill-ticket">{l.interest || 'General'}</span></td>
                    <td>{dstr(l.at)}</td>
                    <td><div className="row-actions"><button type="button" className="mini-btn danger" onClick={() => del(leads.indexOf(l))}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon="🧲">No leads yet — your next customer starts here.</EmptyState>}
      </div>
    </>
  );
}

function ExDocs({ ctx }) {
  const { ref } = ctx.session;
  const ab = useAssetBase();
  const items = exReadiness(ref);
  const done = items.filter((c) => c[1]).length;
  const pct = Math.round((done / items.length) * 100);
  const files = read(pkey('files', ref), []);
  const fileRef = useRef(null);

  const removeFile = (i) => {
    const cur = read(pkey('files', ref), []);
    cur.splice(i, 1);
    write(pkey('files', ref), cur);
    ctx.toast('File removed.');
    ctx.refresh();
  };
  const onFiles = (e) => {
    const queue = Array.from(e.target.files || []);
    if (!queue.length) return;
    const stored = read(pkey('files', ref), []);
    let doneN = 0;
    const check = () => {
      doneN++;
      if (doneN < queue.length) return;
      write(pkey('files', ref), stored) ? ctx.toast('Uploads saved.') : ctx.toast('Could not save — storage is full.');
      if (fileRef.current) fileRef.current.value = '';
      ctx.refresh();
    };
    queue.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) { ctx.toast(file.name + ' is over 2 MB — skipped.'); check(); return; }
      const r = new FileReader();
      r.onload = () => { stored.push({ name: file.name, size: file.size, type: file.type, data: r.result }); check(); };
      r.onerror = check;
      r.readAsDataURL(file);
    });
  };

  return (
    <>
      <div className="card">
        <h3>Readiness checklist</h3>
        <p className="card-sub">{done} of {items.length} complete</p>
        <div className="progress"><i style={{ width: pct + '%' }}></i></div>
        {items.map((c, i) => (
          <div className={'check-row ' + (c[1] ? 'done' : '')} key={i}>
            <span className="check-ico">{c[1] ? '✓' : '○'}</span>
            <div><strong>{c[0]}</strong><span>{c[2]}</span></div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Brand uploads</h3>
          <p className="card-sub">Logo, posters and promo material for the directory, app and on-site branding. Max 2 MB per file.</p>
          <label className="upload-drop">Choose files<input type="file" ref={fileRef} multiple accept="image/*,.pdf" hidden onChange={onFiles} /></label>
          <div className="file-list">
            {!files.length && <p className="muted">No files uploaded yet.</p>}
            {files.map((f2, i) => (
              <div className="file-row" key={i}>
                {(f2.type || '').indexOf('image/') === 0
                  ? <img src={f2.data} alt="" />
                  : <span className="file-ico">PDF</span>}
                <div><strong>{f2.name}</strong><span>{Math.round(f2.size / 1024)} KB</span></div>
                <button type="button" className="mini-btn danger" onClick={() => removeFile(i)}>Remove</button>
              </div>
            ))}
          </div>
          <p className="fine">Files are stored in this browser's portal. On the live platform they upload to the event server automatically.</p>
        </div>
        <div className="card">
          <h3>Event documents</h3>
          <p className="card-sub">Official downloads.</p>
          <div className="doc-list">
            <a className="doc-row" href="exhibit.html#floorplan">
              <span className="file-ico">MAP</span>
              <div><strong>Concept floor plan</strong><span>Exhibition hall layout</span></div>
            </a>
            <div className="doc-row disabled">
              <span className="file-ico">PDF</span>
              <div><strong>Exhibitor manual</strong><span>Coming soon — setup, freight &amp; guidelines</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ExOffers({ ctx }) {
  const { ref } = ctx.session;
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [valid, setValid] = useState('2027-04-24');
  const offers = read(pkey('offers', ref), []);
  const add = () => {
    const t = title.trim();
    if (!t) { ctx.toast('Give your offer a title.'); return; }
    const cur = read(pkey('offers', ref), []);
    cur.push({ id: uid('o'), title: t, details: details.trim(), valid, at: new Date().toISOString() });
    write(pkey('offers', ref), cur) ? ctx.toast('Offer published.') : ctx.toast('Could not save — storage is full.');
    setTitle(''); setDetails(''); setValid('2027-04-24');
    ctx.refresh();
  };
  const del = (idx) => {
    const cur = read(pkey('offers', ref), []);
    cur.splice(idx, 1);
    write(pkey('offers', ref), cur);
    ctx.toast('Offer deleted.');
    ctx.refresh();
  };
  return (
    <>
      <div className="card">
        <h3>Create an offer</h3>
        <p className="card-sub">Visitors see your offers on your booth listing and in the event app.</p>
        <div className="form-grid">
          <label className="full">Offer title<input placeholder="e.g. 20% off Pro accounts for expo visitors" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="full">Details<textarea rows="3" placeholder="Terms, how to redeem, booth number…" value={details} onChange={(e) => setDetails(e.target.value)}></textarea></label>
          <label>Valid until<input type="date" value={valid} onChange={(e) => setValid(e.target.value)} /></label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={add}>+ Publish Offer</button></div>
      </div>
      <div className="card">
        <h3>Your offers ({offers.length})</h3>
        {offers.length ? (
          <div className="ann-list">
            {[...offers].reverse().map((o) => (
              <div className="ann-row" key={o.id}>
                <div>
                  <strong>🏷 {o.title}</strong> <span className="ann-aud">valid until {o.valid || '—'}</span>
                  <p>{o.details}</p>
                </div>
                <button type="button" className="mini-btn danger" onClick={() => del(offers.indexOf(o))}>Delete</button>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="🏷">No offers yet — give visitors a reason to stop by.</EmptyState>}
      </div>
    </>
  );
}

/* ================= TICKET HOLDER VIEWS ================= */
function TicketDashboard({ ctx }) {
  const { booking: b } = ctx.session;
  const anns = ctx.anns.filter((a) => a.audience === 'all' || a.audience === 'ticket');
  const doPrint = () => { if (!printTicket(b)) ctx.toast('Please allow pop-ups to print your ticket.'); };
  return (
    <>
      <div className="kpi-grid">
        <Kpi label="Your pass" value={b.option ? b.option.name : '—'} sub={'Ref ' + b.ref} />
        <Kpi label="Days to event" value={daysToEvent()} sub="19–20 February 2027" cls="navy" />
        <Kpi label="Ticket status" value="Reserved ✓" sub="you're on the list" cls="amber" />
        <Kpi label="Updates" value={anns.length} sub="announcements for you" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Your ticket</h3>
          <p className="card-sub">Download or print it anytime.</p>
          <TicketCard b={b} compact />
          <div className="bnav">
            <button className="btn btn-primary" type="button" onClick={doPrint}>Download / Print Ticket</button>
            <a className="btn btn-ghost" href="agenda.html">View Full Agenda</a>
          </div>
        </div>
        <div className="card">
          <h3>Agenda highlights</h3>
          <p className="card-sub">Don't miss these sessions.</p>
          <div className="feed">
            {AGENDA_PICKS.map((a, i) => (
              <div className="feed-item" key={i}>
                <span className="feed-dot"></span>
                <div><strong>{a[1]}</strong><span>{a[0]}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Latest promotions</h3>
        <p className="card-sub">Offers and updates from the organisers.</p>
        <PromoList anns={ctx.anns} aud="ticket" />
      </div>
    </>
  );
}

function MyTickets({ ctx }) {
  const { booking: b } = ctx.session;
  const f = b.fields || {};
  const others = ctx.bookings.filter((x) =>
    x.ref !== b.ref && x.fields && f.email &&
    String(x.fields.email || '').toLowerCase() === String(f.email).toLowerCase()
  );
  const doPrint = () => { if (!printTicket(b)) ctx.toast('Please allow pop-ups to print your ticket.'); };
  const hist = ticketHistory(b.ref, b.at);
  return (
    <>
      <TicketCard b={b} />
      <div className="bnav">
        <button className="btn btn-primary" type="button" onClick={doPrint}>Download / Print / Re-issue Ticket</button>
        <a className="btn btn-ghost" href="agenda.html">View Agenda</a>
      </div>
      <p className="fine">Your ticket was emailed to <strong>{f.email || 'your email'}</strong> at booking time. You can download or re-issue it here anytime.</p>
      {others.length > 0 && (
        <>
          <h3 className="panel-title">Other bookings on this email</h3>
          {others.map((o) => <TicketCard key={o.ref} b={o} compact />)}
        </>
      )}
      <div className="card">
        <h3>Ticket history — {b.ref}</h3>
        {hist.length ? (
          <div className="feed">{hist.map((h, i) => (
            <div className="feed-item" key={i}><span className="feed-dot"></span><div><strong>{h.status}</strong><p>{h.note || ''}</p><span>{dstr(h.at)}</span></div></div>
          ))}</div>
        ) : <EmptyState icon="🎫">No history yet.</EmptyState>}
      </div>
      <div className="callout">
        <strong>Live trading contest — both days.</strong>
        <span>Full contest rules, entry details and prizes will be announced closer to the event.</span>
      </div>
    </>
  );
}

function EventInfo() {
  return (
    <>
      <div className="grid-3">
        <div className="info-card"><h3>📅 Dates</h3><p>19–20 February 2027, two full days of expo floor, conferences and networking.</p></div>
        <div className="info-card"><h3>📍 Venue</h3><p>Emperors Palace, Centre Court, 64 Jones Road, Kempton Park, Johannesburg — 19–20 February 2027.</p></div>
        <div className="info-card"><h3>🏢 Organiser</h3><p>ProFX Media FZ-LLC. <a href="contact.html">Contact the team →</a></p></div>
      </div>
      <h3 className="panel-title">Travel &amp; stay</h3>
      <div className="grid-3">
        <div className="info-card"><h3>✈️ Getting there</h3><p>Fly into the host city — international and domestic connections. Metro and cab details will be published with the venue.</p></div>
        <div className="info-card"><h3>🏨 Where to stay</h3><p>Partner hotel rates near Emperors Palace will be announced. Book early — February is peak season in Johannesburg.</p></div>
        <div className="info-card"><h3>🎫 At the door</h3><p>Show your booking reference at registration to collect your badge. Gates open 9:00 AM both days.</p></div>
      </div>
      <h3 className="panel-title">Agenda highlights</h3>
      <div className="card">
        <div className="feed">
          {AGENDA_PICKS.map((a, i) => (
            <div className="feed-item" key={i}>
              <span className="feed-dot"></span>
              <div><strong>{a[1]}</strong><span>{a[0]}</span></div>
            </div>
          ))}
        </div>
        <div className="bnav"><a className="btn btn-ghost" href="agenda.html">Full Agenda →</a></div>
      </div>
    </>
  );
}

function AnnsView({ ctx, aud }) {
  return (
    <div className="card">
      <h3>Promotions &amp; updates</h3>
      <p className="card-sub">Everything the organisers publish for {aud === 'ticket' ? 'ticket holders' : 'exhibitors'}.</p>
      <PromoList anns={ctx.anns} aud={aud} />
    </div>
  );
}

/* ================= AEO FAQ (verbatim from portal.html) ================= */
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the Traders Expo Johannesburg portal?', acceptedAnswer: { '@type': 'Answer', text: 'The portal is your personal dashboard for the expo, with separate logins for ticket holders, exhibitors and admins. Ticket holders manage tickets and announcements; exhibitors manage booths, badges, branding and documents; admins oversee bookings and communications. One login gives you everything related to your role.' } },
    { '@type': 'Question', name: 'How do I log in to the portal?', acceptedAnswer: { '@type': 'Answer', text: 'Go to the portal page and choose your role — ticket holder, exhibitor or admin — then enter your booking reference or exhibitor ID and password. Your credentials are issued when you book a ticket or confirm a booth. Keep them safe: you will use the same login before, during and after the event.' } },
    { '@type': 'Question', name: 'I forgot my portal password — what do I do?', acceptedAnswer: { '@type': 'Answer', text: 'Use the password recovery option on the portal login screen, or contact support through the contact page with your booking reference or exhibitor ID. The team will verify your identity and reset your access. To avoid delays, save your credentials securely when you first receive them after booking.' } },
    { '@type': 'Question', name: 'What can ticket holders do in the portal?', acceptedAnswer: { '@type': 'Answer', text: 'Ticket holders can view and download their tickets anytime, check event announcements, see the program schedule, find venue and travel updates, and access exclusive promotions. Your booking reference is your key — log in before the event to make sure your ticket details are correct and ready for entry.' } },
    { '@type': 'Question', name: 'What can exhibitors do in the portal?', acceptedAnswer: { '@type': 'Answer', text: 'Exhibitors get a full workspace: update the company profile and directory listing, manage team members and badges, upload logos and branding assets, track the readiness checklist, download contracts and logistics documents, and receive organizer announcements. It is designed so your whole team can prepare without endless email threads.' } },
    { '@type': 'Question', name: 'What does the admin portal do?', acceptedAnswer: { '@type': 'Answer', text: 'The admin portal gives the organizing team a live overview: ticket bookings and revenue summaries, exhibitor and sponsor records, announcement publishing to all portal users, and booking support tools. It is restricted to authorized ProFX Media FZ-LLC team members and keeps every operational detail in one secure place.' } },
    { '@type': 'Question', name: 'Is my data safe in the portal?', acceptedAnswer: { '@type': 'Answer', text: "Yes. The portal uses secure logins, and your personal and booking data is handled according to the event's privacy policy — used only for event operations like ticketing, entry and communications. Payment processing follows industry security standards. Never share your portal password, and always log out on shared devices." } },
    { '@type': 'Question', name: 'Can I use the portal on my phone?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — the portal is fully mobile-friendly, so you can log in from your phone or tablet as well as your desktop. That is especially handy on event days: pull up your ticket at entry, check announcements and find your way around without printing anything. Just keep your login credentials saved securely.' } },
  ],
};
const FAQS = [
  ['What is the Traders Expo Johannesburg portal?', 'The portal is your personal dashboard for the expo, with separate logins for ticket holders, exhibitors and admins. Ticket holders manage tickets and announcements; exhibitors manage booths, badges, branding and documents; admins oversee bookings and communications. One login gives you everything related to your role.'],
  ['How do I log in to the portal?', 'Go to the portal page and choose your role — ticket holder, exhibitor or admin — then enter your booking reference or exhibitor ID and password. Your credentials are issued when you book a ticket or confirm a booth. Keep them safe: you will use the same login before, during and after the event.'],
  ['I forgot my portal password — what do I do?', 'Use the password recovery option on the portal login screen, or contact support through the contact page with your booking reference or exhibitor ID. The team will verify your identity and reset your access. To avoid delays, save your credentials securely when you first receive them after booking.'],
  ['What can ticket holders do in the portal?', 'Ticket holders can view and download their tickets anytime, check event announcements, see the program schedule, find venue and travel updates, and access exclusive promotions. Your booking reference is your key — log in before the event to make sure your ticket details are correct and ready for entry.'],
  ['What can exhibitors do in the portal?', 'Exhibitors get a full workspace: update the company profile and directory listing, manage team members and badges, upload logos and branding assets, track the readiness checklist, download contracts and logistics documents, and receive organizer announcements. It is designed so your whole team can prepare without endless email threads.'],
  ['What does the admin portal do?', 'The admin portal gives the organizing team a live overview: ticket bookings and revenue summaries, exhibitor and sponsor records, announcement publishing to all portal users, and booking support tools. It is restricted to authorized ProFX Media FZ-LLC team members and keeps every operational detail in one secure place.'],
  ['Is my data safe in the portal?', "Yes. The portal uses secure logins, and your personal and booking data is handled according to the event's privacy policy — used only for event operations like ticketing, entry and communications. Payment processing follows industry security standards. Never share your portal password, and always log out on shared devices."],
  ['Can I use the portal on my phone?', 'Yes — the portal is fully mobile-friendly, so you can log in from your phone or tablet as well as your desktop. That is especially handy on event days: pull up your ticket at entry, check announcements and find your way around without printing anything. Just keep your login credentials saved securely.'],
];
function PortalFaq() {
  return (
    <>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
    </>
  );
}

/* ================= PORTAL V2 VIEWS (attendee / sponsor / admin) ================= */
/* Data lives in src/lib/portalStore.js (localStorage interim layer) and mirrors
   frontend/docs/portal-api-spec.md 1:1. */

function sponsorBooking(sp) {
  if (!sp) return null;
  return {
    ref: sp.id, _kind: 'exhibitor', at: sp.boothChosenAt || new Date().toISOString(),
    option: { name: (sp.tier || 'Sponsor') + ' package', price: 0 },
    fields: { company: sp.brand, name: sp.contact || sp.brand, email: sp.email, phone: sp.phone || '' },
  };
}

function FloorPlanView({ ctx }) {
  const booths = getBooths();
  const sponsors = getSponsors();
  const [sel, setSel] = useState(null);
  const mine = ctx.sponsor;
  const ab = ctx.ab || 'assets/';
  const holder = (b) => sponsors.find((s) => s.boothId === b.id);
  const chosen = sel ? booths.find((b) => b.id === sel) : null;
  const choose = () => {
    if (!mine || !chosen) return;
    const r = chooseBooth(mine.id, chosen.id);
    if (!r.ok) { ctx.toast(r.error); return; }
    ctx.toast(`Booth ${chosen.id} reserved for ${mine.brand} (admin confirms final allocation).`);
    ctx.refresh();
  };
  const TIERS = ['Title', 'Official', 'Exclusive', 'Regional', 'Diamond', 'Elite', 'Gold', 'Silver'];
  return (
    <>
      <div className="card">
        <h3>Emperors Palace, Centre Court — floor plan</h3>
        <p className="card-sub">The organiser's floor plan for 19–20 February 2027. The plan drawing is dated 11 February 2027 — that is the drawing date, not the event date. Booth availability reflects reservations in this portal; the booth numbers, tiers and sizes are from the real plan.</p>
        <p>
          <a className="btn btn-primary btn-sm" href={ab + 'floor-plan-johannesburg-2027.pdf'} target="_blank" rel="noreferrer">⬇ Download full floor plan (PDF)</a>
        </p>
        <img src={ab + 'img/floor-plan.jpg'} alt="Traders Expo Johannesburg floor plan — Emperors Palace Centre Court" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--line)', background: '#fff' }} />
        <p className="fine">Around the hall: Speaker Hall + Speaker Stage · Networking Lounge · Trading Arena · League Area · Trading Contest Floor · LED screens · Charging Station · Entry/Exit doors · Entrance Gates · Exposure Walls.</p>
        <div className="fp-legend">
          <span><i className="fp-dot avail"></i> Available</span>
          <span><i className="fp-dot res"></i> Reserved</span>
          <span><i className="fp-dot sold"></i> Sold</span>
        </div>
        {TIERS.map((tier) => {
          const row = booths.filter((b) => b.tier === tier);
          if (!row.length) return null;
          return (
            <div key={tier}>
              <h3 className="panel-title">{tier} — {row[0].size} m · {moneyUSD(row[0].price)} ({row.length} booths)</h3>
              <div className="fp-grid">
                {row.map((b) => {
                  const h = holder(b);
                  return (
                    <button key={b.id} type="button"
                      className={'fp-booth ' + b.status + (sel === b.id ? ' sel' : '') + (mine && mine.boothId === b.id ? ' mine' : '')}
                      onClick={() => setSel(b.id)} title={`Booth ${b.id} · ${b.tier} · ${b.size} · ${moneyUSD(b.price)} · ${b.status}`}>
                      <strong>{b.id}</strong><span>{b.tier}</span>{h ? <em>{h.brand}</em> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="fine">Green border = your booth. Reserved booths show the holding sponsor; sold booths cannot be chosen. Pick a booth to see its details.</p>
      </div>
      {chosen ? (
        <div className="card">
          <h3>Booth {chosen.id}</h3>
          <p className="card-sub">Full details for this booth.</p>
          <div className="d-row"><span>Tier</span><strong>{chosen.tier}</strong></div>
          <div className="d-row"><span>Size</span><strong>{chosen.size} m</strong></div>
          <div className="d-row"><span>Package price</span><strong>{moneyUSD(chosen.price)}</strong></div>
          <div className="d-row"><span>Availability</span><strong>{chosen.status}</strong></div>
          {holder(chosen) ? <div className="d-row"><span>Held by</span><strong>{holder(chosen).brand}</strong></div> : null}
          {mine ? (
            <div className="bnav">
              <button className="btn btn-primary" type="button" disabled={chosen.status !== 'available'} onClick={choose}>
                {chosen.status === 'available' ? `Choose booth ${chosen.id}` : `Booth ${chosen.id} is ${chosen.status}`}
              </button>
            </div>
          ) : (
            <p className="fine">Admin view — sponsors choose their booth from their own portal. The choice lands on the sponsor record.</p>
          )}
        </div>
      ) : <EmptyState icon="🗺️">Select a booth above to see its details.</EmptyState>}
    </>
  );
}

function DeletedLeads({ ctx }) {
  const list = getDeletedTickets();
  const doExport = () => {
    exportCSV('deleted-leads.csv',
      [['Ref', 'Pass', 'Name', 'Email', 'Phone', 'Reason', 'Deleted at', 'Deleted by']]
        .concat(list.map((d) => [d.ref, d.pass || '', d.name || '', d.email || '', d.phone || '', d.reason || '', d.deletedAt || '', d.deletedBy || ''])));
    ctx.toast(`Exported ${list.length} deleted leads.`);
  };
  return (
    <div className="card">
      <h3>Deleted / cancelled tickets — callable leads ({list.length})</h3>
      <p className="card-sub">Nothing is silently erased. Every deleted ticket stays here with the reason, so the team can call the person back as a lead.</p>
      <div className="bnav"><button className="btn btn-ghost btn-sm" type="button" onClick={doExport}>⬇ Export CSV</button></div>
      {list.length ? (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Ref</th><th>Name</th><th>Email</th><th>Phone</th><th>Pass</th><th>Reason for deletion</th><th>Deleted</th></tr></thead>
          <tbody>{list.map((d) => (
            <tr key={d.ref + d.deletedAt}>
              <td><strong className="mono">{d.ref}</strong></td>
              <td>{d.name || '—'}</td><td>{d.email || '—'}</td><td>{d.phone || '—'}</td>
              <td>{d.pass || '—'}</td><td>{d.reason || '—'}</td><td>{dstr(d.deletedAt)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <EmptyState icon="🗑️">No tickets deleted yet. When admin deletes a ticket with a reason, it appears here — not gone, just cancelled.</EmptyState>}
    </div>
  );
}

function AdminSponsors({ ctx }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const sponsors = getSponsors();
  const payments = getPayments();
  const shown = sponsors.filter((s) => {
    if (!q) return true;
    const mq = matchQ(q.toLowerCase());
    return mq(s.brand) || mq(s.email) || mq(s.tier);
  });
  const selected = sel ? sponsors.find((s) => s.id === sel) : null;
  const assets = selected ? getAssets(selected.id) : [];
  const ab = ctx.ab;
  return (
    <>
      <div className="card">
        <h3>Sponsors ({shown.length})</h3>
        <p className="card-sub">Click a row for uploads, offers and payments.</p>
        <div className="table-tools">
          <input type="search" placeholder="Search sponsors…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {shown.length ? (
          <div className="table-wrap"><table className="data-table">
            <thead><tr><th>Brand</th><th>Tier</th><th>Contact</th><th>Booth</th><th>Assets</th><th>Payments confirmed</th></tr></thead>
            <tbody>{shown.map((s) => {
              const confirmed = payments.filter((p) => p.sponsorId === s.id && p.status === 'Confirmed')
                .reduce((sum, p) => sum + Number(p.amount || 0), 0);
              return (
                <tr key={s.id} className="row-click" onClick={() => setSel(s.id)}>
                  <td><strong>{s.brand}</strong>{s.test ? <span className="pill">Test</span> : null}</td>
                  <td>{s.tier}</td>
                  <td>{s.contact}<br /><span className="muted">{s.email}</span><br /><span className="muted">{s.phone}</span></td>
                  <td>{s.boothId || '—'}</td>
                  <td>{getAssets(s.id).length}</td>
                  <td>{confirmed ? moneyUSD(confirmed) : '—'}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        ) : <EmptyState icon="🤝">{sponsors.length ? 'No sponsors match your search.' : 'No sponsors yet — sponsors appear here when the admin creates an account or a sponsor signs up.'}</EmptyState>}
      </div>
      {selected ? (
        <div className="card">
          <h3>{selected.brand} — detail</h3>
          <p className="card-sub">{selected.note || ''}</p>
          {selected.logo ? (
            <p><img src={(ab || '') + 'img/sponsors/' + selected.logo} alt={selected.brand + ' logo'} style={{ maxHeight: 64, background: '#fff', borderRadius: 8, padding: 6 }} /></p>
          ) : null}
          <div className="d-row"><span>Package tier</span><strong>{selected.tier}</strong></div>
          {selected.interestedPackage ? <div className="d-row"><span>Interested package</span><strong>{selected.interestedPackage}</strong></div> : null}
          <div className="d-row"><span>Booth</span><strong>{selected.boothId || 'Not chosen yet'}</strong></div>
          <div className="d-row"><span>Contact</span><strong>{selected.contact} · {selected.email} · {selected.phone}</strong></div>
          <h3 className="panel-title">Uploaded assets ({assets.length})</h3>
          {assets.length ? (
            <div className="asset-grid">{assets.map((a) => (
              <div className="asset-card" key={a.id}>
                {a.dataUrl && a.mime && a.mime.indexOf('image/') === 0
                  ? <img src={a.dataUrl} alt={a.name} />
                  : <div className="asset-file">📄</div>}
                <strong>{a.kind}</strong><span>{a.name}</span><span className="muted">{dstr(a.at)}</span>
              </div>
            ))}</div>
          ) : <EmptyState icon="🎨">No uploads yet — the sponsor uploads logo, booth designs and roll-up artwork from their portal.</EmptyState>}
        </div>
      ) : null}
    </>
  );
}

function AdminPackages({ ctx }) {
  const [pkgs, setPkgs] = useState(getPackages());
  const [offers, setOffers] = useState(() => (loadStoreSafe().packageOffers || []));
  const [tier, setTier] = useState('');
  const [size, setSize] = useState('3×3');
  const [scheme, setScheme] = useState('Shell scheme');
  const [price, setPrice] = useState('');
  const [benefits, setBenefits] = useState('');
  const [offSponsor, setOffSponsor] = useState('');
  const [offPkg, setOffPkg] = useState('');
  const [offPrice, setOffPrice] = useState('');
  const [offNote, setOffNote] = useState('');
  const sponsors = getSponsors();
  function loadStoreSafe() { try { return JSON.parse(localStorage.getItem('tea_portal_v2')) || {}; } catch { return {}; } }
  const refreshAll = () => { setPkgs(getPackages()); setOffers(loadStoreSafe().packageOffers || []); ctx.refresh(); };
  const add = () => {
    if (!tier.trim() || !price) { ctx.toast('Package name and price are required.'); return; }
    addPackage({ tier: tier.trim(), size, scheme, price: Number(price), benefits: benefits.trim() });
    setTier(''); setPrice(''); setBenefits('');
    refreshAll();
    ctx.toast('Package added — sponsors see it in their portal.');
  };
  const offer = () => {
    if (!offSponsor || !offPkg || !offPrice) { ctx.toast('Choose a sponsor, a package and a discounted price.'); return; }
    const rec = addPackageOffer({ sponsorId: offSponsor, packageId: offPkg, discountedPrice: Number(offPrice), note: offNote.trim() });
    if (!rec) { ctx.toast('Could not create the offer.'); return; }
    setOffPrice(''); setOffNote('');
    refreshAll();
    ctx.toast(`Discounted offer sent to ${rec.sponsor} — they are notified in their portal.`);
  };
  return (
    <>
      <div className="card">
        <h3>Packages ({pkgs.length})</h3>
        <p className="card-sub">Brochure tiers plus anything admin adds. Prices in USD.</p>
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Tier</th><th>Size</th><th>Scheme</th><th>Price</th><th>Benefits</th></tr></thead>
          <tbody>{pkgs.map((p) => (
            <tr key={p.id}><td><strong>{p.tier}</strong>{p.custom ? <span className="pill">Custom</span> : null}</td><td>{p.size} m</td><td>{p.scheme}</td><td>{moneyUSD(p.price)}</td><td>{p.benefits || '—'}</td></tr>
          ))}</tbody>
        </table></div>
      </div>
      <div className="card">
        <h3>Add a package</h3>
        <div className="form-grid">
          <label>Package name<input value={tier} onChange={(e) => setTier(e.target.value)} placeholder="e.g. Community Partner" /></label>
          <label>Size<select value={size} onChange={(e) => setSize(e.target.value)}><option>5×3</option><option>4×3</option><option>3×3</option><option>Other</option></select></label>
          <label>Scheme<select value={scheme} onChange={(e) => setScheme(e.target.value)}><option>Space only</option><option>Shell scheme</option></select></label>
          <label>Price (USD)<input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4000" /></label>
          <label className="full">Benefits<textarea rows="2" value={benefits} onChange={(e) => setBenefits(e.target.value)} placeholder="What the sponsor gets…" /></label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={add}>Add package</button></div>
      </div>
      <div className="card">
        <h3>Offer a package at a discount</h3>
        <p className="card-sub">The sponsor gets a notification in their portal and sees the offer under Offers.</p>
        <div className="form-grid">
          <label>Sponsor<select value={offSponsor} onChange={(e) => setOffSponsor(e.target.value)}><option value="">Choose sponsor…</option>{sponsors.map((s) => <option key={s.id} value={s.id}>{s.brand} ({s.tier})</option>)}</select></label>
          <label>Package<select value={offPkg} onChange={(e) => setOffPkg(e.target.value)}><option value="">Choose package…</option>{pkgs.map((p) => <option key={p.id} value={p.id}>{p.tier} — {moneyUSD(p.price)}</option>)}</select></label>
          <label>Discounted price (USD)<input type="number" min="0" value={offPrice} onChange={(e) => setOffPrice(e.target.value)} placeholder="e.g. 5000" /></label>
          <label className="full">Note to sponsor<textarea rows="2" value={offNote} onChange={(e) => setOffNote(e.target.value)} placeholder="Why this offer, and until when…" /></label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={offer}>Send discounted offer</button></div>
        <h3 className="panel-title">Offers sent ({offers.length})</h3>
        {offers.length ? (
          <div className="feed">{offers.map((o) => (
            <div className="feed-item" key={o.id}><span className="feed-dot"></span><div>
              <strong>{o.sponsor} — {o.package} at {moneyUSD(o.discountedPrice)} (list {moneyUSD(o.listPrice)})</strong>
              <p>{o.note || 'No note.'}</p><span>{dstr(o.at)}</span>
            </div></div>
          ))}</div>
        ) : <EmptyState icon="📦">No discounted offers sent yet.</EmptyState>}
      </div>
    </>
  );
}

function AdminPayments({ ctx }) {
  const [list, setList] = useState(getPayments());
  const confirmed = list.filter((p) => p.status === 'Confirmed').reduce((s, p) => s + Number(p.amount || 0), 0);
  const submitted = list.filter((p) => p.status === 'Submitted').reduce((s, p) => s + Number(p.amount || 0), 0);
  const setStatus = (id, status) => { setPaymentStatus(id, status); setList(getPayments()); ctx.toast(`Payment marked ${status}.`); ctx.refresh(); };
  return (
    <div className="card">
      <h3>Payments ({list.length})</h3>
      <p className="card-sub">Sponsorship payments only. Tickets are free and never appear here. No card details are ever captured — card payments are recorded as provider-link payments.</p>
      <div className="kpi-grid">
        <Kpi label="Confirmed received" value={moneyUSD(confirmed)} sub="reconciles with confirmed rows below" />
        <Kpi label="Awaiting confirmation" value={moneyUSD(submitted)} sub="submitted, not yet confirmed" cls="amber" />
      </div>
      {list.length ? (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Sponsor</th><th>Item</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.sponsor}</strong></td><td>{p.item}</td><td>{moneyUSD(p.amount)}</td><td>{p.method}</td>
              <td><span className="pill">{p.status}</span></td><td>{dstr(p.at)}</td>
              <td>{p.status === 'Submitted' ? (
                <span style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="mini-btn" onClick={() => setStatus(p.id, 'Confirmed')}>Confirm</button>
                  <button type="button" className="mini-btn danger" onClick={() => setStatus(p.id, 'Declined')}>Decline</button>
                </span>
              ) : '—'}</td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <EmptyState icon="💳">No payments recorded yet.</EmptyState>}
    </div>
  );
}

function SponsorDashboard({ ctx }) {
  const sp = ctx.sponsor;
  const pkg = sp.packageId ? getPackages().find((p) => p.id === sp.packageId) : null;
  const booth = sp.boothId ? getBooth(sp.boothId) : null;
  const pays = getPayments(sp.id);
  const confirmed = pays.filter((p) => p.status === 'Confirmed').reduce((s, p) => s + Number(p.amount || 0), 0);
  const { notifs, packageOffers } = offersFor({ role: 'exhibitor', email: sp.email, sponsorId: sp.id });
  const feed = notificationsFor({ role: 'exhibitor', email: sp.email }).slice(0, 3);
  const assets = getAssets(sp.id);
  return (
    <>
      <div className="kpi-grid">
        <Kpi label="Your package" value={sp.tier} sub={pkg ? `${pkg.size} m · ${pkg.scheme}` : 'tier on record'} />
        <Kpi label="Your booth" value={booth ? booth.id : 'Not chosen'} sub={booth ? `${booth.size} m · ${booth.status}` : 'pick one on the floor plan'} cls="navy" />
        <Kpi label="Payments confirmed" value={moneyUSD(confirmed)} sub={`${pays.length} payment record(s)`} cls="amber" />
        <Kpi label="Brand assets" value={assets.length} sub="logo, booth designs, roll-ups" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Your package</h3>
          {pkg ? (
            <><div className="d-row"><span>Tier</span><strong>{pkg.tier}</strong></div>
            <div className="d-row"><span>Stand</span><strong>{pkg.size} m · {pkg.scheme}</strong></div>
            <div className="d-row"><span>List price</span><strong>{moneyUSD(pkg.price)}</strong></div>
            <p>{pkg.benefits}</p></>
          ) : <p className="card-sub">Tier on record: {sp.tier}. Full package benefits are confirmed by the team — ask admin to attach a package.</p>}
          {sp.note ? <p className="fine">{sp.note}</p> : null}
          <div className="bnav"><button className="btn btn-ghost btn-sm" type="button" onClick={() => ctx.go('floorplan')}>Choose / change booth →</button></div>
        </div>
        <div className="card">
          <h3>Discounted offers for you</h3>
          {packageOffers.length ? packageOffers.map((o) => (
            <div key={o.id} className="offer-card">
              <strong>{o.package} — {moneyUSD(o.discountedPrice)}</strong>
              <span>List price {moneyUSD(o.listPrice)} · {dstr(o.at)}</span>
              <p>{o.note || 'No note.'}</p>
            </div>
          )) : <EmptyState icon="🏷️">No discounted package offers right now.</EmptyState>}
          <h3 className="panel-title">Latest updates</h3>
          <div className="feed">{feed.length ? feed.map((n) => (
            <div className="feed-item" key={n.id}><span className="feed-dot"></span><div><strong>{n.title}</strong><p>{n.body}</p><span>{dstr(n.at)}</span></div></div>
          )) : <EmptyState>No updates yet.</EmptyState>}</div>
        </div>
      </div>
      {notifs.length ? (
        <div className="card">
          <h3>Promotions &amp; offers</h3>
          <div className="feed">{notifs.slice(0, 5).map((n) => (
            <div className="feed-item" key={n.id}><span className="feed-dot"></span><div><strong>{n.title}</strong><p>{n.body}</p><span>{dstr(n.at)}</span></div></div>
          ))}</div>
        </div>
      ) : null}
    </>
  );
}

function SponsorAssets({ ctx }) {
  const sp = ctx.sponsor;
  const [list, setList] = useState(getAssets(sp.id));
  const [kind, setKind] = useState('logo');
  const [err, setErr] = useState('');
  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { setErr('File is over 1.5 MB — browser storage limit. Use a smaller file.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      addAsset(sp.id, { kind, name: file.name, mime: file.type || '', dataUrl: reader.result });
      setList(getAssets(sp.id));
      setErr('');
      ctx.toast('Upload saved — admin can see it now.');
      ctx.refresh();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  return (
    <>
      <div className="card">
        <h3>Upload brand assets</h3>
        <p className="card-sub">Your logo, booth designs and roll-up artwork go straight to the admin team. Browser storage caps files at 1.5 MB.</p>
        <div className="form-grid">
          <label>Asset type
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="logo">Logo</option>
              <option value="booth-design">Booth design</option>
              <option value="rollup">Roll-up artwork</option>
            </select>
          </label>
          <label>File<input type="file" accept="image/*,.pdf" onChange={onFile} /></label>
        </div>
        {err ? <p className="portal-error">{err}</p> : null}
      </div>
      <div className="card">
        <h3>Your uploads ({list.length})</h3>
        {list.length ? (
          <div className="asset-grid">{list.map((a) => (
            <div className="asset-card" key={a.id}>
              {a.dataUrl && a.mime && a.mime.indexOf('image/') === 0
                ? <img src={a.dataUrl} alt={a.name} />
                : <div className="asset-file">📄</div>}
              <strong>{a.kind}</strong><span>{a.name}</span><span className="muted">{dstr(a.at)}</span>
            </div>
          ))}</div>
        ) : <EmptyState icon="🎨">Nothing uploaded yet. Your logo and stand artwork live here once you add them.</EmptyState>}
      </div>
    </>
  );
}

function SponsorPayments({ ctx }) {
  const sp = ctx.sponsor;
  const [list, setList] = useState(getPayments(sp.id));
  const [item, setItem] = useState(sp.tier + ' package');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank transfer');
  const [note, setNote] = useState('');
  const items = [sp.tier + ' package', ...getPackages().filter((p) => p.tier !== sp.tier).map((p) => p.tier + ' package')];
  const submit = () => {
    if (!amount || Number(amount) <= 0) { ctx.toast('Enter an amount above zero.'); return; }
    submitPayment({ sponsorId: sp.id, sponsor: sp.brand, item, amount: Number(amount), currency: 'USD', method, note: note.trim() });
    setList(getPayments(sp.id));
    setAmount(''); setNote('');
    ctx.toast('Payment recorded as Submitted — admin confirms it. No card details were entered here.');
    ctx.refresh();
  };
  return (
    <>
      <div className="card">
        <h3>Record a payment</h3>
        <p className="card-sub">Sponsorship payments only — tickets are free and are never paid here. Choose bank transfer, or card via provider: for card, the team sends you a secure provider link. <strong>No card details are ever typed into this portal.</strong></p>
        <div className="form-grid">
          <label>Paying for<select value={item} onChange={(e) => setItem(e.target.value)}>{items.map((i) => <option key={i}>{i}</option>)}<option>Other / add-on</option></select></label>
          <label>Amount (USD)<input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 6500" /></label>
          <label>Method<select value={method} onChange={(e) => setMethod(e.target.value)}><option>Bank transfer</option><option>Card via provider</option></select></label>
          <label className="full">Reference / note<textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bank reference, invoice number…" /></label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={submit}>Submit payment record</button></div>
      </div>
      <div className="card">
        <h3>Your payment records ({list.length})</h3>
        {list.length ? (
          <div className="table-wrap"><table className="data-table">
            <thead><tr><th>Item</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{list.map((p) => (
              <tr key={p.id}><td>{p.item}</td><td>{moneyUSD(p.amount)}</td><td>{p.method}</td><td><span className="pill">{p.status}</span></td><td>{dstr(p.at)}</td></tr>
            ))}</tbody>
          </table></div>
        ) : <EmptyState icon="💳">No payments recorded yet.</EmptyState>}
      </div>
    </>
  );
}

function SponsorOffersView({ ctx }) {
  const sp = ctx.sponsor;
  const { notifs, packageOffers } = offersFor({ role: 'exhibitor', email: sp.email, sponsorId: sp.id });
  return (
    <>
      <div className="card">
        <h3>Discounted package offers for {sp.brand}</h3>
        {packageOffers.length ? packageOffers.map((o) => (
          <div key={o.id} className="offer-card">
            <strong>{o.package} — {moneyUSD(o.discountedPrice)}</strong>
            <span>List price {moneyUSD(o.listPrice)} · {dstr(o.at)}</span>
            <p>{o.note || 'No note.'}</p>
          </div>
        )) : <EmptyState icon="🏷️">No discounted offers right now — admin offers appear here with a notification.</EmptyState>}
      </div>
      <div className="card">
        <h3>Promotions</h3>
        {notifs.length ? (
          <div className="feed">{notifs.map((n) => (
            <div className="feed-item" key={n.id}><span className="feed-dot"></span><div><strong>{n.title}</strong><p>{n.body}</p><span>{dstr(n.at)}</span></div></div>
          ))}</div>
        ) : <EmptyState icon="🎁">No promotions right now.</EmptyState>}
      </div>
      <ExOffers ctx={ctx} />
    </>
  );
}

function NotificationsView({ ctx }) {
  const userKey = ctx.userKey;
  const [readIds, setReadIds] = useState(portalReadIds(userKey));
  const sess = ctx.session;
  const email = (sess.booking && sess.booking.fields && sess.booking.fields.email) || sess.email || '';
  const portal = notificationsFor({ role: sess.role, email }).map((n) => ({ ...n, source: 'portal' }));
  const anns = (ctx.anns || []).filter((a) => a.audience === 'all' || a.audience === sess.role)
    .map((a) => ({ id: a.id, kind: 'announcement', title: a.title, body: a.body, at: a.at, source: 'ann' }));
  const annRead = (() => { try { return JSON.parse(sessionStorage.getItem('tea_notif_read') || '[]'); } catch { return []; } })();
  const all = [...portal, ...anns].sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  const isRead = (n) => (n.source === 'portal' ? readIds.includes(n.id) : annRead.includes(n.id));
  const unread = all.filter((n) => !isRead(n)).length;
  const markOne = (n) => {
    if (n.source === 'portal') { markNotifRead(userKey, n.id); setReadIds(portalReadIds(userKey)); }
    else {
      try {
        const cur = JSON.parse(sessionStorage.getItem('tea_notif_read') || '[]');
        if (!cur.includes(n.id)) sessionStorage.setItem('tea_notif_read', JSON.stringify([...cur, n.id]));
      } catch {}
    }
    ctx.refresh();
  };
  const markAll = () => {
    markAllNotifRead(userKey, portal.map((n) => n.id));
    try { sessionStorage.setItem('tea_notif_read', JSON.stringify(anns.map((a) => a.id))); } catch {}
    setReadIds(portalReadIds(userKey));
    ctx.refresh();
    ctx.toast('All notifications marked read.');
  };
  return (
    <div className="card">
      <h3>Notifications {unread ? `(${unread} unread)` : ''}</h3>
      <p className="card-sub">Admin announcements, promotions, offers and ticket updates — newest first.</p>
      <div className="bnav"><button className="btn btn-ghost btn-sm" type="button" onClick={markAll}>Mark all read</button></div>
      {all.length ? (
        <div className="notif-list">{all.map((n) => (
          <button type="button" key={n.source + n.id} className={'notif-row' + (isRead(n) ? ' read' : '')} onClick={() => markOne(n)}>
            <span className="pill">{n.kind}</span>
            <span className="notif-body"><strong>{n.title}</strong><span>{n.body}</span><em>{dstr(n.at)}</em></span>
            {!isRead(n) ? <span className="notif-unread">New</span> : null}
          </button>
        ))}</div>
      ) : <EmptyState icon="🔔">No notifications yet — admin announcements and offers appear here.</EmptyState>}
    </div>
  );
}

function OffersViewAttendee({ ctx }) {
  const sess = ctx.session;
  const email = (sess.booking && sess.booking.fields && sess.booking.fields.email) || sess.email || '';
  const { notifs } = offersFor({ role: 'ticket', email });
  return (
    <div className="card">
      <h3>Offers &amp; promotions for you</h3>
      <p className="card-sub">Partner promotions and sponsor offers. Your ticket itself is free — nothing here is a ticket charge.</p>
      {notifs.length ? notifs.map((n) => (
        <div key={n.id} className="offer-card">
          <strong>{n.title}</strong><span>{dstr(n.at)}</span><p>{n.body}</p>
        </div>
      )) : <EmptyState icon="🎁">No offers right now — new promotions from the organisers and sponsors appear here.</EmptyState>}
    </div>
  );
}

function AccountView({ ctx }) {
  const b = ctx.session.booking;
  const f = (b && b.fields) || {};
  const [name, setName] = useState(f.name || '');
  const [mobile, setMobile] = useState(f.phone || '');
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [cf, setCf] = useState('');
  const hist = b ? ticketHistory(b.ref, b.at) : [];
  const saveProfile = () => {
    if (!name.trim() || !mobile.trim()) { ctx.toast('Name and mobile number are required.'); return; }
    const all = read('tea_bookings', []);
    const i = all.findIndex((x) => x.ref === b.ref);
    if (i < 0) { ctx.toast('Booking not found in this browser.'); return; }
    all[i] = { ...all[i], fields: { ...all[i].fields, name: name.trim(), phone: mobile.trim() } };
    write('tea_bookings', all);
    ctx.toast('Profile saved.');
    ctx.reloadBookings();
    ctx.refresh();
  };
  const changePass = () => {
    if (String(b.password || '') !== cur) { ctx.toast('Current password does not match.'); return; }
    if (nw.length < 6) { ctx.toast('New password must be at least 6 characters.'); return; }
    if (nw !== cf) { ctx.toast('New passwords do not match.'); return; }
    const all = read('tea_bookings', []);
    const i = all.findIndex((x) => x.ref === b.ref);
    if (i < 0) { ctx.toast('Booking not found in this browser.'); return; }
    all[i] = { ...all[i], password: nw };
    write('tea_bookings', all);
    setCur(''); setNw(''); setCf('');
    ctx.toast('Password changed. Use the new password at your next login.');
    ctx.reloadBookings();
  };
  return (
    <>
      <div className="card">
        <h3>My details</h3>
        <p className="card-sub">Your booked email is your login ID and cannot be changed here — contact the team if your email changes.</p>
        <div className="form-grid">
          <label>Login email (login ID)<input value={f.email || ''} disabled /></label>
          <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Mobile number<input value={mobile} onChange={(e) => setMobile(e.target.value)} /></label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={saveProfile}>Save details</button></div>
      </div>
      <div className="card">
        <h3>Change password</h3>
        <p className="card-sub">In the real backend your new password is confirmed by email. Here it updates this browser only.</p>
        <div className="form-grid">
          <label>Current password<input type="password" value={cur} onChange={(e) => setCur(e.target.value)} /></label>
          <label>New password<input type="password" value={nw} onChange={(e) => setNw(e.target.value)} /></label>
          <label>Confirm new password<input type="password" value={cf} onChange={(e) => setCf(e.target.value)} /></label>
        </div>
        <div className="bnav"><button className="btn btn-primary" type="button" onClick={changePass}>Change password</button></div>
      </div>
      <div className="card">
        <h3>Ticket history — {b ? b.ref : ''}</h3>
        {hist.length ? (
          <div className="feed">{hist.map((h, i) => (
            <div className="feed-item" key={i}><span className="feed-dot"></span><div><strong>{h.status}</strong><p>{h.note || ''}</p><span>{dstr(h.at)}</span></div></div>
          ))}</div>
        ) : <EmptyState icon="🎫">No history yet.</EmptyState>}
      </div>
    </>
  );
}

function SignupForm({ onAuth, onCancel }) {
  const [step, setStep] = useState('form');
  const [type, setType] = useState('trader');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [trades, setTrades] = useState('');
  const [topic, setTopic] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [pkgInterest, setPkgInterest] = useState('');
  const [boothSize, setBoothSize] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sentTo, setSentTo] = useState('');
  useEffect(() => {
    if (step !== 'otp' || cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [step, cooldown]);
  const submitForm = async (e) => {
    e.preventDefault();
    setErr(''); setInfo('');
    const em = email.trim().toLowerCase();
    if (!name.trim()) { setErr('Full name is required.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(em)) { setErr('Enter a valid email address.'); return; }
    if (!mobile.trim()) { setErr('Mobile number is required.'); return; }
    if (!pass || pass.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (pass !== pass2) { setErr('Passwords do not match.'); return; }
    if (type === 'speaker' && (!topic.trim() || !bio.trim())) { setErr('Talk topic and short bio are required for speaker applications.'); return; }
    if ((type === 'sponsor' || type === 'exhibitor') && !company.trim()) { setErr('Company name is required.'); return; }
    if (emailTaken(em)) { setErr('An account with this email already exists — please log in or ask the admin to create your account.'); return; }
    setBusy(true);
    try {
      const r = createOtp(em, { type, name: name.trim(), email: em, mobile: mobile.trim(), password: pass, trades: type === 'trader' ? trades : '', topic: type === 'speaker' ? topic.trim() : '', bio: type === 'speaker' ? bio.trim() : '', company: (type === 'sponsor' || type === 'exhibitor') ? company.trim() : '', pkgInterest: type === 'sponsor' ? pkgInterest : '', boothSize: type === 'exhibitor' ? boothSize : '' });
      if (!r.ok) { setErr(r.error); return; }
      const sent = await sendOtpEmail({ email: em, name: name.trim(), code: r.code });
      if (!sent) { clearOtp(); setErr("We couldn't send the code — email delivery is being set up; please try again or ask the admin to create your account."); return; }
      setSentTo(em); setCooldown(60); setStep('otp');
      setInfo('Code sent — check your inbox.');
    } finally { setBusy(false); }
  };
  const submitCode = async (e) => {
    e.preventDefault();
    setErr('');
    const r = verifyOtp(sentTo, code);
    if (!r.ok) { setErr(r.error); if (r.expired || r.locked) setStep('form'); return; }
    const f = r.form;
    if (f.type === 'sponsor') {
      const pkg = f.pkgInterest ? getPackages().find((p) => p.id === f.pkgInterest) : null;
      const cr = createSponsor({ brand: f.company || f.name, contact: f.name, email: f.email, phone: f.mobile, password: f.password, tier: 'Unassigned', interestedPackageId: pkg ? pkg.id : null, interestedPackage: pkg ? pkg.tier : '', note: 'Signed up via portal — package interest recorded, awaiting confirmation.' });
      if (!cr.ok) { setErr(cr.error); setStep('form'); return; }
      onAuth({ role: 'exhibitor', ref: cr.sponsor.id, sponsorId: cr.sponsor.id, email: cr.sponsor.email, booking: sponsorBooking(cr.sponsor) });
    } else if (f.type === 'exhibitor') {
      const ref = genPortalRef('EXB27');
      const all = read('tea_exhibit', []);
      all.push({ ref, password: f.password, qty: 1, option: { name: 'Exhibitor', price: 0 }, fields: { company: f.company, name: f.name, email: f.email, phone: f.mobile, boothSizeInterest: f.boothSize || '' }, at: new Date().toISOString(), type: 'exhibitor', signup: true });
      write('tea_exhibit', all);
      onAuth({ role: 'exhibitor', ref, email: f.email });
    } else {
      // Trader and speaker both land in the ticket portal (free ticket).
      // A speaker signup additionally records an APPLICATION for admin
      // review — it never lists the person among featured speakers.
      const ref = genPortalRef('TEA');
      const all = read('tea_bookings', []);
      all.push({ ref, password: f.password, qty: 1, option: { name: 'Trader Pass', price: 0 }, fields: { name: f.name, email: f.email, phone: f.mobile, trades: f.trades || '' }, at: new Date().toISOString(), type: 'ticket', signup: true });
      write('tea_bookings', all);
      if (f.type === 'speaker') {
        addSpeakerApplication({ name: f.name, email: f.email, phone: f.mobile, topic: f.topic, bio: f.bio });
        publishNotification({ kind: 'announcement', audience: f.email, title: 'Speaker application received', body: 'Thanks for applying to speak at Traders Expo Johannesburg. The programme team reviews every application and will confirm slots — applying does not guarantee a slot. We will contact you on this email.' });
      }
      onAuth({ role: 'ticket', ref, email: f.email });
    }
  };
  const resend = async () => {
    setErr(''); setInfo('');
    const r = resendOtp();
    if (!r.ok) { setErr(r.error); if (r.waitSec) setCooldown(r.waitSec); return; }
    const sent = await sendOtpEmail({ email: sentTo, name: name.trim(), code: r.code });
    if (!sent) { clearOtp(); setStep('form'); setErr("We couldn't send the code — email delivery is being set up; please try again or ask the admin to create your account."); return; }
    setCooldown(60); setInfo('New code sent — check your inbox.');
  };
  if (step === 'otp') {
    return (
      <form className="portal-form" onSubmit={submitCode}>
        <h3 className="panel-title">Check your email</h3>
        <p className="fine">We sent a 6-digit code to <strong>{sentTo}</strong>. It expires in 10 minutes and stops working after 5 wrong attempts.</p>
        <label>Verification code
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="6-digit code" inputMode="numeric" autoComplete="one-time-code" required />
        </label>
        {err && <p className="portal-error">{err}</p>}
        {info && <p className="fine">{info}</p>}
        <div className="bnav">
          <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Verify & sign in'}</button>
          <button className="btn btn-ghost" type="button" disabled={cooldown > 0} onClick={resend}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</button>
        </div>
        <p className="form-note"><button className="btn btn-ghost btn-sm" type="button" onClick={() => { clearOtp(); setStep('form'); setErr(''); }}>Use a different email</button></p>
      </form>
    );
  }
  return (
    <form className="portal-form" onSubmit={submitForm}>
      <h3 className="panel-title">Sign up</h3>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>I am signing up as</p>
        <div className="role-tabs" role="tablist">
          {['trader', 'speaker', 'sponsor', 'exhibitor'].map((t) => (
            <button key={t} type="button" role="tab" className={'role-tab' + (type === t ? ' active' : '')} onClick={() => { setType(t); setErr(''); }}>
              {t === 'trader' ? 'Trader' : t === 'speaker' ? 'Speaker' : t === 'sponsor' ? 'Sponsor' : 'Exhibitor'}
            </button>
          ))}
        </div>
        <p className="fine">{type === 'trader' ? 'Join us at Emperors Palace, Johannesburg, on 19–20 February 2027. Entry is free — reserve your ticket and walk the floor with 4,000+ traders.' : type === 'speaker' ? 'Take the main stage across two days — keynotes, panels and fireside chats. The programme team reviews every application and confirms slots. Applying does not guarantee a slot.' : type === 'sponsor' ? 'Put your brand at the heart of the expo. Sponsorship packages from $4,000 across a 38-booth floor at Emperors Palace.' : 'Exhibit on the floor at Emperors Palace, Johannesburg, on 19–20 February 2027. Tell us your company and the booth size you are interested in.'}</p>
      </div>
      <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="off" required /></label>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="off" required /></label>
      <label>Mobile number<input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+971 …" autoComplete="off" required /></label>
      {type === 'trader' && (
        <label>What do you trade? (optional)
          <select value={trades} onChange={(e) => setTrades(e.target.value)}>
            <option value="">Prefer not to say</option>
            <option value="Forex">Forex</option>
            <option value="Crypto">Crypto</option>
            <option value="Stocks">Stocks</option>
            <option value="Other">Other</option>
          </select>
        </label>
      )}
      {type === 'speaker' && (
        <>
          <label>Talk topic / title<input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Reading the market in 2027" autoComplete="off" required /></label>
          <label>Short bio<textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few lines about you and your trading background" rows={3} required /></label>
        </>
      )}
      {type === 'sponsor' && (
        <>
          <label>Company name<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company Ltd." autoComplete="off" required /></label>
          <label>Interested package (optional)
            <select value={pkgInterest} onChange={(e) => setPkgInterest(e.target.value)}>
              <option value="">Not sure yet</option>
              {getPackages().map((p) => (<option key={p.id} value={p.id}>{p.tier} · {p.size} · ${p.price.toLocaleString()}</option>))}
            </select>
          </label>
        </>
      )}
      {type === 'exhibitor' && (
        <>
          <label>Company name<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company Ltd." autoComplete="off" required /></label>
          <label>Booth size interest (optional)
            <select value={boothSize} onChange={(e) => setBoothSize(e.target.value)}>
              <option value="">Not sure yet</option>
              <option value="5×3">5×3 m</option>
              <option value="4×3">4×3 m</option>
              <option value="3×3">3×3 m</option>
            </select>
          </label>
        </>
      )}
      <label>Password<input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" required /></label>
      <label>Confirm password<input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" required /></label>
      {err && <p className="portal-error">{err}</p>}
      <p className="fine">Your password is never shown to anyone. We email you a 6-digit code to verify this address.</p>
      <div className="bnav">
        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>{busy ? 'Sending code…' : 'Send verification code'}</button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>Back to log in</button>
      </div>
    </form>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function PortalPage() {
  const ab = useAssetBase();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('dashboard');
  const [actions, setActions] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loginRole, setLoginRole] = useState('exhibitor');
  const [loginError, setLoginError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [anns, setAnns] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const toastTimer = useRef(null);

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
  };
  const refresh = () => setDataVersion((v) => v + 1);

  const reloadAnns = async () => {
    const list = await getAnnouncements();
    setAnns((list || []).map((a) => ({ ...a, at: a.at || a.created_at })));
  };
  const loadBookings = async () => {
    const all = await getAllBookings();
    const tRefs = new Set(read('tea_bookings', []).map((b) => b.ref));
    const eRefs = new Set(read('tea_exhibit', []).map((b) => b.ref));
    const tagged = (all || []).map((b) => ({
      ...b,
      _kind: b._kind || (eRefs.has(b.ref) ? 'exhibitor' : tRefs.has(b.ref) ? 'ticket' : (b.type === 'exhibitor' ? 'exhibitor' : 'ticket')),
    }));
    tagged.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
    setBookings(tagged);
  };

  /* mount: migrate store, restore session */
  useEffect(() => {
    seedPortalV2();
    reloadAnns();
    let sess = null;
    try { sess = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch {}
    if (sess && (sess.role === 'admin' || sess.role === 'ticket' || sess.role === 'exhibitor')) {
      if (sess.role === 'admin') {
        setSession(sess);
        setView('dashboard');
      } else if (sess.sponsorId) {
        const sp = getSponsor(sess.sponsorId);
        if (sp) { sess.booking = sponsorBooking(sp); setSession(sess); setView('dashboard'); }
        else { try { sessionStorage.removeItem(SESSION_KEY); } catch {} }
      } else {
        const rb = findBookingByRef(sess.ref);
        if (rb) { sess.booking = rb; setSession(sess); setView('dashboard'); }
        else { try { sessionStorage.removeItem(SESSION_KEY); } catch {} }
      }
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (session) loadBookings(); }, [session]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen);
    return () => document.body.classList.remove('nav-open');
  }, [navOpen]);
  useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e) => { if (!e.target.closest('.notif-wrap')) setNotifOpen(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [notifOpen]);

  const startSession = (s) => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
    setSession(s);
    setView('dashboard');
    setActions(null);
    toast('Welcome back.');
    window.scrollTo(0, 0);
  };
  const logout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    window.location.reload();
  };
  const go = (v) => {
    setView(v);
    setActions(null);
    setNavOpen(false);
    setDrawer(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doBookingLogin = async (e) => {
    e.preventDefault();
    const ref = document.getElementById('portalRef').value;
    const pass = document.getElementById('portalPass').value;
    setBusy(true);
    try {
      /* Email login: attendees use the email they booked with; sponsors
         use their sponsor-portal email. The booked email is the login ID. */
      if (ref.indexOf('@') >= 0) {
        if (loginRole === 'ticket') {
          const hit = read('tea_bookings', []).find((b) =>
            String((b.fields && b.fields.email) || '').toLowerCase() === ref.trim().toLowerCase()
            && String(b.password || '') === String(pass || ''));
          if (!hit) { setLoginError('No ticket matches that email and password. Check your booking confirmation.'); return; }
          startSession({ role: 'ticket', ref: hit.ref, email: hit.fields.email });
          return;
        }
        const sp = sponsorLogin(ref, pass);
        if (!sp) { setLoginError('No sponsor account matches that email and password.'); return; }
        startSession({ role: 'exhibitor', ref: sp.id, sponsorId: sp.id, email: sp.email, booking: sponsorBooking(sp) });
        return;
      }
      const res = await portalLogin(loginRole, ref, pass);
      if (res.ok) {
        const okRef = res.ref || ref.trim().toUpperCase();
        const okRole = res.role || loginRole;
        if (okRole !== 'admin' && !findBookingByRef(okRef)) {
          setLoginError('That booking is not in this browser yet. Book a ticket or booth first, then log in.');
          return;
        }
        startSession({ role: okRole, ref: okRef });
        return;
      }
      /* fallback — original portal.js behaviour: match stored bookings */
      const b = findBooking(ref, pass);
      if (!b) { setLoginError('No booking matches that reference and password. Check your booking confirmation.'); return; }
      if (b._kind !== loginRole) {
        setLoginError('This reference is a ' + (b._kind === 'ticket' ? 'ticket' : 'booth') +
          ' booking — please use the ' + (b._kind === 'ticket' ? 'Ticket Holder' : 'Exhibitor') + ' tab.');
        return;
      }
      startSession({ role: b._kind, ref: b.ref });
    } finally {
      setBusy(false);
    }
  };
  const doAdminLogin = async (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    setBusy(true);
    try {
      const res = await portalLogin('admin', user, pass);
      if (res.ok) { startSession({ role: 'admin', ref: 'ADMIN' }); return; }
      const created = adminUserLogin(user, pass);
      if (created) { startSession({ role: 'admin', ref: 'ADMIN' }); return; }
      setLoginError('Invalid admin username or password.');
    } finally {
      setBusy(false);
    }
  };

  const openBookingDrawer = (ref) => {
    const b = findBookingByRef(ref) || bookings.find((x) => x.ref === ref);
    if (!b) return;
    const f = b.fields || {};
    const price = b.option && b.option.price ? b.option.price : 0;
    const fieldRows = Object.keys(f).map((k) => (
      <div className="d-row" key={k}><span>{k.charAt(0).toUpperCase() + k.slice(1)}</span><strong>{f[k]}</strong></div>
    ));
    setDrawer({
      title: b.ref,
      sub: (b._kind === 'ticket' ? 'Ticket booking' : 'Exhibitor reservation') + ' · ' + dstr(b.at),
      body: (
        <>
          <div className="d-row"><span>Type</span><strong>{b._kind === 'ticket' ? 'Ticket' : 'Exhibitor'}</strong></div>
          <div className="d-row"><span>Selection</span><strong>{b.option ? b.option.name : '—'}</strong></div>
          <div className="d-row"><span>Quantity</span><strong>{b.qty || 1}</strong></div>
          <div className="d-row"><span>Total</span><strong>{price ? money(price * (b.qty || 1)) : 'On request'}</strong></div>
          <div className="d-row"><span>Booked at</span><strong>{dtime(b.at)}</strong></div>
          <h3 className="panel-title">Contact details</h3>
          {fieldRows.length ? fieldRows : <p className="muted">None captured.</p>}
          <div className="bnav">
            <button className="btn btn-primary" type="button" onClick={() => { if (!printTicket(b)) toast('Please allow pop-ups to print your ticket.'); }}>
              Print / Download Ticket
            </button>
          </div>
          <p className="fine">Passwords are never shown here.</p>
        </>
      ),
    });
  };

  /* ---- context shared with views ---- */
  const sessWithBooking = session && session.role !== 'admin'
    ? { ...session, booking: session.booking || (session.sponsorId ? sponsorBooking(getSponsor(session.sponsorId)) : null) || findBookingByRef(session.ref) }
    : session;
  const userKey = sessWithBooking
    ? (sessWithBooking.role === 'admin' ? 'admin'
      : (sessWithBooking.email || (sessWithBooking.booking && sessWithBooking.booking.fields && sessWithBooking.booking.fields.email) || sessWithBooking.ref))
    : 'guest';
  const ctx = {
    session: sessWithBooking, toast, go, openDrawer: openBookingDrawer,
    refresh, reloadAnns, reloadBookings: loadBookings, setActions, search, setSearch,
    anns, bookings, dataVersion, ab,
    userKey, sponsor: sessWithBooking && sessWithBooking.sponsorId ? getSponsor(sessWithBooking.sponsorId) : null,
  };

  const renderView = () => {
    if (!sessWithBooking) return null;
    const role = sessWithBooking.role;
    if (role !== 'admin' && !sessWithBooking.booking) {
      return (
        <div className="card">
          <h3>Booking not found</h3>
          <p className="card-sub">Your session is stale — the booking for this reference is no longer in this browser.</p>
          <div className="bnav"><button className="btn btn-ghost" type="button" onClick={logout}>Log out</button></div>
        </div>
      );
    }
    if (role === 'admin') {
      if (view === 'bookings') return <AdminBookings ctx={ctx} />;
      if (view === 'accounts') return <AdminAccounts ctx={ctx} />;
      if (view === 'deleted') return <DeletedLeads ctx={ctx} />;
      if (view === 'sponsors') return <AdminSponsors ctx={ctx} />;
      if (view === 'speaker-apps') return <SpeakerApplications ctx={ctx} />;
      if (view === 'packages') return <AdminPackages ctx={ctx} />;
      if (view === 'payments') return <AdminPayments ctx={ctx} />;
      if (view === 'floorplan') return <FloorPlanView ctx={ctx} />;
      if (view === 'reports') return <AdminReports ctx={ctx} />;
      if (view === 'announcements') return <AdminAnns ctx={ctx} />;
      if (view === 'content') return <ContentAdmin />;
      if (view === 'settings') return <AdminSettings ctx={ctx} />;
      return <AdminDashboard ctx={ctx} />;
    }
    if (role === 'exhibitor') {
      if (view === 'company') return <ExCompany ctx={ctx} />;
      if (view === 'booth') return <ExBooth ctx={ctx} />;
      if (view === 'floorplan') return <FloorPlanView ctx={ctx} />;
      if (view === 'assets') return <SponsorAssets ctx={ctx} />;
      if (view === 'payments') return <SponsorPayments ctx={ctx} />;
      if (view === 'team') return <ExTeam ctx={ctx} />;
      if (view === 'leads') return <ExLeads ctx={ctx} />;
      if (view === 'docs') return <ExDocs ctx={ctx} />;
      if (view === 'offers') return <SponsorOffersView ctx={ctx} />;
      if (view === 'announcements') return <AnnsView ctx={ctx} aud="exhibitor" />;
      if (sessWithBooking.sponsorId) return <SponsorDashboard ctx={ctx} />;
      return <ExDashboard ctx={ctx} />;
    }
    if (view === 'tickets') return <MyTickets ctx={ctx} />;
    if (view === 'notifications') return <NotificationsView ctx={ctx} />;
    if (view === 'offers') return <OffersViewAttendee ctx={ctx} />;
    if (view === 'account') return <AccountView ctx={ctx} />;
    if (view === 'event') return <EventInfo />;
    if (view === 'promos') return <AnnsView ctx={ctx} aud="ticket" />;
    return <TicketDashboard ctx={ctx} />;
  };

  /* ---- notifications (announcements + portal notifications, merged) ---- */
  const readNotifIds = () => {
    try { return JSON.parse(sessionStorage.getItem('tea_notif_read') || '[]'); } catch { return []; }
  };
  const audienceAnns = sessWithBooking
    ? anns.filter((a) => sessWithBooking.role === 'admin' || a.audience === 'all' || a.audience === sessWithBooking.role)
    : [];
  const bellEmail = sessWithBooking
    ? (sessWithBooking.email || (sessWithBooking.booking && sessWithBooking.booking.fields && sessWithBooking.booking.fields.email) || '')
    : '';
  const bellPortal = sessWithBooking
    ? notificationsFor({ role: sessWithBooking.role, email: bellEmail })
    : [];
  const bellPortalUnread = bellPortal.filter((n) => portalReadIds(userKey).indexOf(n.id) < 0).length;
  const unread = audienceAnns.filter((a) => readNotifIds().indexOf(a.id) < 0).length + bellPortalUnread;
  const markAllRead = (e) => {
    e.stopPropagation();
    try { sessionStorage.setItem('tea_notif_read', JSON.stringify(audienceAnns.map((a) => a.id))); } catch {}
    markAllNotifRead(userKey, bellPortal.map((n) => n.id));
    setNotifOpen(false);
    refresh();
  };

  /* ---- derived identity ---- */
  let userName = '—', refLabel = '—';
  if (sessWithBooking) {
    if (sessWithBooking.role === 'admin') { userName = 'Event Admin'; refLabel = 'ProFX Media'; }
    else {
      const f = (sessWithBooking.booking && sessWithBooking.booking.fields) || {};
      userName = f.company || f.name || sessWithBooking.ref;
      refLabel = sessWithBooking.ref;
    }
  }
  const avatar = (userName || '?').trim().charAt(0).toUpperCase();
  const roleBadge = sessWithBooking
    ? (sessWithBooking.role === 'admin' ? 'Admin' : sessWithBooking.role === 'exhibitor' ? 'Exhibitor' : 'Ticket Holder')
    : 'Portal';
  const [pdTitle, pdSub] = VIEW_TITLE[view] || ['Portal', ''];
  const pdRole = sessWithBooking ? ROLE_LABEL[sessWithBooking.role] || 'Portal' : 'Portal';

  if (!ready) return null;

  return (
    <>
      {!sessWithBooking ? (
        /* ============ LOGIN VIEW ============ */
        <div id="portalLogin" className="login-view">
          <aside className="login-brand">
            <div className="login-brand-inner">
              <img className="login-logo" src={ab + 'logo-jhb-light.png'} alt="Traders Expo Johannesburg" />
              <p className="login-eyebrow">ProFX Media FZ-LLC presents</p>
              <h1>Traders Expo Johannesburg</h1>
              <p className="login-dates">19–20 February 2027 · Johannesburg</p>
              <div className="login-stats">
                <div><strong>4,000+</strong><span>Expected traders</span></div>
                <div><strong>2</strong><span>Days</span></div>
                <div><strong>18</strong><span>Featured speakers</span></div>
              </div>
              <p className="login-demo-note">Ticket holders and sponsors: sign in with the email and password from your booking, or sign up below.</p>
            </div>
          </aside>

          <div className="login-main">
            <div className="login-card">
              <p className="login-card-eyebrow">Event Portal</p>
              <h2>Welcome back</h2>
              <p className="login-card-sub">Choose your role to sign in to your dashboard.</p>

              <div className="role-tabs" role="tablist">
                {['admin', 'exhibitor', 'ticket'].map((r) => (
                  <button
                    key={r} type="button" role="tab"
                    className={'role-tab' + (loginRole === r ? ' active' : '')}
                    onClick={() => { setLoginRole(r); setLoginError(''); }}
                  >
                    {r === 'admin' ? 'Admin' : r === 'exhibitor' ? 'Exhibitor' : 'Ticket Holder'}
                  </button>
                ))}
              </div>

              {loginRole !== 'admin' ? (
                <>
                <form id="bookingForm" className="portal-form" onSubmit={doBookingLogin}>
                  <label>Email or booking reference
                    <input id="portalRef" type="text" placeholder={loginRole === 'ticket' ? 'e.g. your email or TEA-AB12CD' : 'e.g. your email or EXB27-AB12CD'} autoComplete="off" required />
                  </label>
                  <label>Password
                    <input id="portalPass" type="password" placeholder="Shown on your booking confirmation" autoComplete="current-password" required />
                  </label>
                  <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>Log In to Dashboard</button>
                  <p className="form-note">Ticket holders: your booked email is your login ID — the password was shown when you booked and emailed with your ticket. New here? Sign up below, <a href="tickets.html">book a ticket</a> or <a href="exhibit.html">reserve a booth</a>.</p>
                </form>
                {!showSignup ? (
                  <p className="form-note" style={{ textAlign: 'center' }}>Don't have an account? <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowSignup(true)}>Sign up</button></p>
                ) : (
                  <SignupForm onAuth={startSession} onCancel={() => setShowSignup(false)} />
                )}
                </>
              ) : (
                <form id="adminForm" className="portal-form" onSubmit={doAdminLogin}>
                  <label>Admin username
                    <input id="adminUser" type="text" placeholder="admin" autoComplete="username" required />
                  </label>
                  <label>Admin password
                    <input id="adminPass" type="password" placeholder="••••••" autoComplete="current-password" required />
                  </label>
                  <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>Log In as Admin</button>
                </form>
              )}

              {loginError && <p id="portalError" className="portal-error">{loginError}</p>}

              <p className="login-foot" style={{ fontSize: 13, color: 'var(--muted)' }}>Accounts are created by the admin or by signing up above. This portal currently stores accounts in this browser; email delivery uses the FormSubmit path until the Laravel backend lands. No password is ever shown here.</p>
            </div>
            <p className="login-foot"><a href="index.html">← Back to website</a></p>
          </div>
        </div>
      ) : (
        /* ============ APP SHELL ============ */
        <div id="portalDash" className="app">
          <div id="sideScrim" className="side-scrim" hidden={!navOpen} onClick={() => setNavOpen(false)}></div>
          <aside id="sideBar" className="sidebar">
            <div className="side-top">
              <img src={ab + 'logo-light-compact.png'} alt="Traders Expo" className="side-logo" />
              <span className="role-badge" id="sideRole">{roleBadge}</span>
            </div>
            <nav className="side-nav" id="sideNav">
              {(NAV[sessWithBooking.role] || []).map((item) => (
                <button
                  key={item[0]} type="button"
                  className={'side-link' + (view === item[0] ? ' active' : '')}
                  onClick={() => go(item[0])}
                >
                  <span className="ico">{item[2]}</span><span>{item[1]}</span>
                </button>
              ))}
            </nav>
            <div className="side-foot">
              <div className="side-user" id="sideUser">
                <span className="avatar" id="sideAvatar">{avatar}</span>
                <div><strong id="sideUserName">{userName}</strong><span id="sideUserRef">{refLabel}</span></div>
              </div>
            </div>
          </aside>

          <div className="app-main">
            <header className="topbar">
              <button className="icon-btn menu-btn" type="button" aria-label="Open menu" onClick={() => setNavOpen(true)}>☰</button>
              <div className="search-wrap">
                <input type="search" placeholder="Search bookings, leads, team…" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="notif-wrap">
                <button className="icon-btn" type="button" aria-label="Notifications" onClick={(e) => { e.stopPropagation(); setNotifOpen((o) => !o); }}>
                  🔔{unread > 0 && <span className="notif-dot" id="notifDot"></span>}
                </button>
                {notifOpen && (
                  <div className="notif-drop" id="notifDrop">
                    <div className="notif-head"><span>Notifications</span><button type="button" onClick={markAllRead}>Mark all read</button></div>
                    {bellPortal.slice(0, 4).map((a) => (
                      <div className="notif-item" key={'p' + a.id}>
                        <strong>{a.title}</strong>
                        <p>{a.body.slice(0, 120)}{a.body.length > 120 ? '…' : ''}</p>
                        <span>{dstr(a.at)}</span>
                      </div>
                    ))}
                    {audienceAnns.length ? audienceAnns.slice(0, 8).map((a) => (
                      <div className="notif-item" key={a.id}>
                        <strong>{a.title}</strong>
                        <p>{a.body.slice(0, 120)}{a.body.length > 120 ? '…' : ''}</p>
                        <span>{dstr(a.at)}</span>
                      </div>
                    )) : (bellPortal.length ? null : <div className="notif-item"><p>No notifications yet.</p></div>)}
                  </div>
                )}
              </div>
              <div className="user-chip" id="userChip"><span className="avatar" id="topAvatar">{avatar}</span><span id="topUserName">{userName}</span></div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={logout}>Log out</button>
            </header>

            <div className="page-head">
              <div>
                <p className="eyebrow" id="pdRole">{pdRole}</p>
                <h1 id="pdTitle">{pdTitle}</h1>
                <p className="page-sub" id="pdSub">{pdSub}</p>
              </div>
              <div className="page-actions" id="pageActions">{actions}</div>
            </div>

            <main id="portalPanels" className="content" key={view + ':' + dataVersion}>
              {renderView()}
            </main>
            <p className="fine" style={{ padding: '0 20px 24px' }}>
              How it works — accounts are created by the admin or by signing up with email verification. This portal currently stores accounts in this browser (localStorage); email delivery uses the FormSubmit path until the real backend lands. The Laravel 10 API + MySQL backend in <span className="mono">frontend/docs/portal-api-spec.md</span> will replace this storage with real emailed passwords, notifications and payment records. No password or key is ever committed to the repo.
            </p>
          </div>
        </div>
      )}

      {/* ============ DRAWER ============ */}
      {drawer && (
        <div id="drawerWrap" className="drawer-wrap">
          <div className="drawer-scrim" id="drawerScrim" onClick={() => setDrawer(null)}></div>
          <aside className="drawer" id="drawer" role="dialog" aria-label="Details">
            <button className="icon-btn drawer-close" type="button" aria-label="Close" onClick={() => setDrawer(null)}>×</button>
            <h2>{drawer.title}</h2>
            <p className="muted" style={{ margin: '4px 0 16px', fontSize: 13 }}>{drawer.sub}</p>
            {drawer.body}
          </aside>
        </div>
      )}

      <div id="portalToast" className={'portal-toast' + (toastMsg ? ' show' : '')} role="status">{toastMsg}</div>

      <PortalFaq />
    </>
  );
}
