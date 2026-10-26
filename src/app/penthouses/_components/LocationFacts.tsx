import styles from './penthouse.module.css';
import type { LocationFact } from '../_config/penthouses';

interface Props {
  label: string;
  heading: string;
  intro: string;
  facts: LocationFact[];
  source: string;
}

export default function LocationFacts({ label, heading, intro, facts, source }: Props) {
  return (
    <section>
      <div className={styles.location}>
        <div className={styles.locationLeft}>
          <p className={styles.capsLabel}>{label}</p>
          <h2 className={styles.locationH2}>{heading}</h2>
          <p>{intro}</p>
        </div>
        <div className={styles.locationRight}>
          {facts.map((f) => (
            <div key={f.value} className={styles.locationRow}>
              <span className={styles.locationVal}>{f.value}</span>
              <span>{f.body}</span>
            </div>
          ))}
          <p className={styles.locationSource}>{source}</p>
        </div>
      </div>
    </section>
  );
}
