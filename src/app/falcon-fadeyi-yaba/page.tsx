import type { Metadata } from 'next';
import Image from 'next/image';
import { falcon } from '@/lib/falcon';
import FunnelHeader from '@/components/funnel/FunnelHeader';
import FunnelFooter from '@/components/funnel/FunnelFooter';
import FunnelPixels from '@/components/funnel/FunnelPixels';
import EnquiryForm from '@/components/funnel/EnquiryForm';
import GroundUpVideo from '@/components/funnel/GroundUpVideo';
import s from '@/components/funnel/funnel.module.css';

const ogImage = `https://rokhaven.com${falcon.images.exteriorStreet}`;

export const metadata: Metadata = {
  title: falcon.seo.title,
  description: falcon.seo.description,
  alternates: { canonical: falcon.url },
  openGraph: { title: falcon.seo.title, description: falcon.seo.description, url: falcon.url, type: 'website', images: [{ url: ogImage }] },
  twitter: { card: 'summary_large_image', title: falcon.seo.title, description: falcon.seo.description, images: [ogImage] },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateListing',
  name: 'Falcon Apartments, Fadeyi, Yaba',
  description: falcon.seo.description,
  url: falcon.url,
  image: ogImage,
  address: { '@type': 'PostalAddress', addressLocality: 'Yaba', addressRegion: 'Lagos', addressCountry: 'NG' },
  offers: Object.values(falcon.products).map((p) => ({
    '@type': 'Offer',
    name: p.name,
    price: p.priceNGN,
    priceCurrency: 'NGN',
    availability: 'https://schema.org/PreOrder',
    url: falcon.url,
  })),
};

const facts = [
  ['1 or 2 Units', 'Per purchase'],
  ['60 m²', 'One-bedroom'],
  ['Registered', 'Conveyance & survey'],
  ['Managed', 'Tenants, rent & upkeep'],
  ['Dec 2027', 'Completion'],
];

const chapters = [
  { img: falcon.images.exteriorStreet, alt: 'Artist’s impression of the Falcon building and gated entrance', label: 'CHAPTER 01 · ARRIVAL', title: 'Gated, watched, always powered.', body: 'A controlled entrance, resident parking, CCTV, 24/7 backup power and treated water, with every common area managed for you.' },
  { img: falcon.images.living, alt: 'Artist’s impression of a Falcon living room', label: 'CHAPTER 02 · THE LIVING SPACE', title: 'Thirty-two square metres to unwind.', body: 'Open living and dining with sculpted feature lighting, full-height curtains and air conditioning.' },
  { img: falcon.images.bedroom, alt: 'Artist’s impression of a Falcon bedroom', label: 'CHAPTER 03 · THE BEDROOM', title: 'Made for a working life.', body: 'A desk, a wall-mounted TV and warm cove lighting, with an en-suite shower room and a separate guest WC.' },
  { img: falcon.images.kitchen, alt: 'Artist’s impression of a Falcon kitchen', label: 'CHAPTER 04 · THE KITCHEN', title: 'Ready for a tenant on day one.', body: 'A fitted kitchen beside the living room. Part-furnished units also come with a TV, two ACs, a bed, couches, a fridge and a gas cooker.' },
];

const groundbreaking = [
  { img: falcon.images.gbTeam, alt: 'The groundbreaking team in hard hats with shovels on the Falcon site', cap: 'The first ground' },
  { img: falcon.images.gbShovels, alt: 'Two members of the project team with shovels at the groundbreaking', cap: 'Shovels in the ground' },
  { img: falcon.images.gbOnsite, alt: 'The team talking on site under umbrellas at the groundbreaking', cap: 'On site, rain or shine' },
];

const panels = [
  { label: 'PART-FURNISHED · 2 UNITS', price: '₦278M', yield: '6.5%–7.9%', deposit: '₦83.4M', outright: '₦266.9M' },
  { label: 'UNFURNISHED · 2 UNITS', price: '₦232M', yield: '7.8%–9.5%', deposit: '₦69.6M', outright: '₦222.7M' },
];

const payPlans = [
  ['Outright', 'Pay 100% and get 4% off the list price.'],
  ['6 months', '30% deposit, then the balance in 6 monthly instalments, with no premium.'],
  ['8 months', '30% deposit, then the balance in 8 monthly instalments, with a 3% premium.'],
];

const earns = [
  ['You buy a unit or a portfolio', 'One unit, or two units on one floor, part-furnished or unfurnished.'],
  ['Falcon is completed', 'Completion is December 2027, with handover in March 2028.'],
  ['It gets let', 'Each unit is let monthly to working professionals.'],
  ['You get paid', 'The management team collects the rent and maintains the units, then pays you, keeping a 12% fee.'],
];

const drives = [
  ['8 min', 'to LUTH, one of Lagos’s largest employers of doctors and health workers.'],
  ['10 min', 'to the Yaba tech district and its startups and offices.'],
  ['12 min', 'to Third Mainland Bridge, the road to the Island.'],
  ['15 min', 'to Victoria Island and to the Secretariat at Alausa.'],
];

const audiences = [
  ['Building rental income', 'One or two units earning monthly rent, with tenants, collection and maintenance handled for you.'],
  ['Investing from abroad', 'Lagos property you never have to manage, with digital documents and site updates until handover.'],
  ['Moving on from shortlets', 'Steady professional tenants instead of nightly guests, so there are no bookings to chase and no empty weekdays.'],
];

const faqs = [
  ['Is the rental income guaranteed?', 'No. Rent depends on the market. Current benchmarks put a one-bedroom at ₦9M–₦11M a year, and projections assume 85% stabilised occupancy.'],
  ['Why is it sold as two units?', 'Falcon is part of a 100-unit rental portfolio. Selling units in portfolios keeps management efficient and protects every owner’s returns. It is also possible to buy just one unit.'],
  ['Who manages it, and what does it cost?', 'A professional management team runs the units unless you choose otherwise, and its fee is 12% of gross rent. A service charge covers security, CCTV, water treatment, cleaning, waste, common areas and backup power.'],
  ['Are there costs on top of the price?', 'Yes, a 5% legal and documentation fee. Every charge is disclosed before you sign the Sale Agreement.'],
  ['Can I resell before completion?', 'Yes, subject to the project’s documentation and transfer procedures.'],
  ['Will the price go up?', 'Today’s prices are an early-phase offer and will be reviewed as construction progresses.'],
];

const cta = falcon.cta.primary;

export default function FalconPage() {
  return (
    <div className={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FunnelPixels />
      <FunnelHeader cta={{ label: falcon.cta.header, href: '#enquire' }} />

      <main>
        {/* HERO */}
        <section className={s.hero}>
          <div className={s['hero-copy']}>
            <div className={s.label}>Fadeyi · Yaba · Lagos</div>
            <h1 className={s.h1}>Lagos pays <em className={s.gold}>monthly.</em> So should your property.</h1>
            <p className={s.lede}>Falcon is a building of furnished one-bedroom apartments in Fadeyi, Yaba, let by the month to working professionals. You can own a single unit or a two-unit portfolio. A professional management team finds the tenants, collects the rent and pays you.</p>
            <div className={s['price-line']}>
              <span>TWO-UNIT PORTFOLIOS FROM</span>
              <span className={s.price}>₦232M</span>
              <span>30% DOWN · REGISTERED TITLE</span>
            </div>
            <div className={s['btn-row']}>
              <a href="#enquire" className={s.btn}>{cta}</a>
              <a href="#numbers" className={`${s.btn} ${s['btn-ghost']}`}>See the numbers</a>
            </div>
          </div>
          <div className={s['video-col']}>
            <div className={s['video-frame']}>
              <video
                src={falcon.videos.hero.src}
                poster={falcon.videos.hero.poster}
                autoPlay muted loop playsInline preload="metadata"
                aria-label="3D animation of the Falcon building rising from construction to completion"
              />
              <span className={s['video-tag']}>ARTIST&apos;S IMPRESSION · 3D</span>
            </div>
          </div>
        </section>

        {/* FACT STRIP */}
        <section className={`${s.obsidian} ${s.ruled}`} style={{ borderBottom: '1px solid rgba(192,168,112,0.25)' }}>
          <div className={s.facts}>
            {facts.map(([b, l]) => (
              <div key={b} className={s.fact}><b>{b}</b><span>{l}</span></div>
            ))}
          </div>
        </section>

        {/* STATEMENT BAND */}
        <section className={`${s.wrap} ${s['wrap-lg']} ${s.narrow} ${s.col} ${s.center}`} style={{ gap: 24 }}>
          <div className={s.label}>The opportunity</div>
          <h2 className={s.h2}>Lagos professionals are paid every month. Their landlords still want <em className={s.gold}>two years upfront.</em></h2>
          <p className={s.dim} style={{ maxWidth: 680 }}>Falcon was built to close that gap. It offers well-finished, furnished homes close to work, with rent paid monthly, the way tenants earn. And you own the apartments in it.</p>
        </section>

        {/* WALKTHROUGH */}
        <section id="walkthrough" className={s.ivory}>
          <div className={`${s.wrap} ${s['stack-lg']}`}>
            <div className={s.head}>
              <div className={s.label}>The building</div>
              <h2 className={s.h2}>Calm to come home to. Easy to let.</h2>
            </div>
            <div className={s['grid-320']}>
              {chapters.map((c) => (
                <article key={c.label} className={s.article}>
                  <div className={s['chapter-img']}>
                    <Image src={c.img} alt={c.alt} fill sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw" loading="lazy" />
                  </div>
                  <div className={s['label-sm']}>{c.label}</div>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </article>
              ))}
            </div>
            <div className={s.plan}>
              <div className={s['label-sm']}>The plan · One floor, one portfolio</div>
              <Image src={falcon.images.floorplan} alt="Floor plan of two mirrored 60 square metre one-bedroom units either side of the stair core" width={1561} height={656} sizes="(min-width: 1200px) 1152px, 100vw" loading="lazy" />
              <p>Two mirrored 60 m² one-bedroom units sit either side of the stair core, and that pair is one portfolio, and you can also buy just one of the two. Each has a 32 m² living and kitchen space, a 15 m² bedroom, a 5 m² en-suite and a 3 m² guest WC.</p>
              <p className={s.small}>Images are artist’s impressions. Areas are taken from the architect’s drawings.</p>
            </div>
          </div>
        </section>

        {/* ON SITE */}
        <section className={`${s.wrap} ${s['wrap-lg']} ${s['stack-md']}`}>
          <div className={s['split-head']}>
            <div className={s.head}>
              <div className={s.label}>On site · Not a render</div>
              <h2 className={s.h2}>Ground has been <em className={s.gold}>broken.</em></h2>
            </div>
            <p className={s.dim}>Construction on {falcon.streetName} began in September 2026. These are real photographs from the groundbreaking, so you can see the project is already moving.</p>
          </div>
          <div className={s['grid-280']}>
            {groundbreaking.map((g) => (
              <figure key={g.img} className={s.photo}>
                <div className={s['photo-img']}>
                  <Image src={g.img} alt={g.alt} fill sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw" loading="lazy" />
                </div>
                <figcaption>{g.cap}</figcaption>
              </figure>
            ))}
          </div>
          <div className={s.watch}>
            <div className={s['video-col']}>
              <GroundUpVideo src={falcon.videos.groundUp.src} poster={falcon.videos.groundUp.poster} />
            </div>
            <div className={s['watch-copy']}>
              <div className={s.label}>Watch · 1 minute</div>
              <h3 className={s['h3-lg']}>From the ground <em className={s.gold}>up.</em></h3>
              <p className={s.dim}>A walk through the site as it stands today: the groundbreaking, the cleared plot and what the finished building will look like. Turn the sound on.</p>
              <a href="#enquire" className={`${s.btn} ${s.start}`}>{cta}</a>
            </div>
          </div>
        </section>

        {/* BIG NUMBERS */}
        <section className={s.obsidian}>
          <div className={`${s.wrap} ${s.col} ${s.center}`} style={{ gap: 48 }}>
            <div className={s.bignums}>
              <div className={s.bignum}><b>88%</b><span>OF LAGOS RENTERS PREFER MONTHLY</span></div>
              <div className={s.bignum}><b>₦9–11M</b><span>EST. RENT PER UNIT, PER YEAR</span></div>
              <div className={s.bignum}><b>12.27</b><span>COMPLETION</span></div>
            </div>
            <p className={s.quote}>“Your tenants pay monthly. You only have to decide once.”</p>
            <p className={s.small}>2021 survey of 1,389 Lagos residents (851 of them working professionals). Rent is a market estimate and is not guaranteed.</p>
          </div>
        </section>

        {/* THE NUMBERS */}
        <section id="numbers" className={`${s.wrap} ${s['wrap-lg']} ${s.col}`} style={{ gap: 48 }}>
          <div className={s.head}>
            <div className={s.label}>The investment</div>
            <h2 className={s.h2}>Executive One-Bedroom Portfolio.</h2>
            <p className={s.dim}>Two 60 m² one-bedroom units at early-phase prices. A single unit can also be bought, so ask us for its price. The studio portfolios are sold out.</p>
          </div>
          <div className={s['grid-320']} style={{ gap: 24 }}>
            {panels.map((p) => (
              <div key={p.label} className={s.panel}>
                <div className={s['label-sm']}>{p.label}</div>
                <div className={s['panel-price']}>{p.price}</div>
                <div className={`${s.row} ${s.first}`}><span>Est. gross rent</span><span className={s.gold}>₦18M–₦22M / yr</span></div>
                <div className={s.row}><span>Est. gross yield</span><span className={s.gold}>{p.yield}</span></div>
                <div className={s.row}><span>30% deposit</span><b>{p.deposit}</b></div>
                <div className={s.row}><span>Outright, 4% off</span><b>{p.outright}</b></div>
              </div>
            ))}
          </div>
          <div className={s['grid-240']}>
            {payPlans.map(([t, d]) => (
              <div key={t} className={s['plan-col']}><b>{t}</b><span>{d}</span></div>
            ))}
          </div>
          <p className={s.small}>A 5% legal and documentation fee applies. The management fee is 12% of gross rent. Rent estimates assume 85% stabilised occupancy and are not guaranteed. Gross yield is annual gross rent divided by the list price.</p>
        </section>

        {/* HOW IT EARNS */}
        <section className={s.ivory}>
          <div className={`${s.wrap} ${s['stack-md']}`}>
            <div className={s['stack-sm']}>
              <div className={s.label}>How it earns</div>
              <h2 className={s.h2}>You own it. <em>It’s managed for you.</em></h2>
            </div>
            <ol className={`${s.steps} ${s['grid-220']}`}>
              {earns.map(([t, d], i) => (
                <li key={t} className={s.step}><i>{String(i + 1).padStart(2, '0')}</i><strong>{t}</strong><span>{d}</span></li>
              ))}
            </ol>
          </div>
        </section>

        {/* LOCATION */}
        <section className={`${s.wrap} ${s['wrap-lg']} ${s.loc}`}>
          <div className={s['loc-copy']}>
            <div className={s.label}>The address</div>
            <h2 className={s.h2}>Why Fadeyi, Yaba.</h2>
            <p className={s.dim}>12 {falcon.streetName}, just off Ikorodu Road, on the mainland’s main employment corridor. Tenants who live close to work spend less time in traffic, and that keeps units let.</p>
          </div>
          <div className={s['loc-list']}>
            {drives.map(([t, d], i) => (
              <div key={t} className={`${s['line-row']} ${i === drives.length - 1 ? s.last : ''}`}><b>{t}</b><span>{d}</span></div>
            ))}
            <p className={s.small} style={{ marginTop: 14 }}>Drive times as stated by the developer. They vary with traffic.</p>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section className={s.muted}>
          <div className={`${s.wrap} ${s['stack-md']}`}>
            <h2 className={s.h2}>Whether you’re…</h2>
            <div className={s['grid-280']}>
              {audiences.map(([t, d]) => (
                <div key={t} className={s.card}><h3>{t}</h3><p>{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* THE TITLE */}
        <section className={`${s.wrap} ${s['stack-md']}`}>
          <div className={s['stack-sm']}>
            <div className={s.label}>The title</div>
            <h2 className={s.h2}>Clean title.</h2>
          </div>
          <div className={s['title-box']}>
            <strong>Registered Conveyance <em className={s.gold}>and survey plan.</em></strong>
            <span className={s.dim}>A 2026 search at the Lagos State Lands Registry found no encumbrances on record.</span>
          </div>
          <p className={s.dim} style={{ fontSize: 15 }}>Every enquiry is handled privately. Your interest is never shared with other buyers or the market.</p>
        </section>

        {/* FORM */}
        <section id="enquire" className={s.ivory}>
          <div className={`${s.wrap} ${s['form-wrap']} ${s['stack-md']}`} style={{ gap: 36 }}>
            <div className={`${s['stack-sm']} ${s.center}`}>
              <div className={s.label}>Private enquiry</div>
              <h2 className={s.h2}>Get the brochure &amp; <em className={s.gold}>title documents.</em></h2>
              <p style={{ maxWidth: 620 }}>Leave your details and an advisor will send you the full brochure, the title documents and the payment schedule on WhatsApp, and answer any questions.</p>
            </div>
            <EnquiryForm />
          </div>
        </section>

        {/* FAQ */}
        <section className={`${s.wrap} ${s['form-wrap']} ${s['stack-md']}`} style={{ gap: 32 }}>
          <h2 className={s.h2}>Questions investors ask.</h2>
          <div className={s.faq}>
            {faqs.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={`${s.obsidian} ${s.ruled}`}>
          <div className={`${s.wrap} ${s['wrap-lg']} ${s.narrow} ${s.col} ${s.center}`} style={{ gap: 28 }}>
            <h2 className={s.h2} style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', lineHeight: 1.1 }}>Property that pays the way Lagos is paid. Is it right for <em className={s.gold}>your portfolio?</em></h2>
            <a href="#enquire" className={s.btn} style={{ minHeight: 54, padding: '0 32px' }}>{cta}</a>
          </div>
        </section>
      </main>

      <FunnelFooter disclaimer="Prices are in Nigerian naira, are early-phase prices and are subject to review. Rent and yield figures are estimates, not guarantees. Interior and exterior images are artist’s impressions; site photographs are real. Specifications and dates are as provided by the developer and may vary. RokHaven Realty is the sales adviser." />
    </div>
  );
}
