export type PenthouseKey = 'banana-island' | 'old-ikoyi-maisonette' | 'old-ikoyi-triplex';

export interface FloorLevel {
  id: string;
  num: string;
  tag: string;
  name: string;
  headline: string;
  body: string;
  img: string;
  alt: string;
}

export interface WalkthroughChapter {
  img: string;
  alt: string;
  label: string;
  heading: string;
  body: string;
}

export interface FactStripItem {
  value: string;
  label: string;
}

export interface ScarcityItem {
  value: string;
  label: string;
}

export interface LocationFact {
  value: string;
  body: string;
}

export interface AudienceCard {
  heading: string;
  body: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ProcessStep {
  num: string;
  title: string;
  body: string;
}

export interface ThankYouRecapRow {
  label: string;
  value: string;
}

export interface PenthouseConfig {
  leadboardFormKey: string;
  productName: string;
  priceUSD: number;
  priceLabel: string;
  youtubeId: string;
  poster: string;
  thankYou: string;
  waMessage: string;
  waMessageProgress?: string;
  seo: { title: string; description: string };

  eyebrow: string;
  h1Plain: string;
  h1Gold: string;
  subCopy: string;
  completionLabel: string;
  heroCTASecondary: string;
  heroCTASecondaryHref: string;
  heroVideoLabel: string;

  facts: FactStripItem[];

  rawBandLabel: string;
  rawBandHeadingPlain: string;
  rawBandHeadingGold: string;
  rawBandBody: string;

  walkthroughLabel?: string;
  walkthroughHeading: string;
  chapters?: WalkthroughChapter[];
  floors?: FloorLevel[];

  scarcityItems: ScarcityItem[];
  scarcityQuote: string;

  locationLabel: string;
  locationHeading: string;
  locationIntro: string;
  locationFacts: LocationFact[];
  locationSource: string;

  audienceCards: AudienceCard[];

  processSteps: ProcessStep[];

  faqHeading: string;
  faqs: FAQItem[];

  finalCTAPlain: string;
  finalCTAGold: string;

  addressLocality: string;

  thankYouCallLabel: string;
  thankYouHeroParagraph: string;
  thankYouWatchAgainLabel: string;
  thankYouRecapHeading: string;
  thankYouRecap: ThankYouRecapRow[];
  thankYouRecapNote: string;
  thankYouNextStepThree: string;
}

const WA_BASE = 'https://wa.me/2349167619009';

export const penthouses: Record<PenthouseKey, PenthouseConfig> = {
  'banana-island': {
    leadboardFormKey: 'lbf_b31875650fe98bf986c0f26783cdfaa3',
    productName: 'Banana Island Penthouse (5 Bed)',
    priceUSD: 4500000,
    priceLabel: 'US$4.5M',
    youtubeId: 'fWbw-RpHVoQ',
    poster: 'banana-04-terrace',
    thankYou: '/penthouses/banana-island/thank-you',
    waMessage: 'Hi RokHaven, I just scheduled a call about the $4.5M Banana Island penthouse.',
    seo: {
      title: '$4.5M Banana Island Penthouse | 5 Bed with Private Pool | RokHaven Realty',
      description:
        'A five-bedroom Banana Island penthouse with its own private pool level, private lift and 180° terrace. 2 units. Target completion March 2027. Schedule a private call.',
    },

    eyebrow: 'BANANA ISLAND · LAGOS · 2 UNITS ONLY',
    h1Plain: 'Before the ',
    h1Gold: 'staging.',
    subCopy:
      'A five-bedroom Banana Island penthouse, shown raw, real and in progress, with its own private pool level, a private lift and a 180° view of the island.',
    completionLabel: 'COMPLETION TARGETED MARCH 2027',
    heroCTASecondary: 'Watch the walkthrough',
    heroCTASecondaryHref: '#walkthrough',
    heroVideoLabel: 'WATCH THE WALKTHROUGH',

    facts: [
      { value: '5', label: 'EN-SUITE BEDROOMS' },
      { value: 'Private', label: 'POOL & GYM LEVEL' },
      { value: 'Private', label: 'ELEVATOR' },
      { value: '3-Room', label: 'BQ INCLUDED' },
      { value: '4 Cars', label: 'DEDICATED PARKING' },
    ],

    rawBandLabel: 'NO RENDERS · NO STAGING',
    rawBandHeadingPlain: "If you're investing at this level, you deserve to see it ",
    rawBandHeadingGold: 'exactly as it is.',
    rawBandBody:
      'We skipped the cinematic filters and the glitzy music. What you see is real site footage of the structure as it stands today, so you can judge the scale, the light and the layout for yourself.',

    walkthroughLabel: 'THE WALKTHROUGH',
    walkthroughHeading: 'Your level. Your home. Your view.',
    chapters: [
      {
        img: '/images/penthouses/banana-01-lift.jpg',
        alt: 'The private elevator',
        label: 'CHAPTER 01 · ARRIVAL',
        heading: 'Straight to your door.',
        body: 'Four dedicated parking spaces. A private elevator that rises straight to your penthouse, with no shared corridors.',
      },
      {
        img: '/images/penthouses/banana-02-pool.jpg',
        alt: 'The private pool level',
        label: 'CHAPTER 02 · THE PRIVATE LEVEL',
        heading: 'This level belongs entirely to you.',
        body: 'A private gym area and an exclusive private pool, purely for your personal use.',
      },
      {
        img: '/images/penthouses/banana-03-living.jpg',
        alt: 'Two-floor living space',
        label: 'CHAPTER 03 · THE PENTHOUSE',
        heading: 'Two floors, built for hosting.',
        body: 'Huge open living and ante-room spaces with natural light throughout, a floating spiral staircase, wet and dry kitchens, a private cinema room, and a sweeping 180° terrace overlooking Banana Island.',
      },
      {
        img: '/images/penthouses/banana-06-bedroom.jpg',
        alt: 'Bedroom',
        label: 'CHAPTER 04 · THE BEDROOMS',
        heading: 'Every space built to scale.',
        body: 'Five en-suite bedrooms, a private sauna room built into the layout, and a master suite with its own balcony view and an expansive walk-in closet. A three-room BQ is included.',
      },
    ],

    scarcityItems: [
      { value: '2', label: 'UNITS AVAILABLE' },
      { value: '1,300 sqm²', label: 'APPROX. PLOT' },
      { value: '03.27', label: 'TARGET COMPLETION' },
    ],
    scarcityQuote:
      '"Two of these will exist. When they\'re allocated, this layout won\'t come back."',

    locationLabel: 'THE ADDRESS',
    locationHeading: 'Why Banana Island.',
    locationIntro:
      'A gated peninsula off the Ikoyi foreshore, and the address of choice for some of Nigeria\'s most influential families, business leaders and diplomats.',
    locationFacts: [
      { value: '~536', body: 'plots on the island, and nearly all are developed. New supply is close to impossible.' },
      { value: '1 gate', body: 'A single controlled entry point with 24/7 security patrols and surveillance.' },
      { value: 'Below', body: 'Underground power lines, central sewage treatment, fibre internet and engineered drainage.' },
      { value: '₦3M+', body: 'Land reported at roughly ₦3.05M–₦3.8M per m² (2025).' },
    ],
    locationSource: 'Source: Nigeria Housing Market, "Banana Island Lagos" (2026). Market context only, not a guarantee of future value.',

    audienceCards: [
      { heading: 'Moving your family in', body: 'Privacy, a private amenity level of your own, and two floors of space for hosting.' },
      { heading: 'Buying from abroad', body: 'Live video walkthroughs on your schedule, a digital document pack, and progress updates until handover.' },
      { heading: 'Holding dollar assets', body: 'One of Lagos\'s scarcest addresses, secured before completion.' },
    ],

    processSteps: [
      { num: '01', title: 'Schedule a call', body: 'A virtual meeting with you, so we can be sure this is a good fit and also see if there are other options available.' },
      { num: '02', title: 'Private viewing', body: 'In person on Banana Island, or by live video if you\'re abroad.' },
      { num: '03', title: 'Offer letter', body: 'After your viewing, once you\'re pleased, we agree your unit, price and payment structure in writing.' },
      { num: '04', title: 'Document pack', body: 'Once the offer letter is accepted, you receive the full set of documents for your own lawyer\'s due diligence.' },
      { num: '05', title: 'Secure your unit', body: 'Make the deposit stated in your offer letter.' },
      { num: '06', title: 'Updates to handover', body: 'Site progress updates until completion.' },
    ],

    faqHeading: 'Questions buyers ask.',
    faqs: [
      { q: 'What exactly is included at US$4.5M?', a: 'The five-bedroom, two-floor penthouse, the private gym and pool level, private elevator access, a three-room BQ and parking for four cars. The full specification is shared on request.' },
      { q: 'When will it be completed?', a: 'Completion is targeted for March 2027.' },
      { q: 'Is the pool shared?', a: 'No. The pool and gym level is for the penthouse residents only.' },
      { q: 'Can I see it if I live abroad?', a: 'Yes. We run live video walkthroughs on your schedule.' },
      { q: 'What are the payment terms?', a: 'Payment terms are shared privately once you\'ve viewed the property and are ready to make an offer. They\'re set out in writing in your offer letter.' },
    ],

    finalCTAPlain: 'Now that you\'ve seen the real structure, is this one for ',
    finalCTAGold: 'your portfolio?',

    addressLocality: 'Banana Island, Lagos',

    thankYouCallLabel: 'CALL BOOKED · BANANA ISLAND PENTHOUSE',
    thankYouHeroParagraph: 'A calendar invite with your call details has been sent to your email. Need to talk sooner? Message an advisor now.',
    thankYouWatchAgainLabel: 'WATCH AGAIN',
    thankYouRecapHeading: 'A five-bedroom penthouse with its own private pool level.',
    thankYouRecap: [
      { label: 'Price', value: 'US$4.5M' },
      { label: 'Bedrooms', value: '5 en-suite + 3-room BQ' },
      { label: 'Private level', value: 'Pool, gym · private elevator' },
      { label: 'Units available', value: '2' },
      { label: 'Target completion', value: 'March 2027' },
    ],
    thankYouRecapNote: 'To make the most of the call, have your timeline and preferred payment approach in mind, along with any questions about the space.',
    thankYouNextStepThree: 'On site in Banana Island, or by live video if you\'re abroad.',
  },

  'old-ikoyi-maisonette': {
    leadboardFormKey: 'lbf_e14a47a2e4e6b795de49907edbde831c',
    productName: 'Old Ikoyi Maisonette Penthouse (4 Bed)',
    priceUSD: 2600000,
    priceLabel: 'US$2.6M',
    youtubeId: '8cqWjhvHQlE',
    poster: 'maisonette-02-living-kitchen',
    thankYou: '/penthouses/old-ikoyi-maisonette/thank-you',
    waMessage: 'Hi RokHaven, I just scheduled a call about the $2.6M Old Ikoyi penthouse.',
    seo: {
      title: '$2.6M Old Ikoyi Penthouse | 4 Bed Maisonette with Private Cinema | RokHaven',
      description:
        'A two-level, 4-bedroom maisonette penthouse in Old Ikoyi with a private cinema, double-height living and a terrace master suite. 95% complete. One unit.',
    },

    eyebrow: 'OLD IKOYI · LAGOS · 1 UNIT AVAILABLE',
    h1Plain: 'Worth it before ',
    h1Gold: 'the furniture.',
    subCopy:
      'A two-level penthouse in Old Ikoyi with a private cinema, double-height living and a master suite that opens onto its own terrace, filmed completely unedited.',
    completionLabel: '4-BEDROOM MAISONETTE · 95% COMPLETE',
    heroCTASecondary: 'See it unedited',
    heroCTASecondaryHref: '#walkthrough',
    heroVideoLabel: 'WATCH IT UNEDITED',

    facts: [
      { value: '4', label: 'BEDROOMS' },
      { value: 'Private', label: 'CINEMA' },
      { value: 'Double', label: 'HEIGHT LIVING' },
      { value: '2', label: 'LEVELS' },
      { value: 'Terrace', label: 'MASTER SUITE' },
    ],

    rawBandLabel: 'COMPLETELY UNEDITED',
    rawBandHeadingPlain: 'Serious buyers want to see a property ',
    rawBandHeadingGold: 'exactly as it is.',
    rawBandBody:
      'No cinematic lighting. No fancy edits. This is the penthouse as it stands, so that when you walk in, it\'s exactly what you expected.',

    walkthroughLabel: 'THE WALKTHROUGH',
    walkthroughHeading: 'Two levels, one rhythm.',
    chapters: [
      {
        img: '/images/penthouses/maisonette-01-cinema.jpg',
        alt: 'Private cinema',
        label: 'LEVEL 1 · ARRIVE',
        heading: 'A cinema, right off the entrance.',
        body: 'Your fully equipped private cinema is the first room you meet.',
      },
      {
        img: '/images/penthouses/maisonette-02-living-kitchen.jpg',
        alt: 'Double-height living and kitchen',
        label: 'LEVEL 1 · ENTERTAIN',
        heading: 'Double height, built for hosting.',
        body: 'A massive double-height living area, a custom dry kitchen island, and the main wet kitchen behind it, fully fitted with built-in appliances.',
      },
      {
        img: '/images/penthouses/maisonette-03-bedroom.jpg',
        alt: 'En-suite bedroom',
        label: 'LEVEL 1 → LEVEL 2',
        heading: 'Guest suites, then a private floor.',
        body: 'Two spacious en-suite bedrooms on the main level with custom fitted wardrobes and natural light. A floating staircase rises to a private second family lounge.',
      },
      {
        img: '/images/penthouses/maisonette-04-master.jpg',
        alt: 'Master suite',
        label: 'LEVEL 2 · THE MASTER SUITE',
        heading: 'A terrace of your own.',
        body: 'A private terrace, an expansive walk-in closet, and an en-suite bathroom with double vanities and a deep soaking tub.',
      },
    ],

    scarcityItems: [
      { value: '1', label: 'UNIT AVAILABLE' },
      { value: '2', label: 'LEVELS' },
      { value: '$2.6M', label: 'ASKING PRICE' },
    ],
    scarcityQuote: '"There is one. When it\'s gone, it\'s gone."',

    locationLabel: 'THE ADDRESS',
    locationHeading: 'Why Old Ikoyi.',
    locationIntro:
      'Lagos\'s established premium address, with leafy, low-density streets, close to the Bourdillon and Glover corridor of restaurants and private clubs.',
    locationFacts: [
      { value: '+81%', body: 'Ikoyi land prices in five years, from ₦1.35M to ₦2.45M per m², the highest of the Lagos Island areas surveyed.' },
      { value: 'Demand', body: 'Steady demand from diplomats, expatriates, C-suite executives and high-net-worth families.' },
      { value: 'Supply', body: 'Little land left to build on, and construction costs keep rising, which keeps prices supported.' },
    ],
    locationSource: 'Source: Lagos Realty, Lagos Island Residential Market Report 2026 (via Nairametrics, July 2026). Market context only, not a guarantee of future value.',

    audienceCards: [
      { heading: 'Setting up a Lagos base', body: 'Guest suites downstairs, a private family floor upstairs, and a cinema for the evenings.' },
      { heading: 'Coming home from abroad', body: 'A live video walkthrough on your schedule, and documents shared digitally for your lawyer.' },
      { heading: 'Holding a dollar asset', body: 'A penthouse in Lagos\'s most established address, priced in US Dollars.' },
    ],

    processSteps: [
      { num: '01', title: 'Schedule a call', body: 'A virtual meeting with you, so we can be sure this is a good fit and also see if there are other options available.' },
      { num: '02', title: 'Private viewing', body: 'In person in Old Ikoyi, or by live video if you\'re abroad.' },
      { num: '03', title: 'Offer letter', body: 'After your viewing, once you\'re pleased, we agree your unit, price and payment structure in writing.' },
      { num: '04', title: 'Document pack', body: 'Once the offer letter is accepted, you receive the full set of documents for your own lawyer\'s due diligence.' },
      { num: '05', title: 'Secure your unit', body: 'Make the deposit stated in your offer letter.' },
      { num: '06', title: 'Updates to handover', body: 'We keep you updated and handle every detail through to your keys.' },
    ],

    faqHeading: 'Questions buyers ask.',
    faqs: [
      { q: 'Is it ready to move in?', a: 'Almost. The penthouse is about 95% complete, with finishing touches underway. The interiors you see in the video are already in place.' },
      { q: 'Is the cinema equipped?', a: 'Yes. The cinema room just off the entrance is fully equipped.' },
      { q: 'What building amenities are there?', a: 'The building comes with a full set of amenities. Your advisor will take you through them on your call and at your viewing.' },
      { q: 'Can I view it from abroad?', a: 'Yes. We run live video walkthroughs on your schedule.' },
      { q: 'What are the payment terms?', a: 'Payment terms are shared privately once you\'ve viewed the property and are ready to make an offer. They\'re set out in writing in your offer letter.' },
    ],

    finalCTAPlain: 'You\'ve seen it unedited. ',
    finalCTAGold: 'Now see it in person.',

    addressLocality: 'Old Ikoyi, Lagos',

    thankYouCallLabel: 'CALL BOOKED · OLD IKOYI PENTHOUSE',
    thankYouHeroParagraph: 'A calendar invite with your call details has been sent to your email. There is only one unit, so if you\'d like to move quickly, message an advisor now.',
    thankYouWatchAgainLabel: 'WATCH AGAIN',
    thankYouRecapHeading: 'A two-level penthouse with a private cinema.',
    thankYouRecap: [
      { label: 'Price', value: 'US$2.6M' },
      { label: 'Layout', value: '4-bedroom maisonette, 2 levels' },
      { label: 'Highlights', value: 'Cinema · double-height living · terrace master' },
      { label: 'Units available', value: '1' },
    ],
    thankYouRecapNote: 'To make the most of the call, have your timeline and preferred payment approach in mind, along with any questions about the space.',
    thankYouNextStepThree: 'In person in Old Ikoyi, or by live video if you\'re abroad.',
  },

  'old-ikoyi-triplex': {
    leadboardFormKey: 'lbf_90ef47c79039547e789b30744bafd84a',
    productName: 'Old Ikoyi Triplex Penthouse (4 Bed)',
    priceUSD: 5000000,
    priceLabel: 'US$5M',
    youtubeId: 'LzAbP8ahWag',
    poster: 'triplex-05-roof-terrace',
    thankYou: '/penthouses/old-ikoyi-triplex/thank-you',
    waMessage: 'Hi RokHaven, I just scheduled a call about the $5M Old Ikoyi triplex penthouse.',
    waMessageProgress: 'Hi RokHaven, please send me the latest site progress video of the Old Ikoyi triplex.',
    seo: {
      title: '$5M Old Ikoyi Triplex Penthouse | Private Pool, Gym, Sauna & Cinema | RokHaven',
      description:
        'A 4-bedroom triplex penthouse in Old Ikoyi with a whole top floor for your private pool, gym, sauna and cinema. 2 units. Proposed completion August 2027.',
    },

    eyebrow: 'OLD IKOYI · LAGOS · TRIPLEX · 2 UNITS',
    h1Plain: 'Three floors. ',
    h1Gold: 'One owner.',
    subCopy:
      'A four-bedroom triplex penthouse with a whole top floor for your own pool, gym, sauna and cinema, shown raw, before completion.',
    completionLabel: 'PROPOSED COMPLETION AUGUST 2027',
    heroCTASecondary: 'Explore the three floors',
    heroCTASecondaryHref: '#floors',
    heroVideoLabel: 'WATCH THE WALKTHROUGH',

    facts: [
      { value: '4', label: 'EN-SUITE BEDROOMS' },
      { value: '3', label: 'PRIVATE LEVELS' },
      { value: 'Pool', label: 'GYM & SAUNA' },
      { value: 'Lift', label: 'PRIVATE, INDOOR' },
      { value: 'Cinema', label: 'ON THE TOP FLOOR' },
      { value: 'Roof', label: 'SKYLINE TERRACE' },
    ],

    rawBandLabel: 'SEE THE STRUCTURE, NOT A RENDER',
    rawBandHeadingPlain: 'This is what it looks like ',
    rawBandHeadingGold: 'right now.',
    rawBandBody:
      'We kept it completely raw so you can judge the structural layout, the scale and the real progress for yourself. You\'re seeing the bones of a home most buyers only ever see in a brochure.',

    walkthroughLabel: 'FLOOR BY FLOOR',
    walkthroughHeading: 'Live. Rest. Unwind.',
    floors: [
      {
        id: 'L3',
        num: '03',
        tag: 'WELLNESS & ENTERTAINMENT',
        name: 'The top floor',
        headline: 'The entire top floor is yours.',
        body: 'A private swimming pool, a gym, a sauna, a cinema room and a changing room, opening onto a roof terrace with panoramic views across the Ikoyi skyline and the water.',
        img: '/images/penthouses/triplex-04-pool-level.jpg',
        alt: 'The top-floor pool level',
      },
      {
        id: 'L2',
        num: '02',
        tag: 'REST',
        name: 'The bedroom floor',
        headline: 'All four bedrooms, on their own floor.',
        body: 'Four en-suite bedrooms with high ceilings, wide window openings and elevated city views, plus a family lounge. The master suite takes a prime corner, with a closet area and private balconies over the tree canopy and the water.',
        img: '/images/penthouses/triplex-03-master-balcony.jpg',
        alt: 'View from the master suite balcony',
      },
      {
        id: 'L1',
        num: '01',
        tag: 'LIVING',
        name: 'The main floor',
        headline: 'Double height, made for living.',
        body: 'A massive double-height living area, a home office, separate wet and dry kitchens, and a guest toilet and ante-room at the entrance. A private indoor elevator, included in the price, connects every level.',
        img: '/images/penthouses/triplex-01-living.jpg',
        alt: 'The main living level',
      },
    ],

    scarcityItems: [
      { value: '2', label: 'UNITS AVAILABLE' },
      { value: '3', label: 'PRIVATE LEVELS' },
      { value: '08.27', label: 'PROPOSED COMPLETION' },
    ],
    scarcityQuote: '"Two of these will exist. One home. Three floors. One owner."',

    locationLabel: 'THE ADDRESS',
    locationHeading: 'Why Old Ikoyi.',
    locationIntro:
      'One of the most sought-after addresses in Lagos. From the master suite\'s balconies you look out over the tree canopy and the water.',
    locationFacts: [
      { value: '+81%', body: 'Ikoyi land prices in five years, from ₦1.35M to ₦2.45M per m², the highest of the Lagos Island areas surveyed.' },
      { value: 'Demand', body: 'Steady demand from diplomats, expatriates, C-suite executives and high-net-worth families.' },
      { value: 'Views', body: 'Elevated views across the Ikoyi skyline and the water, from the bedroom floor and the roof terrace.' },
    ],
    locationSource: 'Source: Lagos Realty, Lagos Island Residential Market Report 2026 (via Nairametrics, July 2026). Market context only, not a guarantee of future value.',

    audienceCards: [
      { heading: 'Building a family home', body: 'Living, sleeping and wellness on separate floors, with a home office on the main level.' },
      { heading: 'Buying from abroad', body: 'Live video site visits and regular progress updates through to handover.' },
      { heading: 'Investing early', body: 'Secure today\'s price before completion, at one of Ikoyi\'s most sought-after addresses.' },
    ],

    processSteps: [
      { num: '01', title: 'Schedule a call', body: 'A virtual meeting with you, so we can be sure this is a good fit and also see if there are other options available.' },
      { num: '02', title: 'Private viewing', body: 'In person in Old Ikoyi, or by live video if you\'re abroad.' },
      { num: '03', title: 'Offer letter', body: 'After your viewing, once you\'re pleased, we agree your unit, price and payment structure in writing.' },
      { num: '04', title: 'Document pack', body: 'Once the offer letter is accepted, you receive the full set of documents for your own lawyer\'s due diligence.' },
      { num: '05', title: 'Secure your unit', body: 'Make the deposit stated in your offer letter.' },
      { num: '06', title: 'Updates to handover', body: 'Regular site progress updates until August 2027.' },
    ],

    faqHeading: 'Questions buyers ask.',
    faqs: [
      { q: 'What stage is construction at?', a: 'The structure was at carcass stage when filmed. Proposed completion is August 2027.' },
      { q: 'Is the pool private?', a: 'Yes. The pool, gym and sauna are on the penthouse\'s own top floor.' },
      { q: 'Is there an elevator inside the unit?', a: 'Yes. A private indoor elevator connects all three levels, and it\'s included in the price.' },
      { q: 'Can I get progress updates from abroad?', a: 'Yes. Buyers get regular site progress updates until handover.' },
      { q: 'What are the payment terms?', a: 'Payment terms are shared privately once you\'ve viewed the property and are ready to make an offer. They\'re set out in writing in your offer letter.' },
    ],

    finalCTAPlain: 'Is this the right calibre of property for ',
    finalCTAGold: 'your portfolio?',

    addressLocality: 'Old Ikoyi, Lagos',

    thankYouCallLabel: 'CALL BOOKED · OLD IKOYI TRIPLEX',
    thankYouHeroParagraph: 'A calendar invite with your call details has been sent to your email. You can also ask for the latest site progress video before your call.',
    thankYouWatchAgainLabel: 'WATCH AGAIN',
    thankYouRecapHeading: 'Three floors. One owner.',
    thankYouRecap: [
      { label: 'Price', value: 'US$5M' },
      { label: 'Layout', value: '4 en-suite bedrooms, 3 levels' },
      { label: 'Top floor', value: 'Pool · gym · sauna · cinema · roof terrace' },
      { label: 'Units available', value: '2' },
      { label: 'Proposed completion', value: 'August 2027' },
    ],
    thankYouRecapNote: 'To make the most of the call, have your timeline and preferred payment approach in mind, along with any questions about the floors.',
    thankYouNextStepThree: 'On site in Old Ikoyi, or by live video if you\'re abroad.',
  },
};

export function waHref(message: string): string {
  return `${WA_BASE}?text=${encodeURIComponent(message)}`;
}
