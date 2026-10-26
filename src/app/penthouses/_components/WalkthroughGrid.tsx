import Image from 'next/image';
import styles from './penthouse.module.css';
import type { WalkthroughChapter } from '../_config/penthouses';

interface Props {
  label?: string;
  heading: string;
  chapters: WalkthroughChapter[];
}

export default function WalkthroughGrid({ label, heading, chapters }: Props) {
  return (
    <section className={styles.walkthrough}>
      <div className={styles.walkthroughInner}>
        <div className={styles.walkthroughHead}>
          {label && <p className={styles.sectionLabelGold}>{label}</p>}
          <h2 className={styles.walkthroughH2}>{heading}</h2>
        </div>
        <div className={styles.chapterGrid}>
          {chapters.map((ch) => (
            <div key={ch.heading} className={styles.chapter}>
              <Image src={ch.img} alt={ch.alt} width={800} height={600} style={{ width: '100%', height: 'auto', aspectRatio: '4/3', objectFit: 'cover' }} />
              <p className={styles.chapterLabel}>{ch.label}</p>
              <h3 className={styles.chapterH3}>{ch.heading}</h3>
              <p className={styles.chapterBody}>{ch.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
