export type PortfolioKey = 'part-furnished' | 'unfurnished';

export const falcon = {
  slug: 'falcon-fadeyi-yaba',
  url: 'https://rokhaven.com/falcon-fadeyi-yaba',
  thankYou: '/falcon-fadeyi-yaba/thank-you',
  leadboardForm: 'lbf_3dbf38d966cc58f1578e9eacfaa52b13',
  honeypotKey: 'lb_09a7136e',
  products: {
    'part-furnished': { name: 'Falcon Fadeyi – Part-Furnished 1-Bed Portfolio (2 Units)', priceNGN: 278000000 },
    unfurnished: { name: 'Falcon Fadeyi – Unfurnished 1-Bed Portfolio (2 Units)', priceNGN: 232000000 },
  } satisfies Record<PortfolioKey, { name: string; priceNGN: number }>,
  whatsapp: '2349167619009',
  waMessage:
    'Hi RokHaven, I just filled the form for the Falcon apartments in Fadeyi, Yaba. Can I get the brochure and the title documents?',
  privacyHref: '/privacy',
  cta: {
    primary: 'Get the Brochure & Title Documents',
    header: 'Get Brochure & Title Docs',
  },
  streetName: 'Akorohunsayo Street', // confirm spelling (Akorohunfayo?) with Demilade
  videos: {
    hero: { src: '/videos/falcon/falcon-3d-hero.mp4', poster: '/videos/falcon/falcon-3d-hero-poster.jpg' },
    groundUp: {
      src: '/videos/falcon/falcon-from-the-ground-up.mp4',
      poster: '/videos/falcon/falcon-from-the-ground-up-poster.jpg',
    },
  },
  images: {
    exteriorStreet: '/images/falcon/falcon-exterior-street.jpg',
    exteriorFront: '/images/falcon/falcon-exterior-front.jpg',
    living: '/images/falcon/falcon-living.jpg',
    bedroom: '/images/falcon/falcon-bedroom.jpg',
    kitchen: '/images/falcon/falcon-kitchen.jpg',
    floorplan: '/images/falcon/falcon-floorplan.png',
    gbTeam: '/images/falcon/falcon-groundbreaking-team.jpg',
    gbShovels: '/images/falcon/falcon-groundbreaking-shovels.jpg',
    gbOnsite: '/images/falcon/falcon-groundbreaking-onsite.jpg',
  },
  seo: {
    title: 'Falcon Apartments, Fadeyi, Yaba | Off-Plan 1-Bed Rental Portfolios from ₦232M | RokHaven',
    description:
      'Own two managed one-bedroom apartments in Fadeyi, Yaba, let monthly to working professionals. Off-plan, completion December 2027. Portfolios from ₦232M with 30% down.',
  },
};

export function productFor(portfolio: string) {
  return portfolio === 'part-furnished' ? falcon.products['part-furnished'] : falcon.products.unfurnished;
}

export function whatsappHref() {
  return `https://wa.me/${falcon.whatsapp}?text=${encodeURIComponent(falcon.waMessage)}`;
}
