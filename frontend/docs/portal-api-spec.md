# Traders Expo Johannesburg — Portal Backend Spec (Laravel 10 + MySQL)

Status: **SPEC ONLY — nothing here is deployed.** The clickable portal in
`src/pages/PortalPage.jsx` + `src/lib/portalStore.js` is a localStorage demo
that mirrors this spec 1:1. When the backend is built, the demo store is
replaced endpoint-by-endpoint; no portal screen needs redesigning.

Standing constraints (repo owner, Kailash — these precede any other rule):
- Laravel **10** on PHP **8.1 only. Never upgrade.**
- API only. **No Blade.**
- Database: MySQL database **`thetradersexpo`**.
- **No `.env` file, password, key, or token is ever committed to this repo.**
  The database password is obtained from Kailash at deploy time.
- Frontend: React with `.jsx` only (Vite). No TypeScript, no Next.js.
- Build and test locally before any push to `main` (a push auto-deploys).

## 1. Demo → real mapping

| Demo (localStorage, today) | Real (Laravel API + MySQL) |
|---|---|
| `tea_bookings` (ticket bookings) | `tickets` + `users` |
| `tea_exhibit` (exhibitor reservations) | `sponsors` (reservation rows) |
| `tea_portal_v2` (store: sponsors, packages, booths, notifications, package_offers, payments, deletedTickets, ticketEvents, assets) | Tables below, same field names |
| `tea_portal_v2_read_<userKey>` | `notification_reads` |
| `tea_announcements` | `notifications` (kind = announcement) |
| `printTicket()` (browser print window) | `GET /api/tickets/{ref}/download` (server-rendered ticket file) |

## 2. Auth

- `POST /api/auth/login` — body: `{ login, password }` where `login` is an
  email **or** a booking reference (`TEA-XXXXXX` / `EXB27-XXXXXX`).
  Response: `{ ok, token, role, ref, email }`. Token: Laravel Sanctum
  personal access token. Roles: `attendee` (ticket holder), `sponsor`
  (exhibitor), `admin`. Rate-limit login attempts.
- `POST /api/auth/logout` — revokes the token.
- `POST /api/auth/change-password` (auth) — body:
  `{ current_password, password, password_confirmation }`. Validates the
  current password; new password min 6 characters (raise to 8+ in production
  policy if the owner agrees — do not silently change the demo rule).
- Ticket issue flow (the booked email is the login ID):
  1. Attendee reserves a free ticket (name, email, mobile — no payment step,
     ever; tickets are FREE).
  2. Server generates a reference (`TEA-` + 6 chars) and a random password,
     stores only a **bcrypt hash**, and emails the plaintext password + ticket
     to the booked email via Laravel Mail. The plaintext password is never
     stored and never returned by any API afterwards.
  3. Attendee logs in with email + that password and can change it in
     My Account. Passwords are never shown in admin views.
- Admin login is a separate guard (`admins` table or `users` with
  `role = admin` + IP allow-list if the owner wants it). Demo credential
  `admin / expo2027` is **demo only** and must not exist in production.

## 3. Endpoints

All responses JSON. Auth via `Authorization: Bearer <token>` except login.
Pagination: `?page=&per_page=` (default 25). Search: `?q=` matches
name/email/phone/reference. Errors: `{ ok: false, error }`.

### Attendee (role: attendee)
- `GET /api/tickets/mine` — active tickets for the logged-in email.
  Item: `{ ref, pass, name, email, phone, qty, status: "active",
  issued_at, history: [{ status, note, at }] }`.
- `GET /api/tickets/{ref}` — one ticket (must belong to caller).
- `GET /api/tickets/{ref}/download` — printable ticket file (re-issue).
- `GET /api/notifications` — notifications for caller (audience `all`,
  `ticket`, or the caller's email), newest first, with `read` flags.
- `POST /api/notifications/{id}/read` and `POST /api/notifications/read-all`.
- `GET /api/offers` — notifications of kind `offer`/`promotion` for caller.
- `PATCH /api/me` — update own name/mobile. Email (login ID) is not
  changeable via API; the team changes it on request.

### Sponsor (role: sponsor)
- `GET /api/sponsors/me` — `{ id, brand, tier, logo_path, contact, email,
  phone, package, booth_id, note }`. Wall demo accounts are labelled
  `is_wall_demo` in the demo only; production sponsors are real agreements.
- `PATCH /api/sponsors/me` — company profile fields.
- `GET /api/booths` — the real 38-booth plan grid (see §5). Booth
  availability is demo data until real allocations are entered.
- `POST /api/sponsors/me/booth` — body `{ booth_id }`. Only `available`
  booths can be chosen; the endpoint frees the sponsor's previous `reserved`
  booth and marks the new one `reserved` in one transaction. Sold booths
  return 409. The chosen booth is visible to admin.
- `POST /api/sponsors/me/assets` — multipart upload, fields
  `{ kind: logo|booth-design|rollup, file }`. Validate mime
  (images + PDF), size cap (demo uses 1.5 MB; production cap set by owner),
  store under `storage/app/public/sponsor-assets`, serve via the
  `public/storage` symlink. Response includes the admin-visible record.
- `GET /api/sponsors/me/assets` — own uploads.
- `GET /api/sponsors/me/offers` — discounted package offers addressed to
  this sponsor + general promotions.
- `GET /api/sponsors/me/payments` and `POST /api/sponsors/me/payments` —
  body `{ item, amount_usd, method: bank_transfer|card_provider, note }`.
  Status starts `Submitted`. **No card fields exist in this API.**
  `card_provider` means the team sends a secure provider link; no card
  details are ever typed into the portal or sent to this API.

### Admin (role: admin)
- `GET /api/admin/tickets?q=&kind=&pass=&status=` — the tickets register:
  every ticket with name, mobile, email, pass, reference, issue date,
  status. `GET /api/admin/tickets/export` returns the same list as CSV.
- `DELETE /api/admin/tickets/{ref}` — body `{ reason }` (**reason is
  required, 422 without it**). Cancels the ticket and appends a row to
  `ticket_deletes` + a `ticket_events` row. The ticket never silently
  disappears.
- `GET /api/admin/deleted-leads` — deleted tickets with person, contacts,
  pass, reason, deleted_by, deleted_at — for call follow-ups.
- `GET /api/admin/dashboard` — counts computed from the same tables the
  register reads (never hard-coded): tickets issued (active), attendees
  (distinct ticket emails), tickets by pass, deleted count, sponsor count,
  payments confirmed (sum of `payments` where `status = Confirmed`).
- `GET /api/admin/sponsors` and `GET /api/admin/sponsors/{id}` — sponsor +
  package + booth + assets + payments + offers.
- `GET /api/admin/packages`, `POST /api/admin/packages` —
  `{ tier, size, scheme, price_usd, benefits }`.
- `POST /api/admin/package-offers` — `{ sponsor_id, package_id,
  discounted_price_usd, note }`. Creates the offer **and** a notification
  (kind `offer`, audience = sponsor's email) in the same transaction.
- `POST /api/admin/announcements` — `{ kind: announcement|promotion|offer,
  audience: all|ticket|sponsor, title, body }`. Creates the notification
  for every matching user; offers also appear in Offers sections.
- `GET /api/admin/payments` and `POST /api/admin/payments/{id}/status` —
  body `{ status: Confirmed|Declined }` (only from `Submitted`).
- `GET /api/admin/search?q=` — across attendees and sponsors.

## 4. MySQL migration sketches (Laravel 10)

```php
// users: id, role enum('attendee','sponsor','admin'), name, email unique,
// phone nullable, password (bcrypt), email_verified_at nullable, timestamps.
// tickets: id, ref string unique, user_id FK, pass_type, qty default 1,
// status enum('active','deleted') default 'active', issued_at, timestamps.
// ticket_events: id, ticket_id FK, status enum('issued','deleted'),
// note nullable, created_at only.
// ticket_deletes: id, ticket_id FK, ref, name, email, phone, pass,
// reason text, deleted_by, deleted_at, timestamps.
// notifications: id, kind enum('announcement','promotion','offer','ticket'),
// audience string (all|ticket|sponsor|email), title, body text, created_at.
// notification_reads: notification_id FK, user_key string, read_at,
// primary key (notification_id, user_key).
// packages: id, tier, size, scheme, price_usd integer, benefits text,
// custom bool default false, timestamps.
// sponsors: id, brand, tier, logo_path nullable, contact, email unique,
// phone nullable, package_id FK nullable, booth_id FK nullable,
// note text nullable, is_wall_demo bool default false, timestamps.
// sponsor_assets: id, sponsor_id FK, kind enum('logo','booth-design','rollup'),
// name, mime, path, timestamps.
// package_offers: id, sponsor_id FK, package_id FK, list_price_usd,
// discounted_price_usd, note nullable, status enum('offered','accepted',
// 'declined') default 'offered', timestamps.
// booths: id string PK (e.g. '01'), row char, tier, size,
// price_usd integer, status enum('available','reserved','sold').
// payments: id, sponsor_id FK, item, amount_usd integer,
// method enum('bank_transfer','card_provider'),
// status enum('Submitted','Confirmed','Declined') default 'Submitted',
// note nullable, timestamps.
```

## 5. Honesty rules the backend must preserve

- **Floor plan is REAL.** Booth numbers, tiers and sizes come from the
  organiser-supplied plan ("ProFx Expo Africa 2027 - Jo'Burg", Updated
  Floor Plan, Emperors Palace — drawing dated 11 February 2027, which is
  the drawing date, NOT the event date; the event stays 19–20 Feb 2027).
  The 38 booths: 01 Official 5×3, 02 Title 5×3, 03 Exclusive 5×3,
  04 Regional 5×3, Diamond 4×3 (05, 06, 09, 10, 11, 12, 15, 16),
  Elite 4×3 (07, 08, 13, 14), Gold 3×3 (17, 23, 24, 27, 28, 31, 32, 38),
  Silver 3×3 (18, 19, 20, 21, 22, 25, 26, 29, 30, 33, 34, 35, 36, 37).
  The PDF is shipped in the repo at
  `public/assets/floor-plan-johannesburg-2027.pdf` (downloadable from the
  portal) with a rendered image at `public/assets/img/floor-plan.jpg`.
  The picker groups booths by tier — it does not claim pixel positions.
  Availability states (available/reserved/sold) are demo data until the
  team enters real allocations. Zone names only, no invented dimensions,
  and never reproduce the source typo "Contestt" or garbled dimension
  strings from the PDF text layer.
- **Tickets are FREE.** No ticket endpoint accepts money, and no payment
  step exists on any ticket flow. Payments exist only for sponsorships.
- **No card capture.** There is no card-number, expiry, or CVV field in
  any request, table, or log. `card_provider` payments are provider-link
  payments recorded by reference only.
- **No invented totals.** Dashboard counts are `COUNT`/`SUM` queries over
  the register tables, never constants.
- **Deletion keeps the record.** `DELETE /api/admin/tickets/{ref}` without
  a reason is rejected; with a reason it writes `ticket_deletes` + a
  `ticket_events` row and flips the ticket to `deleted` (or archives it —
  never hard-deletes the row in production; the demo removes it from the
  active list but keeps the deleted-lead record).
- **Demo data is fictional.** Seeders must use `example.com` addresses and
  "Demo …" names. The 10 wall brands may be seeded as demo sponsor accounts
  with names/logos only, flagged `is_wall_demo`, with no booth, package,
  or payment implied.

## 6. Environment (names only — no values, never committed)

Deploy-time env names Kailash sets on the server (values come from Kailash,
never from chat, never in the repo): `APP_KEY`, `DB_HOST`, `DB_DATABASE`
(`thetradersexpo`), `DB_USERNAME`, `DB_PASSWORD`, `MAIL_MAILER`,
`MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`,
`SANCTUM_STATEFUL_DOMAINS` (if used). No new GitHub secret is needed for
the demo; if CI deploy needs one later, its name + purpose must be reported
to Dawood first so Kailash can add it.

## 7. Still needed before real mode (not done by this spec)

1. MySQL password from Kailash (never asked for in chat, never stored here).
2. The cPanel auto-deploy hook fix — pushes to `main` are currently NOT
   reaching `thetradersexpo.com` (verified 2026-10-31), so the backend
   cannot go live until Kailash fixes that wiring.
3. Backend implementation from this spec + mail delivery test (ticket +
   password email) + admin account provisioning (no demo credentials).
