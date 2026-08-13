'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className={styles.nlForm} style={{ justifyContent: 'center', padding: '12px 0' }}>
        <span style={{ color: '#C0A870', fontSize: '14px' }}>
          You&apos;re subscribed. Thank you.
        </span>
      </div>
    );
  }

  return (
    <form className={styles.nlForm} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Your email address"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
      {error && (
        <span style={{ color: 'rgba(224,112,112,0.8)', fontSize: '12px', marginTop: '6px', display: 'block' }}>
          {error}
        </span>
      )}
    </form>
  );
}
