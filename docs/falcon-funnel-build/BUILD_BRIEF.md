# RokHaven Falcon Funnel: Build Brief for Claude Code

> **How to use this:** open Claude Code inside the rokhaven.com codebase. Copy the whole **"Falcon Funnel Build"** folder into the repo (for example to `/docs/falcon-funnel-build/`). Then paste:
>
> *"Read docs/falcon-funnel-build/BUILD_BRIEF.md and build everything in it. Match the existing stack and conventions of this repo, and reuse the penthouse funnel components where they already exist. Ask me before installing new dependencies."*

---

## 0. What we're building

One paid-ad landing page for **Falcon**, an off-plan building of one-bedroom rental apartments in Fadeyi, Yaba. It's sold to investors as 2-unit portfolios. The page has a **single-step "Get the Brochure & Title Documents" form** that posts to Leadboard, then redirects to a **thank-you page**. The thank-you page's main button opens WhatsApp with a pre-filled message. **There is no Cal.com booking step** (unlike the penthouse funnels).

| Page | Route |
|---|---|
| Falcon sales page | `/falcon-fadeyi-yaba` |
| Thank you | `/falcon-fadeyi-yaba/thank-you` |

If the repo already groups funnels under a path (e.g. `/penthouses/...`), an `/investments/falcon-fadeyi-yaba` style route is fine. Tell Demilade which route you used, because the ads will point at it.

**Source of truth for layout and copy:** the two HTML files in `design-reference/`. They're design mock-ups exported from Claude Design, written in a custom component format (`<x-dc>`, `<helmet>`, `data-dc-script`). **Don't copy that format.** Rebuild each page as normal components in this repo's stack. Keep the copy, section order, colours, spacing and type exactly as shown.

| Design file | Builds |
|---|---|
| `01-falcon-sales-page.html` | The sales page |
| `02-falcon-thank-you.html` | The thank-you page |

The design files reference everything in `images/` with relative paths, so you can open them in a browser to see the intended result. Move the images and videos to the repo's public/static folder, e.g. `/public/images/falcon/` and `/public/videos/falcon/`. Serve stills as optimised WebP with JPG fallback.

### ⚠️ Naming rule (non-negotiable)
Never name the developer, the property manager or any partner company anywhere: copy, alt text, metadata, file names, structured data, image or video. Use only the copy in the design files and don't add company names from any other source. Demilade holds the list of names to check for. The management company is always described as **"a professional management team"**. The groundbreaking photos in `images/` have already had the backdrop logo removed. **Use these files, not any originals you find elsewhere.**

---

## 1. Reuse from the penthouse funnels

The penthouse funnel build (`/docs/penthouse-funnel-build/`, if it's in the repo) already has most of these components. Reuse them and drive the Falcon page from a config object (§6) rather than duplicating code.

- `FunnelHeader` with the gold **"Get Brochure & Title Docs"** button scrolling to `#enquire`.
- `HeroSection`: the video slot is a **self-hosted autoplaying MP4** here, not YouTube (§3).
- `FactStrip` (5 facts), `WalkthroughGrid` (4 chapters + floor plan block), `FAQAccordion`, `FinalCTA`, `FunnelFooter`, `ThankYouPage`.

New sections to build (copy and layout are in the design file):

1. **Statement band:** "THE OPPORTUNITY".
2. **On site:** "Ground has been broken." Three real groundbreaking photos in a 4:5 grid, then a divider and a **second video slot**: a click-to-play 9:16 video with "WATCH · 1 MINUTE / From the ground up." copy and a "Get the Brochure & Title Documents" button (§3).
3. **Big numbers:** 88% / ₦9–11M / 12.27, plus the italic quote and source line.
4. **The investment** (`#numbers`): two price panels (₦278M part-furnished, ₦232M unfurnished) with rent, yield, deposit and outright rows, then three payment-plan columns and the small-print line.
5. **How it earns:** 4 numbered steps on ivory.
6. **Location:** "Why Fadeyi, Yaba." with 4 drive-time rows.
7. **Who it's for:** "Whether you're…" three cards on the muted blue background.
8. **The title:** "Clean title." Registered Conveyance and survey plan (see §8.1).

---

## 2. The form (posts to Leadboard CRM)

**Fields** (labels exactly as in the design):

| Field | Key sent to Leadboard | Type | Required |
|---|---|---|---|
| Full name | `full_name` | text | ✓ |
| WhatsApp number (with country code) | `whatsapp` | tel | ✓ |
| Email | `email` | email | ✓ |
| Country of residence | `country` | text | ✓ |
| Which portfolio interests you? | `portfolio` | radio: `part-furnished` / `unfurnished` / `unsure` | |
| How would you pay? | `payment_preference` | radio: `outright` / `plan-6m` / `plan-8m` / `unsure` | |
| Timeline | `timeline` | radio: `now` / `3m` / `exploring` | |
| (hidden) property | `property` | hidden, set from `portfolio` (below) | ✓ |
| Consent checkbox | (not sent; just required) | checkbox | ✓ |

**Hidden `property`** must match the Leadboard product name exactly, character for character, including the en dash (–):

- `portfolio = part-furnished` → `Falcon Fadeyi – Part-Furnished 1-Bed Portfolio (2 Units)`
- `portfolio = unfurnished` **or** `unsure` **or** empty → `Falcon Fadeyi – Unfurnished 1-Bed Portfolio (2 Units)`

Consent label: *"I agree to be contacted by RokHaven Realty about this property and accept the [Privacy Policy](/privacy-policy)."*

**Leadboard endpoint** (public form, no secret key in the browser). **This is a different form and honeypot key from the penthouse funnels.**

```js
const FORM = "https://makarfi.leadboard.ng/api/v1/f/lbf_3dbf38d966cc58f1578e9eacfaa52b13";

// 1) fetch schema for a fresh anti-spam timestamp (when the form mounts)
const schema = await fetch(`${FORM}/schema/`).then(r => r.json());

// 2) submit
const res = await fetch(`${FORM}/submit/`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
  body: JSON.stringify({
    full_name, whatsapp, email, country,
    portfolio, payment_preference, timeline,
    property,                 // exact product name, see above
    utm_source, utm_medium, utm_campaign, utm_content,  // from the landing URL, if present
    lb_09a7136e: "",          // honeypot: always send empty, never render visibly
    lb_ts: schema.antispam.timestamp,
  }),
});
const data = await res.json();
if (!res.ok) { /* show data.field_errors inline; data.code for others */ }
else { fireConversion("Lead"); window.location.href = "/falcon-fadeyi-yaba/thank-you"; }
```

What Leadboard does with each submission (already set up, nothing to configure):
- Creates the lead in group **Falcon Leads**, tag `falcon-funnel`, source WEBSITE.
- Opens a deal titled "{full_name} – Falcon" in **Sales Pipeline → New Enquiry**, with the product attached.
- Emails **rokhavenrealty@gmail.com** and creates a 30-minute follow-up task.

Notes:
- The form only accepts submissions from `https://rokhaven.com` and `https://www.rokhaven.com`. **Localhost and preview URLs are rejected.** To test from a preview domain, ask Demilade to add it in Leadboard (Web forms → allowed origins), or test on production.
- Submissions sent less than 3 seconds after the schema fetch are refused. That's fine for real users.
- Validate in the browser first. The phone must include a country code (accept `+` and digits; default prefix `+234`).
- Button label: **"Get the Brochure & Title Documents"** with the small WhatsApp-bubble icon from the design. Disable it and show a spinner while submitting.
- The design's form button is a link to the thank-you file. In production it's a real submit button that redirects **only after** Leadboard returns OK.

---

## 3. Videos (self-hosted MP4)

| Slot | File | Behaviour |
|---|---|---|
| Hero | `images/falcon-3d-hero.mp4` (10s, 720×1280, no audio, 2.2 MB) + `falcon-3d-hero-poster.jpg` | `autoplay muted loop playsinline`, 9:16 frame, max-width 340px, 1px gold border. Label overlay "ARTIST'S IMPRESSION · 3D" bottom-left. |
| On site | `images/falcon-from-the-ground-up.mp4` (63s, 720×1280, with voiceover and burnt-in subtitles, 8.3 MB) + `falcon-from-the-ground-up-poster.jpg` | `controls playsinline preload="none"`, click to play **with sound**. Same frame style. |

- Hero: set `preload="metadata"` on slow connections if the repo has a pattern for that. The poster must show instantly.
- If the site uses a CDN or video host (Cloudflare Stream, Mux, Bunny…), upload both videos there instead and keep the same behaviour.
- Thank-you page: the design shows a still of the building (`falcon-exterior-front.jpg`) in a 9:16 frame. Keep it as an image.

---

## 4. Thank-you page

- Header: logo left, **"← Back to Falcon"** right (links to the sales page).
- Hero: "Thank you. Your brochure and title documents are *one message away.*" with a gold **"Get the Brochure & Title Documents"** WhatsApp button:

```
https://wa.me/2349167619009?text=${encodeURIComponent("Hi RokHaven, I just filled the form for the Falcon apartments in Fadeyi, Yaba. Can I get the brochure and the title documents?")}
```

- "What happens next": 3 steps, then the "Falcon at a glance" recap list. Copy is in `02-falcon-thank-you.html`.
- Fire `Contact` / `whatsapp_click` on the WhatsApp button (§5).
- `noindex, nofollow`, and keep it out of the sitemap.

---

## 5. Tracking

Reuse the penthouse funnel's pixel plumbing (env vars, consent gating). Events:

| Moment | Meta | TikTok | GA4 |
|---|---|---|---|
| Page view | `PageView` | `ViewContent` | `page_view` |
| Form submitted (Leadboard OK) | `Lead` | `SubmitForm` | `generate_lead` |
| WhatsApp click (thank-you page) | `Contact` | `Contact` | `whatsapp_click` |
| "From the ground up" video played | `ViewContent` (custom param `video: ground_up`) | — | `video_start` |

On `Lead`, pass `content_name` = the product name and `value` = 278000000 or 232000000 with `currency: "NGN"`.

---

## 6. Page config

```ts
export const falcon = {
  slug: "falcon-fadeyi-yaba",
  thankYou: "/falcon-fadeyi-yaba/thank-you",
  leadboardForm: "lbf_3dbf38d966cc58f1578e9eacfaa52b13",
  honeypotKey: "lb_09a7136e",
  products: {
    "part-furnished": { name: "Falcon Fadeyi – Part-Furnished 1-Bed Portfolio (2 Units)", priceNGN: 278000000 },
    "unfurnished":    { name: "Falcon Fadeyi – Unfurnished 1-Bed Portfolio (2 Units)",    priceNGN: 232000000 },
  },
  whatsapp: "2349167619009",
  waMessage: "Hi RokHaven, I just filled the form for the Falcon apartments in Fadeyi, Yaba. Can I get the brochure and the title documents?",
  videos: {
    hero: { src: "falcon-3d-hero.mp4", poster: "falcon-3d-hero-poster.jpg" },
    groundUp: { src: "falcon-from-the-ground-up.mp4", poster: "falcon-from-the-ground-up-poster.jpg" },
  },
  images: {
    exteriorStreet: "falcon-exterior-street", exteriorFront: "falcon-exterior-front",
    living: "falcon-living", bedroom: "falcon-bedroom", kitchen: "falcon-kitchen",
    floorplan: "falcon-floorplan",
    gbTeam: "falcon-groundbreaking-team", gbShovels: "falcon-groundbreaking-shovels", gbOnsite: "falcon-groundbreaking-onsite",
  },
  seo: {
    title: "Falcon Apartments, Fadeyi, Yaba | Off-Plan 1-Bed Rental Portfolios from ₦232M | RokHaven",
    description: "Own two managed one-bedroom apartments in Fadeyi, Yaba, let monthly to working professionals. Off-plan, completion December 2027. Portfolios from ₦232M with 30% down.",
  },
};
```

---

## 7. Design tokens

Same system as the penthouse funnels:

```css
--rh-navy:    #0B1B35;  /* primary background */
--rh-obsidian:#060F1C;  /* fact strip, big numbers, final CTA, footer */
--rh-muted:   #2A3F5C;  /* "Whether you're…" section */
--rh-gold:    #C0A870;  /* accent on dark only */
--rh-gold-ink:#7A6638;  /* gold-toned labels on ivory (contrast-safe) */
--rh-ivory:   #F4EDE0;  /* text on dark, light sections */
```

- Fonts: **DM Serif Display** (headlines, italic gold phrase) + **DM Sans** 200/300/400/500.
- Body 17px / 1.65, minimum 16px. Hero H1 `clamp(46px, 6vw, 80px)`, H2 `clamp(34px, 4vw, 48px)`. Caps labels 12–13px, letter-spacing 0.32–0.36em.
- Max width 1200px, 24px side gutter. Section padding about 100–110px desktop, 64px mobile.
- Square corners, 1px gold hairlines, no shadows, no gradients. Buttons 52–56px tall.
- **Mobile first:** works at 360–390px with no horizontal scroll. Videos stack under the copy.

---

## 8. Decisions and open items

1. **Title wording (confirmed 26 Oct).** The title is a **Registered Conveyance and survey plan. There is no C of O.** Never write "C of O" anywhere. The design files already use the confirmed wording: hero "30% DOWN · REGISTERED TITLE", fact strip "Registered / CONVEYANCE & SURVEY", title section "Registered Conveyance and survey plan." with "A 2026 search at the Lagos State Lands Registry found no encumbrances on record."
2. **CTA wording (confirmed 26 Oct).** Every CTA offers the brochure **and the title documents**. Buttons read "Get the Brochure & Title Documents" (the header button uses the short form "Get Brochure & Title Docs"). The form heading is "Get the brochure & *title documents.*" The thank-you WhatsApp message is in §4/§6. Keep all CTA labels and `waMessage` in config.
3. **Street spelling.** The design uses "Akorohunsayo Street". Some documents spell it "Akorohunfayo". Keep it in config and confirm with Demilade.

---

## 9. SEO + sharing

- `<title>` and meta description from §6. OpenGraph/Twitter card uses `falcon-exterior-street.jpg`.
- `RealEstateListing` / `Offer` JSON-LD: two offers (₦278M, ₦232M, priceCurrency NGN), addressLocality "Yaba", addressRegion "Lagos". **No developer or manager names.**
- Add the sales page to the sitemap. The thank-you page is `noindex` and stays out of it.

---

## 10. Acceptance checklist

- [ ] Both routes render and match the design reference at 1440 and 390 wide.
- [ ] Submitting creates a lead in **Falcon Leads** and a deal in **Sales Pipeline → New Enquiry** with the right product (check both portfolio choices). rokhavenrealty@gmail.com gets the alert.
- [ ] The browser goes to the thank-you page only after a successful submit, and field errors show inline (`aria-live`).
- [ ] The WhatsApp button opens with the exact pre-filled message.
- [ ] Hero video autoplays muted on iOS Safari and Android Chrome. "From the ground up" plays with sound on tap.
- [ ] No occurrence of "C of O" in the built pages, assets or metadata (`grep -ri` the build output). Ask Demilade for the list of company names to check for as well.
- [ ] Lighthouse mobile performance ≥ 85 (lazy-load below-the-fold images and the second video).
- [ ] Thank-you page is `noindex`. The consent checkbox is required and links to `/privacy-policy`.
- [ ] Keyboard navigation works and focus is visible.

**Do not hard-code any secret keys.** Only the public Leadboard form key (`lbf_…`) is used in the browser.
