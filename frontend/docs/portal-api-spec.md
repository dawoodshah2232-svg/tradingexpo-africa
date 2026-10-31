# Traders Expo Johannesburg — Portal Backend Spec (Laravel 10 + MySQL)

Status: **SPEC ONLY — nothing here is deployed.** The clickable portal in
`src/pages/PortalPage.jsx` + `src/lib/portalStore.js` is an interim
localStorage store that mirrors this spec 1:1. When the backend is built,
the interim store is replaced endpoint-by-endpoint; no portal screen needs
redesigning.

Standing constraints (repo owner, Kailash — these precede any other rule):
- Laravel **10** on PHP **8.1 only. Never upgrade.**
- API only. **No Blade.**
- Database: MySQL database **`thetradersexpo`**.
- **No `.env` file, password, key, or token is ever committed to this repo.**
  The database password is obtained from Kailash at deploy time.
- Frontend: React with `.jsx` only (Vite). No TypeScript, no Next.js.
- Build and test locally before any push to `main` (a push auto-deploys).

## 1. Interim → real mapping

| Interim (localStorage, today) | Real (Laravel API + MySQL) |
|---|---|
| `tea_bookings` (ticket bookings) | `tickets` + `users` |
| `tea_exhibit` (exhibitor reservations) | `sponsors` (reservation rows) |
| `tea_portal_v2` (store: sponsors, packages, booths, notifications, package_offers, payments, deletedTickets, ticketEvents, assets, speakerApplications) | Tables below, same field names |
| `tea_portal_v2_read_<userKey>` | `notification_reads` |
| `tea_admins` (admin-created admin logins) | `users` with `role = admin` |
| `tea_otp_pending` (signup OTP record) | `otp_verifications` (code stored hashed only) |
| `tea_announcements` | `notifications` (kind = announcement) |
| `printTicket()` (browser print window) | `GET /api/tickets/{ref}/download` (server-rendered ticket file) |

No demo seeds exist. Lists start empty; accounts exist only when the admin
creates them, when someone signs up, or when someone books on the tickets /
exhibit pages. The single exception is the temporary test account
(`test@abc.com`, see §2), which must be deleted before production.

## 2. Auth

- `POST /api/auth/login` — body: `{ login, password }` where `login` is an
  email **or** a booking reference (`TEA-XXXXXX` / `EXB27-XXXXXX`).
  Response: `{ ok, token, role, ref, email }`. Token: Laravel Sanctum
  personal access token. Roles: `attendee` (ticket holder), `sponsor`
  (exhibitor), `admin`. Rate-limit login attempts.
- `POST /api/auth/logout` — revokes the token.
- `POST /api/auth/change-password` (auth) — body:
  `{ current_password, password, password_confirmation }`. Validates the
  current password; new password min **8** characters.
- `POST /api/auth/signup/request-code` — body: `{ type, name, email,
  phone, password, password_confirmation, trades?, topic?, bio?,
  company?, interested_package_id?, booth_size_interest? }` where `type`
  is `trader | speaker | sponsor | exhibitor`. Validates: email format +
  uniqueness, password min 8 + confirmation match, mobile required, and
  per-type required fields (speaker: `topic` + `bio`; sponsor/exhibitor:
  `company`). Rate-limited per email + IP. Generates a 6-digit code with a
  CSPRNG (never `rand()`), stores only its **hash** in `otp_verifications`
  with a 10-minute expiry and 0 attempts, and emails the code to the user
  via Laravel Mail. The plaintext code is never stored, never logged, and
  never returned by any API. The password is bcrypt-hashed at request time
  and kept only as a hash in the verification row until the account is
  created.
- `POST /api/auth/signup/verify-code` — body: `{ email, code }`. Checks
  expiry, then the code hash; wrong codes increment `attempts` and lock the
  row after **5** attempts (a new code must be requested). On success the
  row is marked used and the account is created:
  - `trader` → attendee user + free ticket (optional `trades` stored on
    the ticket).
  - `speaker` → attendee user + free ticket **plus** a
    `speaker_applications` row (`status = pending`). A speaker signup is an
    APPLICATION for admin review. It must NEVER auto-list the person among
    featured speakers, and approval only flips the application status —
    featured listings stay admin-curated content.
  - `sponsor` → sponsor row (`tier = Unassigned` until confirmed,
    `interested_package_id` recorded, not a confirmed package).
  - `exhibitor` → sponsor reservation row with `company` +
    `booth_size_interest`.
  Response: `{ ok, token, role, ref, email }` (same shape as login).
- `POST /api/auth/signup/resend-code` — same rate rules as request-code
  plus a 60-second cooldown per email; rotates the code and resets
  attempts/expiry.
- Admin-created accounts (admin creates ANY account from the portal):
  `POST /api/admin/accounts` — body: `{ name, email, phone, password,
  role: attendee|sponsor|exhibitor|admin, package_id?, booth_id? }`.
  Validates email uniqueness and password min 8; for `sponsor` with
  `booth_id`, the booth must be `available` (marked `reserved` in the same
  transaction). The server emails the login details to the account's email
  via Laravel Mail; if mail fails, the endpoint still returns success for
  the creation and flags `email_sent: false` so the admin UI shows the
  credentials to share manually. Admins log in with their email as the
  username. Passwords are bcrypt-hashed and never returned or listed.
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
  `role = admin` + IP allow-list if the owner wants it). The interim
  bootstrap admin (`admin / expo2027`) exists only in the browser store
  and must not exist in production — production admins are provisioned
  accounts. The temporary test account (`test@abc.com`, usable on ticket
  and sponsor logins in the interim store) must be **deleted before
  production** and must never be seeded by any production seeder.

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
  phone, package, booth_id, interested_package_id, note }`. Production
  sponsors are real agreements; an `interested_package_id` is only an
  expression of interest, never a confirmed package.
- `PATCH /api/sponsors/me` — company profile fields.
- `GET /api/booths` — the real 38-booth plan grid (see §5). Booth
  availability reflects reservations in the system; nothing is pre-filled.
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
- `GET /api/admin/accounts` — every portal account: admins, ticket
  holders, sponsors, exhibitors (name, email/username, role, detail,
  created date). Passwords are never returned.
- `POST /api/admin/accounts` — create any account (see §2). For a sponsor
  with `booth_id`, the booth must be `available`.
- `GET /api/admin/speaker-applications?status=` — speaker signups with
  name, email, phone, topic, bio, status, applied date.
- `POST /api/admin/speaker-applications/{id}/status` — body
  `{ status: approved|declined }`. Approval flips the application status
  only; it never writes to featured-speaker content.
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
// trades string nullable on tickets (attendee signup: what they trade).
// ticket_events: id, ticket_id FK, status enum('issued','deleted'),
// note nullable, created_at only.
// ticket_deletes: id, ticket_id FK, ref, name, email, phone, pass,
// reason text, deleted_by, deleted_at, timestamps.
// otp_verifications: id, email index, code_hash string (never plaintext),
// attempts integer default 0, expires_at, used_at nullable, payload JSON
// (signup form WITHOUT any plaintext password — password stored only as its
// bcrypt hash), timestamps.
// speaker_applications: id, name, email, phone nullable, topic, bio text,
// status enum('pending','approved','declined') default 'pending', timestamps.
// notifications: id, kind enum('announcement','promotion','offer','ticket'),
// audience string (all|ticket|sponsor|email), title, body text, created_at.
// notification_reads: notification_id FK, user_key string, read_at,
// primary key (notification_id, user_key).
// packages: id, tier, size, scheme, price_usd integer, benefits text,
// custom bool default false, timestamps.
// sponsors: id, brand, tier, logo_path nullable, contact, email unique,
// phone nullable, package_id FK nullable, booth_id FK nullable,
// interested_package_id FK nullable, booth_size_interest string nullable,
// note text nullable, timestamps.
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
  Availability reflects reservations in the system; nothing is pre-filled.
  Zone names only, no invented dimensions,
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
  never hard-deletes the row in production; the interim store removes it
  from the active list but keeps the deleted-lead record).
- **No demo seeds, ever.** Seeders must not create fictional people,
  tickets, sponsors, or payments. Lists start empty. The temporary test
  account (`test@abc.com`) exists only in the interim browser store and
  must be deleted before production.
- **Speaker signups are applications, not listings.** Approving a speaker
  application changes only its status. Featured-speaker content is curated
  separately and is never written by signup or approval flows.
- **OTP codes are hashed, expiring, and attempt-limited.** Codes are
  CSPRNG 6-digit, stored as hashes only, 10-minute expiry, 5 attempts,
  60-second resend cooldown. The interim browser layer keeps the code in a
  short-lived pending record only (documented interim exception); it is
  never logged, never rendered, and never used as a bypass when email
  delivery fails.
- **Interim email path.** Until Laravel Mail lands, portal emails go
  through the FormSubmit ajax path to `info@profxmedia.com` with the
  content in `_autoresponse` to the user's inbox. That path needs its
  one-time activation in the `info@profxmedia.com` inbox (still pending) —
  until then, sends fail and the UI must say so honestly and offer the
  admin-create fallback instead of pretending delivery.

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
   password email + OTP code email) + admin account provisioning (no
   bootstrap or test credentials in production).
4. FormSubmit one-time activation in the `info@profxmedia.com` inbox, so
   the interim email path (ticket mail, credentials mail, OTP mail) works
   until Laravel Mail lands.
