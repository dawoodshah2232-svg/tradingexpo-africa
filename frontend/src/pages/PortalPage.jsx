import { useState, useEffect, useRef } from 'react';
import {
  portalLogin, getAnnouncements, saveAnnouncement, deleteAnnouncement, getAllBookings,
  money, exportCSV, uid, dstr, dtime, daysToEvent, apiHealth,
  seedDemoIfEmpty as seedDemo,
} from '../lib/api.js';
import { useAssetBase } from '../lib/theme.jsx';

const SESSION_KEY = 'tea_portal_session';

/* ---------- local storage helpers ---------- */
const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const pkey = (k, ref) => 'tea_portal_' + k + '_' + ref;
const matchQ = (q) => (s) => String(s || '').toLowerCase().indexOf(q) >= 0;

/* ---------- booking lookup (local demo store) ---------- */
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
    ['bookings', 'Bookings', '🎫'],
    ['reports', 'Reports', '📈'],
    ['announcements', 'Announcements', '📣'],
    ['settings', 'Settings', '⚙️'],
  ],
  exhibitor: [
    ['dashboard', 'Dashboard', '📊'],
    ['company', 'Company Profile', '🏢'],
    ['booth', 'Booth Details', '🏗️'],
    ['team', 'Team & Badges', '👥'],
    ['leads', 'Lead Capture', '🧲'],
    ['docs', 'Documents', '📁'],
    ['offers', 'My Offers', '🏷️'],
    ['announcements', 'Announcements', '📣'],
  ],
  ticket: [
    ['dashboard', 'Dashboard', '📊'],
    ['tickets', 'My Tickets', '🎫'],
    ['event', 'Event Info', 'ℹ️'],
    ['promos', 'Promotions', '🎁'],
  ],
};
const ROLE_LABEL = { admin: 'Admin Portal', exhibitor: 'Exhibitor Portal', ticket: 'Ticket Holder Portal' };
const VIEW_TITLE = {
  dashboard: ['Dashboard', 'Your event overview at a glance.'],
  bookings: ['Bookings', 'All ticket and exhibitor reservations.'],
  reports: ['Reports', 'Bookings, revenue and trends.'],
  announcements: ['Announcements', 'Publish updates to portal users.'],
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
  ['Day 2 · 15:00', 'Awards ceremony & Trading Expo lucky draw'],
];

/* ---------- printable ticket ---------- */
function printTicket(b) {
  const f = b.fields || {};
  const w = window.open('', '_blank', 'width=760,height=940');
  if (!w) return false;
  const escH = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Ticket ' + escH(b.ref) + ' — Trading Expo Africa</title>' +
    '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;background:#f2f4f7;margin:0;padding:32px}' +
    '.t{max-width:640px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.12)}' +
    '.th{background:#0b1f3a;color:#fff;padding:28px 30px}.th h1{margin:0 0 6px;font-size:22px;letter-spacing:1px}.th p{margin:0;color:#b9c9dd;font-size:14px}' +
    '.tb{padding:28px 30px}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eef1f5;font-size:15px}' +
    '.row span{color:#6b7a90}.row strong{font-weight:700}.qr{margin:24px auto 8px;width:150px;height:150px;border:2px dashed #0b1f3a;border-radius:12px;' +
    'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;letter-spacing:1px}' +
    '.note{text-align:center;color:#6b7a90;font-size:13px;margin:6px 0 0}' +
    '@media print{body{background:#fff;padding:0}.t{box-shadow:none}}</style></head><body>' +
    '<div class="t"><div class="th"><h1>TRADING EXPO AFRICA</h1><p>19–20 February 2027 · Emperors Palace, Johannesburg · Organised by ProFX Media FZ-LLC</p></div>' +
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
          <strong>TRADING EXPO AFRICA</strong>
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

  return (
    <>
      <div className="kpi-grid">
        <Kpi label="Total bookings" value={bookings.length} sub={`${tickets.length} tickets · ${exhibs.length} exhibitors`} />
        <Kpi label="Gross revenue" value={money(revenue)} sub="demo figures — no real payments yet" cls="navy" />
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
      [['Ref', 'Kind', 'Pass/Booth', 'Qty', 'Total (INR)', 'Name', 'Company', 'Email', 'Phone', 'Booked at']]
        .concat(filtered.map((b) => {
          const f = b.fields || {};
          return [b.ref, b._kind, b.option ? b.option.name : '', b.qty || 1,
            b.option && b.option.price ? b.option.price * (b.qty || 1) : 0,
            f.name || '', f.company || '', f.email || '', f.phone || '', b.at || ''];
        })));
    ctx.toast(`Exported ${filtered.length} bookings.`);
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
      <h3>Bookings ({filtered.length})</h3>
      <p className="card-sub">Click a row to open booking details.</p>
      <div className="table-tools">
        <input type="search" placeholder="Search ref, name, company, email…" value={bq}
          onChange={(e) => { setBq(e.target.value); ctx.setSearch(''); }} />
        <select value={kindF} onChange={(e) => setKindF(e.target.value)} aria-label="Filter by kind">
          <option value="all">All kinds</option>
          <option value="ticket">Tickets</option>
          <option value="exhibitor">Exhibitors</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              {th('Reference', 'ref')}{th('Name / Company', 'name')}
              <th className="no-sort">Kind</th><th className="no-sort">Pass / Booth</th>
              {th('Total', 'total')}{th('Booked', 'at')}
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
                    <td>{total ? money(total) : '—'}</td>
                    <td>{dstr(b.at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon="🎫">No bookings match your filters.</EmptyState>}
    </div>
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
        <Kpi label="Revenue in view" value={money(revenue)} sub="demo figures" cls="navy" />
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
          <p className="fine">Demo data only. Real revenue appears once the PHP backend is connected.</p>
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
    setTitle(''); setBody(''); setAud('all');
    await reload();
    ctx.reloadAnns();
    ctx.toast('Announcement published.');
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
        <h3>Publish announcement</h3>
        <p className="card-sub">Shown to portal users in the chosen audience, plus the notification bell.</p>
        <div className="form-grid">
          <label className="full">Title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Venue announced" /></label>
          <label className="full">Message<textarea rows="3" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the update…"></textarea></label>
          <label>Audience
            <select value={aud} onChange={(e) => setAud(e.target.value)}>
              <option value="all">Everyone</option>
              <option value="ticket">Ticket holders</option>
              <option value="exhibitor">Exhibitors</option>
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
  const wipeDemo = () => {
    if (!window.confirm('Delete all demo bookings and portal data in this browser?')) return;
    ['tea_bookings', 'tea_exhibit', 'tea_announcements', 'tea_notif_read'].forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
    Object.keys(localStorage).filter((k) => k.indexOf('tea_portal_') === 0).forEach((k) => {
      try { localStorage.removeItem(k); } catch {}
    });
    ctx.toast('Demo data cleared. Reloading…');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <>
      <div className="card">
        <h3>System status</h3>
        <p className="card-sub">How this portal is currently wired.</p>
        <div className="d-row"><span>Backend</span><strong>{ok === null ? 'Checking…' : ok ? 'Connected ✓' : 'Demo mode (browser storage)'}</strong></div>
        <div className="d-row"><span>Bookings API</span><strong className="mono">/api/bookings</strong></div>
        <div className="d-row"><span>Health endpoint</span><strong className="mono">/api/health</strong></div>
        <div className="d-row"><span>Storage</span><strong>{ok ? 'MySQL (Laravel 10 API)' : 'localStorage (this browser)'}</strong></div>
        <p className="fine">In production these point at the Laravel 10 API + MySQL backend on the event server. This preview runs entirely in the browser so the flow can be reviewed.</p>
      </div>
      <div className="card">
        <h3>Data tools</h3>
        <p className="card-sub">Exports and demo maintenance.</p>
        <div className="bnav">
          <button className="btn btn-ghost" type="button" onClick={exportAll}>⬇ Export all bookings (CSV)</button>
          <button className="btn btn-danger" type="button" onClick={wipeDemo}>🗑 Clear demo data</button>
        </div>
      </div>
      <div className="card">
        <h3>Admin access</h3>
        <p className="card-sub">Signed in as <strong>{(ctx.session && ctx.session.ref) || 'ADMIN'}</strong> · ProFX Media FZ-LLC</p>
        <div className="bnav">
          <button className="btn btn-ghost" type="button" onClick={() => { try { sessionStorage.removeItem(SESSION_KEY); } catch {} window.location.reload(); }}>Log out</button>
        </div>
        <p className="fine">Demo credentials are for review only — production uses the secure admin login on the Laravel backend.</p>
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
          <p className="fine">Files are stored in this browser's demo portal. On the live platform they upload to the event server automatically.</p>
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
  return (
    <>
      <TicketCard b={b} />
      <div className="bnav">
        <button className="btn btn-primary" type="button" onClick={doPrint}>Download / Print Ticket</button>
        <a className="btn btn-ghost" href="agenda.html">View Agenda</a>
      </div>
      <p className="fine">Your ticket was emailed to <strong>{f.email || 'your email'}</strong> at booking time (demo preview — connect the PHP backend for real email delivery). You can download it here anytime.</p>
      {others.length > 0 && (
        <>
          <h3 className="panel-title">Other bookings on this email</h3>
          {others.map((o) => <TicketCard key={o.ref} b={o} compact />)}
        </>
      )}
      <div className="callout">
        <strong>Lucky draw — Day 2.</strong>
        <span>Your ticket is automatically entered into the Trading Expo lucky draw on 24 April. Be in the hall to win.</span>
      </div>
    </>
  );
}

function EventInfo() {
  return (
    <>
      <div className="grid-3">
        <div className="info-card"><h3>📅 Dates</h3><p>19–20 February 2027, two full days of expo floor, conferences and networking.</p></div>
        <div className="info-card"><h3>📍 Venue</h3><p>Africa — city and venue to be announced. Watch Promotions for the reveal.</p></div>
        <div className="info-card"><h3>🏢 Organiser</h3><p>ProFX Media FZ-LLC. <a href="contact.html">Contact the team →</a></p></div>
      </div>
      <h3 className="panel-title">Travel &amp; stay</h3>
      <div className="grid-3">
        <div className="info-card"><h3>✈️ Getting there</h3><p>Fly into the host city — international and domestic connections. Metro and cab details will be published with the venue.</p></div>
        <div className="info-card"><h3>🏨 Where to stay</h3><p>Partner hotel rates near the venue will be announced. Book early — April is peak season.</p></div>
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
    { '@type': 'Question', name: 'What is the Trading Expo Africa portal?', acceptedAnswer: { '@type': 'Answer', text: 'The portal is your personal dashboard for the expo, with separate logins for ticket holders, exhibitors and admins. Ticket holders manage tickets and announcements; exhibitors manage booths, badges, branding and documents; admins oversee bookings and communications. One login gives you everything related to your role.' } },
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
  ['What is the Trading Expo Africa portal?', 'The portal is your personal dashboard for the expo, with separate logins for ticket holders, exhibitors and admins. Ticket holders manage tickets and announcements; exhibitors manage booths, badges, branding and documents; admins oversee bookings and communications. One login gives you everything related to your role.'],
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

  /* mount: seed demo data, restore session */
  useEffect(() => {
    seedDemo();
    reloadAnns();
    let sess = null;
    try { sess = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch {}
    if (sess && (sess.role === 'admin' || sess.role === 'ticket' || sess.role === 'exhibitor')) {
      if (sess.role === 'admin') {
        setSession(sess);
        setView('dashboard');
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
      const res = await portalLogin(loginRole, ref, pass);
      if (res.ok) {
        const okRef = res.ref || ref.trim().toUpperCase();
        const okRole = res.role || loginRole;
        if (okRole !== 'admin' && !findBookingByRef(okRef)) {
          setLoginError('That demo booking is not in this browser yet. Book a ticket or booth first, then log in to preview the portal.');
          return;
        }
        startSession({ role: okRole, ref: okRef });
        return;
      }
      /* demo fallback — original portal.js behaviour: match stored bookings */
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
      if (res.ok) startSession({ role: 'admin', ref: 'ADMIN' });
      else setLoginError(res.error || 'Invalid admin username or password.');
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
          <p className="fine">Demo preview — passwords are never shown here.</p>
        </>
      ),
    });
  };

  /* ---- context shared with views ---- */
  const sessWithBooking = session && session.role !== 'admin'
    ? { ...session, booking: session.booking || findBookingByRef(session.ref) }
    : session;
  const ctx = {
    session: sessWithBooking, toast, go, openDrawer: openBookingDrawer,
    refresh, reloadAnns, setActions, search, setSearch,
    anns, bookings, dataVersion,
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
      if (view === 'reports') return <AdminReports ctx={ctx} />;
      if (view === 'announcements') return <AdminAnns ctx={ctx} />;
      if (view === 'settings') return <AdminSettings ctx={ctx} />;
      return <AdminDashboard ctx={ctx} />;
    }
    if (role === 'exhibitor') {
      if (view === 'company') return <ExCompany ctx={ctx} />;
      if (view === 'booth') return <ExBooth ctx={ctx} />;
      if (view === 'team') return <ExTeam ctx={ctx} />;
      if (view === 'leads') return <ExLeads ctx={ctx} />;
      if (view === 'docs') return <ExDocs ctx={ctx} />;
      if (view === 'offers') return <ExOffers ctx={ctx} />;
      if (view === 'announcements') return <AnnsView ctx={ctx} aud="exhibitor" />;
      return <ExDashboard ctx={ctx} />;
    }
    if (view === 'tickets') return <MyTickets ctx={ctx} />;
    if (view === 'event') return <EventInfo />;
    if (view === 'promos') return <AnnsView ctx={ctx} aud="ticket" />;
    return <TicketDashboard ctx={ctx} />;
  };

  /* ---- notifications ---- */
  const readNotifIds = () => {
    try { return JSON.parse(sessionStorage.getItem('tea_notif_read') || '[]'); } catch { return []; }
  };
  const audienceAnns = sessWithBooking
    ? anns.filter((a) => sessWithBooking.role === 'admin' || a.audience === 'all' || a.audience === sessWithBooking.role)
    : [];
  const unread = audienceAnns.filter((a) => readNotifIds().indexOf(a.id) < 0).length;
  const markAllRead = (e) => {
    e.stopPropagation();
    try { sessionStorage.setItem('tea_notif_read', JSON.stringify(audienceAnns.map((a) => a.id))); } catch {}
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
              <img className="login-logo" src={ab + 'logo-light.png'} alt="Trading Expo Africa" />
              <p className="login-eyebrow">ProFX Media FZ-LLC presents</p>
              <h1>Trading Expo Africa</h1>
              <p className="login-dates">19–20 February 2027 · Africa</p>
              <div className="login-stats">
                <div><strong>TBA</strong><span>Visitors</span></div>
                <div><strong>TBA</strong><span>Exhibitors</span></div>
                <div><strong>TBA</strong><span>Speakers</span></div>
              </div>
              <p className="login-demo-note">Demo preview — bookings are stored in this browser only, no real server is connected yet.</p>
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
                <form id="bookingForm" className="portal-form" onSubmit={doBookingLogin}>
                  <label>Booking reference
                    <input id="portalRef" type="text" placeholder={loginRole === 'ticket' ? 'e.g. TEA-AB12CD' : 'e.g. EXB27-AB12CD'} autoComplete="off" required />
                  </label>
                  <label>Password
                    <input id="portalPass" type="password" placeholder="Shown on your booking confirmation" autoComplete="current-password" required />
                  </label>
                  <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>Log In to Dashboard</button>
                  <p className="form-note">Your reference and password were shown when you booked. New here? <a href="tickets.html">Book a ticket</a> or <a href="exhibit.html">reserve a booth</a>.</p>
                </form>
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

              <div className="demo-box">
                <strong>Demo logins for review</strong>
                <div><span>Admin</span><code>admin / expo2027</code></div>
                <div><span>Exhibitor</span><code>EXB27-DEMO / demo123</code></div>
                <div><span>Ticket holder</span><code>TEA-DEMO / demo123</code></div>
              </div>
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
              <img src={ab + 'logo-light-compact.png'} alt="Trading Expo" className="side-logo" />
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
                    {audienceAnns.length ? audienceAnns.slice(0, 8).map((a) => (
                      <div className="notif-item" key={a.id}>
                        <strong>{a.title}</strong>
                        <p>{a.body.slice(0, 120)}{a.body.length > 120 ? '…' : ''}</p>
                        <span>{dstr(a.at)}</span>
                      </div>
                    )) : <div className="notif-item"><p>No notifications yet.</p></div>}
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
