import type { Metadata } from 'next';
import { penthouses } from '../_config/penthouses';
import styles from '../_components/penthouse.module.css';
import FunnelHeader from '../_components/FunnelHeader';
import HeroSection from '../_components/HeroSection';
import FactStrip from '../_components/FactStrip';
import RawBand from '../_components/RawBand';
import FloorExplorer from '../_components/FloorExplorer';
import ScarcityBlock from '../_components/ScarcityBlock';
import LocationFacts from '../_components/LocationFacts';
import AudienceCards from '../_components/AudienceCards';
import ProcessSteps from '../_components/ProcessSteps';
import EnquiryFunnel from '../_components/EnquiryFunnel';
import FAQAccordion from '../_components/FAQAccordion';
import FinalCTA from '../_components/FinalCTA';
import FunnelFooter from '../_components/FunnelFooter';
import CookieBanner from '../_components/CookieBanner';

const cfg = penthouses['old-ikoyi-triplex'];

const PROGRESS_STEPS = [
  { tag: 'COMPLETED', head: 'Structural frame', body: 'All floors poured. The three-level skeleton is complete.' },
  { tag: 'IN PROGRESS', head: 'MEP rough-in', body: 'Mechanical, electrical and plumbing first-fix underway across all three floors.' },
  { tag: 'Q2 2026', head: 'Fit-out begins', body: 'Finishes, cabinetry, kitchen and bathroom installations start.' },
  { tag: 'AUG 2027', head: 'Handover', body: 'Proposed completion and key handover to owner.' },
];

export const metadata: Metadata = {
  title: cfg.seo.title,
  description: cfg.seo.description,
  robots: { index: true, follow: true },
};

export default function OldIkoyiTriplexPage() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: cfg.productName,
            description: cfg.seo.description,
            url: 'https://rokhaven.com/penthouses/old-ikoyi-triplex',
            image: 'https://rokhaven.com/images/penthouses/triplex-01.jpg',
            address: {
              '@type': 'PostalAddress',
              addressLocality: cfg.addressLocality,
              addressCountry: 'NG',
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: cfg.priceUSD,
              availability: 'https://schema.org/LimitedAvailability',
            },
          }),
        }}
      />
      <FunnelHeader backHref="/#properties" backLabel="← All properties" ctaHref="#enquiry" />
      <HeroSection cfg={cfg} />
      <FactStrip facts={cfg.facts} />
      <RawBand
        label={cfg.rawBandLabel}
        headingPlain={cfg.rawBandHeadingPlain}
        headingGold={cfg.rawBandHeadingGold}
        body={cfg.rawBandBody}
      />
      {cfg.floors && (
        <FloorExplorer
          label={cfg.walkthroughLabel}
          heading={cfg.walkthroughHeading}
          floors={cfg.floors}
        />
      )}
      <section className={styles.progressSection}>
        <div className={styles.progressInner}>
          <div className={styles.progressHead}>
            <p className={styles.capsLabel}>CONSTRUCTION UPDATE</p>
            <h2 className={styles.sectionH2}>Where we are today.</h2>
          </div>
          <div className={styles.progressTimeline}>
            {PROGRESS_STEPS.map((s) => (
              <div key={s.tag} className={styles.progressStep}>
                <span className={styles.progressStepTag}>{s.tag}</span>
                <span className={styles.progressStepHead}>{s.head}</span>
                <span className={styles.progressStepBody}>{s.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ScarcityBlock items={cfg.scarcityItems} quote={cfg.scarcityQuote} ctaHref="#enquiry" />
      <LocationFacts
        label={cfg.locationLabel}
        heading={cfg.locationHeading}
        intro={cfg.locationIntro}
        facts={cfg.locationFacts}
        source={cfg.locationSource}
      />
      <AudienceCards cards={cfg.audienceCards} />
      <ProcessSteps lastStepBody={cfg.processLastStep} />
      <EnquiryFunnel cfg={cfg} />
      <FAQAccordion heading={cfg.faqHeading} faqs={cfg.faqs} />
      <FinalCTA headingPlain={cfg.finalCTAPlain} headingGold={cfg.finalCTAGold} />
      <FunnelFooter />
      <CookieBanner />
    </div>
  );
}
