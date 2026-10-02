import styles from './penthouse.module.css';
import type { AudienceCard } from '../_config/penthouses';

interface Props {
  cards: AudienceCard[];
}

export default function AudienceCards({ cards }: Props) {
  return (
    <section className={styles.audience}>
      <div className={styles.audienceInner}>
        <h2 className={styles.audienceH2}>This penthouse is for you if&hellip;</h2>
        <div className={styles.audienceGrid}>
          {cards.map((c) => (
            <div key={c.heading} className={styles.audienceCard}>
              <h3 className={styles.audienceCardH3}>{c.heading}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
