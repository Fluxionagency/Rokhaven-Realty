import YoutubeShort from './YoutubeShort';
import styles from './penthouse.module.css';
import type { PenthouseConfig } from '../_config/penthouses';

interface Props {
  cfg: PenthouseConfig;
}

export default function HeroSection({ cfg }: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{cfg.eyebrow}</p>
        <h1 className={styles.heroH1}>
          {cfg.h1Plain} <em>{cfg.h1Gold}</em>
        </h1>
        <p className={styles.heroPara}>{cfg.subCopy}</p>
        <div className={styles.priceRow}>
          <span className={styles.price}>{cfg.priceLabel}</span>
          <span className={styles.completion}>{cfg.completionLabel}</span>
        </div>
        <div className={styles.heroBtns}>
          <a href="#enquiry" className={styles.btnPrimary}>Schedule a Call</a>
          <a href={cfg.heroCTASecondaryHref} className={styles.btnSecondary}>{cfg.heroCTASecondary}</a>
        </div>
      </div>
      <YoutubeShort
        youtubeId={cfg.youtubeId}
        poster={cfg.poster}
        label={cfg.heroVideoLabel}
      />
    </section>
  );
}
