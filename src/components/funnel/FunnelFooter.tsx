import styles from './funnel.module.css';

export default function FunnelFooter({ disclaimer }: { disclaimer: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-in']}>
        <div className={`${styles.col} ${styles.gap6}`}>
          <span className={styles['footer-brand']}>ROKHAVEN REALTY</span>
          <span>Where Legacy Lives</span>
        </div>
        <div className={`${styles.col} ${styles.gap6}`}>
          <span>
            +234 916 761 9009 · <a href="mailto:info@rokhaven.com">info@rokhaven.com</a> · <a href="https://rokhaven.com">rokhaven.com</a>
          </span>
          <span>RokHaven Realty Limited · RC8527217 · 319, Alagomeji, Sabo-Yaba, Lagos, Nigeria</span>
        </div>
      </div>
      <p className={styles['footer-note']}>{disclaimer}</p>
    </footer>
  );
}
