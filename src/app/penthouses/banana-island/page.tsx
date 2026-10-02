import type { Metadata } from 'next';
import { penthouses } from '../_config/penthouses';
import styles from '../_components/penthouse.module.css';
import FunnelHeader from '../_components/FunnelHeader';
import HeroSection from '../_components/HeroSection';
import FactStrip from '../_components/FactStrip';
import RawBand from '../_components/RawBand';
import WalkthroughGrid from '../_components/WalkthroughGrid';
import ScarcityBlock from '../_components/ScarcityBlock';
import LocationFacts from '../_components/LocationFacts';
import AudienceCards from '../_components/AudienceCards';
import ProcessSteps from '../_components/ProcessSteps';
import EnquiryFunnel from '../_components/EnquiryFunnel';
import FAQAccordion from '../_components/FAQAccordion';
import FinalCTA from '../_components/FinalCTA';
import FunnelFooter from '../_components/FunnelFooter';
import CookieBanner from '../_components/CookieBanner';

const cfg = penthouses['banana-island'];

export const metadata: Metadata = {
  title: cfg.seo.title,
  description: cfg.seo.description,
  robots: { index: true, follow: true },
};

export default function BananaIslandPage() {
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
            url: 'https://rokhaven.com/penthouses/banana-island',
            image: 'https://rokhaven.com/images/penthouses/banana-01.jpg',
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
      {cfg.chapters && (
        <WalkthroughGrid
          label={cfg.walkthroughLabel}
          heading={cfg.walkthroughHeading}
          chapters={cfg.chapters}
        />
      )}
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
