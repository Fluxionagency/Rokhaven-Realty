# 3D website

The homepage and the six listing sales pages are static HTML served by Next.js rewrites
(see `next.config.ts`). No build step: edit the files and deploy.

| URL | File |
| --- | --- |
| `/` | `public/3d/index.html` (3D map of Lagos, area search, listing cards) |
| `/banana-island`, `/old-ikoyi-triplex`, `/ikoyi-maisonette`, `/victoria-island`, `/banana-island-tower`, `/falcon-fadeyi-yaba` | `public/3d/<slug>.html` |
| `/enquiry-received`, `/falcon-fadeyi-yaba/thank-you` | `public/3d/thank-you.html` |

Shared files: `public/listing.js` (sales-page engine: units, animated 3D floor plan, pricing, FAQ, form),
`public/listing.css`, `public/rh-track.js` (Meta pixel + GA4, fires `Lead` on a saved enquiry and
`Contact` on the WhatsApp button), `public/map/*` (OpenStreetMap data for Lagos),
`public/plans/*` (floor plans + `walls.json` traced walls), `public/gallery/*`, `public/media/*`.

## Enquiry flow

Form → Leadboard public form API (`makarfi.leadboard.ng`, form key in each page's `window.LISTING.form.key`,
default form otherwise) → thank-you page (`form.thanksUrl`, default `/enquiry-received`) → "Send us a message
on WhatsApp" with the enquiry pre-written. Leadboard only accepts submissions from rokhaven.com, so
local and preview deploys show the "couldn't save" note on the thank-you page; that is expected.

## Adding a property

1. Copy an existing `public/3d/<slug>.html`, change `window.LISTING` (units, prices, plans, gallery, FAQ, form).
2. Add the slug to `LISTINGS` in `next.config.ts` and to the list in `src/app/sitemap.ts`.
3. On the map (`public/3d/index.html`): add a `.stop` section and rail button, an entry in `featured`,
   a camera key, and the slug in `PAGES`.

## Content rules

No building names, developer names or street addresses on listings. Victoria Island is shown as "VI" only.
Yaba listing: "2 units of 1 bed", never the building or operator name; title is a Registered Conveyance
and survey plan.

## Rolling back

Delete the matching line in `rewrites()` in `next.config.ts`; the previous app route (`src/app/page.tsx`,
`src/app/falcon-fadeyi-yaba/*`) is still in place and takes over again.
