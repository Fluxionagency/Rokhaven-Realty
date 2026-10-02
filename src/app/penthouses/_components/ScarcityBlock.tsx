import styles from './penthouse.module.css';
import type { ScarcityItem } from '../_config/penthouses';

interface Props {
  items: ScarcityItem[];
  quote: string;
  ctaHref?: string;
}

export default function ScarcityBlock({ items, quote, ctaHref }: Props) {
  return (
    <section className={styles.scarcity}>
      <div className={styles.scarcityInner}>
        <div className={styles.scarcityGrid}>
          {items.map((it) => (
            <div key={it.label} className={styles.scarcityItem}>
              <span
                className={styles.scarcityNum}
                dangerouslySetInnerHTML={{ __html: it.value }}
              />
              <span className={styles.scarcityLbl}>{it.label}</span>
            </div>
          ))}
        </div>
        <blockquote className={styles.scarcityQuote}>&ldquo;{quote}&rdquo;</blockquote>
        {ctaHref && (
          <a href={ctaHref} className={styles.btnPrimary}>Schedule a Call</a>
        )}
      </div>
    </section>
  );
}
