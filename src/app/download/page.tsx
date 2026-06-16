'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import styles from './page.module.css';

export default function DownloadPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/download-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <div className={styles.page}>
        {!done ? (
          <div className={styles.card}>
            <div className={styles.badge}>FREE RESOURCES</div>
            <h1 className={styles.heading}>Access Our Premium Whitepapers & Market Reports</h1>
            <p className={styles.sub}>
              Get exclusive access to RokHaven&apos;s research materials, investment guides, and real estate insights.
              Fill in your details below to receive your download link.
            </p>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>First Name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone Number</label>
                <input
                  className={styles.input}
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  required
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button className={styles.btn} type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Get Access →'}
              </button>

              <p className={styles.privacy}>
                By submitting, you agree to our{' '}
                <Link href="/privacy" className={styles.privacyLink}>Privacy Policy</Link>.
                We will never share your details.
              </p>
            </form>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C0A870" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className={styles.heading}>You&apos;re All Set!</h1>
            <p className={styles.sub}>
              Thank you for your interest. Here&apos;s how to access your downloads:
            </p>

            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <div className={styles.stepText}>
                  <strong>Check your email</strong> — your RokHaven client portal login credentials have been sent to <em>{form.email}</em>.
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <div className={styles.stepText}>
                  <strong>Log in to the Client Portal</strong> at{' '}
                  <Link href="/auth/client-login" className={styles.privacyLink}>rokhaven.com/auth/client-login</Link>{' '}
                  using your email and the password from the email.
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <div className={styles.stepText}>
                  <strong>Go to the Downloads section</strong> in your client portal dashboard to access all available whitepapers and resources.
                </div>
              </div>
            </div>

            <Link href="/auth/client-login" className={styles.btn} style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none', marginTop: 8 }}>
              Login to Client Portal →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
