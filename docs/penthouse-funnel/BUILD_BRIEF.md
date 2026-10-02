# RokHaven Penthouse Funnels: Build Brief for Claude Code

> **How to use this:** open Claude Code inside the rokhaven.com codebase. Copy the whole **"Penthouse Funnel Build"** folder into the repo (for example to `/docs/penthouse-funnel-build/`), along with the **"Penthouse Stills"** folder. Then paste:
>
> *"Read docs/penthouse-funnel-build/BUILD_BRIEF.md and build everything in it. Match the existing stack and conventions of this repo. Ask me before installing new dependencies."*

---

## 0. What we're building

Three paid-ad landing pages, one per penthouse. Each has a 2-step "Schedule a Call" form and its own thank-you page. There's also a privacy policy page.

| Page | Route |
|---|---|
| $4.5M Banana Island penthouse | `/penthouses/banana-island` |
| Thank you | `/penthouses/banana-island/thank-you` |
| $2.6M Old Ikoyi maisonette penthouse | `/penthouses/old-ikoyi-maisonette` |
| Thank you | `/penthouses/old-ikoyi-maisonette/thank-you` |
| $5M Old Ikoyi triplex penthouse | `/penthouses/old-ikoyi-triplex` |
| Thank you | `/penthouses/old-ikoyi-triplex/thank-you` |
| Privacy policy | `/privacy-policy` |

**Source of truth for layout and copy:** the HTML files in `design-reference/`. They are design mock-ups exported from Claude Design, written in a custom component format (`<x-dc>`, `{{ }}` holes, `<sc-if>`, `<sc-for>`, `<dc-import>`). **Don't copy that format.** Rebuild each page as normal components in this repo's stack. Keep the copy, structure, colours, spacing and type exactly as shown.

| Design file | Builds |
|---|---|
| `01-banana-island.html` | Banana Island sales page |
| `02-old-ikoyi-maisonette.html` | Maisonette sales page |
| `03-old-ikoyi-triplex.html` | Triplex sales page (includes the interactive floor-by-floor section) |
| `0X-…-thank-you.html` | The three thank-you pages |
| `shared-step2-scheduler.html` | Visual reference only for step 2. In production, step 2 is the **Cal.com embed** (see §4), not this custom calendar |

Images referenced in the designs live in the **Penthouse Stills** folder. Move them to the repo's public/static images folder, e.g. `/public/images/penthouses/`, and serve them as optimised WebP with JPG fallback.

---

## 1. Shared components to create

Build these once and reuse them across all three funnels. Each page should be driven by a **single property config object** (§6), so the three pages differ only in data.

1. `PenthouseLayout`: page shell (header + footer, dark navy background).
2. `FunnelHeader`: RokHaven arch mark + wordmark on the left (use the existing site logo asset if the repo has one). A gold **"Schedule a Call"** button on the right scrolls to `#enquire`.
3. `HeroSection`: eyebrow, H1 (one italic gold phrase), sub-copy, price row, CTA buttons, and a **YouTube Shorts embed** in a 9:16 frame (§3).
4. `FactStrip`: 5–6 key facts on Obsidian with gold numerals.
5. `RawBand`: the "No renders. No staging." statement.
6. `WalkthroughGrid`: 4 chapter cards (image + label + heading + text). The triplex uses `FloorExplorer` instead (§1a).
7. `ScarcityBlock`: three big gold numerals + a quote line.
8. `LocationFacts`: two columns, facts list + a source footnote.
9. `AudienceCards`: the "Whether you're…" three cards.
10. `ProcessSteps`: **"HOW WE WORK / Our process."**, six steps (copy is in the designs).
11. `EnquiryFunnel`: the 2-step form (§2 + §4).
12. `FAQAccordion`: native `<details>/<summary>` styled as in the designs.
13. `FinalCTA`: closing headline + "Schedule a Call" button (no WhatsApp button here).
14. `FunnelFooter`: legal footer + disclaimer line.
15. `ThankYouPage`: header with "← Back to the penthouse", success hero, **"WhatsApp an advisor"** button (pre-filled message per property), "What happens next" 3 steps, "Watch again" video + property recap list.

### 1a. Triplex `FloorExplorer`
Three buttons (Level 03 / 02 / 01) on the left and a details panel on the right (image 16:9, label, heading, body). Level 03 is selected by default. Buttons use `aria-pressed`, and selected state is navy background with gold text. The copy and images for each level are in `03-old-ikoyi-triplex.html` (inside the script's `LEVELS` array).

---

## 2. Step 1: the details form (posts to Leadboard CRM)

**Fields** (labels exactly as in the designs):

| Field | Key sent to Leadboard | Type | Required |
|---|---|---|---|
| Full name | `full_name` | text | ✓ |
| WhatsApp number (with country code) | `whatsapp` | tel | ✓ |
| Email | `email` | email | ✓ |
| Country of residence | `country` | text | ✓ |
| I'm buying to | `buying_goal` | radio: `live` / `invest` / `both` | |
| Timeline | `timeline` | radio: `now` / `3m` / `3-6m` / `exploring` | |
| Payment preference | `payment_preference` | radio: `outright` / `plan` / `financing` / `unsure` | |
| How should we meet? | `call_type` | radio: `video` / `phone` / `whatsapp` | |
| (hidden) property | `property` | hidden | ✓ |
| Consent checkbox | (not sent; just required) | checkbox | ✓ |

**Hidden `property` value must match the Leadboard product name exactly**, character for character:

- Banana Island page → `Banana Island Penthouse (5 Bed)`
- Maisonette page → `Old Ikoyi Maisonette Penthouse (4 Bed)`
- Triplex page → `Old Ikoyi Triplex Penthouse (4 Bed)`

Consent label: *"I agree to be contacted by RokHaven Realty about this property and accept the [Privacy Policy](/privacy-policy)."*

**Leadboard endpoint (public form, no secret key needed in the browser):**

```js
const FORM = "https://makarfi.leadboard.ng/api/v1/f/lbf_8f7c8e5ada8e79cbc992bf6147e5752f";

// 1) fetch schema for a fresh anti-spam timestamp (do this when the form mounts)
const schema = await fetch(`${FORM}/schema/`).then(r => r.json());

// 2) submit step 1
const res = await fetch(`${FORM}/submit/`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
  body: JSON.stringify({
    full_name, whatsapp, email, country,
    buying_goal, timeline, payment_preference, call_type,
    property,                 // exact product name, see above
    lb_351fd309: "",          // honeypot: always send empty, never render visibly
    lb_ts: schema.antispam.timestamp,
  }),
});
const data = await res.json();
if (!res.ok) { /* show data.field_errors inline; data.code for others */ }
// keep for step 2:
sessionStorage.setItem("lb_follow_up", data.follow_up_token);
```

Notes:
- Leadboard creates the lead (group **Penthouse Leads**), opens a deal in the **New Enquiry** stage linked to the product, emails **rokhavenrealty@gmail.com**, and creates a 30-minute follow-up task.
- The form only accepts submissions from `https://rokhaven.com` and `https://www.rokhaven.com`. **Localhost and preview URLs will be rejected.** To test from a preview domain, ask Demilade to add it in Leadboard (Web forms → allowed origins), or test on production.
- The form refuses submissions sent less than 3 seconds after the schema fetch. That's fine for real users.
- Validate in the browser first. Phone must include a country code (accept `+` and digits; default prefix `+234`).
- Button label: **"Continue: Pick a Date & Time"**. On success, hide step 1 and show step 2 in the same section with no page reload. Keep an "← Edit my details" link.

---

## 3. Videos (YouTube Shorts, public)

| Page | URL | Video ID |
|---|---|---|
| Banana Island | https://www.youtube.com/shorts/fWbw-RpHVoQ | `fWbw-RpHVoQ` |
| Old Ikoyi Maisonette | https://www.youtube.com/shorts/8cqWjhvHQlE | `8cqWjhvHQlE` |
| Old Ikoyi Triplex | https://www.youtube.com/shorts/LzAbP8ahWag | `LzAbP8ahWag` |

- Hero: embed `https://www.youtube-nocookie.com/embed/{ID}?autoplay=1&mute=1&loop=1&playlist={ID}&playsinline=1&rel=0&modestbranding=1` in a 9:16 frame (max-width 340px), gold 1px border.
- Use a **lite/facade pattern**: show the poster image (from Penthouse Stills, see §6) with a play button, and load the iframe on click/tap. On desktop, also autoplay muted once the hero is in view. This keeps the page fast on Nigerian mobile networks.
- The thank-you pages' "Watch again" block: same component, 300px max, facade + click to play.

---

## 4. Step 2: booking with Cal.com

- **Event:** `rokhaven-realty/private-call` (30 min, Google Meet, organiser calendar = rokhavenrealty@gmail.com).
- Use Cal.com's **inline embed** in the step 2 container. Load `https://app.cal.com/embed/embed.js` once and use a namespace per page.

```js
Cal("init", "rokhaven", { origin: "https://cal.com" });
Cal.ns.rokhaven("inline", {
  elementOrSelector: "#cal-step2",
  calLink: "rokhaven-realty/private-call",
  config: {
    name: full_name,
    email: email,
    // custom booking-question identifiers set up in Cal.com:
    whatsapp: whatsapp,
    property: property,
    country: country,
    layout: "month_view",
    theme: "light",
  },
});
Cal.ns.rokhaven("ui", {
  cssVarsPerTheme: { light: { "cal-brand": "#0B1B35" } },
  hideEventTypeDetails: false,
});
Cal.ns.rokhaven("on", {
  action: "bookingSuccessfulV2",          // also listen to "bookingSuccessful" for older embed versions
  callback: async (e) => {
    const b = e.detail.data;              // startTime, endTime, etc.
    // update the SAME Leadboard lead/deal (no duplicate)
    await fetch(`${FORM}/submit/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({
        lb_follow_up: sessionStorage.getItem("lb_follow_up"),
        call_datetime: b.startTime,
        call_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lb_partial: "0",
      }),
    });
    fireConversion("Schedule");            // see §5
    window.location.href = THANK_YOU_ROUTE; // per property
  },
});
```

- **Before launch, Demilade must check in Cal.com:** that the booking-question identifiers are exactly `whatsapp`, `property` and `country` so prefill works. If they differ, map them here.
- Cal.com's own picker handles time zones (with a selector), Mon–Sat availability, buffers and notice periods. **Don't rebuild the custom calendar** from `shared-step2-scheduler.html`. Use it only for heading copy ("STEP 2 OF 2 · PICK A TIME" / "When should we call you?" / "30-minute call about the {property}…").
- Fallback: if the embed fails to load within ~8 seconds, show a button **"Open the booking calendar"** linking to `https://cal.com/rokhaven-realty/private-call?name=…&email=…` in a new tab.

---

## 5. Tracking (pixels not supplied yet)

Add the plumbing now with env vars, so pixels switch on when the IDs arrive:

- `NEXT_PUBLIC_META_PIXEL_ID` (or the repo's env convention) → Meta Pixel base code on the 6 funnel pages.
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID` → TikTok Pixel base code.
- If the site already has GA4 / Google Tag Manager, reuse it.
- Events:

| Moment | Meta | TikTok | GA4 |
|---|---|---|---|
| Page view | `PageView` | `ViewContent` | `page_view` |
| Step 1 submitted | `Lead` | `SubmitForm` | `generate_lead` |
| Booking confirmed | `Schedule` | `Schedule` (custom name OK) | `book_call` |
| WhatsApp click | `Contact` | `Contact` | `whatsapp_click` |

Pass `content_name` = property name and `value` = price in USD on `Lead`/`Schedule`.

- Load tags only after cookie consent where required (§7). Keep UTM parameters (`utm_source`, `utm_campaign`, etc.) and send them to Leadboard as extra fields `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Leadboard stores unknown keys as custom fields.

---

## 6. Property config (single source per page)

```ts
export const penthouses = {
  "banana-island": {
    productName: "Banana Island Penthouse (5 Bed)",
    priceUSD: 4500000, priceLabel: "US$4.5M",
    youtubeId: "fWbw-RpHVoQ",
    poster: "banana-04-terrace",
    thankYou: "/penthouses/banana-island/thank-you",
    waMessage: "Hi RokHaven, I just scheduled a call about the $4.5M Banana Island penthouse.",
    images: { lift: "banana-01-lift", pool: "banana-02-pool", living: "banana-03-living", bedroom: "banana-06-bedroom", terrace: "banana-04-terrace", staircase: "banana-05-staircase" },
    seo: { title: "$4.5M Banana Island Penthouse | 5 Bed with Private Pool | RokHaven Realty",
           description: "A five-bedroom Banana Island penthouse with its own private pool level, private lift and 180° terrace. 2 units. Target completion March 2027. Schedule a private call." },
  },
  "old-ikoyi-maisonette": {
    productName: "Old Ikoyi Maisonette Penthouse (4 Bed)",
    priceUSD: 2600000, priceLabel: "US$2.6M",
    youtubeId: "8cqWjhvHQlE",
    poster: "maisonette-02-living-kitchen",
    thankYou: "/penthouses/old-ikoyi-maisonette/thank-you",
    waMessage: "Hi RokHaven, I just scheduled a call about the $2.6M Old Ikoyi penthouse.",
    images: { cinema: "maisonette-01-cinema", living: "maisonette-02-living-kitchen", bedroom: "maisonette-03-bedroom", master: "maisonette-04-master", bathroom: "maisonette-05-bathroom", stairs: "maisonette-06-stairs" },
    seo: { title: "$2.6M Old Ikoyi Penthouse | 4 Bed Maisonette with Private Cinema | RokHaven",
           description: "A two-level, 4-bedroom maisonette penthouse in Old Ikoyi with a private cinema, double-height living and a terrace master suite. 95% complete. One unit." },
  },
  "old-ikoyi-triplex": {
    productName: "Old Ikoyi Triplex Penthouse (4 Bed)",
    priceUSD: 5000000, priceLabel: "US$5M",
    youtubeId: "LzAbP8ahWag",
    poster: "triplex-05-roof-terrace",
    thankYou: "/penthouses/old-ikoyi-triplex/thank-you",
    waMessage: "Hi RokHaven, I just scheduled a call about the $5M Old Ikoyi triplex penthouse.",
    images: { living: "triplex-01-living", bedroom: "triplex-02-bedroom", balcony: "triplex-03-master-balcony", pool: "triplex-04-pool-level", roof: "triplex-05-roof-terrace" },
    seo: { title: "$5M Old Ikoyi Triplex Penthouse | Private Pool, Gym, Sauna & Cinema | RokHaven",
           description: "A 4-bedroom triplex penthouse in Old Ikoyi with a whole top floor for your private pool, gym, sauna and cinema. 2 units. Proposed completion August 2027." },
  },
};
```

WhatsApp link format: `https://wa.me/2349167619009?text=${encodeURIComponent(waMessage)}`.
The triplex thank-you page also has a second button, **"Get the latest progress video"**, with the message "Hi RokHaven, please send me the latest site progress video of the Old Ikoyi triplex."

---

## 7. Privacy policy + consent

- Create `/privacy-policy` from `RokHaven_Privacy_Policy_DRAFT.md`, which sits in the parent RokHaven Realty Website folder. **Do not publish the "DRAFT for review" notice.** Demilade will confirm once a lawyer has reviewed it. Until then, build the page but keep the effective date as a variable.
- Fix any existing broken privacy-policy links in the site footer so they point to `/privacy-policy`.
- Add a simple cookie consent banner (Accept / Reject non-essential) if the site has none. Load Meta/TikTok/analytics tags only after Accept.

---

## 8. Design tokens

```css
--rh-navy:    #0B1B35;  /* primary background */
--rh-obsidian:#060F1C;  /* deepest sections, footer */
--rh-muted:   #2A3F5C;  /* cards */
--rh-gold:    #C0A870;  /* accent: CTAs, prices, numerals (on dark only) */
--rh-gold-ink:#7A6638;  /* gold-toned labels on ivory backgrounds (contrast-safe) */
--rh-ivory:   #F4EDE0;  /* text on dark, light sections */
--rh-line:    rgba(192,168,112,0.30);
```

- Fonts: **DM Serif Display** (headlines, italic for the gold phrase) + **DM Sans** 200/300/400/500. Load them from Google Fonts or self-host.
- Body 17px / 1.65, minimum 16px everywhere. Hero H1 `clamp(46px, 6vw, 80px)`. H2 `clamp(34px, 4vw, 48px)`. Caps labels 12–13px, letter-spacing 0.32–0.36em.
- Max content width 1200px, side gutter 24px. Section vertical padding about 100px desktop and 64px mobile.
- Square corners (no border radius), 1px gold hairlines, no drop shadows, no gradients.
- Buttons: min-height 52–56px. Primary = gold background with navy text. Secondary = 1px border.
- **Mobile first.** Everything must work at 360–390px wide, with no horizontal scroll. The hero video stacks under the copy. Fact strip, cards and steps reflow into 1–2 columns.

---

## 9. SEO + sharing

- Unique `<title>` and meta description per page (see §6). Add OpenGraph/Twitter cards using the poster image.
- Add `RealEstateListing` / `Offer` JSON-LD with name, description, price, priceCurrency USD, image and address locality (Banana Island / Old Ikoyi, Lagos).
- **Thank-you pages: `noindex, nofollow`**, and leave them out of the sitemap.
- Add the three sales pages to the sitemap.

---

## 10. Acceptance checklist

- [ ] All 7 routes render and match the design reference on desktop (1440) and mobile (390).
- [ ] Step 1 submit creates a lead and deal in Leadboard (RokHaven Realty → Sales Pipeline → New Enquiry), with the correct product attached. rokhavenrealty@gmail.com receives the alert.
- [ ] Step 2 shows Cal.com with name and email prefilled. Booking creates a Google Calendar event with a Meet link and confirmation emails.
- [ ] After booking: the second Leadboard post updates the same lead/deal with `call_datetime`, then the browser redirects to the right thank-you page.
- [ ] Booking without completing step 1 is impossible (step 2 is hidden until step 1 succeeds).
- [ ] WhatsApp buttons open with the right pre-filled message.
- [ ] YouTube facades load the right video. Lighthouse mobile performance ≥ 85.
- [ ] Privacy policy page live. The consent checkbox is required and links to it.
- [ ] Thank-you pages are `noindex`.
- [ ] Keyboard navigation works, focus is visible, and form errors are announced (`aria-live`).

**Do not hard-code any secret keys.** Only the public Leadboard form key (`lbf_…`) and public Cal.com link are used in the browser.
