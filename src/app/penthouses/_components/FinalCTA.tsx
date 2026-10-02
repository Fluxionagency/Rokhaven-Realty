import styles from './penthouse.module.css';

interface Props {
  headingPlain: string;
  headingGold: string;
}

export default function FinalCTA({ headingPlain, headingGold }: Props) {
  return (
    <section className={styles.finalCta}>
      <div className={styles.finalCtaInner}>
        <h2 className={styles.finalCtaH2}>
          {headingPlain} <em>{headingGold}</em>
        </h2>
        <div className={styles.finalCtaBtns}>
          <a href="#enquiry" className={styles.btnFinalCta}>Schedule a Call</a>
        </div>
      </div>
    </section>
  );
}
