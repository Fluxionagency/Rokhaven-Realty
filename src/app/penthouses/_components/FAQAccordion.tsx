import styles from './penthouse.module.css';
import type { FAQItem } from '../_config/penthouses';

interface Props {
  heading: string;
  faqs: FAQItem[];
}

export default function FAQAccordion({ heading, faqs }: Props) {
  return (
    <section>
      <div className={styles.faq}>
        <h2 className={styles.faqH2}>{heading}</h2>
        <div className={styles.faqList}>
          {faqs.map((f) => (
            <details key={f.q} className={styles.faqItem}>
              <summary>{f.q}</summary>
              <p className={styles.faqAnswer}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
