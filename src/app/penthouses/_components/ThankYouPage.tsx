import Link from 'next/link';
import YoutubeShort from './YoutubeShort';
import FunnelFooter from './FunnelFooter';
import styles from './penthouse.module.css';
import type { PenthouseConfig } from '../_config/penthouses';
import { waHref } from '../_config/penthouses';

interface Props {
  cfg: PenthouseConfig;
  propertyHref: string;
}

export default function ThankYouPage({ cfg, propertyHref }: Props) {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logoLink} aria-label="RokHaven Realty">
            <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
              <path d="M4 30V13a9 9 0 0 1 18 0v17" fill="none" stroke="#C0A870" strokeWidth="5" />
            </svg>
            <span className={styles.logoText}>
              <span className={styles.logoWm}>ROKHAVEN</span>
              <span className={styles.logoSm}>REALTY</span>
            </span>
          </Link>
          <Link href={propertyHref} className={styles.headerBack}>← Back to the penthouse</Link>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.tyHero}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1.3" aria-hidden="true" className={styles.tyIcon}>
          <circle cx="12" cy="12" r="10" />
          <path d="M7.5 12.5l3 3 6-6.5" />
        </svg>
        <p className={styles.eyebrow}>{cfg.thankYouCallLabel}</p>
        <h1 className={styles.tyH1}>
          Thank you. <em>Your call is booked.</em>
        </h1>
        <p className={styles.tyPara}>{cfg.thankYouHeroParagraph}</p>
        <div className={styles.tyBtns}>
          <a href={waHref(cfg.waMessage)} className={styles.btnWa} target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.2A8.5 8.5 0 1 1 21 11.5z" />
            </svg>
            WhatsApp an advisor
          </a>
          {cfg.waMessageProgress && (
            <a href={waHref(cfg.waMessageProgress)} className={styles.btnGoldOutline} target="_blank" rel="noopener noreferrer">
              Get the latest progress video
            </a>
          )}
        </div>
        <span className={styles.tyContact}>
          +234 916 761 9009 · <a href="mailto:info@rokhaven.com">info@rokhaven.com</a>
        </span>
      </section>

      {/* What happens next */}
      <section className={styles.tyNext}>
        <div className={styles.tyNextInner}>
          <div className={styles.tyNextHead}>
            <p className={styles.sectionLabelGold}>WHAT HAPPENS NEXT</p>
            <h2 className={styles.tyNextH2}>From this call to your keys.</h2>
          </div>
          <ol className={styles.tyStepList}>
            <li className={styles.tyStep}>
              <span className={styles.tyStepNum}>01</span>
              <strong className={styles.tyStepTitle}>Check your inbox</strong>
              <span>Your calendar invite has the date, the time in your own time zone, and the link to join.</span>
            </li>
            <li className={styles.tyStep}>
              <span className={styles.tyStepNum}>02</span>
              <strong className={styles.tyStepTitle}>Your call</strong>
              <span>A short virtual meeting to understand what you need, make sure this penthouse is a good fit, and show you other options if needed.</span>
            </li>
            <li className={styles.tyStep}>
              <span className={styles.tyStepNum}>03</span>
              <strong className={styles.tyStepTitle}>Site inspection</strong>
              <span>{cfg.thankYouNextStepThree}</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Video recap + spec table */}
      <section>
        <div className={styles.tyRecap}>
          <div className={styles.tyRecapVideo}>
            <YoutubeShort
              youtubeId={cfg.youtubeId}
              poster={cfg.poster}
              label={cfg.thankYouWatchAgainLabel}
              small
            />
          </div>
          <div className={styles.tyRecapCopy}>
            <p className={styles.eyebrow}>BEFORE YOUR CALL</p>
            <h2 className={styles.tyRecapH2}>{cfg.thankYouRecapHeading}</h2>
            <div className={styles.tyRecapTable}>
              {cfg.thankYouRecap.map((row) => (
                <div key={row.label} className={styles.tyRecapRow}>
                  <span>{row.label}</span>
                  <span className={styles.tyRecapVal}>{row.value}</span>
                </div>
              ))}
            </div>
            <p className={styles.tyRecapNote}>{cfg.thankYouRecapNote}</p>
          </div>
        </div>
      </section>

      <FunnelFooter />
    </div>
  );
}
