# Trading Expo Johannesburg

Africa's premier online trading, fintech & financial markets exhibition — Johannesburg edition.

- **Dates:** 19–20 February 2027 (2 days; see note below on the brochure's 18–19 February wording)
- **Venue:** Emperors Palace, Centre Court — 64 Jones Road, Kempton Park, Johannesburg, South Africa
- **Organizer:** ProFX Media FZ-LLC (Official Guinness World Records™ Holder — Most participants in a trading competition)
- **Contact:** info@profxmedia.com · media & sponsorship +971 58 884 5033
- **Domain:** https://thetradersexpo.com (DNS/hosting to be pointed at go-live; repo is currently private, so GitHub Pages is off)

## Structure

- `frontend/` — Vite + React 18 multi-page app (source of truth). `npm install`, `npm run build` → `frontend/dist/`.
- `gh-pages` branch — built site, deployed via GitHub Pages.

## Deploy

```sh
cd frontend && npm run build
# copy frontend/dist/* to the gh-pages branch root, commit, push
```

## Notes

- Countdown targets 2027-02-19T09:00:00+02:00 (Africa/Johannesburg) — the contracted expo dates. The 30 Oct 2026 sponsorship brochure prints 18–19 February 2027; that conflict is unresolved and the site keeps the contracted 19–20 February until the owner confirms.
- Sponsorship tiers/prices, booth sizes, add-ons, the 4,000+ expected-trader figure, Cape Town 2026 facts and the +971 58 884 5033 contact come from the 30 Oct 2026 sponsorship brochure (ProFX Expo Africa 2027 — Sponsorship Brochure). Silver booth size resolved by the owner 2026-10-30: 3 × 3 m, 1 side open, shell scheme, TV not included.
- Ticket pricing is unconfirmed — the site says "register interest, no payment collected now", never "free admission".
- The "1,449" Guinness participant count must never appear on the site (owner rule) — record title only.
- Gallery `profx/` photos are real ProFX Expo MENA 2025 / ProFX Awards Dubai 2025 event photos.
