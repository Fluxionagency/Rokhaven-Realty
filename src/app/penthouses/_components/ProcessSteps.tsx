import styles from './penthouse.module.css';
import type { ProcessStep } from '../_config/penthouses';

interface Props {
  steps: ProcessStep[];
}

export default function ProcessSteps({ steps }: Props) {
  return (
    <section>
      <div className={styles.process}>
        <div className={styles.processHead}>
          <p className={styles.capsLabel}>HOW IT WORKS</p>
          <h2 className={styles.processH2}>From first call to your keys.</h2>
        </div>
        <ol className={styles.processList}>
          {steps.map((s) => (
            <li key={s.num} className={styles.processStep}>
              <span className={styles.processNum}>{s.num}</span>
              <strong className={styles.processStepTitle}>{s.title}</strong>
              <span className={styles.processStepBody}>{s.body}</span>
            </li>
          ))}
        </ol>
        <p className={styles.processNote}>No obligation. No sales pressure.</p>
      </div>
    </section>
  );
}
