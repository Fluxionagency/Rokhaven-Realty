// No "use client" needed — pure presentational
import Link from 'next/link';
import styles from './penthouse.module.css';

interface Props {
  backHref: string;
  backLabel: string;
  ctaHref?: string; // if provided, show gold CTA button
}

export default function FunnelHeader({ backHref, backLabel, ctaHref }: Props) {
  return (
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
        {ctaHref ? (
          <a href={ctaHref} className={styles.headerCta}>Schedule a Call</a>
        ) : (
          <Link href={backHref} className={styles.headerBack}>{backLabel}</Link>
        )}
      </div>
    </header>
  );
}
