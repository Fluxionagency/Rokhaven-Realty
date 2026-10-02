import styles from './penthouse.module.css';

const STEPS = [
  { num: '01', title: 'Schedule a call', body: 'Pick a time that works for you. The calendar is live — it takes 60 seconds.' },
  { num: '02', title: 'Your private briefing', body: 'A short, no-pressure video call to understand your goals and answer your questions.' },
  { num: '03', title: '', body: '' }, // overridden by prop
];

interface Props {
  lastStepBody: string;
}

export default function ProcessSteps({ lastStepBody }: Props) {
  const steps = [
    STEPS[0],
    STEPS[1],
    { num: '03', title: 'Next steps', body: lastStepBody },
  ];

  return (
    <section>
      <div className={styles.process}>
        <div className={styles.processHead}>
          <p className={styles.capsLabel}>HOW IT WORKS</p>
          <h2 className={styles.processH2}>Three steps to your next home.</h2>
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
