import Link from 'next/link';
import styles from './funnel.module.css';

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="RokHaven Realty home">
      <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true">
        <path d="M4 30V13a9 9 0 0 1 18 0v17" fill="none" stroke="#C0A870" strokeWidth="5" />
      </svg>
      <span className={styles['logo-text']}>
        <span className={styles['logo-main']}>ROKHAVEN</span>
        <span className={styles['logo-sub']}>REALTY</span>
      </span>
    </Link>
  );
}

export default function FunnelHeader({ cta, backTo }: { cta?: { label: string; href: string }; backTo?: { label: string; href: string } }) {
  return (
    <header className={styles.header}>
      <div className={styles['header-in']}>
        <Logo />
        {cta && <a href={cta.href} className={styles['btn-header']}>{cta.label}</a>}
        {backTo && <Link href={backTo.href} className={styles['back-link']}>{backTo.label}</Link>}
      </div>
    </header>
  );
}
