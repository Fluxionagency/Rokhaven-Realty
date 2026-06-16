'use client';

import styles from './page.module.css';

export default function NewsletterForm() {
  return (
    <form className={styles.nlForm} onSubmit={e => e.preventDefault()}>
      <input type="email" placeholder="Your email address" required />
      <button type="submit">Subscribe</button>
    </form>
  );
}
