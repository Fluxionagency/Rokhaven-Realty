import styles from './penthouse.module.css';

export default function FunnelFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <span className={styles.footerBrandName}>ROKHAVEN REALTY</span>
          <span>Where Legacy Lives</span>
        </div>
        <div className={styles.footerContact}>
          <span>
            +234 916 761 9009 ·{' '}
            <a href="mailto:info@rokhaven.com">info@rokhaven.com</a> ·{' '}
            <a href="https://rokhaven.com">rokhaven.com</a>
          </span>
          <span>RokHaven Realty Limited · RC8527217 · 319, Alagomeji, Sabo-Yaba, Lagos, Nigeria</span>
        </div>
      </div>
      <p className={styles.footerDisclaimer}>
        All prices are quoted in US dollars and are subject to change. Images are for illustrative purposes. Floor plans and specifications are indicative and may be subject to change. This page does not constitute a binding offer. RokHaven Realty is registered with the Corporate Affairs Commission of Nigeria.
      </p>
    </footer>
  );
}
