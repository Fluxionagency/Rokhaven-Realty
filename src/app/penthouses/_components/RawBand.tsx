import styles from './penthouse.module.css';

interface Props {
  label: string;
  headingPlain: string;
  headingGold: string;
  body: string;
  ctaHref?: string;
}

export default function RawBand({ label, headingPlain, headingGold, body, ctaHref }: Props) {
  return (
    <section>
      <div className={styles.rawBand}>
        <p className={styles.capsLabel}>{label}</p>
        <h2 className={styles.sectionH2}>
          {headingPlain} <em>{headingGold}</em>
        </h2>
        <p className={styles.sectionPara}>{body}</p>
        {ctaHref && (
          <a href={ctaHref} className={styles.btnPrimary}>Schedule a Call</a>
        )}
      </div>
    </section>
  );
}
