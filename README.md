# Dock9 Studio — website

Static site (no framework, no server). A zero-dependency Node build script
(`build.js`) generates the final pages from hand-authored content in `src/`,
shared partials in `partials/`, and one JSON file per lamp in
`data/products/`. There is **no contact-form backend** — buyers reach the
studio directly via WhatsApp or Instagram DM, per the PRD.

## What's real vs. placeholder right now

Structure, styling, filtering, and the WhatsApp/Instagram linking all work.
The following still need real content before this goes live:

- [ ] **Logo** — `assets/logo.svg` is a recreation of the logo shared in
      chat (it was only seen as an inline image, not a file). Replace it
      with the real exported logo file (SVG preferred) before launch.
- [ ] **Product photos** — every product in `data/products/*.json` points at
      `assets/products/placeholder.svg` ("photo coming soon"). Once real
      shots exist, drop them in `assets/products/<slug>/` and update each
      JSON file's `images` array (first image = hero, rest = thumbnails).
- [x] **Brand story** — `src/about.html` and the Home story teaser
      (`src/index.html`) now carry the founder's real origin story
      (reclaimed wood, the craftsmen, why it started).
- [ ] **Product copy** — each JSON's `description` and `craft_note` fields
      are placeholders ("pending from the studio"). Fill in real materials,
      dimensions, and a short handmade note per lamp.
- [ ] **WhatsApp number** — `js/config.js` → `whatsappNumber` is a
      placeholder. Replace with the real number (digits only, country code,
      no `+`/spaces/dashes).
- [ ] **Instagram handle** — `js/config.js` → `instagramHandle` /
      `instagramUrl` are placeholders.
- [ ] **`assets/og-image.jpg`** — a real 1200×630 share-preview image
      (doesn't exist yet; link previews on WhatsApp/Instagram won't render
      correctly until it's added).
- [ ] **Typography** — currently a plain serif/sans system-font pairing
      (Georgia for headings, system sans for body) so the site needs no
      external font requests (keeps the CSP tight). Revisit once real brand
      typography is decided.

## Content model

Each lamp is one JSON file in `data/products/`:

```json
{
  "name": "Wall Sconce No. 1",
  "slug": "wall-sconce-no-1",
  "category": "Wall",
  "images": [{ "src": "assets/products/placeholder.svg", "alt": "..." }],
  "description": "Materials, size, handmade note.",
  "craft_note": "Optional 1-2 line story blurb.",
  "date_added": "2026-09-27"
}
```

`category` must be one of `Wall`, `Pendant`, `Floor`, `Table` (matches the
filter pills on the Products page). `slug` becomes the product's URL:
`/products/<slug>`. To add, remove, or edit a lamp, just add/edit a JSON
file here and re-run the build — no other file needs to change.

## Building

```bash
node build.js
```

Regenerates `index.html`, `about.html`, `contact.html`,
`products/index.html`, one `products/<slug>.html` per lamp, and
`sitemap.xml` from `src/`, `partials/`, and `data/products/`. No npm
dependencies — everything runs on Node's built-in `fs`/`path`.

## Local preview

```bash
node build.js
python3 dev-server.py
```

then open `http://localhost:4173`. Use `dev-server.py`, not a plain static
server (`npx serve`, `python3 -m http.server`) — it resolves clean URLs
(`/about` → `about.html`) the same way `vercel.json`'s `cleanUrls: true`
does in production, and sends the same security headers so the CSP can
actually be exercised locally. A plain static server will 404 on every nav
link that isn't the homepage.

## Deploying to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Import Project** → select the repo.
   - `vercel.json` already sets the build command (`node build.js`) and
     output directory (repo root) — no manual framework config needed.
3. Push to `main` for production; other branches get preview URLs.
4. Site launches on Vercel's free `*.vercel.app` subdomain. Add a custom
   domain (~$10–$15/year) whenever the founder wants one, then update
   `SITE_URL` at the top of `build.js` to match (used for canonical URLs,
   Open Graph tags, and the sitemap).

## Security

- `vercel.json` sets a strict `Content-Security-Policy` (`default-src
  'self'`, no external `script-src`/`style-src`/`img-src`/`connect-src` —
  there's nothing for the site to talk to now that there's no form
  backend), plus `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Strict-Transport-Security`, and a locked-down `Permissions-Policy`.
- No inline `<script>` blocks — all JS lives in `js/config.js` and
  `js/main.js` — so the CSP needs no `'unsafe-inline'` for scripts.
- `js/main.js` builds WhatsApp/Instagram links and toggles DOM state only
  via `textContent`/DOM APIs and element attributes — never `innerHTML` or
  `eval` — so nothing in `data/products/*.json` can inject markup or script.
- Every external link (`target="_blank"`) carries `rel="noopener"`.

## Editing content day-to-day

- **Contact details / social links:** `js/config.js` — the one file to
  touch for WhatsApp number, Instagram handle, and the trade/wholesale
  note default.
- **Products:** add/edit/remove files in `data/products/`, then
  `node build.js`.
- **Home / About / Contact copy:** edit the fragments in `src/`, then
  `node build.js`. These files contain only the page's main content — nav,
  footer, and the floating WhatsApp button are injected automatically by
  `build.js` from `partials/`.
- **Design tokens** (colors, spacing, fonts): `css/styles.css`, `:root`
  block at the top.
