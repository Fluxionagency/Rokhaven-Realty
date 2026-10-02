import styles from './penthouse.module.css';
import type { FactStripItem } from '../_config/penthouses';

interface Props { facts: FactStripItem[] }

export default function FactStrip({ facts }: Props) {
  return (
    <div className={styles.factStrip}>
      <div className={styles.factGrid}>
        {facts.map((f) => (
          <div key={f.label} className={styles.factItem}>
            <span className={styles.factVal}>{f.value}</span>
            <span className={styles.factLbl}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
